"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Readable } from "node:stream";
import { bucket, db, ensureIndexes, isValidId, oid } from "./mongo";
import { requireClinic, slugify } from "./tenancy";
import { clinicToday, fromClinicLocal } from "./time";
import { getDict } from "./i18n";
import { getLocale } from "./tenancy";
import { formError, formOk, type FormState } from "./form-state";

/** True when the patient exists inside this clinic. Guards every patient-scoped write. */
async function patientBelongs(clinicId: string, patientId: string): Promise<boolean> {
  if (!isValidId(patientId)) return false;
  const d = await db();
  const found = await d
    .collection("patients")
    .findOne({ _id: oid(patientId), clinicId: oid(clinicId) }, { projection: { _id: 1 } });
  return Boolean(found);
}

/**
 * Append-only record of who changed what.
 *
 * Medical records carry an accountability duty under the GDPR, and the app's
 * own policy leans on it, so every write that alters clinical or financial
 * data leaves a line here. Failures are swallowed: an audit problem must never
 * block a doctor from saving.
 */
async function recordAudit(
  clinicId: string,
  action: string,
  subjectId?: string,
  detail?: string
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const d = await db();
    await d.collection("audit").insertOne({
      clinicId: oid(clinicId),
      action,
      subjectId: subjectId ?? null,
      detail: detail ?? null,
      actorClerkId: userId ?? null,
      actorEmail: user?.emailAddresses?.[0]?.emailAddress ?? null,
      at: now(),
    });
  } catch {
    // Deliberately ignored.
  }
}

/** Resolves a doctor id only if that member really belongs to this clinic. */
async function resolveDoctor(clinicId: string, doctorId: string) {
  if (!doctorId || !isValidId(doctorId)) return null;
  const d = await db();
  const found = await d
    .collection("members")
    .findOne({ _id: oid(doctorId), clinicId: oid(clinicId) }, { projection: { _id: 1 } });
  return found ? oid(doctorId) : null;
}

const now = () => new Date().toISOString();
const today = () => clinicToday();
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => str(fd, k) || null;

// ── Locale ───────────────────────────────────────────────────────
export async function setLocale(locale: string, path: string) {
  const store = await cookies();
  store.set("vyala_locale", locale === "el" ? "el" : "en", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath(path);
}

// ── Clinic / onboarding ──────────────────────────────────────────
export async function createClinic(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  await ensureIndexes();

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";
  const name = str(formData, "name");
  const fullName = str(formData, "full_name");
  if (!name) return formError("Give your practice a name.");
  if (!fullName) return formError("Tell us your name so we know who the admin is.");

  const d = await db();
  const base = slugify(name);
  let slug = base;
  for (let i = 2; await d.collection("clinics").findOne({ slug }); i++) {
    slug = `${base}-${i}`;
  }

  const { insertedId } = await d.collection("clinics").insertOne({
    slug,
    name,
    phone: null,
    address: null,
    city: null,
    createdAt: now(),
  });

  await d.collection("members").insertOne({
    clinicId: insertedId,
    clerkUserId: userId,
    email,
    fullName,
    role: "admin",
    specialty: opt(formData, "specialty"),
    createdAt: now(),
  });

  redirect(`/c/${slug}`);
}

export async function updateClinic(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, member, t } = await requireClinic(slug);
  if (member.role !== "admin") return formError(t.err_admin_only);
  const d = await db();
  await d.collection("clinics").updateOne(
    { _id: oid(clinic.id) },
    {
      $set: {
        name: str(formData, "name") || clinic.name,
        phone: opt(formData, "phone"),
        address: opt(formData, "address"),
        city: opt(formData, "city"),
      },
    }
  );
  await recordAudit(clinic.id, "clinic.update");
  revalidatePath(`/c/${slug}/team`);
  return formOk;
}

// ── Team ─────────────────────────────────────────────────────────
export async function addMember(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, member, t } = await requireClinic(slug);
  if (member.role !== "admin") return formError(t.err_admin_only);
  const email = str(formData, "email").toLowerCase();
  const fullName = str(formData, "full_name");
  if (!fullName) return formError(t.err_member_name);
  if (!email || !email.includes("@")) return formError(t.err_member_email);
  const role = str(formData, "role");

  const d = await db();
  await d.collection("members").updateOne(
    { clinicId: oid(clinic.id), email },
    {
      $set: {
        fullName,
        role: ["admin", "doctor", "assistant"].includes(role) ? role : "doctor",
        specialty: opt(formData, "specialty"),
      },
      $setOnInsert: { clinicId: oid(clinic.id), email, clerkUserId: null, createdAt: now() },
    },
    { upsert: true }
  );
  await recordAudit(clinic.id, "member.add", undefined, email);
  revalidatePath(`/c/${slug}/team`);
  return formOk;
}

export async function removeMember(slug: string, memberId: string) {
  const { clinic, member } = await requireClinic(slug);
  if (member.role !== "admin") throw new Error("Only admins can remove team members");
  if (member.id === memberId) throw new Error("You cannot remove yourself");
  if (!isValidId(memberId)) return;
  const d = await db();
  await d.collection("members").deleteOne({ _id: oid(memberId), clinicId: oid(clinic.id) });
  await recordAudit(clinic.id, "member.remove", memberId);
  revalidatePath(`/c/${slug}/team`);
}

// ── Patients ─────────────────────────────────────────────────────
function patientFields(fd: FormData) {
  return {
    firstName: str(fd, "first_name"),
    lastName: str(fd, "last_name"),
    amka: opt(fd, "amka"),
    phone: opt(fd, "phone"),
    email: opt(fd, "email"),
    birthDate: opt(fd, "birth_date"),
    address: opt(fd, "address"),
    allergies: opt(fd, "allergies"),
    notes: opt(fd, "notes"),
  };
}

export async function createPatient(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  const fields = patientFields(formData);
  if (!fields.firstName || !fields.lastName) return formError(t.err_names);
  const d = await db();
  const { insertedId } = await d
    .collection("patients")
    .insertOne({ ...fields, clinicId: oid(clinic.id), createdAt: now() });
  await recordAudit(clinic.id, "patient.create", String(insertedId));
  redirect(`/c/${slug}/patients/${insertedId}`);
}

export async function updatePatient(
  slug: string,
  patientId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  if (!(await patientBelongs(clinic.id, patientId))) return formError(t.err_unknown_patient);
  const fields = patientFields(formData);
  if (!fields.firstName || !fields.lastName) return formError(t.err_names);
  const d = await db();
  await d
    .collection("patients")
    .updateOne({ _id: oid(patientId), clinicId: oid(clinic.id) }, { $set: fields });
  await recordAudit(clinic.id, "patient.update", patientId);
  redirect(`/c/${slug}/patients/${patientId}`);
}

// ── Visits ───────────────────────────────────────────────────────
export async function createVisit(
  slug: string,
  patientId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, member, t } = await requireClinic(slug);
  if (!(await patientBelongs(clinic.id, patientId))) return formError(t.err_unknown_patient);
  const d = await db();
  await d.collection("visits").insertOne({
    clinicId: oid(clinic.id),
    patientId: oid(patientId),
    doctorId: member.role === "assistant" ? null : oid(member.id),
    visitDate: opt(formData, "visit_date") ?? today(),
    symptoms: opt(formData, "symptoms"),
    diagnosis: opt(formData, "diagnosis"),
    treatment: opt(formData, "treatment"),
    notes: opt(formData, "notes"),
    createdAt: now(),
  });
  await recordAudit(clinic.id, "visit.create", patientId);
  revalidatePath(`/c/${slug}/patients/${patientId}`);
  return formOk;
}

// ── Appointments ─────────────────────────────────────────────────
export async function createAppointment(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  const patientId = str(formData, "patient_id");
  const date = str(formData, "date");
  const time = str(formData, "time");
  if (!patientId) return formError(t.err_pick_patient);
  if (!date || !time) return formError(t.err_date_time);
  if (!(await patientBelongs(clinic.id, patientId))) return formError(t.err_unknown_patient);
  const doctorId = await resolveDoctor(clinic.id, str(formData, "doctor_id"));
  const duration = parseInt(str(formData, "duration_min") || "30", 10) || 30;

  const startsAt = fromClinicLocal(date, time);
  if (Number.isNaN(startsAt.getTime())) return formError(t.err_date_time);

  const d = await db();
  await d.collection("appointments").insertOne({
    clinicId: oid(clinic.id),
    patientId: oid(patientId),
    doctorId,
    startsAt: startsAt.toISOString(),
    durationMin: Math.min(480, Math.max(5, duration)),
    status: "scheduled",
    reason: opt(formData, "reason"),
    createdAt: now(),
  });
  revalidatePath(`/c/${slug}/appointments`);
  revalidatePath(`/c/${slug}`);
  return formOk;
}

/** Move or amend an existing appointment. */
export async function updateAppointment(
  slug: string,
  appointmentId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  if (!isValidId(appointmentId)) return formError(t.err_unknown_appointment);

  const date = str(formData, "date");
  const time = str(formData, "time");
  if (!date || !time) return formError(t.err_date_time);
  const startsAt = fromClinicLocal(date, time);
  if (Number.isNaN(startsAt.getTime())) return formError(t.err_date_time);

  const patientId = str(formData, "patient_id");
  if (patientId && !(await patientBelongs(clinic.id, patientId))) {
    return formError(t.err_unknown_patient);
  }
  const doctorId = await resolveDoctor(clinic.id, str(formData, "doctor_id"));
  const duration = parseInt(str(formData, "duration_min") || "30", 10) || 30;
  const status = str(formData, "status");

  const d = await db();
  const result = await d.collection("appointments").updateOne(
    { _id: oid(appointmentId), clinicId: oid(clinic.id) },
    {
      $set: {
        ...(patientId ? { patientId: oid(patientId) } : {}),
        doctorId,
        startsAt: startsAt.toISOString(),
        durationMin: Math.min(480, Math.max(5, duration)),
        reason: opt(formData, "reason"),
        ...(["scheduled", "completed", "cancelled", "no_show"].includes(status)
          ? { status }
          : {}),
        updatedAt: now(),
      },
    }
  );
  if (result.matchedCount === 0) return formError(t.err_unknown_appointment);

  await recordAudit(clinic.id, "appointment.update", appointmentId);
  revalidatePath(`/c/${slug}/appointments`);
  revalidatePath(`/c/${slug}`);
  redirect(`/c/${slug}/appointments?date=${str(formData, "date")}`);
}

export async function setAppointmentStatus(slug: string, appointmentId: string, status: string) {
  const { clinic } = await requireClinic(slug);
  if (!isValidId(appointmentId)) return;
  if (!["scheduled", "completed", "cancelled", "no_show"].includes(status)) return;
  const d = await db();
  await d
    .collection("appointments")
    .updateOne({ _id: oid(appointmentId), clinicId: oid(clinic.id) }, { $set: { status } });
  revalidatePath(`/c/${slug}/appointments`);
}

// ── Payments ─────────────────────────────────────────────────────
export async function createPayment(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  const raw = str(formData, "amount");
  const amount = parseFloat(raw || "0");
  if (!raw || !Number.isFinite(amount) || amount <= 0) return formError(t.err_amount);
  const method = str(formData, "method");
  const patientId = str(formData, "patient_id");
  if (patientId && !(await patientBelongs(clinic.id, patientId))) {
    return formError(t.err_unknown_patient);
  }

  const d = await db();
  await d.collection("payments").insertOne({
    clinicId: oid(clinic.id),
    patientId: patientId ? oid(patientId) : null,
    amount,
    method: ["cash", "card", "bank_transfer", "other"].includes(method) ? method : "cash",
    paidAt: opt(formData, "paid_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
  });
  await recordAudit(clinic.id, "payment.create", patientId || undefined, `€${amount}`);
  revalidatePath(`/c/${slug}/billing`);
  revalidatePath(`/c/${slug}`);
  return formOk;
}

// ── Invoices ─────────────────────────────────────────────────────
export async function createInvoice(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  const raw = str(formData, "amount");
  const amount = parseFloat(raw || "0");
  if (!raw || !Number.isFinite(amount) || amount <= 0) return formError(t.err_amount);
  const patientId = str(formData, "patient_id");
  if (patientId && !(await patientBelongs(clinic.id, patientId))) {
    return formError(t.err_unknown_patient);
  }

  const d = await db();
  const manualNumber = str(formData, "number");
  const year = new Date().getFullYear();

  const doc = {
    clinicId: oid(clinic.id),
    patientId: patientId ? oid(patientId) : null,
    amount,
    status: "issued",
    issuedAt: opt(formData, "issued_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
  };

  if (manualNumber) {
    try {
      await d.collection("invoices").insertOne({ ...doc, number: manualNumber });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return formError(`${t.err_invoice_taken} ${manualNumber}`);
      }
      throw err;
    }
  } else {
    // An atomic per-clinic counter, so two people saving at once cannot land on
    // the same number and trip the unique index.
    for (let attempt = 0; attempt < 5; attempt++) {
      const counter = await d.collection("counters").findOneAndUpdate(
        { _id: `invoice:${clinic.id}:${year}` as never },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      const seq = (counter?.seq as number) ?? attempt + 1;
      const number = `${year}-${String(seq).padStart(4, "0")}`;
      try {
        await d.collection("invoices").insertOne({ ...doc, number });
        break;
      } catch (err) {
        // A number already taken by an older invoice: bump and try the next one.
        if ((err as { code?: number }).code === 11000 && attempt < 4) continue;
        throw err;
      }
    }
  }
  await recordAudit(clinic.id, "invoice.create", patientId || undefined, `€${amount}`);
  revalidatePath(`/c/${slug}/billing`);
  revalidatePath(`/c/${slug}`);
  return formOk;
}

export async function markInvoiceIssued(slug: string, invoiceId: string) {
  const { clinic } = await requireClinic(slug);
  if (!isValidId(invoiceId)) return;
  const d = await db();
  await d
    .collection("invoices")
    .updateOne({ _id: oid(invoiceId), clinicId: oid(clinic.id) }, { $set: { status: "issued" } });
  revalidatePath(`/c/${slug}/billing`);
}

export async function markInvoicePaid(slug: string, invoiceId: string) {
  const { clinic } = await requireClinic(slug);
  if (!isValidId(invoiceId)) return;
  const d = await db();
  await d
    .collection("invoices")
    .updateOne({ _id: oid(invoiceId), clinicId: oid(clinic.id) }, { $set: { status: "paid" } });
  revalidatePath(`/c/${slug}/billing`);
}

// ── Documents (stored in GridFS) ─────────────────────────────────
export async function uploadDocument(slug: string, patientId: string, formData: FormData) {
  const { clinic } = await requireClinic(slug);
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Choose a file first");
  if (file.size > 20 * 1024 * 1024) throw new Error("That file is larger than the 20 MB limit");

  // Only the document types a practice actually attaches. Anything else, including
  // anything that could execute in the browser, is stored as a plain download.
  const ALLOWED = [
    "application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp", "image/tiff",
    "application/msword", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const mimeType = ALLOWED.includes(file.type) ? file.type : "application/octet-stream";

  const gfs = await bucket();
  const stream = gfs.openUploadStream(file.name, {
    metadata: {
      clinicId: String(clinic.id),
      patientId,
      contentType: mimeType,
    },
  });
  await new Promise<void>((resolve, reject) => {
    Readable.fromWeb(file.stream() as never)
      .pipe(stream)
      .on("finish", () => resolve())
      .on("error", reject);
  });

  const d = await db();
  await d.collection("documents").insertOne({
    clinicId: oid(clinic.id),
    patientId: oid(patientId),
    fileName: file.name,
    fileId: stream.id,
    mimeType,
    sizeBytes: file.size,
    createdAt: now(),
  });
  revalidatePath(`/c/${slug}/patients/${patientId}`);
}

export async function deleteDocument(slug: string, documentId: string) {
  const { clinic } = await requireClinic(slug);
  if (!isValidId(documentId)) return;
  const d = await db();
  const doc = await d
    .collection("documents")
    .findOne({ _id: oid(documentId), clinicId: oid(clinic.id) });
  if (!doc) return;
  const gfs = await bucket();
  await gfs.delete(doc.fileId).catch(() => {});
  await d.collection("documents").deleteOne({ _id: oid(documentId) });
  revalidatePath(`/c/${slug}/patients/${String(doc.patientId)}`);
}

// ── Sales enquiries from the landing page ────────────────────────
/**
 * Capture a demo request.
 *
 * There is no outbound email yet, so the record itself has to carry
 * everything needed to work the lead: a status to move through, when it
 * arrived, which language the person was reading, and a clear log line that
 * shows up in the hosting logs as a poor man's notification.
 *
 * Two cheap defences keep the bots out. A hidden field no human can see must
 * stay empty, and a form completed inside three seconds is not a person
 * typing.
 */
export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const locale = await getLocale();
  const t = getDict(locale);

  // Hidden from people, irresistible to bots.
  if (str(formData, "company_website")) return formOk;

  const startedAt = parseInt(str(formData, "started_at") || "0", 10);
  if (startedAt && Date.now() - startedAt < 3000) return formError(t.err_too_fast);

  if (!name) return formError(t.err_lead_name);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return formError(t.err_lead_email);

  await ensureIndexes();
  const d = await db();
  const lead = {
    name,
    email: email.toLowerCase(),
    phone: opt(formData, "phone"),
    clinicName: opt(formData, "clinic"),
    size: opt(formData, "size"),
    message: opt(formData, "message"),
    locale,
    status: "new" as const,
    createdAt: now(),
  };
  await d.collection("leads").insertOne(lead);

  // Until email is wired up this line is the notification: it is searchable
  // in the hosting logs and carries enough to act on without opening the app.
  console.log(
    `[vyala][lead] ${lead.name} <${lead.email}> ${lead.phone ?? "no phone"} | ` +
      `${lead.clinicName ?? "no practice"} | ${lead.size ?? "size unknown"} | ${locale}`
  );

  redirect(`${locale === "el" ? "/el" : ""}/contact?sent=1`);
}

// ── Expenses ─────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "rent", "salaries", "supplies", "equipment",
  "utilities", "insurance", "marketing", "other",
];

export async function createExpense(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { clinic, t } = await requireClinic(slug);
  const raw = str(formData, "amount");
  const amount = parseFloat(raw || "0");
  if (!raw || !Number.isFinite(amount) || amount <= 0) return formError(t.err_amount);
  const category = str(formData, "category");
  const d = await db();
  await d.collection("expenses").insertOne({
    clinicId: oid(clinic.id),
    amount,
    category: EXPENSE_CATEGORIES.includes(category) ? category : "other",
    supplier: opt(formData, "supplier"),
    spentAt: opt(formData, "spent_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
  });
  await recordAudit(clinic.id, "expense.create", undefined, `€${amount}`);
  revalidatePath(`/c/${slug}/billing`);
  return formOk;
}

export async function deleteExpense(slug: string, expenseId: string) {
  const { clinic } = await requireClinic(slug);
  if (!isValidId(expenseId)) return;
  const d = await db();
  await d.collection("expenses").deleteOne({ _id: oid(expenseId), clinicId: oid(clinic.id) });
  revalidatePath(`/c/${slug}/billing`);
}

/** Quick-add used by the patient picker: a name and optionally a phone number. */
export async function quickAddPatient(slug: string, formData: FormData) {
  const { clinic } = await requireClinic(slug);
  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  if (!firstName || !lastName) throw new Error("First and last name are required");
  const d = await db();
  const { insertedId } = await d.collection("patients").insertOne({
    clinicId: oid(clinic.id),
    firstName,
    lastName,
    amka: null,
    phone: opt(formData, "phone"),
    email: null,
    birthDate: null,
    address: null,
    allergies: null,
    notes: null,
    createdAt: now(),
  });
  revalidatePath(`/c/${slug}/patients`);
  return { id: String(insertedId), name: `${lastName} ${firstName}` };
}

// ── Erasure and export ───────────────────────────────────────────
/**
 * Remove a patient and everything attached to them.
 *
 * A patient exercising the right to erasure needs this to be one action, not
 * a support ticket, so visits, documents, appointments and the file itself go
 * together. Payments and invoices keep their amounts for the practice's own
 * accounting duty but are unlinked from the person.
 */
export async function deletePatient(slug: string, patientId: string) {
  const { clinic, member } = await requireClinic(slug);
  if (member.role !== "admin") throw new Error("Only admins can delete a patient");
  if (!isValidId(patientId)) return;

  const d = await db();
  const scope = { clinicId: oid(clinic.id), patientId: oid(patientId) };

  const docs = await d.collection("documents").find(scope).toArray();
  if (docs.length) {
    const gfs = await bucket();
    await Promise.all(docs.map((doc) => gfs.delete(doc.fileId).catch(() => {})));
  }

  await Promise.all([
    d.collection("documents").deleteMany(scope),
    d.collection("visits").deleteMany(scope),
    d.collection("appointments").deleteMany(scope),
    // The money stays on the books, detached from the person.
    d.collection("payments").updateMany(scope, { $set: { patientId: null } }),
    d.collection("invoices").updateMany(scope, { $set: { patientId: null } }),
  ]);
  await d.collection("patients").deleteOne({ _id: oid(patientId), clinicId: oid(clinic.id) });

  await recordAudit(clinic.id, "patient.delete", patientId);
  revalidatePath(`/c/${slug}/patients`);
  redirect(`/c/${slug}/patients`);
}

/** Backs the global search box. Read-only and scoped to the caller's clinic. */
export async function searchPatientsAction(slug: string, term: string) {
  const { clinic } = await requireClinic(slug);
  const { searchPatients } = await import("./queries");
  return searchPatients(clinic.id, term);
}

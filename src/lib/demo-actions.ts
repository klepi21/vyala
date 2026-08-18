"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, isValidId, oid } from "./mongo";
import { demoClinicId } from "./demo";
import { clinicToday, fromClinicLocal } from "./time";

/**
 * Writes for the public showroom.
 *
 * Every function here resolves the clinic itself from the `isDemo` flag and
 * never accepts a clinic id from the caller, so nothing in this file can touch
 * a real practice no matter what is posted. The data is invented, and
 * resetDemo() rebuilds it, so letting visitors click the real buttons costs
 * nothing and shows the product honestly.
 */

const now = () => new Date().toISOString();
const today = () => clinicToday();
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => str(fd, k) || null;

async function scoped(patientId?: string) {
  const clinicId = await demoClinicId();
  const d = await db();
  if (patientId) {
    if (!isValidId(patientId)) throw new Error("Unknown patient");
    const found = await d
      .collection("patients")
      .findOne({ _id: oid(patientId), clinicId }, { projection: { _id: 1 } });
    if (!found) throw new Error("Unknown patient");
  }
  return { d, clinicId };
}

// ── Patients ─────────────────────────────────────────────────────
export async function demoCreatePatient(formData: FormData) {
  const { d, clinicId } = await scoped();
  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  if (!firstName || !lastName) throw new Error("First and last name are required");
  const { insertedId } = await d.collection("patients").insertOne({
    clinicId,
    firstName,
    lastName,
    amka: opt(formData, "amka"),
    phone: opt(formData, "phone"),
    email: opt(formData, "email"),
    birthDate: opt(formData, "birth_date"),
    address: opt(formData, "address"),
    allergies: opt(formData, "allergies"),
    notes: opt(formData, "notes"),
    createdAt: now(),
    demoAdded: true,
  });
  redirect(`/demo/patients/${insertedId}`);
}

// ── Appointments ─────────────────────────────────────────────────
export async function demoCreateAppointment(formData: FormData) {
  const patientId = str(formData, "patient_id");
  const date = str(formData, "date");
  const time = str(formData, "time");
  if (!patientId || !date || !time) throw new Error("Patient, date and time are required");

  const { d, clinicId } = await scoped(patientId);
  const startsAt = fromClinicLocal(date, time);
  if (Number.isNaN(startsAt.getTime())) throw new Error("That date and time are not valid");

  const rawDoctor = str(formData, "doctor_id");
  const doctor =
    rawDoctor && isValidId(rawDoctor)
      ? await d.collection("members").findOne({ _id: oid(rawDoctor), clinicId }, { projection: { _id: 1 } })
      : null;

  const duration = parseInt(str(formData, "duration_min") || "30", 10) || 30;
  await d.collection("appointments").insertOne({
    clinicId,
    patientId: oid(patientId),
    doctorId: doctor ? doctor._id : null,
    startsAt: startsAt.toISOString(),
    durationMin: Math.min(480, Math.max(5, duration)),
    status: "scheduled",
    reason: opt(formData, "reason"),
    createdAt: now(),
    demoAdded: true,
  });
  revalidatePath("/demo/appointments");
  revalidatePath("/demo");
}

export async function demoSetAppointmentStatus(appointmentId: string, status: string) {
  if (!isValidId(appointmentId)) return;
  if (!["scheduled", "completed", "cancelled", "no_show"].includes(status)) return;
  const { d, clinicId } = await scoped();
  await d
    .collection("appointments")
    .updateOne({ _id: oid(appointmentId), clinicId }, { $set: { status } });
  revalidatePath("/demo/appointments");
  revalidatePath("/demo");
}

// ── Visits ───────────────────────────────────────────────────────
export async function demoCreateVisit(patientId: string, formData: FormData) {
  const { d, clinicId } = await scoped(patientId);
  const doctor = await d.collection("members").findOne({ clinicId, role: "admin" });
  await d.collection("visits").insertOne({
    clinicId,
    patientId: oid(patientId),
    doctorId: doctor?._id ?? null,
    visitDate: opt(formData, "visit_date") ?? today(),
    symptoms: opt(formData, "symptoms"),
    diagnosis: opt(formData, "diagnosis"),
    treatment: opt(formData, "treatment"),
    notes: opt(formData, "notes"),
    createdAt: now(),
    demoAdded: true,
  });
  revalidatePath(`/demo/patients/${patientId}`);
}

// ── Payments ─────────────────────────────────────────────────────
export async function demoCreatePayment(formData: FormData) {
  const amount = parseFloat(str(formData, "amount") || "0");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid amount");
  const patientId = str(formData, "patient_id");
  const { d, clinicId } = await scoped(patientId || undefined);
  const method = str(formData, "method");
  await d.collection("payments").insertOne({
    clinicId,
    patientId: patientId ? oid(patientId) : null,
    amount,
    method: ["cash", "card", "bank_transfer", "other"].includes(method) ? method : "cash",
    paidAt: opt(formData, "paid_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
    demoAdded: true,
  });
  revalidatePath("/demo/payments");
  revalidatePath("/demo");
}

// ── Invoices ─────────────────────────────────────────────────────
export async function demoCreateInvoice(formData: FormData) {
  const amount = parseFloat(str(formData, "amount") || "0");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid amount");
  const patientId = str(formData, "patient_id");
  const { d, clinicId } = await scoped(patientId || undefined);

  const year = new Date().getFullYear();
  const counter = await d.collection("counters").findOneAndUpdate(
    { _id: `invoice:${String(clinicId)}:${year}` as never },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = (counter?.seq as number) ?? 1;

  await d.collection("invoices").insertOne({
    clinicId,
    patientId: patientId ? oid(patientId) : null,
    number: `${year}-D${String(seq).padStart(4, "0")}`,
    amount,
    status: "issued",
    issuedAt: opt(formData, "issued_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
    demoAdded: true,
  });
  revalidatePath("/demo/invoices");
  revalidatePath("/demo");
}

export async function demoSetInvoiceStatus(invoiceId: string, status: string) {
  if (!isValidId(invoiceId)) return;
  if (!["issued", "paid"].includes(status)) return;
  const { d, clinicId } = await scoped();
  await d.collection("invoices").updateOne({ _id: oid(invoiceId), clinicId }, { $set: { status } });
  revalidatePath("/demo/invoices");
  revalidatePath("/demo");
}

// ── Team ─────────────────────────────────────────────────────────
export async function demoAddMember(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const fullName = str(formData, "full_name");
  if (!email || !fullName) throw new Error("Name and email are both required");
  const { d, clinicId } = await scoped();
  const role = str(formData, "role");
  await d.collection("members").updateOne(
    { clinicId, email },
    {
      $set: {
        fullName,
        role: ["admin", "doctor", "assistant"].includes(role) ? role : "doctor",
        specialty: opt(formData, "specialty"),
      },
      $setOnInsert: { clinicId, email, clerkUserId: null, createdAt: now(), demoAdded: true },
    },
    { upsert: true }
  );
  revalidatePath("/demo/team");
  revalidatePath("/demo/appointments");
}

export async function demoRemoveMember(memberId: string) {
  if (!isValidId(memberId)) return;
  const { d, clinicId } = await scoped();
  const remaining = await d.collection("members").countDocuments({ clinicId });
  if (remaining <= 1) throw new Error("A practice needs at least one member");
  await d.collection("members").deleteOne({ _id: oid(memberId), clinicId });
  revalidatePath("/demo/team");
}

// ── Reset ────────────────────────────────────────────────────────
/**
 * Puts the showroom back to its seeded state. Everything a visitor creates is
 * tagged demoAdded, so this removes exactly that and nothing from the seed.
 */
export async function demoReset() {
  const { d, clinicId } = await scoped();
  const filter = { clinicId, demoAdded: true };
  await Promise.all([
    d.collection("appointments").deleteMany(filter),
    d.collection("payments").deleteMany(filter),
    d.collection("invoices").deleteMany(filter),
    d.collection("visits").deleteMany(filter),
    d.collection("patients").deleteMany(filter),
    d.collection("members").deleteMany(filter),
  ]);
  // Any seeded appointment a visitor completed or cancelled goes back to scheduled.
  await d.collection("appointments").updateMany(
    { clinicId, startsAt: { $gte: new Date().toISOString() } },
    { $set: { status: "scheduled" } }
  );
  revalidatePath("/demo", "layout");
}

// ── Expenses ─────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "rent", "salaries", "supplies", "equipment",
  "utilities", "insurance", "marketing", "other",
];

export async function demoCreateExpense(formData: FormData) {
  const amount = parseFloat(str(formData, "amount") || "0");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid amount");
  const { d, clinicId } = await scoped();
  const category = str(formData, "category");
  await d.collection("expenses").insertOne({
    clinicId,
    amount,
    category: EXPENSE_CATEGORIES.includes(category) ? category : "other",
    supplier: opt(formData, "supplier"),
    spentAt: opt(formData, "spent_at") ?? today(),
    note: opt(formData, "note"),
    createdAt: now(),
    demoAdded: true,
  });
  revalidatePath("/demo/billing");
  revalidatePath("/demo/analytics");
}

export async function demoDeleteExpense(expenseId: string) {
  if (!isValidId(expenseId)) return;
  const { d, clinicId } = await scoped();
  await d.collection("expenses").deleteOne({ _id: oid(expenseId), clinicId });
  revalidatePath("/demo/billing");
}

export async function demoQuickAddPatient(formData: FormData) {
  const { d, clinicId } = await scoped();
  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  if (!firstName || !lastName) throw new Error("First and last name are required");
  const { insertedId } = await d.collection("patients").insertOne({
    clinicId,
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
    demoAdded: true,
  });
  revalidatePath("/demo/patients");
  return { id: String(insertedId), name: `${lastName} ${firstName}` };
}

export async function demoUpdatePatient(patientId: string, formData: FormData) {
  const { d, clinicId } = await scoped(patientId);
  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  if (!firstName || !lastName) throw new Error("First and last name are required");
  await d.collection("patients").updateOne(
    { _id: oid(patientId), clinicId },
    {
      $set: {
        firstName,
        lastName,
        amka: opt(formData, "amka"),
        phone: opt(formData, "phone"),
        email: opt(formData, "email"),
        birthDate: opt(formData, "birth_date"),
        address: opt(formData, "address"),
        allergies: opt(formData, "allergies"),
        notes: opt(formData, "notes"),
      },
    }
  );
  redirect(`/demo/patients/${patientId}`);
}

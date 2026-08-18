/**
 * Seeds a realistic demo practice so the product can be shown without
 * touching a real clinic. Safe to run repeatedly: it wipes and rebuilds
 * only the demo clinic, and never touches other practices.
 *
 *   node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Pass a Clerk user id to attach the demo practice to your own login:
 *   node --env-file=.env.local scripts/seed-demo.mjs user_abc123
 */
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing. Run with: node --env-file=.env.local scripts/seed-demo.mjs");
  process.exit(1);
}
const clerkUserId = process.argv[2] ?? null;
const SLUG = "demo";

const iso = (d) => d.toISOString();
const ymd = (d) => d.toISOString().slice(0, 10);
const daysFromNow = (n, h = 9, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d;
};

const FIRST_M = ["Νίκος", "Γιώργος", "Δημήτρης", "Κώστας", "Ανδρέας", "Παναγιώτης", "Στέλιος", "Μιχάλης", "Θανάσης", "Χρήστος", "Βαγγέλης", "Σπύρος", "Αλέξανδρος", "Πέτρος", "Θοδωρής", "Λευτέρης", "Μανώλης", "Άγγελος", "Ηλίας", "Σωτήρης"];
const FIRST_F = ["Μαρία", "Ελένη", "Σοφία", "Κατερίνα", "Άννα", "Δέσποινα", "Ιωάννα", "Χριστίνα", "Βασιλική", "Γεωργία", "Αγγελική", "Ευαγγελία", "Παρασκευή", "Ζωή", "Ειρήνη", "Φωτεινή", "Ναταλία", "Αναστασία", "Όλγα", "Θεοδώρα"];
const LAST = ["Παπαδόπουλος", "Γεωργίου", "Δημητρίου", "Ιωάννου", "Νικολάου", "Αντωνίου", "Βασιλείου", "Χατζής", "Κωνσταντίνου", "Στεφάνου", "Μακρής", "Οικονόμου", "Παππάς", "Λαμπρόπουλος", "Θεοδώρου", "Καραγιάννης", "Σπανός", "Βλάχος", "Ζαχαρίου", "Μαυρίδης", "Πολίτης", "Σαμαράς", "Τσιμπούκης", "Φωτίου", "Ραπτόπουλος", "Κουτσός", "Μιχαηλίδης", "Αλεξίου", "Δούκας", "Ρήγας"];
const fem = (s) => s.replace(/ος$/, "ου").replace(/ής$/, "ή").replace(/άς$/, "ά").replace(/ας$/, "α");

const REASONS = ["Ετήσιος έλεγχος", "Παρακολούθηση πίεσης", "Συνταγογράφηση", "Αποτελέσματα εξετάσεων", "Πονόλαιμος και πυρετός", "Πόνος στη μέση", "Έλεγχος σακχάρου", "Εμβολιασμός", "Δερματικό εξάνθημα", "Ημικρανίες"];
const SYMPTOMS = ["Βήχας και πυρετός 3 ημερών", "Πονοκέφαλος και ζάλη", "Πόνος στην οσφύ μετά από άρση βάρους", "Κόπωση και εφίδρωση", "Ναυτία μετά τα γεύματα", "Δύσπνοια στην ανάβαση σκάλας"];
const DIAGNOSES = ["Ιογενής λοίμωξη ανώτερου αναπνευστικού", "Αρτηριακή υπέρταση σταδίου 1", "Οσφυαλγία μηχανικού τύπου", "Σιδηροπενική αναιμία", "Γαστροοισοφαγική παλινδρόμηση", "Αλλεργική ρινίτιδα"];
const TREATMENTS = ["Παρακεταμόλη 500mg ανά 8ωρο, ενυδάτωση, ανάπαυση", "Έναρξη αγωγής, επανέλεγχος σε 4 εβδομάδες", "Μυοχαλαρωτικό για 5 ημέρες και ήπια κινητοποίηση", "Συμπλήρωμα σιδήρου, επανάληψη αιματολογικού σε 2 μήνες", "Αναστολέας αντλίας πρωτονίων για 8 εβδομάδες", "Αντιισταμινικό κατ' επίκληση"];
const ALLERGIES = [null, null, null, "Πενικιλίνη", "Ασπιρίνη", "Ιωδιούχο σκιαγραφικό", "Γύρη"];

const pick = (arr, i) => arr[i % arr.length];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "vyala");

  const existing = await db.collection("clinics").findOne({ slug: SLUG });
  if (existing) {
    const cid = existing._id;
    for (const c of ["patients", "appointments", "visits", "payments", "invoices", "documents", "members"]) {
      await db.collection(c).deleteMany({ clinicId: cid });
    }
    await db.collection("clinics").deleteOne({ _id: cid });
    console.log("Cleared the previous demo practice.");
  }

  const clinicId = new ObjectId();
  await db.collection("clinics").insertOne({
    _id: clinicId,
    slug: SLUG,
    name: "Vyala Demo Practice",
    phone: "+30 210 000 0000",
    address: "Λεωφόρος Κηφισίας 12",
    city: "Αθήνα",
    isDemo: true,
    createdAt: iso(daysFromNow(-420)),
  });

  const memberSpecs = [
    { fullName: "Δρ. Ελένη Παπαδοπούλου", email: "demo@vyala.app", role: "admin", specialty: "Παθολόγος", clerkUserId },
    { fullName: "Δρ. Ανδρέας Νικολάου", email: "andreas@vyala.app", role: "doctor", specialty: "Καρδιολόγος", clerkUserId: null },
    { fullName: "Μαρία Στεφάνου", email: "maria@vyala.app", role: "assistant", specialty: null, clerkUserId: null },
  ];
  const members = memberSpecs.map((m) => ({ _id: new ObjectId(), clinicId, createdAt: iso(daysFromNow(-400)), ...m }));
  await db.collection("members").insertMany(members);
  const doctors = members.filter((m) => m.role !== "assistant");

  // ── Patients ───────────────────────────────────────────────────
  const patients = [];
  const used = new Set();
  for (let i = 0; i < 48; i++) {
    const isF = i % 2 === 0;
    // 30 surnames and 20 given names with coprime strides gives 600 unique
    // combinations before anything repeats, so 48 patients all look distinct.
    const last = LAST[(i * 7) % LAST.length];
    const firstName = (isF ? FIRST_F : FIRST_M)[(i * 3) % FIRST_M.length];
    const lastName = isF ? fem(last) : last;
    const key = `${lastName} ${firstName}`;
    if (used.has(key)) continue;
    used.add(key);
    const birthYear = 1945 + ((i * 7) % 60);
    patients.push({
      _id: new ObjectId(),
      clinicId,
      firstName,
      lastName,
      amka: String(10000000000 + i * 137911).slice(0, 11),
      phone: `69${String(10000000 + i * 91237).slice(0, 8)}`,
      email: i % 3 === 0 ? `patient${i}@example.com` : null,
      birthDate: `${birthYear}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      address: i % 2 ? `Οδός Ερμού ${i + 3}, Αθήνα` : `Λεωφ. Αλεξάνδρας ${i + 11}, Αθήνα`,
      allergies: pick(ALLERGIES, i * 5),
      notes: i % 6 === 0 ? "Προτιμά πρωινά ραντεβού." : null,
      createdAt: iso(daysFromNow(-(400 - i * 7))),
    });
  }
  await db.collection("patients").insertMany(patients);

  // ── Appointments: last 21 days through next 14 days ────────────
  const appointments = [];
  for (let day = -21; day <= 14; day++) {
    const d = daysFromNow(day);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // clinic closed at weekends
    const perDay = day === 0 ? 8 : 4 + ((Math.abs(day) * 3) % 4);
    for (let s = 0; s < perDay; s++) {
      const startHour = 9 + Math.floor(s / 2);
      const startMin = (s % 2) * 30;
      const idx = Math.abs(day * 13 + s * 7);
      const patient = patients[idx % patients.length];
      const status = day < 0 ? (idx % 11 === 0 ? "no_show" : idx % 9 === 0 ? "cancelled" : "completed") : "scheduled";
      appointments.push({
        _id: new ObjectId(),
        clinicId,
        patientId: patient._id,
        doctorId: doctors[idx % doctors.length]._id,
        startsAt: iso(daysFromNow(day, startHour, startMin)),
        durationMin: idx % 4 === 0 ? 45 : 30,
        status,
        reason: pick(REASONS, idx),
        createdAt: iso(daysFromNow(day - 7)),
      });
    }
  }
  await db.collection("appointments").insertMany(appointments);

  // ── Visits for completed appointments ──────────────────────────
  const completed = appointments.filter((a) => a.status === "completed");
  const visits = completed.map((a, i) => ({
    _id: new ObjectId(),
    clinicId,
    patientId: a.patientId,
    doctorId: a.doctorId,
    visitDate: ymd(new Date(a.startsAt)),
    symptoms: pick(SYMPTOMS, i),
    diagnosis: pick(DIAGNOSES, i * 2),
    treatment: pick(TREATMENTS, i * 2),
    notes: i % 4 === 0 ? "Επανέλεγχος σε ένα μήνα εφόσον επιμείνουν τα συμπτώματα." : null,
    createdAt: a.startsAt,
  }));
  if (visits.length) await db.collection("visits").insertMany(visits);

  // ── Payments for most completed visits ─────────────────────────
  const methods = ["cash", "cash", "card", "card", "bank_transfer", "other"];
  const payments = visits
    .filter((_, i) => i % 5 !== 0)
    .map((v, i) => ({
      _id: new ObjectId(),
      clinicId,
      patientId: v.patientId,
      amount: [30, 40, 50, 60, 80][i % 5],
      method: pick(methods, i),
      paidAt: v.visitDate,
      note: i % 7 === 0 ? "Επίσκεψη και συνταγογράφηση" : null,
      createdAt: v.createdAt,
    }));
  // Historical takings for the five months before the appointment window, so the
  // analytics page shows a practice that has been running, not one that opened
  // three weeks ago. Volume and fees are in the range a small Greek practice sees.
  // m = 0 is the current month up to today, so the dashboard comparison against
  // last month is like for like rather than a partial month against a full one.
  for (let m = 0; m <= 5; m++) {
    const month = new Date();
    month.setMonth(month.getMonth() - m);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const lastDay = m === 0 ? new Date().getDate() : daysInMonth;
    for (let day = 1; day <= lastDay; day++) {
      const dow = new Date(month.getFullYear(), month.getMonth(), day).getDay();
      if (dow === 0 || dow === 6) continue;
      const perDay = 5 + ((day * 7 + m * 3) % 4);
      for (let k = 0; k < perDay; k++) {
        const idx = day * 11 + k * 5 + m;
        payments.push({
          _id: new ObjectId(),
          clinicId,
          patientId: patients[idx % patients.length]._id,
          amount: [30, 40, 50, 60, 80][idx % 5],
          method: pick(methods, idx),
          paidAt: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          note: null,
          createdAt: iso(daysFromNow(-(m * 30))),
        });
      }
    }
  }

  if (payments.length) await db.collection("payments").insertMany(payments);

  // ── Invoices ───────────────────────────────────────────────────
  const invoices = payments.slice(0, 18).map((p, i) => ({
    _id: new ObjectId(),
    clinicId,
    patientId: p.patientId,
    number: `${new Date().getFullYear()}-${String(i + 1).padStart(4, "0")}`,
    amount: p.amount,
    status: i % 4 === 0 ? "issued" : "paid",
    issuedAt: p.paidAt,
    note: "Ιατρική επίσκεψη",
    createdAt: p.createdAt,
  }));
  if (invoices.length) await db.collection("invoices").insertMany(invoices);

  // ── Expenses across the same period ────────────────────────────
  const EXP = [
    ["rent", 850, "Ιδιοκτήτης"], ["salaries", 1400, "Μισθοδοσία"],
    ["supplies", 180, "Ιατρικά αναλώσιμα"], ["utilities", 120, "ΔΕΗ"],
    ["equipment", 340, "Τεχνική υποστήριξη"], ["insurance", 210, "Ασφάλιση"],
    ["marketing", 90, "Καταχώρηση καταλόγου"], ["supplies", 95, "Γραφική ύλη"],
  ];
  const expenses = [];
  for (let m = 0; m < 6; m++) {
    const when = new Date();
    when.setMonth(when.getMonth() - m);
    for (let i = 0; i < EXP.length; i++) {
      if (m > 0 && i % 3 === (m % 3)) continue; // vary month to month
      const [category, base, supplier] = EXP[i];
      const day = ((i * 5) % 26) + 1;
      const spentAt = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // A practice cannot have paid a bill that has not happened yet.
      if (spentAt > ymd(new Date())) continue;
      expenses.push({
        _id: new ObjectId(),
        clinicId,
        amount: Math.round(base * (0.85 + ((i + m) % 5) * 0.07)),
        category,
        supplier,
        spentAt,
        note: null,
        createdAt: iso(daysFromNow(-(m * 30))),
      });
    }
  }
  await db.collection("expenses").deleteMany({ clinicId });
  await db.collection("expenses").insertMany(expenses);

  console.log(`
Demo practice ready.

  URL        /c/${SLUG}
  Clinic     Vyala Demo Practice
  Patients   ${patients.length}
  Bookings   ${appointments.length}  (${completed.length} completed)
  Visits     ${visits.length}
  Payments   ${payments.length}
  Invoices   ${invoices.length}\n  Expenses   ${expenses.length}
  Team       ${members.map((m) => `${m.fullName} (${m.role})`).join(", ")}
${clerkUserId
      ? `  Linked to Clerk user ${clerkUserId}`
      : `  Not linked to a Clerk account yet.
  Sign up with demo@vyala.app and you will be attached automatically,
  or re-run with your Clerk user id: node --env-file=.env.local scripts/seed-demo.mjs user_xxx`}
`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

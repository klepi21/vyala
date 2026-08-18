import "server-only";
import { cleanAll, db, isValidId, oid } from "./mongo";
import type {
  Appointment, Doc, Expense, Invoice, Member, Patient, Payment, Visit,
} from "./types";

const nameOf = (p?: { firstName: string; lastName: string }) =>
  p ? `${p.lastName} ${p.firstName}` : "";

/** Look up patient and member display names for a set of ids, in one round trip each. */
async function nameMaps(clinicId: string, patientIds: string[], memberIds: string[]) {
  const d = await db();
  const uniq = (a: string[]) => [...new Set(a.filter((v) => v && isValidId(v)))];
  const [patients, members] = await Promise.all([
    uniq(patientIds).length
      ? d.collection("patients")
          .find({ _id: { $in: uniq(patientIds).map(oid) }, clinicId: oid(clinicId) })
          .project({ firstName: 1, lastName: 1 })
          .toArray()
      : [],
    uniq(memberIds).length
      ? d.collection("members")
          .find({ _id: { $in: uniq(memberIds).map(oid) }, clinicId: oid(clinicId) })
          .project({ fullName: 1 })
          .toArray()
      : [],
  ]);
  return {
    patients: new Map(patients.map((p) => [String(p._id), nameOf(p as never)])),
    members: new Map(members.map((m) => [String(m._id), m.fullName as string])),
  };
}

export async function listPatients(clinicId: string, term = ""): Promise<Patient[]> {
  const d = await db();
  const filter: Record<string, unknown> = { clinicId: oid(clinicId) };
  if (term.trim()) {
    const rx = new RegExp(term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ firstName: rx }, { lastName: rx }, { amka: rx }, { phone: rx }];
  }
  const rows = await d
    .collection("patients")
    .find(filter)
    .sort({ lastName: 1, firstName: 1 })
    .limit(300)
    .toArray();
  return cleanAll(rows) as unknown as Patient[];
}

export async function patientOptions(clinicId: string) {
  const d = await db();
  const rows = await d
    .collection("patients")
    .find({ clinicId: oid(clinicId) })
    .project({ firstName: 1, lastName: 1, phone: 1 })
    .sort({ lastName: 1 })
    .limit(1000)
    .toArray();
  return rows.map((p) => ({
    id: String(p._id),
    name: nameOf(p as never),
    phone: (p.phone as string | null) ?? null,
  }));
}

export async function doctorOptions(clinicId: string) {
  const d = await db();
  const rows = await d
    .collection("members")
    .find({ clinicId: oid(clinicId), role: { $ne: "assistant" } })
    .project({ fullName: 1 })
    .sort({ fullName: 1 })
    .toArray();
  return rows.map((m) => ({ id: String(m._id), name: m.fullName as string }));
}

export async function getPatient(clinicId: string, patientId: string): Promise<Patient | null> {
  if (!isValidId(patientId)) return null;
  const d = await db();
  const rows = await d
    .collection("patients")
    .find({ _id: oid(patientId), clinicId: oid(clinicId) })
    .toArray();
  return (cleanAll(rows)[0] as unknown as Patient) ?? null;
}

export async function listVisits(clinicId: string, patientId: string): Promise<Visit[]> {
  if (!isValidId(patientId)) return [];
  const d = await db();
  const rows = cleanAll(
    await d
      .collection("visits")
      .find({ clinicId: oid(clinicId), patientId: oid(patientId) })
      .sort({ visitDate: -1 })
      .limit(200)
      .toArray()
  ) as unknown as Visit[];
  const maps = await nameMaps(clinicId, [], rows.map((v) => v.doctorId ?? ""));
  return rows.map((v) => ({ ...v, doctorName: v.doctorId ? maps.members.get(v.doctorId) ?? null : null }));
}

export async function listDocuments(clinicId: string, patientId: string): Promise<Doc[]> {
  if (!isValidId(patientId)) return [];
  const d = await db();
  return cleanAll(
    await d
      .collection("documents")
      .find({ clinicId: oid(clinicId), patientId: oid(patientId) })
      .sort({ createdAt: -1 })
      .toArray()
  ) as unknown as Doc[];
}

export async function listAppointments(
  clinicId: string,
  from: Date,
  to: Date
): Promise<Appointment[]> {
  const d = await db();
  const rows = cleanAll(
    await d
      .collection("appointments")
      .find({
        clinicId: oid(clinicId),
        startsAt: { $gte: from.toISOString(), $lte: to.toISOString() },
      })
      .sort({ startsAt: 1 })
      .toArray()
  ) as unknown as Appointment[];
  const maps = await nameMaps(
    clinicId,
    rows.map((a) => a.patientId),
    rows.map((a) => a.doctorId ?? "")
  );
  return rows.map((a) => ({
    ...a,
    patientName: maps.patients.get(a.patientId) ?? "",
    doctorName: a.doctorId ? maps.members.get(a.doctorId) ?? null : null,
  }));
}

export async function listPayments(clinicId: string, patientId?: string): Promise<Payment[]> {
  if (patientId && !isValidId(patientId)) return [];
  const d = await db();
  const filter: Record<string, unknown> = { clinicId: oid(clinicId) };
  if (patientId) filter.patientId = oid(patientId);
  const rows = cleanAll(
    await d.collection("payments").find(filter).sort({ paidAt: -1, createdAt: -1 }).limit(300).toArray()
  ) as unknown as Payment[];
  const maps = await nameMaps(clinicId, rows.map((p) => p.patientId ?? ""), []);
  return rows.map((p) => ({
    ...p,
    patientName: p.patientId ? maps.patients.get(p.patientId) ?? null : null,
  }));
}

export async function listInvoices(clinicId: string): Promise<Invoice[]> {
  const d = await db();
  const rows = cleanAll(
    await d
      .collection("invoices")
      .find({ clinicId: oid(clinicId) })
      .sort({ issuedAt: -1, createdAt: -1 })
      .limit(300)
      .toArray()
  ) as unknown as Invoice[];
  const maps = await nameMaps(clinicId, rows.map((i) => i.patientId ?? ""), []);
  return rows.map((i) => ({
    ...i,
    patientName: i.patientId ? maps.patients.get(i.patientId) ?? null : null,
  }));
}

export async function getInvoice(clinicId: string, invoiceId: string) {
  if (!isValidId(invoiceId)) return null;
  const d = await db();
  const rows = cleanAll(
    await d.collection("invoices").find({ _id: oid(invoiceId), clinicId: oid(clinicId) }).toArray()
  ) as unknown as Invoice[];
  const inv = rows[0];
  if (!inv) return null;
  const patient = inv.patientId ? await getPatient(clinicId, inv.patientId) : null;
  return { invoice: inv, patient };
}

export async function listMembers(clinicId: string): Promise<Member[]> {
  const d = await db();
  return cleanAll(
    await d.collection("members").find({ clinicId: oid(clinicId) }).sort({ createdAt: 1 }).toArray()
  ) as unknown as Member[];
}

/** Monday of the week containing `d`, at midnight local time. */
export function weekStartOf(d: Date): Date {
  const start = new Date(d);
  const dow = (start.getDay() + 6) % 7; // Monday = 0
  start.setDate(start.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function dashboardStats(clinicId: string) {
  const d = await db();
  const nowDate = new Date();
  const dayStart = new Date(nowDate); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(nowDate); dayEnd.setHours(23, 59, 59, 999);
  const monthStart = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-01`;

  const [todayCount, patientCount, monthPayments, unpaidCount] = await Promise.all([
    d.collection("appointments").countDocuments({
      clinicId: oid(clinicId),
      startsAt: { $gte: dayStart.toISOString(), $lte: dayEnd.toISOString() },
      status: { $ne: "cancelled" },
    }),
    d.collection("patients").countDocuments({ clinicId: oid(clinicId) }),
    d.collection("payments")
      .aggregate([
        { $match: { clinicId: oid(clinicId), paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    d.collection("invoices").aggregate([
      { $match: { clinicId: oid(clinicId), status: "issued" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const weekStart = weekStartOf(nowDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [week, todayList, payments] = await Promise.all([
    listAppointments(clinicId, weekStart, weekEnd),
    listAppointments(clinicId, dayStart, dayEnd),
    listPayments(clinicId),
  ]);

  const upcoming = week
    .filter((a) => a.status === "scheduled" && new Date(a.startsAt) >= nowDate)
    .slice(0, 6);

  // Last month's takings over the same slice of days, so the comparison is fair
  // on the 3rd of a month rather than flattering.
  const prevMonthStart = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);
  const prevKey = `${prevMonthStart.getFullYear()}-${String(prevMonthStart.getMonth() + 1).padStart(2, "0")}`;
  const dayOfMonth = nowDate.getDate();
  const prevSoFar = payments
    .filter((p) => p.paidAt.startsWith(prevKey) && Number(p.paidAt.slice(8, 10)) <= dayOfMonth)
    .reduce((s, p) => s + p.amount, 0);

  const monthRevenue = monthPayments[0]?.total ?? 0;

  return {
    todayCount,
    patientCount,
    monthRevenue,
    prevMonthSoFar: prevSoFar,
    unpaidCount: unpaidCount[0]?.count ?? 0,
    unpaidTotal: unpaidCount[0]?.total ?? 0,
    upcoming,
    todayList: todayList.filter((a) => a.status !== "cancelled"),
    week,
    weekStart,
    recentPayments: payments.slice(0, 6),
  };
}

export async function listExpenses(clinicId: string): Promise<Expense[]> {
  const d = await db();
  return cleanAll(
    await d
      .collection("expenses")
      .find({ clinicId: oid(clinicId) })
      .sort({ spentAt: -1, createdAt: -1 })
      .limit(300)
      .toArray()
  ) as unknown as Expense[];
}

export type Grain = "week" | "month" | "year";

/** Bucket key for a YYYY-MM-DD string at the requested grain. */
function bucketOf(ymd: string, grain: Grain): string {
  if (grain === "year") return ymd.slice(0, 4);
  if (grain === "month") return ymd.slice(0, 7);
  const d = new Date(`${ymd}T00:00:00`);
  const monday = weekStartOf(d);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

/** The last `count` bucket keys ending with the one containing today. */
function recentBuckets(grain: Grain, count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (grain === "year") d.setFullYear(d.getFullYear() - i);
    else if (grain === "month") d.setMonth(d.getMonth() - i);
    else d.setDate(d.getDate() - i * 7);
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push(bucketOf(ymd, grain));
  }
  return [...new Set(out)];
}

export interface AnalyticsSeries {
  buckets: string[];
  earnings: number[];
  expenses: number[];
  newPatients: number[];
  appointments: number[];
}

export async function analytics(clinicId: string, grain: Grain, periods: number) {
  const d = await db();
  const cid = oid(clinicId);
  const buckets = recentBuckets(grain, periods);
  const from = buckets[0];
  // Week buckets are already a date; month and year keys need widening to a date.
  const fromDate = grain === "year" ? `${from}-01-01` : grain === "month" ? `${from}-01` : from;

  const [payments, expenses, patients, appts] = await Promise.all([
    d.collection("payments").find({ clinicId: cid, paidAt: { $gte: fromDate } })
      .project({ amount: 1, paidAt: 1, method: 1 }).toArray(),
    d.collection("expenses").find({ clinicId: cid, spentAt: { $gte: fromDate } })
      .project({ amount: 1, spentAt: 1, category: 1 }).toArray(),
    d.collection("patients").find({ clinicId: cid, createdAt: { $gte: fromDate } })
      .project({ createdAt: 1 }).toArray(),
    d.collection("appointments").find({ clinicId: cid, startsAt: { $gte: fromDate } })
      .project({ startsAt: 1, status: 1 }).toArray(),
  ]);

  const zero = () => Object.fromEntries(buckets.map((b) => [b, 0])) as Record<string, number>;
  const earn = zero(), spend = zero(), newPat = zero(), appt = zero();

  for (const p of payments) {
    const k = bucketOf(String(p.paidAt), grain);
    if (k in earn) earn[k] += Number(p.amount);
  }
  for (const e of expenses) {
    const k = bucketOf(String(e.spentAt), grain);
    if (k in spend) spend[k] += Number(e.amount);
  }
  for (const p of patients) {
    const k = bucketOf(String(p.createdAt).slice(0, 10), grain);
    if (k in newPat) newPat[k] += 1;
  }
  for (const a of appts) {
    if (a.status === "cancelled") continue;
    const k = bucketOf(String(a.startsAt).slice(0, 10), grain);
    if (k in appt) appt[k] += 1;
  }

  const byMethod = new Map<string, number>();
  for (const p of payments) {
    byMethod.set(String(p.method), (byMethod.get(String(p.method)) ?? 0) + Number(p.amount));
  }
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(String(e.category), (byCategory.get(String(e.category)) ?? 0) + Number(e.amount));
  }

  const statusCounts = { completed: 0, no_show: 0, cancelled: 0, scheduled: 0 } as Record<string, number>;
  for (const a of appts) statusCounts[String(a.status)] = (statusCounts[String(a.status)] ?? 0) + 1;

  const series: AnalyticsSeries = {
    buckets,
    earnings: buckets.map((b) => earn[b]),
    expenses: buckets.map((b) => spend[b]),
    newPatients: buckets.map((b) => newPat[b]),
    appointments: buckets.map((b) => appt[b]),
  };

  const totalEarnings = series.earnings.reduce((a, b) => a + b, 0);
  const totalExpenses = series.expenses.reduce((a, b) => a + b, 0);

  return {
    series,
    totalEarnings,
    totalExpenses,
    net: totalEarnings - totalExpenses,
    totalNewPatients: series.newPatients.reduce((a, b) => a + b, 0),
    byMethod: [...byMethod.entries()].sort((a, b) => b[1] - a[1]),
    byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    statusCounts,
  };
}

export async function billingTotals(clinicId: string) {
  const d = await db();
  const cid = oid(clinicId);
  const nowDate = new Date();
  const monthStart = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-01`;
  const [inMonth, outMonth, unpaid] = await Promise.all([
    d.collection("payments").aggregate([
      { $match: { clinicId: cid, paidAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    d.collection("expenses").aggregate([
      { $match: { clinicId: cid, spentAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    d.collection("invoices").aggregate([
      { $match: { clinicId: cid, status: "issued" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).toArray(),
  ]);
  const earned = inMonth[0]?.total ?? 0;
  const spent = outMonth[0]?.total ?? 0;
  return {
    earned,
    spent,
    net: earned - spent,
    unpaidTotal: unpaid[0]?.total ?? 0,
    unpaidCount: unpaid[0]?.count ?? 0,
  };
}

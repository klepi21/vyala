/**
 * Clinic time.
 *
 * The server runs in UTC in production but a practice thinks entirely in local
 * time: "my nine o'clock" is nine in Athens or Nicosia, never nine in UTC.
 * Everything that formats or bounds a day goes through here so a deployment's
 * timezone can never shift the schedule.
 *
 * Greece and Cyprus share the same offset and DST rules, so one zone covers
 * both. If the product ever ships beyond them this becomes a clinic setting.
 */
export const CLINIC_TZ = "Europe/Athens";

/** How far the given instant's clinic-local wall clock sits from UTC, in ms. */
function zoneOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(instant)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

  // Intl renders hour 24 for midnight in some engines; Date.UTC handles it.
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - instant.getTime();
}

/** The instant a clinic-local wall clock time occurs, as a real Date. */
export function fromClinicLocal(ymd: string, hhmm = "00:00"): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const naive = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0);
  // Offset varies across DST, so resolve it twice: once with a guess, then
  // again at the candidate instant to land on the right side of a change.
  const guess = new Date(naive - zoneOffsetMs(new Date(naive)));
  return new Date(naive - zoneOffsetMs(guess));
}

/** Today's date in the clinic's timezone, as YYYY-MM-DD. */
export function clinicToday(): string {
  return clinicYmd(new Date());
}

/** The clinic-local calendar date of an instant, as YYYY-MM-DD. */
export function clinicYmd(instant: Date | string): string {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts; // en-CA renders as YYYY-MM-DD
}

/** Start and end instants of a clinic-local calendar day. */
export function clinicDayBounds(ymd: string): { from: Date; to: Date } {
  const from = fromClinicLocal(ymd, "00:00");
  const to = new Date(fromClinicLocal(nextYmd(ymd), "00:00").getTime() - 1);
  return { from, to };
}

/** The Monday that starts the clinic-local week containing `ymd`. */
export function clinicWeekStart(ymd: string): string {
  const noon = fromClinicLocal(ymd, "12:00");
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    weekday: "short",
  }).format(noon);
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const back = Math.max(0, order.indexOf(weekday));
  return shiftYmd(ymd, -back);
}

export function shiftYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(
    dt.getUTCDate()
  ).padStart(2, "0")}`;
}

export const nextYmd = (ymd: string) => shiftYmd(ymd, 1);

/** First day of the clinic-local month containing today, as YYYY-MM-01. */
export function clinicMonthStart(ymd = clinicToday()): string {
  return `${ymd.slice(0, 7)}-01`;
}

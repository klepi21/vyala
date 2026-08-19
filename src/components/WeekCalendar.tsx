import Link from "next/link";
import type { Appointment } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { CLINIC_TZ, clinicToday, clinicYmd, shiftYmd } from "@/lib/time";

const statusDot: Record<string, string> = {
  scheduled: "bg-brand-500",
  completed: "bg-sky-500",
  cancelled: "bg-black/20",
  no_show: "bg-amber-500",
};

/**
 * Seven day strip with each day's appointments underneath, so the week reads
 * at a glance without needing a full grid calendar.
 */
export function WeekCalendar({
  appointments,
  weekStart,
  locale,
  basePath,
  emptyLabel,
  todayLabel,
}: {
  appointments: Appointment[];
  weekStart: Date;
  locale: Locale;
  basePath: string;
  emptyLabel: string;
  todayLabel: string;
}) {
  const tag = locale === "el" ? "el-GR" : "en-GB";
  const dayName = new Intl.DateTimeFormat(tag, { weekday: "short", timeZone: CLINIC_TZ });
  const dayNum = new Intl.DateTimeFormat(tag, { day: "numeric", timeZone: CLINIC_TZ });
  const timeFmt = new Intl.DateTimeFormat(tag, {
    hour: "2-digit", minute: "2-digit", timeZone: CLINIC_TZ,
  });

  // Keyed on the clinic-local calendar date, so a UTC server cannot file an
  // early morning appointment under the previous day.
  const todayKey = clinicToday();
  const startYmd = clinicYmd(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => shiftYmd(startYmd, i));

  const byDay = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const k = clinicYmd(a.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), a]);
  }

  return (
    // Seven columns need about 560px to stay legible, so on a phone the strip
    // scrolls sideways instead of crushing each day to 40px.
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="grid min-w-[680px] grid-cols-7 gap-px overflow-hidden rounded-xl bg-black/[.06]">
      {days.map((iso, index) => {
        const list = (byDay.get(iso) ?? []).filter((a) => a.status !== "cancelled");
        const isToday = iso === todayKey;
        const noon = new Date(`${iso}T12:00:00Z`);
        const weekend = index >= 5;

        return (
          <Link
            key={iso}
            href={`${basePath}?date=${iso}`}
            className={`group flex min-h-40 flex-col gap-1.5 p-3 transition ${
              weekend ? "bg-mist/70" : "bg-white"
            } hover:bg-brand-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`}
          >
            <div className="mb-0.5 flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {dayName.format(noon)}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-bold tabular-nums ${
                  isToday ? "bg-brand-600 text-white" : "text-ink/80"
                }`}
              >
                {dayNum.format(noon)}
              </span>
            </div>

            {list.length === 0 ? (
              <span className="mt-1.5 text-xs text-muted">{isToday ? todayLabel : emptyLabel}</span>
            ) : (
              <>
                {list.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1.5 truncate rounded-lg bg-black/[.04] px-2 py-1.5 text-xs leading-tight"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[a.status]}`} />
                    <span className="shrink-0 font-medium tabular-nums">
                      {timeFmt.format(new Date(a.startsAt))}
                    </span>
                    <span className="truncate text-ink/60">{a.patientName}</span>
                  </span>
                ))}
                {list.length > 3 && (
                  <span className="px-1 text-xs font-semibold text-brand-700">
                    +{list.length - 3}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
      </div>
    </div>
  );
}

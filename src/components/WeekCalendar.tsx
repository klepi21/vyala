import Link from "next/link";
import type { Appointment } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

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
  const dayName = new Intl.DateTimeFormat(tag, { weekday: "short" });
  const timeFmt = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit" });

  const todayKey = new Date().toDateString();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const byDay = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const k = new Date(a.startsAt).toDateString();
    byDay.set(k, [...(byDay.get(k) ?? []), a]);
  }

  return (
    // Seven columns need about 560px to stay legible, so on a phone the strip
    // scrolls sideways instead of crushing each day to 40px.
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="grid min-w-[560px] grid-cols-7 gap-px overflow-hidden rounded-xl bg-black/[.06]">
      {days.map((d) => {
        const key = d.toDateString();
        const list = (byDay.get(key) ?? []).filter((a) => a.status !== "cancelled");
        const isToday = key === todayKey;
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const weekend = d.getDay() === 0 || d.getDay() === 6;

        return (
          <Link
            key={key}
            href={`${basePath}?date=${iso}`}
            className={`group flex min-h-32 flex-col gap-1 p-2 transition ${
              weekend ? "bg-mist/70" : "bg-white"
            } hover:bg-brand-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`}
          >
            <div className="mb-0.5 flex items-baseline justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                {dayName.format(d)}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  isToday ? "bg-brand-600 text-white" : "text-ink/70"
                }`}
              >
                {d.getDate()}
              </span>
            </div>

            {list.length === 0 ? (
              <span className="mt-1 text-[10px] text-muted">{isToday ? todayLabel : emptyLabel}</span>
            ) : (
              <>
                {list.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1 truncate rounded-md bg-black/[.03] px-1.5 py-1 text-[10px] leading-tight"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[a.status]}`} />
                    <span className="shrink-0 font-medium tabular-nums">
                      {timeFmt.format(new Date(a.startsAt))}
                    </span>
                    <span className="truncate text-ink/60">{a.patientName}</span>
                  </span>
                ))}
                {list.length > 3 && (
                  <span className="px-1 text-[10px] font-medium text-brand-700">
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

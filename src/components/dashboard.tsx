import Link from "next/link";
import { ArrowRight, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import type { Appointment, Payment } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { money, shortDate, time } from "@/lib/format";

/**
 * The numbers a practice owner checks first.
 *
 * Deliberately large: the value is 40px so it reads across a desk, the icon
 * sits in a filled brand tile rather than a faint outline, and the whole card
 * is one big link so there is no small target to aim at.
 */
export function MetricCard({
  label,
  value,
  icon,
  delta,
  href,
  tone = "plain",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  delta?: { pct: number; label: string } | null;
  href?: string;
  tone?: "plain" | "warn";
}) {
  const body = (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-snug text-ink/70 sm:text-sm">{label}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
            tone === "warn" ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700"
          }`}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[2.4rem]">
          {value}
        </p>
        {delta && (
          <p
            className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold ${
              delta.pct >= 0 ? "bg-brand-50 text-brand-800" : "bg-amber-50 text-amber-800"
            }`}
          >
            {delta.pct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {delta.pct >= 0 ? "+" : ""}
            {delta.pct}%
            <span className="font-normal text-muted">{delta.label}</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4 transition hover:border-brand-300 sm:p-5 hover:shadow-md hover:shadow-brand-900/[.06]">
      {href ? (
        <Link
          href={href}
          className="block h-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}

const statusStyle: Record<string, string> = {
  scheduled: "border-brand-200 bg-white",
  completed: "border-sky-200 bg-sky-50/50",
  no_show: "border-amber-200 bg-amber-50/50",
  cancelled: "border-black/10 bg-mist",
};

const statusDot: Record<string, string> = {
  scheduled: "bg-brand-500",
  completed: "bg-sky-500",
  no_show: "bg-amber-500",
  cancelled: "bg-black/25",
};

/** Today's list as a timeline, so the next patient is obvious at a glance. */
export function TodayTimeline({
  appointments,
  locale,
  basePath,
  emptyLabel,
  nextLabel,
  statusLabels,
}: {
  appointments: Appointment[];
  locale: Locale;
  basePath: string;
  emptyLabel: string;
  nextLabel: string;
  statusLabels: Record<string, string>;
}) {
  if (appointments.length === 0) {
    return <p className="px-5 py-12 text-center text-[15px] text-muted">{emptyLabel}</p>;
  }

  const nowMs = new Date().getTime();
  const nextId = appointments.find(
    (a) => a.status === "scheduled" && new Date(a.startsAt).getTime() >= nowMs
  )?.id;

  return (
    <ol className="space-y-2 px-4 pb-5">
      {appointments.map((a) => {
        const isNext = a.id === nextId;
        return (
          <li key={a.id}>
            <Link
              href={`${basePath}/patients/${a.patientId}`}
              className={`flex min-h-[68px] items-center gap-4 rounded-xl border px-4 py-3 transition hover:border-brand-400 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                statusStyle[a.status]
              } ${isNext ? "ring-2 ring-brand-500/30" : ""}`}
            >
              <span className="flex w-16 shrink-0 flex-col items-center">
                <span className="text-lg font-semibold leading-none tabular-nums">
                  {time(a.startsAt, locale)}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                  <span className={`h-2 w-2 rounded-full ${statusDot[a.status]}`} />
                  {statusLabels[a.status]}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{a.patientName}</span>
                <span className="block truncate text-sm text-muted">
                  {a.reason || `${a.durationMin} min`}
                  {a.doctorName ? ` · ${a.doctorName}` : ""}
                </span>
              </span>
              {isNext && (
                <span className="shrink-0 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {nextLabel}
                </span>
              )}
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function RecentPayments({
  payments,
  locale,
  emptyLabel,
  methodLabels,
  noPatientLabel,
}: {
  payments: Payment[];
  locale: Locale;
  emptyLabel: string;
  methodLabels: Record<string, string>;
  noPatientLabel: string;
}) {
  if (payments.length === 0) {
    return <p className="px-5 py-12 text-center text-[15px] text-muted">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-black/[.06] px-5 pb-4">
      {payments.map((p) => (
        <li key={p.id} className="flex min-h-[60px] items-center justify-between gap-3 py-3">
          <span className="min-w-0">
            <span className="block truncate text-[15px] text-ink/85">
              {p.patientName ?? <span className="text-muted">{noPatientLabel}</span>}
            </span>
            <span className="text-sm text-muted">
              {shortDate(p.paidAt, locale)} · {methodLabels[p.method]}
            </span>
          </span>
          <span className="shrink-0 text-lg font-semibold tabular-nums">
            {money(p.amount, locale)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/[.06] px-5 py-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
        >
          {linkLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

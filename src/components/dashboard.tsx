import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import type { Appointment, Payment } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { money, shortDate, time } from "@/lib/format";

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
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span
          className={`rounded-lg p-1.5 ${
            tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-600"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
        {delta && (
          <p
            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
              delta.pct >= 0 ? "text-brand-700" : "text-amber-700"
            }`}
          >
            {delta.pct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta.pct >= 0 ? "+" : ""}
            {delta.pct}% <span className="font-normal text-muted">{delta.label}</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4 transition hover:border-brand-200">
      {href ? <Link href={href} className="block h-full">{body}</Link> : body}
    </Card>
  );
}

const statusStyle: Record<string, string> = {
  scheduled: "border-brand-300 bg-brand-50/60",
  completed: "border-sky-200 bg-sky-50/60",
  no_show: "border-amber-200 bg-amber-50/60",
  cancelled: "border-black/10 bg-mist",
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
    return <p className="px-5 py-8 text-center text-sm text-muted">{emptyLabel}</p>;
  }

  const nowMs = new Date().getTime();
  const nextId = appointments.find(
    (a) => a.status === "scheduled" && new Date(a.startsAt).getTime() >= nowMs
  )?.id;

  return (
    <ol className="space-y-1.5 px-4 pb-4">
      {appointments.map((a) => {
        const isNext = a.id === nextId;
        return (
          <li key={a.id}>
            <Link
              href={`${basePath}/patients/${a.patientId}`}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:border-brand-400 ${
                statusStyle[a.status]
              } ${isNext ? "ring-2 ring-brand-500/25" : ""}`}
            >
              <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">
                {time(a.startsAt, locale)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{a.patientName}</span>
                <span className="block truncate text-xs text-muted">
                  {a.reason || statusLabels[a.status]}
                  {a.doctorName ? ` · ${a.doctorName}` : ""}
                </span>
              </span>
              {isNext && (
                <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {nextLabel}
                </span>
              )}
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
    return <p className="px-5 py-8 text-center text-sm text-muted">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-black/[.05] px-5 pb-3">
      {payments.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="min-w-0">
            <span className="block truncate text-ink/75">
              {p.patientName ?? <span className="text-muted">{noPatientLabel}</span>}
            </span>
            <span className="text-xs text-muted">
              {shortDate(p.paidAt, locale)} · {methodLabels[p.method]}
            </span>
          </span>
          <span className="shrink-0 font-medium tabular-nums">{money(p.amount, locale)}</span>
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
    <div className="flex items-center justify-between px-5 pb-2 pt-4">
      <h2 className="text-sm font-semibold text-ink/80">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {linkLabel} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

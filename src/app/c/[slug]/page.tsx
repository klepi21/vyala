import Link from "next/link";
import { CalendarDays, Plus, Receipt, Users, Wallet } from "lucide-react";
import { requireClinic } from "@/lib/tenancy";
import { dashboardStats } from "@/lib/queries";
import { Card } from "@/components/ui";
import { WeekCalendar } from "@/components/WeekCalendar";
import {
  MetricCard, RecentPayments, SectionHeader, TodayTimeline,
} from "@/components/dashboard";
import { money } from "@/lib/format";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { clinic, member, locale, t } = await requireClinic(slug);
  const s = await dashboardStats(clinic.id);
  const base = `/c/${slug}`;

  const pct =
    s.prevMonthSoFar > 0
      ? Math.round(((s.monthRevenue - s.prevMonthSoFar) / s.prevMonthSoFar) * 100)
      : null;

  const statusLabels: Record<string, string> = {
    scheduled: t.appt_status_scheduled,
    completed: t.appt_status_completed,
    cancelled: t.appt_status_cancelled,
    no_show: t.appt_status_no_show,
  };
  const methodLabels: Record<string, string> = {
    cash: t.pay_method_cash,
    card: t.pay_method_card,
    bank_transfer: t.pay_method_bank,
    other: t.pay_method_other,
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t.dash_welcome}, {member.fullName.split(" ").slice(-1)[0]}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{t.dash_subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`${base}/patients/new`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-mist"
          >
            <Plus size={15} /> {t.patients_new}
          </Link>
          <Link
            href={`${base}/appointments`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus size={15} /> {t.appt_new}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={t.dash_today}
          value={String(s.todayCount)}
          icon={<CalendarDays size={16} />}
          href={`${base}/appointments`}
        />
        <MetricCard
          label={t.dash_patients}
          value={String(s.patientCount)}
          icon={<Users size={16} />}
          href={`${base}/patients`}
        />
        <MetricCard
          label={t.dash_month_revenue}
          value={money(s.monthRevenue, locale)}
          icon={<Wallet size={16} />}
          delta={pct === null ? null : { pct, label: t.dash_vs_last_month }}
          href={`${base}/billing`}
        />
        <MetricCard
          label={t.dash_pending_invoices}
          value={String(s.unpaidCount)}
          icon={<Receipt size={16} />}
          tone={s.unpaidCount > 0 ? "warn" : "plain"}
          href={`${base}/billing?tab=invoices`}
        />
      </div>

      <Card className="mt-4">
        <SectionHeader
          title={t.dash_this_week}
          href={`${base}/appointments`}
          linkLabel={t.dash_open_schedule}
        />
        <div className="px-4 pb-4">
          <WeekCalendar
            appointments={s.week}
            weekStart={s.weekStart}
            locale={locale}
            basePath={`${base}/appointments`}
            emptyLabel={t.dash_day_free}
            todayLabel={t.dash_nothing_today}
          />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionHeader
            title={t.dash_today_list}
            href={`${base}/appointments`}
            linkLabel={t.dash_open_schedule}
          />
          <TodayTimeline
            appointments={s.todayList}
            locale={locale}
            basePath={base}
            emptyLabel={t.dash_nothing_today}
            nextLabel={t.dash_next}
            statusLabels={statusLabels}
          />
        </Card>

        <Card>
          <SectionHeader
            title={t.dash_recent_payments}
            href={`${base}/billing`}
            linkLabel={t.dash_open_payments}
          />
          <RecentPayments
            payments={s.recentPayments}
            locale={locale}
            emptyLabel={t.dash_no_payments}
            methodLabels={methodLabels}
            noPatientLabel={t.no_patient_linked}
          />
        </Card>
      </div>
    </div>
  );
}

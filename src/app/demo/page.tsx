import Link from "next/link";
import {
  CalendarDays, CalendarPlus, Receipt, UserPlus, Users, Wallet,
} from "lucide-react";
import { demoContext } from "@/lib/demo";
import { dashboardStats } from "@/lib/queries";
import { Card } from "@/components/ui";
import { WeekCalendar } from "@/components/WeekCalendar";
import {
  MetricCard, RecentPayments, SectionHeader, TodayTimeline,
} from "@/components/dashboard";
import { moneyRound } from "@/lib/format";

export const metadata = { title: "Live demo" };

export default async function DemoDashboard() {
  const { clinic, locale, t } = await demoContext();
  const s = await dashboardStats(clinic.id);

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t.dash_welcome}, Ελένη
          </h1>
          <p className="mt-1.5 text-base text-muted">{t.demo_editable}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/demo/patients/new"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-black/12 bg-white px-5 text-[15px] font-semibold transition hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <UserPlus size={18} className="text-brand-600" /> {t.patients_new}
          </Link>
          <Link
            href="/demo/appointments"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[15px] font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <CalendarPlus size={18} /> {t.appt_new}
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard label={t.dash_today} value={String(s.todayCount)} icon={<CalendarDays size={22} />} href="/demo/appointments" />
        <MetricCard label={t.dash_patients} value={String(s.patientCount)} icon={<Users size={22} />} href="/demo/patients" />
        <MetricCard
          label={t.dash_month_revenue}
          value={moneyRound(s.monthRevenue, locale)}
          icon={<Wallet size={22} />}
          delta={pct === null ? null : { pct, label: t.dash_vs_last_month }}
          href="/demo/billing"
        />
        <MetricCard
          label={t.dash_pending_invoices}
          value={String(s.unpaidCount)}
          icon={<Receipt size={22} />}
          tone={s.unpaidCount > 0 ? "warn" : "plain"}
          href="/demo/billing?tab=invoices"
        />
      </div>

      <Card className="mt-5">
        <SectionHeader title={t.dash_this_week} href="/demo/appointments" linkLabel={t.dash_open_schedule} />
        <div className="px-5 pb-5">
          <WeekCalendar
            appointments={s.week}
            weekStart={s.weekStart}
            locale={locale}
            basePath="/demo/appointments"
            emptyLabel={t.dash_day_free}
            todayLabel={t.dash_nothing_today}
          />
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionHeader title={t.dash_today_list} href="/demo/appointments" linkLabel={t.dash_open_schedule} />
          <TodayTimeline
            appointments={s.todayList}
            locale={locale}
            basePath="/demo"
            emptyLabel={t.dash_nothing_today}
            nextLabel={t.dash_next}
            statusLabels={statusLabels}
          />
        </Card>

        <Card>
          <SectionHeader title={t.dash_recent_payments} href="/demo/billing" linkLabel={t.dash_open_payments} />
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

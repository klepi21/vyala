import Link from "next/link";
import { TrendingDown, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { Card, PageTitle } from "@/components/ui";
import { ChartFrame, GroupedBars, RankedBars, SERIES, TrendLine } from "@/components/charts";
import { money } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Grain } from "@/lib/queries";

type Analytics = Awaited<ReturnType<typeof import("@/lib/queries").analytics>>;

/** Turns a bucket key into something a person reads on an axis. */
function axisLabel(key: string, grain: Grain, locale: Locale): string {
  const tag = locale === "el" ? "el-GR" : "en-GB";
  if (grain === "year") return key;
  if (grain === "month") {
    const [y, m] = key.split("-");
    return new Intl.DateTimeFormat(tag, { month: "short" }).format(new Date(Number(y), Number(m) - 1, 1));
  }
  const d = new Date(`${key}T00:00:00`);
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" }).format(d);
}

export function AnalyticsView({
  base,
  grain,
  data,
  t,
  locale,
}: {
  base: string;
  grain: Grain;
  data: Analytics;
  t: Dict;
  locale: Locale;
}) {
  const labels = data.series.buckets.map((b) => axisLabel(b, grain, locale));
  const compact = (n: number) =>
    new Intl.NumberFormat(locale === "el" ? "el-GR" : "en-GB", {
      notation: n >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(n);
  const eur = (n: number) => `€${compact(n)}`;

  const methodLabel: Record<string, string> = {
    cash: t.pay_method_cash, card: t.pay_method_card,
    bank_transfer: t.pay_method_bank, other: t.pay_method_other,
  };
  const catLabel: Record<string, string> = {
    rent: t.exp_rent, salaries: t.exp_salaries, supplies: t.exp_supplies,
    equipment: t.exp_equipment, utilities: t.exp_utilities,
    insurance: t.exp_insurance, marketing: t.exp_marketing, other: t.exp_other,
  };

  const grains: { key: Grain; label: string }[] = [
    { key: "week", label: t.an_week },
    { key: "month", label: t.an_month },
    { key: "year", label: t.an_year },
  ];

  const attendance = [
    { label: t.appt_status_completed, value: data.statusCounts.completed ?? 0, color: SERIES[0] },
    { label: t.appt_status_scheduled, value: data.statusCounts.scheduled ?? 0, color: SERIES[2] },
    { label: t.appt_status_no_show, value: data.statusCounts.no_show ?? 0, color: SERIES[1] },
    { label: t.appt_status_cancelled, value: data.statusCounts.cancelled ?? 0, color: SERIES[5] },
  ].filter((r) => r.value > 0);

  return (
    <div>
      <PageTitle
        title={t.an_title}
        description={t.an_subtitle}
        action={
          <div className="flex gap-1 rounded-xl bg-black/[.04] p-1">
            {grains.map((g) => (
              <Link
                key={g.key}
                href={`${base}/analytics?grain=${g.key}`}
                aria-current={g.key === grain ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  g.key === grain ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                {g.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HeadlineTile
          label={t.an_earnings}
          value={money(data.totalEarnings, locale)}
          icon={<TrendingUp size={15} />}
          color={SERIES[0]}
        />
        <HeadlineTile
          label={t.an_expenses}
          value={money(data.totalExpenses, locale)}
          icon={<TrendingDown size={15} />}
          color={SERIES[1]}
        />
        <HeadlineTile
          label={t.an_net}
          value={money(data.net, locale)}
          icon={<Wallet size={15} />}
          color={data.net >= 0 ? SERIES[0] : SERIES[5]}
          strong
        />
        <HeadlineTile
          label={t.an_new_patients}
          value={String(data.totalNewPatients)}
          icon={<UserPlus size={15} />}
          color={SERIES[2]}
        />
      </div>

      <div className="mt-4">
        <ChartFrame
          title={t.an_in_out}
          subtitle={t.an_in_out_sub}
          legend={[
            { label: t.an_earnings, color: SERIES[0] },
            { label: t.an_expenses, color: SERIES[1] },
          ]}
        >
          <GroupedBars
            labels={labels}
            formatValue={eur}
            series={[
              { name: t.an_earnings, color: SERIES[0], values: data.series.earnings },
              { name: t.an_expenses, color: SERIES[1], values: data.series.expenses },
            ]}
          />
        </ChartFrame>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartFrame title={t.an_methods} subtitle={t.an_methods_sub}>
          <RankedBars
            emptyLabel={t.an_no_data}
            formatValue={(n) => money(n, locale)}
            rows={data.byMethod.map(([m, v], i) => ({
              label: methodLabel[m] ?? m,
              value: v,
              color: SERIES[i % SERIES.length],
            }))}
          />
        </ChartFrame>

        <ChartFrame title={t.an_categories} subtitle={t.an_categories_sub}>
          <RankedBars
            emptyLabel={t.an_no_data}
            formatValue={(n) => money(n, locale)}
            rows={data.byCategory.map(([c, v], i) => ({
              label: catLabel[c] ?? c,
              value: v,
              color: SERIES[(i + 1) % SERIES.length],
            }))}
          />
        </ChartFrame>

        <ChartFrame title={t.an_patients_trend}>
          <TrendLine
            labels={labels}
            values={data.series.newPatients}
            color={SERIES[2]}
            formatValue={(n) => String(Math.round(n))}
          />
        </ChartFrame>

        <ChartFrame title={t.an_attendance} subtitle={t.an_attendance_sub}>
          <RankedBars
            emptyLabel={t.an_no_data}
            formatValue={(n) => String(Math.round(n))}
            rows={attendance}
          />
        </ChartFrame>
      </div>

      {/* The same numbers as a table, so the charts are never the only way in. */}
      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="px-5 pt-4 text-left text-sm font-semibold">{t.an_in_out}</caption>
          <thead>
            <tr className="border-b border-black/[.07] text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">{t.date}</th>
              <th className="px-5 py-3 text-right font-medium">{t.an_earnings}</th>
              <th className="px-5 py-3 text-right font-medium">{t.an_expenses}</th>
              <th className="px-5 py-3 text-right font-medium">{t.an_net}</th>
              <th className="px-5 py-3 text-right font-medium">{t.an_new_patients}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[.05]">
            {labels.map((l, i) => {
              const inc = data.series.earnings[i];
              const out = data.series.expenses[i];
              return (
                <tr key={data.series.buckets[i]}>
                  <td className="px-5 py-2.5">{l}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{money(inc, locale)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{money(out, locale)}</td>
                  <td className={`px-5 py-2.5 text-right font-medium tabular-nums ${inc - out < 0 ? "text-red-700" : ""}`}>
                    {money(inc - out, locale)}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{data.series.newPatients[i]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function HeadlineTile({
  label,
  value,
  icon,
  color,
  strong,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  strong?: boolean;
}) {
  return (
    <Card className={`p-4 ${strong ? "ring-1 ring-brand-200" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className="rounded-lg p-1.5" style={{ background: `${color}18`, color }}>
          {icon}
        </span>
      </div>
      <p className="mt-2.5 text-xl font-semibold tabular-nums leading-none">{value}</p>
    </Card>
  );
}

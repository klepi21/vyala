import { demoContext } from "@/lib/demo";
import { analytics, type Grain } from "@/lib/queries";
import { AnalyticsView } from "@/components/AnalyticsView";

export const metadata = { title: "Live demo, analytics" };

const PERIODS: Record<Grain, number> = { week: 8, month: 6, year: 3 };

export default async function DemoAnalytics({
  searchParams,
}: {
  searchParams: Promise<{ grain?: string }>;
}) {
  const { grain } = await searchParams;
  const g: Grain = grain === "week" || grain === "year" ? grain : "month";
  const { clinic, locale, t } = await demoContext();
  const data = await analytics(clinic.id, g, PERIODS[g]);
  return <AnalyticsView base="/demo" grain={g} data={data} t={t} locale={locale} />;
}

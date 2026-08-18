import { requireClinic } from "@/lib/tenancy";
import { analytics, type Grain } from "@/lib/queries";
import { AnalyticsView } from "@/components/AnalyticsView";

const PERIODS: Record<Grain, number> = { week: 8, month: 6, year: 3 };

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ grain?: string }>;
}) {
  const { slug } = await params;
  const { grain } = await searchParams;
  const g: Grain = grain === "week" || grain === "year" ? grain : "month";
  const { clinic, locale, t } = await requireClinic(slug);
  const data = await analytics(clinic.id, g, PERIODS[g]);
  return <AnalyticsView base={`/c/${slug}`} grain={g} data={data} t={t} locale={locale} />;
}

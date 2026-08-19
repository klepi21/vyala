import Link from "next/link";
import { demoContext } from "@/lib/demo";
import { listPatients } from "@/lib/queries";
import { Plus } from "lucide-react";
import { Card, EmptyState, PageTitle, PrimaryLink, inputCls } from "@/components/ui";
import { date } from "@/lib/format";

export const metadata = { title: "Live demo, patients" };

export default async function DemoPatients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { clinic, locale, t } = await demoContext();
  const { patients } = await listPatients(clinic.id, q);

  return (
    <div>
      <PageTitle
        title={t.patients_title}
        action={
          <PrimaryLink href="/demo/patients/new">
            <Plus size={16} /> {t.patients_new}
          </PrimaryLink>
        }
      />
      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t.patients_search}
          aria-label={t.patients_search}
          className={`${inputCls} max-w-md`}
        />
      </form>

      <Card>
        {patients.length === 0 ? (
          <EmptyState>{t.patients_no_match}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[.06] text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">{t.patient_last_name}</th>
                  <th className="px-5 py-3 font-medium">{t.patient_amka}</th>
                  <th className="px-5 py-3 font-medium">{t.patient_phone}</th>
                  <th className="px-5 py-3 font-medium">{t.patient_since}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[.05]">
                {patients.map((p) => (
                  <tr key={p.id} className="transition hover:bg-mist/60">
                    <td className="px-5 py-3">
                      <Link href={`/demo/patients/${p.id}`} className="font-medium hover:text-brand-700">
                        {p.lastName} {p.firstName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-ink/60">{p.amka}</td>
                    <td className="px-5 py-3 tabular-nums text-ink/60">{p.phone}</td>
                    <td className="px-5 py-3 text-muted">{date(p.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

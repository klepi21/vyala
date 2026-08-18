import Link from "next/link";
import { Plus } from "lucide-react";
import { requireClinic } from "@/lib/tenancy";
import { listPatients } from "@/lib/queries";
import { Card, EmptyState, PageTitle, PrimaryLink, inputCls } from "@/components/ui";
import { date } from "@/lib/format";

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q = "" } = await searchParams;
  const { clinic, t, locale } = await requireClinic(slug);
  const patients = await listPatients(clinic.id, q);

  return (
    <div>
      <PageTitle
        title={t.patients_title}
        action={
          <PrimaryLink href={`/c/${slug}/patients/new`}>
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
          <EmptyState>{q ? t.patients_no_match : t.patients_empty}</EmptyState>
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
                  <tr key={p.id} className="group transition hover:bg-mist/60">
                    <td className="p-0">
                      <Link
                        href={`/c/${slug}/patients/${p.id}`}
                        className="block px-5 py-3.5 font-medium outline-none group-hover:text-brand-700 focus-visible:bg-brand-50"
                      >
                        {p.lastName} {p.firstName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-ink/65">{p.amka ?? t.not_recorded}</td>
                    <td className="px-5 py-3.5 tabular-nums text-ink/65">
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} className="hover:text-brand-700">{p.phone}</a>
                      ) : (
                        t.not_recorded
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{date(p.createdAt, locale)}</td>
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

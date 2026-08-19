import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";
import { requireClinic } from "@/lib/tenancy";
import { PATIENTS_PER_PAGE, listPatients } from "@/lib/queries";
import { Card, EmptyState, PageTitle, PrimaryLink, inputCls } from "@/components/ui";
import { date } from "@/lib/format";

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { q = "", page } = await searchParams;
  const { clinic, t, locale } = await requireClinic(slug);

  const { patients, total, page: current, pages } = await listPatients(
    clinic.id,
    q,
    parseInt(page ?? "1", 10) || 1
  );

  const pageHref = (n: number) =>
    `/c/${slug}/patients?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;

  return (
    <div>
      <PageTitle
        title={t.patients_title}
        description={total > 0 ? `${total} ${t.patients_title.toLowerCase()}` : undefined}
        action={
          <PrimaryLink href={`/c/${slug}/patients/new`}>
            <Plus size={17} /> {t.patients_new}
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
          className={`${inputCls} h-12 max-w-md`}
        />
      </form>

      <Card>
        {patients.length === 0 ? (
          q ? (
            <EmptyState>{t.patients_no_match}</EmptyState>
          ) : (
            <EmptyState
              action={
                <PrimaryLink href={`/c/${slug}/patients/new`}>
                  <UserPlus size={17} /> {t.patients_new}
                </PrimaryLink>
              }
            >
              {t.patients_empty_help}
            </EmptyState>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="border-b border-black/[.07] text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">{t.patient_last_name}</th>
                  <th className="px-5 py-3.5 font-medium">{t.patient_amka}</th>
                  <th className="px-5 py-3.5 font-medium">{t.patient_phone}</th>
                  <th className="px-5 py-3.5 font-medium">{t.patient_since}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[.05]">
                {patients.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-mist/60">
                    <td className="p-0">
                      <Link
                        href={`/c/${slug}/patients/${p.id}`}
                        className="block px-5 py-4 font-medium outline-none group-hover:text-brand-700 focus-visible:bg-brand-50"
                      >
                        {p.lastName} {p.firstName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-ink/65">{p.amka ?? t.not_recorded}</td>
                    <td className="px-5 py-4 tabular-nums text-ink/65">
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} className="hover:text-brand-700">{p.phone}</a>
                      ) : (
                        t.not_recorded
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">{date(p.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {t.patients_showing} {(current - 1) * PATIENTS_PER_PAGE + 1}
            {"–"}
            {Math.min(current * PATIENTS_PER_PAGE, total)} {t.patients_of} {total}
          </p>
          <div className="flex gap-2">
            {current > 1 && (
              <Link
                href={pageHref(current - 1)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-black/12 bg-white px-4 text-sm font-medium transition hover:bg-mist"
              >
                <ChevronLeft size={16} /> {t.page_prev}
              </Link>
            )}
            {current < pages && (
              <Link
                href={pageHref(current + 1)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-black/12 bg-white px-4 text-sm font-medium transition hover:bg-mist"
              >
                {t.page_next} <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

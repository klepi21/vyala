import { notFound } from "next/navigation";
import { requireClinic } from "@/lib/tenancy";
import { getInvoice } from "@/lib/queries";
import { LogoMark } from "@/components/Logo";
import { PrintButton } from "@/components/PrintButton";
import { longDate, money } from "@/lib/format";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { clinic, t, locale } = await requireClinic(slug);

  const result = await getInvoice(clinic.id, id);
  if (!result) notFound();
  const { invoice, patient } = result;

  return (
    <div className="mx-auto max-w-xl bg-white p-8 print:p-0">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton label={t.print} />
      </div>

      <header className="mb-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-semibold">{clinic.name}</p>
            <p className="text-xs text-muted">
              {[clinic.address, clinic.city].filter(Boolean).join(", ")}
              {clinic.phone ? ` · ${clinic.phone}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{t.inv_doc_title} {invoice.number}</p>
          <p className="text-sm text-muted">{longDate(invoice.issuedAt, locale)}</p>
        </div>
      </header>

      {patient && (
        <section className="mb-8 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.appt_patient}</p>
          <p className="mt-1 font-medium">{patient.lastName} {patient.firstName}</p>
          {patient.amka && <p className="text-ink/60">{t.patient_amka}: {patient.amka}</p>}
          {patient.address && <p className="text-ink/60">{patient.address}</p>}
        </section>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/20 text-left text-xs uppercase tracking-wide text-muted">
            <th className="py-2 font-medium">{t.inv_note}</th>
            <th className="py-2 text-right font-medium">{t.inv_amount}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black/10">
            <td className="py-3">{invoice.note || t.inv_default_line}</td>
            <td className="py-3 text-right tabular-nums">{money(invoice.amount, locale)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="py-3 font-semibold">{t.total}</td>
            <td className="py-3 text-right text-lg font-semibold tabular-nums">
              {money(invoice.amount, locale)}
            </td>
          </tr>
        </tfoot>
      </table>

      <footer className="mt-16 border-t border-black/10 pt-3 text-xs text-muted">
        {clinic.name} · vyala.app
      </footer>
    </div>
  );
}

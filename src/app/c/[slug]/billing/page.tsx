import { requireClinic } from "@/lib/tenancy";
import { billingTotals, listExpenses, listInvoices, listPayments, patientOptions } from "@/lib/queries";
import {
  createExpense, createInvoice, createPayment, deleteExpense,
  markInvoicePaid, markInvoiceIssued, quickAddPatient,
} from "@/lib/actions";
import { BillingView, type BillingTab } from "@/components/BillingView";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const { clinic, locale, t } = await requireClinic(slug);
  const current: BillingTab =
    tab === "invoices" || tab === "expenses" ? tab : "payments";

  const [payments, invoices, expenses, patients, totals] = await Promise.all([
    listPayments(clinic.id),
    listInvoices(clinic.id),
    listExpenses(clinic.id),
    patientOptions(clinic.id),
    billingTotals(clinic.id),
  ]);

  return (
    <BillingView
      base={`/c/${slug}`}
      tab={current}
      t={t}
      locale={locale}
      payments={payments}
      invoices={invoices}
      expenses={expenses}
      patients={patients}
      totals={totals}
      printable
      actions={{
        createPayment: createPayment.bind(null, slug),
        createInvoice: createInvoice.bind(null, slug),
        createExpense: createExpense.bind(null, slug),
        quickAddPatient: quickAddPatient.bind(null, slug),
        setInvoicePaid: async (id: string) => {
          "use server";
          await markInvoicePaid(slug, id);
        },
        setInvoiceIssued: async (id: string) => {
          "use server";
          await markInvoiceIssued(slug, id);
        },
        deleteExpense: async (id: string) => {
          "use server";
          await deleteExpense(slug, id);
        },
      }}
    />
  );
}

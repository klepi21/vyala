import { demoContext } from "@/lib/demo";
import { billingTotals, listExpenses, listInvoices, listPayments, patientOptions } from "@/lib/queries";
import {
  demoCreateExpense, demoCreateInvoice, demoCreatePayment, demoDeleteExpense,
  demoQuickAddPatient, demoSetInvoiceStatus,
} from "@/lib/demo-actions";
import { BillingView, type BillingTab } from "@/components/BillingView";

export const metadata = { title: "Live demo, money" };

export default async function DemoBilling({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const { clinic, locale, t } = await demoContext();
  const current: BillingTab = tab === "invoices" || tab === "expenses" ? tab : "payments";

  const [payments, invoices, expenses, patients, totals] = await Promise.all([
    listPayments(clinic.id),
    listInvoices(clinic.id),
    listExpenses(clinic.id),
    patientOptions(clinic.id),
    billingTotals(clinic.id),
  ]);

  return (
    <BillingView
      base="/demo"
      tab={current}
      t={t}
      locale={locale}
      payments={payments}
      invoices={invoices}
      expenses={expenses}
      patients={patients}
      totals={totals}
      printable={false}
      actions={{
        createPayment: demoCreatePayment,
        createInvoice: demoCreateInvoice,
        createExpense: demoCreateExpense,
        quickAddPatient: demoQuickAddPatient,
        setInvoicePaid: async (id: string) => {
          "use server";
          await demoSetInvoiceStatus(id, "paid");
        },
        setInvoiceIssued: async (id: string) => {
          "use server";
          await demoSetInvoiceStatus(id, "issued");
        },
        deleteExpense: demoDeleteExpense,
      }}
    />
  );
}

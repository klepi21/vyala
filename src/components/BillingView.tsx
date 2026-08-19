import { CheckCircle2, Printer, RotateCcw, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm } from "@/components/ActionForm";
import { PatientPicker, type PatientOption } from "@/components/PatientPicker";
import {
  Badge, Card, EmptyState, Field, Input, MoneyInput, PageTitle, Panel,
  Select, Tabs, Textarea,
} from "@/components/ui";
import { date, money } from "@/lib/format";
import { clinicToday } from "@/lib/time";
import type { Dict } from "@/lib/i18n";
import type { Expense, Invoice, Payment } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import type { FormState } from "@/lib/form-state";

export type BillingTab = "payments" | "invoices" | "expenses";

export interface BillingActions {
  createPayment: (prev: FormState, fd: FormData) => Promise<FormState>;
  createInvoice: (prev: FormState, fd: FormData) => Promise<FormState>;
  createExpense: (prev: FormState, fd: FormData) => Promise<FormState>;
  quickAddPatient: (fd: FormData) => Promise<{ id: string; name: string } | void>;
  setInvoicePaid: (id: string) => Promise<void>;
  setInvoiceIssued: (id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export function BillingView({
  base,
  tab,
  t,
  locale,
  payments,
  invoices,
  expenses,
  patients,
  totals,
  actions,
  printable,
}: {
  base: string;
  tab: BillingTab;
  t: Dict;
  locale: Locale;
  payments: Payment[];
  invoices: Invoice[];
  expenses: Expense[];
  patients: PatientOption[];
  totals: { earned: number; spent: number; net: number; unpaidTotal: number; unpaidCount: number };
  actions: BillingActions;
  printable: boolean;
}) {
  const pickerLabels = {
    placeholder: t.select_placeholder,
    search: t.picker_search,
    noMatch: t.patients_no_match,
    addNew: t.picker_add_new,
    firstName: t.patient_first_name,
    lastName: t.patient_last_name,
    phone: t.patient_phone,
    save: t.save,
    cancel: t.cancel,
    none: t.no_patient_linked,
    nameRequired: t.picker_name_required,
  };

  const methodLabel: Record<string, string> = {
    cash: t.pay_method_cash, card: t.pay_method_card,
    bank_transfer: t.pay_method_bank, other: t.pay_method_other,
  };
  const methodTone: Record<string, string> = {
    cash: "green", card: "blue", bank_transfer: "amber", other: "gray",
  };
  const catLabel: Record<string, string> = {
    rent: t.exp_rent, salaries: t.exp_salaries, supplies: t.exp_supplies,
    equipment: t.exp_equipment, utilities: t.exp_utilities,
    insurance: t.exp_insurance, marketing: t.exp_marketing, other: t.exp_other,
  };

  return (
    <div>
      <PageTitle title={t.billing_title} description={t.billing_subtitle} />

      {/* Money in, money out, and what is still owed, side by side */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          label={t.billing_in_month}
          value={money(totals.earned, locale)}
          icon={<TrendingUp size={15} />}
          tone="green"
        />
        <SummaryTile
          label={t.billing_out_month}
          value={money(totals.spent, locale)}
          icon={<TrendingDown size={15} />}
          tone="amber"
        />
        <SummaryTile
          label={t.billing_net_month}
          value={money(totals.net, locale)}
          icon={<Wallet size={15} />}
          tone={totals.net >= 0 ? "green" : "red"}
          strong
        />
        <SummaryTile
          label={t.billing_owed}
          value={money(totals.unpaidTotal, locale)}
          hint={`${totals.unpaidCount} ${t.inv_title.toLowerCase()}`}
          icon={<CheckCircle2 size={15} />}
          tone={totals.unpaidCount > 0 ? "amber" : "gray"}
        />
      </div>

      <Tabs
        current={tab}
        items={[
          { key: "payments", href: `${base}/billing`, label: t.pay_title, count: payments.length },
          { key: "invoices", href: `${base}/billing?tab=invoices`, label: t.inv_title, count: invoices.length },
          { key: "expenses", href: `${base}/billing?tab=expenses`, label: t.exp_title, count: expenses.length },
        ]}
      />

      {tab === "payments" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            {payments.length === 0 ? (
              <EmptyState>{t.pay_empty}</EmptyState>
            ) : (
              <Table
                head={[t.date, t.appt_patient, t.pay_method, t.pay_amount]}
                alignLast
                rows={payments.map((p) => [
                  <span key="d" className="text-ink/65">{date(p.paidAt, locale)}</span>,
                  <span key="p">
                    {p.patientName ?? <span className="text-muted">{t.no_patient_linked}</span>}
                    {p.note && <span className="ml-2 text-xs text-muted">{p.note}</span>}
                  </span>,
                  <Badge key="m" tone={methodTone[p.method]}>{methodLabel[p.method]}</Badge>,
                  <span key="a" className="font-semibold tabular-nums">{money(p.amount, locale)}</span>,
                ])}
              />
            )}
          </Card>

          <Panel title={t.pay_new} description={t.pay_new_hint} className="h-fit">
            <ActionForm action={actions.createPayment} submitLabel={t.pay_save} savingLabel={t.saving}>
              <Field label={t.pay_amount} required>
                <MoneyInput name="amount" required placeholder="0.00" />
              </Field>
              <Field label={t.pay_method} hint={t.pay_method_hint}>
                <Select name="method" defaultValue="cash">
                  <option value="cash">{t.pay_method_cash}</option>
                  <option value="card">{t.pay_method_card}</option>
                  <option value="bank_transfer">{t.pay_method_bank}</option>
                  <option value="other">{t.pay_method_other}</option>
                </Select>
              </Field>
              <Field label={t.appt_patient} optional={`(${t.optional})`}>
                <PatientPicker
                  name="patient_id"
                  patients={patients}
                  quickAdd={actions.quickAddPatient}
                  labels={pickerLabels}
                />
              </Field>
              <Field label={t.pay_date}>
                <Input name="paid_at" type="date" defaultValue={clinicToday()} />
              </Field>
              <Field label={t.pay_note} optional={`(${t.optional})`}>
                <Textarea name="note" className="min-h-16" placeholder={t.pay_note_placeholder} />
              </Field>
            </ActionForm>
          </Panel>
        </div>
      )}

      {tab === "invoices" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            {invoices.length === 0 ? (
              <EmptyState>{t.inv_empty}</EmptyState>
            ) : (
              <Table
                head={[t.inv_number, t.appt_patient, t.inv_issued_at, t.inv_status, t.inv_amount, ""]}
                alignLast
                rows={invoices.map((inv) => [
                  <span key="n" className="font-medium tabular-nums">{inv.number}</span>,
                  <span key="p">{inv.patientName ?? <span className="text-muted">{t.no_patient_linked}</span>}</span>,
                  <span key="d" className="text-ink/65">{date(inv.issuedAt, locale)}</span>,
                  <Badge key="s" tone={inv.status === "paid" ? "green" : "amber"}>
                    {inv.status === "paid" ? t.inv_status_paid : t.inv_status_issued}
                  </Badge>,
                  <span key="a" className="font-semibold tabular-nums">{money(inv.amount, locale)}</span>,
                  <span key="x" className="flex justify-end gap-1">
                    {printable && (
                      <Link
                        href={`${base}/invoices/${inv.id}/print`}
                        className="rounded-lg p-2 text-muted transition hover:bg-mist hover:text-ink"
                        title={t.inv_print}
                        aria-label={t.inv_print}
                      >
                        <Printer size={15} />
                      </Link>
                    )}
                    {inv.status === "paid" ? (
                      <form action={actions.setInvoiceIssued.bind(null, inv.id)}>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-muted transition hover:bg-mist hover:text-ink"
                          title={t.inv_mark_unpaid}
                        >
                          <RotateCcw size={14} /> {t.inv_mark_unpaid}
                        </button>
                      </form>
                    ) : (
                      <form action={actions.setInvoicePaid.bind(null, inv.id)}>
                        <button className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100">
                          <CheckCircle2 size={14} /> {t.inv_mark_paid}
                        </button>
                      </form>
                    )}
                  </span>,
                ])}
              />
            )}
          </Card>

          <Panel title={t.inv_new} description={t.inv_new_hint} className="h-fit">
            <ActionForm action={actions.createInvoice} submitLabel={t.inv_save} savingLabel={t.saving}>
              <Field label={t.inv_amount} required>
                <MoneyInput name="amount" required placeholder="0.00" />
              </Field>
              <Field label={t.appt_patient} optional={`(${t.optional})`}>
                <PatientPicker
                  name="patient_id"
                  patients={patients}
                  quickAdd={actions.quickAddPatient}
                  labels={pickerLabels}
                />
              </Field>
              <Field label={t.inv_issued_at}>
                <Input name="issued_at" type="date" defaultValue={clinicToday()} />
              </Field>
              <Field label={t.inv_note} hint={t.inv_note_hint}>
                <Textarea name="note" className="min-h-16" placeholder={t.inv_default_line} />
              </Field>
            </ActionForm>
          </Panel>
        </div>
      )}

      {tab === "expenses" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            {expenses.length === 0 ? (
              <EmptyState>{t.exp_empty}</EmptyState>
            ) : (
              <Table
                head={[t.date, t.exp_category, t.exp_supplier, t.exp_amount, ""]}
                alignLast
                rows={expenses.map((e) => [
                  <span key="d" className="text-ink/65">{date(e.spentAt, locale)}</span>,
                  <Badge key="c" tone="purple">{catLabel[e.category] ?? e.category}</Badge>,
                  <span key="s">
                    {e.supplier ?? <span className="text-muted">{t.not_recorded}</span>}
                    {e.note && <span className="ml-2 text-xs text-muted">{e.note}</span>}
                  </span>,
                  <span key="a" className="font-semibold tabular-nums">{money(e.amount, locale)}</span>,
                  <span key="x" className="flex justify-end">
                    <form action={actions.deleteExpense.bind(null, e.id)}>
                      <ConfirmButton title={t.delete} confirmLabel={t.confirm_delete} cancelLabel={t.keep}>
                        <Trash2 size={15} />
                      </ConfirmButton>
                    </form>
                  </span>,
                ])}
              />
            )}
          </Card>

          <Panel title={t.exp_new} description={t.exp_new_hint} className="h-fit">
            <ActionForm action={actions.createExpense} submitLabel={t.exp_save} savingLabel={t.saving}>
              <Field label={t.exp_amount} required>
                <MoneyInput name="amount" required placeholder="0.00" />
              </Field>
              <Field label={t.exp_category} hint={t.exp_category_hint}>
                <Select name="category" defaultValue="supplies">
                  <option value="rent">{t.exp_rent}</option>
                  <option value="salaries">{t.exp_salaries}</option>
                  <option value="supplies">{t.exp_supplies}</option>
                  <option value="equipment">{t.exp_equipment}</option>
                  <option value="utilities">{t.exp_utilities}</option>
                  <option value="insurance">{t.exp_insurance}</option>
                  <option value="marketing">{t.exp_marketing}</option>
                  <option value="other">{t.exp_other}</option>
                </Select>
              </Field>
              <Field label={t.exp_supplier} optional={`(${t.optional})`}>
                <Input name="supplier" placeholder={t.exp_supplier_placeholder} />
              </Field>
              <Field label={t.exp_date}>
                <Input name="spent_at" type="date" defaultValue={clinicToday()} />
              </Field>
              <Field label={t.pay_note} optional={`(${t.optional})`}>
                <Textarea name="note" className="min-h-16" />
              </Field>
            </ActionForm>
          </Panel>
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  icon,
  tone,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: "green" | "amber" | "red" | "gray";
  strong?: boolean;
}) {
  const tones: Record<string, string> = {
    green: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-black/[.05] text-ink/55",
  };
  return (
    <Card className={`p-4 ${strong ? "ring-1 ring-brand-200" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className={`rounded-lg p-1.5 ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-2.5 text-xl font-semibold tabular-nums leading-none">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

function Table({
  head,
  rows,
  alignLast,
}: {
  head: string[];
  rows: React.ReactNode[][];
  alignLast?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/[.07] text-left text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th
                key={i}
                className={`px-5 py-3 font-medium ${alignLast && i >= head.length - 2 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[.05]">
          {rows.map((r, ri) => (
            <tr key={ri} className="transition hover:bg-mist/50">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-5 py-3.5 ${alignLast && ci >= r.length - 2 ? "text-right" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

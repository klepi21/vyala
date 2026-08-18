import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, FileText, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitBar } from "@/components/SubmitBar";
import { requireClinic } from "@/lib/tenancy";
import { getPatient, listDocuments, listPayments, listVisits } from "@/lib/queries";
import { createVisit, deleteDocument, uploadDocument } from "@/lib/actions";
import {
  Badge, Card, CardHeader, EmptyState, Field, GhostLink, Input,
  Textarea,
} from "@/components/ui";
import { date, money } from "@/lib/format";

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug, id } = await params;
  const { tab = "overview" } = await searchParams;
  const { clinic, t, locale } = await requireClinic(slug);

  const patient = await getPatient(clinic.id, id);
  if (!patient) notFound();

  const [visits, docs, payments] = await Promise.all([
    listVisits(clinic.id, id),
    listDocuments(clinic.id, id),
    listPayments(clinic.id, id),
  ]);

  const renderedAt = new Date().getTime();
  const age = patient.birthDate
    ? Math.floor((renderedAt - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const tabs = [
    { key: "overview", label: t.patient_overview },
    { key: "visits", label: `${t.patient_visits} (${visits.length})` },
    { key: "documents", label: `${t.patient_documents} (${docs.length})` },
    { key: "payments", label: `${t.patient_payments} (${payments.length})` },
  ];

  const methodLabel: Record<string, string> = {
    cash: t.pay_method_cash,
    card: t.pay_method_card,
    bank_transfer: t.pay_method_bank,
    other: t.pay_method_other,
  };

  const newVisit = createVisit.bind(null, slug, id);
  const upload = uploadDocument.bind(null, slug, id);

  return (
    <div>
      <Link
        href={`/c/${slug}/patients`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} /> {t.back_to_patients}
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {patient.lastName} {patient.firstName}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {patient.amka && (
              <span className="mr-3">
                {t.patient_amka}: <span className="tabular-nums">{patient.amka}</span>
              </span>
            )}
            {age !== null && <span className="mr-3">{t.patient_age}: {age}</span>}
            {patient.phone && <span className="tabular-nums">{patient.phone}</span>}
          </p>
          {patient.allergies && (
            <p className="mt-1.5">
              <Badge tone="red">{t.patient_allergies}: {patient.allergies}</Badge>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <GhostLink href={`/c/${slug}/patients/${id}/print`}>
            <FileDown size={15} /> {t.patient_export}
          </GhostLink>
          <GhostLink href={`/c/${slug}/patients/${id}/edit`}>
            <Pencil size={15} /> {t.patient_edit}
          </GhostLink>
        </div>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-black/[.04] p-1 text-sm">
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`/c/${slug}/patients/${id}?tab=${item.key}`}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 font-medium transition ${
              tab === item.key ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "overview" && (
        <Card className="max-w-2xl p-5">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              [t.patient_email, patient.email],
              [t.patient_birth_date, patient.birthDate ? date(patient.birthDate, locale) : null],
              [t.patient_address, patient.address],
              [t.patient_since, date(patient.createdAt, locale)],
              [t.patient_notes, patient.notes],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs font-medium text-muted">{label}</dt>
                <dd className="mt-0.5 text-ink/85">{value || t.not_recorded}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {tab === "visits" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {visits.length === 0 ? (
              <Card><EmptyState>{t.visit_empty}</EmptyState></Card>
            ) : (
              visits.map((v) => (
                <Card key={v.id} className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">{date(v.visitDate, locale)}</p>
                    {v.doctorName && <p className="text-xs text-muted">{v.doctorName}</p>}
                  </div>
                  <dl className="space-y-2 text-sm">
                    {[
                      [t.visit_symptoms, v.symptoms],
                      [t.visit_diagnosis, v.diagnosis],
                      [t.visit_treatment, v.treatment],
                      [t.visit_notes, v.notes],
                    ]
                      .filter(([, val]) => val)
                      .map(([label, val]) => (
                        <div key={label as string}>
                          <dt className="text-xs font-medium text-muted">{label}</dt>
                          <dd className="whitespace-pre-wrap text-ink/85">{val}</dd>
                        </div>
                      ))}
                  </dl>
                </Card>
              ))
            )}
          </div>
          <Card className="h-fit p-5">
            <h3 className="mb-3 text-sm font-semibold">{t.visit_new}</h3>
            <form action={newVisit} className="space-y-3">
              <Field label={t.visit_date}>
                <Input name="visit_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </Field>
              <Field label={t.visit_symptoms}><Textarea name="symptoms" className="min-h-14" /></Field>
              <Field label={t.visit_diagnosis}><Textarea name="diagnosis" className="min-h-14" /></Field>
              <Field label={t.visit_treatment}><Textarea name="treatment" className="min-h-14" /></Field>
              <Field label={t.visit_notes}><Textarea name="notes" className="min-h-14" /></Field>
              <SubmitBar label={t.visit_save} savingLabel={t.saving} />
            </form>
          </Card>
        </div>
      )}

      {tab === "documents" && (
        <div className="max-w-2xl space-y-4">
          <Card className="p-5">
            <form action={upload} className="flex flex-wrap items-end gap-3">
              <Field label={t.doc_upload} className="min-w-60 flex-1">
                <input
                  type="file"
                  name="file"
                  required
                  className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-800 hover:file:bg-brand-200"
                />
              </Field>
              <SubmitBar label={t.doc_upload} savingLabel={t.doc_uploading} className="min-w-44" />
            </form>
          </Card>
          <Card>
            {docs.length === 0 ? (
              <EmptyState>{t.doc_empty}</EmptyState>
            ) : (
              <ul className="divide-y divide-black/[.05]">
                {docs.map((d) => {
                  const del = deleteDocument.bind(null, slug, d.id);
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileText size={17} className="shrink-0 text-muted" />
                        <div className="min-w-0">
                          <a
                            href={`/c/${slug}/documents/${d.id}`}
                            target="_blank"
                            className="block truncate font-medium hover:text-brand-700"
                          >
                            {d.fileName}
                          </a>
                          <p className="text-xs text-muted">
                            {date(d.createdAt, locale)}
                            {d.sizeBytes ? ` · ${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}
                          </p>
                        </div>
                      </div>
                      <form action={del}>
                        <ConfirmButton
                          title={t.doc_delete}
                          confirmLabel={t.confirm_delete}
                          cancelLabel={t.keep}
                        >
                          <Trash2 size={15} />
                        </ConfirmButton>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === "payments" && (
        <Card className="max-w-2xl">
          <CardHeader title={t.patient_payments} />
          {payments.length === 0 ? (
            <EmptyState>{t.pay_empty}</EmptyState>
          ) : (
            <ul className="divide-y divide-black/[.05] px-5 pb-3">
              {payments.map((pay) => (
                <li key={pay.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink/60">
                    {date(pay.paidAt, locale)}
                    <span className="ml-2 text-xs text-muted">{methodLabel[pay.method]}</span>
                  </span>
                  <span className="font-medium tabular-nums">{money(pay.amount, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

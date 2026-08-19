import { notFound } from "next/navigation";
import { demoContext } from "@/lib/demo";
import { getPatient, listPayments, listVisits } from "@/lib/queries";
import {
  Badge, Card, CardHeader, EmptyState, Field, Input, Textarea,
} from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { demoCreateVisit } from "@/lib/demo-actions";
import { date, money } from "@/lib/format";
import { clinicToday } from "@/lib/time";

export const metadata = { title: "Live demo, patient record" };

export default async function DemoPatient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinic, locale, t } = await demoContext();

  const patient = await getPatient(clinic.id, id);
  if (!patient) notFound();
  const [visits, payments] = await Promise.all([
    listVisits(clinic.id, id),
    listPayments(clinic.id, id),
  ]);

  const renderedAt = new Date().getTime();
  const age = patient.birthDate
    ? Math.floor((renderedAt - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const newVisit = demoCreateVisit.bind(null, id);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">
          {patient.lastName} {patient.firstName}
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          {patient.amka && <span className="mr-3">{t.patient_amka}: {patient.amka}</span>}
          {age !== null && <span className="mr-3">{t.patient_age}: {age}</span>}
          {patient.phone && <span className="tabular-nums">{patient.phone}</span>}
        </p>
        {patient.allergies && (
          <p className="mt-1.5">
            <Badge tone="red">{t.patient_allergies}: {patient.allergies}</Badge>
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink/70">{t.patient_visits}</h2>
          {visits.length === 0 ? (
            <Card><EmptyState>{t.visit_empty}</EmptyState></Card>
          ) : (
            visits.slice(0, 8).map((v) => (
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
                  ]
                    .filter(([, val]) => val)
                    .map(([label, val]) => (
                      <div key={label as string}>
                        <dt className="text-xs font-medium text-muted">{label}</dt>
                        <dd className="text-ink/85">{val}</dd>
                      </div>
                    ))}
                </dl>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">{t.visit_new}</h3>
          <ActionForm action={newVisit} submitLabel={t.visit_save} savingLabel={t.saving} className="space-y-3">
            <Field label={t.visit_date}>
              <Input name="visit_date" type="date" defaultValue={clinicToday()} />
            </Field>
            <Field label={t.visit_symptoms}><Textarea name="symptoms" className="min-h-14" /></Field>
            <Field label={t.visit_diagnosis}><Textarea name="diagnosis" className="min-h-14" /></Field>
            <Field label={t.visit_treatment}><Textarea name="treatment" className="min-h-14" /></Field>
          </ActionForm>
        </Card>

        <Card className="h-fit">
          <CardHeader title={t.patient_payments} />
          {payments.length === 0 ? (
            <EmptyState>{t.pay_empty}</EmptyState>
          ) : (
            <ul className="divide-y divide-black/[.05] px-5 pb-3">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink/60">{date(p.paidAt, locale)}</span>
                  <span className="font-medium tabular-nums">{money(p.amount, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}

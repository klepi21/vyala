import { notFound } from "next/navigation";
import { requireClinic } from "@/lib/tenancy";
import { getPatient, listVisits } from "@/lib/queries";
import { LogoMark } from "@/components/Logo";
import { PrintButton } from "@/components/PrintButton";
import { longDate } from "@/lib/format";

export default async function PatientPrintPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { clinic, t, locale } = await requireClinic(slug);

  const patient = await getPatient(clinic.id, id);
  if (!patient) notFound();
  const visits = await listVisits(clinic.id, id);

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton label={t.patient_export} />
      </div>

      <header className="mb-8 flex items-start justify-between border-b border-black/10 pb-5">
        <div>
          <h1 className="text-2xl font-semibold">{patient.lastName} {patient.firstName}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {patient.amka && <>{t.patient_amka}: {patient.amka} · </>}
            {patient.birthDate && <>{t.patient_birth_date}: {longDate(patient.birthDate, locale)}</>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-sm font-semibold">{clinic.name}</p>
            <p className="text-xs text-muted">{clinic.phone}</p>
          </div>
          <LogoMark size={30} />
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {[
          [t.patient_phone, patient.phone],
          [t.patient_email, patient.email],
          [t.patient_address, patient.address],
          [t.patient_allergies, patient.allergies],
          [t.patient_notes, patient.notes],
        ]
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
              <p>{value}</p>
            </div>
          ))}
      </section>

      <h2 className="mb-3 text-lg font-semibold">{t.patient_visits}</h2>
      {visits.length === 0 ? (
        <p className="text-sm text-muted">{t.visit_empty}</p>
      ) : (
        <div className="space-y-5">
          {visits.map((v) => (
            <article key={v.id} className="break-inside-avoid rounded-lg border border-black/10 p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{longDate(v.visitDate, locale)}</span>
                {v.doctorName && <span className="text-muted">{v.doctorName}</span>}
              </div>
              {[
                [t.visit_symptoms, v.symptoms],
                [t.visit_diagnosis, v.diagnosis],
                [t.visit_treatment, v.treatment],
                [t.visit_notes, v.notes],
              ]
                .filter(([, val]) => val)
                .map(([label, val]) => (
                  <p key={label as string} className="mb-1 text-sm">
                    <span className="font-medium text-ink/60">{label}: </span>
                    <span className="whitespace-pre-wrap">{val}</span>
                  </p>
                ))}
            </article>
          ))}
        </div>
      )}

      <footer className="mt-10 border-t border-black/10 pt-3 text-xs text-muted">
        {clinic.name} · vyala.app
      </footer>
    </div>
  );
}

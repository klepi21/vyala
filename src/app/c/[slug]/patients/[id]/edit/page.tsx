import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireClinic } from "@/lib/tenancy";
import { getPatient } from "@/lib/queries";
import { updatePatient } from "@/lib/actions";
import { PatientForm } from "@/components/PatientForm";
import { PageTitle } from "@/components/ui";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { clinic, t } = await requireClinic(slug);
  const patient = await getPatient(clinic.id, id);
  if (!patient) notFound();
  const action = updatePatient.bind(null, slug, id);
  return (
    <div>
      <Link
        href={`/c/${slug}/patients/${id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} /> {patient.lastName} {patient.firstName}
      </Link>
      <PageTitle title={t.patient_edit} description={t.patient_edit_hint} />
      <PatientForm t={t} action={action} patient={patient} />
    </div>
  );
}

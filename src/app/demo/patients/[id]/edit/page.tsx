import { notFound } from "next/navigation";
import { demoContext } from "@/lib/demo";
import { getPatient } from "@/lib/queries";
import { demoUpdatePatient } from "@/lib/demo-actions";
import { PatientForm } from "@/components/PatientForm";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Live demo, edit patient" };

export default async function DemoEditPatient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clinic, t } = await demoContext();
  const patient = await getPatient(clinic.id, id);
  if (!patient) notFound();
  return (
    <div>
      <PageTitle title={`${t.patient_edit}: ${patient.lastName} ${patient.firstName}`} />
      <PatientForm t={t} action={demoUpdatePatient.bind(null, id)} patient={patient} />
    </div>
  );
}

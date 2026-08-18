import { requireClinic } from "@/lib/tenancy";
import { createPatient } from "@/lib/actions";
import { PatientForm } from "@/components/PatientForm";
import { PageTitle } from "@/components/ui";

export default async function NewPatientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t } = await requireClinic(slug);
  const action = createPatient.bind(null, slug);
  return (
    <div>
      <PageTitle title={t.patients_new} />
      <PatientForm t={t} action={action} />
    </div>
  );
}

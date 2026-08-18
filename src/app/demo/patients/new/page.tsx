import { demoContext } from "@/lib/demo";
import { demoCreatePatient } from "@/lib/demo-actions";
import { PatientForm } from "@/components/PatientForm";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Live demo, new patient" };

export default async function DemoNewPatient() {
  const { t } = await demoContext();
  return (
    <div>
      <PageTitle title={t.patients_new} />
      <PatientForm t={t} action={demoCreatePatient} />
    </div>
  );
}

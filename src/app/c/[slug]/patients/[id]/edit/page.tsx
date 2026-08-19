import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireClinic } from "@/lib/tenancy";
import { getPatient } from "@/lib/queries";
import { deletePatient, updatePatient } from "@/lib/actions";
import { PatientForm } from "@/components/PatientForm";
import { Panel, PageTitle } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Trash2 } from "lucide-react";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { clinic, member, t } = await requireClinic(slug);
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

      {member.role === "admin" && (
        <Panel
          title={t.patient_delete}
          description={t.patient_delete_hint}
          className="mt-6 max-w-2xl border-red-200"
        >
          <form action={deletePatient.bind(null, slug, id)}>
            <ConfirmButton
              title={t.patient_delete}
              confirmLabel={t.confirm_delete}
              cancelLabel={t.keep}
            >
              <Trash2 size={17} />
            </ConfirmButton>
          </form>
        </Panel>
      )}
    </div>
  );
}

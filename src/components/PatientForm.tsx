import { Field, Input, Panel, Textarea } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import type { FormState } from "@/lib/form-state";
import type { Dict } from "@/lib/i18n";
import type { Patient } from "@/lib/types";

/**
 * Grouped into who they are, how to reach them, and what matters clinically,
 * so the form reads as three short questions rather than one long wall.
 */
export function PatientForm({
  t,
  action,
  patient,
}: {
  t: Dict;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  patient?: Patient;
}) {
  return (
    <ActionForm
      action={action}
      submitLabel={t.patient_save}
      savingLabel={t.saving}
      className="max-w-2xl space-y-4"
    >
      <Panel title={t.pf_identity} description={t.pf_identity_hint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.patient_first_name} required>
            <Input name="first_name" required autoComplete="given-name" defaultValue={patient?.firstName} />
          </Field>
          <Field label={t.patient_last_name} required>
            <Input name="last_name" required autoComplete="family-name" defaultValue={patient?.lastName} />
          </Field>
          <Field label={t.patient_amka} hint={t.pf_amka_hint} optional={`(${t.optional})`}>
            <Input
              name="amka"
              inputMode="numeric"
              maxLength={11}
              placeholder="11 digits"
              defaultValue={patient?.amka ?? ""}
            />
          </Field>
          <Field label={t.patient_birth_date} optional={`(${t.optional})`}>
            <Input name="birth_date" type="date" defaultValue={patient?.birthDate ?? ""} />
          </Field>
        </div>
      </Panel>

      <Panel title={t.pf_contact} description={t.pf_contact_hint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.patient_phone} optional={`(${t.optional})`}>
            <Input name="phone" type="tel" autoComplete="tel" defaultValue={patient?.phone ?? ""} />
          </Field>
          <Field label={t.patient_email} optional={`(${t.optional})`}>
            <Input name="email" type="email" autoComplete="email" defaultValue={patient?.email ?? ""} />
          </Field>
          <Field label={t.patient_address} className="sm:col-span-2" optional={`(${t.optional})`}>
            <Input name="address" defaultValue={patient?.address ?? ""} />
          </Field>
        </div>
      </Panel>

      <Panel title={t.pf_clinical} description={t.pf_clinical_hint}>
        <div className="space-y-4">
          <Field label={t.patient_allergies} hint={t.pf_allergies_hint} optional={`(${t.optional})`}>
            <Input name="allergies" placeholder={t.pf_allergies_placeholder} defaultValue={patient?.allergies ?? ""} />
          </Field>
          <Field label={t.patient_notes} optional={`(${t.optional})`}>
            <Textarea name="notes" placeholder={t.pf_notes_placeholder} defaultValue={patient?.notes ?? ""} />
          </Field>
        </div>
      </Panel>

    </ActionForm>
  );
}

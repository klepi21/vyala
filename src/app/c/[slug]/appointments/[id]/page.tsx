import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireClinic } from "@/lib/tenancy";
import { doctorOptions, getAppointment, patientOptions } from "@/lib/queries";
import { quickAddPatient, updateAppointment } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";
import { PatientPicker } from "@/components/PatientPicker";
import { Field, Input, PageTitle, Panel, Select } from "@/components/ui";
import { clinicYmd } from "@/lib/time";
import { time } from "@/lib/format";

/** Move or amend a booking without cancelling and re-creating it. */
export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { clinic, locale, t } = await requireClinic(slug);

  const appointment = await getAppointment(clinic.id, id);
  if (!appointment) notFound();

  const [patients, doctors] = await Promise.all([
    patientOptions(clinic.id),
    doctorOptions(clinic.id),
  ]);

  const dayYmd = clinicYmd(appointment.startsAt);
  const hhmm = time(appointment.startsAt, "en").replace(".", ":");

  return (
    <div>
      <Link
        href={`/c/${slug}/appointments?date=${dayYmd}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} /> {t.appt_title}
      </Link>

      <PageTitle title={t.appt_edit} description={t.appt_edit_hint} />

      <Panel title={appointment.patientName ?? t.appt_patient} className="max-w-2xl">
        <ActionForm
          action={updateAppointment.bind(null, slug, id)}
          submitLabel={t.appt_save_changes}
          savingLabel={t.saving}
        >
          <Field label={t.appt_patient} hint={t.appt_move_patient_hint}>
            <PatientPicker
              name="patient_id"
              patients={patients}
              initial={{ id: appointment.patientId, name: appointment.patientName ?? "" }}
              quickAdd={quickAddPatient.bind(null, slug)}
              labels={{
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
              }}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.appt_date} required>
              <Input name="date" type="date" required defaultValue={dayYmd} />
            </Field>
            <Field label={t.appt_time} required>
              <Input name="time" type="time" required defaultValue={hhmm} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.appt_duration}>
              <Input
                name="duration_min"
                type="number"
                min={5}
                max={480}
                step={5}
                defaultValue={appointment.durationMin}
              />
            </Field>
            <Field label={t.appt_doctor} hint={t.appt_doctor_hint}>
              <Select name="doctor_id" defaultValue={appointment.doctorId ?? ""}>
                <option value="">{t.any_doctor}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label={t.inv_status}>
            <Select name="status" defaultValue={appointment.status}>
              <option value="scheduled">{t.appt_status_scheduled}</option>
              <option value="completed">{t.appt_status_completed}</option>
              <option value="no_show">{t.appt_status_no_show}</option>
              <option value="cancelled">{t.appt_status_cancelled}</option>
            </Select>
          </Field>

          <Field label={t.appt_reason} optional={`(${t.optional})`}>
            <Input
              name="reason"
              defaultValue={appointment.reason ?? ""}
              placeholder={t.appt_reason_placeholder}
            />
          </Field>
        </ActionForm>
      </Panel>

      <p className="mt-3 max-w-2xl text-xs text-muted">{locale === "el" ? "" : ""}</p>
    </div>
  );
}

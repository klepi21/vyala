import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { requireClinic } from "@/lib/tenancy";
import { doctorOptions, listAppointments, patientOptions } from "@/lib/queries";
import { createAppointment, quickAddPatient, setAppointmentStatus } from "@/lib/actions";
import {
  Badge, Card, EmptyState, Field, GhostLink, Input, PageTitle,
  Select,
} from "@/components/ui";
import { PatientPicker } from "@/components/PatientPicker";
import { ActionForm } from "@/components/ActionForm";
import { time, weekday } from "@/lib/format";
import { clinicDayBounds, clinicToday, shiftYmd } from "@/lib/time";

const statusTone: Record<string, string> = {
  scheduled: "blue",
  completed: "green",
  cancelled: "gray",
  no_show: "amber",
};

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { clinic, t, locale } = await requireClinic(slug);

  const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "")
    ? sp.date!
    : clinicToday();
  const { from: dayStart, to: dayEnd } = clinicDayBounds(dateStr);
  const shift = (days: number) => shiftYmd(dateStr, days);

  const [appts, patients, doctors] = await Promise.all([
    listAppointments(clinic.id, dayStart, dayEnd),
    patientOptions(clinic.id),
    doctorOptions(clinic.id),
  ]);

  const statusLabel: Record<string, string> = {
    scheduled: t.appt_status_scheduled,
    completed: t.appt_status_completed,
    cancelled: t.appt_status_cancelled,
    no_show: t.appt_status_no_show,
  };

  const create = createAppointment.bind(null, slug);

  return (
    <div>
      <PageTitle title={t.appt_title} />

      <div className="mb-4 flex items-center gap-2">
        <GhostLink href={`/c/${slug}/appointments?date=${shift(-1)}`} className="!px-2.5">
          <ChevronLeft size={16} />
        </GhostLink>
        <span className="min-w-48 text-center text-sm font-semibold capitalize">
          {weekday(dayStart, locale)}
        </span>
        <GhostLink href={`/c/${slug}/appointments?date=${shift(1)}`} className="!px-2.5">
          <ChevronRight size={16} />
        </GhostLink>
        <GhostLink href={`/c/${slug}/appointments`}>{t.appt_today}</GhostLink>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          {appts.length === 0 ? (
            <EmptyState>{t.appt_empty}</EmptyState>
          ) : (
            <ul className="divide-y divide-black/[.05]">
              {appts.map((a) => {
                const complete = setAppointmentStatus.bind(null, slug, a.id, "completed");
                const cancel = setAppointmentStatus.bind(null, slug, a.id, "cancelled");
                return (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-14 text-sm font-semibold tabular-nums">
                      {time(a.startsAt, locale)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/c/${slug}/patients/${a.patientId}`}
                        className="text-sm font-medium hover:text-brand-700"
                      >
                        {a.patientName}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {a.durationMin} min
                        {a.reason ? ` · ${a.reason}` : ""}
                        {a.doctorName ? ` · ${a.doctorName}` : ""}
                      </p>
                    </div>
                    <Badge tone={statusTone[a.status]}>{statusLabel[a.status]}</Badge>
                    <div className="flex gap-1">
                      <Link
                        href={`/c/${slug}/appointments/${a.id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:bg-mist hover:text-ink"
                        title={t.appt_edit}
                        aria-label={t.appt_edit}
                      >
                        <Pencil size={16} />
                      </Link>
                    </div>
                    {a.status === "scheduled" && (
                      <div className="flex gap-1">
                        <form action={complete}>
                          <button
                            className="rounded-lg p-1.5 text-brand-700 transition hover:bg-brand-50"
                            title={t.appt_mark_completed}
                          >
                            <Check size={16} />
                          </button>
                        </form>
                        <form action={cancel}>
                          <button
                            className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600"
                            title={t.appt_mark_cancelled}
                          >
                            <X size={16} />
                          </button>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="mb-3 text-sm font-semibold">{t.appt_new}</h3>
          <ActionForm action={create} submitLabel={t.appt_save} savingLabel={t.saving} className="space-y-3">
            <Field label={t.appt_patient} required hint={t.appt_patient_hint}>
              <PatientPicker
                name="patient_id"
                required
                patients={patients}
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
            <Field label={t.appt_doctor} hint={t.appt_doctor_hint}>
              <Select name="doctor_id" defaultValue="">
                <option value="">{t.any_doctor}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.appt_date} required>
                <Input name="date" type="date" required defaultValue={dateStr} />
              </Field>
              <Field label={t.appt_time} required>
                <Input name="time" type="time" required defaultValue="09:00" />
              </Field>
            </div>
            <Field label={t.appt_duration}>
              <Input name="duration_min" type="number" min={5} max={480} step={5} defaultValue={30} />
            </Field>
            <Field label={t.appt_reason} optional={`(${t.optional})`}>
              <Input name="reason" placeholder={t.appt_reason_placeholder} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}

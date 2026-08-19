import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm } from "@/components/ActionForm";
import { requireClinic } from "@/lib/tenancy";
import { listMembers } from "@/lib/queries";
import { addMember, removeMember, updateClinic } from "@/lib/actions";
import {
  Badge, Card, EmptyState, Field, Input, PageTitle, Select,
} from "@/components/ui";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { clinic, member, t } = await requireClinic(slug);
  const isAdmin = member.role === "admin";
  const members = await listMembers(clinic.id);

  const roleLabel: Record<string, string> = {
    admin: t.team_role_admin,
    doctor: t.team_role_doctor,
    assistant: t.team_role_assistant,
  };
  const roleTone: Record<string, string> = { admin: "green", doctor: "blue", assistant: "gray" };

  const saveClinic = updateClinic.bind(null, slug);
  const add = addMember.bind(null, slug);

  return (
    <div>
      <PageTitle title={t.team_title} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">{t.team_clinic_info}</h3>
          <ActionForm action={saveClinic} submitLabel={t.team_save} savingLabel={t.saving} className="space-y-3" buttonClassName="max-w-40">
            <Field label={t.clinic_name}>
              <Input name="name" defaultValue={clinic.name} disabled={!isAdmin} />
            </Field>
            <Field label={t.clinic_url}>
              <Input value={`vyala.app/c/${clinic.slug}`} disabled readOnly />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.clinic_phone}>
                <Input name="phone" defaultValue={clinic.phone ?? ""} disabled={!isAdmin} />
              </Field>
              <Field label={t.clinic_city}>
                <Input name="city" defaultValue={clinic.city ?? ""} disabled={!isAdmin} />
              </Field>
            </div>
            <Field label={t.clinic_address}>
              <Input name="address" defaultValue={clinic.address ?? ""} disabled={!isAdmin} />
            </Field>
          </ActionForm>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="px-5 pb-1 pt-4 text-sm font-semibold">{t.team_members}</h3>
            {members.length === 0 ? (
              <EmptyState>{t.team_empty}</EmptyState>
            ) : (
              <ul className="divide-y divide-black/[.05]">
                {members.map((m) => {
                  const remove = removeMember.bind(null, slug, m.id);
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {m.fullName}
                          {m.specialty && (
                            <span className="ml-2 text-xs font-normal text-muted">{m.specialty}</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={roleTone[m.role]}>{roleLabel[m.role]}</Badge>
                        {isAdmin && m.id !== member.id && (
                          <form action={remove}>
                            <ConfirmButton
                              title={t.team_remove}
                              confirmLabel={t.confirm_remove}
                              cancelLabel={t.keep}
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {isAdmin && (
            <Card className="p-5">
              <h3 className="mb-1 text-sm font-semibold">{t.team_add}</h3>
              <p className="mb-3 text-xs text-muted">{t.team_hint}</p>
              <ActionForm action={add} submitLabel={t.team_add} savingLabel={t.saving} className="space-y-3" buttonClassName="max-w-48">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`${t.team_name} *`}>
                    <Input name="full_name" required />
                  </Field>
                  <Field label={`${t.team_email} *`}>
                    <Input name="email" type="email" required />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t.team_role}>
                    <Select name="role" defaultValue="doctor">
                      <option value="doctor">{t.team_role_doctor}</option>
                      <option value="assistant">{t.team_role_assistant}</option>
                      <option value="admin">{t.team_role_admin}</option>
                    </Select>
                  </Field>
                  <Field label={t.team_specialty}>
                    <Input name="specialty" />
                  </Field>
                </div>
              </ActionForm>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

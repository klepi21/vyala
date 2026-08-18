import { createClinic } from "@/lib/actions";
import { isClerkConfigured } from "@/lib/config";
import { isDbConfigured } from "@/lib/mongo";
import { SetupNotice } from "@/components/SetupNotice";
import { getLocale } from "@/lib/tenancy";
import { getDict } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { Card, Field, Input, PrimaryButton } from "@/components/ui";

export default async function OnboardingPage() {
  if (!isClerkConfigured() || !isDbConfigured()) return <SetupNotice />;
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size={34} />
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold">{t.onb_title}</h1>
          <p className="mb-5 mt-1 text-sm text-muted">{t.onb_subtitle}</p>
          <form action={createClinic} className="space-y-4">
            <Field label={`${t.onb_clinic_name} *`}>
              <Input name="name" required placeholder="Ιατρείο Παπαδόπουλος" />
            </Field>
            <Field label={`${t.onb_your_name} *`}>
              <Input name="full_name" required />
            </Field>
            <Field label={t.onb_specialty}>
              <Input name="specialty" placeholder="Παθολόγος" />
            </Field>
            <PrimaryButton type="submit" className="w-full">{t.onb_create}</PrimaryButton>
          </form>
        </Card>
      </div>
    </main>
  );
}

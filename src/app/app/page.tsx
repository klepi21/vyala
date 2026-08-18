import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/mongo";
import { isClerkConfigured } from "@/lib/config";
import { getLocale, myClinics } from "@/lib/tenancy";
import { getDict } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { SetupNotice } from "@/components/SetupNotice";
import { Card } from "@/components/ui";

export default async function AppHubPage() {
  if (!isClerkConfigured() || !isDbConfigured()) return <SetupNotice />;

  const memberships = await myClinics();
  if (memberships.length === 0) redirect("/onboarding");
  if (memberships.length === 1) redirect(`/c/${memberships[0].clinic.slug}`);

  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size={32} />
        </div>
        <div className="space-y-3">
          {memberships.map(({ clinic, member }) => (
            <Link key={clinic.id} href={`/c/${clinic.slug}`} className="block">
              <Card className="p-5 transition hover:border-brand-300">
                <p className="font-semibold">{clinic.name}</p>
                <p className="text-sm text-muted">
                  {member.role === "admin"
                    ? t.team_role_admin
                    : member.role === "doctor"
                      ? t.team_role_doctor
                      : t.team_role_assistant}
                  {" · "}vyala.app/c/{clinic.slug}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

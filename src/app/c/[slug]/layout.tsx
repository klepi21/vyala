import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LogoMark } from "@/components/Logo";
import { LocaleToggle } from "@/components/LocaleToggle";
import { BottomNav, SideNav, type NavItem } from "@/components/SideNav";
import { requireClinic } from "@/lib/tenancy";
import type { ReactNode } from "react";

export default async function ClinicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { clinic, member, locale, t } = await requireClinic(slug);

  const nav: NavItem[] = [
    { key: "dashboard", href: `/c/${slug}`, label: t.nav_dashboard },
    { key: "appointments", href: `/c/${slug}/appointments`, label: t.nav_appointments },
    { key: "patients", href: `/c/${slug}/patients`, label: t.nav_patients },
    { key: "billing", href: `/c/${slug}/billing`, label: t.nav_billing },
    { key: "analytics", href: `/c/${slug}/analytics`, label: t.nav_analytics },
    { key: "team", href: `/c/${slug}/team`, label: t.nav_team, shortLabel: t.nav_team_short },
  ];

  const roleLabel =
    member.role === "admin"
      ? t.team_role_admin
      : member.role === "doctor"
        ? t.team_role_doctor
        : t.team_role_assistant;

  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/[.07] bg-white px-4 py-5 md:flex">
        <Link
          href={`/c/${slug}`}
          className="mb-7 flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-mist"
        >
          <LogoMark size={38} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{clinic.name}</p>
            <p className="truncate text-xs text-muted">vyala.app/c/{clinic.slug}</p>
          </div>
        </Link>

        <SideNav items={nav} />

        <div className="mt-auto space-y-3 pt-5">
          <div className="flex justify-end">
            <LocaleToggle locale={locale} />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-black/[.07] bg-mist px-3 py-2.5">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink/85">{member.fullName}</p>
              <p className="truncate text-xs text-muted">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-black/[.07] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href={`/c/${slug}`} className="flex min-w-0 items-center gap-2.5">
            <LogoMark size={30} />
            <span className="truncate text-[15px] font-semibold">{clinic.name}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleToggle locale={locale} />
            <UserButton />
          </div>
        </header>

        <BottomNav items={nav} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}

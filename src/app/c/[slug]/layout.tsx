import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LocaleToggle } from "@/components/LocaleToggle";
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

  const nav = [
    { href: `/c/${slug}`, label: t.nav_dashboard, icon: LayoutDashboard },
    { href: `/c/${slug}/appointments`, label: t.nav_appointments, icon: CalendarDays },
    { href: `/c/${slug}/patients`, label: t.nav_patients, icon: Users },
    { href: `/c/${slug}/billing`, label: t.nav_billing, icon: Wallet },
    { href: `/c/${slug}/analytics`, label: t.nav_analytics, icon: BarChart3 },
    { href: `/c/${slug}/team`, label: t.nav_team, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-black/[.06] bg-white px-3 py-4 md:flex">
        <Link href={`/c/${slug}`} className="mb-6 flex items-center gap-2 px-2">
          <LogoMark size={30} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{clinic.name}</p>
            <p className="truncate text-[11px] text-muted">vyala.app/c/{clinic.slug}</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-mist hover:text-ink"
            >
              <item.icon size={17} className="text-muted" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between px-2 pt-4">
          <UserButton />
          <div className="text-right">
            <p className="max-w-32 truncate text-xs font-medium text-ink/70">{member.fullName}</p>
            <p className="text-[11px] text-muted">
              {member.role === "admin" ? t.team_role_admin : member.role === "doctor" ? t.team_role_doctor : t.team_role_assistant}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-black/[.06] bg-white/80 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href={`/c/${slug}`} className="flex items-center gap-2">
            <LogoMark size={26} />
            <span className="text-sm font-semibold">{clinic.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleToggle locale={locale} />
            <UserButton />
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="no-print fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-black/[.06] bg-white py-1.5 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex max-w-16 flex-col items-center gap-0.5 px-1 py-1 text-[10px] text-ink/70"
            >
              <item.icon size={18} />
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="no-print hidden items-center justify-end gap-2 px-6 pt-4 md:flex">
          <LocaleToggle locale={locale} />
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}

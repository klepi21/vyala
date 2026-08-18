import Link from "next/link";
import {
  BarChart3, CalendarDays, LayoutDashboard, Settings, Users, Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { DemoResetButton } from "@/components/DemoResetButton";
import { demoContext } from "@/lib/demo";
import type { ReactNode } from "react";

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const { clinic, t } = await demoContext();

  const nav = [
    { href: "/demo", label: t.nav_dashboard, icon: LayoutDashboard },
    { href: "/demo/appointments", label: t.nav_appointments, icon: CalendarDays },
    { href: "/demo/patients", label: t.nav_patients, icon: Users },
    { href: "/demo/billing", label: t.nav_billing, icon: Wallet },
    { href: "/demo/analytics", label: t.nav_analytics, icon: BarChart3 },
    { href: "/demo/team", label: t.nav_team, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-black/[.06] bg-white px-3 py-4 md:flex">
        <Link href="/demo" className="mb-6 flex items-center gap-2 px-2">
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
        <div className="mt-auto px-2 pt-4">
          <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
            <p className="font-semibold">{t.demo_badge}</p>
            <p className="mt-1 text-brand-700/80">{t.demo_note_editable}</p>
            <div className="mt-2.5 space-y-1.5">
              <DemoResetButton label={t.demo_reset} />
              <Link
                href="/contact"
                className="block rounded-lg bg-brand-600 px-3 py-1.5 text-center font-medium text-white hover:bg-brand-700"
              >
                {t.demo_cta}
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[.06] bg-white/85 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href="/demo" className="flex items-center gap-2">
            <LogoMark size={26} />
            <span className="text-sm font-semibold">{clinic.name}</span>
          </Link>
          <Link href="/contact" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">
            {t.demo_cta}
          </Link>
        </header>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-black/[.06] bg-white py-1.5 md:hidden">
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

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-10">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { DatabaseZap } from "lucide-react";
import { BottomNav, SideNav, type NavItem } from "@/components/SideNav";
import { Logo, LogoMark } from "@/components/Logo";
import { DemoResetButton } from "@/components/DemoResetButton";
import { demoClinic } from "@/lib/demo";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/tenancy";
import type { ReactNode } from "react";

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = getDict(locale);
  const clinic = await demoClinic();

  // The database is unset or unreachable. Say so plainly rather than letting
  // the page throw, since the showroom is the first thing a prospect clicks.
  if (!clinic) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-black/[.07] bg-white p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Logo size={30} />
          </div>
          <DatabaseZap size={26} className="mx-auto mb-4 text-amber-500" />
          <h1 className="text-lg font-semibold">{t.demo_unavailable_title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">{t.demo_unavailable_body}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-black/12 px-5 py-2.5 text-sm font-medium transition hover:bg-mist"
            >
              {t.back_home}
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {t.demo_cta}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nav: NavItem[] = [
    { key: "dashboard", href: "/demo", label: t.nav_dashboard },
    { key: "appointments", href: "/demo/appointments", label: t.nav_appointments },
    { key: "patients", href: "/demo/patients", label: t.nav_patients },
    { key: "billing", href: "/demo/billing", label: t.nav_billing },
    { key: "analytics", href: "/demo/analytics", label: t.nav_analytics },
    { key: "team", href: "/demo/team", label: t.nav_team, shortLabel: t.nav_team_short },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/[.07] bg-white px-4 py-5 md:flex">
        <Link
          href="/demo"
          className="mb-7 flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-mist"
        >
          <LogoMark size={38} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{clinic.name}</p>
            <p className="truncate text-xs text-muted">vyala.app/c/{clinic.slug}</p>
          </div>
        </Link>

        <SideNav items={nav} />

        <div className="mt-auto pt-5">
          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
            <p className="font-semibold">{t.demo_badge}</p>
            <p className="mt-1 leading-relaxed text-brand-700/85">{t.demo_note_editable}</p>
            <div className="mt-3 space-y-2">
              <DemoResetButton label={t.demo_reset} />
              <Link
                href="/contact"
                className="flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-3 font-semibold text-white transition hover:bg-brand-700"
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
            <LogoMark size={30} />
            <span className="truncate text-[15px] font-semibold">{clinic.name}</span>
          </Link>
          <Link href="/contact" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">
            {t.demo_cta}
          </Link>
        </header>

        <BottomNav items={nav} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, CalendarDays, LayoutDashboard, Settings, Users, Wallet,
} from "lucide-react";

const ICONS = {
  dashboard: LayoutDashboard,
  appointments: CalendarDays,
  patients: Users,
  billing: Wallet,
  analytics: BarChart3,
  team: Settings,
};

export type NavKey = keyof typeof ICONS;
export interface NavItem {
  key: NavKey;
  href: string;
  label: string;
  /** Used in the phone bar, where a long label cannot fit six across. */
  shortLabel?: string;
}

/**
 * Primary navigation, sized for comfortable reading and hitting.
 *
 * Rows are 52px tall with 20px icons and 16px labels, well past the 44px
 * touch minimum, because the people using this are often working quickly
 * between patients and are frequently over fifty.
 */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // The dashboard root must not light up for every child route.
    const isRoot = items[0]?.href === href;
    return !isRoot && pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => {
        const Icon = ICONS[item.key];
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex min-h-[52px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              active
                ? "bg-brand-50 text-brand-800"
                : "text-ink/75 hover:bg-mist hover:text-ink"
            }`}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-brand-600"
                aria-hidden
              />
            )}
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-black/[.04] text-muted group-hover:bg-brand-50 group-hover:text-brand-600"
              }`}
            >
              <Icon size={19} />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** The same navigation as a bottom bar on phones. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t border-black/[.07] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(20,32,29,0.05)] md:hidden"
      aria-label="Main"
    >
      {items.map((item) => {
        const Icon = ICONS[item.key];
        const isRoot = items[0]?.href === item.href;
        const active =
          pathname === item.href || (!isRoot && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium transition ${
              active ? "text-brand-700" : "text-ink/60"
            }`}
          >
            <Icon size={21} className={active ? "text-brand-600" : "text-muted"} />
            <span className="w-full truncate text-center leading-tight">
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

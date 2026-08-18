"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { setLocale } from "@/lib/actions";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const [pending, start] = useTransition();
  const pathname = usePathname();
  const next = locale === "el" ? "en" : "el";
  return (
    <button
      onClick={() => start(() => setLocale(next, pathname))}
      disabled={pending}
      className="rounded-lg border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-ink/60 transition hover:bg-mist"
      title={next === "en" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}
    >
      {locale === "el" ? "EN" : "ΕΛ"}
    </button>
  );
}

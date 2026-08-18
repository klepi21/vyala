import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { landingEl, landingEn } from "@/lib/landing-copy";

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: { h: string; body: string[]; list?: string[] }[];
}

export function LegalPage({
  doc,
  locale,
  altHref,
  altLabel,
  backLabel,
}: {
  doc: LegalDoc;
  locale: "en" | "el";
  altHref: string;
  altLabel: string;
  backLabel: string;
}) {
  const base = locale === "el" ? "/el" : "";
  const copy = locale === "el" ? landingEl : landingEn;
  return (
    <div className="bg-white text-ink">
      <header className="border-b border-black/[.05]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={base || "/"}><Logo size={30} /></Link>
          <div className="flex items-center gap-2">
            <Link href={altHref} className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-ink/60 hover:bg-mist">
              {altLabel}
            </Link>
            <Link href={base || "/"} className="text-sm text-ink/60 hover:text-ink">{backLabel}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted">{doc.updated}</p>
        <p className="mt-6 leading-relaxed text-ink/70">{doc.intro}</p>

        <div className="mt-10 space-y-9">
          {doc.sections.map((s, i) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold">
                <span className="mr-2 text-ink/30 tabular-nums">{i + 1}.</span>
                {s.h}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} className="mt-3 leading-relaxed text-ink/70">{p}</p>
              ))}
              {s.list && (
                <ul className="mt-3 space-y-1.5 pl-5 text-ink/70">
                  {s.list.map((li) => (
                    <li key={li} className="list-disc leading-relaxed">{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-black/[.05] py-8">
        <div className="mx-auto flex max-w-2xl flex-wrap gap-x-5 gap-y-2 px-4 text-sm text-muted">
          <Link href={`${base}/privacy`} className="hover:text-ink">{copy.footer_privacy}</Link>
          <Link href={`${base}/terms`} className="hover:text-ink">{copy.footer_terms}</Link>
          <Link href={`${base}/gdpr`} className="hover:text-ink">{copy.footer_gdpr}</Link>
          <Link href={`${base}/contact`} className="hover:text-ink">{copy.footer_contact}</Link>
        </div>
      </footer>
    </div>
  );
}

export function LegalShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

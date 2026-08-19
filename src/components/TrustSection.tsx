import Link from "next/link";
import { ArrowRight, EyeOff, FileCheck2, Lock, Server } from "lucide-react";

export interface TrustCopy {
  eyebrow: string;
  title: string;
  body: string;
  points: { icon: "server" | "lock" | "eye" | "file"; title: string; body: string }[];
  link: string;
}

const ICONS = { server: Server, lock: Lock, eye: EyeOff, file: FileCheck2 };

/**
 * Where the patient data actually lives.
 *
 * A doctor is being asked to move medical records into someone else's
 * software, so this is the objection that decides the sale. It was buried in
 * the footer; here it sits on the page with the specifics rather than
 * reassuring adjectives.
 */
export function TrustSection({ c, base }: { c: TrustCopy; base: string }) {
  return (
    <section className="border-t border-black/[.05] bg-brand-950 py-20 text-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200">
            <Lock size={13} />
            {c.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">{c.title}</h2>
          <p className="mt-4 leading-relaxed text-white/70">{c.body}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {c.points.map((p) => {
            const Icon = ICONS[p.icon];
            return (
              <div
                key={p.title}
                className="reveal rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-white/20 hover:bg-white/[.07]"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                  <Icon size={20} />
                </span>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{p.body}</p>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-10 text-center">
          <Link
            href={`${base}/gdpr`}
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {c.link}
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

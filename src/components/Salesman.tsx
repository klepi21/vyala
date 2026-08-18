import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, Scale, UtensilsCrossed } from "lucide-react";

export interface SalesmanCopy {
  eyebrow: string;
  title: string;
  body: string;
  name: string;
  role: string;
  credentials: { icon: "scale" | "fork" | "pin" | "cap"; text: string }[];
  cta: string;
  note: string;
}

const ICONS = {
  scale: Scale,
  fork: UtensilsCrossed,
  pin: MapPin,
  cap: GraduationCap,
};

/**
 * The person a prospect actually speaks to.
 *
 * The initials sit behind a real <img>. If the photo is ever missing the
 * broken image collapses and the initials show through, so the card still
 * looks deliberate rather than showing a broken file icon.
 */
export function Salesman({ c, base }: { c: SalesmanCopy; base: string }) {
  return (
    <section className="border-t border-black/[.05] bg-white py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="reveal grid items-center gap-10 md:grid-cols-[300px_1fr]">
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="drift-slow absolute -inset-3 rounded-[2rem] bg-brand-100/70" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-brand-600 shadow-xl shadow-brand-900/10">
              <span
                className="absolute inset-0 flex items-center justify-center text-5xl font-semibold tracking-tight text-white/90"
                aria-hidden
              >
                ΙΓ
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/team-ioannis.jpg"
                alt={`${c.name}, ${c.role}`}
                width={600}
                height={750}
                // Not lazy: jumping straight to #team can leave a lazy image
                // unloaded, which drops the card back to the initials.
                fetchPriority="low"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
              {c.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{c.body}</p>

            <div className="mt-7">
              <p className="text-lg font-semibold">{c.name}</p>
              <p className="text-sm text-muted">{c.role}</p>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {c.credentials.map((cr) => {
                const Icon = ICONS[cr.icon];
                return (
                  <li
                    key={cr.text}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/[.07] bg-mist px-3 py-2 text-sm text-ink/75"
                  >
                    <Icon size={15} className="shrink-0 text-brand-600" />
                    {cr.text}
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`${base}/contact`}
                className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
              >
                {c.cta}
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
              <p className="text-xs text-muted">{c.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

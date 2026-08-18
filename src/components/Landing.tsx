import Link from "next/link";
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Clock, FileText,
  FolderOpen, Languages, Lock, MapPin, PlayCircle, ShieldCheck, Sparkles,
  Users, Wallet,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { DemoVideo } from "@/components/DemoVideo";
import { Salesman, type SalesmanCopy } from "@/components/Salesman";

export interface LandingCopy {
  locale: "en" | "el";
  nav_features: string;
  nav_demo: string;
  nav_contact: string;
  nav_faq: string;
  nav_signin: string;
  nav_cta: string;
  hero_eyebrow: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_sub: string;
  hero_cta: string;
  hero_cta_sub: string;
  hero_secondary: string;
  proof_1: string;
  proof_2: string;
  proof_3: string;
  stats: { value: string; label: string }[];
  video_title: string;
  video_sub: string;
  video_caption: string;
  video_try: string;
  features_title: string;
  features_sub: string;
  f1_title: string; f1_body: string;
  f2_title: string; f2_body: string;
  f3_title: string; f3_body: string;
  f4_title: string; f4_body: string;
  f5_title: string; f5_body: string;
  f6_title: string; f6_body: string;
  how_title: string;
  how_1_title: string; how_1_body: string;
  how_2_title: string; how_2_body: string;
  how_3_title: string; how_3_body: string;
  salesman: SalesmanCopy;
  contact_title: string;
  contact_sub: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_clinic: string;
  contact_size: string;
  contact_size_options: string[];
  contact_message: string;
  contact_submit: string;
  contact_note: string;
  contact_sent_title: string;
  contact_sent_body: string;
  back_home: string;
  faq_title: string;
  faqs: { q: string; a: string }[];
  final_title: string;
  final_sub: string;
  final_cta: string;
  footer_tagline: string;
  footer_legal: string;
  footer_privacy: string;
  footer_terms: string;
  footer_gdpr: string;
  footer_contact: string;
  mock_today: string;
  mock_patients: string;
  mock_revenue: string;
  mock_next: string;
  lang_switch_label: string;
  lang_switch_href: string;
}

export function Landing({ c }: { c: LandingCopy }) {
  const base = c.locale === "el" ? "/el" : "";
  const features = [
    { icon: Users, title: c.f1_title, body: c.f1_body },
    { icon: CalendarDays, title: c.f2_title, body: c.f2_body },
    { icon: FileText, title: c.f3_title, body: c.f3_body },
    { icon: Wallet, title: c.f4_title, body: c.f4_body },
    { icon: FolderOpen, title: c.f5_title, body: c.f5_body },
    { icon: Languages, title: c.f6_title, body: c.f6_body },
  ];
  const steps = [
    { icon: Clock, title: c.how_1_title, body: c.how_1_body },
    { icon: Sparkles, title: c.how_2_title, body: c.how_2_body },
    { icon: CheckCircle2, title: c.how_3_title, body: c.how_3_body },
  ];

  return (
    <div className="bg-white text-ink">
      <header className="sticky top-0 z-20 border-b border-black/[.05] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={base || "/"} className="transition hover:opacity-80">
            <Logo size={30} />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink/65 md:flex">
            {[
              { href: "#features", label: c.nav_features },
              { href: "#demo", label: c.nav_demo },
              { href: "#team", label: c.nav_contact },
              { href: "#faq", label: c.nav_faq },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative py-1 transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-500 after:transition-transform hover:text-ink hover:after:scale-x-100"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={c.lang_switch_href}
              className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-ink/65 transition hover:bg-mist"
            >
              {c.lang_switch_label}
            </Link>
            <Link href="/sign-in" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:text-ink sm:block">
              {c.nav_signin}
            </Link>
            <Link
              href={`${base}/contact`}
              className="group inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              {c.nav_cta}
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden />
        <div className="grid-wash pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="enter enter-1 mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur">
              <MapPin size={13} />
              {c.hero_eyebrow}
            </p>
            <h1 className="enter enter-2 text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              {c.hero_title_1}
              <br />
              <span className="relative inline-block text-brand-600">
                {c.hero_title_2}
                <svg
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-brand-300"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 5.5C40 2 70 2 100 4.2 130 6.4 165 6 198 2.6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>
            <p className="enter enter-3 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
              {c.hero_sub}
            </p>
            <div className="enter enter-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`${base}/contact`}
                className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/25"
              >
                {c.hero_cta}
                <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-7 py-3.5 text-base font-medium text-ink/75 backdrop-blur transition hover:bg-mist"
              >
                <PlayCircle size={18} className="text-brand-600" />
                {c.hero_secondary}
              </a>
            </div>
            <p className="enter enter-5 mt-3.5 inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock size={12} />
              {c.hero_cta_sub}
            </p>
          </div>

          {/* Product still */}
          <div className="enter enter-5 relative mx-auto mt-14 max-w-4xl">
            <div className="absolute -inset-x-8 -bottom-6 top-8 rounded-[2.5rem] bg-brand-200/25 blur-2xl" aria-hidden />
            <div className="relative rounded-3xl border border-black/[.07] bg-white/70 p-2 shadow-2xl shadow-black/[.09] backdrop-blur">
              <div className="overflow-hidden rounded-2xl border border-black/[.05] bg-white">
                <div className="flex items-center gap-1.5 border-b border-black/[.05] bg-mist/60 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                  <span className="ml-3 rounded-md bg-white px-2 py-0.5 text-[10px] text-muted">vyala.app/c/my-clinic</span>
                </div>
                <div className="flex">
                  <div className="hidden w-40 shrink-0 border-r border-black/[.05] p-3 sm:block">
                    <div className="mb-4 flex items-center gap-1.5">
                      <LogoMark size={18} />
                      <div className="h-2 w-16 rounded bg-black/10" />
                    </div>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`mb-2 flex h-6 items-center gap-1.5 rounded-lg px-2 ${i === 0 ? "bg-brand-50" : ""}`}>
                        <div className={`h-2 w-2 rounded-sm ${i === 0 ? "bg-brand-400" : "bg-black/10"}`} />
                        <div className={`h-1.5 rounded ${i === 0 ? "w-14 bg-brand-300" : "w-12 bg-black/10"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {[
                        { label: c.mock_today, value: "8", Icon: CalendarDays },
                        { label: c.mock_patients, value: "512", Icon: Users },
                        { label: c.mock_revenue, value: "€6.220", Icon: Wallet },
                        { label: c.mock_next, value: "09:30", Icon: Clock },
                      ].map(({ label, value, Icon }) => (
                        <div key={label} className="rounded-xl border border-black/[.05] p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-medium uppercase tracking-wide text-muted">{label}</p>
                            <Icon size={11} className="text-brand-500" />
                          </div>
                          <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      {[
                        ["09:30", "Παπαδοπούλου Μαρία", "bg-brand-500"],
                        ["10:00", "Γεωργίου Νίκος", "bg-sky-500"],
                        ["10:30", "Δημητρίου Ελένη", "bg-brand-500"],
                      ].map(([time, name, tone]) => (
                        <div key={time} className="flex items-center gap-3 rounded-xl border border-black/[.05] px-3 py-2.5">
                          <span className="text-xs font-semibold tabular-nums">{time}</span>
                          <span className="flex-1 text-xs text-ink/70">{name}</span>
                          <span className={`h-2 w-2 rounded-full ${tone}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-ink/60">
            {[c.proof_1, c.proof_2, c.proof_3].map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-brand-500" /> {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers band */}
      <section className="border-y border-black/[.05] bg-brand-950 py-10 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label} className="reveal text-center">
              <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo video */}
      <section id="demo" className="bg-mist/60 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="reveal text-center">
            <h2 className="text-3xl font-semibold tracking-tight">{c.video_title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/60">{c.video_sub}</p>
          </div>
          <div className="reveal mt-10">
            <DemoVideo caption={c.video_caption} />
          </div>
          <div className="reveal mt-8 text-center">
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {c.video_try}
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="reveal text-center">
            <h2 className="text-3xl font-semibold tracking-tight">{c.features_title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/60">{c.features_sub}</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="reveal group rounded-2xl border border-black/[.06] bg-white p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/[.06]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-black/[.05] bg-mist/60 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="reveal text-center text-3xl font-semibold tracking-tight">{c.how_title}</h2>
          <div className="relative mt-12">
            {/* The thread connecting the three steps on wide screens */}
            <div
              className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 md:block"
              aria-hidden
            />
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="reveal relative text-center">
                  <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200 bg-white text-brand-600 shadow-sm">
                    <s.icon size={22} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-ink/60">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The person you talk to */}
      <div id="team">
        <Salesman c={c.salesman} base={base} />
      </div>

      {/* FAQ */}
      <section id="faq" className="border-t border-black/[.05] bg-mist/60 py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="reveal text-center text-3xl font-semibold tracking-tight">{c.faq_title}</h2>
          <div className="mt-10 space-y-3">
            {c.faqs.map((f) => (
              <details
                key={f.q}
                className="reveal group rounded-2xl border border-black/[.06] bg-white px-5 py-4 transition hover:border-brand-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium marker:hidden">
                  {f.q}
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-muted transition group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-brand-900 py-20 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(30rem 16rem at 20% 0%, rgba(130,210,183,0.28), transparent 60%), radial-gradient(28rem 15rem at 82% 100%, rgba(78,184,151,0.24), transparent 62%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <span className="drift mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <ShieldCheck size={26} className="text-brand-200" />
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.final_title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">{c.final_sub}</p>
          <Link
            href={`${base}/contact`}
            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 font-semibold text-brand-900 transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            {c.final_cta}
            <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/[.05] bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <div>
            <Logo size={26} />
            <p className="mt-3 max-w-56 text-sm leading-relaxed text-muted">{c.footer_tagline}</p>
          </div>
          <div className="text-sm">
            <p className="mb-2.5 font-medium text-ink/75">{c.footer_legal}</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href={`${base}/privacy`} className="transition hover:text-ink">{c.footer_privacy}</Link></li>
              <li><Link href={`${base}/terms`} className="transition hover:text-ink">{c.footer_terms}</Link></li>
              <li><Link href={`${base}/gdpr`} className="transition hover:text-ink">{c.footer_gdpr}</Link></li>
            </ul>
          </div>
          <div className="text-sm sm:text-right">
            <p className="mb-2.5 font-medium text-ink/75">{c.footer_contact}</p>
            <ul className="space-y-1.5 text-muted">
              <li><Link href={`${base}/contact`} className="transition hover:text-ink">{c.nav_cta}</Link></li>
              <li><a href="mailto:hello@vyala.app" className="transition hover:text-ink">hello@vyala.app</a></li>
            </ul>
            <p className="mt-4 text-xs text-ink/45">© {new Date().getFullYear()} Vyala</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

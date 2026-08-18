import Link from "next/link";
import { CheckCircle2, Clock, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { submitEnquiry } from "@/lib/actions";
import { Card, Field, Input, PrimaryButton, Select, Textarea } from "@/components/ui";
import type { LandingCopy } from "@/components/Landing";

export function ContactPage({ c, sent }: { c: LandingCopy; sent: boolean }) {
  const base = c.locale === "el" ? "/el" : "";

  return (
    <div className="bg-white text-ink">
      <header className="border-b border-black/[.05]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={base || "/"}><Logo size={30} /></Link>
          <Link
            href={c.locale === "el" ? "/contact" : "/el/contact"}
            className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-ink/60 hover:bg-mist"
          >
            {c.lang_switch_label}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.contact_title}</h1>
          <p className="mt-4 text-ink/60">{c.contact_sub}</p>
          <ul className="mt-8 space-y-3 text-sm text-ink/65">
            <li className="flex items-start gap-2.5">
              <Clock size={17} className="mt-0.5 shrink-0 text-brand-500" />
              {c.contact_note}
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brand-500" />
              {c.hero_cta_sub}
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={17} className="mt-0.5 shrink-0 text-brand-500" />
              <a href="mailto:hello@vyala.app" className="hover:text-ink">hello@vyala.app</a>
            </li>
          </ul>
        </div>

        <Card className="h-fit p-6">
          {sent ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-4 text-brand-500" />
              <h2 className="text-lg font-semibold">{c.contact_sent_title}</h2>
              <p className="mt-2 text-sm text-ink/60">{c.contact_sent_body}</p>
              <Link
                href={base || "/"}
                className="mt-6 inline-block rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium hover:bg-mist"
              >
                {c.back_home}
              </Link>
            </div>
          ) : (
            <form action={submitEnquiry} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${c.contact_name} *`}>
                  <Input name="name" required autoComplete="name" />
                </Field>
                <Field label={`${c.contact_email} *`}>
                  <Input name="email" type="email" required autoComplete="email" />
                </Field>
                <Field label={c.contact_phone}>
                  <Input name="phone" type="tel" autoComplete="tel" />
                </Field>
                <Field label={c.contact_clinic}>
                  <Input name="clinic" />
                </Field>
              </div>
              <Field label={c.contact_size}>
                <Select name="size" defaultValue={c.contact_size_options[0]}>
                  {c.contact_size_options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Field>
              <Field label={c.contact_message}>
                <Textarea name="message" className="min-h-24" />
              </Field>
              <PrimaryButton type="submit" className="w-full !py-3">{c.contact_submit}</PrimaryButton>
              <p className="text-center text-xs text-muted">
                <Link href={`${base}/privacy`} className="underline hover:text-ink/70">
                  {c.footer_privacy}
                </Link>
              </p>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}

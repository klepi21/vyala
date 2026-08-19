import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/[.07] bg-white shadow-[0_1px_2px_rgba(20,32,29,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-4">
      <h2 className="text-sm font-semibold text-ink/80">{title}</h2>
      {action}
    </div>
  );
}

/** A titled panel with optional explanation, so a form is never a bare stack of boxes. */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 border-b border-black/[.06] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function PrimaryButton(props: ComponentProps<"button">) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 ${className}`}
    />
  );
}

export function SecondaryButton(props: ComponentProps<"button">) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-black/12 bg-white px-5 text-sm font-medium text-ink/80 transition hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 ${className}`}
    />
  );
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-black/12 bg-white px-4 text-sm font-medium text-ink/80 transition hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * A labelled field. The label sits above at readable size, an optional hint
 * explains the field in plain words, and required is spelled out rather than
 * left as a bare asterisk.
 */
export function Field({
  label,
  hint,
  required,
  optional,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  optional?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-ink/85">{label}</span>
        {required && <span className="text-xs text-red-600">*</span>}
        {optional && <span className="text-xs font-normal text-muted">{optional}</span>}
      </span>
      {hint && <span className="mb-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/55 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 disabled:bg-mist disabled:text-ink/50";

export function Input(props: ComponentProps<"input">) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${inputCls} h-11 ${className}`} />;
}

export function Select(props: ComponentProps<"select">) {
  const { className = "", ...rest } = props;
  return (
    <select
      {...rest}
      className={`${inputCls} h-11 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="%235b6763" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>')] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${className}`}
    />
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${inputCls} min-h-24 resize-y leading-relaxed ${className}`} />;
}

/** Currency input with the euro sign inside the box, so the unit is never ambiguous. */
export function MoneyInput(props: ComponentProps<"input">) {
  const { className = "", ...rest } = props;
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-muted">
        €
      </span>
      <input
        {...rest}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        className={`${inputCls} h-11 pl-8 tabular-nums ${className}`}
      />
    </span>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-brand-100 text-brand-800",
  gray: "bg-black/[.06] text-ink/65",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-sky-100 text-sky-800",
  purple: "bg-violet-100 text-violet-800",
};

export function Badge({ tone = "gray", children }: { tone?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${badgeTones[tone] ?? badgeTones.gray}`}>
      {children}
    </span>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-muted">{children}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Tab strip used for the billing sections and patient record. */
export function Tabs({
  items,
  current,
}: {
  items: { key: string; href: string; label: string; count?: number }[];
  current: string;
}) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-black/[.04] p-1">
      {items.map((it) => {
        const active = it.key === current;
        return (
          <Link
            key={it.key}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              active ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            {it.label}
            {it.count !== undefined && (
              <span className={`tabular-nums text-xs ${active ? "text-muted" : "text-ink/40"}`}>
                {it.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

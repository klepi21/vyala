"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * Submit button that disables itself and says so while the action runs.
 *
 * Without this the button looks inert on a slow connection and people click it
 * twice, which is how you get two identical payments. Success needs no badge:
 * the saved row appears in the list beside the form.
 */
export function SubmitBar({
  label,
  savingLabel,
  error,
  className = "",
}: {
  label: string;
  savingLabel: string;
  error?: string | null;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className={className}>
      {error && (
        <p
          role="alert"
          className="mb-2.5 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-70"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? savingLabel : label}
      </button>
    </div>
  );
}

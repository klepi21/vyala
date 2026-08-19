"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { SubmitBar } from "@/components/SubmitBar";
import type { FormState } from "@/lib/form-state";

/**
 * A form whose action can fail without losing the user's work.
 *
 * The action returns `{ error }` rather than throwing, so the message appears
 * above the button and every field keeps what was typed. Server-rendered
 * fields are passed straight through as children.
 */
export function ActionForm({
  action,
  submitLabel,
  savingLabel,
  children,
  className = "space-y-4",
  buttonClassName,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  savingLabel: string;
  children: ReactNode;
  className?: string;
  buttonClassName?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      <SubmitBar
        label={submitLabel}
        savingLabel={savingLabel}
        error={state?.error}
        className={buttonClassName}
      />
    </form>
  );
}

"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Two-step destructive action. The first click swaps the icon for a small
 * confirm and cancel pair, so nothing is deleted by a stray click.
 */
export function ConfirmButton({
  children,
  title,
  confirmLabel,
  cancelLabel,
}: {
  children: ReactNode;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        title={title}
        aria-label={title}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {children}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="submit"
        title={confirmLabel}
        aria-label={confirmLabel}
        className="inline-flex h-11 items-center justify-center gap-1 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Check size={15} /> {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        title={cancelLabel}
        aria-label={cancelLabel}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <X size={15} />
      </button>
    </span>
  );
}

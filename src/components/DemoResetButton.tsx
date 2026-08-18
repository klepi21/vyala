"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { demoReset } from "@/lib/demo-actions";

export function DemoResetButton({ label }: { label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => demoReset())}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:bg-brand-50 disabled:opacity-60"
    >
      <RotateCcw size={13} className={pending ? "animate-spin" : ""} />
      {label}
    </button>
  );
}

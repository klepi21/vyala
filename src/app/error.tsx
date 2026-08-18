"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[vyala]", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/[.06] bg-white p-6 text-center shadow-sm">
        <AlertTriangle size={28} className="mx-auto mb-4 text-amber-500" />
        <h1 className="text-lg font-semibold">That did not go through</h1>
        <p className="mt-2 text-sm text-ink/60">
          {error.message && error.message.length < 200
            ? error.message
            : "Something went wrong on our side. Nothing was saved."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/app"
            className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:bg-mist"
          >
            Back to my practice
          </Link>
        </div>
      </div>
    </main>
  );
}

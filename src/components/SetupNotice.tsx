import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";
import { hasClerkPublishableKey, hasClerkSecretKey } from "@/lib/config";
import { isDbConfigured } from "@/lib/mongo";

/**
 * Shown instead of the signed-in areas until the environment is complete.
 * It names the exact variables that are still missing rather than repeating
 * setup steps that are already done.
 */
export async function SetupNotice() {
  const checks = [
    {
      ok: hasClerkPublishableKey(),
      key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      where: "Clerk dashboard, Configure, API keys, the publishable key",
    },
    {
      ok: hasClerkSecretKey(),
      key: "CLERK_SECRET_KEY",
      where: "same page, Secret keys, use the copy button next to the default key",
    },
    {
      ok: isDbConfigured(),
      key: "MONGODB_URI",
      where: "Atlas, Connect, Drivers, Node.js",
    },
  ];
  const missing = checks.filter((c) => !c.ok);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-6">
        <Logo size={30} />
        <h1 className="mt-4 text-lg font-semibold">
          {missing.length === 1
            ? "One environment variable left"
            : `${missing.length} environment variables left`}
        </h1>
        <p className="mt-1.5 text-sm text-ink/60">
          Add the missing values to <code className="rounded bg-black/[.06] px-1">.env.local</code>{" "}
          and restart the dev server.
        </p>

        <ul className="mt-5 space-y-3">
          {checks.map((c) => (
            <li key={c.key} className="flex items-start gap-2.5">
              {c.ok ? (
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-600" />
              ) : (
                <Circle size={17} className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <div className="min-w-0">
                <p className={`font-mono text-xs ${c.ok ? "text-ink/45 line-through" : "font-semibold"}`}>
                  {c.key}
                </p>
                {!c.ok && <p className="mt-0.5 text-xs text-ink/55">{c.where}</p>}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl bg-mist p-3 text-xs text-ink/60">
          Nothing else is waiting on you. The database is seeded and the rest of the app is ready.
        </div>

        <Link
          href="/demo"
          className="mt-5 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Explore the sample practice meanwhile
        </Link>
      </Card>
    </main>
  );
}

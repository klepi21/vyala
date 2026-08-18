import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/[.06] bg-white p-6 text-center shadow-sm">
        <div className="mb-5 flex justify-center">
          <Logo size={30} />
        </div>
        <h1 className="text-lg font-semibold">We could not find that page</h1>
        <p className="mt-2 text-sm text-ink/60">
          The link may be out of date, or the practice address may have changed.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium transition hover:bg-mist"
          >
            Go to the homepage
          </Link>
          <Link
            href="/app"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            My practice
          </Link>
        </div>
      </div>
    </main>
  );
}

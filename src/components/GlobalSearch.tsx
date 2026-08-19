"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

export interface SearchHit {
  id: string;
  name: string;
  phone: string | null;
  amka: string | null;
}

/**
 * Find a patient from anywhere in the app.
 *
 * Someone is on the phone and the receptionist needs the record now, not
 * after two navigations. Cmd or Ctrl plus K opens it from any screen, and
 * typing three characters is enough to start matching.
 */
export function GlobalSearch({
  search,
  basePath,
  labels,
}: {
  search: (term: string) => Promise<SearchHit[]>;
  basePath: string;
  labels: { open: string; placeholder: string; hint: string; none: string; short: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = term.trim();
    // Debounced, and the reset for a short query happens in the timer too so
    // nothing sets state straight from the effect body.
    const timer = setTimeout(() => {
      if (q.length < 2) {
        setHits([]);
        return;
      }
      start(async () => setHits(await search(q)));
    }, 180);
    return () => clearTimeout(timer);
  }, [term, open, search]);

  function close() {
    setOpen(false);
    setTerm("");
    setHits([]);
  }

  function go(id: string) {
    close();
    router.push(`${basePath}/patients/${id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-black/10 bg-mist px-3 text-left text-sm text-muted transition hover:border-brand-300 hover:bg-white"
      >
        <Search size={17} className="shrink-0" />
        <span className="flex-1 truncate">{labels.open}</span>
        <kbd className="hidden shrink-0 rounded border border-black/10 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted lg:block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={labels.open}
          >
            <div className="flex items-center gap-3 border-b border-black/[.07] px-4">
              <Search size={18} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={labels.placeholder}
                aria-label={labels.placeholder}
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-ink/45"
              />
              {pending && <Loader2 size={16} className="shrink-0 animate-spin text-muted" />}
              <button
                type="button"
                onClick={close}
                aria-label={labels.hint}
                className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-mist"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {term.trim().length < 2 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">{labels.short}</p>
              ) : hits.length === 0 && !pending ? (
                <p className="px-4 py-6 text-center text-sm text-muted">{labels.none}</p>
              ) : (
                <ul className="py-1">
                  {hits.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => go(h.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left transition hover:bg-mist"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-medium">{h.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {[h.phone, h.amka].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

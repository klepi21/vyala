"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Search, UserPlus, X } from "lucide-react";

export interface PatientOption {
  id: string;
  name: string;
  phone?: string | null;
}

/**
 * Type-to-filter patient picker with a quick-add fallback.
 *
 * A practice with hundreds of patients cannot use a plain select, and the
 * person you need is often the one who has just walked in and is not on file
 * yet, so adding them takes a name and a phone number without leaving the form.
 */
export function PatientPicker({
  name,
  patients,
  quickAdd,
  labels,
  required,
  initial,
}: {
  name: string;
  patients: PatientOption[];
  /** Preselected patient, for editing an existing record. */
  initial?: PatientOption;
  quickAdd: (formData: FormData) => Promise<{ id: string; name: string } | void>;
  labels: {
    placeholder: string;
    search: string;
    noMatch: string;
    addNew: string;
    firstName: string;
    lastName: string;
    phone: string;
    save: string;
    cancel: string;
    none: string;
    nameRequired: string;
  };
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PatientOption | null>(initial ?? null);
  const [extra, setExtra] = useState<PatientOption[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => [...extra, ...patients], [extra, patients]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 60);
    return all
      .filter((p) => p.name.toLowerCase().includes(q) || (p.phone ?? "").includes(q))
      .slice(0, 60);
  }, [all, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setAdding(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && !adding) searchRef.current?.focus();
    if (adding) firstNameRef.current?.focus();
  }, [open, adding]);

  function submitQuickAdd() {
    const first = firstNameRef.current?.value.trim() ?? "";
    const last = lastNameRef.current?.value.trim() ?? "";
    if (!first || !last) {
      setError(labels.nameRequired);
      (first ? lastNameRef : firstNameRef).current?.focus();
      return;
    }
    const fd = new FormData();
    fd.set("first_name", first);
    fd.set("last_name", last);
    fd.set("phone", phoneRef.current?.value.trim() ?? "");
    setError(null);
    start(async () => {
      try {
        const created = await quickAdd(fd);
        if (created && "id" in created) {
          const opt = { id: created.id, name: created.name };
          setExtra((e) => [opt, ...e]);
          setSelected(opt);
          setAdding(false);
          setOpen(false);
          setQuery("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  return (
    <div ref={boxRef} className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      {/* The browser skips validation on hidden inputs, so the required check
          rides on a focusable mirror of the chosen name instead. */}
      {required && (
        <input
          tabIndex={-1}
          required
          aria-hidden
          value={selected?.name ?? ""}
          onChange={() => {}}
          onFocus={() => setOpen(true)}
          className="absolute bottom-2 left-3 h-0 w-0 border-0 bg-transparent p-0 opacity-0"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-black/15 bg-white px-3.5 text-left text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
      >
        <span className={selected ? "truncate text-ink" : "truncate text-ink/55"}>
          {selected ? selected.name : labels.placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label={labels.none}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setSelected(null);
                }
              }}
              className="rounded-lg p-2 text-muted transition hover:bg-mist hover:text-ink"
            >
              <X size={15} />
            </span>
          )}
          <ChevronDown size={16} className="text-muted" />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl shadow-black/10">
          {!adding ? (
            <>
              <div className="flex items-center gap-2 border-b border-black/[.06] px-3">
                <Search size={15} className="shrink-0 text-muted" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.search}
                  aria-label={labels.search}
                  className="h-11 w-full rounded-lg bg-transparent px-1 text-sm outline-none placeholder:text-ink/55 focus:ring-2 focus:ring-brand-500/25"
                />
              </div>

              <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
                {matches.length === 0 ? (
                  <li className="px-3.5 py-3 text-sm text-muted">{labels.noMatch}</li>
                ) : (
                  matches.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected?.id === p.id}
                        onClick={() => {
                          setSelected(p);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition hover:bg-mist"
                      >
                        <span className="truncate">
                          {p.name}
                          {p.phone && <span className="ml-2 text-xs tabular-nums text-muted">{p.phone}</span>}
                        </span>
                        {selected?.id === p.id && <Check size={15} className="shrink-0 text-brand-600" />}
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 border-t border-black/[.06] px-3.5 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
              >
                <UserPlus size={15} /> {labels.addNew}
              </button>
            </>
          ) : (
            // A nested <form> is invalid HTML, so this collects fields itself
            // and posts them through the quickAdd action.
            <div className="p-3.5">
              <p className="mb-3 text-sm font-semibold">{labels.addNew}</p>
              <div className="space-y-2.5" onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitQuickAdd();
                }
              }}>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    ref={firstNameRef}
                    placeholder={labels.firstName}
                    aria-label={labels.firstName}
                    className="h-11 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
                  />
                  <input
                    ref={lastNameRef}
                    placeholder={labels.lastName}
                    aria-label={labels.lastName}
                    className="h-11 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
                  />
                </div>
                <input
                  ref={phoneRef}
                  type="tel"
                  placeholder={labels.phone}
                  aria-label={labels.phone}
                  className="h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={submitQuickAdd}
                    disabled={pending}
                    className="h-10 flex-1 rounded-lg bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {labels.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setError(null); }}
                    className="h-10 rounded-lg border border-black/12 px-3 text-sm font-medium transition hover:bg-mist"
                  >
                    {labels.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

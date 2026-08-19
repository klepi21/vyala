"use client";

/**
 * Records when the form appeared, so the server can tell a person filling it
 * in from a bot posting instantly.
 *
 * The value is written straight onto the input when it mounts. Reading the
 * clock during render would be impure and would disagree between the server
 * and the browser, and a state update here would only cause a second render
 * for a value nobody looks at.
 */
export function FormOpenedAt({ name = "started_at" }: { name?: string }) {
  return (
    <input
      type="hidden"
      name={name}
      ref={(el) => {
        if (el && !el.value) el.value = String(Date.now());
      }}
    />
  );
}

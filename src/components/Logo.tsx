export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="#1d7e65" />
      {/* abstract V that doubles as an open ledger / heartbeat dip */}
      <path
        d="M8 10.5 L16 23 L24 10.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="23" r="2.1" fill="#82d2b7" />
    </svg>
  );
}

export function Logo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <LogoMark size={size} />
      <span
        className={`font-semibold tracking-tight ${dark ? "text-white" : "text-ink"}`}
        style={{ fontSize: size * 0.72 }}
      >
        vyala
      </span>
    </span>
  );
}

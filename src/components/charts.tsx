import type { ReactNode } from "react";

/**
 * Categorical palette, validated with the dataviz validator against a light
 * surface: lightness band, chroma floor, CVD separation, normal-vision floor
 * and contrast all pass. Hues are assigned in this fixed order and never
 * cycled or reordered by rank.
 */
export const SERIES = [
  "#0d9668", // green,  earnings
  "#c2620a", // amber,  expenses
  "#2563eb", // blue
  "#7c3aed", // violet
  "#0891b2", // teal
  "#be185d", // pink
] as const;

const GRID = "rgba(20,32,29,0.10)";

export function ChartFrame({
  title,
  subtitle,
  legend,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: { label: string; color: string }[];
  children: ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-black/[.07] bg-white p-5 shadow-[0_1px_2px_rgba(20,32,29,0.04)]">
      <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {legend && legend.length > 1 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5 text-xs text-ink/70">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </figcaption>
      {children}
    </figure>
  );
}

/**
 * Grouped vertical bars on one shared axis. Two measures of the same unit
 * (euros in, euros out) so a single scale is correct.
 */
export function GroupedBars({
  labels,
  series,
  formatValue,
  height = 200,
}: {
  labels: string[];
  series: { name: string; color: string; values: number[] }[];
  formatValue: (n: number) => string;
  height?: number;
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const ticks = [0, 0.5, 1].map((f) => max * f);
  const groupCount = labels.length || 1;

  return (
    <div>
      <div className="flex gap-2">
        <div
          className="flex w-14 shrink-0 flex-col justify-between pb-6 text-right text-[10px] tabular-nums text-muted"
          style={{ height: height + 24 }}
        >
          {[...ticks].reverse().map((t, i) => (
            <span key={i}>{formatValue(t)}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height }}>
            {ticks.map((_, i) => (
              <span
                key={i}
                className="absolute inset-x-0 border-t"
                style={{ borderColor: GRID, bottom: `${(i / (ticks.length - 1)) * 100}%` }}
              />
            ))}
            <div
              className="absolute inset-0 grid items-end"
              style={{ gridTemplateColumns: `repeat(${groupCount}, minmax(0, 1fr))` }}
            >
              {labels.map((label, gi) => (
                <div key={label} className="flex h-full items-end justify-center gap-[3px] px-1">
                  {series.map((s) => {
                    const v = s.values[gi] ?? 0;
                    const h = max > 0 ? (v / max) * 100 : 0;
                    return (
                      <div
                        key={s.name}
                        className="group relative flex h-full w-full max-w-7 items-end"
                        title={`${label} · ${s.name}: ${formatValue(v)}`}
                      >
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${Math.max(v > 0 ? 2 : 0, h)}%`,
                            background: s.color,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          }}
                        />
                        <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                          {s.name}: {formatValue(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-2 grid text-center text-[10px] text-muted"
            style={{ gridTemplateColumns: `repeat(${groupCount}, minmax(0, 1fr))` }}
          >
            {labels.map((l) => (
              <span key={l} className="truncate px-0.5">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ranked horizontal bars, for a breakdown where the label matters more than the shape. */
export function RankedBars({
  rows,
  formatValue,
  emptyLabel,
}: {
  rows: { label: string; value: number; color: string }[];
  formatValue: (n: number) => string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: r.color }} />
              <span className="truncate text-ink/75">{r.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink/60">
              <span className="font-medium text-ink">{formatValue(r.value)}</span>
              {total > 0 && <span className="ml-1.5 text-muted">{Math.round((r.value / total) * 100)}%</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/[.05]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: r.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Single trend line with a soft fill, for a count over time. */
export function TrendLine({
  labels,
  values,
  color = SERIES[2],
  formatValue,
  height = 160,
}: {
  labels: string[];
  values: number[];
  color?: string;
  formatValue: (n: number) => string;
  height?: number;
}) {
  const max = Math.max(1, ...values);
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = n === 1 ? 50 : (i / (n - 1)) * 100;
    const y = 100 - (v / max) * 100;
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`Trend, peak ${formatValue(max)}`}
        >
          {[0, 50, 100].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={GRID} strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={area} fill={color} opacity="0.10" />
          <polyline
            points={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0">
          {pts.map(([x, y], i) => (
            <span
              key={i}
              className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ background: color }}
              />
              <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                {labels[i]}: {formatValue(values[i])}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div
        className="mt-2 grid text-center text-[10px] text-muted"
        style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
      >
        {labels.map((l) => (
          <span key={l} className="truncate px-0.5">{l}</span>
        ))}
      </div>
    </div>
  );
}

import type { TooltipProps } from "recharts";

type Fmt = (v: number) => string;

export function ChartTooltip({ active, payload, label, format }: TooltipProps<number, string> & { format: Fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-lg border bg-popover/95 px-3 py-2.5 text-xs shadow-card backdrop-blur">
      {label !== undefined && <div className="mb-1.5 font-medium text-foreground">{label}</div>}
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ background: p.color ?? (p.payload as { fill?: string })?.fill }} />
              {p.name}
            </span>
            <span className="font-medium tabular text-foreground">{format(Number(p.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-muted-foreground)"];

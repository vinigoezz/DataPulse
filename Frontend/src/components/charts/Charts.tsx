import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, axisProps, CHART_COLORS } from "./ChartTooltip";
import { formatCurrency, formatCurrencyCompact, formatPercent } from "@/lib/format";

export function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const id = `sp-${positive ? "p" : "n"}`;
  const color = positive ? "var(--color-success)" : "var(--color-destructive)";
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#${id})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type Row = Record<string, string | number>;

export function RevenueAreaChart({ data, height = 300 }: { data: Row[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={64} tickFormatter={(v) => formatCurrencyCompact(v)} />
        <Tooltip content={<ChartTooltip format={formatCurrency} />} cursor={{ stroke: "var(--color-border)" }} />
        <Area type="monotone" name="Receita" dataKey="receita" stroke="var(--color-chart-1)" strokeWidth={2.2} fill="url(#gRev)" activeDot={{ r: 4, strokeWidth: 0 }} />
        <Area type="monotone" name="Custo" dataKey="custo" stroke="var(--color-chart-2)" strokeWidth={1.6} strokeDasharray="4 3" fill="url(#gCost)" activeDot={{ r: 3, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({ data, dataKey, name, height = 260, format = formatCurrency }: { data: Row[]; dataKey: string; name: string; height?: number; format?: (v: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={(v) => (format === formatCurrency ? formatCurrencyCompact(v) : String(Math.round(v)))} />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "var(--color-border)" }} />
        <Line type="monotone" name={name} dataKey={dataKey} stroke="var(--color-chart-2)" strokeWidth={2.2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data, height = 260, layout = "horizontal" }: { data: { name: string; receita: number }[]; height?: number; layout?: "horizontal" | "vertical" }) {
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={vertical} horizontal={!vertical} stroke="var(--color-border)" strokeDasharray="3 3" />
        {vertical ? <XAxis type="number" {...axisProps} tickFormatter={(v) => formatCurrencyCompact(v)} /> : <XAxis dataKey="name" {...axisProps} interval={0} />}
        {vertical ? <YAxis type="category" dataKey="name" {...axisProps} width={130} /> : <YAxis {...axisProps} width={64} tickFormatter={(v) => formatCurrencyCompact(v)} />}
        <Tooltip content={<ChartTooltip format={formatCurrency} />} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
        <Bar dataKey="receita" name="Receita" radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={36}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 220 }: { data: { name: string; receita: number }[]; height?: number }) {
  const total = data.reduce((s, d) => s + d.receita, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative w-full min-w-[140px] max-w-[220px] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="receita" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip format={formatCurrency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[11px] text-muted-foreground">Total</div>
            <div className="text-sm font-semibold tabular">{formatCurrencyCompact(total)}</div>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{d.name}</span>
            <span className="font-medium tabular">{formatPercent(total ? (d.receita / total) * 100 : 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Ranking({ items, max }: { items: { name: string; receita: number; sub?: string }[]; max?: number }) {
  const top = max ?? Math.max(...items.map((i) => i.receita), 1);
  return (
    <ol className="space-y-3.5">
      {items.map((it, i) => (
        <li key={it.name} className="group">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
              <span className="truncate">{it.name}</span>
              {it.sub && <span className="hidden text-xs text-muted-foreground sm:inline">{it.sub}</span>}
            </span>
            <span className="font-medium tabular">{formatCurrencyCompact(it.receita)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${(it.receita / top) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/format";
import { ChartTooltip, axisProps, CHART_COLORS } from "./ChartTooltip";

/** Um ponto ou uma barra: o nome mostrado e o valor. */
export interface ChartDatum {
  name: string;
  value: number;
}

type Format = (value: number) => string;

interface FormatProps {
  /** Valor completo, no tooltip (ex.: R$ 1.234,56). */
  format: Format;
  /** Valor curto, nos eixos (ex.: R$ 1,2 mil). */
  formatAxis: Format;
}

/** Evolução no tempo (área). Recharts exige os eixos como filhos diretos do gráfico. */
export function TrendChart({
  data,
  name,
  format,
  formatAxis,
  height = 300,
}: FormatProps & { data: ChartDatum[]; name: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="name" {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} width={72} tickFormatter={formatAxis} />
        <Tooltip
          content={<ChartTooltip format={format} />}
          cursor={{ stroke: "var(--color-border)" }}
        />
        <Area
          type="monotone"
          name={name}
          dataKey="value"
          stroke="var(--color-chart-1)"
          strokeWidth={2.2}
          fill="url(#trend-fill)"
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Comparação entre categorias (barras deitadas, a maior em cima). */
export function BarListChart({
  data,
  name,
  format,
  formatAxis,
}: FormatProps & { data: ChartDatum[]; name: string }) {
  const height = Math.max(160, data.length * 34 + 24);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis type="number" {...axisProps} tickFormatter={formatAxis} />
        <YAxis type="category" dataKey="name" {...axisProps} width={130} />
        <Tooltip
          content={<ChartTooltip format={format} />}
          cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
        />
        <Bar dataKey="value" name={name} radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Participação de cada categoria no total (rosca + legenda com %). */
export function DonutChart({
  data,
  format,
  formatAxis,
  height = 220,
}: FormatProps & { data: ChartDatum[]; height?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative w-full min-w-[140px] max-w-[220px] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip format={format} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[11px] text-muted-foreground">Total</div>
            <div className="text-sm font-semibold tabular">{formatAxis(total)}</div>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="font-medium tabular">
              {formatPercent(total ? (d.value / total) * 100 : 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

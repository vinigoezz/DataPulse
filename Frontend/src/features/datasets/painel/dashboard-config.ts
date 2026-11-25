import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatNumberCompact,
  formatPercent,
} from "@/lib/format";
import type {
  AggregateQuery,
  ColumnStats,
  ColumnType,
  Interval,
  Summary,
  ValueRange,
} from "../types";

export type Operation = "sum" | "mean" | "min" | "max" | "count";
export type Period = "tudo" | "30d" | "3m" | "12m";

/** O que a pessoa escolheu no Dashboard. */
export interface DashboardConfig {
  /** Coluna numérica medida; null = contar registros. */
  measure: string | null;
  operation: Operation;
  dateColumn: string | null;
  interval: Interval;
  /** Coluna de texto/categoria usada nas comparações. */
  groupBy: string | null;
  period: Period;
}

export const OPERATION_LABEL: Record<Operation, string> = {
  sum: "Soma",
  mean: "Média",
  min: "Mínimo",
  max: "Máximo",
  count: "Contagem",
};

export const INTERVAL_LABEL: Record<Interval, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
  trimestre: "Trimestre",
  ano: "Ano",
};

export const PERIOD_LABEL: Record<Period, string> = {
  tudo: "Todo o período",
  "30d": "Últimos 30 dias",
  "3m": "Últimos 3 meses",
  "12m": "Últimos 12 meses",
};

const MEASURE_PREFERENCE: ColumnType[] = ["moeda", "número", "percentual"];
const BREAKDOWN_LIMIT = 8;
const MAX_TEXT_GROUPS = 100;

export const measureColumns = (stats: ColumnStats[]) =>
  stats.filter((s) => MEASURE_PREFERENCE.includes(s.type));
export const dateColumns = (stats: ColumnStats[]) =>
  stats.filter((s) => s.type === "data" && s.start);
export const groupColumns = (stats: ColumnStats[]) =>
  stats.filter(
    (s) => s.type === "categoria" || (s.type === "texto" && s.distinct <= MAX_TEXT_GROUPS),
  );

/** Uma primeira configuração razoável, a partir dos tipos das colunas. */
export function defaultConfig(stats: ColumnStats[]): DashboardConfig {
  const measure = MEASURE_PREFERENCE.flatMap((type) => stats.filter((s) => s.type === type))[0];
  const date = dateColumns(stats)[0];
  return {
    measure: measure?.key ?? null,
    operation: defaultOperation(measure?.type ?? null),
    dateColumn: date?.key ?? null,
    interval: date ? suggestInterval(date.start ?? "", date.end ?? "") : "mes",
    groupBy: groupColumns(stats)[0]?.key ?? null,
    period: "tudo",
  };
}

/** Somar percentuais não faz sentido: para eles, a média. Sem medida, contagem. */
export function defaultOperation(type: ColumnType | null): Operation {
  if (type === null) return "count";
  return type === "percentual" ? "mean" : "sum";
}

/** Intervalo que dá um gráfico legível (nem 3 pontos, nem 1.000). */
export function suggestInterval(start: string, end: string): Interval {
  const days = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  if (!Number.isFinite(days) || days <= 45) return "dia";
  if (days <= 200) return "semana";
  if (days <= 3 * 365) return "mes";
  if (days <= 8 * 365) return "trimestre";
  return "ano";
}

/** Atalho de período → faixa na coluna de data, contando a partir da última data do arquivo. */
export function periodRange(period: Period, lastDate: string | null | undefined): ValueRange {
  if (period === "tudo" || !lastDate) return { min: "", max: "" };
  const end = new Date(`${lastDate.slice(0, 10)}T00:00:00Z`);
  const start = new Date(end);
  if (period === "30d") start.setUTCDate(start.getUTCDate() - 29);
  if (period === "3m") start.setUTCMonth(start.getUTCMonth() - 3);
  if (period === "12m") start.setUTCMonth(start.getUTCMonth() - 12);
  return { min: start.toISOString().slice(0, 10), max: "" };
}

/** Os pedidos à API: geral (cartões), por período (evolução) e por categoria (comparação). */
export function dashboardQueries(config: DashboardConfig, stats: ColumnStats[]) {
  const date = stats.find((s) => s.key === config.dateColumn);
  const ranges: Record<string, ValueRange> = date
    ? { [date.key]: periodRange(config.period, date.end) }
    : {};
  const base: AggregateQuery = {
    measure: config.operation === "count" ? null : config.measure,
    groupBy: null,
    interval: config.interval,
    limit: BREAKDOWN_LIMIT,
    filters: {},
    ranges,
  };
  return {
    overall: base,
    trend: config.dateColumn ? { ...base, groupBy: config.dateColumn } : null,
    breakdown: config.groupBy ? { ...base, groupBy: config.groupBy } : null,
  };
}

export function pickValue(summary: Summary, operation: Operation): number | null {
  return operation === "count" ? summary.count : summary[operation];
}

interface ValueFormat {
  format: (value: number) => string;
  formatAxis: (value: number) => string;
}

/** Como mostrar os valores da medida escolhida (contagem é sempre número). */
export function valueFormat(type: ColumnType | null, operation: Operation): ValueFormat {
  if (operation !== "count" && type === "moeda") {
    return { format: formatCurrency, formatAxis: formatCurrencyCompact };
  }
  if (operation !== "count" && type === "percentual") {
    const percent = (value: number) => formatPercent(value * 100);
    return { format: percent, formatAxis: percent };
  }
  return {
    format: (value) => formatNumber(Math.round(value * 100) / 100),
    formatAxis: formatNumberCompact,
  };
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Início do período (2026-01-01) → rótulo curto do eixo, conforme o intervalo. */
export function periodLabel(key: string, interval: Interval): string {
  const [year = "", month = "", day = ""] = key.slice(0, 10).split("-");
  const shortYear = year.slice(2);
  if (interval === "ano") return year;
  if (interval === "trimestre") return `T${Math.floor((Number(month) - 1) / 3) + 1}/${shortYear}`;
  if (interval === "mes") return `${MONTHS[Number(month) - 1] ?? month}/${shortYear}`;
  return `${day}/${month}/${shortYear}`;
}

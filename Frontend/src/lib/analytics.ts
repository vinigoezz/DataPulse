import type { Kpi, MonthlyPoint, SaleRecord } from "@/types";
import { monthLabel } from "./format";

export interface SalesFilter {
  months?: number; // last N months
  categorias?: string[];
  filial?: string;
  canal?: string;
}

export function filterSales(rows: SaleRecord[], f: SalesFilter): SaleRecord[] {
  let out = rows;
  if (f.months) {
    const allMonths = Array.from(new Set(rows.map((r) => r.data.slice(0, 7)))).sort();
    const keep = new Set(allMonths.slice(-f.months));
    out = out.filter((r) => keep.has(r.data.slice(0, 7)));
  }
  if (f.categorias?.length) out = out.filter((r) => f.categorias!.includes(r.categoria));
  if (f.filial && f.filial !== "todas") out = out.filter((r) => r.filial === f.filial);
  if (f.canal && f.canal !== "todos") out = out.filter((r) => r.canal === f.canal);
  return out;
}

export function monthly(rows: SaleRecord[]): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>();
  for (const r of rows) {
    const k = r.data.slice(0, 7);
    const p = map.get(k) ?? { month: k, label: monthLabel(k), receita: 0, custo: 0, pedidos: 0 };
    p.receita += r.receita;
    p.custo += r.custo;
    p.pedidos += 1;
    map.set(k, p);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function groupSum(rows: SaleRecord[], key: keyof SaleRecord) {
  const map = new Map<string, { name: string; receita: number; custo: number; pedidos: number }>();
  for (const r of rows) {
    const k = String(r[key]);
    const g = map.get(k) ?? { name: k, receita: 0, custo: 0, pedidos: 0 };
    g.receita += r.receita;
    g.custo += r.custo;
    g.pedidos += 1;
    map.set(k, g);
  }
  return [...map.values()].sort((a, b) => b.receita - a.receita);
}

const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

/** KPIs comparing the last month in range vs the previous month. */
export function computeKpis(rows: SaleRecord[]): Kpi[] {
  const m = monthly(rows);
  const cur = m.at(-1) ?? { receita: 0, custo: 0, pedidos: 0 };
  const prev = m.at(-2) ?? cur;
  const total = m.reduce((s, p) => s + p.receita, 0);
  const totalPrev = total - cur.receita + prev.receita;
  const pedidos = m.reduce((s, p) => s + p.pedidos, 0);
  const ticket = (p: { receita: number; pedidos: number }) => (p.pedidos ? p.receita / p.pedidos : 0);
  const margin = (p: { receita: number; custo: number }) => (p.receita ? ((p.receita - p.custo) / p.receita) * 100 : 0);
  return [
    { id: "receita", label: "Faturamento total", value: total, format: "currency", delta: pct(cur.receita, prev.receita), previous: totalPrev, trend: m.map((p) => p.receita) },
    { id: "pedidos", label: "Total de pedidos", value: pedidos, format: "number", delta: pct(cur.pedidos, prev.pedidos), previous: pedidos - cur.pedidos + prev.pedidos, trend: m.map((p) => p.pedidos) },
    { id: "ticket", label: "Ticket médio", value: pedidos ? total / pedidos : 0, format: "currency", delta: pct(ticket(cur), ticket(prev)), previous: ticket(prev), trend: m.map(ticket) },
    { id: "margem", label: "Margem de lucro", value: margin({ receita: total, custo: m.reduce((s, p) => s + p.custo, 0) }), format: "percent", delta: margin(cur) - margin(prev), previous: margin(prev), trend: m.map(margin) },
  ];
}

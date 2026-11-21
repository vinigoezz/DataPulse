/** Tipos ainda usados pelos dados de demonstração (dashboard e relatórios). */

export interface SaleRecord {
  id: string;
  data: string; // ISO date
  filial: string;
  categoria: string;
  produto: string;
  vendedor: string;
  quantidade: number;
  receita: number;
  custo: number;
  canal: string;
  desconto: number | null;
}

export interface MonthlyPoint {
  month: string; // YYYY-MM
  label: string;
  receita: number;
  custo: number;
  pedidos: number;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number; // percent change
  previous: number;
  trend: number[];
}

export interface ReportItem {
  id: string;
  name: string;
  datasetId: string;
  createdAt: string;
  type: "Desempenho" | "Financeiro" | "Operacional" | "Comercial";
  author: string;
}

export type DatasetStatus = "processado" | "processando" | "erro" | "pendente";

export interface Dataset {
  id: string;
  name: string;
  importedAt: string; // ISO
  rows: number;
  columns: number;
  sizeBytes: number;
  status: DatasetStatus;
  description: string;
}

export type ColumnType = "texto" | "número" | "moeda" | "data" | "categoria";

export interface ColumnSchema {
  key: string;
  label: string;
  type: ColumnType;
}

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

export interface ColumnStats {
  key: string;
  label: string;
  type: ColumnType;
  nulls: number;
  distinct: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface PaginatedRows<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

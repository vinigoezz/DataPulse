/**
 * Contratos da feature datasets. Espelham o backend (backend/app/features/datasets/):
 * ao mudar um lado, mude o outro.
 */

export type DatasetStatus = "processado" | "processando" | "erro" | "pendente";

export interface Dataset {
  id: string;
  name: string;
  importedAt: string; // ISO 8601
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

export interface ColumnStats extends ColumnSchema {
  nulls: number;
  distinct: number;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  /** Só em colunas "categoria": os valores possíveis, para filtrar. */
  values?: string[] | null;
}

export type Row = Record<string, unknown>;

export type SortOrder = "asc" | "desc";

/** Parâmetros de GET /api/datasets/{id}/rows. */
export interface RowsQuery {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>; // coluna -> valor exato
  sort: { column: string; order: SortOrder } | null;
}

export interface PaginatedRows {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
}

export const isNumericColumn = (type: ColumnType) => type === "número" || type === "moeda";

/** Filtros com valor escolhido ("" quer dizer "todos"). */
export function activeFilters(filters: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
}

/** Só datasets processados têm linhas para abrir no Explorador. */
export const canExplore = (dataset: Dataset) => dataset.status === "processado";

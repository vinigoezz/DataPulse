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

export type ColumnType = "texto" | "número" | "moeda" | "percentual" | "data" | "categoria";

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

/**
 * Faixa de uma coluna de número ou data, no formato que a API entende: números com ponto
 * decimal ("1500.5", percentuais como fração: "0.15") e datas ISO ("2026-01-31").
 * "" deixa aquele lado em aberto.
 */
export interface ValueRange {
  min: string;
  max: string;
}

/** Parâmetros de GET /api/datasets/{id}/rows. */
export interface RowsQuery {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>; // coluna -> valor exato
  ranges: Record<string, ValueRange>; // coluna -> entre mínimo e máximo
  sort: { column: string; order: SortOrder } | null;
}

export interface PaginatedRows {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
}

export const isNumericColumn = (type: ColumnType) =>
  type === "número" || type === "moeda" || type === "percentual";

/** Colunas que aceitam filtro "entre X e Y". */
export const isRangeColumn = (type: ColumnType) => isNumericColumn(type) || type === "data";

/** Filtros com valor escolhido ("" quer dizer "todos"). */
export function activeFilters(filters: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
}

/** Faixas com pelo menos um dos lados preenchido. */
export function activeRanges(ranges: Record<string, ValueRange>): Record<string, ValueRange> {
  return Object.fromEntries(
    Object.entries(ranges).filter(([, range]) => range.min !== "" || range.max !== ""),
  );
}

/** Só datasets processados têm linhas para abrir no Explorador. */
export const canExplore = (dataset: Dataset) => dataset.status === "processado";

import type { ColumnStats, Dataset, PaginatedRows, RowsQuery } from "../types";

/** O que as telas de datasets precisam da fonte de dados, seja a API ou a demonstração. */
export interface DatasetsApi {
  /** "demo" quando não há API configurada (VITE_API_URL ausente). */
  readonly mode: "api" | "demo";
  list(): Promise<Dataset[]>;
  get(id: string): Promise<Dataset>;
  remove(id: string): Promise<void>;
  rows(id: string, query: RowsQuery): Promise<PaginatedRows>;
  stats(id: string): Promise<ColumnStats[]>;
  upload(file: File, description?: string): Promise<Dataset>;
}

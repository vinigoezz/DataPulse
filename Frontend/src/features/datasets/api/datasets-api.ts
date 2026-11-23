import type { ColumnStats, Dataset, PaginatedRows, RowsQuery } from "../types";

/** O que as telas de datasets precisam da API. Uma interface permite trocar a fonte nos testes. */
export interface DatasetsApi {
  list(): Promise<Dataset[]>;
  get(id: string): Promise<Dataset>;
  remove(id: string): Promise<void>;
  rows(id: string, query: RowsQuery): Promise<PaginatedRows>;
  stats(id: string): Promise<ColumnStats[]>;
  upload(file: File, description?: string): Promise<Dataset>;
}

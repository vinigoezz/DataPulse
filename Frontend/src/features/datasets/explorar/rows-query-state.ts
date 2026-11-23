import type { RowsQuery } from "../types";

export const PAGE_SIZES = [10, 25, 50, 100] as const;

export const INITIAL_QUERY: RowsQuery = {
  page: 1,
  pageSize: 25,
  search: "",
  filters: {},
  ranges: {},
  sort: null,
};

/** Mudar busca, filtro, ordenação ou tamanho volta para a página 1. */
export function refine(query: RowsQuery, patch: Partial<Omit<RowsQuery, "page">>): RowsQuery {
  return { ...query, ...patch, page: 1 };
}

/** Clique no cabeçalho: crescente → decrescente → sem ordenação. */
export function nextSort(current: RowsQuery["sort"], column: string): RowsQuery["sort"] {
  if (current?.column !== column) return { column, order: "asc" };
  return current.order === "asc" ? { column, order: "desc" } : null;
}

export const pageCount = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize));

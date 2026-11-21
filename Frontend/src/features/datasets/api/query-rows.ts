import type { ColumnSchema, ColumnStats, PaginatedRows, Row, RowsQuery } from "../types";
import { activeFilters, isNumericColumn } from "../types";

const asText = (value: unknown) => (value === null || value === undefined ? "" : String(value));
const isEmpty = (value: unknown) => value === null || value === undefined || value === "";

/**
 * Busca, filtro, ordenação e paginação em memória, com as mesmas regras da API
 * (backend/app/features/datasets/linhas/consulta.py). Usada só na demonstração.
 */
export function queryRows(rows: Row[], query: RowsQuery): PaginatedRows {
  let selected = rows;
  for (const [column, value] of Object.entries(activeFilters(query.filters))) {
    selected = selected.filter((row) => asText(row[column]) === value);
  }
  const term = query.search.trim().toLowerCase();
  if (term) {
    selected = selected.filter((row) =>
      Object.values(row).some((value) => asText(value).toLowerCase().includes(term)),
    );
  }
  if (query.sort) selected = sortRows(selected, query.sort.column, query.sort.order);

  const start = (query.page - 1) * query.pageSize;
  return {
    rows: selected.slice(start, start + query.pageSize),
    total: selected.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function sortRows(rows: Row[], column: string, order: "asc" | "desc"): Row[] {
  const direction = order === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[column];
    const right = b[column];
    if (isEmpty(left) || isEmpty(right)) return Number(isEmpty(left)) - Number(isEmpty(right));
    const comparison =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : asText(left).localeCompare(asText(right), "pt-BR");
    return comparison * direction;
  });
}

/** Estatísticas por coluna, no mesmo formato de GET /api/datasets/{id}/stats. */
export function computeStats(rows: Row[], columns: ColumnSchema[]): ColumnStats[] {
  return columns.map((column) => {
    const values = rows.map((row) => row[column.key]);
    const filled = values.filter((value) => !isEmpty(value));
    const stats: ColumnStats = {
      ...column,
      nulls: values.length - filled.length,
      distinct: new Set(filled).size,
    };
    const numbers = filled.filter((value): value is number => typeof value === "number");
    if (isNumericColumn(column.type) && numbers.length) {
      stats.min = Math.min(...numbers);
      stats.max = Math.max(...numbers);
      stats.mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    }
    if (column.type === "categoria") stats.values = [...new Set(filled.map(asText))].sort();
    return stats;
  });
}

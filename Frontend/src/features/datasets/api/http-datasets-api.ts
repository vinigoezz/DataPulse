import { http } from "@/lib/http";
import {
  activeFilters,
  activeRanges,
  type AggregateQuery,
  type RowsQuery,
  type ValueRange,
} from "../types";
import type { DatasetsApi } from "./datasets-api";

const BASE = "/api/datasets";

export const httpDatasetsApi: DatasetsApi = {
  list: () => http(BASE),
  get: (id) => http(`${BASE}/${encodeURIComponent(id)}`),
  remove: (id) => http(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  rows: (id, query) => http(`${BASE}/${encodeURIComponent(id)}/rows?${rowsSearchParams(query)}`),
  stats: (id) => http(`${BASE}/${encodeURIComponent(id)}/stats`),
  aggregate: (id, query) =>
    http(`${BASE}/${encodeURIComponent(id)}/aggregate?${aggregateSearchParams(query)}`),
  upload: (file, description = "") => {
    const body = new FormData();
    body.append("file", file);
    body.append("description", description);
    return http(`${BASE}/upload`, { method: "POST", body });
  },
};

/** Converte a consulta do Explorador nos parâmetros que a API entende. */
export function rowsSearchParams(query: RowsQuery): URLSearchParams {
  const params = new URLSearchParams({
    page: String(query.page),
    page_size: String(query.pageSize),
  });
  const search = query.search.trim();
  if (search) params.set("search", search);
  setFilters(params, query);
  if (query.sort) {
    params.set("sort", query.sort.column);
    params.set("order", query.sort.order);
  }
  return params;
}

/** Converte o pedido do Dashboard nos parâmetros que a API entende. */
export function aggregateSearchParams(query: AggregateQuery): URLSearchParams {
  const params = new URLSearchParams({ interval: query.interval, limit: String(query.limit) });
  if (query.measure) params.set("measure", query.measure);
  if (query.groupBy) params.set("group_by", query.groupBy);
  setFilters(params, query);
  return params;
}

/** Filtros exatos e faixas: iguais nas linhas e na agregação. Só vai o que foi preenchido. */
function setFilters(
  params: URLSearchParams,
  { filters, ranges }: Pick<RowsQuery, "filters" | "ranges">,
) {
  const exact = activeFilters(filters);
  if (Object.keys(exact).length) params.set("filters", JSON.stringify(exact));
  const between = activeRanges(ranges);
  if (Object.keys(between).length) params.set("ranges", JSON.stringify(toApiRanges(between)));
}

/** {"min": "", "max": "10"} → {"max": "10"}: lados em aberto não são enviados. */
function toApiRanges(ranges: Record<string, ValueRange>) {
  return Object.fromEntries(
    Object.entries(ranges).map(([column, { min, max }]) => [
      column,
      { ...(min !== "" && { min }), ...(max !== "" && { max }) },
    ]),
  );
}

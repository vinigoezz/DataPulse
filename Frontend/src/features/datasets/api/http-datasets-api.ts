import { http } from "@/lib/http";
import { activeFilters, type RowsQuery } from "../types";
import type { DatasetsApi } from "./datasets-api";

const BASE = "/api/datasets";

export const httpDatasetsApi: DatasetsApi = {
  mode: "api",
  list: () => http(BASE),
  get: (id) => http(`${BASE}/${encodeURIComponent(id)}`),
  remove: (id) => http(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  rows: (id, query) => http(`${BASE}/${encodeURIComponent(id)}/rows?${rowsSearchParams(query)}`),
  stats: (id) => http(`${BASE}/${encodeURIComponent(id)}/stats`),
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
  const filters = activeFilters(query.filters);
  if (Object.keys(filters).length) params.set("filters", JSON.stringify(filters));
  if (query.sort) {
    params.set("sort", query.sort.column);
    params.set("order", query.sort.order);
  }
  return params;
}

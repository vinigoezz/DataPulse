import type { Dataset, DatasetStatus } from "../types";

export interface DatasetFilters {
  search: string;
  status: "todos" | DatasetStatus;
  order: "recentes" | "antigos";
}

export const DEFAULT_FILTERS: DatasetFilters = { search: "", status: "todos", order: "recentes" };

export function filterDatasets(datasets: Dataset[], filters: DatasetFilters): Dataset[] {
  const term = filters.search.trim().toLowerCase();
  const direction = filters.order === "recentes" ? -1 : 1;
  return datasets
    .filter((d) => d.name.toLowerCase().includes(term))
    .filter((d) => filters.status === "todos" || d.status === filters.status)
    .sort((a, b) => a.importedAt.localeCompare(b.importedAt) * direction);
}

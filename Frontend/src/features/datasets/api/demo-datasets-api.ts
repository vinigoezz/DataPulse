import { ApiError, delay } from "@/lib/http";
import { DATASETS } from "@/mocks/datasets";
import { SALES, SALES_COLUMNS } from "@/mocks/sales";
import type { Dataset, Row } from "../types";
import type { DatasetsApi } from "./datasets-api";
import { computeStats, queryRows } from "./query-rows";

/** Único dataset de demonstração que tem linhas de verdade. */
export const DEMO_DATASET_WITH_ROWS = "ds-vendas-2026";
const DEMO_ROWS = SALES as unknown as Row[];
const LATENCY_MS = 250; // simula a rede, para os estados de carregamento aparecerem

// Lista em memória: remover vale até recarregar a página.
let datasets: Dataset[] = [...DATASETS];

function find(id: string): Dataset {
  const dataset = datasets.find((d) => d.id === id);
  if (!dataset) throw new ApiError(404, `Dataset '${id}' não encontrado.`);
  return dataset;
}

function rowsOf(id: string): Row[] {
  find(id);
  if (id !== DEMO_DATASET_WITH_ROWS) {
    throw new ApiError(404, "Na demonstração, só vendas_2026.csv tem dados para explorar.");
  }
  return DEMO_ROWS;
}

export const demoDatasetsApi: DatasetsApi = {
  mode: "demo",
  async list() {
    await delay(LATENCY_MS);
    return [...datasets].sort((a, b) => b.importedAt.localeCompare(a.importedAt));
  },
  async get(id) {
    await delay(LATENCY_MS);
    return find(id);
  },
  async remove(id) {
    await delay(LATENCY_MS);
    find(id);
    datasets = datasets.filter((d) => d.id !== id);
  },
  async rows(id, query) {
    await delay(LATENCY_MS);
    return queryRows(rowsOf(id), query);
  },
  async stats(id) {
    await delay(LATENCY_MS);
    return computeStats(rowsOf(id), SALES_COLUMNS);
  },
  async upload() {
    throw new ApiError(0, "Importação indisponível na demonstração: configure VITE_API_URL.");
  },
};

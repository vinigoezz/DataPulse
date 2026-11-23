import type { DatasetsApi } from "./datasets-api";
import { httpDatasetsApi } from "./http-datasets-api";

export type { DatasetsApi } from "./datasets-api";

/** A fonte de dados das telas: a API do DataPulse (VITE_API_URL). */
export const datasetsApi: DatasetsApi = httpDatasetsApi;

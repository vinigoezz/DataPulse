import { isBackendConfigured } from "@/lib/http";
import type { DatasetsApi } from "./datasets-api";
import { demoDatasetsApi } from "./demo-datasets-api";
import { httpDatasetsApi } from "./http-datasets-api";

export type { DatasetsApi } from "./datasets-api";

/** A fonte de dados das telas: a API, se configurada; senão, a demonstração. */
export const datasetsApi: DatasetsApi = isBackendConfigured() ? httpDatasetsApi : demoDatasetsApi;

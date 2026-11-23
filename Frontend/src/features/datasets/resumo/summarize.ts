import type { Dataset } from "../types";

export interface DatasetsSummary {
  datasets: number;
  rows: number;
  sizeBytes: number;
  lastImportedAt: string | null;
}

/** Os números da página inicial, calculados a partir da lista real de datasets. */
export function summarize(datasets: Dataset[]): DatasetsSummary {
  return {
    datasets: datasets.length,
    rows: datasets.reduce((total, d) => total + d.rows, 0),
    sizeBytes: datasets.reduce((total, d) => total + d.sizeBytes, 0),
    lastImportedAt: datasets.reduce<string | null>(
      (latest, d) => (latest === null || d.importedAt > latest ? d.importedAt : latest),
      null,
    ),
  };
}

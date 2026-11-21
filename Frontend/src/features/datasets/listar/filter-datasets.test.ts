import { describe, expect, it } from "vitest";
import type { Dataset } from "../types";
import { DEFAULT_FILTERS, filterDatasets } from "./filter-datasets";

const dataset = (
  id: string,
  importedAt: string,
  status: Dataset["status"] = "processado",
): Dataset => ({
  id,
  name: `${id}.csv`,
  importedAt,
  rows: 1,
  columns: 1,
  sizeBytes: 1,
  status,
  description: "",
});

const DATASETS = [
  dataset("vendas", "2026-11-10T10:00:00"),
  dataset("despesas", "2026-11-12T10:00:00", "erro"),
  dataset("vendas-antigas", "2026-01-01T10:00:00"),
];

describe("filterDatasets", () => {
  it("ordena dos mais recentes para os mais antigos por padrão", () => {
    expect(filterDatasets(DATASETS, DEFAULT_FILTERS).map((d) => d.id)).toEqual([
      "despesas",
      "vendas",
      "vendas-antigas",
    ]);
  });

  it("combina busca pelo nome, status e ordem", () => {
    const result = filterDatasets(DATASETS, {
      search: "VENDAS",
      status: "processado",
      order: "antigos",
    });
    expect(result.map((d) => d.id)).toEqual(["vendas-antigas", "vendas"]);
  });

  it("não altera a lista original", () => {
    const original = [...DATASETS];
    filterDatasets(DATASETS, DEFAULT_FILTERS);
    expect(DATASETS).toEqual(original);
  });
});

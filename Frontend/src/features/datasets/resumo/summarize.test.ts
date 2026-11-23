import { describe, expect, it } from "vitest";
import type { Dataset } from "../types";
import { summarize } from "./summarize";

const dataset = (id: string, importedAt: string, rows: number, sizeBytes: number): Dataset => ({
  id,
  name: `${id}.csv`,
  importedAt,
  rows,
  columns: 3,
  sizeBytes,
  status: "processado",
  description: "",
});

describe("summarize", () => {
  it("soma linhas e tamanho e acha a importação mais recente", () => {
    const resumo = summarize([
      dataset("a", "2026-11-01T10:00:00Z", 100, 2048),
      dataset("b", "2026-11-20T08:00:00Z", 50, 1024),
      dataset("c", "2026-10-05T12:00:00Z", 1, 1),
    ]);
    expect(resumo).toEqual({
      datasets: 3,
      rows: 151,
      sizeBytes: 3073,
      lastImportedAt: "2026-11-20T08:00:00Z",
    });
  });

  it("sem datasets, tudo zerado e sem data", () => {
    expect(summarize([])).toEqual({ datasets: 0, rows: 0, sizeBytes: 0, lastImportedAt: null });
  });
});

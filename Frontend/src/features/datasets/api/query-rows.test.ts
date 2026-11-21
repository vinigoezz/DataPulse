import { describe, expect, it } from "vitest";
import type { Row, RowsQuery } from "../types";
import { computeStats, queryRows } from "./query-rows";

const ROWS: Row[] = [
  { filial: "São Paulo", produto: "Café", quantidade: 3, receita: 45.5 },
  { filial: "São Paulo", produto: "Pão", quantidade: 10, receita: 20 },
  { filial: "Recife", produto: "Café", quantidade: 1, receita: 15 },
  { filial: "Recife", produto: "Bolo", quantidade: 2, receita: null },
];

const query = (patch: Partial<RowsQuery> = {}): RowsQuery => ({
  page: 1,
  pageSize: 25,
  search: "",
  filters: {},
  sort: null,
  ...patch,
});

// Mesmos cenários de backend/tests/features/datasets/test_linhas.py: demo e API se comportam igual.
describe("queryRows", () => {
  it("busca em todas as colunas sem diferenciar maiúsculas", () => {
    const result = queryRows(ROWS, query({ search: "CAFÉ" }));
    expect(result.total).toBe(2);
  });

  it("filtra por valor exato, comparando como texto", () => {
    expect(queryRows(ROWS, query({ filters: { filial: "Recife" } })).total).toBe(2);
    expect(queryRows(ROWS, query({ filters: { quantidade: "10" } })).total).toBe(1);
    expect(queryRows(ROWS, query({ filters: { filial: "" } })).total).toBe(4); // "" = todos
  });

  it("ordena e deixa vazios no fim", () => {
    const asc = queryRows(ROWS, query({ sort: { column: "quantidade", order: "asc" } }));
    expect(asc.rows.map((r) => r["quantidade"])).toEqual([1, 2, 3, 10]);
    const desc = queryRows(ROWS, query({ sort: { column: "receita", order: "desc" } }));
    expect(desc.rows.at(-1)?.["receita"]).toBeNull();
  });

  it("pagina depois de filtrar e informa o total filtrado", () => {
    const result = queryRows(
      ROWS,
      query({
        filters: { filial: "Recife" },
        sort: { column: "quantidade", order: "desc" },
        pageSize: 1,
      }),
    );
    expect(result.total).toBe(2);
    expect(result.rows.map((r) => r["produto"])).toEqual(["Bolo"]);
  });
});

describe("computeStats", () => {
  it("calcula nulos, distintos, média e opções de categoria", () => {
    const stats = computeStats(ROWS, [
      { key: "filial", label: "Filial", type: "categoria" },
      { key: "receita", label: "Receita", type: "moeda" },
    ]);
    expect(stats[0]).toMatchObject({ distinct: 2, nulls: 0, values: ["Recife", "São Paulo"] });
    expect(stats[1]).toMatchObject({ nulls: 1, min: 15, max: 45.5 });
    expect(stats[1]?.mean).toBeCloseTo(26.83, 2);
  });
});

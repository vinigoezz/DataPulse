import { describe, expect, it } from "vitest";
import { aggregateSearchParams, rowsSearchParams } from "./http-datasets-api";

describe("rowsSearchParams", () => {
  it("envia só o que foi escolhido", () => {
    const params = rowsSearchParams({
      page: 2,
      pageSize: 50,
      search: "  ",
      filters: { filial: "" },
      ranges: { receita: { min: "", max: "" } },
      sort: null,
    });
    expect(params.toString()).toBe("page=2&page_size=50");
  });

  it("converte busca, filtros e ordenação para o formato da API", () => {
    const params = rowsSearchParams({
      page: 1,
      pageSize: 25,
      search: " café ",
      filters: { filial: "Recife", canal: "" },
      ranges: { receita: { min: "100", max: "" }, data: { min: "", max: "2026-01-31" } },
      sort: { column: "receita", order: "desc" },
    });
    expect(params.get("search")).toBe("café");
    expect(JSON.parse(params.get("filters") ?? "")).toEqual({ filial: "Recife" });
    expect(JSON.parse(params.get("ranges") ?? "")).toEqual({
      receita: { min: "100" },
      data: { max: "2026-01-31" },
    });
    expect(params.get("sort")).toBe("receita");
    expect(params.get("order")).toBe("desc");
  });
});

describe("aggregateSearchParams", () => {
  it("envia medida, agrupamento, intervalo, limite e filtros", () => {
    const params = aggregateSearchParams({
      measure: "total",
      groupBy: "data",
      interval: "mes",
      limit: 10,
      filters: { filial: "Recife" },
      ranges: { data: { min: "2026-01-01", max: "" } },
    });
    expect(params.get("measure")).toBe("total");
    expect(params.get("group_by")).toBe("data");
    expect(params.get("interval")).toBe("mes");
    expect(params.get("limit")).toBe("10");
    expect(JSON.parse(params.get("filters") ?? "")).toEqual({ filial: "Recife" });
    expect(JSON.parse(params.get("ranges") ?? "")).toEqual({ data: { min: "2026-01-01" } });
  });

  it("sem medida nem agrupamento, só o necessário", () => {
    const params = aggregateSearchParams({
      measure: null,
      groupBy: null,
      interval: "mes",
      limit: 10,
      filters: {},
      ranges: {},
    });
    expect(params.toString()).toBe("interval=mes&limit=10");
  });
});

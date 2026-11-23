import { describe, expect, it } from "vitest";
import { rowsSearchParams } from "./http-datasets-api";

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

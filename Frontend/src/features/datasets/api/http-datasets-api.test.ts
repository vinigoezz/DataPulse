import { describe, expect, it } from "vitest";
import { rowsSearchParams } from "./http-datasets-api";

describe("rowsSearchParams", () => {
  it("envia só o que foi escolhido", () => {
    const params = rowsSearchParams({
      page: 2,
      pageSize: 50,
      search: "  ",
      filters: { filial: "" },
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
      sort: { column: "receita", order: "desc" },
    });
    expect(params.get("search")).toBe("café");
    expect(JSON.parse(params.get("filters") ?? "")).toEqual({ filial: "Recife" });
    expect(params.get("sort")).toBe("receita");
    expect(params.get("order")).toBe("desc");
  });
});

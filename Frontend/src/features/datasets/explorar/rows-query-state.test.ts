import { describe, expect, it } from "vitest";
import { INITIAL_QUERY, nextSort, pageCount, refine } from "./rows-query-state";

describe("rows-query-state", () => {
  it("refinar a consulta volta para a página 1", () => {
    expect(refine({ ...INITIAL_QUERY, page: 7 }, { search: "x" })).toMatchObject({
      page: 1,
      search: "x",
    });
  });

  it("clique no cabeçalho alterna crescente → decrescente → sem ordenação", () => {
    const asc = nextSort(null, "receita");
    expect(asc).toEqual({ column: "receita", order: "asc" });
    const desc = nextSort(asc, "receita");
    expect(desc).toEqual({ column: "receita", order: "desc" });
    expect(nextSort(desc, "receita")).toBeNull();
    expect(nextSort(desc, "custo")).toEqual({ column: "custo", order: "asc" });
  });

  it("sempre há pelo menos uma página", () => {
    expect(pageCount(0, 25)).toBe(1);
    expect(pageCount(51, 25)).toBe(3);
  });
});

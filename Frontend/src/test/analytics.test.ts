import { describe, expect, it } from "vitest";
import { filterSales, computeKpis } from "@/lib/analytics";
import { SALES } from "@/mocks/sales";

describe("analytics", () => {
  it("period filter keeps only the last N months", () => {
    const months = new Set(filterSales(SALES, { months: 3 }).map((r) => r.data.slice(0, 7)));
    expect(months.size).toBe(3);
  });
  it("category filter changes KPIs", () => {
    const all = computeKpis(SALES)[0]!.value;
    const one = computeKpis(filterSales(SALES, { categorias: ["Software"] }))[0]!.value;
    expect(one).toBeLessThan(all);
  });
});

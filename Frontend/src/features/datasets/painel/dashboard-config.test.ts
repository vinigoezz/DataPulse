import { describe, expect, it } from "vitest";
import type { ColumnStats } from "../types";
import {
  dashboardQueries,
  defaultConfig,
  periodLabel,
  periodRange,
  pickValue,
  suggestInterval,
  valueFormat,
} from "./dashboard-config";

const column = (key: string, type: ColumnStats["type"], extra: Partial<ColumnStats> = {}) =>
  ({ key, label: key, type, nulls: 0, distinct: 5, ...extra }) as ColumnStats;

const STATS: ColumnStats[] = [
  column("data", "data", { start: "2025-01-03T00:00:00", end: "2026-06-30T00:00:00" }),
  column("cliente", "texto", { distinct: 5000 }),
  column("filial", "categoria"),
  column("quantidade", "número"),
  column("total", "moeda"),
  column("desconto", "percentual"),
];

describe("defaultConfig", () => {
  it("prefere moeda, a primeira data e a primeira categoria", () => {
    expect(defaultConfig(STATS)).toEqual({
      measure: "total",
      operation: "sum",
      dateColumn: "data",
      interval: "mes",
      groupBy: "filial",
      period: "tudo",
    });
  });

  it("sem números, conta registros; texto com muitos valores não vira agrupamento", () => {
    const config = defaultConfig([column("cliente", "texto", { distinct: 5000 })]);
    expect(config).toMatchObject({ measure: null, operation: "count", groupBy: null });
  });

  it("percentual usa média", () => {
    expect(defaultConfig([column("desconto", "percentual")]).operation).toBe("mean");
  });
});

describe("suggestInterval", () => {
  it.each([
    ["2026-01-01", "2026-01-20", "dia"],
    ["2026-01-01", "2026-05-01", "semana"],
    ["2024-01-01", "2026-06-01", "mes"],
    ["2019-01-01", "2026-01-01", "trimestre"],
    ["2000-01-01", "2026-01-01", "ano"],
  ])("%s a %s → %s", (start, end, interval) => {
    expect(suggestInterval(start, end)).toBe(interval);
  });
});

describe("periodRange", () => {
  it("conta a partir da última data do arquivo", () => {
    expect(periodRange("30d", "2026-06-30T00:00:00")).toEqual({ min: "2026-06-01", max: "" });
    expect(periodRange("3m", "2026-06-30T00:00:00")).toEqual({ min: "2026-03-30", max: "" });
    expect(periodRange("12m", "2026-06-30")).toEqual({ min: "2025-06-30", max: "" });
    expect(periodRange("tudo", "2026-06-30")).toEqual({ min: "", max: "" });
  });
});

describe("dashboardQueries", () => {
  it("monta geral, evolução e comparação com o mesmo período", () => {
    const queries = dashboardQueries({ ...defaultConfig(STATS), period: "3m" }, STATS);
    expect(queries.overall).toMatchObject({ measure: "total", groupBy: null });
    expect(queries.trend).toMatchObject({ groupBy: "data", interval: "mes" });
    expect(queries.breakdown).toMatchObject({ groupBy: "filial", limit: 8 });
    expect(queries.trend?.ranges).toEqual({ data: { min: "2026-03-30", max: "" } });
  });

  it("contagem não envia medida; sem data, sem evolução", () => {
    const queries = dashboardQueries(
      { ...defaultConfig(STATS), operation: "count", dateColumn: null },
      STATS,
    );
    expect(queries.overall.measure).toBeNull();
    expect(queries.trend).toBeNull();
  });
});

describe("valores", () => {
  const summary = { count: 4, sum: 80.5, mean: 26.8, min: 15, max: 45.5 };
  it("escolhe o valor da operação", () => {
    expect(pickValue(summary, "sum")).toBe(80.5);
    expect(pickValue(summary, "count")).toBe(4);
  });

  it("formata conforme o tipo; contagem é sempre número", () => {
    expect(valueFormat("moeda", "sum").format(1234.5)).toMatch(/^R\$\s?1\.234,50$/);
    expect(valueFormat("percentual", "mean").format(0.155)).toBe("15,5%");
    expect(valueFormat("moeda", "count").format(1234)).toBe("1.234");
  });

  it("rótulos de período curtos", () => {
    expect(periodLabel("2026-03-01", "mes")).toBe("mar/26");
    expect(periodLabel("2026-04-01", "trimestre")).toBe("T2/26");
    expect(periodLabel("2026-01-05", "dia")).toBe("05/01/26");
    expect(periodLabel("2026-01-01", "ano")).toBe("2026");
  });
});

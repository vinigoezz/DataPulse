import { describe, expect, it } from "vitest";
import { describeRange, toApiValue, toInputValue } from "./range-input";

describe("toApiValue", () => {
  it("entende números brasileiros e com ponto decimal", () => {
    expect(toApiValue("1.234,56", "moeda")).toBe("1234.56");
    expect(toApiValue("45,5", "número")).toBe("45.5");
    expect(toApiValue("1234.5", "número")).toBe("1234.5");
    expect(toApiValue("-3", "número")).toBe("-3");
  });

  it("percentual é digitado como aparece na tela e vai como fração", () => {
    expect(toApiValue("15", "percentual")).toBe("0.15");
    expect(toApiValue("12,5", "percentual")).toBe("0.125");
  });

  it("vazio é lado aberto; texto estranho é inválido", () => {
    expect(toApiValue("  ", "moeda")).toBe("");
    expect(toApiValue("abc", "moeda")).toBeNull();
    expect(toApiValue("1,2,3", "número")).toBeNull();
  });

  it("datas vêm do seletor de data no formato ISO", () => {
    expect(toApiValue("2026-01-31", "data")).toBe("2026-01-31");
    expect(toApiValue("31/01/2026", "data")).toBeNull();
  });
});

describe("toInputValue", () => {
  it("volta ao formato de digitação", () => {
    expect(toInputValue("1234.56", "moeda")).toBe("1234,56");
    expect(toInputValue("0.125", "percentual")).toBe("12,5");
    expect(toInputValue("2026-01-31", "data")).toBe("2026-01-31");
    expect(toInputValue("", "número")).toBe("");
  });
});

describe("describeRange", () => {
  it("descreve a faixa com o formato da coluna", () => {
    expect(describeRange({ min: "100", max: "500" }, "moeda")).toMatch(
      /^R\$\s?100,00 a R\$\s?500,00$/,
    );
    expect(describeRange({ min: "0.15", max: "" }, "percentual")).toBe("a partir de 15,0%");
    expect(describeRange({ min: "", max: "2026-01-31" }, "data")).toBe("até 31/01/2026");
  });
});

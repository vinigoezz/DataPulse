import { describe, expect, it } from "vitest";
import { fileKind, previewIssues, rejectReason } from "./preview";

const file = (name: string, content = "a,b\n1,2\n") => new File([content], name);

describe("fileKind", () => {
  it("reconhece CSV, compactados e o resto", () => {
    expect(fileKind("vendas.CSV")).toBe("csv");
    expect(fileKind("vendas.zip")).toBe("compressed");
    expect(fileKind("vendas.csv.gz")).toBe("compressed");
    expect(fileKind("planilha.xlsx")).toBe("unsupported");
  });
});

describe("rejectReason", () => {
  it("aceita CSV e compactados com conteúdo", () => {
    expect(rejectReason(file("ok.csv"))).toBeNull();
    expect(rejectReason(file("ok.zip"))).toBeNull();
  });

  it("recusa formato errado e arquivo vazio", () => {
    expect(rejectReason(file("planilha.xlsx"))).toMatch(/Formato não suportado/);
    expect(rejectReason(file("vazio.csv", ""))).toMatch(/vazio/);
  });
});

describe("previewIssues", () => {
  it("não reclama de uma prévia correta", () => {
    expect(previewIssues({ headers: ["a", "b"], rows: [["1", "2"]], delimiter: "," })).toEqual([]);
  });

  it("aponta uma coluna só, duplicadas, sem nome e linhas tortas", () => {
    expect(previewIssues({ headers: ["a;b"], rows: [], delimiter: "," })[0]).toMatch(
      /apenas uma coluna/,
    );
    const issues = previewIssues({ headers: ["a", "a", ""], rows: [["1"]], delimiter: "," });
    expect(issues).toEqual([
      "Colunas duplicadas: a",
      "Existem colunas sem nome no cabeçalho.",
      "1 linha(s) da prévia com quantidade de colunas diferente do cabeçalho.",
    ]);
  });
});

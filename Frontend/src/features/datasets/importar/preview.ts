import Papa from "papaparse";

export const PREVIEW_ROWS = 20;
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // mesmo padrão de DATAPULSE_MAX_UPLOAD_MB
export const ACCEPTED_EXTENSIONS = ".csv,.zip,.gz";

export type FileKind = "csv" | "compressed" | "unsupported";

export interface CsvPreview {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

export function fileKind(name: string): FileKind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".zip") || lower.endsWith(".gz")) return "compressed";
  return "unsupported";
}

/** Motivo para recusar o arquivo antes de qualquer leitura, ou null se ele pode seguir. */
export function rejectReason(file: File): string | null {
  if (fileKind(file.name) === "unsupported")
    return "Formato não suportado. Selecione um arquivo .csv, .zip ou .gz.";
  if (file.size === 0) return "O arquivo está vazio.";
  if (file.size > MAX_UPLOAD_BYTES)
    return "O arquivo passa de 200 MB. Compacte-o em .zip ou .gz e tente de novo.";
  return null;
}

/** Lê só o cabeçalho e as primeiras linhas: o arquivo inteiro nunca é carregado no navegador. */
export function readPreview(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      preview: PREVIEW_ROWS + 1,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const [headers = [], ...rows] = data;
        if (headers.length === 0) reject(new Error("Não foi possível ler o cabeçalho do arquivo."));
        else resolve({ headers, rows, delimiter: meta.delimiter });
      },
      error: (error) => reject(new Error(`Falha ao ler o arquivo: ${error.message}`)),
    });
  });
}

/** Avisos sobre a estrutura da prévia. Não impedem a importação; a API faz a validação final. */
export function previewIssues({ headers, rows }: CsvPreview): string[] {
  const issues: string[] = [];
  if (headers.length < 2)
    issues.push("Foi encontrada apenas uma coluna. Verifique o delimitador do arquivo.");
  const duplicated = [...new Set(headers.filter((h, i) => headers.indexOf(h) !== i))];
  if (duplicated.length) issues.push(`Colunas duplicadas: ${duplicated.join(", ")}`);
  if (headers.some((h) => !h.trim())) issues.push("Existem colunas sem nome no cabeçalho.");
  const ragged = rows.filter((r) => r.length !== headers.length).length;
  if (ragged)
    issues.push(`${ragged} linha(s) da prévia com quantidade de colunas diferente do cabeçalho.`);
  return issues;
}

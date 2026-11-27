import { AlertTriangle, Check, FileArchive, FileSpreadsheet } from "lucide-react";
import type { ReactNode } from "react";
import { Panel } from "@/components/layout/PageHeader";
import { formatBytes, formatNumber } from "@/lib/format";
import { fileKind, previewIssues, type CsvPreview } from "./preview";

/** Resumo do arquivo escolhido e, para CSV, a prévia das primeiras linhas. */
export function PreviewPanel({ file, preview }: { file: File; preview: CsvPreview | null }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Info
          label="Arquivo"
          icon={<FileSpreadsheet className="size-4" />}
          value={<span className="font-mono text-sm">{file.name}</span>}
        />
        <Info label="Tamanho" value={formatBytes(file.size)} />
        <Info
          label="Colunas encontradas"
          value={preview ? formatNumber(preview.headers.length) : "—"}
        />
        <Info
          label="Delimitador"
          value={
            preview ? (
              <code className="font-mono">
                {preview.delimiter === "\t" ? "tab" : preview.delimiter}
              </code>
            ) : fileKind(file.name) === "excel" ? (
              "não se aplica"
            ) : (
              "automático"
            )
          }
        />
      </div>
      {preview ? <CsvPreviewDetails preview={preview} /> : <NoPreviewNotice name={file.name} />}
    </>
  );
}

function CsvPreviewDetails({ preview }: { preview: CsvPreview }) {
  const issues = previewIssues(preview);
  return (
    <>
      {issues.length > 0 ? (
        <div className="space-y-1 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4 text-warning" /> Avisos de validação
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm">
          <Check className="size-4 text-success" /> Estrutura da prévia validada sem avisos.
        </div>
      )}
      <Panel
        title="Prévia"
        description={`Primeiras ${preview.rows.length} linhas · a prévia não lê o arquivo inteiro`}
      >
        <div className="-mx-5 -mb-5 overflow-auto border-t" style={{ maxHeight: 420 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr>
                {preview.headers.map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap border-b px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h || <em>sem nome</em>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                  {preview.headers.map((_, j) => (
                    <td key={j} className="whitespace-nowrap px-4 py-2 tabular">
                      {row[j] ?? <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function NoPreviewNotice({ name }: { name: string }) {
  const excel = fileKind(name) === "excel";
  return (
    <div className="flex items-start gap-2 rounded-xl border bg-muted/40 p-4 text-sm">
      {excel ? (
        <FileSpreadsheet className="mt-0.5 size-4 text-primary" />
      ) : (
        <FileArchive className="mt-0.5 size-4 text-primary" />
      )}
      <p className="text-muted-foreground">
        {excel
          ? "Planilhas Excel não têm prévia no navegador. A API lê a primeira aba, ignora linhas e colunas em branco e reconhece números, datas, R$ e % ao importar."
          : "Arquivos compactados não têm prévia no navegador. A API descompacta, detecta o separador e valida o CSV ao importar."}
      </p>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="surface-card p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-1.5 truncate text-lg font-semibold tabular">{value}</div>
    </div>
  );
}

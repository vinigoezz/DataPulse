import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { AlertTriangle, Check, FileSpreadsheet, RotateCcw, ServerOff, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BackendNotice, PageHeader, Panel } from "@/components/layout/PageHeader";
import { formatBytes, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isBackendConfigured } from "@/services/http";
import { datasetsService } from "@/services/datasets.service";
import type { Dataset } from "@/types";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar dados — Data Pulse" },
      { name: "description", content: "Selecione um arquivo CSV, valide e visualize a prévia antes de importar." },
      { property: "og:title", content: "Importar dados — Data Pulse" },
      { property: "og:description", content: "Selecione um arquivo CSV, valide e visualize a prévia antes de importar." },
    ],
  }),
  component: ImportPage,
});

const STEPS = ["Selecionar arquivo", "Validar dados", "Visualizar prévia", "Concluir importação"];
const PREVIEW_ROWS = 20;
const PLANNED_LIMIT = 200 * 1024 * 1024;

interface Preview { file: File; headers: string[]; rows: string[][]; issues: string[]; delimiter: string }

function ImportPage() {
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const [uploaded, setUploaded] = useState<Dataset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setStep(0); setPreview(null); setError(null); setProgress(0); setUploaded(null); if (inputRef.current) inputRef.current.value = ""; };

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") { setError("Formato não suportado. Selecione um arquivo .csv."); return; }
    if (file.size === 0) { setError("O arquivo está vazio."); return; }
    setStep(1);
    setProgress(15);
    // Streams only the first rows — the full file is never loaded into memory.
    Papa.parse<string[]>(file, {
      preview: PREVIEW_ROWS + 1,
      skipEmptyLines: true,
      complete: (res) => {
        setProgress(100);
        const [headers = [], ...rows] = res.data;
        const issues: string[] = [];
        if (headers.length < 2) issues.push("Foi encontrada apenas uma coluna. Verifique o delimitador do arquivo.");
        const dup = headers.filter((h, i) => headers.indexOf(h) !== i);
        if (dup.length) issues.push(`Colunas duplicadas: ${[...new Set(dup)].join(", ")}`);
        if (headers.some((h) => !h.trim())) issues.push("Existem colunas sem nome no cabeçalho.");
        const ragged = rows.filter((r) => r.length !== headers.length).length;
        if (ragged) issues.push(`${ragged} linha(s) da prévia com quantidade de colunas diferente do cabeçalho.`);
        if (file.size > PLANNED_LIMIT) issues.push("Arquivo acima de 200 MB — o limite planejado para o processamento futuro.");
        if (!headers.length) { setError("Não foi possível ler o cabeçalho do arquivo."); setStep(0); return; }
        setPreview({ file, headers, rows, issues, delimiter: res.meta.delimiter });
        setTimeout(() => setStep(2), 300);
      },
      error: (err) => { setError(`Falha ao ler o arquivo: ${err.message}`); setStep(0); },
    });
  }, []);

  const finish = async () => {
    if (!isBackendConfigured() || !preview) {
      setStep(3);
      toast.warning("Backend não conectado", { description: "O arquivo não foi enviado. A importação será concluída após a integração com a API." });
      return;
    }
    setSending(true);
    try {
      const dataset = await datasetsService.upload(preview.file);
      setUploaded(dataset);
      setStep(3);
      toast.success("Importação concluída", { description: `${dataset.name}: ${formatNumber(dataset.rows)} linhas.` });
    } catch (err) {
      toast.error("Falha na importação", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Importar dados" description="Selecione um arquivo CSV e confira uma prévia local antes da importação." />

      <ol className="surface-card grid grid-cols-2 gap-3 p-4 md:grid-cols-4" aria-label="Etapas da importação">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3" aria-current={i === step ? "step" : undefined}>
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
              i < step && "border-transparent bg-success text-primary-foreground",
              i === step && "border-transparent bg-gradient-brand text-primary-foreground shadow-brand",
              i > step && "text-muted-foreground")}>
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={cn("surface-card relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden border-2 border-dashed px-6 py-16 text-center transition-all md:py-24",
            drag ? "border-primary bg-primary/5" : "hover:border-primary/50")}
        >
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
          <span className={cn("relative grid size-16 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-brand transition-transform", drag && "scale-110")}>
            <UploadCloud className="size-7" />
          </span>
          <div className="relative space-y-1">
            <p className="text-lg font-semibold">Arraste seu arquivo CSV até aqui</p>
            <p className="text-sm text-muted-foreground">Ou clique para selecionar um arquivo</p>
          </div>
          <div className="relative flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border bg-background/60 px-2 py-1">Formato aceito: .csv</span>
            <span className="rounded-md border bg-background/60 px-2 py-1">Delimitadores , ; | e tab</span>
            <span className="rounded-md border bg-background/60 px-2 py-1">Planejado: até 200 MB</span>
          </div>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 text-destructive" />
          <div className="flex-1"><p className="font-medium">Não foi possível validar o arquivo</p><p className="text-muted-foreground">{error}</p></div>
          <Button variant="ghost" size="icon" onClick={() => setError(null)} aria-label="Fechar"><X /></Button>
        </div>
      )}

      {step === 1 && (
        <Panel title="Validando dados" description="Lendo cabeçalho e primeiras linhas localmente no navegador">
          <Progress value={progress} className="h-2" />
        </Panel>
      )}

      {preview && step >= 2 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Info label="Arquivo" value={<span className="font-mono text-sm">{preview.file.name}</span>} icon={<FileSpreadsheet className="size-4" />} />
            <Info label="Tamanho" value={formatBytes(preview.file.size)} />
            <Info label="Colunas encontradas" value={formatNumber(preview.headers.length)} />
            <Info label="Delimitador" value={<code className="font-mono">{preview.delimiter === "\t" ? "tab" : preview.delimiter}</code>} />
          </div>

          {preview.issues.length > 0 ? (
            <div className="space-y-1 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium"><AlertTriangle className="size-4 text-warning" /> Avisos de validação</p>
              <ul className="list-disc pl-6 text-muted-foreground">{preview.issues.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm"><Check className="size-4 text-success" /> Estrutura da prévia validada sem avisos.</div>
          )}

          <Panel title="Prévia" description={`Primeiras ${preview.rows.length} linhas · a prévia não lê o arquivo inteiro`}>
            <div className="-mx-5 -mb-5 overflow-auto border-t" style={{ maxHeight: 420 }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr>{preview.headers.map((h, i) => <th key={i} className="whitespace-nowrap border-b px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h || <em>sem nome</em>}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                      {preview.headers.map((_, j) => <td key={j} className="whitespace-nowrap px-4 py-2 tabular">{r[j] ?? <span className="text-muted-foreground">—</span>}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {step === 2 && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="soft" onClick={reset}><RotateCcw /> Escolher outro arquivo</Button>
              <Button variant="brand" onClick={finish} disabled={sending}>{sending ? "Enviando…" : "Concluir importação"}</Button>
            </div>
          )}

          {step === 3 && uploaded && (
            <Panel>
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="grid size-12 place-items-center rounded-xl border bg-muted text-success"><Check className="size-5" /></span>
                <p className="font-medium">Importação concluída</p>
                <p className="max-w-md text-sm text-muted-foreground"><strong>{uploaded.name}</strong> foi processado pela API: {formatNumber(uploaded.rows)} linhas e {formatNumber(uploaded.columns)} colunas.</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="soft" onClick={reset}>Importar outro</Button>
                  <Button asChild variant="brand"><Link to="/datasets">Ver datasets</Link></Button>
                </div>
              </div>
            </Panel>
          )}

          {step === 3 && !uploaded && (
            <Panel>
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="grid size-12 place-items-center rounded-xl border bg-muted text-warning"><ServerOff className="size-5" /></span>
                <p className="font-medium">Prévia concluída — envio aguardando backend</p>
                <p className="max-w-md text-sm text-muted-foreground">O arquivo foi validado apenas no seu navegador e <strong>não foi enviado</strong>. O processamento será feito pela API (<code className="font-mono">POST /api/datasets/upload</code>) quando estiver disponível.</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="soft" onClick={reset}>Importar outro</Button>
                  <Button asChild variant="brand"><Link to="/datasets">Ver datasets</Link></Button>
                </div>
              </div>
            </Panel>
          )}
        </>
      )}

      <BackendNotice>O processamento definitivo de arquivos (incluindo arquivos grandes) depende do backend FastAPI, ainda não conectado.</BackendNotice>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="surface-card p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</p>
      <div className="mt-1.5 truncate text-lg font-semibold tabular">{value}</div>
    </div>
  );
}

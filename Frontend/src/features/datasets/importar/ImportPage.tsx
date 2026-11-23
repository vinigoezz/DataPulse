import { AlertTriangle, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageHeader, Panel } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import { useUploadDataset } from "../queries";
import type { Dataset } from "../types";
import { DropZone } from "./DropZone";
import { ImportResult } from "./ImportResult";
import { ImportSteps } from "./ImportSteps";
import { PreviewPanel } from "./PreviewPanel";
import { fileKind, readPreview, rejectReason, type CsvPreview } from "./preview";

type Stage =
  | { step: "selecionar" }
  | { step: "validar" }
  | { step: "previa"; file: File; preview: CsvPreview | null }
  | { step: "concluido"; file: File; preview: CsvPreview | null; dataset: Dataset };

const STEP_INDEX: Record<Stage["step"], number> = {
  selecionar: 0,
  validar: 1,
  previa: 2,
  concluido: 3,
};

export function ImportPage() {
  const [stage, setStage] = useState<Stage>({ step: "selecionar" });
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const upload = useUploadDataset();

  const restart = () => {
    setStage({ step: "selecionar" });
    setError(null);
    setDescription("");
  };

  const selectFile = async (file: File) => {
    setError(null);
    const reason = rejectReason(file);
    if (reason) return setError(reason);
    if (fileKind(file.name) === "compressed")
      return setStage({ step: "previa", file, preview: null });

    setStage({ step: "validar" });
    try {
      setStage({ step: "previa", file, preview: await readPreview(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStage({ step: "selecionar" });
    }
  };

  const finish = (file: File, preview: CsvPreview | null) => {
    upload.mutate(
      { file, description: description.trim() },
      {
        onSuccess: (dataset) => {
          toast.success("Importação concluída", {
            description: `${dataset.name}: ${formatNumber(dataset.rows)} linhas.`,
          });
          setStage({ step: "concluido", file, preview, dataset });
        },
        onError: (err) => toast.error("Falha na importação", { description: err.message }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar dados"
        description="Selecione um arquivo CSV e confira uma prévia antes da importação."
      />
      <ImportSteps current={STEP_INDEX[stage.step]} />

      {stage.step === "selecionar" && <DropZone onFile={selectFile} />}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {stage.step === "validar" && (
        <Panel
          title="Validando dados"
          description="Lendo cabeçalho e primeiras linhas no navegador"
        >
          <Progress value={50} className="h-2" />
        </Panel>
      )}

      {(stage.step === "previa" || stage.step === "concluido") && (
        <PreviewPanel file={stage.file} preview={stage.preview} />
      )}

      {stage.step === "previa" && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            className="h-9 md:max-w-sm"
            aria-label="Descrição do dataset"
            disabled={upload.isPending}
          />
          <div className="flex gap-2">
            <Button variant="soft" onClick={restart} disabled={upload.isPending}>
              <RotateCcw /> Escolher outro arquivo
            </Button>
            <Button
              variant="brand"
              onClick={() => finish(stage.file, stage.preview)}
              disabled={upload.isPending}
            >
              {upload.isPending ? "Enviando…" : "Concluir importação"}
            </Button>
          </div>
        </div>
      )}

      {stage.step === "concluido" && <ImportResult dataset={stage.dataset} onRestart={restart} />}
    </div>
  );
}

function ErrorAlert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 size-4 text-destructive" />
      <div className="flex-1">
        <p className="font-medium">Não foi possível usar este arquivo</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
        <X />
      </Button>
    </div>
  );
}

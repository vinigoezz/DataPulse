import { Link } from "@tanstack/react-router";
import { Check, ServerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import type { Dataset } from "../types";

/** Fim da importação: o dataset criado, ou o aviso de que não há API na demonstração. */
export function ImportResult({
  dataset,
  onRestart,
}: {
  dataset: Dataset | null;
  onRestart: () => void;
}) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        {dataset ? (
          <>
            <span className="grid size-12 place-items-center rounded-xl border bg-muted text-success">
              <Check className="size-5" />
            </span>
            <p className="font-medium">Importação concluída</p>
            <p className="max-w-md text-sm text-muted-foreground">
              <strong>{dataset.name}</strong> foi processado: {formatNumber(dataset.rows)} linhas e{" "}
              {formatNumber(dataset.columns)} colunas.
            </p>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-xl border bg-muted text-warning">
              <ServerOff className="size-5" />
            </span>
            <p className="font-medium">Prévia concluída: a API não está configurada</p>
            <p className="max-w-md text-sm text-muted-foreground">
              O arquivo foi validado só no seu navegador e <strong>não foi enviado</strong>. Defina{" "}
              <code className="font-mono">VITE_API_URL</code> para importar de verdade.
            </p>
          </>
        )}
        <div className="mt-2 flex gap-2">
          <Button variant="soft" onClick={onRestart}>
            Importar outro
          </Button>
          {dataset ? (
            <Button asChild variant="brand">
              <Link to="/explorador" search={{ dataset: dataset.id }}>
                Explorar dados
              </Link>
            </Button>
          ) : (
            <Button asChild variant="brand">
              <Link to="/datasets">Ver datasets</Link>
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

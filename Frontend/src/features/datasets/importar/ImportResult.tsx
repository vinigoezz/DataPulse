import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import type { Dataset } from "../types";

/** Fim da importação: o dataset criado e o atalho para explorá-lo. */
export function ImportResult({ dataset, onRestart }: { dataset: Dataset; onRestart: () => void }) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="grid size-12 place-items-center rounded-xl border bg-muted text-success">
          <Check className="size-5" />
        </span>
        <p className="font-medium">Importação concluída</p>
        <p className="max-w-md text-sm text-muted-foreground">
          <strong>{dataset.name}</strong> foi processado: {formatNumber(dataset.rows)} linhas e{" "}
          {formatNumber(dataset.columns)} colunas.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="soft" onClick={onRestart}>
            Importar outro
          </Button>
          <Button asChild variant="brand">
            <Link to="/explorador" search={{ dataset: dataset.id }}>
              Explorar dados
            </Link>
          </Button>
        </div>
      </div>
    </Panel>
  );
}

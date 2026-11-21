import { Database } from "lucide-react";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import { StatusBadge } from "../components/StatusBadge";
import type { Dataset } from "../types";
import { DatasetActions, type DatasetHandlers } from "./DatasetActions";

export function DatasetsGrid({ datasets, ...handlers }: { datasets: Dataset[] } & DatasetHandlers) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {datasets.map((d) => (
        <article
          key={d.id}
          className="surface-card animate-enter flex flex-col gap-4 p-5 transition-colors hover:border-primary/40"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="grid size-10 place-items-center rounded-lg border bg-muted/60 text-primary">
              <Database className="size-4" />
            </span>
            <DatasetActions dataset={d} {...handlers} />
          </div>
          <div>
            <p className="truncate font-mono text-sm font-medium">{d.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {d.description || "Sem descrição."}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="Registros" value={formatNumber(d.rows)} />
            <Stat label="Colunas" value={d.columns} />
            <Stat label="Tamanho" value={formatBytes(d.sizeBytes)} />
          </dl>
          <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>{formatDateTime(d.importedAt)}</span>
            <StatusBadge status={d.status} />
          </div>
        </article>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}

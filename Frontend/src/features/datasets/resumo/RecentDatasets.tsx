import { Link } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { canExplore, type Dataset } from "../types";

export function RecentDatasets({ datasets }: { datasets: Dataset[] }) {
  return (
    <ul className="-my-2 divide-y">
      {datasets.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
          <span className="grid size-9 place-items-center rounded-lg border bg-muted/60 text-muted-foreground">
            <Database className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            {canExplore(d) ? (
              <Link
                to="/explorador"
                search={{ dataset: d.id }}
                className="block truncate font-mono text-sm hover:text-primary"
              >
                {d.name}
              </Link>
            ) : (
              <p className="truncate font-mono text-sm">{d.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDateTime(d.importedAt)} · {formatBytes(d.sizeBytes)}
            </p>
          </div>
          <span className="text-sm tabular text-muted-foreground">
            {formatNumber(d.rows)} registros
          </span>
          <StatusBadge status={d.status} />
        </li>
      ))}
    </ul>
  );
}

import { Database } from "lucide-react";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import { StatusBadge } from "../components/StatusBadge";
import type { Dataset } from "../types";
import { DatasetActions, type DatasetHandlers } from "./DatasetActions";

const HEADERS = ["Arquivo", "Importado em", "Registros", "Colunas", "Tamanho", "Status", ""];

export function DatasetsTable({
  datasets,
  ...handlers
}: { datasets: Dataset[] } & DatasetHandlers) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            {HEADERS.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datasets.map((d) => (
            <tr key={d.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
              <td className="px-5 py-3">
                <button
                  onClick={() => handlers.onDetails(d)}
                  className="flex items-center gap-2.5 font-mono hover:text-primary"
                >
                  <Database className="size-4 text-muted-foreground" />
                  {d.name}
                </button>
              </td>
              <td className="px-5 py-3 text-muted-foreground">{formatDateTime(d.importedAt)}</td>
              <td className="px-5 py-3 tabular">{formatNumber(d.rows)}</td>
              <td className="px-5 py-3 tabular">{d.columns}</td>
              <td className="px-5 py-3 tabular text-muted-foreground">
                {formatBytes(d.sizeBytes)}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={d.status} />
              </td>
              <td className="px-3 py-3 text-right">
                <DatasetActions dataset={d} {...handlers} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

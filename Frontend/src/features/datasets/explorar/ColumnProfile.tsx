import { Panel } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import type { ColumnStats } from "../types";
import { COLUMN_ICON } from "./column-icons";

export function ColumnProfile({ stats }: { stats: ColumnStats[] }) {
  return (
    <Panel title="Perfil das colunas" description="Tipo, valores distintos e nulos por coluna">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = COLUMN_ICON[s.type];
          return (
            <div key={s.key} className="flex items-center gap-3 rounded-lg border p-3">
              <Icon className="size-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.type}</p>
              </div>
              <div className="text-right text-xs tabular">
                <p>{formatNumber(s.distinct)} distintos</p>
                <p className={s.nulls ? "text-warning" : "text-muted-foreground"}>
                  {formatNumber(s.nulls)} nulos
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { isNumericColumn, type ColumnStats } from "../types";
import { formatValue } from "./format-value";

const MAX_CARDS = 4;

/** Média, mínimo e máximo das primeiras colunas numéricas. */
export function NumericSummary({ stats }: { stats: ColumnStats[] | undefined }) {
  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: MAX_CARDS }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
    );
  }
  const numeric = stats.filter((s) => isNumericColumn(s.type)).slice(0, MAX_CARDS);
  if (numeric.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {numeric.map((s) => {
        const format = (v: number | null | undefined) =>
          v === null || v === undefined
            ? "—"
            : formatValue(s.type === "número" ? Math.round(v * 10) / 10 : v, s.type);
        return (
          <div key={s.key} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{s.label} · média</p>
            <p className="mt-1 text-lg font-semibold tabular">{format(s.mean)}</p>
            <p className="mt-1 text-xs text-muted-foreground tabular">
              mín {format(s.min)} · máx {format(s.max)} · {formatNumber(s.nulls)} nulos
            </p>
          </div>
        );
      })}
    </div>
  );
}

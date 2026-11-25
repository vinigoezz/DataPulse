import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnType, Summary } from "../types";
import { valueFormat } from "./dashboard-config";

interface Props {
  summary: Summary | undefined;
  /** Nome e tipo da medida; null quando só contamos registros. */
  measure: { label: string; type: ColumnType } | null;
}

/** Os números do topo: total, média, maior valor e registros. */
export function KpiCards({ summary, measure }: Props) {
  if (!summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
    );
  }
  const count = valueFormat(null, "count").format;
  const value = measure ? valueFormat(measure.type, "sum").format : count;
  const show = (v: number | null) => (v === null ? "—" : value(v));
  const cards = measure
    ? [
        // Total de percentuais não faz sentido: no lugar, o menor valor.
        measure.type === "percentual"
          ? { label: `${measure.label} · mínimo`, value: show(summary.min) }
          : { label: `${measure.label} · total`, value: show(summary.sum) },
        { label: `${measure.label} · média`, value: show(summary.mean) },
        { label: `${measure.label} · maior valor`, value: show(summary.max) },
        { label: "Registros", value: count(summary.count) },
      ]
    : [{ label: "Registros", value: count(summary.count) }];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="surface-card animate-enter p-5">
          <p className="truncate text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-3 truncate text-2xl font-semibold tracking-tight tabular">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}

import { Rows3 } from "lucide-react";
import { BarListChart, DonutChart } from "@/components/charts/Charts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Panel } from "@/components/layout/PageHeader";
import { useDatasetAggregate } from "../queries";
import type { AggregateQuery, ColumnType } from "../types";
import { OPERATION_LABEL, pickValue, valueFormat, type Operation } from "./dashboard-config";

interface Props {
  datasetId: string;
  query: AggregateQuery;
  operation: Operation;
  measure: { label: string; type: ColumnType } | null;
  groupLabel: string;
}

/** Comparação entre categorias: barras e, quando faz sentido, participação no total. */
export function BreakdownPanel({ datasetId, query, operation, measure, groupLabel }: Props) {
  const result = useDatasetAggregate(datasetId, query);
  const name = measure ? `${OPERATION_LABEL[operation]} de ${measure.label}` : "Registros";
  const formats = valueFormat(measure?.type ?? null, operation);
  const groups = result.data ? [...result.data.groups] : [];
  // "Outros" só entra quando é soma ou contagem (média dos outros confundiria).
  const additive = operation === "sum" || operation === "count";
  if (result.data?.other && additive) groups.push({ ...result.data.other, key: "Outros" });
  const data = groups.flatMap((group) => {
    const value = pickValue(group, operation);
    return value === null ? [] : [{ name: group.key, value }];
  });
  const showShare = additive && data.every((d) => d.value >= 0) && data.length > 1;

  const body = result.isError ? (
    <ErrorState error={result.error} onRetry={() => void result.refetch()} />
  ) : !result.data ? (
    <Skeleton className="h-[260px]" />
  ) : data.length === 0 ? (
    <EmptyState icon={<Rows3 className="size-5" />} title="Sem dados para comparar" />
  ) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel
        className={showShare ? "lg:col-span-2" : "lg:col-span-3"}
        title={`${name} por ${groupLabel}`}
        description={`Os ${query.limit} maiores${result.data?.other ? " (o resto em “Outros”)" : ""}`}
      >
        {body ?? <BarListChart data={data} name={name} {...formats} />}
      </Panel>
      {showShare && !body && (
        <Panel
          title={`Participação por ${groupLabel}`}
          description={`No total de ${name.toLowerCase()}`}
        >
          <DonutChart data={data} {...formats} />
        </Panel>
      )}
    </div>
  );
}

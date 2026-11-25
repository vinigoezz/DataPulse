import { CalendarRange } from "lucide-react";
import { TrendChart } from "@/components/charts/Charts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Panel } from "@/components/layout/PageHeader";
import { useDatasetAggregate } from "../queries";
import type { AggregateQuery, ColumnType } from "../types";
import {
  INTERVAL_LABEL,
  OPERATION_LABEL,
  periodLabel,
  pickValue,
  valueFormat,
  type Operation,
} from "./dashboard-config";

interface Props {
  datasetId: string;
  query: AggregateQuery;
  operation: Operation;
  measure: { label: string; type: ColumnType } | null;
  dateLabel: string;
}

/** Evolução da medida ao longo do tempo. */
export function TrendPanel({ datasetId, query, operation, measure, dateLabel }: Props) {
  const result = useDatasetAggregate(datasetId, query);
  const name = measure ? `${OPERATION_LABEL[operation]} de ${measure.label}` : "Registros";
  const formats = valueFormat(measure?.type ?? null, operation);
  const data = (result.data?.groups ?? []).flatMap((group) => {
    const value = pickValue(group, operation);
    return value === null ? [] : [{ name: periodLabel(group.key, query.interval), value }];
  });

  return (
    <Panel
      title={`Evolução: ${name}`}
      description={`Por ${INTERVAL_LABEL[query.interval].toLowerCase()} · ${dateLabel}`}
    >
      {result.isError ? (
        <ErrorState error={result.error} onRetry={() => void result.refetch()} />
      ) : !result.data ? (
        <Skeleton className="h-[300px]" />
      ) : data.length === 0 ? (
        <EmptyState icon={<CalendarRange className="size-5" />} title="Sem dados no período" />
      ) : (
        <TrendChart data={data} name={name} {...formats} />
      )}
    </Panel>
  );
}

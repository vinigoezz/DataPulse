import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/layout/PageHeader";
import { useDatasetAggregate, useDatasetStats } from "../queries";
import type { ColumnStats, Dataset } from "../types";
import { BreakdownPanel } from "./BreakdownPanel";
import { DashboardControls } from "./DashboardControls";
import { dashboardQueries, defaultConfig, type DashboardConfig } from "./dashboard-config";
import { KpiCards } from "./KpiCards";
import { TrendPanel } from "./TrendPanel";

/** O Dashboard de um dataset. Recriado (key) ao trocar de dataset, voltando ao padrão. */
export function DatasetDashboard({ dataset }: { dataset: Dataset }) {
  const stats = useDatasetStats(dataset.id);

  if (stats.isError) {
    return (
      <div className="surface-card">
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      </div>
    );
  }
  if (!stats.data) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Carregando">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[104px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
    );
  }
  return <Dashboard datasetId={dataset.id} stats={stats.data} />;
}

function Dashboard({ datasetId, stats }: { datasetId: string; stats: ColumnStats[] }) {
  const [config, setConfig] = useState<DashboardConfig>(() => defaultConfig(stats));
  const queries = dashboardQueries(config, stats);
  const overall = useDatasetAggregate(datasetId, queries.overall);
  const labelOf = (key: string | null) => stats.find((s) => s.key === key)?.label ?? key ?? "";
  const measureColumn =
    config.operation === "count" ? undefined : stats.find((s) => s.key === config.measure);
  const measure = measureColumn ? { label: measureColumn.label, type: measureColumn.type } : null;

  if (!queries.trend && !queries.breakdown && !measure) {
    return (
      <div className="surface-card">
        <EmptyState
          icon={<BarChart3 className="size-5" />}
          title="Este dataset não tem o que mostrar em gráficos"
          description="O Dashboard precisa de pelo menos uma coluna de número, data ou categoria."
        />
      </div>
    );
  }

  return (
    <>
      <DashboardControls config={config} stats={stats} onChange={setConfig} />
      {overall.isError ? (
        <div className="surface-card">
          <ErrorState error={overall.error} onRetry={() => void overall.refetch()} />
        </div>
      ) : (
        <KpiCards summary={overall.data?.overall} measure={measure} />
      )}
      {queries.trend && (
        <TrendPanel
          datasetId={datasetId}
          query={queries.trend}
          operation={config.operation}
          measure={measure}
          dateLabel={labelOf(config.dateColumn)}
        />
      )}
      {queries.breakdown && (
        <BreakdownPanel
          datasetId={datasetId}
          query={queries.breakdown}
          operation={config.operation}
          measure={measure}
          groupLabel={labelOf(config.groupBy)}
        />
      )}
    </>
  );
}

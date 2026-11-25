import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/datasets/painel/DashboardPage";

interface DashboardSearch {
  /** Id do dataset aberto. Sem ele, o Dashboard abre o mais recente. */
  dataset?: string | undefined;
}

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    dataset: typeof search["dataset"] === "string" ? search["dataset"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Dashboard — Data Pulse" },
      {
        name: "description",
        content: "Indicadores e gráficos montados a partir dos seus datasets.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  const { dataset } = Route.useSearch();
  return <DashboardPage datasetId={dataset} />;
}

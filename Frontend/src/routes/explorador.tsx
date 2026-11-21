import { createFileRoute } from "@tanstack/react-router";
import { ExplorerPage } from "@/features/datasets/explorar/ExplorerPage";

interface ExplorerSearch {
  /** Id do dataset aberto. Sem ele, o Explorador abre o mais recente. */
  dataset?: string | undefined;
}

export const Route = createFileRoute("/explorador")({
  validateSearch: (search: Record<string, unknown>): ExplorerSearch => ({
    dataset: typeof search["dataset"] === "string" ? search["dataset"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explorador de Dados — Data Pulse" },
      {
        name: "description",
        content: "Explore registros com busca, filtros por coluna, ordenação e estatísticas.",
      },
      { property: "og:title", content: "Explorador de Dados — Data Pulse" },
      {
        property: "og:description",
        content: "Explore registros com busca, filtros por coluna, ordenação e estatísticas.",
      },
    ],
  }),
  component: ExplorerRoute,
});

function ExplorerRoute() {
  const { dataset } = Route.useSearch();
  return <ExplorerPage datasetId={dataset} />;
}

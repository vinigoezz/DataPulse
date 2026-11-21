import { createFileRoute } from "@tanstack/react-router";
import { DatasetsPage } from "@/features/datasets/listar/DatasetsPage";

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Meus Datasets — Data Pulse" },
      { name: "description", content: "Gerencie seus conjuntos de dados importados." },
      { property: "og:title", content: "Meus Datasets — Data Pulse" },
      { property: "og:description", content: "Gerencie seus conjuntos de dados importados." },
    ],
  }),
  component: DatasetsPage,
});

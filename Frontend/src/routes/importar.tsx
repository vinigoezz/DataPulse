import { createFileRoute } from "@tanstack/react-router";
import { ImportPage } from "@/features/datasets/importar/ImportPage";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar dados — Data Pulse" },
      {
        name: "description",
        content: "Selecione um arquivo CSV, valide e visualize a prévia antes de importar.",
      },
      { property: "og:title", content: "Importar dados — Data Pulse" },
      {
        property: "og:description",
        content: "Selecione um arquivo CSV, valide e visualize a prévia antes de importar.",
      },
    ],
  }),
  component: ImportPage,
});

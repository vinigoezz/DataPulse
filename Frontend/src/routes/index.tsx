import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/datasets/resumo/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Data Pulse" },
      { name: "description", content: "Resumo dos seus datasets e da atividade recente." },
      { property: "og:title", content: "Visão Geral — Data Pulse" },
      { property: "og:description", content: "Resumo dos seus datasets e da atividade recente." },
    ],
  }),
  component: HomePage,
});

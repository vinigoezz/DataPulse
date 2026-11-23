import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/configuracoes/SettingsPage";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Data Pulse" },
      { name: "description", content: "Aparência e conexão do Data Pulse." },
    ],
  }),
  component: SettingsPage,
});

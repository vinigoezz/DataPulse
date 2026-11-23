import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Data Pulse" },
      { name: "description", content: "Painéis com indicadores e gráficos dos seus datasets." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ComingSoon
      icon={<BarChart3 className="size-5" />}
      title="Dashboard"
      description="Indicadores e gráficos montados a partir dos seus próprios datasets."
      sprint="Sprint 4"
      features={[
        "Totais, médias e variações das colunas numéricas",
        "Evolução ao longo do tempo pelas colunas de data",
        "Comparação entre categorias (filial, produto, canal...)",
        "Filtros por período e por categoria",
      ]}
      action={
        <Button asChild variant="soft">
          <Link to="/explorador">
            <Table2 /> Enquanto isso, veja as estatísticas no Explorador
          </Link>
        </Button>
      }
    />
  );
}

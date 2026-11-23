import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Data Pulse" },
      {
        name: "description",
        content: "Relatórios salvos e exportados a partir dos seus datasets.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <ComingSoon
      icon={<FileText className="size-5" />}
      title="Relatórios"
      description="Salve análises dos seus datasets para consultar e compartilhar depois."
      sprint="Sprint 5"
      features={[
        "Salvar filtros e gráficos como relatório",
        "Exportar em PDF e CSV",
        "Histórico de relatórios por dataset",
        "Acesso por usuário, com login",
      ]}
      action={
        <Button asChild variant="soft">
          <Link to="/explorador">
            <Table2 /> Abrir o Explorador
          </Link>
        </Button>
      }
    />
  );
}

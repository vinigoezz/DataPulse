import { Link, useNavigate } from "@tanstack/react-router";
import { Database, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import { useDatasets } from "../queries";
import { canExplore, type Dataset } from "../types";
import { DatasetPicker } from "./DatasetPicker";

interface Props {
  title: string;
  /** Texto do topo enquanto nenhum dataset está aberto. */
  description: string;
  /** Página atual: o seletor troca o dataset mantendo a pessoa aqui. */
  to: "/explorador" | "/dashboard";
  /** Id da URL. Sem ele, abre o dataset processado mais recente. */
  datasetId: string | undefined;
  children: (dataset: Dataset) => ReactNode;
}

/** Página que mostra um dataset: cuida de carregando, erro, nenhum dataset e do seletor. */
export function DatasetPage({ title, description, to, datasetId, children }: Props) {
  const datasets = useDatasets();
  const navigate = useNavigate();
  const header = (dataset?: Dataset, actions?: ReactNode) => (
    <PageHeader
      title={title}
      description={
        dataset
          ? `${dataset.name} · ${formatNumber(dataset.rows)} registros · ${formatNumber(dataset.columns)} colunas`
          : description
      }
      actions={actions}
    />
  );

  if (datasets.isPending) {
    return (
      <div className="space-y-6">
        {header()}
        <div className="space-y-3" aria-busy="true" aria-label="Carregando">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  if (datasets.isError) {
    return (
      <div className="space-y-6">
        {header()}
        <div className="surface-card">
          <ErrorState error={datasets.error} onRetry={() => datasets.refetch()} />
        </div>
      </div>
    );
  }

  const ready = datasets.data.filter(canExplore);
  const selected = datasetId ? datasets.data.find((d) => d.id === datasetId) : ready[0];
  if (!selected) {
    return (
      <div className="space-y-6">
        {header()}
        <div className="surface-card">
          <NoDataset notFound={Boolean(datasetId)} />
        </div>
      </div>
    );
  }

  const select = (id: string) => navigate({ to, search: { dataset: id } });
  return (
    <div className="space-y-6">
      {header(
        selected,
        <DatasetPicker datasets={ready} selectedId={selected.id} onSelect={select} />,
      )}
      {children(selected)}
    </div>
  );
}

function NoDataset({ notFound }: { notFound: boolean }) {
  return (
    <EmptyState
      icon={<Database className="size-5" />}
      title={notFound ? "Dataset não encontrado" : "Nenhum dataset ainda"}
      description={
        notFound ? "Ele pode ter sido removido." : "Importe um arquivo CSV para começar."
      }
      action={
        <Button asChild variant="brand">
          {notFound ? (
            <Link to="/datasets">Ver meus datasets</Link>
          ) : (
            <Link to="/importar">
              <Plus /> Importar dataset
            </Link>
          )}
        </Button>
      }
    />
  );
}

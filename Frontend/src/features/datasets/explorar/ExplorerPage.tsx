import { Link, useNavigate } from "@tanstack/react-router";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/format";
import { useDatasets } from "../queries";
import { canExplore, type Dataset } from "../types";
import { DatasetExplorer } from "./DatasetExplorer";
import { DatasetPicker } from "./DatasetPicker";

/** Explorador de dados. Sem `datasetId` na URL, abre o dataset mais recente. */
export function ExplorerPage({ datasetId }: { datasetId: string | undefined }) {
  const datasets = useDatasets();
  const navigate = useNavigate();

  if (datasets.isPending) return <LoadingPage />;
  if (datasets.isError) {
    return (
      <Page>
        <div className="surface-card">
          <ErrorState error={datasets.error} onRetry={() => datasets.refetch()} />
        </div>
      </Page>
    );
  }

  const explorable = datasets.data.filter(canExplore);
  const selected = datasetId ? datasets.data.find((d) => d.id === datasetId) : explorable[0];

  if (!selected) {
    return (
      <Page>
        <div className="surface-card">
          <EmptyState
            icon={<Database className="size-5" />}
            title={datasetId ? "Dataset não encontrado" : "Nenhum dataset para explorar"}
            description={
              datasetId
                ? "Ele pode ter sido removido."
                : "Importe um arquivo CSV para explorar seus dados aqui."
            }
            action={
              <Button asChild variant="brand">
                {datasetId ? (
                  <Link to="/datasets">Ver meus datasets</Link>
                ) : (
                  <Link to="/importar">
                    <Plus /> Importar dataset
                  </Link>
                )}
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  const select = (id: string) => navigate({ to: "/explorador", search: { dataset: id } });

  return (
    <Page
      dataset={selected}
      picker={<DatasetPicker datasets={explorable} selectedId={selected.id} onSelect={select} />}
    >
      <DatasetExplorer key={selected.id} dataset={selected} />
    </Page>
  );
}

function Page({
  dataset,
  picker,
  children,
}: {
  dataset?: Dataset;
  picker?: React.ReactNode;
  children: React.ReactNode;
}) {
  const description = dataset
    ? `${formatNumber(dataset.rows)} registros · ${formatNumber(dataset.columns)} colunas`
    : "Busque, filtre e ordene os registros de um dataset";
  return (
    <div className="space-y-6">
      <PageHeader title="Explorador de Dados" description={description} actions={picker} />
      {children}
    </div>
  );
}

function LoadingPage() {
  return (
    <Page>
      <div className="space-y-3" aria-busy="true" aria-label="Carregando">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </Page>
  );
}

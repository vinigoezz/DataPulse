import { Link, useNavigate } from "@tanstack/react-router";
import { Database, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/layout/PageHeader";
import { useDatasets } from "../queries";
import type { Dataset } from "../types";
import { DatasetDetailSheet } from "./DatasetDetailSheet";
import { DatasetsGrid } from "./DatasetsGrid";
import { DatasetsTable } from "./DatasetsTable";
import { DatasetsToolbar, type DatasetsView } from "./DatasetsToolbar";
import { DEFAULT_FILTERS, filterDatasets } from "./filter-datasets";
import { RemoveDatasetDialog } from "./RemoveDatasetDialog";

export function DatasetsPage() {
  const datasets = useDatasets();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState<DatasetsView>("tabela");
  const [detail, setDetail] = useState<Dataset | null>(null);
  const [toRemove, setToRemove] = useState<Dataset | null>(null);
  const navigate = useNavigate();

  const all = datasets.data ?? [];
  const visible = filterDatasets(all, filters);

  const handlers = {
    onDetails: setDetail,
    onRemove: setToRemove,
    onExplore: (d: Dataset) => navigate({ to: "/explorador", search: { dataset: d.id } }),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Datasets"
        description={datasets.isSuccess ? describe(all.length) : "Conjuntos de dados importados"}
        actions={
          <Button asChild variant="brand">
            <Link to="/importar">
              <Plus /> Importar novo dataset
            </Link>
          </Button>
        }
      />

      <DatasetsToolbar
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      />

      {datasets.isPending ? (
        <LoadingList />
      ) : datasets.isError ? (
        <div className="surface-card">
          <ErrorState error={datasets.error} onRetry={() => datasets.refetch()} />
        </div>
      ) : all.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon={<Database className="size-5" />}
            title="Nenhum dataset ainda"
            description="Importe um arquivo CSV para começar a explorar seus dados."
            action={
              <Button asChild variant="brand">
                <Link to="/importar">
                  <Plus /> Importar dataset
                </Link>
              </Button>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon={<Database className="size-5" />}
            title="Nenhum dataset encontrado"
            description="Nenhum dataset corresponde à busca ou aos filtros."
            action={
              <Button variant="soft" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Limpar filtros
              </Button>
            }
          />
        </div>
      ) : view === "tabela" ? (
        <DatasetsTable datasets={visible} {...handlers} />
      ) : (
        <DatasetsGrid datasets={visible} {...handlers} />
      )}

      <DatasetDetailSheet
        dataset={detail}
        onClose={() => setDetail(null)}
        onExplore={handlers.onExplore}
      />
      <RemoveDatasetDialog dataset={toRemove} onClose={() => setToRemove(null)} />
    </div>
  );
}

function describe(count: number) {
  return `${count} ${count === 1 ? "conjunto de dados" : "conjuntos de dados"}`;
}

function LoadingList() {
  return (
    <div className="surface-card space-y-3 p-5" aria-busy="true" aria-label="Carregando datasets">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

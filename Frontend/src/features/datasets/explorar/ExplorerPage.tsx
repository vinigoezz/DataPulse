import { DatasetPage } from "../components/DatasetPage";
import { DatasetExplorer } from "./DatasetExplorer";

/** Explorador de dados. Sem `datasetId` na URL, abre o dataset mais recente. */
export function ExplorerPage({ datasetId }: { datasetId: string | undefined }) {
  return (
    <DatasetPage
      title="Explorador de Dados"
      description="Busque, filtre e ordene os registros de um dataset"
      to="/explorador"
      datasetId={datasetId}
    >
      {(dataset) => <DatasetExplorer key={dataset.id} dataset={dataset} />}
    </DatasetPage>
  );
}

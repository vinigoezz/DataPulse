import { DatasetPage } from "../components/DatasetPage";
import { DatasetDashboard } from "./DatasetDashboard";

/** Dashboard de qualquer dataset. Sem `datasetId` na URL, abre o mais recente. */
export function DashboardPage({ datasetId }: { datasetId: string | undefined }) {
  return (
    <DatasetPage
      title="Dashboard"
      description="Indicadores e gráficos montados a partir dos seus datasets"
      to="/dashboard"
      datasetId={datasetId}
    >
      {(dataset) => <DatasetDashboard key={dataset.id} dataset={dataset} />}
    </DatasetPage>
  );
}

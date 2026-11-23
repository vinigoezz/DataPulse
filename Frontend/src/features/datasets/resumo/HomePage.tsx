import { Link } from "@tanstack/react-router";
import { ArrowRight, Database, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Panel } from "@/components/layout/PageHeader";
import { useDatasets } from "../queries";
import { RecentDatasets } from "./RecentDatasets";
import { SummaryCards } from "./SummaryCards";
import { summarize } from "./summarize";

const RECENT_COUNT = 5;

export function HomePage() {
  const { data: datasets, isPending, error, refetch } = useDatasets();

  return (
    <div className="space-y-6">
      <Welcome />
      {isPending ? (
        <Loading />
      ) : error ? (
        <Panel>
          <ErrorState error={error} onRetry={() => void refetch()} />
        </Panel>
      ) : datasets.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Database className="size-5" />}
            title="Nenhum dataset ainda"
            description="Importe um arquivo CSV para começar a explorar seus dados."
            action={
              <Button asChild variant="brand">
                <Link to="/importar">
                  <UploadCloud /> Importar o primeiro dataset
                </Link>
              </Button>
            }
          />
        </Panel>
      ) : (
        <>
          <SummaryCards summary={summarize(datasets)} />
          <Panel
            title="Atividade recente"
            description="Datasets importados recentemente"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/datasets">
                  Ver todos <ArrowRight />
                </Link>
              </Button>
            }
          >
            <RecentDatasets datasets={datasets.slice(0, RECENT_COUNT)} />
          </Panel>
        </>
      )}
    </div>
  );
}

function Welcome() {
  return (
    <section className="surface-card relative overflow-hidden p-6 md:p-8">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bem-vindo ao <span className="text-gradient-brand">Data Pulse</span>
          </h1>
          <p className="text-muted-foreground">Transforme seus dados em decisões inteligentes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="brand" size="lg" className="px-5">
            <Link to="/importar">
              <UploadCloud /> Importar dados
            </Link>
          </Button>
          <Button asChild variant="soft" size="lg" className="px-5">
            <Link to="/datasets">
              Meus datasets <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[260px] rounded-xl" />
    </>
  );
}

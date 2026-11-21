import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Database,
  DollarSign,
  Percent,
  Receipt,
  ShoppingCart,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodTabs } from "@/components/dashboard/PeriodTabs";
import {
  CategoryBarChart,
  DonutChart,
  Ranking,
  RevenueAreaChart,
} from "@/components/charts/Charts";
import { StatusBadge } from "@/features/datasets/components/StatusBadge";
import { SALES } from "@/mocks/sales";
import { computeKpis, filterSales, groupSum, monthly } from "@/lib/analytics";
import { formatBytes, formatCurrencyCompact, formatDateTime, formatNumber } from "@/lib/format";
import { useDatasets } from "@/features/datasets/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Data Pulse" },
      {
        name: "description",
        content: "Indicadores de faturamento, pedidos e margem em um painel de visão geral.",
      },
      { property: "og:title", content: "Visão Geral — Data Pulse" },
      {
        property: "og:description",
        content: "Indicadores de faturamento, pedidos e margem em um painel de visão geral.",
      },
    ],
  }),
  component: Overview,
});

const ICONS = [DollarSign, ShoppingCart, Receipt, Percent];

function useFakeLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

function Overview() {
  const [period, setPeriod] = useState("12");
  const loading = useFakeLoading();
  const { data: datasets = [] } = useDatasets();
  const rows = useMemo(() => filterSales(SALES, { months: Number(period) }), [period]);
  const kpis = useMemo(() => computeKpis(SALES), []);
  const series = useMemo(() => monthly(rows), [rows]);
  const byCat = useMemo(() => groupSum(rows, "categoria"), [rows]);
  const byFilial = useMemo(() => groupSum(rows, "filial"), [rows]);
  const total = series.reduce((s, p) => s + p.receita, 0);

  return (
    <div className="space-y-6">
      <section className="surface-card relative overflow-hidden p-6 md:p-8">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 animate-pulse-line rounded-full bg-success" /> Dados
              demonstrativos · atualizados em 12/11/2026
            </span>
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
                Explorar datasets <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[170px] rounded-xl" />
            ))
          : kpis.map((k, i) => <KpiCard key={k.id} kpi={k} icon={ICONS[i] ?? DollarSign} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Evolução do faturamento"
          description={
            <>
              Receita x custo mensal ·{" "}
              <span className="font-medium text-foreground tabular">
                {formatCurrencyCompact(total)}
              </span>{" "}
              no período
            </>
          }
          actions={<PeriodTabs value={period} onChange={setPeriod} />}
        >
          {loading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <RevenueAreaChart data={series as never} />
          )}
        </Panel>
        <Panel title="Participação por categoria" description="Distribuição da receita">
          {loading ? <Skeleton className="h-[300px]" /> : <DonutChart data={byCat} />}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Faturamento por categoria"
          description="Receita acumulada no período selecionado"
        >
          {loading ? <Skeleton className="h-[260px]" /> : <CategoryBarChart data={byCat} />}
        </Panel>
        <Panel title="Ranking de filiais" description="Maior receita no período">
          {loading ? (
            <Skeleton className="h-[260px]" />
          ) : (
            <Ranking
              items={byFilial.map((f) => ({ ...f, sub: `${formatNumber(f.pedidos)} pedidos` }))}
            />
          )}
        </Panel>
      </div>

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
        <ul className="-my-2 divide-y">
          {datasets.slice(0, 5).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid size-9 place-items-center rounded-lg border bg-muted/60 text-muted-foreground">
                <Database className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(d.importedAt)} · {formatBytes(d.sizeBytes)}
                </p>
              </div>
              <span className="text-sm tabular text-muted-foreground">
                {formatNumber(d.rows)} registros
              </span>
              <StatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

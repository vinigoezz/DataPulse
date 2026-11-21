import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DollarSign,
  Download,
  Filter,
  Percent,
  Receipt,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EmptyState, PageHeader, Panel } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodTabs } from "@/components/dashboard/PeriodTabs";
import {
  CategoryBarChart,
  DonutChart,
  Ranking,
  RevenueAreaChart,
  SimpleLineChart,
} from "@/components/charts/Charts";
import { SALES, CATEGORIAS, FILIAIS, CANAIS } from "@/mocks/sales";
import { computeKpis, filterSales, groupSum, monthly } from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard analítico — Data Pulse" },
      {
        name: "description",
        content: "Analise um dataset com filtros por período, categoria, filial e canal.",
      },
      { property: "og:title", content: "Dashboard analítico — Data Pulse" },
      {
        property: "og:description",
        content: "Analise um dataset com filtros por período, categoria, filial e canal.",
      },
    ],
  }),
  component: DashboardPage,
});

const ICONS = [DollarSign, ShoppingCart, Receipt, Percent];

function DashboardPage() {
  const [period, setPeriod] = useState("12");
  const [cats, setCats] = useState<string[]>([]);
  const [filial, setFilial] = useState("todas");
  const [canal, setCanal] = useState("todos");

  const rows = useMemo(
    () => filterSales(SALES, { months: Number(period), categorias: cats, filial, canal }),
    [period, cats, filial, canal],
  );
  const kpis = useMemo(() => computeKpis(rows), [rows]);
  const series = useMemo(
    () => monthly(rows).map((m) => ({ ...m, ticket: m.pedidos ? m.receita / m.pedidos : 0 })),
    [rows],
  );
  const byCat = useMemo(() => groupSum(rows, "categoria"), [rows]);
  const byCanal = useMemo(() => groupSum(rows, "canal"), [rows]);
  const byProduto = useMemo(() => groupSum(rows, "produto").slice(0, 6), [rows]);
  const byVendedor = useMemo(() => groupSum(rows, "vendedor").slice(0, 6), [rows]);
  const activeFilters = cats.length + (filial !== "todas" ? 1 : 0) + (canal !== "todos" ? 1 : 0);
  const reset = () => {
    setCats([]);
    setFilial("todas");
    setCanal("todos");
    setPeriod("12");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dataset selecionado"
        title={<span className="font-mono">vendas_2026.csv</span>}
        description={
          <>
            {formatNumber(SALES.length)} registros · atualizado em 12/11/2026 às 14:32 · exibindo{" "}
            <span className="font-medium text-foreground tabular">{formatNumber(rows.length)}</span>{" "}
            registros filtrados
          </>
        }
        actions={
          <>
            <PeriodTabs value={period} onChange={setPeriod} />
            <Select value={filial} onValueChange={setFilial}>
              <SelectTrigger className="h-9 w-40" aria-label="Filial">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as filiais</SelectItem>
                {FILIAIS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="soft">
                  <Filter /> Filtros{" "}
                  {activeFilters > 0 && (
                    <span className="rounded bg-primary px-1.5 text-[10px] text-primary-foreground">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categorias
                  </p>
                  <div className="space-y-2">
                    {CATEGORIAS.map((c) => (
                      <Label key={c} className="flex items-center gap-2 font-normal">
                        <Checkbox
                          checked={cats.includes(c)}
                          onCheckedChange={(v) =>
                            setCats((s) => (v ? [...s, c] : s.filter((x) => x !== c)))
                          }
                        />{" "}
                        {c}
                      </Label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Canal
                  </p>
                  <Select value={canal} onValueChange={setCanal}>
                    <SelectTrigger aria-label="Canal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os canais</SelectItem>
                      {CANAIS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
                  <RotateCcw /> Limpar filtros
                </Button>
              </PopoverContent>
            </Popover>
            <Button
              variant="brand"
              onClick={() =>
                toast.info("Exportação em desenvolvimento", {
                  description: "Disponível após a integração com o backend.",
                })
              }
            >
              <Download /> Exportar
            </Button>
          </>
        }
      />

      {rows.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon={<Filter className="size-5" />}
            title="Nenhum registro para os filtros aplicados"
            description="Ajuste os filtros para visualizar os indicadores."
            action={
              <Button variant="soft" onClick={reset}>
                Limpar filtros
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k, i) => (
              <KpiCard key={k.id} kpi={k} icon={ICONS[i] ?? DollarSign} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Receita e custo (área)"
              description="Evolução mensal no período filtrado"
            >
              <RevenueAreaChart data={series as never} />
            </Panel>
            <Panel title="Receita por canal" description="Participação de cada canal">
              <DonutChart data={byCanal} />
            </Panel>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Ticket médio (linhas)" description="Receita média por pedido">
              <SimpleLineChart
                data={series as never}
                dataKey="ticket"
                name="Ticket médio"
                format={formatCurrency}
              />
            </Panel>
            <Panel title="Receita por categoria (barras)">
              <CategoryBarChart data={byCat} />
            </Panel>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Top produtos" description="Ranking comparativo por receita">
              <CategoryBarChart data={byProduto} layout="vertical" height={280} />
            </Panel>
            <Panel title="Top vendedores" description="Ranking comparativo por receita">
              <Ranking
                items={byVendedor.map((v) => ({ ...v, sub: `${formatNumber(v.pedidos)} pedidos` }))}
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

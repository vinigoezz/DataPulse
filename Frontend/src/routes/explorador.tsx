import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronLeft, ChevronRight, Hash, ListFilter, Search, Tag, Type, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BackendNotice, EmptyState, PageHeader, Panel } from "@/components/layout/PageHeader";
import { SALES, SALES_COLUMNS } from "@/mocks/sales";
import { datasetsService } from "@/services/datasets.service";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { ColumnStats, ColumnType, SaleRecord } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explorador")({
  head: () => ({
    meta: [
      { title: "Explorador de Dados — Data Pulse" },
      { name: "description", content: "Explore registros com busca, filtros por coluna, ordenação e estatísticas." },
      { property: "og:title", content: "Explorador de Dados — Data Pulse" },
      { property: "og:description", content: "Explore registros com busca, filtros por coluna, ordenação e estatísticas." },
    ],
  }),
  component: ExplorerPage,
});

const TYPE_ICON: Record<ColumnType, typeof Hash> = { "número": Hash, moeda: DollarSign, data: Calendar, categoria: Tag, texto: Type };

type Key = keyof SaleRecord;

/** Query state shaped like the future GET /api/datasets/{id}/rows params. */
interface RowsQuery { search: string; filters: Partial<Record<Key, string>>; sort: { key: Key; dir: "asc" | "desc" } | null; page: number; pageSize: number }

function render(key: Key, v: SaleRecord[Key]) {
  if (v === null || v === undefined) return <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">nulo</span>;
  const col = SALES_COLUMNS.find((c) => c.key === key)!;
  if (col.type === "moeda") return formatCurrency(v as number);
  if (col.type === "data") return formatDate(v as string);
  if (col.type === "número") return formatNumber(v as number);
  return String(v);
}

function ExplorerPage() {
  const [q, setQ] = useState<RowsQuery>({ search: "", filters: {}, sort: null, page: 1, pageSize: 25 });
  const [stats, setStats] = useState<ColumnStats[] | null>(null);
  useEffect(() => { datasetsService.stats("ds-vendas-2026").then(setStats); }, []);

  const filtered = useMemo(() => {
    let rows = SALES;
    const s = q.search.trim().toLowerCase();
    if (s) rows = rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(s)));
    for (const [k, v] of Object.entries(q.filters)) if (v) rows = rows.filter((r) => String(r[k as Key]) === v);
    if (q.sort) {
      const { key, dir } = q.sort;
      rows = [...rows].sort((a, b) => {
        const av = a[key], bv = b[key];
        if (av === null) return 1; if (bv === null) return -1;
        const c = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv), "pt-BR");
        return dir === "asc" ? c : -c;
      });
    }
    return rows;
  }, [q.search, q.filters, q.sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / q.pageSize));
  const page = Math.min(q.page, pages);
  const visible = filtered.slice((page - 1) * q.pageSize, page * q.pageSize);
  const update = (p: Partial<RowsQuery>) => setQ((s) => ({ ...s, page: 1, ...p }));
  const toggleSort = (key: Key) => setQ((s) => ({ ...s, sort: s.sort?.key !== key ? { key, dir: "asc" } : s.sort.dir === "asc" ? { key, dir: "desc" } : null }));
  const activeFilters = Object.entries(q.filters).filter(([, v]) => v);

  return (
    <div className="space-y-6">
      <PageHeader title="Explorador de Dados" description={<>Dataset <span className="font-mono text-foreground">vendas_2026.csv</span> · {formatNumber(SALES.length)} registros · {SALES_COLUMNS.length} colunas</>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? stats.filter((s) => s.type === "moeda" || s.type === "número").slice(0, 4).map((s) => (
          <div key={s.key} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{s.label} · média</p>
            <p className="mt-1 text-lg font-semibold tabular">{s.type === "moeda" ? formatCurrency(s.mean ?? 0) : formatNumber(Math.round((s.mean ?? 0) * 10) / 10)}</p>
            <p className="mt-1 text-xs text-muted-foreground tabular">mín {s.type === "moeda" ? formatCurrency(s.min ?? 0) : s.min} · máx {s.type === "moeda" ? formatCurrency(s.max ?? 0) : s.max} · {s.nulls} nulos</p>
          </div>
        )) : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-xl" />)}
      </div>

      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q.search} onChange={(e) => update({ search: e.target.value })} placeholder="Buscar em todos os campos…" className="h-9 pl-9" aria-label="Buscar registros" />
          </div>
          {activeFilters.map(([k, v]) => (
            <button key={k} onClick={() => update({ filters: { ...q.filters, [k]: "" } })} className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">
              {SALES_COLUMNS.find((c) => c.key === k)?.label}: {v} <X className="size-3" />
            </button>
          ))}
          <span className="text-xs text-muted-foreground tabular md:ml-2">{formatNumber(filtered.length)} resultados</span>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={<Search className="size-5" />} title="Nenhum registro encontrado" description="Tente outro termo de busca ou remova filtros." action={<Button variant="soft" onClick={() => update({ search: "", filters: {} })}>Limpar busca e filtros</Button>} />
        ) : (
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
                <tr>
                  {SALES_COLUMNS.map((c) => {
                    const Icon = TYPE_ICON[c.type];
                    const key = c.key as Key;
                    const sorted = q.sort?.key === key ? q.sort.dir : null;
                    const st = stats?.find((s) => s.key === c.key);
                    const canFilter = c.type === "categoria";
                    const options = canFilter ? [...new Set(SALES.map((r) => String(r[key])))].sort() : [];
                    return (
                      <th key={c.key} className={cn("whitespace-nowrap px-4 py-2.5 text-left font-medium", (c.type === "moeda" || c.type === "número") && "text-right")}>
                        <div className={cn("flex items-center gap-1", (c.type === "moeda" || c.type === "número") && "justify-end")}>
                          <Tooltip>
                            <TooltipTrigger asChild><Icon className="size-3.5 text-muted-foreground" aria-label={`Tipo: ${c.type}`} /></TooltipTrigger>
                            <TooltipContent>Tipo: {c.type}{st ? ` · ${st.distinct} distintos · ${st.nulls} nulos` : ""}</TooltipContent>
                          </Tooltip>
                          <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 rounded px-1 text-xs text-foreground hover:bg-muted" aria-label={`Ordenar por ${c.label}`}>
                            {c.label}
                            {sorted === "asc" ? <ArrowUp className="size-3 text-primary" /> : sorted === "desc" ? <ArrowDown className="size-3 text-primary" /> : <ArrowUpDown className="size-3 text-muted-foreground/60" />}
                          </button>
                          {canFilter && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={cn("rounded p-0.5 hover:bg-muted", q.filters[key] ? "text-primary" : "text-muted-foreground")} aria-label={`Filtrar ${c.label}`}><ListFilter className="size-3.5" /></button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-1" align="start">
                                {["", ...options].map((o) => (
                                  <button key={o || "all"} onClick={() => update({ filters: { ...q.filters, [key]: o } })} className={cn("block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted", (q.filters[key] ?? "") === o && "bg-muted font-medium")}>
                                    {o || "Todos"}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        {st && st.nulls > 0 && <div className={cn("mt-0.5 text-[10px] font-normal text-warning", (c.type === "moeda" || c.type === "número") && "text-right")}>{st.nulls} nulos</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-muted/40">
                    {SALES_COLUMNS.map((c) => (
                      <td key={c.key} className={cn("whitespace-nowrap px-4 py-2 tabular", c.key === "id" && "font-mono text-xs text-muted-foreground", (c.type === "moeda" || c.type === "número") && "text-right")}>
                        {render(c.key as Key, r[c.key as Key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground">
            Linhas por página
            <Select value={String(q.pageSize)} onValueChange={(v) => update({ pageSize: Number(v) })}>
              <SelectTrigger className="h-8 w-20" aria-label="Linhas por página"><SelectValue /></SelectTrigger>
              <SelectContent>{[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground tabular">Página {page} de {pages}</span>
            <Button variant="soft" size="icon" className="size-8" disabled={page <= 1} onClick={() => setQ((s) => ({ ...s, page: page - 1 }))} aria-label="Página anterior"><ChevronLeft /></Button>
            <Button variant="soft" size="icon" className="size-8" disabled={page >= pages} onClick={() => setQ((s) => ({ ...s, page: page + 1 }))} aria-label="Próxima página"><ChevronRight /></Button>
          </div>
        </div>
      </section>

      <Panel title="Perfil das colunas" description="Tipo, valores distintos e nulos por coluna">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(stats ?? []).map((s) => {
            const Icon = TYPE_ICON[s.type];
            return (
              <div key={s.key} className="flex items-center gap-3 rounded-lg border p-3">
                <Icon className="size-4 text-primary" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{s.label}</p><p className="text-xs text-muted-foreground">{s.type}</p></div>
                <div className="text-right text-xs tabular"><p>{formatNumber(s.distinct)} distintos</p><p className={s.nulls ? "text-warning" : "text-muted-foreground"}>{s.nulls} nulos</p></div>
              </div>
            );
          })}
        </div>
      </Panel>

      <BackendNotice>Busca, filtros e paginação rodam localmente nos dados demonstrativos; com o backend, serão executados por <code className="font-mono">GET /api/datasets/{"{id}"}/rows</code>.</BackendNotice>
    </div>
  );
}

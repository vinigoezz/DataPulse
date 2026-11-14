import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Database, Eye, Info, LayoutGrid, List, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/datasets/StatusBadge";
import { useDatasets } from "@/hooks/use-datasets";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import type { Dataset, DatasetStatus } from "@/types";

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Meus Datasets — Data Pulse" },
      { name: "description", content: "Gerencie seus conjuntos de dados importados." },
      { property: "og:title", content: "Meus Datasets — Data Pulse" },
      { property: "og:description", content: "Gerencie seus conjuntos de dados importados." },
    ],
  }),
  component: DatasetsPage,
});

function DatasetsPage() {
  const { datasets, remove, reset } = useDatasets();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"todos" | DatasetStatus>("todos");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [view, setView] = useState<"tabela" | "cards">("tabela");
  const [toDelete, setToDelete] = useState<Dataset | null>(null);
  const [detail, setDetail] = useState<Dataset | null>(null);
  const navigate = useNavigate();

  const list = useMemo(() => datasets
    .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
    .filter((d) => status === "todos" || d.status === status)
    .sort((a, b) => (sort === "desc" ? b.importedAt.localeCompare(a.importedAt) : a.importedAt.localeCompare(b.importedAt))), [datasets, q, status, sort]);

  const open = (d: Dataset) => (d.id === "ds-vendas-2026" ? navigate({ to: "/explorador" }) : toast.info("Visualização disponível após integração com o backend.", { description: `Somente vendas_2026.csv possui dados demonstrativos.` }));

  const actions = (d: Dataset) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Ações para ${d.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setDetail(d)}><Info /> Abrir detalhes</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => open(d)}><Eye /> Visualizar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setToDelete(d)}><Trash2 /> Remover</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Meus Datasets" description={`${datasets.length} conjuntos de dados · lista demonstrativa local`} actions={<Button asChild variant="brand"><Link to="/importar"><Plus /> Importar novo dataset</Link></Button>} />

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome do arquivo…" className="h-9 bg-card pl-9" aria-label="Pesquisar datasets" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-9 w-40 bg-card" aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="processado">Processado</SelectItem>
              <SelectItem value="processando">Processando</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-9 w-44 bg-card" aria-label="Ordenar"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais recentes</SelectItem>
              <SelectItem value="asc">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as typeof view)} className="rounded-lg border bg-card p-0.5" aria-label="Modo de visualização">
            <ToggleGroupItem value="tabela" className="size-8" aria-label="Tabela"><List /></ToggleGroupItem>
            <ToggleGroupItem value="cards" className="size-8" aria-label="Cards"><LayoutGrid /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="surface-card"><EmptyState icon={<Database className="size-5" />} title="Nenhum dataset encontrado" description="Ajuste a busca ou os filtros, ou importe um novo arquivo." action={datasets.length === 0 ? <Button variant="soft" onClick={reset}>Restaurar demonstração</Button> : undefined} /></div>
      ) : view === "tabela" ? (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                {["Arquivo", "Importado em", "Registros", "Colunas", "Tamanho", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3"><button onClick={() => setDetail(d)} className="flex items-center gap-2.5 font-mono hover:text-primary"><Database className="size-4 text-muted-foreground" />{d.name}</button></td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDateTime(d.importedAt)}</td>
                  <td className="px-5 py-3 tabular">{formatNumber(d.rows)}</td>
                  <td className="px-5 py-3 tabular">{d.columns}</td>
                  <td className="px-5 py-3 tabular text-muted-foreground">{formatBytes(d.sizeBytes)}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-3 py-3 text-right">{actions(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => (
            <article key={d.id} className="surface-card animate-enter flex flex-col gap-4 p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-lg border bg-muted/60 text-primary"><Database className="size-4" /></span>
                {actions(d)}
              </div>
              <div>
                <p className="truncate font-mono text-sm font-medium">{d.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Registros</dt><dd className="font-medium tabular">{formatNumber(d.rows)}</dd></div>
                <div><dt className="text-muted-foreground">Colunas</dt><dd className="font-medium tabular">{d.columns}</dd></div>
                <div><dt className="text-muted-foreground">Tamanho</dt><dd className="font-medium tabular">{formatBytes(d.sizeBytes)}</dd></div>
              </dl>
              <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>{formatDateTime(d.importedAt)}</span><StatusBadge status={d.status} />
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono text-foreground">{toDelete?.name}</span> será removido desta lista demonstrativa. Nenhum dado real é excluído; recarregar a página restaura a lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (toDelete) { remove(toDelete.id); toast.success(`${toDelete.name} removido da lista`); } }}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{detail.name}</SheetTitle>
                <SheetDescription>{detail.description}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 space-y-3 px-4 text-sm">
                {[
                  ["Status", <StatusBadge key="s" status={detail.status} />],
                  ["Importado em", formatDateTime(detail.importedAt)],
                  ["Registros", formatNumber(detail.rows)],
                  ["Colunas", detail.columns],
                  ["Tamanho", formatBytes(detail.sizeBytes)],
                  ["Identificador", <code key="c" className="font-mono text-xs">{detail.id}</code>],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between border-b pb-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <div className="mt-6 px-4"><Button variant="brand" className="w-full" onClick={() => open(detail)}><Eye /> Visualizar dados</Button></div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

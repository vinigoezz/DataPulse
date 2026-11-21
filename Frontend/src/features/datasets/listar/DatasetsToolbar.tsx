import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DatasetFilters } from "./filter-datasets";

export type DatasetsView = "tabela" | "cards";

interface Props {
  filters: DatasetFilters;
  onFiltersChange: (filters: DatasetFilters) => void;
  view: DatasetsView;
  onViewChange: (view: DatasetsView) => void;
}

export function DatasetsToolbar({ filters, onFiltersChange, view, onViewChange }: Props) {
  const update = (patch: Partial<DatasetFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Pesquisar por nome do arquivo…"
          className="h-9 bg-card pl-9"
          aria-label="Pesquisar datasets"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status}
          onValueChange={(v) => update({ status: v as DatasetFilters["status"] })}
        >
          <SelectTrigger className="h-9 w-40 bg-card" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="processado">Processado</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.order}
          onValueChange={(v) => update({ order: v as DatasetFilters["order"] })}
        >
          <SelectTrigger className="h-9 w-44 bg-card" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="antigos">Mais antigos</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && onViewChange(v as DatasetsView)}
          className="rounded-lg border bg-card p-0.5"
          aria-label="Modo de visualização"
        >
          <ToggleGroupItem value="tabela" className="size-8" aria-label="Tabela">
            <List />
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" className="size-8" aria-label="Cards">
            <LayoutGrid />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

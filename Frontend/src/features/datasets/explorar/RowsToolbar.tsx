import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { activeFilters, type ColumnStats } from "../types";

interface Props {
  search: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, string>;
  columns: ColumnStats[];
  onClearFilter: (column: string) => void;
  total: number | undefined;
  fetching: boolean;
}

export function RowsToolbar({
  search,
  onSearchChange,
  filters,
  columns,
  onClearFilter,
  total,
  fetching,
}: Props) {
  const labelOf = (key: string) => columns.find((c) => c.key === key)?.label ?? key;
  return (
    <div className="flex flex-col gap-2 border-b p-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar em todos os campos…"
          className="h-9 pl-9"
          aria-label="Buscar registros"
        />
      </div>
      {Object.entries(activeFilters(filters)).map(([column, value]) => (
        <button
          key={column}
          onClick={() => onClearFilter(column)}
          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary"
          aria-label={`Remover filtro ${labelOf(column)}`}
        >
          {labelOf(column)}: {value} <X className="size-3" />
        </button>
      ))}
      <span className="text-xs text-muted-foreground tabular md:ml-2" aria-live="polite">
        {total === undefined ? "Carregando…" : `${formatNumber(total)} resultados`}
        {fetching && total !== undefined && " · atualizando…"}
      </span>
    </div>
  );
}

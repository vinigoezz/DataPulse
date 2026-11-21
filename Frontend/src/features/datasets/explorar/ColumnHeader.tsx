import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isNumericColumn, type ColumnStats, type SortOrder } from "../types";
import { COLUMN_ICON } from "./column-icons";

interface Props {
  column: ColumnStats;
  sortOrder: SortOrder | null;
  filterValue: string;
  onToggleSort: () => void;
  onFilter: (value: string) => void;
}

export function ColumnHeader({ column, sortOrder, filterValue, onToggleSort, onFilter }: Props) {
  const Icon = COLUMN_ICON[column.type];
  const numeric = isNumericColumn(column.type);
  const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th
      className={cn("whitespace-nowrap px-4 py-2.5 text-left font-medium", numeric && "text-right")}
    >
      <div className={cn("flex items-center gap-1", numeric && "justify-end")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon className="size-3.5 text-muted-foreground" aria-label={`Tipo: ${column.type}`} />
          </TooltipTrigger>
          <TooltipContent>
            Tipo: {column.type} · {column.distinct} distintos · {column.nulls} nulos
          </TooltipContent>
        </Tooltip>
        <button
          onClick={onToggleSort}
          className="inline-flex items-center gap-1 rounded px-1 text-xs text-foreground hover:bg-muted"
          aria-label={`Ordenar por ${column.label}`}
        >
          {column.label}
          <SortIcon
            className={cn("size-3", sortOrder ? "text-primary" : "text-muted-foreground/60")}
          />
        </button>
        {column.values && (
          <FilterMenu
            label={column.label}
            options={column.values}
            value={filterValue}
            onChange={onFilter}
          />
        )}
      </div>
      {column.nulls > 0 && (
        <div className={cn("mt-0.5 text-[10px] font-normal text-warning", numeric && "text-right")}>
          {column.nulls} nulos
        </div>
      )}
    </th>
  );
}

function FilterMenu({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded p-0.5 hover:bg-muted",
            value ? "text-primary" : "text-muted-foreground",
          )}
          aria-label={`Filtrar ${label}`}
        >
          <ListFilter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-h-72 w-56 overflow-auto p-1" align="start">
        {["", ...options].map((option) => (
          <button
            key={option || "__todos"}
            onClick={() => onChange(option)}
            className={cn(
              "block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted",
              value === option && "bg-muted font-medium",
            )}
          >
            {option || "Todos"}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

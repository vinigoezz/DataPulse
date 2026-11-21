import { cn } from "@/lib/utils";
import { isNumericColumn, type ColumnStats, type Row, type RowsQuery } from "../types";
import { CellValue } from "./CellValue";
import { ColumnHeader } from "./ColumnHeader";

interface Props {
  columns: ColumnStats[];
  rows: Row[];
  firstRowNumber: number;
  query: RowsQuery;
  onToggleSort: (column: string) => void;
  onFilter: (column: string, value: string) => void;
}

export function RowsTable({ columns, rows, firstRowNumber, query, onToggleSort, onFilter }: Props) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
          <tr>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">#</th>
            {columns.map((c) => (
              <ColumnHeader
                key={c.key}
                column={c}
                sortOrder={query.sort?.column === c.key ? query.sort.order : null}
                filterValue={query.filters[c.key] ?? ""}
                onToggleSort={() => onToggleSort(c.key)}
                onFilter={(value) => onFilter(c.key, value)}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={firstRowNumber + i} className="border-t transition-colors hover:bg-muted/40">
              <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular">
                {firstRowNumber + i}
              </td>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 tabular",
                    isNumericColumn(c.type) && "text-right",
                  )}
                >
                  <CellValue value={row[c.key]} type={c.type} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

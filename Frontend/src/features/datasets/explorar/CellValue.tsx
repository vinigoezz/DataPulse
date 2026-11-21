import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { ColumnType } from "../types";

export function CellValue({ value, type }: { value: unknown; type: ColumnType }) {
  if (value === null || value === undefined || value === "") {
    return (
      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">nulo</span>
    );
  }
  return <>{formatCell(value, type)}</>;
}

function formatCell(value: unknown, type: ColumnType): string {
  if (typeof value === "number") {
    if (type === "moeda") return formatCurrency(value);
    if (type === "número") return formatNumber(value);
  }
  if (type === "data" && typeof value === "string") return formatDate(value);
  return String(value);
}

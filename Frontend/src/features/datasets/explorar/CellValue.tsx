import type { ColumnType } from "../types";
import { formatValue } from "./format-value";

export function CellValue({ value, type }: { value: unknown; type: ColumnType }) {
  if (value === null || value === undefined || value === "") {
    return (
      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">nulo</span>
    );
  }
  return <>{formatValue(value, type)}</>;
}

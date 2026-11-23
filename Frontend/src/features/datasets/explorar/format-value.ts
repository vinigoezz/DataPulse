import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";
import type { ColumnType } from "../types";

/** Um valor como deve aparecer na tela, conforme o tipo da coluna (R$, %, datas...). */
export function formatValue(value: unknown, type: ColumnType): string {
  if (typeof value === "number") {
    if (type === "moeda") return formatCurrency(value);
    if (type === "percentual") return formatPercent(value * 100);
    return formatNumber(value);
  }
  if (type === "data" && typeof value === "string") return formatDate(value);
  return String(value);
}

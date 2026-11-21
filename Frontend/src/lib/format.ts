const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("pt-BR");
const numCompact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export const formatCurrency = (v: number) => brl.format(v);
export const formatCurrencyCompact = (v: number) => brlCompact.format(v);
export const formatNumber = (v: number) => num.format(v);
export const formatNumberCompact = (v: number) => numCompact.format(v);
export const formatPercent = (v: number, digits = 1) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
export const formatDelta = (v: number) => `${v > 0 ? "+" : ""}${formatPercent(v)}`;

export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
export function formatDateTime(iso: string) {
  return `${formatDate(iso)} às ${iso.slice(11, 16)}`;
}
export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  return `${(b / 1024 ** 3).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} GB`;
}
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]}/${ym.slice(2, 4)}`;

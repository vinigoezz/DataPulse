import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Kpi } from "@/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { Sparkline } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";

export function formatKpi(k: Pick<Kpi, "format">, v: number) {
  return k.format === "currency" ? formatCurrency(v) : k.format === "percent" ? formatPercent(v) : formatNumber(Math.round(v));
}

export function KpiCard({ kpi, icon: Icon, deltaUnit = "%" }: { kpi: Kpi; icon: LucideIcon; deltaUnit?: "%" | "p.p." }) {
  const up = kpi.delta >= 0;
  const unit = kpi.format === "percent" ? "p.p." : deltaUnit;
  return (
    <article className="surface-card animate-enter group relative overflow-hidden p-5 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-sm leading-tight text-muted-foreground">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted/60 text-primary"><Icon className="size-3.5" /></span>
          {kpi.label}
        </span>
        <span className={cn("inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium tabular", up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {up ? "+" : ""}{kpi.delta.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}{unit === "%" ? "%" : " p.p."}
        </span>
      </div>
      <div className="mt-4 text-[26px] font-semibold leading-none tracking-tight tabular">{formatKpi(kpi, kpi.value)}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">vs. mês anterior</div>
      <div className="-mx-1 mt-3"><Sparkline data={kpi.trend} positive={up} /></div>
    </article>
  );
}

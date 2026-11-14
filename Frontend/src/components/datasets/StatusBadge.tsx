import type { DatasetStatus } from "@/types";
import { cn } from "@/lib/utils";

const MAP: Record<DatasetStatus, { label: string; cls: string }> = {
  processado: { label: "Processado", cls: "bg-success/10 text-success border-success/25" },
  processando: { label: "Processando", cls: "bg-info/10 text-info border-info/25" },
  pendente: { label: "Pendente", cls: "bg-warning/10 text-warning border-warning/25" },
  erro: { label: "Erro", cls: "bg-destructive/10 text-destructive border-destructive/25" },
};

export function StatusBadge({ status }: { status: DatasetStatus }) {
  const s = MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium", s.cls)}>
      <span className={cn("size-1.5 rounded-full bg-current", status === "processando" && "animate-pulse-line")} />
      {s.label}
    </span>
  );
}

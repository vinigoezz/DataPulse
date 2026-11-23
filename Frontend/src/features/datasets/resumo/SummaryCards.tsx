import type { LucideIcon } from "lucide-react";
import { CalendarClock, Database, HardDrive, Rows3 } from "lucide-react";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import type { DatasetsSummary } from "./summarize";

interface Card {
  label: string;
  value: string;
  icon: LucideIcon;
}

function cards(summary: DatasetsSummary): Card[] {
  return [
    { label: "Datasets", value: formatNumber(summary.datasets), icon: Database },
    { label: "Registros", value: formatNumber(summary.rows), icon: Rows3 },
    { label: "Armazenamento", value: formatBytes(summary.sizeBytes), icon: HardDrive },
    {
      label: "Última importação",
      value: summary.lastImportedAt ? formatDateTime(summary.lastImportedAt) : "—",
      icon: CalendarClock,
    },
  ];
}

export function SummaryCards({ summary }: { summary: DatasetsSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards(summary).map(({ label, value, icon: Icon }) => (
        <article key={label} className="surface-card animate-enter p-5">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="grid size-7 place-items-center rounded-lg border bg-muted/60 text-primary">
              <Icon className="size-3.5" />
            </span>
            {label}
          </span>
          <p className="mt-3 truncate text-2xl font-semibold tracking-tight tabular">{value}</p>
        </article>
      ))}
    </div>
  );
}

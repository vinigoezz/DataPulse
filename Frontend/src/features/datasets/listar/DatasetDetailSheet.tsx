import { Eye } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { canExplore, type Dataset } from "../types";

interface Props {
  dataset: Dataset | null;
  onClose: () => void;
  onExplore: (dataset: Dataset) => void;
}

export function DatasetDetailSheet({ dataset, onClose, onExplore }: Props) {
  return (
    <Sheet open={!!dataset} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        {dataset && (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono">{dataset.name}</SheetTitle>
              <SheetDescription>{dataset.description || "Sem descrição."}</SheetDescription>
            </SheetHeader>
            <dl className="mt-6 space-y-3 px-4 text-sm">
              {detailRows(dataset).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b pb-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 px-4">
              <Button
                variant="brand"
                className="w-full"
                disabled={!canExplore(dataset)}
                onClick={() => onExplore(dataset)}
              >
                <Eye /> Explorar dados
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function detailRows(d: Dataset): [string, ReactNode][] {
  return [
    ["Status", <StatusBadge key="status" status={d.status} />],
    ["Importado em", formatDateTime(d.importedAt)],
    ["Registros", formatNumber(d.rows)],
    ["Colunas", d.columns],
    ["Tamanho", formatBytes(d.sizeBytes)],
    [
      "Identificador",
      <code key="id" className="font-mono text-xs">
        {d.id}
      </code>,
    ],
  ];
}

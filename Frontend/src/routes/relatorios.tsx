import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, FileDown, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BackendNotice, EmptyState, PageHeader } from "@/components/layout/PageHeader";
import { REPORTS, DATASETS } from "@/mocks/datasets";
import { formatDate } from "@/lib/format";
import type { ReportItem } from "@/types";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Data Pulse" },
      { name: "description", content: "Relatórios analíticos dos seus datasets." },
      { property: "og:title", content: "Relatórios — Data Pulse" },
      { property: "og:description", content: "Relatórios analíticos dos seus datasets." },
    ],
  }),
  component: ReportsPage,
});

const PERIODS: Record<string, number> = { "30": 30, "90": 90, "365": 365 };
const TODAY = new Date("2026-11-13T00:00:00");

function DevButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant="soft" size="sm" disabled>
            {icon} {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Em desenvolvimento</TooltipContent>
    </Tooltip>
  );
}

function ReportsPage() {
  const [period, setPeriod] = useState("90");
  const [viewing, setViewing] = useState<ReportItem | null>(null);
  const [creating, setCreating] = useState(false);
  const list = useMemo(
    () =>
      REPORTS.filter(
        (r) =>
          (TODAY.getTime() - new Date(r.createdAt).getTime()) / 864e5 <= (PERIODS[period] ?? 90),
      ),
    [period],
  );
  const ds = (id: string) => DATASETS.find((d) => d.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Relatórios analíticos gerados a partir dos seus datasets."
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 w-44 bg-card" aria-label="Período">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="brand" onClick={() => setCreating(true)}>
              <Plus /> Novo relatório
            </Button>
          </>
        }
      />

      {list.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon={<FileText className="size-5" />}
            title="Nenhum relatório no período"
            description="Selecione um período maior para ver relatórios anteriores."
          />
        </div>
      ) : (
        <div className="surface-card divide-y">
          {list.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-muted/60 text-primary">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">{ds(r.datasetId)}</span> · {formatDate(r.createdAt)} ·{" "}
                  {r.author}
                </p>
              </div>
              <Badge variant="outline" className="w-fit">
                {r.type}
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setViewing(r)}>
                  <Eye /> Visualizar
                </Button>
                <DevButton icon={<FileDown />} label="PDF" />
                <DevButton icon={<FileSpreadsheet />} label="CSV" />
              </div>
            </div>
          ))}
        </div>
      )}

      <BackendNotice>
        Geração, visualização completa e exportação (PDF/CSV) de relatórios estão em desenvolvimento
        e dependem do backend.
      </BackendNotice>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              Tipo {viewing?.type} · dataset{" "}
              <span className="font-mono">{viewing && ds(viewing.datasetId)}</span> ·{" "}
              {viewing && formatDate(viewing.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <EmptyState
            icon={<FileText className="size-5" />}
            title="Visualização em desenvolvimento"
            description="O conteúdo do relatório será gerado pelo backend."
          />
        </DialogContent>
      </Dialog>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo relatório</DialogTitle>
            <DialogDescription>Criação de relatórios personalizados.</DialogDescription>
          </DialogHeader>
          <EmptyState
            icon={<Plus className="size-5" />}
            title="Em desenvolvimento"
            description="Em breve você poderá montar relatórios a partir de qualquer dataset processado."
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

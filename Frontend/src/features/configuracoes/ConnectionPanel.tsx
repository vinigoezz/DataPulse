import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/layout/PageHeader";
import { API_URL, http } from "@/lib/http";
import { cn } from "@/lib/utils";

interface Health {
  status: string;
  version: string;
}

/** Mostra se o site está conseguindo falar com a API (útil quando algo não carrega). */
export function ConnectionPanel() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => http<Health>("/api/health"),
    retry: false,
  });

  return (
    <Panel
      title="Conexão com a API"
      description="Onde ficam seus datasets"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void health.refetch()}
          disabled={health.isFetching}
        >
          <RotateCcw /> Testar de novo
        </Button>
      }
    >
      <dl className="divide-y text-sm">
        <Item label="Endereço">
          <span className="break-all font-mono text-xs">{API_URL ?? "não configurado"}</span>
        </Item>
        <Item label="Situação">
          {health.isFetching ? (
            <Status tone="bg-warning">
              Testando… (a API pode levar até 1 minuto para acordar)
            </Status>
          ) : health.error ? (
            <Status tone="bg-destructive">{health.error.message}</Status>
          ) : (
            <Status tone="bg-success">Conectada</Status>
          )}
        </Item>
        {health.data && <Item label="Versão da API">{health.data.version}</Item>}
      </dl>
    </Panel>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="sm:text-right">{children}</dd>
    </div>
  );
}

function Status({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-2 shrink-0 rounded-full", tone)} />
      {children}
    </span>
  );
}

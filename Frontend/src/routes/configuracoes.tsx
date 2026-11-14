import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/layout/PageHeader";
import { useTheme } from "@/lib/theme";
import { CURRENT_USER } from "@/mocks/datasets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Data Pulse" },
      { name: "description", content: "Aparência, idioma, formatos e preferências do Data Pulse." },
      { property: "og:title", content: "Configurações — Data Pulse" },
      { property: "og:description", content: "Aparência, idioma, formatos e preferências do Data Pulse." },
    ],
  }),
  component: SettingsPage,
});

const Demo = () => <span className="ml-2 rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">Não implementado</span>;

function Row({ label, hint, children }: { label: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b py-4 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-medium">{label}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
      <div className="sm:w-64 sm:shrink-0 sm:text-right">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Configurações" description="Preferências da plataforma. Itens marcados como “Não implementado” são demonstrativos." />

      <Panel title="Aparência" description="Tema aplicado em toda a interface">
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tema">
          {([["dark", "Escuro", Moon], ["light", "Claro", Sun]] as const).map(([v, l, Icon]) => (
            <button key={v} role="radio" aria-checked={theme === v} onClick={() => setTheme(v)}
              className={cn("flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/40", theme === v && "border-primary bg-primary/5 ring-1 ring-primary")}>
              <Icon className="size-4 text-primary" /><span className="text-sm font-medium">{l}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Monitor className="size-3" /> A preferência fica salva neste navegador.</p>
      </Panel>

      <Panel title="Idioma e formatos">
        <Row label={<>Idioma<Demo /></>}><Select defaultValue="pt-BR"><SelectTrigger aria-label="Idioma"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pt-BR">Português (Brasil)</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select></Row>
        <Row label={<>Formato numérico<Demo /></>} hint="Exemplo: 1.234,56"><Select defaultValue="br"><SelectTrigger aria-label="Formato numérico"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="br">1.234,56</SelectItem><SelectItem value="us">1,234.56</SelectItem></SelectContent></Select></Row>
        <Row label={<>Formato de data<Demo /></>}><Select defaultValue="dmy"><SelectTrigger aria-label="Formato de data"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">DD/MM/AAAA</SelectItem><SelectItem value="iso">AAAA-MM-DD</SelectItem></SelectContent></Select></Row>
        <Row label={<>Moeda<Demo /></>}><Select defaultValue="BRL"><SelectTrigger aria-label="Moeda"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BRL">Real (R$)</SelectItem><SelectItem value="USD">Dólar (US$)</SelectItem></SelectContent></Select></Row>
      </Panel>

      <Panel title="Preferências de visualização">
        <Row label={<>Linhas por página padrão<Demo /></>}><Select defaultValue="25"><SelectTrigger aria-label="Linhas por página"><SelectValue /></SelectTrigger><SelectContent>{["10", "25", "50", "100"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></Row>
        <Row label={<>Animações nos gráficos<Demo /></>}><Switch defaultChecked aria-label="Animações" /></Row>
        <Row label={<>Modo compacto de tabelas<Demo /></>}><Switch aria-label="Modo compacto" /></Row>
      </Panel>

      <Panel title={<>Informações da conta<Demo /></>} description="Dados fictícios — autenticação será implementada com o backend">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="nome">Nome</Label><Input id="nome" defaultValue={CURRENT_USER.name} /></div>
          <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" defaultValue={CURRENT_USER.email} /></div>
          <div className="space-y-1.5"><Label htmlFor="cargo">Cargo</Label><Input id="cargo" defaultValue={CURRENT_USER.role} /></div>
          <div className="space-y-1.5"><Label htmlFor="empresa">Empresa</Label><Input id="empresa" defaultValue="Empresa Demonstração Ltda." /></div>
        </div>
      </Panel>

      <Panel title="Notificações">
        <Row label={<>Dataset processado<Demo /></>} hint="Avisar quando uma importação terminar"><Switch defaultChecked aria-label="Dataset processado" /></Row>
        <Row label={<>Falhas de validação<Demo /></>}><Switch defaultChecked aria-label="Falhas" /></Row>
        <Row label={<>Resumo semanal por e-mail<Demo /></>}><Switch aria-label="Resumo semanal" /></Row>
      </Panel>
    </div>
  );
}

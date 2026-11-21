import { AlertTriangle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card animate-enter flex flex-col ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-xl border bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function BackendNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-warning" />
      <span>{children}</span>
    </div>
  );
}

/** Falha ao carregar dados, com opção de tentar de novo. */
export function ErrorState({
  title = "Não foi possível carregar os dados",
  error,
  onRetry,
}: {
  title?: string;
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
      {onRetry && (
        <Button variant="soft" onClick={onRetry}>
          <RotateCcw /> Tentar novamente
        </Button>
      )}
    </div>
  );
}

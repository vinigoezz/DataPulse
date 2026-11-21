import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  "Selecionar arquivo",
  "Validar dados",
  "Visualizar prévia",
  "Concluir importação",
] as const;

export function ImportSteps({ current }: { current: number }) {
  return (
    <ol
      className="surface-card grid grid-cols-2 gap-3 p-4 md:grid-cols-4"
      aria-label="Etapas da importação"
    >
      {STEPS.map((label, i) => (
        <li
          key={label}
          className="flex items-center gap-3"
          aria-current={i === current ? "step" : undefined}
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
              i < current && "border-transparent bg-success text-primary-foreground",
              i === current &&
                "border-transparent bg-gradient-brand text-primary-foreground shadow-brand",
              i > current && "text-muted-foreground",
            )}
          >
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span className={cn("text-sm", i === current ? "font-medium" : "text-muted-foreground")}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

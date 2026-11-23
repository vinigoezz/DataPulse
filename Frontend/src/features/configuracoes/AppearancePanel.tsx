import { Monitor, Moon, Sun } from "lucide-react";
import { Panel } from "@/components/layout/PageHeader";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES = [
  ["dark", "Escuro", Moon],
  ["light", "Claro", Sun],
] as const;

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  return (
    <Panel title="Aparência" description="Tema aplicado em toda a interface">
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tema">
        {THEMES.map(([value, label, Icon]) => (
          <button
            key={value}
            role="radio"
            aria-checked={theme === value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/40",
              theme === value && "border-primary bg-primary/5 ring-1 ring-primary",
            )}
          >
            <Icon className="size-4 text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Monitor className="size-3" /> A preferência fica salva neste navegador.
      </p>
    </Panel>
  );
}

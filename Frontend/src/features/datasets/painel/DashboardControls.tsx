import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnStats, Interval } from "../types";
import {
  dateColumns,
  defaultOperation,
  groupColumns,
  INTERVAL_LABEL,
  measureColumns,
  OPERATION_LABEL,
  PERIOD_LABEL,
  type DashboardConfig,
  type Operation,
  type Period,
} from "./dashboard-config";

const NONE = "__nenhum";
const COUNT = "__contagem";

interface Props {
  config: DashboardConfig;
  stats: ColumnStats[];
  onChange: (config: DashboardConfig) => void;
}

/** A barra de escolhas: o que medir, como, por qual data e por qual categoria. */
export function DashboardControls({ config, stats, onChange }: Props) {
  const set = (patch: Partial<DashboardConfig>) => onChange({ ...config, ...patch });
  const measures = measureColumns(stats);
  const dates = dateColumns(stats);
  const groups = groupColumns(stats);
  const counting = config.operation === "count";

  const chooseMeasure = (value: string) => {
    if (value === COUNT) return set({ operation: "count" });
    const type = stats.find((s) => s.key === value)?.type ?? null;
    set({
      measure: value,
      operation: counting ? defaultOperation(type) : config.operation,
    });
  };

  return (
    <div className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Field label="Medida">
        <Choice
          value={counting || !config.measure ? COUNT : config.measure}
          onChange={chooseMeasure}
          options={[
            { value: COUNT, label: "Registros (contagem)" },
            ...measures.map((s) => ({ value: s.key, label: s.label })),
          ]}
        />
      </Field>
      <Field label="Cálculo">
        <Choice
          value={config.operation}
          onChange={(value) => set({ operation: value as Operation })}
          disabled={counting}
          options={(["sum", "mean", "min", "max"] as const).map((op) => ({
            value: op,
            label: OPERATION_LABEL[op],
          }))}
          placeholder="Contagem"
        />
      </Field>
      <Field label="Data">
        <Choice
          value={config.dateColumn ?? NONE}
          onChange={(value) => set({ dateColumn: value === NONE ? null : value })}
          options={[
            { value: NONE, label: "Sem evolução" },
            ...dates.map((s) => ({ value: s.key, label: s.label })),
          ]}
        />
      </Field>
      <Field label="Agrupar a data por">
        <Choice
          value={config.interval}
          onChange={(value) => set({ interval: value as Interval })}
          disabled={!config.dateColumn}
          options={Object.entries(INTERVAL_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </Field>
      <Field label="Período">
        <Choice
          value={config.period}
          onChange={(value) => set({ period: value as Period })}
          disabled={!config.dateColumn}
          options={Object.entries(PERIOD_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </Field>
      <Field label="Comparar por">
        <Choice
          value={config.groupBy ?? NONE}
          onChange={(value) => set({ groupBy: value === NONE ? null : value })}
          options={[
            { value: NONE, label: "Sem comparação" },
            ...groups.map((s) => ({ value: s.key, label: s.label })),
          ]}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Choice({
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <Select
      value={disabled && placeholder ? "" : value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-9 bg-background text-sm text-foreground">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

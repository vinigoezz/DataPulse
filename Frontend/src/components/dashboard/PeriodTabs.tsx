import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const PERIODS = [
  { v: "3", label: "3M" },
  { v: "6", label: "6M" },
  { v: "12", label: "12M" },
];

export function PeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)} className="rounded-lg border bg-muted/40 p-0.5" aria-label="Selecionar período">
      {PERIODS.map((p) => (
        <ToggleGroupItem key={p.v} value={p.v} className="h-7 rounded-md px-2.5 text-xs data-[state=on]:bg-card data-[state=on]:shadow-sm">
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

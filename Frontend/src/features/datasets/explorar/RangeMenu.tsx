import { ListFilter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ColumnType, ValueRange } from "../types";
import { toApiValue, toInputValue } from "./range-input";

const EMPTY: ValueRange = { min: "", max: "" };

interface Props {
  label: string;
  type: ColumnType;
  value: ValueRange | undefined;
  onChange: (range: ValueRange) => void;
}

/** Filtro "entre X e Y" de uma coluna de número, moeda, percentual ou data. */
export function RangeMenu({ label, type, value = EMPTY, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [invalid, setInvalid] = useState(false);
  const active = value.min !== "" || value.max !== "";

  const openMenu = (next: boolean) => {
    if (next) {
      setMin(toInputValue(value.min, type));
      setMax(toInputValue(value.max, type));
      setInvalid(false);
    }
    setOpen(next);
  };

  const apply = () => {
    const range = { min: toApiValue(min, type), max: toApiValue(max, type) };
    if (range.min === null || range.max === null) return setInvalid(true);
    onChange({ min: range.min, max: range.max });
    setOpen(false);
  };

  const clear = () => {
    onChange(EMPTY);
    setOpen(false);
  };

  const inputProps =
    type === "data"
      ? { type: "date" }
      : { type: "text", inputMode: "decimal" as const, placeholder: placeholder(type) };

  return (
    <Popover open={open} onOpenChange={openMenu}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded p-0.5 hover:bg-muted",
            active ? "text-primary" : "text-muted-foreground",
          )}
          aria-label={`Filtrar ${label} por faixa`}
        >
          <ListFilter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3 p-3 text-left" align="end">
        <p className="text-xs font-medium">{label}: mostrar valores entre</p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              {...inputProps}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-label="Mínimo"
              className="h-8 text-xs"
            />
            <Input
              {...inputProps}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              aria-label="Máximo"
              className="h-8 text-xs"
            />
          </div>
          {invalid && (
            <p role="alert" className="text-xs text-destructive">
              Use números como 1.234,56 (ou deixe em branco).
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              Limpar
            </Button>
            <Button type="submit" variant="brand" size="sm">
              Aplicar
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function placeholder(type: ColumnType) {
  return type === "percentual" ? "ex.: 15" : type === "moeda" ? "ex.: 1.000,00" : "ex.: 10";
}

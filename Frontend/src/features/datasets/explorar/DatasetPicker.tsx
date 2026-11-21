import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dataset } from "../types";

interface Props {
  datasets: Dataset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DatasetPicker({ datasets, selectedId, onSelect }: Props) {
  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className="h-9 w-72 bg-card font-mono" aria-label="Escolher dataset">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {datasets.map((d) => (
          <SelectItem key={d.id} value={d.id} className="font-mono">
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

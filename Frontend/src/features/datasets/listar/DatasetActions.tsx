import { Eye, Info, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canExplore, type Dataset } from "../types";

/** O que o usuário pode fazer com um dataset; a tela decide como cada ação acontece. */
export interface DatasetHandlers {
  onDetails: (dataset: Dataset) => void;
  onExplore: (dataset: Dataset) => void;
  onRemove: (dataset: Dataset) => void;
}

export function DatasetActions({
  dataset,
  onDetails,
  onExplore,
  onRemove,
}: { dataset: Dataset } & DatasetHandlers) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Ações para ${dataset.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onDetails(dataset)}>
          <Info /> Abrir detalhes
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canExplore(dataset)} onSelect={() => onExplore(dataset)}>
          <Eye /> Explorar dados
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onRemove(dataset)}
        >
          <Trash2 /> Remover
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

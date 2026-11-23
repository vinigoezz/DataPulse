import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRemoveDataset } from "../queries";
import type { Dataset } from "../types";

export function RemoveDatasetDialog({
  dataset,
  onClose,
}: {
  dataset: Dataset | null;
  onClose: () => void;
}) {
  const removal = useRemoveDataset();

  const confirm = (target: Dataset) =>
    removal.mutate(target.id, {
      onSuccess: () => toast.success(`${target.name} removido`),
      onError: (error) => toast.error("Não foi possível remover", { description: error.message }),
    });

  return (
    <AlertDialog open={!!dataset} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover dataset?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-mono text-foreground">{dataset?.name}</span> e todos os seus dados
            serão apagados. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => dataset && confirm(dataset)}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

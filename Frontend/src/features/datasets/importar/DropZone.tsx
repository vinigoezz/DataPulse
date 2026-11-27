import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ACCEPTED_EXTENSIONS } from "./preview";

const HINTS = ["Formatos: .csv, .xlsx, .zip ou .gz", "No Excel, vale a primeira aba", "Até 200 MB"];

export function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => inputRef.current?.click();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={cn(
        "surface-card relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden border-2 border-dashed px-6 py-16 text-center transition-all md:py-24",
        dragging ? "border-primary bg-primary/5" : "hover:border-primary/50",
      )}
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <span
        className={cn(
          "relative grid size-16 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-brand transition-transform",
          dragging && "scale-110",
        )}
      >
        <UploadCloud className="size-7" />
      </span>
      <div className="relative space-y-1">
        <p className="text-lg font-semibold">Arraste seu arquivo CSV até aqui</p>
        <p className="text-sm text-muted-foreground">Ou clique para selecionar um arquivo</p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        {HINTS.map((hint) => (
          <span key={hint} className="rounded-md border bg-background/60 px-2 py-1">
            {hint}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // permite escolher o mesmo arquivo de novo
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

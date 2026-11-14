import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-brand shadow-brand", className)}>
      <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 13h4l2-6 3.5 11L15 9l1.6 4H22" />
      </svg>
    </span>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight">
          Data<span className="text-gradient-brand">Pulse</span>
        </span>
      )}
    </span>
  );
}

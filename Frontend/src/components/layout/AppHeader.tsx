import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS } from "./nav";
import { ProfileMenuContent } from "./AppSidebar";
import { useTheme } from "@/lib/theme";
import { CURRENT_USER } from "@/mocks/datasets";
import { useDatasets } from "@/hooks/use-datasets";

const NOTIFS = [
  { t: "vendas_2026.csv processado", d: "Há 2 horas", tone: "bg-success" },
  { t: "despesas_operacionais.csv em processamento", d: "Há 5 dias", tone: "bg-warning" },
  { t: "Falha ao validar clientes_ativos.csv", d: "Há 2 semanas", tone: "bg-destructive" },
];

export function AppHeader() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const current = NAV_ITEMS.find((i) => (i.to === "/" ? path === "/" : path.startsWith(i.to)));
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { datasets } = useDatasets();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-5">
      <SidebarTrigger aria-label="Alternar menu" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link to="/" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline">Data Pulse</Link>
        <span className="hidden text-muted-foreground/50 sm:inline">/</span>
        <span className="truncate font-medium">{current?.title ?? "Página"}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={() => setOpen(true)} className="hidden h-9 w-64 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:flex lg:w-80">
          <Search className="size-4" /> Buscar páginas e datasets…
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Buscar"><Search /></Button>
        <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex">
          <Link to="/importar"><UploadCloud /> Importar</Link>
        </Button>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
                  <Bell />
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Notificações</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3 text-sm font-medium">Notificações <span className="ml-1 text-xs font-normal text-muted-foreground">(demonstração)</span></div>
            <ul className="divide-y">
              {NOTIFS.map((n) => (
                <li key={n.t} className="flex gap-3 px-4 py-3 text-sm">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.tone}`} />
                  <div><p>{n.t}</p><p className="text-xs text-muted-foreground">{n.d}</p></div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">{theme === "dark" ? <Sun /> : <Moon />}</Button>
          </TooltipTrigger>
          <TooltipContent>{theme === "dark" ? "Modo claro" : "Modo escuro"}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full" aria-label="Menu do perfil">
              <Avatar className="size-8"><AvatarFallback className="bg-gradient-brand text-xs font-semibold text-primary-foreground">{CURRENT_USER.initials}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <ProfileMenuContent />
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas e datasets…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {NAV_ITEMS.map((i) => (
              <CommandItem key={i.to} onSelect={() => { setOpen(false); navigate({ to: i.to }); }}>
                <i.icon /> {i.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Datasets">
            {datasets.map((d) => (
              <CommandItem key={d.id} onSelect={() => { setOpen(false); navigate({ to: "/datasets" }); }}>{d.name}</CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

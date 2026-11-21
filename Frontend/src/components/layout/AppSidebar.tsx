import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./nav";
import { useTheme } from "@/lib/theme";
import { CURRENT_USER } from "@/mocks/datasets";
import { toast } from "sonner";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-3">
        <Link to="/" onClick={() => setOpenMobile(false)} aria-label="Data Pulse — início">
          <Logo collapsed={collapsed} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                    className="h-9 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&[data-active=true]>svg]:text-primary"
                  >
                    <Link to={item.to} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.soon && (
                    <SidebarMenuBadge className="rounded-full border border-primary/30 bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                      Em breve
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggle} tooltip="Alternar tema">
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={CURRENT_USER.name}>
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-brand text-xs font-semibold text-primary-foreground">
                      {CURRENT_USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{CURRENT_USER.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {CURRENT_USER.role}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <ProfileMenuContent side={isMobile ? "top" : "right"} />
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function ProfileMenuContent({ side = "bottom" }: { side?: "top" | "right" | "bottom" }) {
  return (
    <DropdownMenuContent side={side} align="end" className="w-60">
      <DropdownMenuLabel className="font-normal">
        <div className="text-sm font-medium">{CURRENT_USER.name}</div>
        <div className="text-xs text-muted-foreground">{CURRENT_USER.email}</div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/configuracoes">
          <User /> Minha conta
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/configuracoes">
          <Settings /> Configurações
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => toast.info("Autenticação disponível após integração com o backend.")}
      >
        <LogOut /> Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

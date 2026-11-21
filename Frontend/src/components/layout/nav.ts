import {
  BarChart3,
  Bot,
  Database,
  FileText,
  LayoutGrid,
  Settings,
  Table2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  to:
    | "/"
    | "/dashboard"
    | "/importar"
    | "/datasets"
    | "/explorador"
    | "/relatorios"
    | "/assistente"
    | "/configuracoes";
  icon: LucideIcon;
  soon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Visão Geral", to: "/", icon: LayoutGrid },
  { title: "Dashboard", to: "/dashboard", icon: BarChart3 },
  { title: "Importar Dados", to: "/importar", icon: UploadCloud },
  { title: "Meus Datasets", to: "/datasets", icon: Database },
  { title: "Explorador de Dados", to: "/explorador", icon: Table2 },
  { title: "Relatórios", to: "/relatorios", icon: FileText },
  { title: "Assistente IA", to: "/assistente", icon: Bot, soon: true },
  { title: "Configurações", to: "/configuracoes", icon: Settings },
];

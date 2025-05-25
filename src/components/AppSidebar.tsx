
import { BarChart3, FileSpreadsheet, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useResponsive } from "@/hooks/useResponsive";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { isMobile } = useResponsive();

  const menuItems = [
    { id: "dashboard", icon: BarChart3, label: "Painel" },
    { id: "connect", icon: FileSpreadsheet, label: "Conectar Planilha" },
    { id: "settings", icon: Settings, label: "Configurações" }
  ];

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h2 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                agência
              </h2>
              <h1 className="text-xl font-semibold text-foreground">
                kaizen
              </h1>
            </div>
          </div>
          {!isMobile && <ThemeToggle />}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.id)}
                isActive={activeSection === item.id}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-accent/50"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          Kaizen Financial Dashboard
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

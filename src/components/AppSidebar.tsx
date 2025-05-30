import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  BarChart3,
  FileSpreadsheet,
  Building2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTheme } from "@/components/ThemeProvider"

// Menu items.
const items = [
  {
    title: "Painel",
    url: "#",
    icon: BarChart3,
    id: "dashboard",
  },
  {
    title: "Conectar Planilha",
    url: "#",
    icon: FileSpreadsheet,
    id: "connect",
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
    id: "settings",
  },
]

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { theme } = useTheme();
  
  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
            alt="Logo" 
            className={`h-10 w-auto ${theme === 'light' ? 'brightness-0' : ''}`}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <button className="w-full flex items-center space-x-3">
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

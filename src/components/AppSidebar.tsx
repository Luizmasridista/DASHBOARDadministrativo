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
import { motion } from "framer-motion"

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
    title: "Consolidado",
    url: "#",
    icon: Building2,
    id: "consolidated",
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
                    <button className="w-full flex items-center space-x-3 relative overflow-hidden">
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-md z-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        />
                      )}
                      <item.icon className="relative z-10" />
                      <span className="relative z-10">{item.title}</span>
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

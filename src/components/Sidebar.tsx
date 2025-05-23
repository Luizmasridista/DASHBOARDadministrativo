
import { BarChart3, DollarSign, Settings, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", icon: BarChart3, label: "Painel", active: true },
    { id: "connect", icon: FileSpreadsheet, label: "Conectar Planilha" },
    { id: "settings", icon: Settings, label: "Configurações" }
  ];

  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 min-h-screen text-white transition-colors duration-200">
      <div className="p-6 border-b border-slate-700 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h2 className="text-sm text-gray-300">agência</h2>
              <h1 className="text-lg font-semibold">kaizen</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-slate-800 dark:hover:bg-slate-900 transition-colors",
              activeSection === item.id ? "bg-slate-800 dark:bg-slate-900 border-r-2 border-red-600" : ""
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Settings, FileText, TrendingUp } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Nova Receita",
      description: "Registrar receita",
      icon: Plus,
      color: "green",
      action: () => console.log("Nova receita")
    },
    {
      title: "Nova Despesa", 
      description: "Registrar despesa",
      icon: Plus,
      color: "red",
      action: () => console.log("Nova despesa")
    },
    {
      title: "Relatório",
      description: "Gerar relatório",
      icon: FileText,
      color: "blue",
      action: () => console.log("Gerar relatório")
    },
    {
      title: "Exportar",
      description: "Baixar dados",
      icon: Download,
      color: "purple",
      action: () => console.log("Exportar")
    },
    {
      title: "Importar",
      description: "Carregar dados",
      icon: Upload,
      color: "orange",
      action: () => console.log("Importar")
    },
    {
      title: "Análise",
      description: "Ver insights",
      icon: TrendingUp,
      color: "indigo",
      action: () => console.log("Análise")
    }
  ];

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-light text-gray-900 dark:text-white">
            Ações Rápidas
          </h3>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              onClick={action.action}
            >
              <div className={`w-12 h-12 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                <action.icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

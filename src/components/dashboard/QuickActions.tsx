
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Settings, FileText, TrendingUp } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { QuickActionModal } from "@/components/modals/QuickActionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const { isMobile, isTablet } = useResponsive();
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'receita' | 'despesa' | null>(null);
  
  const handleAction = (actionType: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para usar esta funcionalidade.",
        variant: "destructive",
      });
      return;
    }

    switch (actionType) {
      case "receita":
        setSelectedAction('receita');
        setModalOpen(true);
        break;
      case "despesa":
        setSelectedAction('despesa');
        setModalOpen(true);
        break;
      default:
        toast({
          title: "Em desenvolvimento",
          description: "Esta funcionalidade será implementada em breve.",
        });
    }
  };

  const actions = [
    {
      title: "Nova Receita",
      description: "Registrar receita",
      icon: Plus,
      color: "green",
      action: () => handleAction("receita")
    },
    {
      title: "Nova Despesa", 
      description: "Registrar despesa",
      icon: Plus,
      color: "red",
      action: () => handleAction("despesa")
    },
    {
      title: "Relatório",
      description: "Gerar relatório",
      icon: FileText,
      color: "blue",
      action: () => handleAction("relatorio")
    },
    {
      title: "Exportar",
      description: "Baixar dados",
      icon: Download,
      color: "purple",
      action: () => handleAction("exportar")
    },
    {
      title: "Importar",
      description: "Carregar dados",
      icon: Upload,
      color: "orange",
      action: () => handleAction("importar")
    },
    {
      title: "Análise",
      description: "Ver insights",
      icon: TrendingUp,
      color: "indigo",
      action: () => handleAction("analise")
    }
  ];

  // Determinar o número de colunas baseado no dispositivo
  const getGridCols = () => {
    if (isMobile) return "grid-cols-2";
    if (isTablet) return "grid-cols-3";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
  };

  return (
    <>
      <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-light text-gray-900 dark:text-white`}>
              Ações Rápidas
            </h3>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className={`grid ${getGridCols()} gap-3 sm:gap-4`}>
            {actions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto ${isMobile ? 'p-3' : 'p-4'} flex flex-col items-center gap-2 sm:gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group min-h-[80px] sm:min-h-[100px]`}
                onClick={action.action}
              >
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                  <action.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <div className="text-center">
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white leading-tight`}>
                    {action.title}
                  </p>
                  {!isMobile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <QuickActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={selectedAction}
      />
    </>
  );
}

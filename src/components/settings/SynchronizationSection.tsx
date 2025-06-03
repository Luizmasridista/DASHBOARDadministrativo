
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIntegratedSheetData } from "@/hooks/useIntegratedSheetData";

const SynchronizationSection = () => {
  const { refetch, loading: syncLoading, activeConnection } = useIntegratedSheetData();

  const handleSyncNow = async () => {
    try {
      await refetch();
      toast({
        title: "Sincronização Concluída",
        description: activeConnection 
          ? `Dados atualizados com sucesso via ${activeConnection.project_name}`
          : "Dados atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5" />
          <span>Sincronização</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gerencie a sincronização com suas fontes de dados
          {activeConnection && (
            <span className="block mt-1 text-green-600 dark:text-green-400">
              Conectado via: {activeConnection.project_name}
            </span>
          )}
        </p>
        
        <Button 
          onClick={handleSyncNow}
          variant="outline" 
          className="w-full"
          disabled={syncLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
          {syncLoading ? "Sincronizando..." : "Sincronizar Agora"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SynchronizationSection;

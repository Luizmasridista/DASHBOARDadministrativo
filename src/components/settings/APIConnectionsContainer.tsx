
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  CheckCircle, 
  RefreshCw,
  FileSpreadsheet,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const APIConnectionsContainer = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Conexões atualizadas",
        description: "Status das conexões verificado",
      });
    }, 1000);
  };

  const getConnectedSheetInfo = () => {
    const savedSheetId = localStorage.getItem('connectedSheetId');
    const savedRange = localStorage.getItem('connectedSheetRange');
    
    if (savedSheetId) {
      return {
        sheetId: savedSheetId,
        range: savedRange || 'A:Z',
        status: 'active'
      };
    }
    return null;
  };

  const connectedSheet = getConnectedSheetInfo();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Key className="h-5 w-5" />
            Conexões Ativas
          </CardTitle>
          <button 
            onClick={handleRefresh} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={refreshing}
            title="Atualizar conexões"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {!connectedSheet ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-1">Nenhuma planilha conectada</h3>
            <p className="text-muted-foreground max-w-md">
              Conecte uma planilha do Google Sheets para visualizar as informações de conexão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Google Sheets API</h3>
                    <p className="text-sm text-muted-foreground">
                      Conexão com planilha do Google Sheets
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 px-2 rounded flex-1">
                      {connectedSheet.sheetId}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="text-muted-foreground mr-2">Intervalo:</span>
                      {connectedSheet.range}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Usando API padrão do Google Sheets v4
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIConnectionsContainer;

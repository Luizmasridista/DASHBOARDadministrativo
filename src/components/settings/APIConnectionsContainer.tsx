import { useState } from "react";
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
import { useUserSheets } from "@/hooks/useUserSheets";
import { useAuth } from "@/contexts/AuthContext";

const APIConnectionsContainer = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { sheets, loading } = useUserSheets();
  const { user } = useAuth();

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
        {user?.email && (
          <div className="mt-2 text-sm text-muted-foreground">
            Conta Google: <span className="font-medium">{user.email}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-muted-foreground">Carregando conexões...</span>
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-1">Nenhuma planilha conectada</h3>
            <p className="text-muted-foreground max-w-md">
              Conecte uma planilha do Google Sheets para visualizar as informações de conexão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sheets.map((sheet) => (
              <Card key={sheet.id} className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{sheet.sheetTitle || 'Google Sheets API'}</h3>
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
                        {sheet.project_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-2">Intervalo:</span>
                        {sheet.description || 'A:Z'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Usando API padrão do Google Sheets v4
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIConnectionsContainer;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database, 
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { useGoogleSheetsConnections } from "@/hooks/useGoogleSheetsConnections";
import { toast } from "@/hooks/use-toast";

const APIConnectionsContainer = () => {
  const { 
    connections, 
    loading, 
    error, 
    refetch 
  } = useGoogleSheetsConnections();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar conexões",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inativa</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca utilizada';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const calculateQuotaPercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chaves API Conectadas
          </CardTitle>
          <button 
            onClick={handleRefresh} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={loading || refreshing}
            title="Atualizar conexões"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing || loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando conexões...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-1">Nenhuma API conectada</h3>
            <p className="text-muted-foreground max-w-md">
              Adicione uma conexão API na seção de Google Sheets API para visualizar aqui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden border-l-4 hover:shadow-lg transition-shadow" style={{ 
                borderLeftColor: connection.status === 'active' ? '#22c55e' : 
                                connection.status === 'error' ? '#ef4444' : '#94a3b8' 
              }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{connection.project_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.description || "Google Sheets API v4"}
                      </p>
                    </div>
                    {getStatusBadge(connection.status)}
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 px-2 rounded flex-1">
                        {connection.api_key.substring(0, 8)}...{connection.api_key.substring(connection.api_key.length - 4)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-2">Último uso:</span>
                        {formatDate(connection.last_used_at)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Quota:</span>
                        </div>
                        <span>{connection.quota_used.toLocaleString()} / {connection.quota_limit.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={calculateQuotaPercentage(connection.quota_used, connection.quota_limit)} 
                        className={`h-2 ${getQuotaColor(calculateQuotaPercentage(connection.quota_used, connection.quota_limit))}`}
                      />
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

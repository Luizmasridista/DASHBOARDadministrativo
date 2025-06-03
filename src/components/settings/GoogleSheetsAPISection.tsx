
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, CheckCircle, AlertCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGoogleSheetsConnections } from "@/hooks/useGoogleSheetsConnections";
import AddAPIConnectionModal from "../AddAPIConnectionModal";

const GoogleSheetsAPISection = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { 
    connections, 
    loading: connectionsLoading, 
    addConnection, 
    removeConnection,
    refetch
  } = useGoogleSheetsConnections();

  const handleRemoveConnection = async (connectionId: string, projectName: string) => {
    if (window.confirm(`Tem certeza que deseja remover a conexão "${projectName}"?`)) {
      await removeConnection(connectionId);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatQuotaUsage = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    return {
      text: `${used.toLocaleString()} / ${limit.toLocaleString()}`,
      percentage: Math.round(percentage)
    };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>APIs Google Sheets</span>
              {connections.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {connections.length} {connections.length === 1 ? 'conexão' : 'conexões'}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={connectionsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${connectionsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gerencie suas conexões com a API do Google Sheets. {connections.length > 0 && `${connections.filter(c => c.status === 'active').length} conexão(ões) ativa(s).`}
            </p>
            
            {connectionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Carregando conexões...</p>
              </div>
            ) : connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => {
                  const quotaInfo = formatQuotaUsage(connection.quota_used, connection.quota_limit);
                  const isActiveConnection = connection.status === 'active';
                  
                  return (
                    <div 
                      key={connection.id} 
                      className={`border rounded-lg p-4 space-y-3 transition-all ${
                        isActiveConnection 
                          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{connection.project_name}</h4>
                            {isActiveConnection && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                Em Uso
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {connection.description || "Google Sheets API v4"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Criado em: {formatDate(connection.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(connection.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveConnection(connection.id, connection.project_name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block mb-1">Chave API:</span>
                          <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded border">
                            {connection.api_key.substring(0, 20)}...
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Último uso:</span>
                          <p className="text-sm">
                            {connection.last_used_at ? formatDate(connection.last_used_at) : 'Nunca utilizada'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Quota utilizada:</span>
                          <div className="space-y-1">
                            <p className="text-sm">{quotaInfo.text}</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  quotaInfo.percentage > 80 
                                    ? 'bg-red-500' 
                                    : quotaInfo.percentage > 60 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(quotaInfo.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">{quotaInfo.percentage}% utilizada</p>
                          </div>
                        </div>
                      </div>

                      {isActiveConnection && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Esta API está sendo utilizada atualmente para sincronização de dados
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-2">Nenhuma API configurada</h3>
                <p className="text-sm mb-4">
                  Adicione uma chave de API do Google Sheets para começar a sincronizar seus dados
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(true)}
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeira API
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddAPIConnectionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={addConnection}
        loading={connectionsLoading}
      />
    </>
  );
};

export default GoogleSheetsAPISection;

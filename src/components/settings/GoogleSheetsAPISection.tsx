
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
    removeConnection 
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>APIs Google Sheets</span>
            </CardTitle>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar API
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gerencie suas conexões com a API do Google Sheets
            </p>
            
            {connectionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Carregando conexões...</p>
              </div>
            ) : connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{connection.project_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {connection.description || "Google Sheets API v4"}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Chave API:</span>
                        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          {connection.api_key.substring(0, 20)}...
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projeto:</span>
                        <p className="text-xs">{connection.project_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último uso:</span>
                        <p>{connection.last_used_at ? formatDate(connection.last_used_at) : 'Nunca'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quota utilizada:</span>
                        <p>{connection.quota_used.toLocaleString()} / {connection.quota_limit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma API configurada</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(true)}
                  className="mt-2"
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

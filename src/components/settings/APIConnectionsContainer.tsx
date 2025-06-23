
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Key, 
  CheckCircle, 
  RefreshCw,
  FileSpreadsheet,
  Database,
  Plus,
  Trash2,
  Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSecureApiConnections } from "@/hooks/useSecureApiConnections";
import { useAuth } from "@/contexts/AuthContext";

const APIConnectionsContainer = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const { connections, loading, storeApiKey, deleteConnection, refetch } = useSecureApiConnections();
  const { user } = useAuth();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Conexões atualizadas",
        description: "Status das conexões verificado",
      });
    }, 1000);
  };

  const handleAddApiKey = async () => {
    if (!newApiKey.trim() || !newProjectName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a chave API e o nome do projeto.",
        variant: "destructive"
      });
      return;
    }

    try {
      await storeApiKey(newApiKey, newProjectName, newDescription);
      setNewApiKey("");
      setNewProjectName("");
      setNewDescription("");
      setShowAddDialog(false);
    } catch (error) {
      // Error already handled in the hook
    }
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

  if (!user) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium text-lg mb-1">Autenticação necessária</h3>
          <p className="text-muted-foreground">
            Faça login para gerenciar suas conexões API de forma segura
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Conexões Seguras
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Chave API Segura</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Nome do Projeto</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Ex: Google Sheets API - Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">Chave API</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Descrição da conexão"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddApiKey}>
                      <Shield className="h-4 w-4 mr-1" />
                      Armazenar com Segurança
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <button 
              onClick={handleRefresh} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={refreshing}
              title="Atualizar conexões"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando conexões...</div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-1">Nenhuma conexão API</h3>
            <p className="text-muted-foreground max-w-md">
              Adicione uma chave API do Google Sheets para conectar suas planilhas de forma segura
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        {connection.project_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.description || 'Conexão API criptografada'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {connection.status === 'active' ? 'Ativa' : connection.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteConnection(connection.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Key className="h-4 w-4" />
                      Chave API criptografada e armazenada com segurança
                    </div>
                    
                    {connection.quota_used !== null && connection.quota_limit !== null && (
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>Cota: {connection.quota_used.toLocaleString()} / {connection.quota_limit.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {connection.last_used_at && (
                      <div className="text-xs text-muted-foreground">
                        Último uso: {new Date(connection.last_used_at).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {connectedSheet && (
              <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Planilha Conectada</h3>
                      <p className="text-sm text-muted-foreground">
                        Planilha do Google Sheets ativa
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectada
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIConnectionsContainer;

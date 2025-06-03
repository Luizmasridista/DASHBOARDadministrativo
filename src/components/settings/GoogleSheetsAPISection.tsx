
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, CheckCircle, AlertCircle, Plus, Trash2, RefreshCw, Clock, Calendar, BarChart, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGoogleSheetsConnections } from "@/hooks/useGoogleSheetsConnections";
import AddAPIConnectionModal from "../AddAPIConnectionModal";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GoogleSheetsAPISection = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  
  const { 
    connections, 
    loading: connectionsLoading, 
    error: connectionsError,
    addConnection, 
    removeConnection,
    refetch
  } = useGoogleSheetsConnections();

  // Debug: Log connections para verificar o que está sendo retornado
  useEffect(() => {
    console.log("Conexões atuais no componente:", connections);
    console.log("Loading:", connectionsLoading);
    console.log("Error:", connectionsError);
  }, [connections, connectionsLoading, connectionsError]);

  const handleRefresh = () => {
    setIsManualRefresh(true);
    refetch().finally(() => {
      setTimeout(() => setIsManualRefresh(false), 2000);
    });
  };

  const handleRemoveConnection = async (connectionId: string, projectName: string) => {
    if (window.confirm(`Tem certeza que deseja remover a conexão "${projectName}"?`)) {
      await removeConnection(connectionId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />Ativa
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta conexão está ativa e funcionando normalmente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "error":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />Erro
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta conexão está com problemas. Verifique a chave API.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "inactive":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />Inativa
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta conexão está temporariamente inativa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <Badge variant="outline">Desconhecido</Badge>
        );
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Data inválida';
    }
  };

  const getQuotaPercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 70) return "bg-amber-500";
    return "bg-green-500";
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
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={connectionsLoading || isManualRefresh}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isManualRefresh || connectionsLoading ? 'animate-spin' : ''}`} />
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
              Gerencie suas conexões com a API do Google Sheets.
            </p>
            
            {/* Debug info - remover em produção */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                Debug: {connections.length} conexões carregadas, Loading: {connectionsLoading.toString()}, Error: {connectionsError || 'nenhum'}
              </div>
            )}
            
            {/* Exibir erro, se houver */}
            {connectionsError && !connectionsLoading && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao carregar conexões</AlertTitle>
                <AlertDescription className="flex flex-col space-y-2">
                  <p>{connectionsError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    className="self-start"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {connectionsLoading && !isManualRefresh ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Carregando conexões...</p>
                <p className="text-xs mt-1">Buscando dados das APIs configuradas</p>
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div 
                    key={connection.id} 
                    className={`border rounded-lg p-4 space-y-3 ${
                      connection.status === 'error' 
                        ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800' 
                        : connection.status === 'inactive'
                          ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800'
                          : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center">
                          {connection.project_name}
                          {connection.status === 'active' && (
                            <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                          )}
                        </h4>
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
                        <span className="text-muted-foreground flex items-center">
                          <Info className="w-3 h-3 mr-1" />Chave API:
                        </span>
                        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded mt-1">
                          {connection.api_key.substring(0, 8)}...{connection.api_key.substring(connection.api_key.length - 8)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />Criado em:
                        </span>
                        <p className="text-xs mt-1">{formatDate(connection.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />Último uso:
                        </span>
                        <p className="text-xs mt-1">{formatDate(connection.last_used_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <BarChart className="w-3 h-3 mr-1" />Quota utilizada:
                        </span>
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{connection.quota_used.toLocaleString()}</span>
                            <span>{connection.quota_limit.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={getQuotaPercentage(connection.quota_used, connection.quota_limit)} 
                            className={`h-2 ${getQuotaColor(getQuotaPercentage(connection.quota_used, connection.quota_limit))}`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {connection.status === 'error' && (
                      <Alert variant="destructive" className="mt-2 py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">Problema detectado</AlertTitle>
                        <AlertDescription className="text-xs">
                          Esta chave API está com problemas. Verifique se a chave é válida e tem as permissões necessárias.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma API configurada</p>
                <p className="text-xs mb-4">Adicione uma chave API do Google Sheets para sincronizar seus dados</p>
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

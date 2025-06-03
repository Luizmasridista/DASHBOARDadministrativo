
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, RefreshCw, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useExportPDF } from "@/hooks/useExportPDF";
import { useExportExcel } from "@/hooks/useExportExcel";
import { useSheetDataWithOAuth } from "@/hooks/useSheetDataWithOAuth";

const Settings = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  const { exportToPDF, isLoading: pdfLoading } = useExportPDF();
  const { exportToExcel, isLoading: excelLoading } = useExportExcel();
  const { refetch, loading: syncLoading } = useSheetDataWithOAuth();

  // APIs do Google Sheets ativas no sistema
  const activeAPIs = [
    {
      id: 1,
      name: "Google Sheets API v4",
      key: "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg",
      status: "active",
      description: "API principal para leitura de planilhas",
      lastUsed: "2024-06-03 14:30",
      quotaUsed: "1,234",
      quotaLimit: "100,000",
      project: "integracao-relatorios-fin"
    },
    {
      id: 2,
      name: "Google Sheets API v4",
      key: "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg",
      status: "active",
      description: "API secundária - Chave Sheets Dashboard",
      lastUsed: "2024-06-03 14:25",
      quotaUsed: "856",
      quotaLimit: "100,000",
      project: "Relatorios Financ Dash"
    }
  ];

  const handleSaveSettings = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('settings', JSON.stringify({
      autoRefresh,
      refreshInterval,
      emailNotifications
    }));

    toast({
      title: "Configurações Salvas",
      description: "Suas preferências foram atualizadas",
    });
  };

  const handleSyncNow = async () => {
    try {
      await refetch();
      toast({
        title: "Sincronização Concluída",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados",
        variant: "destructive"
      });
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

  return (
    <div className="space-y-6">
      {/* APIs Google Sheets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>APIs Google Sheets Ativas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Lista das APIs do Google Sheets configuradas e seus status atuais
            </p>
            
            {activeAPIs.length > 0 ? (
              <div className="space-y-4">
                {activeAPIs.map((api) => (
                  <div key={api.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{api.name}</h4>
                        <p className="text-sm text-muted-foreground">{api.description}</p>
                      </div>
                      {getStatusBadge(api.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Chave API:</span>
                        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          {api.key.substring(0, 20)}...
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projeto:</span>
                        <p className="text-xs">{api.project}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último uso:</span>
                        <p>{api.lastUsed}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quota utilizada:</span>
                        <p>{api.quotaUsed} / {api.quotaLimit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma API configurada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Atualização Automática</Label>
              <p className="text-sm text-muted-foreground">
                Atualizar dados automaticamente
              </p>
            </div>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh-interval">Intervalo de Atualização (minutos)</Label>
            <Input
              id="refresh-interval"
              type="number"
              min="1"
              max="60"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber alertas de variações significativas
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Exportar Relatórios</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Baixe seus dados financeiros em diferentes formatos
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={exportToPDF} 
              variant="outline" 
              className="w-full"
              disabled={pdfLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {pdfLoading ? "Gerando..." : "Exportar PDF"}
            </Button>
            
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              className="w-full"
              disabled={excelLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {excelLoading ? "Gerando..." : "Exportar Excel"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Settings;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useExportPDF } from "@/hooks/useExportPDF";
import { useExportExcel } from "@/hooks/useExportExcel";
import { useSheetDataWithOAuth } from "@/hooks/useSheetDataWithOAuth";
import APIConnectionsContainer from "./settings/APIConnectionsContainer";
import ExportReportsSection from "./settings/ExportReportsSection";
import SynchronizationSection from "./settings/SynchronizationSection";
import GoogleSheetsAPISection from "./settings/GoogleSheetsAPISection";

const Settings = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  const { exportToPDF, isLoading: pdfLoading } = useExportPDF();
  const { exportToExcel, isLoading: excelLoading } = useExportExcel();
  const { refetch, loading: syncLoading } = useSheetDataWithOAuth();

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

  return (
    <div className="space-y-6">
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
      
      <APIConnectionsContainer />
      
      <SynchronizationSection />
      
      <ExportReportsSection />
      
      <GoogleSheetsAPISection />
    </div>
  );
};

export default Settings;

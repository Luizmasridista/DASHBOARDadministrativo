
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, AlertCircle, CheckCircle, Users, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSheetDataWithOAuth } from "@/hooks/useSheetDataWithOAuth";
import GoogleConnectionManager from "./GoogleConnectionManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ConnectSheetWithOAuth = () => {
  const [sheetId, setSheetId] = useState(() => localStorage.getItem('connectedSheetId') || "");
  const [sheetRange, setSheetRange] = useState(() => localStorage.getItem('connectedSheetRange') || "A1:D100");
  const [connected, setConnected] = useState(() => localStorage.getItem('connectedSheetId') !== null);
  const [loading, setLoading] = useState(false);
  const [showConnectionManager, setShowConnectionManager] = useState(false);

  const { connections, selectedConnection, setSelectedConnection, refetch } = useSheetDataWithOAuth();

  const handleConnect = async () => {
    if (!sheetId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID da planilha",
        variant: "destructive"
      });
      return;
    }

    if (!selectedConnection) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma conexão Google primeiro",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Save sheet configuration
      localStorage.setItem('connectedSheetId', sheetId);
      localStorage.setItem('connectedSheetRange', sheetRange);
      
      setConnected(true);
      
      // Trigger data refresh
      await refetch();
      
      toast({
        title: "Sucesso!",
        description: "Planilha conectada com sucesso. O dashboard será atualizado automaticamente.",
      });
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('sheetConnected'));
      
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Remove sheet configuration
    localStorage.removeItem('connectedSheetId');
    localStorage.removeItem('connectedSheetRange');
    
    setConnected(false);
    setSheetId("");
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('sheetDisconnected'));
    
    toast({
      title: "Desconectado",
      description: "Planilha desconectada com sucesso",
    });
  };

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);

  return (
    <div className="space-y-6">
      {/* OAuth Connections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Conexões Google OAuth 2.0</span>
            </div>
            <Dialog open={showConnectionManager} onOpenChange={setShowConnectionManager}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gerenciar Conexões Google</DialogTitle>
                </DialogHeader>
                <GoogleConnectionManager />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Nenhuma conexão Google configurada</h3>
                <p className="text-muted-foreground">
                  Configure uma conexão OAuth 2.0 primeiro para acessar planilhas Google de forma segura.
                </p>
              </div>
              <Button onClick={() => setShowConnectionManager(true)}>
                Configurar Conexão Google
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="connectionSelect">Selecionar Conta Google</Label>
                <Select value={selectedConnection || ""} onValueChange={setSelectedConnection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma conta Google" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-medium">{connection.account_name}</div>
                            <div className="text-sm text-muted-foreground">{connection.account_email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedConnectionData && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Conta conectada: {selectedConnectionData.account_email}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Configurar Planilha</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="sheetId">ID da Planilha</Label>
                <Input
                  id="sheetId"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  O ID está na URL da sua planilha: https://docs.google.com/spreadsheets/d/<strong>[ID_AQUI]</strong>/edit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheetRange">Intervalo de Células</Label>
                <Input
                  id="sheetRange"
                  placeholder="A1:D100"
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Exemplo: A1:D100 (inclui cabeçalhos e dados)
                </p>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={loading || !selectedConnection}
                className="w-full"
              >
                {loading ? "Conectando..." : "Conectar Planilha"}
              </Button>
              
              {!selectedConnection && connections.length > 0 && (
                <p className="text-sm text-yellow-600 text-center">
                  Selecione uma conta Google primeiro
                </p>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-600">Planilha Conectada!</h3>
              <p className="text-muted-foreground">
                Sua planilha está conectada {selectedConnectionData && `usando a conta ${selectedConnectionData.account_email}`} 
                e os dados estão sendo sincronizados no dashboard.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>ID da Planilha:</strong> {sheetId}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Intervalo:</strong> {sheetRange}
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Format Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Formato da Planilha</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para o dashboard funcionar corretamente, sua planilha deve ter as seguintes colunas:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                <div className="p-2 bg-white rounded border">Data</div>
                <div className="p-2 bg-white rounded border">Receita</div>
                <div className="p-2 bg-white rounded border">Despesa</div>
                <div className="p-2 bg-white rounded border">Categoria</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A planilha deve estar acessível pela conta Google conectada através do OAuth 2.0.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSheetWithOAuth;

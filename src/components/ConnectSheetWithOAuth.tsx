
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSheetDataWithOAuth } from "@/hooks/useSheetDataWithOAuth";

const ConnectSheetWithOAuth = () => {
  const [sheetId, setSheetId] = useState(() => localStorage.getItem('connectedSheetId') || "");
  const [sheetRange, setSheetRange] = useState(() => localStorage.getItem('connectedSheetRange') || "A1:D100");
  const [connected, setConnected] = useState(() => localStorage.getItem('connectedSheetId') !== null);
  const [loading, setLoading] = useState(false);

  const { refetch } = useSheetDataWithOAuth();

  const handleConnect = async () => {
    if (!sheetId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID da planilha",
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

  return (
    <div className="space-y-6">
      {/* Sheet Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Conectar Planilha Google Sheets</span>
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
                disabled={loading}
                className="w-full"
              >
                {loading ? "Conectando..." : "Conectar Planilha"}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-600">Planilha Conectada!</h3>
              <p className="text-muted-foreground">
                Sua planilha está conectada e os dados estão sendo sincronizados no dashboard.
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
                <div className="p-2 bg-white rounded border">Categoria</div>
                <div className="p-2 bg-white rounded border">Descrição</div>
                <div className="p-2 bg-white rounded border">Valor</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A planilha deve estar configurada como pública (visualização para qualquer pessoa com o link).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSheetWithOAuth;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ConnectSheet = () => {
  const [sheetId, setSheetId] = useState(() => localStorage.getItem('connectedSheetId') || "");
  const [sheetRange, setSheetRange] = useState(() => localStorage.getItem('connectedSheetRange') || "A1:D100");
  const [connected, setConnected] = useState(() => localStorage.getItem('connectedSheetId') !== null);
  const [loading, setLoading] = useState(false);

  const API_KEY = "AIzaSyDMffuGHiDAx03cuiwLdUPoPZIbos8tSUE";

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
      // Construir URL da API do Google Sheets
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log("Dados recebidos:", data);
      
      if (data.values && data.values.length > 0) {
        // Salvar dados de conexão no localStorage
        localStorage.setItem('connectedSheetId', sheetId);
        localStorage.setItem('connectedSheetRange', sheetRange);
        
        setConnected(true);
        toast({
          title: "Sucesso!",
          description: "Planilha conectada com sucesso. O dashboard será atualizado automaticamente.",
        });
        
        // Disparar evento personalizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('sheetConnected'));
      } else {
        throw new Error("Nenhum dado encontrado na planilha");
      }
      
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
    // Remover dados de conexão do localStorage
    localStorage.removeItem('connectedSheetId');
    localStorage.removeItem('connectedSheetRange');
    
    setConnected(false);
    setSheetId("");
    
    // Disparar evento personalizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('sheetDisconnected'));
    
    toast({
      title: "Desconectado",
      description: "Planilha desconectada com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Conectar Planilha do Google Sheets</span>
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
              <Button variant="outline" onClick={handleDisconnect}>
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              Certifique-se de que a planilha esteja pública ou compartilhada com permissão de visualização.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSheet;

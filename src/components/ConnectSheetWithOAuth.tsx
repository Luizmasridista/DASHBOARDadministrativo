import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserSheets } from "@/hooks/useUserSheets";

const ConnectSheetWithOAuth = () => {
  const [sheetId, setSheetId] = useState("");
  const [sheetRange, setSheetRange] = useState("A1:D100");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { sheets, loading: sheetsLoading, error: sheetsError } = useUserSheets();

  const handleConnect = async () => {
    if (!sheetId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID da planilha",
        variant: "destructive"
      });
      return;
    }
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Salvar conexão no Supabase
      const { error } = await supabase.from('google_sheets_connections').insert({
        project_name: sheetId,
        api_key: "API_KEY_PLACEHOLDER",
        user_id: user.id,
        description: sheetRange,
        status: 'active',
      });
      if (error) throw error;
      setSheetId("");
      setSheetRange("A1:D100");
      toast({
        title: "Sucesso!",
        description: "Planilha conectada com sucesso. O dashboard será atualizado automaticamente."
      });
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

  const handleDisconnect = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('google_sheets_connections').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Desconectado",
        description: "Planilha desconectada com sucesso"
      });
      window.dispatchEvent(new CustomEvent('sheetConnected'));
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-6">
      {/* Lista de planilhas conectadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Planilhas Conectadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sheetsLoading ? (
            <div>Carregando conexões...</div>
          ) : sheets && sheets.length > 0 ? (
            <ul className="space-y-3">
              {sheets.map(sheet => (
                <li key={sheet.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded p-3 border">
                  <div>
                    <div className="font-mono text-xs text-blue-700 dark:text-blue-300">{sheet.project_name}</div>
                    <div className="text-xs text-muted-foreground">Intervalo: {sheet.description || 'A1:D100'}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDisconnect(sheet.id)} disabled={loading} title="Desconectar">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">Nenhuma planilha conectada.</div>
          )}
          {sheetsError && <div className="text-red-500 text-xs">{sheetsError}</div>}
        </CardContent>
      </Card>

      {/* Formulário para conectar nova planilha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Conectar Nova Planilha Google Sheets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetId">ID da Planilha</Label>
            <Input id="sheetId" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" value={sheetId} onChange={e => setSheetId(e.target.value)} />
            <p className="text-sm text-muted-foreground">
              O ID está na URL da sua planilha: https://docs.google.com/spreadsheets/d/<strong>[ID_AQUI]</strong>/edit
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheetRange">Intervalo de Células</Label>
            <Input id="sheetRange" placeholder="A1:D100" value={sheetRange} onChange={e => setSheetRange(e.target.value)} />
            <p className="text-sm text-muted-foreground">
              Exemplo: A1:D100 (inclui cabeçalhos e dados)
            </p>
          </div>
          <Button onClick={handleConnect} disabled={loading} className="w-full">
            {loading ? "Conectando..." : "Conectar Planilha"}
          </Button>
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
            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                <div className="p-2 rounded border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Data</div>
                <div className="p-2 rounded border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Categoria</div>
                <div className="p-2 rounded border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Descrição</div>
                <div className="p-2 rounded border bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Valor</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A planilha deve estar configurada como pública (visualização para qualquer pessoa com o link).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default ConnectSheetWithOAuth;

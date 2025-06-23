
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export const useSecureSheetData = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSheetData = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get sheet configuration from localStorage
      const savedSheetId = localStorage.getItem('connectedSheetId');
      const savedRange = localStorage.getItem('connectedSheetRange');
      
      if (!savedSheetId) {
        setData([]);
        setError("Nenhuma planilha conectada. Configure o ID da planilha e intervalo primeiro.");
        setLoading(false);
        return;
      }

      // Get the first active API connection for this user
      const { data: connections, error: connectionsError } = await supabase
        .from('google_sheets_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (connectionsError) throw connectionsError;

      if (!connections || connections.length === 0) {
        throw new Error("Nenhuma conexão API ativa encontrada. Configure uma chave API primeiro.");
      }

      // Get the decrypted API key securely
      const { data: apiKey, error: keyError } = await supabase.rpc('get_decrypted_api_key', {
        p_connection_id: connections[0].id,
        p_user_id: user.id
      });

      if (keyError) throw keyError;

      // Use the secure API key to fetch data
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${apiKey}`;
      
      console.log("Making secure API request...");
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const sheetData = await response.json();
      console.log("Dados recebidos da planilha:", sheetData);
      
      if (sheetData.values && sheetData.values.length > 1) {
        const processedData = processSheetData(sheetData.values);
        console.log("Dados processados:", processedData);
        setData(processedData);
        setError(null);
        
        toast({
          title: "Sucesso!",
          description: `${processedData.length} registros carregados da planilha de forma segura.`,
        });
      } else {
        throw new Error("Nenhum dado encontrado na planilha ou formato incorreto");
      }
      
    } catch (error) {
      console.error("Erro ao buscar dados da planilha:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      setData([]);
      
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processSheetData = (values: any[][]): SheetData[] => {
    try {
      const dataRows = values.slice(1);
      
      return dataRows.map((row, index) => {
        const [data, categoria, descricao, valor] = row;
        
        const valorStr = valor?.toString().replace(/[^\d.,-]/g, '') || '0';
        const valorNumerico = parseFloat(valorStr.replace(',', '.')) || 0;
        
        const isReceita = categoria?.toLowerCase().includes('receita');
        
        return {
          date: formatDate(data) || `2024-${String((index % 12) + 1).padStart(2, '0')}`,
          receita: isReceita ? Math.abs(valorNumerico) : 0,
          despesa: !isReceita ? Math.abs(valorNumerico) : 0,
          categoria: categoria || 'Outros'
        };
      }).filter(item => item.receita > 0 || item.despesa > 0);
    } catch (error) {
      console.error("Erro ao processar dados da planilha:", error);
      return [];
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length >= 2) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2] || '2024';
          return `${year}-${month}`;
        }
      }
      
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}`;
        }
      }
      
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [user]);

  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchSheetData();
    };

    window.addEventListener('sheetConnected', handleConnectionUpdate);
    return () => {
      window.removeEventListener('sheetConnected', handleConnectionUpdate);
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchSheetData 
  };
};

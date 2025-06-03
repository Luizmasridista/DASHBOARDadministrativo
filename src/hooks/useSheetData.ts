
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export const useSheetData = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se há dados de conexão salvos no localStorage
      const savedSheetId = localStorage.getItem('connectedSheetId');
      const savedRange = localStorage.getItem('connectedSheetRange');
      
      console.log("Fetching sheet data...", { savedSheetId, savedRange });
      
      if (!savedSheetId) {
        console.log("No sheet connected, showing empty state");
        // Se não há planilha conectada, não usar dados mock - deixar vazio
        setData([]);
        setError("Nenhuma planilha conectada. Conecte sua planilha do Google Sheets para ver dados reais.");
        setLoading(false);
        return;
      }

      const API_KEY = "AIzaSyDMffuGHiDAx03cuiwLdUPoPZIbos8tSUE";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${API_KEY}`;
      
      console.log("Making API request to:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Erro ${response.status}: ${response.statusText}. ${errorText}`);
      }
      
      const sheetData = await response.json();
      console.log("Dados recebidos da planilha:", sheetData);
      
      if (sheetData.values && sheetData.values.length > 1) {
        // Processar os dados da planilha
        const processedData = processSheetData(sheetData.values);
        console.log("Dados processados:", processedData);
        setData(processedData);
        setError(null);
        
        toast({
          title: "Sucesso!",
          description: `${processedData.length} registros carregados da planilha.`,
        });
      } else {
        throw new Error("Nenhum dado encontrado na planilha ou formato incorreto");
      }
      
    } catch (error) {
      console.error("Erro ao buscar dados da planilha:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      
      // Em caso de erro, não usar dados mock - deixar vazio para mostrar dados reais apenas
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
      // Ignorar a primeira linha (cabeçalhos)
      const dataRows = values.slice(1);
      
      return dataRows.map((row, index) => {
        const [data, categoria, descricao, valor] = row;
        
        // Limpar e converter valor
        const valorStr = valor?.toString().replace(/[^\d.,-]/g, '') || '0';
        const valorNumerico = parseFloat(valorStr.replace(',', '.')) || 0;
        
        // Determinar se é receita ou despesa baseado na categoria
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
      // Tentar converter diferentes formatos de data para YYYY-MM
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
  }, []);

  return { data, loading, error, refetch: fetchSheetData };
};

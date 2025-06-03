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
      // Verificar se há dados de conexão salvos no localStorage
      const savedSheetId = localStorage.getItem('connectedSheetId');
      const savedRange = localStorage.getItem('connectedSheetRange');
      
      if (!savedSheetId) {
        // Se não há planilha conectada, não usar dados mock - deixar vazio
        setData([]);
        setError("Nenhuma planilha conectada. Conecte sua planilha do Google Sheets para ver dados reais.");
        setLoading(false);
        return;
      }

      const API_KEY = "AIzaSyDMffuGHiDAx03cuiwLdUPoPZIbos8tSUE";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const sheetData = await response.json();
      console.log("Dados recebidos da planilha:", sheetData);
      
      if (sheetData.values && sheetData.values.length > 1) {
        // Processar os dados da planilha
        const processedData = processSheetData(sheetData.values);
        setData(processedData);
        setError(null);
      } else {
        throw new Error("Nenhum dado encontrado na planilha");
      }
      
    } catch (error) {
      console.error("Erro ao buscar dados da planilha:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      
      // Em caso de erro, não usar dados mock - deixar vazio para mostrar dados reais apenas
      setData([]);
      
      toast({
        title: "Erro ao carregar dados",
        description: "Conecte sua planilha do Google Sheets para visualizar dados reais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processSheetData = (values: any[][]): SheetData[] => {
    // Ignorar a primeira linha (cabeçalhos)
    const dataRows = values.slice(1);
    
    return dataRows.map((row, index) => {
      const [data, categoria, descricao, valor] = row;
      const valorNumerico = parseFloat(valor?.toString().replace(/[^\d.-]/g, '') || '0');
      
      // Determinar se é receita ou despesa baseado na categoria
      const isReceita = categoria?.toLowerCase() === 'receita';
      
      return {
        date: formatDate(data) || `2024-${String(index + 1).padStart(2, '0')}`,
        receita: isReceita ? valorNumerico : 0,
        despesa: !isReceita ? valorNumerico : 0,
        categoria: categoria || 'Outros'
      };
    }).filter(item => item.receita > 0 || item.despesa > 0);
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

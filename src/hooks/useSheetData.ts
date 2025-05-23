
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
        // Se não há planilha conectada, usar dados mock
        const mockData: SheetData[] = [
          { date: "2024-01", receita: 50000, despesa: 30000, categoria: "Vendas" },
          { date: "2024-02", receita: 60000, despesa: 35000, categoria: "Serviços" },
          { date: "2024-03", receita: 55000, despesa: 40000, categoria: "Vendas" },
          { date: "2024-04", receita: 70000, despesa: 38000, categoria: "Vendas" },
          { date: "2024-05", receita: 65000, despesa: 42000, categoria: "Serviços" },
        ];
        setData(mockData);
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
      } else {
        throw new Error("Nenhum dado encontrado na planilha");
      }
      
    } catch (error) {
      console.error("Erro ao buscar dados da planilha:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      
      // Em caso de erro, usar dados mock
      const mockData: SheetData[] = [
        { date: "2024-01", receita: 50000, despesa: 30000, categoria: "Vendas" },
        { date: "2024-02", receita: 60000, despesa: 35000, categoria: "Serviços" },
        { date: "2024-03", receita: 55000, despesa: 40000, categoria: "Vendas" },
        { date: "2024-04", receita: 70000, despesa: 38000, categoria: "Vendas" },
        { date: "2024-05", receita: 65000, despesa: 42000, categoria: "Serviços" },
      ];
      setData(mockData);
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

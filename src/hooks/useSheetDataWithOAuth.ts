
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface SheetConnection {
  id: string;
  account_email: string;
  account_name: string;
  access_token: string;
  status: string;
}

export const useSheetDataWithOAuth = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<SheetConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      // Temporarily return empty array until the table is created
      console.log('Google connections table not yet available');
      setConnections([]);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a selected connection
      if (!selectedConnection) {
        setData([]);
        setError("Nenhuma conexão Google selecionada. Configure uma conexão OAuth 2.0 primeiro.");
        setLoading(false);
        return;
      }

      // Get sheet configuration from localStorage (legacy compatibility)
      const savedSheetId = localStorage.getItem('connectedSheetId');
      const savedRange = localStorage.getItem('connectedSheetRange');
      
      if (!savedSheetId) {
        setData([]);
        setError("Nenhuma planilha conectada. Configure o ID da planilha e intervalo primeiro.");
        setLoading(false);
        return;
      }

      // For now, fallback to the old API key method until OAuth is fully implemented
      const API_KEY = "AIzaSyDMffuGHiDAx03cuiwLdUPoPZIbos8tSUE";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${API_KEY}`;
      
      console.log("Making API request to:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const sheetData = await response.json();
      console.log("Dados recebidos da planilha:", sheetData);
      
      if (sheetData.values && sheetData.values.length > 1) {
        // Process the data
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
      // Ignore the first row (headers)
      const dataRows = values.slice(1);
      
      return dataRows.map((row, index) => {
        const [data, categoria, descricao, valor] = row;
        
        // Clean and convert value
        const valorStr = valor?.toString().replace(/[^\d.,-]/g, '') || '0';
        const valorNumerico = parseFloat(valorStr.replace(',', '.')) || 0;
        
        // Determine if it's income or expense based on category
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
      // Try to convert different date formats to YYYY-MM
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
    fetchConnections();
  }, []);

  useEffect(() => {
    if (connections.length > 0) {
      fetchSheetData();
    }
  }, [selectedConnection, connections]);

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchConnections();
    };

    window.addEventListener('googleConnectionUpdated', handleConnectionUpdate);
    return () => {
      window.removeEventListener('googleConnectionUpdated', handleConnectionUpdate);
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    connections, 
    selectedConnection, 
    setSelectedConnection,
    refetch: fetchSheetData 
  };
};

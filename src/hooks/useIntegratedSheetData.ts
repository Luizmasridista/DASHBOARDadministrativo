
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useGoogleSheetsConnections } from "./useGoogleSheetsConnections";

interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export const useIntegratedSheetData = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connections, updateLastUsed } = useGoogleSheetsConnections();

  const fetchSheetDataWithAPI = async (apiKey: string, connectionId: string) => {
    try {
      // Get sheet configuration from localStorage
      const savedSheetId = localStorage.getItem('connectedSheetId');
      const savedRange = localStorage.getItem('connectedSheetRange');
      
      if (!savedSheetId) {
        console.log("No sheet ID configured");
        return [];
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${apiKey}`;
      
      console.log("Making API request with connected API key:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const sheetData = await response.json();
      console.log("Data received from sheet:", sheetData);
      
      // Update last used timestamp for this connection
      await updateLastUsed(connectionId);
      
      if (sheetData.values && sheetData.values.length > 1) {
        return processSheetData(sheetData.values);
      } else {
        throw new Error("Nenhum dado encontrado na planilha ou formato incorreto");
      }
      
    } catch (error) {
      console.error("Error fetching data with API key:", error);
      throw error;
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
      console.error("Error processing sheet data:", error);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Available connections:", connections);
      
      // Check if we have connected sheet configuration
      const savedSheetId = localStorage.getItem('connectedSheetId');
      if (!savedSheetId) {
        console.log("No sheet connected, showing empty state");
        setData([]);
        setError("Nenhuma planilha conectada. Configure o ID da planilha e intervalo primeiro.");
        setLoading(false);
        return;
      }

      // Find an active API connection to use
      const activeConnection = connections.find(conn => conn.status === 'active');
      
      if (!activeConnection) {
        console.log("No active API connections found, falling back to default API");
        // Fall back to the hardcoded API key as before
        const API_KEY = "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg";
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/A1:D100?key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const sheetData = await response.json();
        if (sheetData.values && sheetData.values.length > 1) {
          const processedData = processSheetData(sheetData.values);
          setData(processedData);
          toast({
            title: "Sucesso!",
            description: `${processedData.length} registros carregados da planilha (API padrão).`,
          });
        }
      } else {
        console.log("Using connected API:", activeConnection.project_name);
        // Use the connected API key
        const processedData = await fetchSheetDataWithAPI(activeConnection.api_key, activeConnection.id);
        setData(processedData);
        
        toast({
          title: "Sucesso!",
          description: `${processedData.length} registros carregados via ${activeConnection.project_name}.`,
        });
      }
      
    } catch (error) {
      console.error("Error fetching sheet data:", error);
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

  useEffect(() => {
    // Only fetch data when connections are loaded
    if (connections.length >= 0) { // Allow for empty array (no connections)
      fetchData();
    }
  }, [connections]); // Depend on connections changes

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchData();
    };

    window.addEventListener('sheetConnected', handleConnectionUpdate);
    return () => {
      window.removeEventListener('sheetConnected', handleConnectionUpdate);
    };
  }, [connections]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    activeConnection: connections.find(conn => conn.status === 'active')
  };
};

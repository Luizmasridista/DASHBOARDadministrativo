
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('google_sheets_connections')
        .select('id, account_email, account_name, access_token, status')
        .eq('status', 'active');

      if (connectionsError) {
        throw connectionsError;
      }

      setConnections(connectionsData || []);
      
      // Auto-select first active connection if none selected
      if (!selectedConnection && connectionsData && connectionsData.length > 0) {
        setSelectedConnection(connectionsData[0].id);
      }
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

      // Get the selected connection
      const connection = connections.find(c => c.id === selectedConnection);
      if (!connection) {
        setError("Conexão não encontrada. Selecione uma conexão válida.");
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

      // Fetch data using the selected connection's access token
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}`;
      
      console.log("Making API request with connection:", connection.account_email);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, update connection status
          await supabase
            .from('google_sheets_connections')
            .update({ status: 'expired' })
            .eq('id', selectedConnection);
          
          throw new Error('Token de acesso expirado. Renove a conexão OAuth.');
        }
        
        const errorText = await response.text();
        console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const sheetData = await response.json();
      console.log("Dados recebidos da planilha:", sheetData);
      
      if (sheetData.values && sheetData.values.length > 1) {
        // Update last_used_at for the connection
        await supabase
          .from('google_sheets_connections')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', selectedConnection);

        // Process the data
        const processedData = processSheetData(sheetData.values);
        console.log("Dados processados:", processedData);
        setData(processedData);
        setError(null);
        
        toast({
          title: "Sucesso!",
          description: `${processedData.length} registros carregados da planilha usando ${connection.account_email}.`,
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

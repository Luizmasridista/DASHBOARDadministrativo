
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useGoogleSheetsConnections } from "./useGoogleSheetsConnections";
import { SheetData } from "@/types/sheetData";
import { fetchSheetDataWithAPI, fetchSheetDataWithDefaultAPI } from "@/utils/sheetAPI";

export const useIntegratedSheetData = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connections, updateLastUsed } = useGoogleSheetsConnections();

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
        const processedData = await fetchSheetDataWithDefaultAPI(savedSheetId);
        setData(processedData);
        toast({
          title: "Sucesso!",
          description: `${processedData.length} registros carregados da planilha (API padrão).`,
        });
      } else {
        console.log("Using connected API:", activeConnection.project_name);
        // Use the connected API key
        const processedData = await fetchSheetDataWithAPI(activeConnection.api_key, activeConnection.id);
        setData(processedData);
        
        // Update last used timestamp for this connection
        await updateLastUsed(activeConnection.id);
        
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

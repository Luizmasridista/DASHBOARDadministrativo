
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { SheetData } from "@/types/sheetData";
import { fetchSheetDataWithDefaultAPI } from "@/utils/sheetAPI";

export const useIntegratedSheetData = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching sheet data...");
      
      // Check if we have connected sheet configuration
      const savedSheetId = localStorage.getItem('connectedSheetId');
      if (!savedSheetId) {
        console.log("No sheet connected, showing empty state");
        setData([]);
        setError("Nenhuma planilha conectada. Configure o ID da planilha e intervalo primeiro.");
        setLoading(false);
        return;
      }

      console.log("Using default API for sheet data");
      // Use the default API key approach
      const processedData = await fetchSheetDataWithDefaultAPI(savedSheetId);
      setData(processedData);
      toast({
        title: "Sucesso!",
        description: `${processedData.length} registros carregados da planilha.`,
      });
      
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
    fetchData();
  }, []); // Remove dependency on connections

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchData();
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
    refetch: fetchData,
    activeConnection: null // No active connection since we removed the API management
  };
};

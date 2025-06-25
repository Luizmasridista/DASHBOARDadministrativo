import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { SheetData } from "@/types/sheetData";
import { fetchSheetDataWithDefaultAPI } from "@/utils/sheetAPI";
import { useUserSheets } from './useUserSheets';
import { useAuth } from '@/contexts/AuthContext';

export const useIntegratedSheetData = () => {
  const { user } = useAuth();
  const { sheets, loading: sheetsLoading, error: sheetsError } = useUserSheets();
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        setData([]);
        setError('Usuário não autenticado.');
        setLoading(false);
        return;
      }
      if (!sheets || sheets.length === 0) {
        setData([]);
        setError('Nenhuma planilha conectada.');
        setLoading(false);
        return;
      }
      // Para simplificação, buscar dados da primeira planilha conectada
      const sheet = sheets[0];
      const processedData = await fetchSheetDataWithDefaultAPI(sheet.project_name);
      setData(processedData);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sheets]);

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
    loading: loading || sheetsLoading, 
    error: error || sheetsError, 
    refetch: fetchData,
    activeConnection: sheets && sheets.length > 0 ? sheets[0] : null
  };
};

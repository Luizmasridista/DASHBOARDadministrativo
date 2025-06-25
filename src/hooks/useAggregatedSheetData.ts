import { useState, useEffect, useCallback } from 'react';
import { useUserSheets } from './useUserSheets';
import { useAuth } from '@/contexts/AuthContext';
import { SheetData } from '@/types/sheetData';
import { fetchSheetDataWithDefaultAPI } from '@/utils/sheetAPI';

export const useAggregatedSheetData = () => {
  const { user } = useAuth();
  const { sheets, loading: sheetsLoading, error: sheetsError } = useUserSheets();
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregatedData = useCallback(async () => {
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
      // Fetch data from all connected sheets in parallel
      const allData = await Promise.all(
        sheets.map(sheet => fetchSheetDataWithDefaultAPI(sheet.project_name))
      );
      // Flatten all SheetData[] arrays
      const mergedData = allData.flat();
      // Aggregate by (date, category)
      const aggregationMap = new Map<string, SheetData>();
      for (const item of mergedData) {
        const key = `${item.date}__${item.categoria}`;
        if (!aggregationMap.has(key)) {
          aggregationMap.set(key, { ...item });
        } else {
          const existing = aggregationMap.get(key)!;
          aggregationMap.set(key, {
            ...existing,
            receita: existing.receita + item.receita,
            despesa: existing.despesa + item.despesa,
          });
        }
      }
      // Convert map to array and sort by date ascending
      const aggregatedArray = Array.from(aggregationMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setData(aggregatedArray);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, sheets]);

  useEffect(() => {
    fetchAggregatedData();
  }, [fetchAggregatedData]);

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchAggregatedData();
    };
    window.addEventListener('sheetConnected', handleConnectionUpdate);
    return () => {
      window.removeEventListener('sheetConnected', handleConnectionUpdate);
    };
  }, [fetchAggregatedData]);

  return {
    data,
    loading: loading || sheetsLoading,
    error: error || sheetsError,
    refetch: fetchAggregatedData,
    connections: sheets
  };
}; 
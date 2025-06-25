import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserSheets } from './useUserSheets';
import { useAuth } from '@/contexts/AuthContext';

interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export const useSheetDataWithOAuth = () => {
  const { user } = useAuth();
  const { sheets, loading: sheetsLoading, error: sheetsError } = useUserSheets();
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetData = async () => {
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
      const API_KEY = "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet.project_name}/values/${sheet.description || 'A1:D100'}?key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${response.statusText}. ${errorText}`);
      }
      const sheetData = await response.json();
      if (sheetData.values && sheetData.values.length > 1) {
        const processedData = processSheetData(sheetData.values);
        setData(processedData);
        setError(null);
      } else {
        throw new Error('Nenhum dado encontrado na planilha ou formato incorreto');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      setData([]);
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
    fetchSheetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sheets]);

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionUpdate = () => {
      fetchSheetData();
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
    refetch: fetchSheetData 
  };
};

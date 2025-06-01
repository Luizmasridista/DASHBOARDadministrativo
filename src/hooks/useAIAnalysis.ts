
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export type AnalysisType = 'insights' | 'recommendations' | 'trends' | 'risks' | 'general';

export function useAIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async (data: FinancialData[], analysisType: AnalysisType = 'general') => {
    if (!data || data.length === 0) {
      throw new Error('Dados financeiros são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: { data, analysisType }
      });

      if (error) {
        throw new Error(error.message || 'Erro na análise AI');
      }

      return result.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeData,
    loading,
    error,
    clearError: () => setError(null)
  };
}

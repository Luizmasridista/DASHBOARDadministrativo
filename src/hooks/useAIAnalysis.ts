
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
      console.log('Chamando edge function ai-analysis com dados:', { data, analysisType });
      
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: { data, analysisType }
      });

      console.log('Resposta da edge function:', result);

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message || 'Erro na análise AI');
      }

      if (!result || !result.analysis) {
        throw new Error('Resposta inválida da análise AI');
      }

      return result.analysis;
    } catch (err) {
      console.error('Erro completo na análise AI:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const chatWithAI = async (data: FinancialData[], userMessage: string) => {
    if (!userMessage.trim()) {
      throw new Error('Mensagem é obrigatória');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Enviando mensagem conversacional para IA:', { userMessage, hasData: !!data?.length });
      
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: { 
          data: data || [], 
          userMessage: userMessage.trim(),
          analysisType: 'general' 
        }
      });

      console.log('Resposta da IA conversacional:', result);

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message || 'Erro na análise AI');
      }

      if (!result || !result.analysis) {
        throw new Error('Resposta inválida da análise AI');
      }

      return result.analysis;
    } catch (err) {
      console.error('Erro completo no chat com IA:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeData,
    chatWithAI,
    loading,
    error,
    clearError: () => setError(null)
  };
}

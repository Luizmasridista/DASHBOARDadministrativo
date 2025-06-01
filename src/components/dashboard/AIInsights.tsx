
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Loader2, AlertCircle, Lightbulb, TrendingUp, Shield, Target } from 'lucide-react';
import { useAIAnalysis, type AnalysisType } from '@/hooks/useAIAnalysis';
import { useResponsive } from '@/hooks/useResponsive';

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface AIInsightsProps {
  data: FinancialItem[];
}

export function AIInsights({ data }: AIInsightsProps) {
  const { isMobile } = useResponsive();
  const { analyzeData, loading, error } = useAIAnalysis();
  const [analysis, setAnalysis] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AnalysisType>('insights');

  const analysisTypes = [
    { value: 'insights', label: 'Insights Estratégicos', icon: Lightbulb },
    { value: 'recommendations', label: 'Recomendações', icon: Target },
    { value: 'trends', label: 'Análise de Tendências', icon: TrendingUp },
    { value: 'risks', label: 'Análise de Riscos', icon: Shield },
  ];

  const handleAnalyze = async () => {
    try {
      const result = await analyzeData(data, selectedType);
      setAnalysis(result);
    } catch (err) {
      console.error('Erro na análise:', err);
    }
  };

  const selectedTypeData = analysisTypes.find(type => type.value === selectedType);

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-light text-gray-900 dark:text-white">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          Análise com IA
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Insights inteligentes gerados por IA usando Google Gemini
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedType} onValueChange={(value: AnalysisType) => setSelectedType(value)}>
            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-64'} bg-white/50 dark:bg-gray-800/50`}>
              <SelectValue placeholder="Tipo de análise" />
            </SelectTrigger>
            <SelectContent>
              {analysisTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || data.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white min-w-32"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {selectedTypeData?.icon && React.createElement(selectedTypeData.icon, { className: "w-4 h-4" })}
                Analisar
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Erro na análise</p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="p-6 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              {selectedTypeData?.icon && React.createElement(selectedTypeData.icon, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" })}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedTypeData?.label}
              </h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </p>
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecione um tipo de análise e clique em "Analisar" para obter insights gerados por IA</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

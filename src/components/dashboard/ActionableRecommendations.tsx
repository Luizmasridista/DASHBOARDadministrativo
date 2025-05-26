
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Target, TrendingUp, Zap } from "lucide-react";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface ActionableRecommendationsProps {
  data: FinancialItem[];
}

export function ActionableRecommendations({ data }: ActionableRecommendationsProps) {
  
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Análise de margem de lucro
    const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
    const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
    const margemLucro = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0;
    
    if (margemLucro < 15) {
      recommendations.push({
        type: 'urgent',
        icon: AlertTriangle,
        title: 'Margem de Lucro Crítica',
        description: `Sua margem está em ${margemLucro.toFixed(1)}%. Ideal seria > 20%.`,
        action: 'Revisar estrutura de custos imediatamente',
        impact: 'Alto',
        effort: 'Médio',
        timeline: '1-2 semanas'
      });
    }

    // Análise de categorias
    const categoryAnalysis = data.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { receita: 0, despesa: 0, count: 0 };
      }
      acc[item.categoria].receita += item.receita;
      acc[item.categoria].despesa += item.despesa;
      acc[item.categoria].count += 1;
      return acc;
    }, {} as Record<string, { receita: number; despesa: number; count: number }>);

    const sortedCategories = Object.entries(categoryAnalysis)
      .map(([cat, data]) => ({
        categoria: cat,
        profit: data.receita - data.despesa,
        margin: data.receita > 0 ? ((data.receita - data.despesa) / data.receita) * 100 : 0,
        ...data
      }))
      .sort((a, b) => b.profit - a.profit);

    // Recomendação para categoria mais lucrativa
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      recommendations.push({
        type: 'opportunity',
        icon: TrendingUp,
        title: 'Expandir Categoria Top',
        description: `${topCategory.categoria} gera ${((topCategory.profit / (totalReceitas - totalDespesas)) * 100).toFixed(1)}% do lucro total.`,
        action: `Investir mais recursos em ${topCategory.categoria}`,
        impact: 'Alto',
        effort: 'Baixo',
        timeline: '2-4 semanas'
      });
    }

    // Análise de sazonalidade
    const monthlyData = data.reduce((acc, item) => {
      const month = new Date(item.date).getMonth();
      if (!acc[month]) acc[month] = { receita: 0, count: 0 };
      acc[month].receita += item.receita;
      acc[month].count += 1;
      return acc;
    }, {} as Record<number, { receita: number; count: number }>);

    const avgReceitaByMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month: parseInt(month),
      avg: data.receita / data.count
    }));

    if (avgReceitaByMonth.length >= 3) {
      const bestMonth = avgReceitaByMonth.reduce((max, curr) => curr.avg > max.avg ? curr : max);
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      recommendations.push({
        type: 'insight',
        icon: Target,
        title: 'Planejamento Sazonal',
        description: `${monthNames[bestMonth.month]} é seu mês mais forte.`,
        action: 'Planejar campanhas especiais para meses fracos',
        impact: 'Médio',
        effort: 'Baixo',
        timeline: '1 mês'
      });
    }

    // Análise de crescimento
    const last3Months = data.slice(-3);
    if (last3Months.length >= 2) {
      const receitaGrowth = ((last3Months[last3Months.length - 1].receita - last3Months[0].receita) / last3Months[0].receita) * 100;
      
      if (receitaGrowth < 5) {
        recommendations.push({
          type: 'warning',
          icon: Clock,
          title: 'Crescimento Estagnado',
          description: `Crescimento de apenas ${receitaGrowth.toFixed(1)}% nos últimos meses.`,
          action: 'Implementar estratégias de aquisição de clientes',
          impact: 'Alto',
          effort: 'Alto',
          timeline: '1-3 meses'
        });
      }
    }

    // Recomendação de automação
    if (data.length > 6) {
      recommendations.push({
        type: 'optimization',
        icon: Zap,
        title: 'Automatizar Relatórios',
        description: 'Com histórico suficiente, você pode automatizar análises.',
        action: 'Configurar dashboards automáticos e alertas',
        impact: 'Médio',
        effort: 'Baixo',
        timeline: '1 semana'
      });
    }

    return recommendations.slice(0, 6); // Máximo 6 recomendações
  };

  const recommendations = generateRecommendations();

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'opportunity':
        return {
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'insight':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
          Recomendações Estratégicas
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ações priorizadas por impacto e urgência
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const config = getTypeConfig(rec.type);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <rec.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}>
                        {rec.timeline}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs">
                        <span className="text-gray-500">
                          Impacto: <span className="font-medium">{rec.impact}</span>
                        </span>
                        <span className="text-gray-500">
                          Esforço: <span className="font-medium">{rec.effort}</span>
                        </span>
                      </div>
                      
                      <Button size="sm" variant="outline" className="text-xs">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {recommendations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Excelente! Seu negócio está performando bem. Continue monitorando as métricas.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

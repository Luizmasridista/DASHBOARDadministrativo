
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface StrategicInsightsProps {
  data: FinancialItem[];
}

export function StrategicInsights({ data }: StrategicInsightsProps) {
  const { isMobile } = useResponsive();

  console.log("StrategicInsights - Processing data:", data);

  // Group data by month for better calculations
  const monthlyData = data.reduce((acc, item) => {
    const month = item.date.substring(0, 7); // Get YYYY-MM
    if (!acc[month]) {
      acc[month] = { receita: 0, despesa: 0, lucro: 0 };
    }
    acc[month].receita += Number(item.receita) || 0;
    acc[month].despesa += Number(item.despesa) || 0;
    acc[month].lucro = acc[month].receita - acc[month].despesa;
    return acc;
  }, {} as Record<string, { receita: number; despesa: number; lucro: number }>);

  const months = Object.keys(monthlyData).sort();
  console.log("StrategicInsights - Monthly data:", monthlyData, "Months:", months);

  // Análises estratégicas baseadas nos dados reais
  const calculateBurnRate = () => {
    if (months.length === 0) return 0;
    const totalDespesas = months.reduce((sum, month) => sum + monthlyData[month].despesa, 0);
    return totalDespesas / months.length;
  };

  const calculateRunway = () => {
    const totalReceitas = data.reduce((sum, item) => sum + (Number(item.receita) || 0), 0);
    const totalDespesas = data.reduce((sum, item) => sum + (Number(item.despesa) || 0), 0);
    const cashBalance = totalReceitas - totalDespesas;
    const burnRate = calculateBurnRate();
    
    if (burnRate <= 0) return Infinity;
    return Math.round(Math.abs(cashBalance) / burnRate);
  };

  const calculateGrowthRate = () => {
    if (months.length < 2) return 0;
    const current = monthlyData[months[months.length - 1]]?.receita || 0;
    const previous = monthlyData[months[months.length - 2]]?.receita || 0;
    
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getSeasonalityInsight = () => {
    if (months.length === 0) {
      return { bestMonth: "N/A", worstMonth: "N/A", variance: 0 };
    }

    const monthlyAvgs = months.map(month => ({
      month: month.split('-')[1], // Get MM part
      value: monthlyData[month].receita
    }));

    const best = monthlyAvgs.reduce((max, curr) => curr.value > max.value ? curr : max, { month: "01", value: 0 });
    const worst = monthlyAvgs.reduce((min, curr) => curr.value < min.value ? curr : min, { month: "12", value: Infinity });

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return {
      bestMonth: monthNames[parseInt(best.month) - 1] || "N/A",
      worstMonth: monthNames[parseInt(worst.month) - 1] || "N/A",
      variance: best.value - (worst.value === Infinity ? 0 : worst.value)
    };
  };

  const getProfitabilityTrend = () => {
    if (months.length === 0) return { current: 0, trend: 0, isImproving: false };

    const currentMonth = months[months.length - 1];
    const currentData = monthlyData[currentMonth];
    const currentMargin = currentData.receita > 0 ? ((currentData.receita - currentData.despesa) / currentData.receita) * 100 : 0;

    if (months.length < 2) {
      return { current: currentMargin, trend: 0, isImproving: currentMargin > 0 };
    }

    const previousMonth = months[months.length - 2];
    const previousData = monthlyData[previousMonth];
    const previousMargin = previousData.receita > 0 ? ((previousData.receita - previousData.despesa) / previousData.receita) * 100 : 0;

    const trend = currentMargin - previousMargin;

    return {
      current: currentMargin,
      trend,
      isImproving: trend > 0
    };
  };

  const getTopCategoriesInsight = () => {
    const categoryData = data.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { receita: 0, despesa: 0, profit: 0 };
      }
      acc[item.categoria].receita += Number(item.receita) || 0;
      acc[item.categoria].despesa += Number(item.despesa) || 0;
      acc[item.categoria].profit = acc[item.categoria].receita - acc[item.categoria].despesa;
      return acc;
    }, {} as Record<string, { receita: number; despesa: number; profit: number }>);

    const sortedByProfit = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.profit - a.profit);

    return {
      mostProfitable: sortedByProfit[0],
      leastProfitable: sortedByProfit[sortedByProfit.length - 1]
    };
  };

  const runway = calculateRunway();
  const growthRate = calculateGrowthRate();
  const seasonality = getSeasonalityInsight();
  const profitability = getProfitabilityTrend();
  const categories = getTopCategoriesInsight();

  console.log("StrategicInsights - Calculated insights:", {
    runway,
    growthRate,
    seasonality,
    profitability,
    categories
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: isMobile ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  const insights = [
    {
      title: "Runway Financeiro",
      value: runway === Infinity ? "∞" : `${runway} meses`,
      description: "Tempo até esgotamento do caixa no ritmo atual",
      icon: Calendar,
      color: runway > 12 ? "green" : runway > 6 ? "yellow" : "red",
      priority: runway <= 6 ? "high" : "medium"
    },
    {
      title: "Taxa de Crescimento",
      value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      description: "Crescimento de receita vs. mês anterior",
      icon: growthRate >= 0 ? TrendingUp : TrendingDown,
      color: growthRate >= 10 ? "green" : growthRate >= 0 ? "yellow" : "red",
      priority: growthRate < 0 ? "high" : "medium"
    },
    {
      title: "Margem de Lucro",
      value: `${profitability.current.toFixed(1)}%`,
      description: `${profitability.isImproving ? 'Melhorando' : 'Piorando'} ${Math.abs(profitability.trend).toFixed(1)}% vs. mês anterior`,
      icon: profitability.isImproving ? TrendingUp : TrendingDown,
      color: profitability.current >= 20 ? "green" : profitability.current >= 10 ? "yellow" : "red",
      priority: profitability.current < 10 ? "high" : "medium"
    },
    {
      title: "Sazonalidade",
      value: seasonality.bestMonth,
      description: `Melhor mês. Pior: ${seasonality.worstMonth}`,
      icon: Target,
      color: "blue",
      priority: "low"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Insights Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card 
            key={insight.title}
            className={`relative border-l-4 ${
              insight.priority === 'high' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
              insight.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' :
              'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  insight.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  insight.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  insight.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <insight.icon className={`w-5 h-5 ${
                    insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    insight.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    insight.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                {insight.priority === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {insight.title}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {insight.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights de Categorias */}
      {categories.mostProfitable && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700 dark:text-green-300">
                Categoria Mais Lucrativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {categories.mostProfitable[0]}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Lucro: {formatCurrency(categories.mostProfitable[1].profit)}
                </p>
                <p className="text-xs text-green-500 dark:text-green-500">
                  Foque recursos e expansão nesta área
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-700 dark:text-orange-300">
                Categoria Menos Lucrativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {categories.leastProfitable[0]}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Lucro: {formatCurrency(categories.leastProfitable[1].profit)}
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-500">
                  Revisar estratégia ou considerar descontinuar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

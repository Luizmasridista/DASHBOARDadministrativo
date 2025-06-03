
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, AlertTriangle } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface PerformanceIndicatorsProps {
  data: FinancialItem[];
}

export function PerformanceIndicators({ data }: PerformanceIndicatorsProps) {
  const { isMobile } = useResponsive();

  console.log("PerformanceIndicators - Raw data:", data);

  // Calcular métricas baseadas nos dados reais
  const totalReceitas = data.reduce((sum, item) => sum + (Number(item.receita) || 0), 0);
  const totalDespesas = data.reduce((sum, item) => sum + (Number(item.despesa) || 0), 0);
  const lucroTotal = totalReceitas - totalDespesas;
  const margemMedia = totalReceitas > 0 ? (lucroTotal / totalReceitas) * 100 : 0;

  console.log("PerformanceIndicators - Calculated totals:", {
    totalReceitas,
    totalDespesas,
    lucroTotal,
    margemMedia
  });

  // Group data by month to calculate monthly metrics
  const monthlyData = data.reduce((acc, item) => {
    const month = item.date.substring(0, 7); // Get YYYY-MM
    if (!acc[month]) {
      acc[month] = { receita: 0, despesa: 0, count: 0 };
    }
    acc[month].receita += Number(item.receita) || 0;
    acc[month].despesa += Number(item.despesa) || 0;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { receita: number; despesa: number; count: number }>);

  const months = Object.keys(monthlyData).sort();
  console.log("Monthly data:", monthlyData, "Months:", months);

  // Crescimento mensal (comparar últimos 2 meses se disponível)
  const crescimentoReceita = months.length >= 2 ? 
    (() => {
      const current = monthlyData[months[months.length - 1]]?.receita || 0;
      const previous = monthlyData[months[months.length - 2]]?.receita || 0;
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    })() : 0;

  // Burn rate (média de despesas dos últimos meses disponíveis)
  const avgMonthlyExpenses = months.length > 0 ? 
    months.reduce((sum, month) => sum + monthlyData[month].despesa, 0) / months.length : 0;

  // Runway (quantos meses o dinheiro vai durar)
  const runway = avgMonthlyExpenses > 0 ? Math.round(Math.abs(lucroTotal) / avgMonthlyExpenses) : Infinity;

  // ROI médio
  const roi = totalDespesas > 0 ? ((totalReceitas - totalDespesas) / totalDespesas) * 100 : 0;

  console.log("PerformanceIndicators - Final calculations:", {
    crescimentoReceita,
    avgMonthlyExpenses,
    runway,
    roi
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: isMobile ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  const indicators = [
    {
      title: "Margem de Lucro",
      value: `${margemMedia.toFixed(1)}%`,
      description: "Média geral",
      icon: Percent,
      color: margemMedia >= 20 ? "green" : margemMedia >= 10 ? "yellow" : "red",
      trend: margemMedia >= 0 ? "up" : "down"
    },
    {
      title: "Crescimento",
      value: `${crescimentoReceita > 0 ? '+' : ''}${crescimentoReceita.toFixed(1)}%`,
      description: "Receita mensal",
      icon: crescimentoReceita >= 0 ? TrendingUp : TrendingDown,
      color: crescimentoReceita >= 0 ? "green" : "red",
      trend: crescimentoReceita >= 0 ? "up" : "down"
    },
    {
      title: "Burn Rate",
      value: formatCurrency(avgMonthlyExpenses),
      description: "Gasto médio mensal",
      icon: BarChart3,
      color: "blue",
      trend: "neutral"
    },
    {
      title: "Runway",
      value: runway === Infinity ? "∞" : `${runway}m`,
      description: "Duração do caixa",
      icon: runway <= 6 ? AlertTriangle : DollarSign,
      color: runway > 12 ? "green" : runway > 6 ? "yellow" : "red",
      trend: runway > 6 ? "up" : "down"
    },
    {
      title: "ROI",
      value: `${roi.toFixed(1)}%`,
      description: "Retorno sobre investimento",
      icon: roi >= 0 ? TrendingUp : TrendingDown,
      color: roi >= 50 ? "green" : roi >= 0 ? "yellow" : "red",
      trend: roi >= 0 ? "up" : "down"
    },
    {
      title: "Lucro Total",
      value: formatCurrency(lucroTotal),
      description: "Período total",
      icon: DollarSign,
      color: lucroTotal >= 0 ? "green" : "red",
      trend: lucroTotal >= 0 ? "up" : "down"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {indicators.map((indicator, index) => (
        <Card 
          key={indicator.title}
          className={`relative border-l-4 ${
            indicator.color === 'green' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' :
            indicator.color === 'yellow' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' :
            indicator.color === 'red' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
            'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
          } backdrop-blur-sm shadow-lg`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${
                indicator.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                indicator.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                indicator.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <indicator.icon className={`w-4 h-4 ${
                  indicator.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  indicator.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  indicator.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {indicator.title}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {indicator.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {indicator.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

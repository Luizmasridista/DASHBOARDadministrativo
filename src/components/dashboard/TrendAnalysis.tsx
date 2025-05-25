
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface TrendAnalysisProps {
  data: FinancialItem[];
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calcular tendências dos últimos períodos
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const trends = [
    {
      title: "Receitas",
      current: data[data.length - 1]?.receita || 0,
      previous: data[data.length - 2]?.receita || 0,
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Despesas", 
      current: data[data.length - 1]?.despesa || 0,
      previous: data[data.length - 2]?.despesa || 0,
      icon: TrendingDown,
      color: "red"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Indicadores de tendência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((trend) => {
          const trendValue = calculateTrend(trend.current, trend.previous);
          const TrendIcon = trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : Minus;
          
          return (
            <Card key={trend.title} className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-${trend.color}-100 dark:bg-${trend.color}-900/30 flex items-center justify-center`}>
                    <trend.icon className={`w-5 h-5 text-${trend.color}-600 dark:text-${trend.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    trendValue > 0 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : trendValue < 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(trendValue).toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {trend.title}
                  </p>
                  <p className="text-xl font-light text-gray-900 dark:text-white">
                    {formatCurrency(trend.current)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    vs período anterior: {formatCurrency(trend.previous)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Card de meta */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Meta
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Progresso da Meta
              </p>
              <p className="text-xl font-light text-gray-900 dark:text-white">
                85%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Meta mensal: R$ 50.000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras comparativo */}
      <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
            Comparativo por Período
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="receita" 
                fill="#10b981" 
                name="Receitas" 
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              />
              <Bar 
                dataKey="despesa" 
                fill="#ef4444" 
                name="Despesas" 
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

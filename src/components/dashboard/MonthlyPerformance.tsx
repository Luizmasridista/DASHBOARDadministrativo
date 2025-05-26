
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface MonthlyPerformanceProps {
  data: FinancialItem[];
}

export function MonthlyPerformance({ data }: MonthlyPerformanceProps) {
  const { isMobile } = useResponsive();

  // Agrupar dados por mês
  const monthlyData = data.reduce((acc, item) => {
    const monthKey = item.date.substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = { receita: 0, despesa: 0, count: 0 };
    }
    acc[monthKey].receita += item.receita;
    acc[monthKey].despesa += item.despesa;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { receita: number; despesa: number; count: number }>);

  const chartData = Object.entries(monthlyData)
    .map(([month, values]) => ({
      mes: month,
      receita: values.receita,
      despesa: values.despesa,
      lucro: values.receita - values.despesa,
      margem: values.receita > 0 ? ((values.receita - values.despesa) / values.receita) * 100 : 0
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: isMobile ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600 dark:text-green-400">
              Receita: {formatCurrency(data.receita)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Despesa: {formatCurrency(data.despesa)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Lucro: {formatCurrency(data.lucro)}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Margem: {data.margem.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
          Performance Mensal
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Receitas, despesas, lucro e margem por mês
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="mes" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="currency"
                tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                yAxisId="currency"
                dataKey="receita" 
                fill="#10b981" 
                name="Receitas"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                yAxisId="currency"
                dataKey="despesa" 
                fill="#ef4444" 
                name="Despesas"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="margem"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Margem %"
                dot={{ r: 4, fill: "#8b5cf6" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

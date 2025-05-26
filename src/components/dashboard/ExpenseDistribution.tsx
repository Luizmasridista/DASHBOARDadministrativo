
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface ExpenseDistributionProps {
  data: FinancialItem[];
}

export function ExpenseDistribution({ data }: ExpenseDistributionProps) {
  const { isMobile, isTablet } = useResponsive();
  
  const despesasPorCategoria = data.reduce((acc, item) => {
    if (item.despesa > 0) {
      const categoria = item.categoria || "Outros";
      acc[categoria] = (acc[categoria] || 0) + item.despesa;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(despesasPorCategoria).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
  ];

  const formatCurrency = (value: number) => {
    if (isMobile && Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {data.payload.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Valor: {formatCurrency(data.value)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {percentage}% do total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalDespesas = pieData.reduce((sum, item) => sum + item.value, 0);
  const chartHeight = isMobile ? 300 : isTablet ? 350 : 400;

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
          Distribuição de Despesas
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total: {formatCurrency(totalDespesas)}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  !isMobile && percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={isMobile ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {!isMobile && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

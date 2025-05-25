
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface CategoryBreakdownProps {
  data: FinancialItem[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const receitasPorCategoria = data.reduce((acc, item) => {
    if (item.receita > 0) {
      const categoria = item.categoria || "Outros";
      acc[categoria] = (acc[categoria] || 0) + item.receita;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(receitasPorCategoria).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const formatCurrency = (value: number) => {
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
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {data.payload.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalReceitas = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
          Receitas por Categoria
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-3 max-h-80 overflow-y-auto">
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalReceitas) * 100).toFixed(1);
              return (
                <div key={entry.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(entry.value)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

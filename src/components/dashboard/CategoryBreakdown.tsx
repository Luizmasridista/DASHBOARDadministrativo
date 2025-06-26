import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";
import { motion } from "framer-motion";

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
  const { isMobile, isTablet } = useResponsive();
  
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
    // Formato compacto para dispositivos menores
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
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 shadow-xl">
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white mb-1`}>
            {data.payload.name}
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300`}>
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalReceitas = pieData.reduce((sum, item) => sum + item.value, 0);

  // Altura responsiva do gráfico
  const chartHeight = isMobile ? 200 : isTablet ? 240 : 280;
  const outerRadius = isMobile ? 70 : isTablet ? 85 : 100;
  const innerRadius = isMobile ? 28 : isTablet ? 34 : 40;

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader className={`${isMobile ? 'pb-2' : 'pb-4'}`}>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-xl'} font-light text-gray-900 dark:text-white`}>
          Receitas por Categoria
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} pt-0`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-col lg:flex-row'} items-center gap-4 sm:gap-6`}>
          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
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
            </motion.div>
          </div>
          
          <div className={`flex-1 space-y-2 sm:space-y-3 ${isMobile ? 'max-h-60' : 'max-h-80'} overflow-y-auto w-full`}>
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalReceitas) * 100).toFixed(1);
              return (
                <motion.div
                  key={entry.name}
                  whileHover={{ scale: 1.04, boxShadow: "0 4px 16px 0 rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-gray-50 dark:bg-gray-700/50`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div 
                      className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-full flex-shrink-0`}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300 truncate`}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white`}>
                      {formatCurrency(entry.value)}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
                      {percentage}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

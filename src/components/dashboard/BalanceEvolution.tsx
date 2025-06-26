import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";
import { motion } from "framer-motion";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface BalanceEvolutionProps {
  data: FinancialItem[];
}

export function BalanceEvolution({ data }: BalanceEvolutionProps) {
  const { isMobile } = useResponsive();

  const balanceData = data.map((item, index) => {
    const previousBalance = data.slice(0, index).reduce((sum, prevItem) => 
      sum + prevItem.receita - prevItem.despesa, 0
    );
    const currentBalance = previousBalance + item.receita - item.despesa;
    
    return {
      date: item.date,
      saldo: currentBalance,
      receita: item.receita,
      despesa: item.despesa
    };
  });

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
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Saldo: {formatCurrency(data.saldo)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Receita: {formatCurrency(data.receita)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Despesa: {formatCurrency(data.despesa)}
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
          Evolução do Saldo
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Acompanhe a evolução do seu saldo ao longo do tempo
        </p>
      </CardHeader>
      
      <CardContent>
        <motion.div
          className="h-80"
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#saldoGradient)"
                name="Saldo"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}

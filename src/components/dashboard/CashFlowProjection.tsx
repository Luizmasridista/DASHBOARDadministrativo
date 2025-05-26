import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface CashFlowProjectionProps {
  data: FinancialItem[];
}

export function CashFlowProjection({ data }: CashFlowProjectionProps) {
  const { isMobile } = useResponsive();

  const generateProjection = () => {
    // Calcular tendências baseadas nos dados históricos
    const last3Months = data.slice(-3);
    
    const avgReceita = last3Months.reduce((sum, item) => sum + item.receita, 0) / last3Months.length;
    const avgDespesa = last3Months.reduce((sum, item) => sum + item.despesa, 0) / last3Months.length;
    
    // Calcular taxa de crescimento
    const receitaGrowth = last3Months.length >= 2 ? 
      (last3Months[last3Months.length - 1].receita - last3Months[0].receita) / last3Months[0].receita / 2 : 0;
    
    const despesaGrowth = last3Months.length >= 2 ?
      (last3Months[last3Months.length - 1].despesa - last3Months[0].despesa) / last3Months[0].despesa / 2 : 0;

    // Calcular saldo acumulado atual
    const currentBalance = data.reduce((sum, item) => sum + item.receita - item.despesa, 0);

    const projection = [];
    let runningBalance = currentBalance;

    // Gerar projeção para os próximos 6 meses
    for (let i = 1; i <= 6; i++) {
      const projectedReceita = avgReceita * (1 + receitaGrowth) ** i;
      const projectedDespesa = avgDespesa * (1 + despesaGrowth) ** i;
      const monthlyFlow = projectedReceita - projectedDespesa;
      
      runningBalance += monthlyFlow;

      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + i);
      
      projection.push({
        date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        receita: projectedReceita,
        despesa: projectedDespesa,
        saldoAcumulado: runningBalance,
        fluxoMensal: monthlyFlow,
        isProjection: true
      });
    }

    return projection;
  };

  const historicalData = data.map((item, index) => {
    const previousBalance = data.slice(0, index).reduce((sum, prevItem) => sum + prevItem.receita - prevItem.despesa, 0);
    return {
      date: item.date,
      receita: item.receita,
      despesa: item.despesa,
      saldoAcumulado: previousBalance + item.receita - item.despesa,
      fluxoMensal: item.receita - item.despesa,
      isProjection: false
    };
  });

  const projectionData = generateProjection();
  const combinedData = [...historicalData, ...projectionData];

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
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {data.isProjection ? '📈 Projeção' : '📊 Histórico'} - {label}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-green-600 dark:text-green-400">
              Receita: {formatCurrency(data.receita)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Despesa: {formatCurrency(data.despesa)}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fluxo: {formatCurrency(data.fluxoMensal)}
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Saldo: {formatCurrency(data.saldoAcumulado)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const breakEvenPoint = combinedData.find(item => item.saldoAcumulado <= 0);

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
          Projeção de Fluxo de Caixa
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Baseado nas tendências dos últimos 3 meses
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              
              {/* Linha de referência para break-even */}
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
              
              {/* Linha do saldo acumulado */}
              <Line
                type="monotone"
                dataKey="saldoAcumulado"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={(props) => {
                  const { payload } = props;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={payload.isProjection ? "#94a3b8" : "#3b82f6"}
                      stroke={payload.isProjection ? "#64748b" : "#1e40af"}
                      strokeWidth={2}
                      strokeDasharray={payload.isProjection ? "3 3" : "none"}
                    />
                  );
                }}
                name="Saldo Acumulado"
              />
              
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {breakEvenPoint && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 font-medium">
              ⚠️ Alerta: Saldo pode ficar negativo em {breakEvenPoint.date}
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              Considere reduzir despesas ou aumentar receitas para evitar problemas de caixa.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface CostCenterChartProps {
  data: FinancialItem[];
}

export function CostCenterChart({ data }: CostCenterChartProps) {
  const { isMobile } = useResponsive();

  // Simular centros de custo baseados nas categorias existentes
  const costCenterData = data.reduce((acc, item) => {
    const costCenter = getCostCenterFromCategory(item.categoria);
    
    if (!acc[costCenter]) {
      acc[costCenter] = {
        name: costCenter,
        receita: 0,
        despesa: 0,
        orcamento: 0
      };
    }
    
    acc[costCenter].receita += item.receita;
    acc[costCenter].despesa += item.despesa;
    // Simular orçamento como 120% das despesas
    acc[costCenter].orcamento = acc[costCenter].despesa * 1.2;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(costCenterData);

  function getCostCenterFromCategory(categoria: string): string {
    const categoryToCostCenter: Record<string, string> = {
      'Alimentação': 'Operacional',
      'Transporte': 'Logística', 
      'Moradia': 'Infraestrutura',
      'Saúde': 'RH e Benefícios',
      'Educação': 'Desenvolvimento',
      'Lazer': 'Marketing',
      'Outros': 'Administrativo',
      'Salário': 'RH e Benefícios',
      'Investimentos': 'Financeiro',
      'Vendas': 'Comercial'
    };
    
    return categoryToCostCenter[categoria] || 'Administrativo';
  }

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
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
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
          Análise por Centro de Custo
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comparativo de receitas, despesas e orçamento por centro
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 80 : 60}
              />
              <YAxis 
                tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="receita"
                fill="#22c55e"
                name="Receita"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="despesa"
                fill="#ef4444"
                name="Despesa"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="orcamento"
                fill="#3b82f6"
                name="Orçamento"
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

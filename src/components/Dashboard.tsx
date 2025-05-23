import { useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useSheetData } from "@/hooks/useSheetData";
import { FinancialItemsList } from "./FinancialItemsList";

const Dashboard = () => {
  const { data, loading, error, refetch } = useSheetData();

  // Modern color palette with CSS variables
  const COLORS = {
    receita: 'hsl(var(--chart-receita))',
    despesa: 'hsl(var(--chart-despesa))',
    lucro: 'hsl(var(--chart-lucro))'
  };

  // Escutar eventos de conexão/desconexão da planilha
  useEffect(() => {
    const handleSheetConnection = () => {
      refetch();
    };

    window.addEventListener('sheetConnected', handleSheetConnection);
    window.addEventListener('sheetDisconnected', handleSheetConnection);

    return () => {
      window.removeEventListener('sheetConnected', handleSheetConnection);
      window.removeEventListener('sheetDisconnected', handleSheetConnection);
    };
  }, [refetch]);

  const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(1) : "0";

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const isUsingMockData = !localStorage.getItem('connectedSheetId');

  return (
    <div className="space-y-6">
      {isUsingMockData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                <strong>Dados de demonstração:</strong> Conecte sua planilha do Google Sheets para ver dados reais.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</div>
            <p className="text-xs text-muted-foreground">
              {isUsingMockData ? 'Últimos 5 meses (demo)' : 'Total da planilha'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</div>
            <p className="text-xs text-muted-foreground">
              {isUsingMockData ? 'Últimos 5 meses (demo)' : 'Total da planilha'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(margemLucro) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {margemLucro}%
            </div>
            <p className="text-xs text-muted-foreground">Porcentagem sobre receitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke={COLORS.receita}
                  strokeWidth={2}
                  name="Receitas"
                  dot={{ r: 4, fill: COLORS.receita }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesa" 
                  stroke={COLORS.despesa}
                  strokeWidth={2}
                  name="Despesas"
                  dot={{ r: 4, fill: COLORS.despesa }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? COLORS.receita : COLORS.lucro} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Modern Bar Chart */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Comparativo por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
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
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Bar 
                dataKey="receita" 
                fill={COLORS.receita} 
                name="Receitas" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="despesa" 
                fill={COLORS.despesa} 
                name="Despesas" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Items List */}
      <FinancialItemsList data={data} />
    </div>
  );
};

export default Dashboard;

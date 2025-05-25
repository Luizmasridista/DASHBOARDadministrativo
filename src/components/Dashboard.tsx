
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Filter, Calendar, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useSheetData } from "@/hooks/useSheetData";
import { FinancialSummaryCards } from "./dashboard/FinancialSummaryCards";
import { InteractiveChart } from "./dashboard/InteractiveChart";
import { CategoryBreakdown } from "./dashboard/CategoryBreakdown";
import { TrendAnalysis } from "./dashboard/TrendAnalysis";
import { QuickActions } from "./dashboard/QuickActions";

const Dashboard = () => {
  const { data, loading, error, refetch } = useSheetData();
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDataVisible, setIsDataVisible] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full opacity-75 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const isUsingMockData = !localStorage.getItem('connectedSheetId');

  // Filtrar dados baseado nos filtros selecionados
  const filteredData = data.filter(item => {
    if (categoryFilter !== "all" && item.categoria !== categoryFilter) return false;
    // Adicionar filtro de data aqui quando necessário
    return true;
  });

  const categories = [...new Set(data.map(item => item.categoria))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header com controles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
              Dashboard Financeiro
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-light">
              Visão geral dos seus dados financeiros
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDataVisible(!isDataVisible)}
              className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700"
            >
              {isDataVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isDataVisible ? "Ocultar Valores" : "Mostrar Valores"}
            </Button>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Aviso de dados de demonstração */}
        {isUsingMockData && (
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 text-amber-800 dark:text-amber-200">
                <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Dados de demonstração</p>
                  <p className="text-sm opacity-80">
                    Conecte sua planilha do Google Sheets para visualizar dados reais
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de resumo financeiro */}
        <FinancialSummaryCards data={filteredData} isDataVisible={isDataVisible} />

        {/* Ações rápidas */}
        <QuickActions />

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <InteractiveChart data={filteredData} />
          <CategoryBreakdown data={filteredData} />
        </div>

        {/* Análise de tendências */}
        <TrendAnalysis data={filteredData} />
      </div>
    </div>
  );
};

export default Dashboard;

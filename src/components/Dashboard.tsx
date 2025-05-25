
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Filter, Calendar, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSheetData } from "@/hooks/useSheetData";
import { useResponsive } from "@/hooks/useResponsive";
import { FinancialSummaryCards } from "./dashboard/FinancialSummaryCards";
import { InteractiveChart } from "./dashboard/InteractiveChart";
import { CategoryBreakdown } from "./dashboard/CategoryBreakdown";
import { TrendAnalysis } from "./dashboard/TrendAnalysis";
import { QuickActions } from "./dashboard/QuickActions";

const Dashboard = () => {
  const { data, loading, error, refetch } = useSheetData();
  const { isMobile, isTablet, deviceType } = useResponsive();
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
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="relative">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full opacity-75 animate-pulse"></div>
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Responsive Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white tracking-tight">
              Dashboard Financeiro
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-light">
              Visão geral dos seus dados financeiros
            </p>
          </div>

          {/* Responsive Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={() => setIsDataVisible(!isDataVisible)}
              className="flex items-center justify-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 min-h-[44px]"
            >
              {isDataVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{isDataVisible ? "Ocultar" : "Mostrar"}</span>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 min-h-[44px]">
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
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
                <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 min-h-[44px]">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
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
        </div>

        {/* Mock Data Warning - Responsive */}
        {isUsingMockData && (
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 text-amber-800 dark:text-amber-200">
                <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">Dados de demonstração</p>
                  <p className="text-xs sm:text-sm opacity-80 mt-1">
                    Conecte sua planilha do Google Sheets para visualizar dados reais
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Summary Cards - Responsive Grid */}
        <FinancialSummaryCards data={filteredData} isDataVisible={isDataVisible} />

        {/* Quick Actions - Responsive */}
        <QuickActions />

        {/* Charts Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <InteractiveChart data={filteredData} />
          <CategoryBreakdown data={filteredData} />
        </div>

        {/* Trend Analysis - Full Width */}
        <TrendAnalysis data={filteredData} />
      </div>
    </div>
  );
};

export default Dashboard;

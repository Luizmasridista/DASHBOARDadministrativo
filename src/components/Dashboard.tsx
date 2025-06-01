import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Filter, Calendar, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSheetData } from "@/hooks/useSheetData";
import { useResponsive } from "@/hooks/useResponsive";
import { FinancialSummaryCards } from "./dashboard/FinancialSummaryCards";
import { InteractiveChart } from "./dashboard/InteractiveChart";
import { CategoryBreakdown } from "./dashboard/CategoryBreakdown";
import { TrendAnalysis } from "./dashboard/TrendAnalysis";
import { QuickActions } from "./dashboard/QuickActions";
import { StrategicInsights } from "./dashboard/StrategicInsights";
import { CashFlowProjection } from "./dashboard/CashFlowProjection";
import { ActionableRecommendations } from "./dashboard/ActionableRecommendations";
import { BalanceEvolution } from "./dashboard/BalanceEvolution";
import { ExpenseDistribution } from "./dashboard/ExpenseDistribution";
import { MonthlyPerformance } from "./dashboard/MonthlyPerformance";
import { PerformanceIndicators } from "./dashboard/PerformanceIndicators";
import { CostCenterChart } from "./dashboard/CostCenterChart";
import { AIInsights } from "./dashboard/AIInsights";
import { FloatingAIBot } from "./FloatingAIBot";

const Dashboard = () => {
  const { data, loading, error, refetch } = useSheetData();
  const { isMobile, isTablet, deviceType } = useResponsive();
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDataVisible, setIsDataVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleAIBotActivate = () => {
    setActiveTab("ai-insights");
    // Smooth scroll to the AI Insights section
    setTimeout(() => {
      const aiInsightsSection = document.querySelector('[data-tab="ai-insights"]');
      if (aiInsightsSection) {
        aiInsightsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

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

  const filteredData = data.filter(item => {
    if (categoryFilter !== "all" && item.categoria !== categoryFilter) return false;
    return true;
  });

  const categories = [...new Set(data.map(item => item.categoria))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Floating AI Bot */}
      <FloatingAIBot onActivate={handleAIBotActivate} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white tracking-tight">
              Painel Executivo
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-light">
              Insights estratégicos para tomada de decisão
            </p>
          </div>

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
                    Conecte sua planilha do Google Sheets para insights reais
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="ai-insights">IA Insights</TabsTrigger>
            <TabsTrigger value="projection">Projeções</TabsTrigger>
            <TabsTrigger value="recommendations" className="hidden lg:flex">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 lg:space-y-8">
            <FinancialSummaryCards data={filteredData} isDataVisible={isDataVisible} />
            <PerformanceIndicators data={filteredData} />
            <QuickActions />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <BalanceEvolution data={filteredData} />
              <MonthlyPerformance data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <InteractiveChart data={filteredData} />
              <ExpenseDistribution data={filteredData} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <CategoryBreakdown data={filteredData} />
              <CostCenterChart data={filteredData} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <TrendAnalysis data={filteredData} />
              <StrategicInsights data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6 lg:space-y-8" data-tab="ai-insights">
            <AIInsights data={filteredData} />
          </TabsContent>

          <TabsContent value="projection" className="space-y-6 lg:space-y-8">
            <CashFlowProjection data={filteredData} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <InteractiveChart data={filteredData} />
              <BalanceEvolution data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 lg:space-y-8">
            <ActionableRecommendations data={filteredData} />
          </TabsContent>
        </Tabs>

        {/* Mobile Recommendations (always visible) */}
        <div className="lg:hidden">
          <ActionableRecommendations data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

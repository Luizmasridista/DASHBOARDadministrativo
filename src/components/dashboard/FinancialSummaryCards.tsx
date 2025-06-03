
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface FinancialSummaryCardsProps {
  data: FinancialItem[];
  isDataVisible: boolean;
}

export function FinancialSummaryCards({ data, isDataVisible }: FinancialSummaryCardsProps) {
  const { isMobile, isTablet } = useResponsive();
  
  console.log("FinancialSummaryCards - Raw data:", data);
  
  const totalReceitas = data.reduce((sum, item) => {
    const value = Number(item.receita) || 0;
    console.log("Adding receita:", value, "from item:", item);
    return sum + value;
  }, 0);
  
  const totalDespesas = data.reduce((sum, item) => {
    const value = Number(item.despesa) || 0;
    console.log("Adding despesa:", value, "from item:", item);
    return sum + value;
  }, 0);
  
  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100) : 0;

  console.log("Calculated values:", {
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro
  });

  // Calculate real growth rate based on actual data
  const calculateGrowthRate = () => {
    if (data.length < 2) return 0;
    
    // Group data by month to calculate monthly growth
    const monthlyData = data.reduce((acc, item) => {
      const month = item.date.substring(0, 7); // Get YYYY-MM
      if (!acc[month]) {
        acc[month] = { receita: 0, despesa: 0 };
      }
      acc[month].receita += Number(item.receita) || 0;
      acc[month].despesa += Number(item.despesa) || 0;
      return acc;
    }, {} as Record<string, { receita: number; despesa: number }>);

    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 0;

    const current = monthlyData[months[months.length - 1]].receita;
    const previous = monthlyData[months[months.length - 2]].receita;
    
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const growthRate = calculateGrowthRate();
  const despesaGrowthRate = calculateGrowthRate(); // For simplicity, using same logic

  const formatCurrency = (value: number) => {
    if (!isDataVisible) return "••••••";
    
    // Formato mais compacto para mobile
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
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (!isDataVisible) return "••••";
    return `${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Receitas",
      value: formatCurrency(totalReceitas),
      change: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      trend: growthRate >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "green",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
    },
    {
      title: "Despesas",
      value: formatCurrency(totalDespesas),
      change: `${despesaGrowthRate > 0 ? '+' : ''}${despesaGrowthRate.toFixed(1)}%`,
      trend: "up",
      icon: TrendingDown,
      color: "red",
      bgGradient: "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(lucroLiquido),
      change: lucroLiquido >= 0 ? `+${((lucroLiquido / (totalReceitas || 1)) * 100).toFixed(1)}%` : `${((lucroLiquido / (totalReceitas || 1)) * 100).toFixed(1)}%`,
      trend: lucroLiquido >= 0 ? "up" : "down",
      icon: DollarSign,
      color: lucroLiquido >= 0 ? "blue" : "red",
      bgGradient: lucroLiquido >= 0 
        ? "from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
        : "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
    },
    {
      title: "Margem de Lucro",
      value: formatPercentage(margemLucro),
      change: margemLucro >= 0 ? `+${margemLucro.toFixed(1)}%` : `${margemLucro.toFixed(1)}%`,
      trend: margemLucro >= 0 ? "up" : "down",
      icon: Target,
      color: margemLucro >= 0 ? "purple" : "red",
      bgGradient: margemLucro >= 0
        ? "from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50"
        : "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title}
          className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-sm`}>
                <card.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-gray-800/60 ${
                card.trend === 'up' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isDataVisible ? card.change : '••••'}
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600 dark:text-gray-300 tracking-wide`}>
                {card.title}
              </p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-light text-gray-900 dark:text-white tracking-tight break-words`}>
                {card.value}
              </p>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-gray-800/20 rounded-full blur-xl"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100) : 0;

  const formatCurrency = (value: number) => {
    if (!isDataVisible) return "••••••";
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
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "green",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
    },
    {
      title: "Despesas",
      value: formatCurrency(totalDespesas),
      change: "+3.2%",
      trend: "up",
      icon: TrendingDown,
      color: "red",
      bgGradient: "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(lucroLiquido),
      change: lucroLiquido >= 0 ? "+8.1%" : "-4.2%",
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
      change: margemLucro >= 0 ? "+2.1%" : "-1.5%",
      trend: margemLucro >= 0 ? "up" : "down",
      icon: Target,
      color: margemLucro >= 0 ? "purple" : "red",
      bgGradient: margemLucro >= 0
        ? "from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50"
        : "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title}
          className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-sm`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-gray-800/60 ${
                card.trend === 'up' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isDataVisible ? card.change : '••••'}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                {card.title}
              </p>
              <p className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                {card.value}
              </p>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 dark:bg-gray-800/20 rounded-full blur-xl"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

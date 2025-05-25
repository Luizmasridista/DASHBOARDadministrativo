
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useResponsive } from "@/hooks/useResponsive";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface InteractiveChartProps {
  data: FinancialItem[];
}

export function InteractiveChart({ data }: InteractiveChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");
  const [selectedMetric, setSelectedMetric] = useState<"both" | "receita" | "despesa">("both");
  const { isMobile, isTablet } = useResponsive();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl min-w-[140px]">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Configurações responsivas para margens do gráfico
  const getChartMargins = () => {
    if (isMobile) {
      return { top: 10, right: 10, left: 10, bottom: 5 };
    }
    if (isTablet) {
      return { top: 15, right: 20, left: 15, bottom: 5 };
    }
    return { top: 20, right: 30, left: 20, bottom: 5 };
  };

  // Altura responsiva do gráfico
  const getChartHeight = () => {
    if (isMobile) return 250;
    if (isTablet) return 280;
    return 320;
  };

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <CardTitle className="text-lg sm:text-xl font-light text-gray-900 dark:text-white">
            Fluxo Financeiro
          </CardTitle>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
                className="text-xs h-8 flex-1 sm:flex-none px-3"
              >
                Área
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="text-xs h-8 flex-1 sm:flex-none px-3"
              >
                Linha
              </Button>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={selectedMetric === "both" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("both")}
                className="text-xs h-8 flex-1 sm:flex-none px-2"
              >
                Ambos
              </Button>
              <Button
                variant={selectedMetric === "receita" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("receita")}
                className="text-xs h-8 flex-1 sm:flex-none px-2"
              >
                Receitas
              </Button>
              <Button
                variant={selectedMetric === "despesa" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("despesa")}
                className="text-xs h-8 flex-1 sm:flex-none px-2"
              >
                Despesas
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <div className="w-full" style={{ height: getChartHeight() }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={getChartMargins()}>
                <defs>
                  <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="despesaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 40 : 60}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {(selectedMetric === "both" || selectedMetric === "receita") && (
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={isMobile ? 1.5 : 2}
                    fill="url(#receitaGradient)"
                    name="Receitas"
                  />
                )}
                {(selectedMetric === "both" || selectedMetric === "despesa") && (
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stroke="#ef4444"
                    strokeWidth={isMobile ? 1.5 : 2}
                    fill="url(#despesaGradient)"
                    name="Despesas"
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={data} margin={getChartMargins()}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 40 : 60}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {(selectedMetric === "both" || selectedMetric === "receita") && (
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={isMobile ? 2 : 3}
                    name="Receitas"
                    dot={{ r: isMobile ? 2 : 4, fill: "#10b981" }}
                    activeDot={{ r: isMobile ? 4 : 6, fill: "#10b981" }}
                  />
                )}
                {(selectedMetric === "both" || selectedMetric === "despesa") && (
                  <Line
                    type="monotone"
                    dataKey="despesa"
                    stroke="#ef4444"
                    strokeWidth={isMobile ? 2 : 3}
                    name="Despesas"
                    dot={{ r: isMobile ? 2 : 4, fill: "#ef4444" }}
                    activeDot={{ r: isMobile ? 4 : 6, fill: "#ef4444" }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

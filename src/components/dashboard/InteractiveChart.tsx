
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

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
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-light text-gray-900 dark:text-white">
            Fluxo Financeiro
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
                className="text-xs h-7"
              >
                Área
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="text-xs h-7"
              >
                Linha
              </Button>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={selectedMetric === "both" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("both")}
                className="text-xs h-7"
              >
                Ambos
              </Button>
              <Button
                variant={selectedMetric === "receita" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("receita")}
                className="text-xs h-7"
              >
                Receitas
              </Button>
              <Button
                variant={selectedMetric === "despesa" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("despesa")}
                className="text-xs h-7"
              >
                Despesas
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              <Tooltip content={<CustomTooltip />} />
              
              {(selectedMetric === "both" || selectedMetric === "receita") && (
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#receitaGradient)"
                  name="Receitas"
                />
              )}
              {(selectedMetric === "both" || selectedMetric === "despesa") && (
                <Area
                  type="monotone"
                  dataKey="despesa"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#despesaGradient)"
                  name="Despesas"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              <Tooltip content={<CustomTooltip />} />
              
              {(selectedMetric === "both" || selectedMetric === "receita") && (
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Receitas"
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              )}
              {(selectedMetric === "both" || selectedMetric === "despesa") && (
                <Line
                  type="monotone"
                  dataKey="despesa"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Despesas"
                  dot={{ r: 4, fill: "#ef4444" }}
                  activeDot={{ r: 6, fill: "#ef4444" }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

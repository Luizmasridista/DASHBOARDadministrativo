import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAggregatedSheetData } from "@/hooks/useAggregatedSheetData";
import { FileSpreadsheet, Building2, HelpCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { FinancialItemsList } from "./FinancialItemsList";
import { useResponsive } from "@/hooks/useResponsive";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export default function ConsolidatedView() {
  const { data, connections, loading, error } = useAggregatedSheetData();
  const { isMobile } = useResponsive();
  const [specificMode, setSpecificMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);

  // Branch selection
  const branchOptions = connections.map(sheet => ({
    value: sheet.project_name,
    label: sheet.sheetTitle || sheet.project_name
  }));
  const selectedSheet = connections.find(s => s.project_name === selectedBranch);

  // Data filtering
  const filteredData = specificMode && selectedBranch
    ? data.filter(item => item._sourceSheetId === selectedBranch)
    : data;
  const filteredConnections = specificMode && selectedSheet ? [selectedSheet] : connections;

  // Pie chart: receita por filial
  const branchReceita = filteredConnections.map((sheet) => {
    const totalReceita = filteredData.filter(item => item._sourceSheetId === sheet.project_name).reduce((sum, item) => sum + item.receita, 0);
    return {
      name: sheet.sheetTitle || sheet.project_name,
      value: totalReceita,
      id: sheet.project_name,
    };
  }).filter(b => b.value > 0);

  // Line chart: receita por filial ao longo do tempo
  const allDates = Array.from(new Set(filteredData.map(item => item.date))).sort();
  const lineChartData = allDates.map(date => {
    const entry = { date };
    filteredConnections.forEach(sheet => {
      entry[sheet.sheetTitle || sheet.project_name] = filteredData.filter(item => item._sourceSheetId === sheet.project_name && item.date === date).reduce((sum, item) => sum + item.receita, 0);
    });
    return entry;
  });

  // Pie chart tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 p-3 rounded shadow text-xs">
          <div className="font-medium">{d.payload.name}</div>
          <div>Receita: R$ {d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-blue-600" /> Visão Consolidada
      </h1>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Button variant={specificMode ? "default" : "outline"} onClick={() => setSpecificMode(v => !v)}>
          Análise Específica
        </Button>
        <span className="relative">
          <HelpCircle className="w-5 h-5 text-blue-500 cursor-pointer" onMouseEnter={() => setShowHelp(true)} onMouseLeave={() => setShowHelp(false)} />
          {showHelp && (
            <div className="absolute left-8 top-0 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow p-3 text-xs w-64">
              Esta função permite analisar as receitas de uma filial específica. Selecione a filial desejada para ver os gráficos e a tabela apenas com os dados dela.
            </div>
          )}
        </span>
        {specificMode && (
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione a filial" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={specificMode ? selectedBranch || 'all' : 'all-branches'}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart width={20} height={20} />
                  Participação das Filiais (Receita)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <PieChart>
                    <Pie
                      data={branchReceita}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 70 : 100}
                      innerRadius={isMobile ? 28 : 40}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {branchReceita.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart width={20} height={20} />
                  Performance das Filiais (Receita ao longo do tempo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={v => `R$${v/1000}k`} />
                    <Tooltip formatter={v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend />
                    {filteredConnections.map((sheet, idx) => (
                      <Line
                        key={sheet.project_name}
                        type="monotone"
                        dataKey={sheet.sheetTitle || sheet.project_name}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        name={sheet.sheetTitle || sheet.project_name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* General Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                Registros Gerais {specificMode && selectedSheet ? `(Filial: ${selectedSheet.sheetTitle || selectedSheet.project_name})` : "(Todas as Filiais)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialItemsList data={filteredData.map(item => ({ ...item, categoria: `${item.categoria} (${connections.find(s => s.project_name === item._sourceSheetId)?.sheetTitle || item._sourceSheetId || 'N/A'})` }))} />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 
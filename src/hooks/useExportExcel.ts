
import { useSheetDataWithOAuth } from "./useSheetDataWithOAuth";
import { toast } from "@/hooks/use-toast";

export const useExportExcel = () => {
  const { data, loading } = useSheetDataWithOAuth();

  const exportToExcel = () => {
    try {
      if (loading) {
        toast({
          title: "Aguarde",
          description: "Os dados ainda estão sendo carregados.",
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Nenhum dado disponível",
          description: "Conecte uma planilha para exportar dados.",
          variant: "destructive"
        });
        return;
      }

      // Gerar CSV (que pode ser aberto no Excel)
      const csvContent = generateCSVContent(data);
      
      // Criar e baixar o arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Excel Exportado",
        description: "O arquivo foi baixado com sucesso.",
      });

    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive"
      });
    }
  };

  const generateCSVContent = (data: any[]) => {
    // Cabeçalhos
    const headers = ['Data', 'Categoria', 'Receita', 'Despesa', 'Saldo'];
    
    // Dados
    const rows = data.map(item => [
      item.date,
      item.categoria,
      item.receita.toFixed(2),
      item.despesa.toFixed(2),
      (item.receita - item.despesa).toFixed(2)
    ]);

    // Calcular totais
    const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
    const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
    const saldoTotal = totalReceitas - totalDespesas;

    // Adicionar linha de totais
    rows.push(['', 'TOTAL', totalReceitas.toFixed(2), totalDespesas.toFixed(2), saldoTotal.toFixed(2)]);

    // Converter para CSV
    const csvRows = [headers, ...rows];
    return csvRows.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  return { exportToExcel, isLoading: loading };
};

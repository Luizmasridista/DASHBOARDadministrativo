
import { useSheetDataWithOAuth } from "./useSheetDataWithOAuth";
import { toast } from "@/hooks/use-toast";

export const useExportPDF = () => {
  const { data, loading } = useSheetDataWithOAuth();

  const exportToPDF = () => {
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

      // Criar conteúdo HTML para o PDF
      const htmlContent = generatePDFContent(data);
      
      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error("Não foi possível abrir a janela de impressão");
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast({
        title: "PDF Gerado",
        description: "O relatório foi aberto para impressão/salvamento.",
      });

    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  const generatePDFContent = (data: any[]) => {
    const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
    const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
    const saldo = totalReceitas - totalDespesas;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .summary { 
              margin-bottom: 30px; 
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
            }
            .summary-item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
              font-size: 16px;
            }
            .summary-item.total { 
              font-weight: bold; 
              font-size: 18px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .receita { color: #059669; }
            .despesa { color: #dc2626; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Financeiro</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="summary">
            <h2>Resumo Financeiro</h2>
            <div class="summary-item">
              <span>Total de Receitas:</span>
              <span class="receita">R$ ${totalReceitas.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total de Despesas:</span>
              <span class="despesa">R$ ${totalDespesas.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
              <span>Saldo:</span>
              <span class="${saldo >= 0 ? 'positive' : 'negative'}">R$ ${saldo.toFixed(2)}</span>
            </div>
          </div>

          <h2>Detalhamento por Período</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Receita</th>
                <th>Despesa</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td>${item.categoria}</td>
                  <td class="receita">R$ ${item.receita.toFixed(2)}</td>
                  <td class="despesa">R$ ${item.despesa.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  return { exportToPDF, isLoading: loading };
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useExportPDF } from "@/hooks/useExportPDF";
import { useExportExcel } from "@/hooks/useExportExcel";

const ExportReportsSection = () => {
  const { exportToPDF, isLoading: pdfLoading } = useExportPDF();
  const { exportToExcel, isLoading: excelLoading } = useExportExcel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Exportar Relatórios</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Baixe seus dados financeiros em diferentes formatos
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={exportToPDF} 
            variant="outline" 
            className="w-full"
            disabled={pdfLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {pdfLoading ? "Gerando..." : "Exportar PDF"}
          </Button>
          
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            className="w-full"
            disabled={excelLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {excelLoading ? "Gerando..." : "Exportar Excel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportReportsSection;

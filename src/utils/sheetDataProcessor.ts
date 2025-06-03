
import { SheetData } from "@/types/sheetData";

export const processSheetData = (values: any[][]): SheetData[] => {
  try {
    // Ignore the first row (headers)
    const dataRows = values.slice(1);
    
    return dataRows.map((row, index) => {
      const [data, categoria, descricao, valor] = row;
      
      // Clean and convert value
      const valorStr = valor?.toString().replace(/[^\d.,-]/g, '') || '0';
      const valorNumerico = parseFloat(valorStr.replace(',', '.')) || 0;
      
      // Determine if it's income or expense based on category
      const isReceita = categoria?.toLowerCase().includes('receita');
      
      return {
        date: formatDate(data) || `2024-${String((index % 12) + 1).padStart(2, '0')}`,
        receita: isReceita ? Math.abs(valorNumerico) : 0,
        despesa: !isReceita ? Math.abs(valorNumerico) : 0,
        categoria: categoria || 'Outros'
      };
    }).filter(item => item.receita > 0 || item.despesa > 0);
  } catch (error) {
    console.error("Error processing sheet data:", error);
    return [];
  }
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    // Try to convert different date formats to YYYY-MM
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2] || '2024';
        return `${year}-${month}`;
      }
    }
    
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
    }
    
    return dateStr;
  } catch {
    return dateStr;
  }
};

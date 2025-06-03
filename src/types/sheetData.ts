
export interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export interface SheetAPIResponse {
  values?: any[][];
}

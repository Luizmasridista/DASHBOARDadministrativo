export interface SheetData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
  _sourceSheetId?: string;
}

export interface SheetAPIResponse {
  values?: any[][];
}

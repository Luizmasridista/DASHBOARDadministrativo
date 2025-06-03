
export interface FinancialData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

export interface CategoryAnalysis {
  receita: number;
  despesa: number;
  transacoes: number;
  percentualDespesas: number;
  percentualReceitas: number;
}

export interface CategoryRanking {
  posicao: number;
  categoria: string;
  valor: number;
  percentual: number;
  transacoes: number;
}

export interface MonthlyData {
  receitas: number;
  despesas: number;
  transacoes: number;
  saldoMensal: number;
  categorias: string[];
}

export interface GrowthPatterns {
  crescimentoReceitas: number;
  crescimentoDespesas: number;
}

export interface AdvancedAnalysis {
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  margemLucro: number;
  categoriaAnalysis: Record<string, CategoryAnalysis>;
  categoriasDespesasRanking: CategoryRanking[];
  maiorCategoriaGasto: CategoryRanking | null;
  dadosMensais: Record<string, MonthlyData>;
  mesAtual: string;
  numeroTransacoes: number;
  numeroMeses: number;
  numeroCategorias: number;
  padroes: GrowthPatterns;
  dadosLimpos: number;
  dadosOriginais: number;
  qualidadeDados: number;
}

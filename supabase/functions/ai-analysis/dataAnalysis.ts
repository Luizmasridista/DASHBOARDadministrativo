
import { FinancialData, AdvancedAnalysis, CategoryAnalysis, MonthlyData } from './types.ts';

export function performAdvancedDataAnalysis(data: FinancialData[]): AdvancedAnalysis {
  console.log('Iniciando análise avançada dos dados:', data.length, 'registros');

  // Limpeza rigorosa dos dados
  const cleanedData = data
    .filter(item => {
      const hasValidAmount = (item.receita > 0 || item.despesa > 0);
      const hasValidDate = item.date && item.date.length >= 7;
      return item && hasValidAmount && hasValidDate;
    })
    .map(item => ({
      ...item,
      categoria: (item.categoria || 'Não Categorizado').trim(),
      receita: Number(item.receita) || 0,
      despesa: Number(item.despesa) || 0,
      date: item.date || new Date().toISOString().substring(0, 7)
    }));

  console.log('Dados após limpeza:', cleanedData.length, 'registros válidos');

  // Cálculos financeiros básicos
  const totalReceitas = cleanedData.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = cleanedData.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  
  console.log('Totais calculados:', { totalReceitas, totalDespesas, lucroLiquido });

  // Análise detalhada por categoria
  const categoriaAnalysis = cleanedData.reduce((acc, item) => {
    const categoria = item.categoria;
    if (!acc[categoria]) {
      acc[categoria] = { 
        receita: 0, 
        despesa: 0, 
        transacoes: 0,
        percentualDespesas: 0,
        percentualReceitas: 0
      };
    }
    acc[categoria].receita += item.receita;
    acc[categoria].despesa += item.despesa;
    acc[categoria].transacoes++;
    return acc;
  }, {} as Record<string, CategoryAnalysis>);

  // Calcular percentuais com validação
  Object.keys(categoriaAnalysis).forEach(categoria => {
    categoriaAnalysis[categoria].percentualDespesas = 
      totalDespesas > 0 ? (categoriaAnalysis[categoria].despesa / totalDespesas) * 100 : 0;
    categoriaAnalysis[categoria].percentualReceitas = 
      totalReceitas > 0 ? (categoriaAnalysis[categoria].receita / totalReceitas) * 100 : 0;
  });

  // Ranking GARANTIDO de categorias por despesas
  const categoriasDespesasRanking = Object.entries(categoriaAnalysis)
    .filter(([_, valores]) => valores.despesa > 0)
    .sort(([_, a], [__, b]) => b.despesa - a.despesa)
    .map(([categoria, valores], index) => ({
      posicao: index + 1,
      categoria,
      valor: valores.despesa,
      percentual: valores.percentualDespesas,
      transacoes: valores.transacoes
    }));

  console.log('Ranking de categorias:', categoriasDespesasRanking);

  // GARANTIR que sempre temos a maior categoria identificada
  const maiorCategoriaGasto = categoriasDespesasRanking.length > 0 ? 
    categoriasDespesasRanking[0] : 
    {
      posicao: 1,
      categoria: 'Sem categorias de despesa',
      valor: 0,
      percentual: 0,
      transacoes: 0
    };

  console.log('Maior categoria identificada:', maiorCategoriaGasto);

  // Análise temporal
  const dadosMensais = cleanedData.reduce((acc, item) => {
    const mes = item.date.substring(0, 7);
    if (!acc[mes]) {
      acc[mes] = { 
        receitas: 0, 
        despesas: 0, 
        transacoes: 0,
        saldoMensal: 0,
        categorias: new Set()
      };
    }
    acc[mes].receitas += item.receita;
    acc[mes].despesas += item.despesa;
    acc[mes].transacoes++;
    acc[mes].saldoMensal = acc[mes].receitas - acc[mes].despesas;
    acc[mes].categorias.add(item.categoria);
    return acc;
  }, {} as Record<string, { 
    receitas: number; 
    despesas: number; 
    transacoes: number;
    saldoMensal: number;
    categorias: Set<string>;
  }>);

  // Converter Sets para arrays
  const dadosMensaisProcessados = Object.fromEntries(
    Object.entries(dadosMensais).map(([mes, dados]) => [
      mes,
      {
        ...dados,
        categorias: Array.from(dados.categorias)
      }
    ])
  );

  const meses = Object.keys(dadosMensaisProcessados).sort();
  const mesAtual = meses[meses.length - 1] || new Date().toISOString().substring(0, 7);

  // Padrões de crescimento
  const padroes = {
    crescimentoReceitas: meses.length > 1 ? 
      ((dadosMensaisProcessados[meses[meses.length - 1]]?.receitas || 0) - 
       (dadosMensaisProcessados[meses[0]]?.receitas || 0)) : 0,
    crescimentoDespesas: meses.length > 1 ? 
      ((dadosMensaisProcessados[meses[meses.length - 1]]?.despesas || 0) - 
       (dadosMensaisProcessados[meses[0]]?.despesas || 0)) : 0
  };

  const resultado = {
    // Dados básicos
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
    
    // Análise por categoria (GARANTIDA)
    categoriaAnalysis,
    categoriasDespesasRanking,
    maiorCategoriaGasto,
    
    // Dados temporais
    dadosMensais: dadosMensaisProcessados,
    mesAtual,
    
    // Métricas
    numeroTransacoes: cleanedData.length,
    numeroMeses: meses.length,
    numeroCategorias: Object.keys(categoriaAnalysis).length,
    padroes,
    
    // Validação
    dadosLimpos: cleanedData.length,
    dadosOriginais: data.length,
    qualidadeDados: cleanedData.length / Math.max(data.length, 1)
  };

  console.log('Análise completa finalizada:', resultado);
  return resultado;
}

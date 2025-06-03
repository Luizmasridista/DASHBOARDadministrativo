
import { FinancialData, AdvancedAnalysis, CategoryAnalysis, MonthlyData } from './types.ts';

export function performAdvancedDataAnalysis(data: FinancialData[]): AdvancedAnalysis {
  // Limpeza e normalização de dados
  const cleanedData = data
    .filter(item => item && (item.receita > 0 || item.despesa > 0)) // Remove registros vazios
    .map(item => ({
      ...item,
      categoria: (item.categoria || 'Não Categorizado').trim(), // Normaliza categorias
      receita: Number(item.receita) || 0,
      despesa: Number(item.despesa) || 0,
      date: item.date || new Date().toISOString().substring(0, 7)
    }));

  console.log('Dados limpos:', cleanedData);

  // Cálculos financeiros básicos
  const totalReceitas = cleanedData.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = cleanedData.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  
  // Análise avançada por categoria com validação
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

  // Calcular percentuais
  Object.keys(categoriaAnalysis).forEach(categoria => {
    categoriaAnalysis[categoria].percentualDespesas = 
      totalDespesas > 0 ? (categoriaAnalysis[categoria].despesa / totalDespesas) * 100 : 0;
    categoriaAnalysis[categoria].percentualReceitas = 
      totalReceitas > 0 ? (categoriaAnalysis[categoria].receita / totalReceitas) * 100 : 0;
  });

  // Ranking preciso de categorias por despesas
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

  // Identificação definitiva da maior categoria
  const maiorCategoriaGasto = categoriasDespesasRanking.length > 0 ? categoriasDespesasRanking[0] : null;

  // Análise temporal detalhada
  const dadosMensais = cleanedData.reduce((acc, item) => {
    const mes = item.date.substring(0, 7); // YYYY-MM
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

  // Converter Sets para arrays para serialização
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
  const mesAtual = meses[meses.length - 1];

  // Análise de padrões e tendências
  const padroes = {
    crescimentoReceitas: meses.length > 1 ? 
      ((dadosMensaisProcessados[meses[meses.length - 1]]?.receitas || 0) - 
       (dadosMensaisProcessados[meses[0]]?.receitas || 0)) : 0,
    crescimentoDespesas: meses.length > 1 ? 
      ((dadosMensaisProcessados[meses[meses.length - 1]]?.despesas || 0) - 
       (dadosMensaisProcessados[meses[0]]?.despesas || 0)) : 0
  };

  return {
    // Dados básicos
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
    
    // Análise detalhada por categoria
    categoriaAnalysis,
    categoriasDespesasRanking,
    maiorCategoriaGasto,
    
    // Dados temporais
    dadosMensais: dadosMensaisProcessados,
    mesAtual,
    
    // Métricas avançadas
    numeroTransacoes: cleanedData.length,
    numeroMeses: meses.length,
    numeroCategorias: Object.keys(categoriaAnalysis).length,
    padroes,
    
    // Validação de dados
    dadosLimpos: cleanedData.length,
    dadosOriginais: data.length,
    qualidadeDados: cleanedData.length / Math.max(data.length, 1)
  };
}

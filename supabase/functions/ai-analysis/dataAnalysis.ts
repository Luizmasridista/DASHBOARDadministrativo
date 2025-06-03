
import { FinancialData, AdvancedAnalysis, CategoryAnalysis, MonthlyData } from './types.ts';

export function performAdvancedDataAnalysis(data: FinancialData[]): AdvancedAnalysis {
  console.log('🔍 Iniciando análise detalhada dos dados:', data.length, 'registros');

  // Limpeza rigorosa e validação dos dados
  const cleanedData = data
    .filter(item => {
      const hasValidAmount = (item.receita > 0 || item.despesa > 0);
      const hasValidDate = item.date && item.date.length >= 7;
      const isValidItem = item && hasValidAmount && hasValidDate;
      
      if (!isValidItem) {
        console.log('❌ Item inválido removido:', item);
      }
      
      return isValidItem;
    })
    .map(item => ({
      ...item,
      categoria: (item.categoria || 'Não Categorizado').trim(),
      receita: Number(item.receita) || 0,
      despesa: Number(item.despesa) || 0,
      date: item.date || new Date().toISOString().substring(0, 7)
    }));

  console.log('✅ Dados após limpeza:', cleanedData.length, 'registros válidos');

  // Cálculos financeiros básicos
  const totalReceitas = cleanedData.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = cleanedData.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  
  console.log('💰 Totais calculados:', { 
    receitas: totalReceitas, 
    despesas: totalDespesas, 
    lucro: lucroLiquido 
  });

  // Análise DETALHADA por categoria com foco em DESPESAS
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

  // Calcular percentuais com validação rigorosa
  Object.keys(categoriaAnalysis).forEach(categoria => {
    const catData = categoriaAnalysis[categoria];
    catData.percentualDespesas = totalDespesas > 0 ? (catData.despesa / totalDespesas) * 100 : 0;
    catData.percentualReceitas = totalReceitas > 0 ? (catData.receita / totalReceitas) * 100 : 0;
    
    console.log(`📊 Categoria "${categoria}":`, {
      despesa: catData.despesa,
      percentual: catData.percentualDespesas.toFixed(1) + '%',
      transacoes: catData.transacoes
    });
  });

  // RANKING GARANTIDO de categorias por despesas (ORDENAÇÃO CORRETA)
  const categoriasDespesasRanking = Object.entries(categoriaAnalysis)
    .filter(([categoria, valores]) => {
      const temDespesa = valores.despesa > 0;
      if (!temDespesa) {
        console.log(`⚠️ Categoria "${categoria}" sem despesas - removida do ranking`);
      }
      return temDespesa;
    })
    .sort(([categoriaA, valoresA], [categoriaB, valoresB]) => {
      // Ordenação DECRESCENTE por valor de despesa
      const comparacao = valoresB.despesa - valoresA.despesa;
      console.log(`🔄 Comparando: ${categoriaA} (${valoresA.despesa}) vs ${categoriaB} (${valoresB.despesa}) = ${comparacao}`);
      return comparacao;
    })
    .map(([categoria, valores], index) => {
      const rankingItem = {
        posicao: index + 1,
        categoria,
        valor: valores.despesa,
        percentual: valores.percentualDespesas,
        transacoes: valores.transacoes
      };
      console.log(`🏆 Posição ${rankingItem.posicao}: ${categoria} - R$ ${rankingItem.valor.toLocaleString('pt-BR')}`);
      return rankingItem;
    });

  console.log('📈 Ranking final de categorias por despesa:', categoriasDespesasRanking);

  // GARANTIR identificação da maior categoria (CRÍTICO para respostas)
  const maiorCategoriaGasto = categoriasDespesasRanking.length > 0 ? 
    categoriasDespesasRanking[0] : 
    {
      posicao: 1,
      categoria: 'Nenhuma categoria de despesa encontrada',
      valor: 0,
      percentual: 0,
      transacoes: 0
    };

  console.log('🎯 MAIOR CATEGORIA IDENTIFICADA:', {
    categoria: maiorCategoriaGasto.categoria,
    valor: maiorCategoriaGasto.valor,
    percentual: maiorCategoriaGasto.percentual.toFixed(1) + '%'
  });

  // Análise temporal (dados mensais)
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
    // Dados financeiros básicos
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
    
    // Análise por categoria (GARANTIDA e ORDENADA)
    categoriaAnalysis,
    categoriasDespesasRanking,
    maiorCategoriaGasto, // CRÍTICO: sempre disponível
    
    // Dados temporais
    dadosMensais: dadosMensaisProcessados,
    mesAtual,
    
    // Métricas de validação
    numeroTransacoes: cleanedData.length,
    numeroMeses: meses.length,
    numeroCategorias: Object.keys(categoriaAnalysis).length,
    padroes,
    
    // Qualidade dos dados
    dadosLimpos: cleanedData.length,
    dadosOriginais: data.length,
    qualidadeDados: cleanedData.length / Math.max(data.length, 1)
  };

  console.log('✅ ANÁLISE FINALIZADA:', {
    transacoes: resultado.numeroTransacoes,
    categorias: resultado.numeroCategorias,
    maiorCategoria: resultado.maiorCategoriaGasto.categoria,
    valorMaiorCategoria: resultado.maiorCategoriaGasto.valor
  });

  return resultado;
}

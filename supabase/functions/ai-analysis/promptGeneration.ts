
import { FinancialData, AdvancedAnalysis } from './types.ts';

export function createEnhancedConversationalPrompt(
  data: FinancialData[], 
  userMessage: string, 
  analysis: AdvancedAnalysis
): string {
  const perguntasCategoria = [
    'maior categoria', 'maior despesa', 'maior gasto', 'categoria que mais gastei',
    'onde gastei mais', 'principal despesa', 'categoria principal', 'maior categoria de gasto',
    'qual categoria', 'categoria de despesa', 'gasto maior', 'despesa principal'
  ];
  
  const isPerguntaCategoria = perguntasCategoria.some(termo => 
    userMessage.toLowerCase().includes(termo)
  );

  let contextEspecifico = '';
  
  if (isPerguntaCategoria && analysis.maiorCategoriaGasto) {
    const maior = analysis.maiorCategoriaGasto;
    contextEspecifico = `
    🎯 IDENTIFICAÇÃO PRECISA DA MAIOR CATEGORIA DE DESPESAS:
    
    ✅ CATEGORIA COM MAIOR GASTO: ${maior.categoria}
    💰 VALOR TOTAL GASTO: R$ ${maior.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    📊 PERCENTUAL DO TOTAL: ${maior.percentual.toFixed(2)}%
    📋 NÚMERO DE TRANSAÇÕES: ${maior.transacoes}
    🏆 POSIÇÃO NO RANKING: ${maior.posicao}º lugar
    
    📈 RANKING COMPLETO DE DESPESAS:
    ${analysis.categoriasDespesasRanking.map((cat, index) => 
      `${index + 1}º. ${cat.categoria}: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(2)}%)`
    ).join('\n')}
    `;
  }
  
  return `
    🤖 ASSISTENTE FINANCEIRO IA KAIZEN - ANÁLISE AVANÇADA

    📊 DADOS FINANCEIROS VALIDADOS E PROCESSADOS:
    • Total de Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    • Total de Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    • Lucro/Prejuízo: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    • Margem: ${analysis.margemLucro.toFixed(2)}%
    • Período Analisado: ${analysis.mesAtual}
    
    🔍 QUALIDADE DOS DADOS:
    • Registros Processados: ${analysis.dadosLimpos}/${analysis.dadosOriginais}
    • Qualidade: ${(analysis.qualidadeDados * 100).toFixed(1)}%
    • Categorias Identificadas: ${analysis.numeroCategorias}
    • Transações Válidas: ${analysis.numeroTransacoes}

    ${contextEspecifico}

    ❓ PERGUNTA: "${userMessage}"

    🎯 INSTRUÇÕES PARA RESPOSTA PRECISA:
    - Use EXCLUSIVAMENTE os dados validados acima
    - Seja ESPECÍFICO com números exatos e percentuais
    - Para perguntas sobre maior categoria, cite EXATAMENTE o nome e valor
    - Forneça contexto e insights acionáveis
    - Máximo: 3 parágrafos objetivos
    - Use emojis relevantes (💰 💸 📈 📉 ⚠️ ✅ 🎯 💡 🏆)

    Responda com base EXCLUSIVAMENTE nos dados fornecidos:
  `;
}

export function createEnhancedAnalysisPrompt(analysis: AdvancedAnalysis, analysisType: string): string {
  const baseContext = `
    📊 ANÁLISE FINANCEIRA AVANÇADA:
    💰 Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    💸 Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    📈 Lucro/Prejuízo: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    📊 Margem: ${analysis.margemLucro.toFixed(2)}%
    📋 Transações: ${analysis.numeroTransacoes}
    🗓️ Período: ${analysis.mesAtual}
    
    🏆 RANKING DETALHADO DE CATEGORIAS POR DESPESAS:
    ${analysis.categoriasDespesasRanking.map((cat, index) => 
      `${index + 1}º. ${cat.categoria}: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(2)}%)`
    ).join('\n')}

    🎯 MAIOR CATEGORIA DE GASTO: ${analysis.maiorCategoriaGasto ? 
      `${analysis.maiorCategoriaGasto.categoria} - R$ ${analysis.maiorCategoriaGasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${analysis.maiorCategoriaGasto.percentual.toFixed(2)}%)` : 
      'Não identificada'}
      
    📈 ANÁLISE TEMPORAL:
    ${Object.entries(analysis.dadosMensais).map(([mes, dados]) => 
      `📅 ${mes}: 💰 R$ ${dados.receitas.toLocaleString('pt-BR')} | 💸 R$ ${dados.despesas.toLocaleString('pt-BR')} | 💹 R$ ${dados.saldoMensal.toLocaleString('pt-BR')}`
    ).join('\n')}
  `;

  switch (analysisType) {
    case 'insights':
      return `${baseContext}
      
      🔍 Forneça 4-5 insights ESTRATÉGICOS e ACIONÁVEIS baseados nos dados.
      Use técnicas de análise preditiva para identificar padrões e oportunidades.
      Priorize insights que gerem decisões financeiras eficazes.
      Use emojis relevantes (📈📉⚠️✅🎯💡🚀) e seja ESPECÍFICO.
      Máximo: 200 palavras. Português brasileiro.`;

    case 'recommendations':
      return `${baseContext}
      
      🎯 Forneça 4-5 recomendações PRÁTICAS e IMPLEMENTÁVEIS.
      Base-se na análise da maior categoria de gastos e padrões identificados.
      Inclua ações de curto, médio e longo prazo.
      Use emojis para destacar ações (🚀💪🎯⚡️✨🔧).
      Máximo: 200 palavras. Português brasileiro.`;

    case 'trends':
      return `${baseContext}
      
      📊 Analise TENDÊNCIAS detalhadas com base nos dados mensais.
      Identifique padrões de crescimento/declínio nas categorias principais.
      Use análise preditiva para projetar cenários futuros.
      Use emojis para padrões (📈📉🔄⚠️📊🎯).
      Máximo: 180 palavras. Português brasileiro.`;

    case 'risks':
      return `${baseContext}
      
      ⚠️ Identifique 4-5 PRINCIPAIS RISCOS financeiros baseados nos dados.
      Analise concentração de gastos, volatilidade e sustentabilidade.
      Para cada risco, forneça estratégia de mitigação ESPECÍFICA.
      Use emojis de alerta (⚠️🚨💥🔴) e soluções (✅🛡️💪🔧).
      Máximo: 200 palavras. Português brasileiro.`;

    default:
      return `${baseContext}
      
      📋 Análise COMPLETA integrando insights, tendências e recomendações.
      Destaque a maior categoria de gastos e seu impacto.
      Inclua análise preditiva e insights acionáveis.
      Use emojis relevantes para engajamento.
      Máximo: 250 palavras. Português brasileiro.`;
  }
}

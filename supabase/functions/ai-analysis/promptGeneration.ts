
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
    🎯 RESPOSTA DIRETA BASEADA NOS DADOS:
    
    A categoria com maior gasto é: ${maior.categoria}
    Valor total: R$ ${maior.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    Representa ${maior.percentual.toFixed(1)}% do total de despesas
    
    📊 RANKING COMPLETO:
    ${analysis.categoriasDespesasRanking.slice(0, 5).map((cat, index) => 
      `${index + 1}º. ${cat.categoria}: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ).join('\n')}
    `;
  }
  
  return `
    🤖 ASSISTENTE FINANCEIRO IA KAIZEN

    📊 DADOS VALIDADOS (${analysis.numeroTransacoes} transações):
    • Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    • Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    • Resultado: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

    ${contextEspecifico}

    ❓ PERGUNTA: "${userMessage}"

    🎯 INSTRUÇÕES CRÍTICAS:
    1. SEMPRE responda com dados EXATOS dos registros analisados
    2. Para perguntas sobre "maior categoria", cite DIRETAMENTE o nome e valor
    3. NUNCA diga "não é possível determinar" se os dados existem
    4. Seja DIRETO e SUCINTO - máximo 2 parágrafos
    5. Use os números EXATOS fornecidos acima
    6. Se perguntado sobre categoria específica, responda com precisão

    RESPONDA AGORA com base nos dados fornecidos:
  `;
}

export function createEnhancedAnalysisPrompt(analysis: AdvancedAnalysis, analysisType: string): string {
  const baseContext = `
    📊 DADOS FINANCEIROS CONSOLIDADOS:
    💰 Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    💸 Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    📈 Resultado: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    📊 Margem: ${analysis.margemLucro.toFixed(1)}%
    
    🏆 MAIOR CATEGORIA DE GASTO: ${analysis.maiorCategoriaGasto ? 
      `${analysis.maiorCategoriaGasto.categoria} - R$ ${analysis.maiorCategoriaGasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${analysis.maiorCategoriaGasto.percentual.toFixed(1)}%)` : 
      'Não identificada'}
      
    📋 TOP 5 CATEGORIAS POR DESPESA:
    ${analysis.categoriasDespesasRanking.slice(0, 5).map((cat, index) => 
      `${index + 1}º. ${cat.categoria}: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(1)}%)`
    ).join('\n')}
  `;

  const commonInstructions = `
    🎯 DIRETRIZES OBRIGATÓRIAS:
    - Use APENAS os dados fornecidos acima
    - Seja DIRETO e OBJETIVO
    - Cite números EXATOS
    - Máximo 150 palavras
    - Evite generalidades ou evasivas
    - Português brasileiro
  `;

  switch (analysisType) {
    case 'insights':
      return `${baseContext}
      
      ${commonInstructions}
      🔍 Forneça 3-4 insights ESPECÍFICOS baseados nos dados.
      Foque em padrões identificáveis e ações práticas.
      Use emojis relevantes (📈📉⚠️✅🎯💡).`;

    case 'recommendations':
      return `${baseContext}
      
      ${commonInstructions}
      🎯 Forneça 3-4 recomendações PRÁTICAS.
      Base-se na maior categoria de gastos identificada.
      Inclua ações específicas e mensuráveis.
      Use emojis para ações (🚀💪🎯⚡️✨).`;

    case 'trends':
      return `${baseContext}
      
      ${commonInstructions}
      📊 Analise TENDÊNCIAS com base nos dados mensais.
      Identifique padrões específicos nas categorias principais.
      Use emojis para tendências (📈📉🔄⚠️📊).`;

    case 'risks':
      return `${baseContext}
      
      ${commonInstructions}
      ⚠️ Identifique 3-4 RISCOS específicos baseados nos dados.
      Analise concentração de gastos e padrões preocupantes.
      Para cada risco, sugira uma ação específica.
      Use emojis de alerta (⚠️🚨💥) e soluções (✅🛡️💪).`;

    default:
      return `${baseContext}
      
      ${commonInstructions}
      📋 Análise COMPLETA integrando insights e recomendações.
      Destaque a maior categoria de gastos e seu impacto.
      Inclua 2-3 ações práticas específicas.`;
  }
}

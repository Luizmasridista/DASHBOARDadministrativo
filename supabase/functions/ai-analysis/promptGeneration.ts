
import { FinancialData, AdvancedAnalysis } from './types.ts';

export function createEnhancedConversationalPrompt(
  data: FinancialData[], 
  userMessage: string, 
  analysis: AdvancedAnalysis
): string {
  // Detectar perguntas sobre categoria de maior gasto
  const perguntasCategoria = [
    'maior categoria', 'maior despesa', 'maior gasto', 'categoria que mais gastei',
    'onde gastei mais', 'principal despesa', 'categoria principal', 'maior categoria de gasto',
    'qual categoria', 'categoria de despesa', 'gasto maior', 'despesa principal',
    'categoria mais', 'categoria qual mais', 'qual mais gerou', 'mais gerou despesa'
  ];
  
  const isPerguntaCategoria = perguntasCategoria.some(termo => 
    userMessage.toLowerCase().includes(termo)
  );

  // Detectar perguntas sobre valores específicos
  const perguntasValor = [
    'quanto gastei', 'valor total', 'total de', 'soma de', 'quanto foi'
  ];
  
  const isPerguntaValor = perguntasValor.some(termo => 
    userMessage.toLowerCase().includes(termo)
  );

  let respostaEspecifica = '';
  
  if (isPerguntaCategoria && analysis.maiorCategoriaGasto) {
    const maior = analysis.maiorCategoriaGasto;
    respostaEspecifica = `
🎯 RESPOSTA DIRETA:

A categoria que mais gerou despesas é: **${maior.categoria}**
• Valor total: R$ ${maior.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Representa ${maior.percentual.toFixed(1)}% do total de despesas
• Total de transações: ${maior.transacoes}

📊 Ranking completo de categorias por despesa:
${analysis.categoriasDespesasRanking.slice(0, 5).map((cat, index) => 
  `${index + 1}º. **${cat.categoria}**: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(1)}%)`
).join('\n')}
    `;
  }

  // Gerar contexto dos dados disponíveis para análise
  const contextoDados = `
📊 DADOS ANALISADOS (${analysis.numeroTransacoes} transações):
• Total de Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Total de Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Resultado Líquido: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Margem de Lucro: ${analysis.margemLucro.toFixed(1)}%

🏆 CATEGORIA COM MAIOR DESPESA:
${analysis.maiorCategoriaGasto ? 
  `**${analysis.maiorCategoriaGasto.categoria}** - R$ ${analysis.maiorCategoriaGasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${analysis.maiorCategoriaGasto.percentual.toFixed(1)}%)` : 
  'Nenhuma categoria de despesa identificada'}

📋 TOP 5 CATEGORIAS POR DESPESA:
${analysis.categoriasDespesasRanking.slice(0, 5).map((cat, index) => 
  `${index + 1}º. ${cat.categoria}: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(1)}%)`
).join('\n')}
  `;

  return `
🤖 ASSISTENTE FINANCEIRO IA KAIZEN - MODO ANÁLISE DIRETA

${contextoDados}

${respostaEspecifica}

❓ PERGUNTA DO USUÁRIO: "${userMessage}"

🎯 INSTRUÇÕES CRÍTICAS PARA RESPOSTA:

1. **SEMPRE FORNECER DADOS ESPECÍFICOS**: Use EXATAMENTE os números fornecidos acima
2. **SER DIRETO E ASSERTIVO**: Responda diretamente à pergunta sem evasivas
3. **USAR OS DADOS REAIS**: Cite categorias, valores e percentuais EXATOS dos dados analisados
4. **MÁXIMO 100 PALAVRAS**: Seja conciso e objetivo
5. **FORMATO DE RESPOSTA**:
   - Comece com a resposta direta
   - Inclua o valor específico
   - Mencione o percentual do total
   - Adicione contexto relevante se necessário

📌 EXEMPLOS DE RESPOSTAS CORRETAS:
- Para "qual categoria mais gastou": "A categoria **[NOME]** foi a que mais gerou despesas, com R$ [VALOR] ([X]% do total)"
- Para perguntas de valor: "O valor total foi R$ [VALOR EXATO]"
- Para comparações: "A categoria [A] gastou R$ [X], enquanto [B] gastou R$ [Y]"

⚠️ NUNCA DIGA:
- "Não é possível determinar"
- "Com base nos dados disponíveis, parece que..."
- "Seria necessário analisar melhor"
- Respostas vagas ou evasivas

🚀 RESPONDA AGORA de forma DIRETA e ESPECÍFICA:
  `;
}

export function createEnhancedAnalysisPrompt(analysis: AdvancedAnalysis, analysisType: string): string {
  const baseContext = `
📊 DADOS FINANCEIROS DETALHADOS:
💰 Total de Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💸 Total de Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
📈 Resultado Líquido: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
📊 Margem de Lucro: ${analysis.margemLucro.toFixed(1)}%
📋 Total de Transações: ${analysis.numeroTransacoes}
    
🏆 CATEGORIA COM MAIOR DESPESA:
${analysis.maiorCategoriaGasto ? 
  `**${analysis.maiorCategoriaGasto.categoria}** - R$ ${analysis.maiorCategoriaGasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${analysis.maiorCategoriaGasto.percentual.toFixed(1)}% do total)` : 
  'Nenhuma categoria identificada'}
      
📋 RANKING COMPLETO DE DESPESAS:
${analysis.categoriasDespesasRanking.slice(0, 5).map((cat, index) => 
  `${index + 1}º. **${cat.categoria}**: R$ ${cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentual.toFixed(1)}%)`
).join('\n')}

📅 DADOS MENSAIS:
${Object.entries(analysis.dadosMensais).map(([mes, dados]) => 
  `${mes}: Receitas R$ ${dados.receitas.toLocaleString('pt-BR')} | Despesas R$ ${dados.despesas.toLocaleString('pt-BR')} | Saldo R$ ${dados.saldoMensal.toLocaleString('pt-BR')}`
).join('\n')}
  `;

  const commonInstructions = `
🎯 DIRETRIZES OBRIGATÓRIAS:
- Use EXCLUSIVAMENTE os dados fornecidos acima
- Cite números EXATOS e específicos
- Seja DIRETO e OBJETIVO
- Máximo 120 palavras
- Use português brasileiro
- Evite generalidades - seja específico
- Sempre mencione a categoria principal identificada
  `;

  switch (analysisType) {
    case 'insights':
      return `${baseContext}
      
      ${commonInstructions}
      
🔍 FORNEÇA 3-4 INSIGHTS ESPECÍFICOS:
Baseie-se nos dados reais apresentados acima. Destaque a categoria **${analysis.maiorCategoriaGasto?.categoria || 'principal'}** e seu impacto.
Inclua padrões identificáveis e ações práticas com valores específicos.
Use emojis relevantes: 📈📉⚠️✅🎯💡`;

    case 'recommendations':
      return `${baseContext}
      
      ${commonInstructions}
      
🎯 FORNEÇA 3-4 RECOMENDAÇÕES PRÁTICAS:
Foque na categoria **${analysis.maiorCategoriaGasto?.categoria || 'principal'}** que representa ${analysis.maiorCategoriaGasto?.percentual.toFixed(1) || '0'}% das despesas.
Inclua ações específicas com valores mensuráveis baseados nos dados reais.
Use emojis para ações: 🚀💪🎯⚡️✨`;

    case 'trends':
      return `${baseContext}
      
      ${commonInstructions}
      
📊 ANALISE TENDÊNCIAS COM BASE NOS DADOS:
Identifique padrões específicos na categoria **${analysis.maiorCategoriaGasto?.categoria || 'principal'}** e outras categorias principais.
Use os dados mensais fornecidos para identificar tendências concretas.
Use emojis: 📈📉🔄⚠️📊`;

    case 'risks':
      return `${baseContext}
      
      ${commonInstructions}
      
⚠️ IDENTIFIQUE 3-4 RISCOS ESPECÍFICOS:
Analise a concentração de ${analysis.maiorCategoriaGasto?.percentual.toFixed(1) || '0'}% em **${analysis.maiorCategoriaGasto?.categoria || 'uma categoria'}**.
Para cada risco, sugira uma ação específica com base nos valores reais.
Use emojis: ⚠️🚨💥 para riscos e ✅🛡️💪 para soluções`;

    default:
      return `${baseContext}
      
      ${commonInstructions}
      
📋 ANÁLISE COMPLETA:
Integre insights e recomendações destacando a categoria **${analysis.maiorCategoriaGasto?.categoria || 'principal'}** e seu impacto de R$ ${analysis.maiorCategoriaGasto?.valor.toLocaleString('pt-BR') || '0'}.
Inclua 2-3 ações práticas específicas com valores mensuráveis.`;
  }
}

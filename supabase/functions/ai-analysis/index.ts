
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialData {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, analysisType, userMessage } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    // Análise avançada e normalizada dos dados
    const enhancedAnalysis = performAdvancedDataAnalysis(data);
    console.log('Análise avançada dos dados:', enhancedAnalysis);

    // Se há uma mensagem do usuário, criar prompt conversacional otimizado
    const prompt = userMessage 
      ? createEnhancedConversationalPrompt(data, userMessage, enhancedAnalysis)
      : createEnhancedAnalysisPrompt(enhancedAnalysis, analysisType);

    // Call Google Gemini API with enhanced configuration
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Reduzido para maior precisão
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024, // Aumentado para respostas mais detalhadas
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.candidates[0]?.content?.parts[0]?.text || 'Análise não disponível';

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function performAdvancedDataAnalysis(data: FinancialData[]) {
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
  }, {} as Record<string, { 
    receita: number; 
    despesa: number; 
    transacoes: number;
    percentualDespesas: number;
    percentualReceitas: number;
  }>);

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

function createEnhancedConversationalPrompt(data: FinancialData[], userMessage: string, analysis: any) {
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

function createEnhancedAnalysisPrompt(analysis: any, analysisType: string) {
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
    ${Object.entries(analysis.dadosMensais).map(([mes, dados]: [string, any]) => 
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


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

    // Preparar análise detalhada dos dados
    const detailedAnalysis = prepareDetailedDataAnalysis(data);
    console.log('Análise detalhada dos dados:', detailedAnalysis);

    // Se há uma mensagem do usuário, criar prompt conversacional
    const prompt = userMessage 
      ? createConversationalPrompt(data, userMessage, detailedAnalysis)
      : createAnalysisPrompt(detailedAnalysis, analysisType);

    // Call Google Gemini API
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
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

function prepareDetailedDataAnalysis(data: FinancialData[]) {
  const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  
  // Análise por categoria (agrupando despesas e receitas)
  const categorias = data.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = { receita: 0, despesa: 0 };
    }
    acc[item.categoria].receita += item.receita;
    acc[item.categoria].despesa += item.despesa;
    return acc;
  }, {} as Record<string, { receita: number; despesa: number }>);

  // Identificar maior categoria de despesas
  const categoriasDespesas = Object.entries(categorias)
    .filter(([_, valores]) => valores.despesa > 0)
    .sort(([_, a], [__, b]) => b.despesa - a.despesa);

  const maiorCategoriaGasto = categoriasDespesas.length > 0 ? categoriasDespesas[0] : null;

  // Análise temporal (receitas por mês)
  const receitasPorMes = data.reduce((acc, item) => {
    const mes = item.date.substring(0, 7); // YYYY-MM
    if (!acc[mes]) acc[mes] = { receitas: 0, despesas: 0 };
    acc[mes].receitas += item.receita;
    acc[mes].despesas += item.despesa;
    return acc;
  }, {} as Record<string, { receitas: number; despesas: number }>);

  // Determinar mês atual baseado nos dados
  const meses = Object.keys(receitasPorMes).sort();
  const mesAtual = meses[meses.length - 1];

  return {
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
    categorias,
    categoriasDespesas,
    maiorCategoriaGasto,
    receitasPorMes,
    mesAtual,
    numeroTransacoes: data.length
  };
}

function createConversationalPrompt(data: FinancialData[], userMessage: string, analysis: any) {
  const perguntasSobreMaiorCategoria = [
    'maior categoria', 'maior despesa', 'maior gasto', 'categoria que mais gastei',
    'onde gastei mais', 'principal despesa', 'categoria principal'
  ];
  
  const isPerguntaMaiorCategoria = perguntasSobreMaiorCategoria.some(termo => 
    userMessage.toLowerCase().includes(termo)
  );

  let contextEspecifico = '';
  
  if (isPerguntaMaiorCategoria && analysis.maiorCategoriaGasto) {
    const [categoria, valores] = analysis.maiorCategoriaGasto;
    contextEspecifico = `
    🎯 DADOS ESPECÍFICOS SOBRE MAIOR CATEGORIA DE DESPESAS:
    • Categoria com maior gasto: ${categoria}
    • Valor gasto nesta categoria: R$ ${valores.despesa.toLocaleString('pt-BR')}
    • Percentual do total de despesas: ${((valores.despesa / analysis.totalDespesas) * 100).toFixed(1)}%
    `;
  }
  
  return `
    Você é o assistente financeiro IA da Kaizen 🤖. Responda de forma PRECISA, DIRETA e com base nos DADOS REAIS fornecidos.

    📊 DADOS FINANCEIROS COMPLETOS:
    • Receitas totais: R$ ${analysis.totalReceitas.toLocaleString('pt-BR')}
    • Despesas totais: R$ ${analysis.totalDespesas.toLocaleString('pt-BR')}
    • Lucro líquido: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR')}
    • Margem de lucro: ${analysis.margemLucro.toFixed(1)}%
    • Número de transações: ${analysis.numeroTransacoes}

    🏷️ TODAS AS CATEGORIAS DE DESPESAS (ordenadas por valor):
    ${analysis.categoriasDespesas.map(([cat, valores], index) => 
      `${index + 1}. ${cat}: R$ ${valores.despesa.toLocaleString('pt-BR')} (${((valores.despesa / analysis.totalDespesas) * 100).toFixed(1)}%)`
    ).join('\n')}

    ${contextEspecifico}

    📅 MÊS ATUAL ANALISADO: ${analysis.mesAtual}

    ❓ PERGUNTA DO USUÁRIO: "${userMessage}"

    📝 INSTRUÇÕES IMPORTANTES:
    - Use APENAS os dados reais fornecidos acima
    - Se perguntarem sobre maior categoria/despesa, cite EXATAMENTE a categoria e valor dos dados
    - Seja específico com números e percentuais
    - Máximo: 2 parágrafos curtos
    - Use emojis relevantes (💰 💸 📈 📉 ⚠️ ✅ 🎯 💡)
    - Se a pergunta não for financeira, redirecione educadamente

    Responda agora com base EXCLUSIVAMENTE nos dados fornecidos:
  `;
}

function createAnalysisPrompt(analysis: any, analysisType: string) {
  const baseContext = `
    📊 DADOS FINANCEIROS COMPLETOS:
    💰 Receitas: R$ ${analysis.totalReceitas.toLocaleString('pt-BR')}
    💸 Despesas: R$ ${analysis.totalDespesas.toLocaleString('pt-BR')}
    📈 Lucro: R$ ${analysis.lucroLiquido.toLocaleString('pt-BR')}
    📊 Margem: ${analysis.margemLucro.toFixed(1)}%
    📋 Transações: ${analysis.numeroTransacoes}
    
    🏷️ RANKING DE CATEGORIAS POR DESPESAS:
    ${analysis.categoriasDespesas.map(([cat, valores], index) => 
      `${index + 1}. ${cat}: R$ ${valores.despesa.toLocaleString('pt-BR')} (${((valores.despesa / analysis.totalDespesas) * 100).toFixed(1)}%)`
    ).join('\n')}

    🎯 MAIOR CATEGORIA DE GASTO: ${analysis.maiorCategoriaGasto ? 
      `${analysis.maiorCategoriaGasto[0]} - R$ ${analysis.maiorCategoriaGasto[1].despesa.toLocaleString('pt-BR')}` : 
      'Não identificada'}
  `;

  switch (analysisType) {
    case 'insights':
      return `${baseContext}
      
      🔍 Forneça 3-4 insights ESTRATÉGICOS e DIRETOS sobre o desempenho financeiro.
      Use emojis relevantes (📈📉⚠️✅🎯💡) e seja CONCISO.
      Máximo: 150 palavras. Português brasileiro.`;

    case 'recommendations':
      return `${baseContext}
      
      🎯 Forneça 3-4 recomendações PRÁTICAS e ACIONÁVEIS.
      Use emojis para destacar ações (🚀💪🎯⚡️✨).
      Foque em ações específicas do curto prazo.
      Máximo: 150 palavras. Português brasileiro.`;

    case 'trends':
      return `${baseContext}
      
      📈 Receitas/Despesas mensais:
      ${Object.entries(analysis.receitasPorMes).map(([mes, valores]: [string, any]) => 
        `📅 ${mes}: 💰 R$ ${valores.receitas.toLocaleString('pt-BR')} | 💸 R$ ${valores.despesas.toLocaleString('pt-BR')}`
      ).join('\n')}
      
      📊 Analise as TENDÊNCIAS principais de forma DIRETA.
      Use emojis para padrões (📈📉🔄⚠️).
      Máximo: 120 palavras. Português brasileiro.`;

    case 'risks':
      return `${baseContext}
      
      ⚠️ Identifique 3-4 PRINCIPAIS RISCOS financeiros.
      Use emojis de alerta (⚠️🚨💥🔴) e soluções (✅🛡️💪).
      Para cada risco, uma estratégia RÁPIDA de mitigação.
      Máximo: 150 palavras. Português brasileiro.`;

    default:
      return `${baseContext}
      
      📋 Análise GERAL e DIRETA dos dados financeiros.
      Inclua insights sobre desempenho, tendências e recomendações.
      Use emojis relevantes para engajamento.
      Máximo: 180 palavras. Português brasileiro.`;
  }
}

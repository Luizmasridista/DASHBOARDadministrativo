
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

    // Se há uma mensagem do usuário, criar prompt conversacional
    const prompt = userMessage 
      ? createConversationalPrompt(data, userMessage)
      : createAnalysisPrompt(prepareDataSummary(data), analysisType);

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
          maxOutputTokens: 512, // Reduzido para respostas mais concisas
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

function createConversationalPrompt(data: FinancialData[], userMessage: string) {
  const dataSummary = prepareDataSummary(data);
  
  return `
    Você é o assistente financeiro IA da Kaizen 🤖. Responda de forma CONCISA, DIRETA e ENVOLVENTE.

    📊 Dados financeiros atuais:
    • Receitas: R$ ${dataSummary.totalReceitas.toLocaleString('pt-BR')}
    • Despesas: R$ ${dataSummary.totalDespesas.toLocaleString('pt-BR')}
    • Lucro: R$ ${dataSummary.lucroLiquido.toLocaleString('pt-BR')}
    • Margem: ${dataSummary.margemLucro.toFixed(1)}%

    ❓ Pergunta: "${userMessage}"

    📝 INSTRUÇÕES IMPORTANTES:
    - Resposta MÁXIMA: 2 parágrafos curtos
    - Use emojis relevantes para o contexto (💰 💸 📈 📉 ⚠️ ✅ 🎯 💡)
    - Seja direto e prático
    - Se a pergunta não for financeira, redirecione educadamente
    - Use português brasileiro coloquial
    - Se for saudação, seja cordial e pergunte como ajudar

    Responda agora:
  `;
}

function prepareDataSummary(data: FinancialData[]) {
  const totalReceitas = data.reduce((sum, item) => sum + item.receita, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesa, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  
  const categorias = data.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = { receita: 0, despesa: 0 };
    }
    acc[item.categoria].receita += item.receita;
    acc[item.categoria].despesa += item.despesa;
    return acc;
  }, {} as Record<string, { receita: number; despesa: number }>);

  const receitasPorMes = data.reduce((acc, item) => {
    const mes = item.date.substring(0, 7); // YYYY-MM
    if (!acc[mes]) acc[mes] = 0;
    acc[mes] += item.receita;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
    categorias,
    receitasPorMes,
    numeroTransacoes: data.length
  };
}

function createAnalysisPrompt(dataSummary: any, analysisType: string) {
  const baseContext = `
    📊 DADOS FINANCEIROS REAIS:
    💰 Receitas: R$ ${dataSummary.totalReceitas.toLocaleString('pt-BR')}
    💸 Despesas: R$ ${dataSummary.totalDespesas.toLocaleString('pt-BR')}
    📈 Lucro: R$ ${dataSummary.lucroLiquido.toLocaleString('pt-BR')}
    📊 Margem: ${dataSummary.margemLucro.toFixed(1)}%
    📋 Transações: ${dataSummary.numeroTransacoes}
    
    🏷️ Categorias:
    ${Object.entries(dataSummary.categorias).map(([cat, valores]: [string, any]) => 
      `• ${cat}: 💰 R$ ${valores.receita.toLocaleString('pt-BR')} | 💸 R$ ${valores.despesa.toLocaleString('pt-BR')}`
    ).join('\n')}
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
      
      📈 Receitas mensais:
      ${Object.entries(dataSummary.receitasPorMes).map(([mes, valor]: [string, any]) => 
        `📅 ${mes}: R$ ${valor.toLocaleString('pt-BR')}`
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

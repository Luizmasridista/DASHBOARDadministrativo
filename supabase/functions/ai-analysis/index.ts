
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
          maxOutputTokens: 1024,
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
    Você é um assistente financeiro especializado da Kaizen. Responda de forma conversacional e direta à pergunta do usuário.

    Contexto dos dados financeiros disponíveis:
    - Total de receitas: R$ ${dataSummary.totalReceitas.toLocaleString('pt-BR')}
    - Total de despesas: R$ ${dataSummary.totalDespesas.toLocaleString('pt-BR')}
    - Lucro líquido: R$ ${dataSummary.lucroLiquido.toLocaleString('pt-BR')}
    - Margem de lucro: ${dataSummary.margemLucro.toFixed(2)}%
    - Categorias principais: ${Object.keys(dataSummary.categorias).join(', ')}

    Pergunta do usuário: "${userMessage}"

    Instruções:
    - Responda de forma direta e conversacional
    - Use os dados financeiros apenas se forem relevantes para a pergunta
    - Mantenha um tom amigável e profissional
    - Se a pergunta não for sobre finanças, responda educadamente redirecionando para análises financeiras
    - Limite sua resposta a 2-3 parágrafos
    - Use português brasileiro
    - Se for uma saudação simples, responda cordialmente e pergunte como pode ajudar

    Responda à pergunta do usuário:
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
    Dados financeiros:
    - Total de receitas: R$ ${dataSummary.totalReceitas.toLocaleString('pt-BR')}
    - Total de despesas: R$ ${dataSummary.totalDespesas.toLocaleString('pt-BR')}
    - Lucro líquido: R$ ${dataSummary.lucroLiquido.toLocaleString('pt-BR')}
    - Margem de lucro: ${dataSummary.margemLucro.toFixed(2)}%
    - Número de transações: ${dataSummary.numeroTransacoes}
    
    Categorias:
    ${Object.entries(dataSummary.categorias).map(([cat, valores]: [string, any]) => 
      `- ${cat}: Receita R$ ${valores.receita.toLocaleString('pt-BR')}, Despesa R$ ${valores.despesa.toLocaleString('pt-BR')}`
    ).join('\n')}
  `;

  switch (analysisType) {
    case 'insights':
      return `${baseContext}
      
      Com base nestes dados financeiros, forneça 3-5 insights estratégicos importantes sobre o desempenho financeiro. 
      Foque em tendências, oportunidades de melhoria e alertas importantes. 
      Seja específico e prático nas recomendações. Responda em português brasileiro.`;

    case 'recommendations':
      return `${baseContext}
      
      Com base nestes dados financeiros, forneça 3-5 recomendações práticas e acionáveis para melhorar o desempenho financeiro.
      Inclua ações específicas que podem ser tomadas no curto e médio prazo.
      Responda em português brasileiro.`;

    case 'trends':
      return `${baseContext}
      
      Receitas por mês:
      ${Object.entries(dataSummary.receitasPorMes).map(([mes, valor]: [string, any]) => 
        `- ${mes}: R$ ${valor.toLocaleString('pt-BR')}`
      ).join('\n')}
      
      Analise as tendências financeiras identificadas nos dados. 
      Destaque padrões sazonais, crescimento/declínio e projeções para os próximos meses.
      Responda em português brasileiro.`;

    case 'risks':
      return `${baseContext}
      
      Identifique 3-5 principais riscos financeiros com base nos dados apresentados.
      Inclua riscos relacionados a concentração de receitas, margem de lucro, fluxo de caixa e categorias problemáticas.
      Para cada risco, sugira uma estratégia de mitigação.
      Responda em português brasileiro.`;

    default:
      return `${baseContext}
      
      Forneça uma análise geral dos dados financeiros apresentados, incluindo insights sobre desempenho, 
      tendências e recomendações estratégicas. Responda em português brasileiro.`;
  }
}

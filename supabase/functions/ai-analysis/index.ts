
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FinancialData } from './types.ts';
import { performAdvancedDataAnalysis } from './dataAnalysis.ts';
import { createEnhancedConversationalPrompt, createEnhancedAnalysisPrompt } from './promptGeneration.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

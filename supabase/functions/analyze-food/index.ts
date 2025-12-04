import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Imagem não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração de API inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Enviando imagem para análise...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em nutrição e análise de alimentos. Analise a imagem da refeição e retorne APENAS um JSON válido (sem markdown, sem explicações) com a seguinte estrutura:
{
  "foods": ["lista de alimentos identificados em português"],
  "food_details": [
    {"name": "nome do alimento", "grams": número estimado de gramas}
  ],
  "nutrition": {
    "calories": número em kcal,
    "carbs": número em gramas,
    "protein": número em gramas,
    "fat": número em gramas,
    "fiber": número em gramas
  },
  "confidence": número entre 0 e 1 indicando sua confiança na análise
}

IMPORTANTE:
- Estime as gramas de cada alimento baseado no tamanho visual aparente na imagem
- Use porções típicas brasileiras como referência
- Se não conseguir identificar a comida claramente, defina confidence abaixo de 0.8
- Seja preciso nas estimativas nutricionais considerando as gramas estimadas`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta refeição. Identifique cada alimento, estime as gramas de cada um, e forneça os valores nutricionais totais estimados.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos na sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao analisar imagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('Resposta da IA:', content);

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Resposta inválida da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response, handling potential markdown code blocks
    let analysisResult;
    try {
      let jsonContent = content.trim();
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      analysisResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ error: 'Não foi possível processar a análise' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!analysisResult.foods || !analysisResult.nutrition || typeof analysisResult.confidence !== 'number') {
      console.error('Estrutura de resposta inválida:', analysisResult);
      return new Response(
        JSON.stringify({ error: 'Estrutura de análise inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure food_details exists, create from foods if missing
    if (!analysisResult.food_details || !Array.isArray(analysisResult.food_details)) {
      analysisResult.food_details = analysisResult.foods.map((food: string) => ({
        name: food,
        grams: 100 // default estimate
      }));
    }

    console.log('Análise concluída com sucesso:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função analyze-food:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
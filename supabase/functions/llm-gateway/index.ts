
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LLMRequest {
  provider: string;
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface ModelConfig {
  name: string;
  provider: string;
  endpoint: string;
  apiKey?: string;
  modelName: string;
  maxTokens: number;
  costPerToken: number;
  isActive: boolean;
}

// Get model configurations from database or fallback to defaults
async function getModelConfigs(): Promise<ModelConfig[]> {
  // TODO: Fetch from Supabase table when implemented
  return [
    {
      name: 'llama3-70b',
      provider: 'self-hosted',
      endpoint: 'http://llama3-70b-service.ai-models.svc.cluster.local:8000',
      modelName: 'meta-llama/Meta-Llama-3-70B-Instruct',
      maxTokens: 4096,
      costPerToken: 0.0,
      isActive: true
    },
    {
      name: 'gemini-2.5-pro',
      provider: 'google',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      modelName: 'gemini-2.5-pro',
      maxTokens: 8192,
      costPerToken: 0.03,
      isActive: !!geminiApiKey
    },
    {
      name: 'mistral-7b',
      provider: 'self-hosted',
      endpoint: 'http://mistral-service.ai-models.svc.cluster.local:8000',
      modelName: 'mistralai/Mistral-7B-Instruct-v0.2',
      maxTokens: 2048,
      costPerToken: 0.0,
      isActive: false
    }
  ];
}

async function callLLaMA(config: ModelConfig, request: LLMRequest): Promise<any> {
  console.log(`Calling LLaMA model at ${config.endpoint}`);
  
  const response = await fetch(`${config.endpoint}/v1/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    },
    body: JSON.stringify({
      model: config.modelName,
      prompt: request.prompt,
      max_tokens: request.maxTokens || 512,
      temperature: request.temperature || 0.7,
      stream: request.stream || false
    })
  });

  if (!response.ok) {
    throw new Error(`LLaMA API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.text || '',
    tokens: data.usage?.total_tokens || 0,
    model: config.modelName
  };
}

async function callGemini(config: ModelConfig, request: LLMRequest): Promise<any> {
  console.log(`Calling Gemini model`);
  
  const response = await fetch(`${config.endpoint}/gemini-2.5-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 512
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    text,
    tokens: Math.ceil(text.length / 4), // Rough estimation
    model: config.modelName
  };
}

async function callMistral(config: ModelConfig, request: LLMRequest): Promise<any> {
  console.log(`Calling Mistral model at ${config.endpoint}`);
  
  const response = await fetch(`${config.endpoint}/v1/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    },
    body: JSON.stringify({
      model: config.modelName,
      prompt: request.prompt,
      max_tokens: request.maxTokens || 512,
      temperature: request.temperature || 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.text || '',
    tokens: data.usage?.total_tokens || 0,
    model: config.modelName
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, prompt, maxTokens, temperature, stream }: LLMRequest = await req.json();

    if (!provider || !model || !prompt) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: provider, model, prompt' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`LLM Gateway request: ${provider}/${model}`);

    // Get available model configurations
    const configs = await getModelConfigs();
    const config = configs.find(c => c.name === model || c.modelName === model);

    if (!config) {
      return new Response(JSON.stringify({ 
        error: `Model ${model} not found or not configured` 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!config.isActive) {
      return new Response(JSON.stringify({ 
        error: `Model ${model} is not active` 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let result;
    const startTime = Date.now();

    // Route to appropriate model implementation
    switch (config.provider) {
      case 'self-hosted':
        if (config.modelName.includes('llama')) {
          result = await callLLaMA(config, { provider, model, prompt, maxTokens, temperature, stream });
        } else if (config.modelName.includes('mistral')) {
          result = await callMistral(config, { provider, model, prompt, maxTokens, temperature, stream });
        } else {
          throw new Error(`Unsupported self-hosted model: ${config.modelName}`);
        }
        break;
      case 'google':
        result = await callGemini(config, { provider, model, prompt, maxTokens, temperature, stream });
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    const latency = Date.now() - startTime;
    const cost = result.tokens * config.costPerToken / 1000;

    // Log the request for analytics
    await supabase.from('audit_logs').insert({
      action: 'llm_request',
      resource_type: 'model',
      resource_id: config.name,
      details: {
        provider: config.provider,
        model: config.modelName,
        tokens: result.tokens,
        cost,
        latency,
        prompt_length: prompt.length
      }
    });

    return new Response(JSON.stringify({
      success: true,
      text: result.text,
      tokens: result.tokens,
      model: result.model,
      cost,
      latency,
      provider: config.provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('LLM Gateway error:', error);
    return new Response(JSON.stringify({ 
      error: 'LLM request failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const checks = [];

  try {
    // Database connectivity check
    const dbCheck = await checkDatabase();
    checks.push({ name: 'database', status: dbCheck.status, details: dbCheck.details });

    // Authentication service check
    const authCheck = await checkAuth();
    checks.push({ name: 'auth', status: authCheck.status, details: authCheck.details });

    // External API checks
    const openaiCheck = await checkOpenAI();
    checks.push({ name: 'openai', status: openaiCheck.status, details: openaiCheck.details });

    // Knowledge base check
    const kbCheck = await checkKnowledgeBase();
    checks.push({ name: 'knowledge_base', status: kbCheck.status, details: kbCheck.details });

    // Rate limiter check
    const rateLimitCheck = await checkRateLimit();
    checks.push({ name: 'rate_limiter', status: rateLimitCheck.status, details: rateLimitCheck.details });

    const endTime = Date.now();
    const overall = checks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded';
    const hasFailure = checks.some(check => check.status === 'failed');

    const response = {
      status: hasFailure ? 'failed' : overall,
      timestamp: new Date().toISOString(),
      response_time_ms: endTime - startTime,
      version: '1.0.0',
      checks: checks,
      environment: Deno.env.get('ENVIRONMENT') || 'development'
    };

    const statusCode = hasFailure ? 503 : 200;

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({
      status: 'failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: checks
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function checkDatabase() {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('requirement_sessions')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      details: {
        response_time_ms: Date.now() - start,
        connection: 'ok'
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      details: {
        error: error.message
      }
    };
  }
}

async function checkAuth() {
  try {
    const start = Date.now();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    if (error) throw error;

    return {
      status: 'healthy',
      details: {
        response_time_ms: Date.now() - start,
        service: 'auth'
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      details: {
        error: error.message
      }
    };
  }
}

async function checkOpenAI() {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    return {
      status: 'degraded',
      details: {
        error: 'OpenAI API key not configured'
      }
    };
  }

  try {
    const start = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return {
      status: 'healthy',
      details: {
        response_time_ms: Date.now() - start,
        api_status: 'ok'
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      details: {
        error: error.message
      }
    };
  }
}

async function checkKnowledgeBase() {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      details: {
        response_time_ms: Date.now() - start,
        documents_table: 'ok'
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      details: {
        error: error.message
      }
    };
  }
}

async function checkRateLimit() {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('rate_limit_requests')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      details: {
        response_time_ms: Date.now() - start,
        rate_limit_table: 'ok'
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      details: {
        error: error.message
      }
    };
  }
}

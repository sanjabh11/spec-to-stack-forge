
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StartSessionRequest {
  domain: string;
  projectId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, projectId }: StartSessionRequest = await req.json();

    console.log('Starting requirement session:', { domain, projectId });

    // Create new requirement session
    const { data: session, error: sessionError } = await supabase
      .from('requirement_sessions')
      .insert({
        domain,
        project_id: projectId,
        status: 'active',
        session_data: {
          domain,
          started_at: new Date().toISOString(),
          llm_provider: 'gemini'
        }
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log session start
    await supabase
      .from('audit_logs')
      .insert({
        action: 'session_started',
        resource_type: 'requirement_session',
        resource_id: session.id,
        details: {
          domain,
          projectId
        }
      });

    // Get first question for the domain
    const firstQuestion = getFirstQuestionForDomain(domain);

    return new Response(JSON.stringify({
      sessionId: session.id,
      domain,
      firstQuestion
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error starting session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getFirstQuestionForDomain(domain: string): any {
  const domainQuestions: Record<string, any> = {
    'Legal': {
      id: 0,
      question: "What specific legal problem are you trying to solve? (e.g., contract analysis, compliance monitoring, legal research)",
      field: "objective"
    },
    'Finance': {
      id: 0,
      question: "What specific financial problem are you trying to solve? (e.g., risk assessment, fraud detection, financial planning)",
      field: "objective"
    },
    'Healthcare': {
      id: 0,
      question: "What specific healthcare problem are you trying to solve? Please specify if this is for EMR systems, clinical trials, diagnostics, or patient management.",
      field: "objective"
    },
    'Human Resources': {
      id: 0,
      question: "What specific HR challenge are you trying to solve? (e.g., recruitment automation, performance analysis, employee engagement)",
      field: "objective"
    },
    'Customer Support': {
      id: 0,
      question: "What specific customer support problem are you trying to solve? (e.g., ticket automation, sentiment analysis, knowledge base)",
      field: "objective"
    }
  };

  return domainQuestions[domain] || domainQuestions['Legal'];
}

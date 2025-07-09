
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, answers, action } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('requirement_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'complete') {
      // Generate specification based on answers
      const specification = generateSpecification(session.domain, answers);
      const recommendations = generateRecommendations(session.domain, answers);

      // Update session as completed
      const { error: updateError } = await supabase
        .from('requirement_sessions')
        .update({
          status: 'completed',
          session_data: {
            ...session.session_data,
            answers,
            specification,
            recommendations,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Update session error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to complete session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          sessionId,
          specification,
          recommendations,
          status: 'completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other actions, just update the session data
    const { error: updateError } = await supabase
      .from('requirement_sessions')
      .update({
        session_data: {
          ...session.session_data,
          answers,
          last_updated: new Date().toISOString()
        }
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Update session error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process requirement error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSpecification(domain: string, answers: Record<string, any>) {
  const baseSpec = {
    domain,
    version: "1.0",
    generated_at: new Date().toISOString(),
    requirements: answers
  };

  // Domain-specific specification generation
  switch (domain) {
    case 'HR':
      return {
        ...baseSpec,
        architecture: {
          components: ['HR Bot', 'Policy Database', 'Employee Portal', 'Analytics Dashboard'],
          integrations: answers.integration_systems || [],
          compliance: answers.compliance_requirements || []
        },
        infrastructure: {
          estimated_users: answers.employee_count,
          budget: answers.budget_range,
          deployment: 'cloud-native'
        }
      };

    case 'Finance':
      return {
        ...baseSpec,
        architecture: {
          components: ['Financial AI Assistant', 'Transaction Processor', 'Risk Engine', 'Reporting Dashboard'],
          integrations: answers.financial_systems || [],
          compliance: answers.regulatory_requirements || []
        },
        infrastructure: {
          transaction_volume: answers.transaction_volume,
          security_level: 'high',
          deployment: 'hybrid'
        }
      };

    case 'Legal':
      return {
        ...baseSpec,
        architecture: {
          components: ['Legal Research AI', 'Document Analyzer', 'Contract Parser', 'Case Management'],
          practice_areas: answers.practice_areas || [],
          document_volume: answers.document_volume
        },
        infrastructure: {
          security_level: 'maximum',
          deployment: 'private-cloud',
          compliance: ['attorney-client-privilege', 'data-sovereignty']
        }
      };

    default:
      return baseSpec;
  }
}

function generateRecommendations(domain: string, answers: Record<string, any>) {
  const baseRecommendations = [
    "Implement strong authentication and authorization",
    "Set up comprehensive audit logging",
    "Configure automated backups and disaster recovery"
  ];

  // Domain-specific recommendations
  const domainRecommendations: Record<string, string[]> = {
    'HR': [
      "Integrate with existing HRIS systems for seamless data flow",
      "Implement role-based access control for sensitive employee data",
      "Set up automated compliance monitoring for labor regulations"
    ],
    'Finance': [
      "Implement multi-layer security for financial data protection",
      "Set up real-time fraud detection and alerting",
      "Configure automated regulatory reporting"
    ],
    'Legal': [
      "Implement attorney-client privilege protection mechanisms",
      "Set up secure document version control",
      "Configure conflict of interest checking"
    ]
  };

  return [
    ...baseRecommendations,
    ...(domainRecommendations[domain] || [])
  ];
}

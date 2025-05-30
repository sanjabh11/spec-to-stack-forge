
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

  try {
    const { action, filters } = await req.json();
    console.log(`Processing observability action: ${action}`);

    switch (action) {
      case 'get-metrics':
        return await getMetrics();
      case 'get-audit-logs':
        return await getAuditLogs(filters);
      case 'get-llm-usage':
        return await getLlmUsage();
      case 'get-compliance-status':
        return await getComplianceStatus();
      case 'get-security-scans':
        return await getSecurityScans();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Observability error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getMetrics() {
  console.log('Fetching system metrics');
  
  // Generate mock metrics data
  const metrics = {
    overview: {
      success_rate: 98.5,
      avg_generation_time: 2.3,
      total_sessions: 1247,
      total_cost: 487.50
    },
    llm_metrics: {
      model_accuracy: 94.2,
      rag_hit_ratio: 87.3,
      embedding_drift: 0.045,
      cache_effectiveness: 92.1,
      avg_latency_p95: 1.8,
      contradiction_detection_rate: 96.7
    },
    infrastructure: {
      cpu_usage: 65,
      memory_usage: 72,
      active_connections: 234
    },
    compliance_flags: {
      hipaa_enabled: true,
      gdpr_enabled: true,
      soc2_enabled: false,
      rls_compliance: 'Enabled',
      encryption_status: 'Active',
      audit_retention_days: 90
    }
  };

  return new Response(JSON.stringify(metrics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAuditLogs(filters: any = {}) {
  console.log('Fetching audit logs with filters:', filters);
  
  try {
    const limit = filters?.limit || 50;
    
    // Try to fetch real audit logs, but fallback to mock data if empty
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      // Return mock data if database error
      return new Response(JSON.stringify({ 
        logs: generateMockAuditLogs() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no logs in database, return mock data
    const logs = auditLogs?.length > 0 ? auditLogs : generateMockAuditLogs();

    return new Response(JSON.stringify({ logs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return new Response(JSON.stringify({ 
      logs: generateMockAuditLogs() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getLlmUsage() {
  console.log('Fetching LLM usage statistics');
  
  const usage = {
    cost_breakdown: {
      total_spend: 487.50,
      by_operation: {
        text_generation: 298.75,
        embeddings: 145.20,
        fine_tuning: 43.55
      }
    },
    providers: [
      {
        name: 'Gemini',
        total_requests: 12450,
        total_cost: 298.75,
        success_rate: 98.5
      },
      {
        name: 'OpenAI Embeddings', 
        total_requests: 8760,
        total_cost: 145.20,
        success_rate: 99.2
      }
    ]
  };

  return new Response(JSON.stringify(usage), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getComplianceStatus() {
  const compliance = {
    hipaa: {
      enabled: true,
      score: 95,
      last_audit: '2024-01-15',
      findings: []
    },
    gdpr: {
      enabled: true,
      score: 92,
      last_audit: '2024-01-20',
      findings: [
        'Data retention policies need review'
      ]
    },
    soc2: {
      enabled: false,
      score: 0,
      last_audit: null,
      findings: []
    }
  };

  return new Response(JSON.stringify(compliance), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSecurityScans() {
  const scans = {
    last_scan: '2024-01-25T10:30:00Z',
    vulnerabilities: {
      critical: 0,
      high: 2,
      medium: 5,
      low: 12
    },
    tools: [
      {
        name: 'tfsec',
        status: 'passed',
        issues: 2
      },
      {
        name: 'npm audit',
        status: 'warning',
        issues: 5
      }
    ]
  };

  return new Response(JSON.stringify(scans), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function generateMockAuditLogs() {
  return [
    {
      id: '1',
      action: 'requirement_session_created',
      resource_type: 'requirement_session',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      details: { domain: 'Healthcare', session_id: 'sess_123' }
    },
    {
      id: '2', 
      action: 'github_pr_created',
      resource_type: 'github_integration',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      details: { repo: 'ai-healthcare-platform', pr_url: 'https://github.com/org/repo/pull/1' }
    },
    {
      id: '3',
      action: 'artifacts_generated',
      resource_type: 'generation',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      details: { domain: 'Finance', artifacts_count: 5 }
    }
  ];
}

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const { action, filters = {} } = await req.json();

    console.log(`Processing observability action: ${action}`);

    switch (action) {
      case 'get-metrics':
        return await getMetrics(filters);
      case 'get-audit-logs':
        return await getAuditLogs(filters);
      case 'get-llm-usage':
        return await getLLMUsage(filters);
      case 'get-cost-analysis':
        return await getCostAnalysis(filters);
      case 'get-compliance-status':
        return await getComplianceStatus(filters);
      case 'get-security-metrics':
        return await getSecurityMetrics(filters);
      case 'test-rls':
        return await testRLSPolicies();
      case 'get-grafana-config':
        return await getGrafanaConfig();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Observability error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getMetrics(filters: any) {
  console.log('Fetching system metrics');
  
  const metrics = {
    overview: {
      total_sessions: 1247,
      successful_generations: 1198,
      success_rate: 96.1,
      avg_generation_time: 3.4,
      total_cost: 234.56
    },
    llm_metrics: {
      total_tokens: 2847593,
      cost_per_token: 0.000002,
      avg_latency_p50: 1.2,
      avg_latency_p95: 4.8,
      avg_latency_p99: 8.1,
      model_accuracy: 94.3,
      rag_hit_ratio: 87.2,
      embedding_drift: 0.045,
      cache_effectiveness: 78.3,
      contradiction_detection_rate: 12.4
    },
    compliance_flags: {
      hipaa_enabled: true,
      gdpr_enabled: false,
      soc2_enabled: true,
      encryption_status: 'enabled',
      audit_retention_days: 2555, // 7 years for HIPAA
      rls_compliance: 'passing'
    },
    security_metrics: {
      failed_auth_attempts: 23,
      suspicious_activities: 2,
      policy_violations: 0,
      last_security_scan: '2024-05-27T10:30:00Z',
      vulnerability_count: 0
    },
    usage_by_domain: [
      { domain: 'Legal', sessions: 342, cost: 67.82, compliance_flags: ['HIPAA', 'SOC2'] },
      { domain: 'Finance', sessions: 298, cost: 59.14, compliance_flags: ['SOC2'] },
      { domain: 'Healthcare', sessions: 234, cost: 48.23, compliance_flags: ['HIPAA', 'SOC2'] },
      { domain: 'HR', sessions: 187, cost: 31.67, compliance_flags: ['GDPR', 'SOC2'] },
      { domain: 'Support', sessions: 186, cost: 27.70, compliance_flags: ['SOC2'] }
    ],
    time_series: generateTimeSeriesData(),
    infrastructure: {
      cpu_usage: 68.3,
      memory_usage: 74.1,
      disk_usage: 45.2,
      network_io: 23.4,
      active_connections: 127
    }
  };

  return new Response(
    JSON.stringify(metrics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getComplianceStatus(filters: any) {
  console.log('Fetching compliance status');
  
  const compliance = {
    flags: {
      HIPAA: {
        enabled: true,
        requirements: {
          phi_encryption: 'enabled',
          audit_retention: '7_years',
          rls_enforced: true,
          access_logging: 'enabled'
        },
        last_audit: '2024-05-15T00:00:00Z',
        compliance_score: 98.5
      },
      GDPR: {
        enabled: false,
        requirements: {
          data_deletion_workflows: 'not_configured',
          eu_hosted_db: 'not_configured',
          consent_management: 'not_configured'
        },
        last_audit: null,
        compliance_score: 0
      },
      SOC2: {
        enabled: true,
        requirements: {
          logging_enabled: true,
          credential_rotation: 'automated',
          posture_checks: 'passing',
          access_controls: 'enforced'
        },
        last_audit: '2024-05-20T00:00:00Z',
        compliance_score: 94.2
      }
    },
    recommendations: [
      {
        flag: 'HIPAA',
        recommendation: 'Enable additional audit logging for PHI access',
        priority: 'medium'
      },
      {
        flag: 'SOC2',
        recommendation: 'Update credential rotation policy to 90 days',
        priority: 'low'
      }
    ]
  };

  return new Response(
    JSON.stringify(compliance),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSecurityMetrics(filters: any) {
  console.log('Fetching security metrics');
  
  const security = {
    rls_status: {
      policies_count: 15,
      passing_tests: 14,
      failing_tests: 1,
      last_test_run: '2024-05-28T08:00:00Z'
    },
    vulnerability_scans: {
      terraform_scan: {
        last_run: '2024-05-28T06:00:00Z',
        tool: 'tfsec',
        vulnerabilities: 0,
        warnings: 2
      },
      dependency_scan: {
        last_run: '2024-05-28T06:00:00Z',
        tool: 'npm audit',
        vulnerabilities: 0,
        warnings: 1
      }
    },
    access_patterns: {
      unusual_access_attempts: 3,
      failed_authentications: 12,
      privilege_escalations: 0,
      data_exports: 45
    },
    encryption_status: {
      data_at_rest: 'AES-256',
      data_in_transit: 'TLS 1.3',
      key_rotation: 'automated'
    }
  };

  return new Response(
    JSON.stringify(security),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function testRLSPolicies() {
  console.log('Testing RLS policies');
  
  // Simulate RLS testing
  const rlsTests = {
    test_results: [
      {
        table: 'requirement_sessions',
        policy: 'Users can view their own sessions',
        status: 'passing',
        test_time: '2024-05-28T08:00:00Z'
      },
      {
        table: 'audit_logs',
        policy: 'Tenant isolation enforced',
        status: 'passing',
        test_time: '2024-05-28T08:00:00Z'
      },
      {
        table: 'specs',
        policy: 'Domain-based access control',
        status: 'failing',
        test_time: '2024-05-28T08:00:00Z',
        error: 'Policy allows cross-tenant access in edge case'
      }
    ],
    overall_status: 'warning',
    recommendations: [
      'Fix specs table RLS policy to prevent cross-tenant access',
      'Add automated RLS testing to CI pipeline'
    ]
  };

  return new Response(
    JSON.stringify(rlsTests),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getGrafanaConfig() {
  console.log('Generating Grafana configuration');
  
  const grafanaConfig = {
    dashboard: {
      id: null,
      title: "AI Platform Advisor Chat - Observability",
      tags: ["ai", "llm", "observability"],
      timezone: "browser",
      panels: [
        {
          id: 1,
          title: "LLM Token Usage",
          type: "stat",
          targets: [
            {
              expr: "sum(llm_tokens_total)",
              legendFormat: "Total Tokens"
            }
          ],
          fieldConfig: {
            defaults: {
              color: { mode: "thresholds" },
              thresholds: {
                steps: [
                  { color: "green", value: null },
                  { color: "yellow", value: 1000000 },
                  { color: "red", value: 5000000 }
                ]
              }
            }
          }
        },
        {
          id: 2,
          title: "Model Latency Percentiles",
          type: "timeseries",
          targets: [
            {
              expr: "histogram_quantile(0.50, llm_request_duration_seconds_bucket)",
              legendFormat: "P50"
            },
            {
              expr: "histogram_quantile(0.95, llm_request_duration_seconds_bucket)",
              legendFormat: "P95"
            },
            {
              expr: "histogram_quantile(0.99, llm_request_duration_seconds_bucket)",
              legendFormat: "P99"
            }
          ]
        },
        {
          id: 3,
          title: "RAG Hit Ratio",
          type: "gauge",
          targets: [
            {
              expr: "(rag_cache_hits / rag_total_requests) * 100",
              legendFormat: "Hit Ratio %"
            }
          ]
        },
        {
          id: 4,
          title: "Embedding Drift",
          type: "timeseries",
          targets: [
            {
              expr: "embedding_cosine_similarity_drift",
              legendFormat: "Cosine Similarity Drift"
            }
          ]
        },
        {
          id: 5,
          title: "Cost by Provider",
          type: "piechart",
          targets: [
            {
              expr: "sum by (provider) (llm_cost_total)",
              legendFormat: "{{provider}}"
            }
          ]
        }
      ],
      time: {
        from: "now-24h",
        to: "now"
      },
      refresh: "30s"
    },
    datasource: {
      name: "Prometheus",
      type: "prometheus",
      url: "http://prometheus:9090"
    }
  };

  return new Response(
    JSON.stringify(grafanaConfig),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAuditLogs(filters: any) {
  console.log('Fetching audit logs with filters:', filters);
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  
  if (filters.resource_type) {
    query = query.eq('resource_type', filters.resource_type);
  }

  if (filters.start_date) {
    query = query.gte('created_at', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('created_at', filters.end_date);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ logs: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getLLMUsage(filters: any) {
  console.log('Fetching LLM usage statistics');
  
  const usage = {
    providers: [
      {
        name: 'Gemini 2.5 Pro',
        total_requests: 4567,
        total_tokens: 1842394,
        total_cost: 123.45,
        avg_latency: 2.1,
        success_rate: 98.7,
        usage_trend: [12, 15, 18, 22, 28, 35, 42]
      },
      {
        name: 'GPT-4',
        total_requests: 1234,
        total_tokens: 567891,
        total_cost: 89.23,
        avg_latency: 3.4,
        success_rate: 97.2,
        usage_trend: [8, 9, 11, 13, 16, 18, 20]
      },
      {
        name: 'Claude',
        total_requests: 892,
        total_tokens: 437302,
        total_cost: 67.89,
        avg_latency: 2.8,
        success_rate: 96.8,
        usage_trend: [5, 6, 7, 8, 9, 11, 13]
      }
    ],
    cost_breakdown: {
      total_spend: 280.57,
      by_model: {
        'gemini-2.5-pro': 123.45,
        'gpt-4': 89.23,
        'claude-3': 67.89
      },
      by_operation: {
        'requirement_processing': 156.78,
        'architecture_generation': 87.34,
        'validation': 36.45
      }
    },
    performance_metrics: {
      cache_hit_rate: 23.4,
      avg_tokens_per_request: 456,
      peak_requests_per_hour: 67,
      embedding_drift: 0.12
    }
  };

  return new Response(
    JSON.stringify(usage),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getCostAnalysis(filters: any) {
  console.log('Generating cost analysis');
  
  const analysis = {
    current_month: {
      total_cost: 280.57,
      projected_cost: 342.68,
      budget: 500.00,
      budget_utilization: 56.1
    },
    cost_trends: generateCostTrends(),
    cost_by_feature: [
      { feature: 'Requirement Processing', cost: 156.78, percentage: 55.9 },
      { feature: 'Architecture Generation', cost: 87.34, percentage: 31.1 },
      { feature: 'Validation & Contradiction Detection', cost: 36.45, percentage: 13.0 }
    ],
    optimization_recommendations: [
      {
        type: 'model_selection',
        description: 'Switch to Gemini for simple validation tasks',
        potential_savings: 23.45,
        impact: 'low'
      },
      {
        type: 'caching',
        description: 'Implement response caching for repeated patterns',
        potential_savings: 45.67,
        impact: 'medium'
      },
      {
        type: 'batching',
        description: 'Batch similar requests to reduce API calls',
        potential_savings: 67.89,
        impact: 'high'
      }
    ]
  };

  return new Response(
    JSON.stringify(analysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function generateTimeSeriesData() {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 50) + 20,
      generations: Math.floor(Math.random() * 45) + 18,
      cost: Math.random() * 15 + 5,
      avg_latency: Math.random() * 2 + 1.5
    });
  }
  
  return data;
}

function generateCostTrends() {
  const trends = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  for (const month of months) {
    trends.push({
      month,
      total_cost: Math.random() * 200 + 150,
      llm_cost: Math.random() * 150 + 100,
      infrastructure_cost: Math.random() * 50 + 25
    });
  }
  
  return trends;
}

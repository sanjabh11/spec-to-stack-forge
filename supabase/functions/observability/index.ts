
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
  
  // Generate sample metrics (in production, this would come from actual monitoring)
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
      rag_hit_ratio: 87.2
    },
    usage_by_domain: [
      { domain: 'Legal', sessions: 342, cost: 67.82 },
      { domain: 'Finance', sessions: 298, cost: 59.14 },
      { domain: 'Healthcare', sessions: 234, cost: 48.23 },
      { domain: 'HR', sessions: 187, cost: 31.67 },
      { domain: 'Support', sessions: 186, cost: 27.70 }
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
  
  // In production, this would query actual usage data
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hardcoded unit costs (will migrate to DB later)
const UNIT_COSTS = {
  // Storage costs per GB/month
  storage_standard: 0.023,
  storage_archive: 0.002,
  storage_premium: 0.045,
  
  // VM/Infrastructure costs per month
  vm_api_small: 15.0,    // 2 vCPU, 4GB RAM
  vm_api_medium: 45.0,   // 4 vCPU, 8GB RAM
  vm_api_large: 120.0,   // 8 vCPU, 16GB RAM
  
  // Workflow automation
  n8n_basic: 10.0,
  n8n_pro: 25.0,
  
  // Bandwidth per GB
  bandwidth: 0.09,
  
  // GPU costs per hour
  gpu_t4: 0.35,     // NVIDIA T4
  gpu_a100: 2.50,   // NVIDIA A100
  gpu_h100: 4.20,   // NVIDIA H100
}

// Model token costs per 1K tokens
const MODEL_TOKEN_COSTS = {
  'gemini-2.5': 0.03,
  'gpt-4': 0.06,
  'gpt-3.5-turbo': 0.002,
  'claude-3': 0.015,
  'llama3-70b': 0.00,    // self-hosted
  'mistral-large': 0.008,
  'local-model': 0.00,   // self-hosted
}

interface CostEstimateInput {
  data_volume_gb: number
  throughput_qps: number
  concurrent_users: number
  model: string
  vector_store: string
  gpu_type: string
  gpu_count: number
  gpu_hours_per_day: number
  storage_class: string
  bandwidth_gb: number
  vm_size: string
  n8n_tier: string
  compliance_requirements?: string[]
  domain?: string
}

interface CostEstimateOutput {
  line_items: Record<string, number>
  total_monthly_cost: number
  recommendations: string[]
  breakdown_by_category: Record<string, number>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    if (req.method === 'POST') {
      const input: CostEstimateInput = await req.json()
      
      console.log('Cost estimation request:', input)
      
      // Validate input
      if (!input.data_volume_gb || input.data_volume_gb <= 0) {
        throw new Error('Invalid data volume')
      }
      if (!input.throughput_qps || input.throughput_qps <= 0) {
        throw new Error('Invalid throughput')
      }

      const lineItems: Record<string, number> = {}
      const recommendations: string[] = []

      // 1. Storage costs
      const storageKey = `storage_${input.storage_class}` as keyof typeof UNIT_COSTS
      const storageCostPerGB = UNIT_COSTS[storageKey]
      if (!storageCostPerGB) {
        throw new Error(`Unknown storage class: ${input.storage_class}`)
      }
      lineItems['Storage'] = Math.round(input.data_volume_gb * storageCostPerGB * 100) / 100

      // 2. VM/Infrastructure costs
      const vmKey = `vm_api_${input.vm_size}` as keyof typeof UNIT_COSTS
      const vmCost = UNIT_COSTS[vmKey]
      if (!vmCost) {
        throw new Error(`Unknown VM size: ${input.vm_size}`)
      }
      lineItems['Infrastructure (VM)'] = vmCost

      // 3. Workflow automation (n8n)
      const n8nKey = `n8n_${input.n8n_tier}` as keyof typeof UNIT_COSTS
      const n8nCost = UNIT_COSTS[n8nKey]
      if (!n8nCost) {
        throw new Error(`Unknown n8n tier: ${input.n8n_tier}`)
      }
      lineItems['Automation (n8n)'] = n8nCost

      // 4. GPU costs
      if (input.gpu_count > 0) {
        const gpuKey = `gpu_${input.gpu_type}` as keyof typeof UNIT_COSTS
        const gpuCostPerHour = UNIT_COSTS[gpuKey]
        if (!gpuCostPerHour) {
          throw new Error(`Unknown GPU type: ${input.gpu_type}`)
        }
        const monthlyGpuCost = input.gpu_count * input.gpu_hours_per_day * gpuCostPerHour * 30
        lineItems['GPU Resources'] = Math.round(monthlyGpuCost * 100) / 100
        
        if (input.gpu_hours_per_day > 12) {
          recommendations.push('Consider using spot instances for GPU workloads to reduce costs by 60-90%')
        }
      }

      // 5. Bandwidth costs
      lineItems['Bandwidth'] = Math.round(input.bandwidth_gb * UNIT_COSTS.bandwidth * 100) / 100

      // 6. Model token costs (for cloud models)
      const tokenCostPer1K = MODEL_TOKEN_COSTS[input.model as keyof typeof MODEL_TOKEN_COSTS] || 0
      if (tokenCostPer1K > 0) {
        // Estimate: throughput_qps * concurrent_users * average_tokens_per_query * hours * days
        const avgTokensPerQuery = 1000 // assumption
        const monthlyTokens = input.throughput_qps * input.concurrent_users * avgTokensPerQuery * 24 * 30
        const tokenCostMonthly = (monthlyTokens / 1000) * tokenCostPer1K
        lineItems[`Model (${input.model})`] = Math.round(tokenCostMonthly * 100) / 100
      }

      // 7. Vector store costs (simplified)
      const vectorStoreCost = input.data_volume_gb * 0.1 // $0.10 per GB for vector storage
      lineItems['Vector Database'] = Math.round(vectorStoreCost * 100) / 100

      // 8. Compliance costs (if applicable)
      if (input.compliance_requirements && input.compliance_requirements.length > 0) {
        const complianceCost = input.compliance_requirements.length * 50 // $50 per compliance requirement
        lineItems['Compliance & Security'] = complianceCost
        recommendations.push('Compliance requirements may require additional security measures and certifications')
      }

      // Calculate total
      const totalCost = Object.values(lineItems).reduce((sum, cost) => sum + cost, 0)

      // Generate recommendations
      if (totalCost > 500) {
        recommendations.push('Consider optimizing your configuration to reduce costs')
      }
      if (input.data_volume_gb > 100) {
        recommendations.push('For large datasets, consider using archive storage for infrequently accessed data')
      }
      if (input.throughput_qps > 100) {
        recommendations.push('High throughput may benefit from auto-scaling and load balancing')
      }

      // Breakdown by category
      const breakdown = {
        'Infrastructure': (lineItems['Infrastructure (VM)'] || 0) + (lineItems['GPU Resources'] || 0),
        'Storage & Data': (lineItems['Storage'] || 0) + (lineItems['Vector Database'] || 0),
        'AI Models': lineItems[`Model (${input.model})`] || 0,
        'Operations': (lineItems['Automation (n8n)'] || 0) + (lineItems['Bandwidth'] || 0),
        'Compliance': lineItems['Compliance & Security'] || 0,
      }

      const result: CostEstimateOutput = {
        line_items: lineItems,
        total_monthly_cost: Math.round(totalCost * 100) / 100,
        recommendations,
        breakdown_by_category: breakdown,
      }

      // Log the estimate for analytics
      try {
        await supabaseClient.from('cost_estimates').insert({
          input_data: input,
          estimated_cost: result.total_monthly_cost,
          domain: input.domain || 'unknown',
          created_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.warn('Failed to log cost estimate:', logError)
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Cost estimation error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

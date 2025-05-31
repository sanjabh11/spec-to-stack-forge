
export interface CostEstimateInput {
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

export interface CostEstimateOutput {
  line_items: Record<string, number>
  total_monthly_cost: number
  recommendations: string[]
  breakdown_by_category: Record<string, number>
}

// Client-side cost estimation for real-time feedback
export function estimateCostClientSide(input: CostEstimateInput): CostEstimateOutput {
  const UNIT_COSTS = {
    storage_standard: 0.023,
    storage_archive: 0.002,
    storage_premium: 0.045,
    vm_api_small: 15.0,
    vm_api_medium: 45.0,
    vm_api_large: 120.0,
    n8n_basic: 10.0,
    n8n_pro: 25.0,
    bandwidth: 0.09,
    gpu_t4: 0.35,
    gpu_a100: 2.50,
    gpu_h100: 4.20,
  }

  const MODEL_TOKEN_COSTS = {
    'gemini-2.5': 0.03,
    'gpt-4': 0.06,
    'gpt-3.5-turbo': 0.002,
    'claude-3': 0.015,
    'llama3-70b': 0.00,
    'mistral-large': 0.008,
    'local-model': 0.00,
  }

  const lineItems: Record<string, number> = {}

  // Storage
  const storageCost = input.data_volume_gb * (UNIT_COSTS[`storage_${input.storage_class}` as keyof typeof UNIT_COSTS] || 0.023)
  lineItems['Storage'] = Math.round(storageCost * 100) / 100

  // VM
  lineItems['Infrastructure (VM)'] = UNIT_COSTS[`vm_api_${input.vm_size}` as keyof typeof UNIT_COSTS] || 15

  // n8n
  lineItems['Automation (n8n)'] = UNIT_COSTS[`n8n_${input.n8n_tier}` as keyof typeof UNIT_COSTS] || 10

  // GPU
  if (input.gpu_count > 0) {
    const gpuCostPerHour = UNIT_COSTS[`gpu_${input.gpu_type}` as keyof typeof UNIT_COSTS] || 2.50
    const monthlyGpuCost = input.gpu_count * input.gpu_hours_per_day * gpuCostPerHour * 30
    lineItems['GPU Resources'] = Math.round(monthlyGpuCost * 100) / 100
  }

  // Bandwidth
  lineItems['Bandwidth'] = Math.round(input.bandwidth_gb * UNIT_COSTS.bandwidth * 100) / 100

  // Model tokens
  const tokenCostPer1K = MODEL_TOKEN_COSTS[input.model as keyof typeof MODEL_TOKEN_COSTS] || 0
  if (tokenCostPer1K > 0) {
    const monthlyTokens = input.throughput_qps * input.concurrent_users * 1000 * 24 * 30
    const tokenCostMonthly = (monthlyTokens / 1000) * tokenCostPer1K
    lineItems[`Model (${input.model})`] = Math.round(tokenCostMonthly * 100) / 100
  }

  // Vector store
  lineItems['Vector Database'] = Math.round(input.data_volume_gb * 0.1 * 100) / 100

  // Compliance
  if (input.compliance_requirements && input.compliance_requirements.length > 0) {
    lineItems['Compliance & Security'] = input.compliance_requirements.length * 50
  }

  const totalCost = Object.values(lineItems).reduce((sum, cost) => sum + cost, 0)

  const breakdown = {
    'Infrastructure': (lineItems['Infrastructure (VM)'] || 0) + (lineItems['GPU Resources'] || 0),
    'Storage & Data': (lineItems['Storage'] || 0) + (lineItems['Vector Database'] || 0),
    'AI Models': lineItems[`Model (${input.model})`] || 0,
    'Operations': (lineItems['Automation (n8n)'] || 0) + (lineItems['Bandwidth'] || 0),
    'Compliance': lineItems['Compliance & Security'] || 0,
  }

  return {
    line_items: lineItems,
    total_monthly_cost: Math.round(totalCost * 100) / 100,
    recommendations: [],
    breakdown_by_category: breakdown,
  }
}

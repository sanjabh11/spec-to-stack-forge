
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Simulate executive metrics
    const metrics = {
      latency: Math.floor(Math.random() * 200) + 200, // 200-400ms
      chatCount: Math.floor(Math.random() * 1000) + 5000, // 5000-6000
      cost: Math.floor(Math.random() * 5000) + 15000, // $15k-20k
      budget: 25000, // $25k budget
      accuracy: Math.floor(Math.random() * 15) + 85, // 85-100%
      userSatisfaction: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
      activeUsers: Math.floor(Math.random() * 100) + 250, // 250-350
      completionRate: Math.floor(Math.random() * 10) + 90, // 90-100%
      costTrend: Math.floor(Math.random() * 20) - 10, // -10% to +10%
      accuracyTrend: Math.floor(Math.random() * 10) - 5, // -5% to +5%
      alerts: [
        {
          type: 'warning',
          message: 'Cost approaching 80% of monthly budget',
          timestamp: new Date().toISOString()
        },
        {
          type: 'info',
          message: 'New compliance audit completed successfully',
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
      ]
    }

    return new Response(
      JSON.stringify(metrics),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching executive metrics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

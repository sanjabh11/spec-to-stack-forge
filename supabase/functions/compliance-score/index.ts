
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Simulate compliance checks
    const checks = [
      { category: 'security', passed: 8, total: 10 },
      { category: 'privacy', passed: 9, total: 10 },
      { category: 'data_governance', passed: 7, total: 8 },
      { category: 'access_control', passed: 6, total: 7 },
    ]

    const totalPassed = checks.reduce((sum, check) => sum + check.passed, 0)
    const totalChecks = checks.reduce((sum, check) => sum + check.total, 0)
    const overallScore = Math.round((totalPassed / totalChecks) * 100)

    const details = {
      categories: checks.reduce((acc, check) => {
        acc[check.category] = {
          score: Math.round((check.passed / check.total) * 100),
          issues: check.total - check.passed > 0 ? 
            [`${check.total - check.passed} compliance issue(s) found`] : [],
          recommendations: check.total - check.passed > 0 ? 
            [`Review ${check.category} policies`] : []
        }
        return acc
      }, {} as any)
    }

    // Store the result
    const { error } = await supabase
      .from('compliance_scores')
      .upsert({
        tenant_id: '00000000-0000-0000-0000-000000000000', // Default tenant
        score: overallScore,
        total_checks: totalChecks,
        passed_checks: totalPassed,
        details,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing compliance score:', error)
    }

    return new Response(
      JSON.stringify({
        score: overallScore,
        total_checks: totalChecks,
        passed_checks: totalPassed,
        details,
        last_updated: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error calculating compliance score:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

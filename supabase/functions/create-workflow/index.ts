
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

    const { name, description, trigger, action, template_data } = await req.json()

    // Create workflow template
    const { data: workflow, error } = await supabase
      .from('workflow_templates')
      .insert({
        name,
        description,
        template_data,
        category: 'custom'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Here you would typically also create the actual N8N workflow
    // For now, we'll just return the template
    console.log(`Created workflow template: ${name}`)

    return new Response(
      JSON.stringify({ success: true, workflow }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating workflow:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

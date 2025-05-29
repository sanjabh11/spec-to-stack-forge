
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
    const { endpoint, maxRequests, windowMs, blockDurationMs = 300000 } = await req.json();
    
    // Get user ID from auth
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = user.id;
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Check if user is currently blocked
    const { data: blockData } = await supabase
      .from('rate_limit_blocks')
      .select('blocked_until')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('blocked_until', new Date().toISOString())
      .single();

    if (blockData) {
      return new Response(JSON.stringify({
        allowed: false,
        blocked: true,
        blockedUntil: blockData.blocked_until,
        remaining: 0,
        resetTime: new Date(now + windowMs).toISOString()
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean up old requests
    await supabase
      .from('rate_limit_requests')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .lt('timestamp', new Date(windowStart).toISOString());

    // Count current requests in window
    const { data: requests, error: countError } = await supabase
      .from('rate_limit_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('timestamp', new Date(windowStart).toISOString());

    if (countError) throw countError;

    const currentRequests = requests?.length || 0;
    const remaining = Math.max(0, maxRequests - currentRequests - 1);

    if (currentRequests >= maxRequests) {
      // Block user if they exceed limit significantly
      if (currentRequests > maxRequests * 2) {
        await supabase
          .from('rate_limit_blocks')
          .upsert({
            user_id: userId,
            endpoint: endpoint,
            blocked_until: new Date(now + blockDurationMs).toISOString(),
            reason: 'Rate limit exceeded'
          });
      }

      return new Response(JSON.stringify({
        allowed: false,
        blocked: false,
        remaining: 0,
        resetTime: new Date(now + windowMs).toISOString(),
        message: 'Rate limit exceeded'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Record this request
    await supabase
      .from('rate_limit_requests')
      .insert({
        user_id: userId,
        endpoint: endpoint,
        timestamp: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      allowed: true,
      blocked: false,
      remaining: remaining,
      resetTime: new Date(now + windowMs).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

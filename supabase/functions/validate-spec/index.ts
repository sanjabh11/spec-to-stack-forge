
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { spec } = await req.json();

    console.log('Validating specification:', spec);

    // Perform comprehensive validation
    const validation = await validateSpecification(spec);

    // Log validation results
    await supabase
      .from('audit_logs')
      .insert({
        action: 'spec_validated',
        resource_type: 'specification',
        details: {
          domain: spec.domain,
          validation_score: validation.score,
          issues: validation.issues.length
        }
      });

    return new Response(JSON.stringify({
      success: true,
      validation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Spec validation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Validation failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function validateSpecification(spec: any) {
  const issues = [];
  let score = 100;

  // Schema validation
  const schemaIssues = validateSchema(spec);
  issues.push(...schemaIssues);
  score -= schemaIssues.length * 10;

  // Business logic validation
  const businessIssues = validateBusinessLogic(spec);
  issues.push(...businessIssues);
  score -= businessIssues.length * 15;

  // AI-powered contradiction detection
  if (geminiApiKey) {
    try {
      const aiIssues = await detectContradictions(spec);
      issues.push(...aiIssues);
      score -= aiIssues.length * 20;
    } catch (error) {
      console.error('AI validation failed:', error);
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    isValid: issues.length === 0,
    recommendations: generateRecommendations(spec, issues)
  };
}

function validateSchema(spec: any) {
  const issues = [];
  
  // Required fields
  const requiredFields = ['domain', 'objective'];
  for (const field of requiredFields) {
    if (!spec[field]) {
      issues.push({
        type: 'schema',
        severity: 'error',
        message: `Missing required field: ${field}`,
        field
      });
    }
  }

  // Data type validation
  if (spec.throughput && isNaN(Number(spec.throughput))) {
    issues.push({
      type: 'schema',
      severity: 'error',
      message: 'Throughput must be a number',
      field: 'throughput'
    });
  }

  if (spec.sla_target && (Number(spec.sla_target) < 0 || Number(spec.sla_target) > 100)) {
    issues.push({
      type: 'schema',
      severity: 'error',
      message: 'SLA target must be between 0 and 100',
      field: 'sla_target'
    });
  }

  return issues;
}

function validateBusinessLogic(spec: any) {
  const issues = [];

  // Domain-specific validation
  if (spec.domain === 'Healthcare' && !spec.compliance?.includes('HIPAA')) {
    issues.push({
      type: 'business',
      severity: 'warning',
      message: 'Healthcare applications typically require HIPAA compliance',
      field: 'compliance'
    });
  }

  if (spec.domain === 'Finance' && !spec.compliance?.includes('SOC2')) {
    issues.push({
      type: 'business',
      severity: 'warning',
      message: 'Financial applications typically require SOC2 compliance',
      field: 'compliance'
    });
  }

  // Technical feasibility
  if (Number(spec.throughput) > 10000 && spec.sla_target > 99.9) {
    issues.push({
      type: 'business',
      severity: 'warning',
      message: 'High throughput with very high SLA may require additional infrastructure considerations',
      field: 'technical_feasibility'
    });
  }

  return issues;
}

async function detectContradictions(spec: any) {
  const prompt = `Analyze this AI platform specification for contradictions, inconsistencies, or potential issues:

${JSON.stringify(spec, null, 2)}

Look for:
1. Contradictory requirements
2. Unrealistic expectations
3. Missing dependencies
4. Security concerns
5. Scalability issues

Return a JSON array of issues in this format:
[
  {
    "type": "contradiction",
    "severity": "error|warning|info",
    "message": "Description of the issue",
    "fields": ["field1", "field2"]
  }
]`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.1,
        maxOutputTokens: 2048
      }
    })
  });

  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  try {
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse AI validation response:', error);
    return [];
  }
}

function generateRecommendations(spec: any, issues: any[]) {
  const recommendations = [];

  // Generate recommendations based on issues
  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');

  if (errorIssues.length > 0) {
    recommendations.push('Address all error-level issues before proceeding with generation');
  }

  if (warningIssues.length > 0) {
    recommendations.push('Review warning-level issues for potential improvements');
  }

  // Domain-specific recommendations
  if (spec.domain === 'Healthcare') {
    recommendations.push('Consider implementing end-to-end encryption for PHI data');
    recommendations.push('Plan for HIPAA audit trail requirements');
  }

  if (spec.domain === 'Finance') {
    recommendations.push('Implement real-time fraud detection capabilities');
    recommendations.push('Consider regulatory reporting requirements');
  }

  // Technical recommendations
  if (Number(spec.throughput) > 1000) {
    recommendations.push('Consider implementing caching strategies for high throughput');
    recommendations.push('Plan for auto-scaling infrastructure');
  }

  return recommendations;
}

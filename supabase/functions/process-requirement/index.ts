
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ProcessRequirementRequest {
  sessionId: string;
  userResponse: string;
  currentQuestion: number;
  domain: string;
  llmProvider?: string;
}

interface DomainQuestion {
  id: number;
  question: string;
  field: string;
  validation_prompt: string;
  next_question_logic?: string;
}

const domainQuestions: Record<string, DomainQuestion[]> = {
  'Legal': [
    {
      id: 0,
      question: "What specific legal problem are you trying to solve? (e.g., contract analysis, compliance monitoring, legal research)",
      field: "objective",
      validation_prompt: "Validate if this legal objective is clear and specific. Flag if too vague or unrealistic."
    },
    {
      id: 1,
      question: "What data sources will your legal AI solution need to work with? (e.g., contract databases, legal documents, case law APIs)",
      field: "data_sources",
      validation_prompt: "Check if data sources are appropriate for legal use case and consider compliance requirements."
    },
    {
      id: 2,
      question: "What are your performance requirements? Please specify expected document processing volume, concurrent users, and response time targets.",
      field: "performance",
      validation_prompt: "Validate performance numbers are realistic for legal document processing workloads."
    },
    {
      id: 3,
      question: "Do you have compliance requirements? (e.g., attorney-client privilege, GDPR, data retention policies)",
      field: "compliance",
      validation_prompt: "Ensure compliance requirements are appropriate for legal domain."
    },
    {
      id: 4,
      question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?",
      field: "budget",
      validation_prompt: "Check for contradictions between budget and performance requirements."
    }
  ],
  'Finance': [
    {
      id: 0,
      question: "What specific financial problem are you trying to solve? (e.g., risk assessment, fraud detection, financial planning)",
      field: "objective",
      validation_prompt: "Validate if this financial objective is clear and specific. Flag if too vague or unrealistic."
    },
    {
      id: 1,
      question: "What data sources will your financial AI solution need to work with? (e.g., transaction databases, market data APIs, financial statements)",
      field: "data_sources",
      validation_prompt: "Check if data sources are appropriate for financial use case and consider regulatory requirements."
    },
    {
      id: 2,
      question: "What are your performance requirements? Please specify expected transaction volume, concurrent users, and response time targets.",
      field: "performance",
      validation_prompt: "Validate performance numbers are realistic for financial processing workloads."
    },
    {
      id: 3,
      question: "Do you have regulatory compliance requirements? (e.g., PCI-DSS, SOX, Basel III, MiFID II)",
      field: "compliance",
      validation_prompt: "Ensure compliance requirements are appropriate for financial domain."
    },
    {
      id: 4,
      question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?",
      field: "budget",
      validation_prompt: "Check for contradictions between budget and performance requirements."
    }
  ],
  'Healthcare': [
    {
      id: 0,
      question: "What specific healthcare problem are you trying to solve? Please specify if this is for EMR systems, clinical trials, diagnostics, or patient management.",
      field: "objective",
      validation_prompt: "Validate if this healthcare objective is clear and specific. Consider HIPAA implications."
    },
    {
      id: 1,
      question: "What data sources will your healthcare AI solution need to work with? (e.g., EMR systems, medical devices, lab results, imaging data)",
      field: "data_sources",
      validation_prompt: "Check if data sources are appropriate for healthcare use case and ensure HIPAA compliance consideration."
    },
    {
      id: 2,
      question: "What are your performance requirements? Please specify expected patient records processed, concurrent users, and response time targets.",
      field: "performance",
      validation_prompt: "Validate performance numbers are realistic for healthcare workloads with security constraints."
    },
    {
      id: 3,
      question: "Do you have healthcare compliance requirements? (e.g., HIPAA, HITECH, FDA 21 CFR Part 11, GDPR for EU patients)",
      field: "compliance",
      validation_prompt: "Ensure compliance requirements are comprehensive for healthcare domain."
    },
    {
      id: 4,
      question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?",
      field: "budget",
      validation_prompt: "Check for contradictions between budget and performance/compliance requirements."
    }
  ]
};

async function validateResponse(response: string, validationPrompt: string, llmProvider: string = 'gemini'): Promise<{valid: boolean, message: string, suggestions?: string[]}> {
  const prompt = `${validationPrompt}

User Response: "${response}"

Please respond with a JSON object containing:
- valid (boolean): true if response is adequate, false if needs improvement
- message (string): validation feedback
- suggestions (array of strings, optional): specific suggestions for improvement

Be constructive and helpful in your feedback.`;

  try {
    if (llmProvider === 'gemini' && geminiApiKey) {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      const data = await geminiResponse.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }
    
    // Fallback validation
    return {
      valid: response.length > 10,
      message: response.length > 10 ? "Response accepted" : "Please provide more detail"
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: response.length > 10,
      message: response.length > 10 ? "Response accepted" : "Please provide more detail"
    };
  }
}

async function detectContradictions(sessionData: any): Promise<{detected: boolean, message?: string}> {
  if (!sessionData.budget || !sessionData.performance) {
    return { detected: false };
  }

  const prompt = `Analyze these user requirements for contradictions:

Budget: ${sessionData.budget}
Performance: ${sessionData.performance}
Compliance: ${sessionData.compliance || 'None specified'}
Objective: ${sessionData.objective || 'None specified'}

Look for potential contradictions like:
- Low budget but high performance requirements
- Strict compliance but minimal security measures
- High throughput but minimal infrastructure budget

Respond with JSON:
- detected (boolean): true if contradictions found
- message (string): explanation of contradiction and suggested resolution`;

  try {
    if (geminiApiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }
    
    return { detected: false };
  } catch (error) {
    console.error('Contradiction detection error:', error);
    return { detected: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userResponse, currentQuestion, domain, llmProvider = 'gemini' }: ProcessRequirementRequest = await req.json();

    console.log('Processing requirement:', { sessionId, currentQuestion, domain });

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('requirement_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const questions = domainQuestions[domain] || domainQuestions['Legal'];
    const currentQ = questions[currentQuestion];

    if (!currentQ) {
      return new Response(JSON.stringify({ error: 'Invalid question number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate the user response
    const validation = await validateResponse(userResponse, currentQ.validation_prompt, llmProvider);

    // Update session data
    const updatedSessionData = {
      ...session.session_data,
      [currentQ.field]: userResponse,
      llm_provider: llmProvider,
      last_updated: new Date().toISOString()
    };

    // Check for contradictions if we have enough data
    let contradiction = { detected: false };
    if (currentQuestion >= 2) {
      contradiction = await detectContradictions(updatedSessionData);
    }

    // Update session in database
    const { error: updateError } = await supabase
      .from('requirement_sessions')
      .update({
        session_data: updatedSessionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Session update error:', updateError);
    }

    // Log to audit table
    await supabase
      .from('audit_logs')
      .insert({
        action: 'requirement_response',
        resource_type: 'requirement_session',
        resource_id: sessionId,
        details: {
          question: currentQ.question,
          response: userResponse,
          validation: validation,
          contradiction: contradiction
        }
      });

    // Determine next steps
    let nextQuestion = null;
    let isComplete = false;

    if (validation.valid && !contradiction.detected) {
      if (currentQuestion < questions.length - 1) {
        nextQuestion = questions[currentQuestion + 1];
      } else {
        isComplete = true;
      }
    }

    return new Response(JSON.stringify({
      validation,
      contradiction,
      nextQuestion,
      isComplete,
      sessionData: updatedSessionData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing requirement:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

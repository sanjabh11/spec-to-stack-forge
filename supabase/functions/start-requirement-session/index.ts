
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainQuestions {
  [key: string]: Question[];
}

interface Question {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'textarea';
  options?: string[];
  required: boolean;
  category: string;
}

const domainQuestions: DomainQuestions = {
  "HR": [
    {
      id: "hr_use_case",
      question: "What is your primary HR use case?",
      type: "select",
      options: ["Employee Onboarding", "Policy Q&A", "Performance Management", "Compliance Training"],
      required: true,
      category: "Business Requirements"
    },
    {
      id: "employee_count",
      question: "How many employees will use this system?",
      type: "select",
      options: ["1-50", "51-200", "201-1000", "1000+"],
      required: true,
      category: "Scale"
    },
    {
      id: "compliance_requirements",
      question: "What compliance standards do you need to meet?",
      type: "multiselect",
      options: ["GDPR", "SOC2", "HIPAA", "ISO 27001", "Local Labor Laws"],
      required: false,
      category: "Compliance"
    },
    {
      id: "integration_systems",
      question: "Which HR systems need integration?",
      type: "multiselect",
      options: ["Workday", "BambooHR", "ADP", "Slack", "Microsoft Teams", "Custom HRIS"],
      required: false,
      category: "Technical"
    },
    {
      id: "budget_range",
      question: "What is your monthly budget range?",
      type: "select",
      options: ["$500-2000", "$2000-5000", "$5000-15000", "$15000+"],
      required: true,
      category: "Budget"
    }
  ],
  "Finance": [
    {
      id: "finance_use_case",
      question: "What is your primary finance use case?",
      type: "select",
      options: ["Financial Reporting", "Invoice Processing", "Risk Analysis", "Compliance Monitoring"],
      required: true,
      category: "Business Requirements"
    },
    {
      id: "transaction_volume",
      question: "What is your monthly transaction volume?",
      type: "select",
      options: ["<1K", "1K-10K", "10K-100K", "100K+"],
      required: true,
      category: "Scale"
    },
    {
      id: "regulatory_requirements",
      question: "Which regulatory frameworks apply?",
      type: "multiselect",
      options: ["SOX", "GAAP", "IFRS", "Basel III", "PCI DSS"],
      required: false,
      category: "Compliance"
    },
    {
      id: "financial_systems",
      question: "Which financial systems need integration?",
      type: "multiselect",
      options: ["SAP", "Oracle Financials", "QuickBooks", "Xero", "NetSuite"],
      required: false,
      category: "Technical"
    }
  ],
  "Legal": [
    {
      id: "legal_use_case",
      question: "What is your primary legal use case?",
      type: "select",
      options: ["Contract Analysis", "Legal Research", "Compliance Monitoring", "Document Review"],
      required: true,
      category: "Business Requirements"
    },
    {
      id: "document_volume",
      question: "How many documents do you process monthly?",
      type: "select",
      options: ["<100", "100-1K", "1K-10K", "10K+"],
      required: true,
      category: "Scale"
    },
    {
      id: "practice_areas",
      question: "Which practice areas are relevant?",
      type: "multiselect",
      options: ["Corporate Law", "IP Law", "Employment Law", "Real Estate", "Litigation"],
      required: false,
      category: "Domain"
    }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { domain } = await req.json();

    if (!domain || !domainQuestions[domain]) {
      return new Response(
        JSON.stringify({ error: 'Invalid domain specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new requirement session
    const sessionId = crypto.randomUUID();
    const questions = domainQuestions[domain];

    // Store session in database
    const { error: insertError } = await supabase
      .from('requirement_sessions')
      .insert({
        id: sessionId,
        domain,
        status: 'active',
        session_data: {
          questions,
          started_at: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        sessionId,
        questions,
        domain,
        totalSteps: questions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Start session error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

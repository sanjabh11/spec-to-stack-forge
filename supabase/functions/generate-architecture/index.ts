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

interface GenerateArchitectureRequest {
  sessionId: string;
  sessionData: any;
  domain: string;
  llmProvider?: string;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.3,
        maxOutputTokens: 8192
      }
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateArchitectureBlueprint(sessionData: any, domain: string): Promise<any> {
  const prompt = `You are SolutionDesigner, an expert AI architect. Given the validated specification JSON below, generate a comprehensive system architecture blueprint in YAML format.

SPECIFICATION:
${JSON.stringify(sessionData, null, 2)}

DOMAIN: ${domain}

Generate a YAML architecture blueprint with the following structure:

\`\`\`yaml
name: "${sessionData.requirements.objective?.slice(0, 50) || 'AI Solution'}"
domain: "${domain}"
services:
  - name: "api-gateway"
    purpose: "Main API entry point with authentication"
    technology: "FastAPI"
    autoscale:
      min: 2
      max: 10
    sla:
      availability: "99.9%"
      response_time: "< 200ms"
  - name: "llm-service"
    purpose: "LLM processing and inference"
    technology: "Python/Gemini"
    autoscale:
      min: 1
      max: 5
    sla:
      availability: "99.5%"
      response_time: "< 2s"

databases:
  - name: "primary-db"
    type: "PostgreSQL"
    purpose: "Main application data"
    compliance_tags: ["${sessionData.requirements.compliance || 'STANDARD'}"]
    schema:
      - table: "users"
        columns: ["id", "email", "created_at"]
      - table: "sessions"
        columns: ["id", "user_id", "data", "created_at"]

dependencies:
  - type: "llm_api"
    vendor: "Google Gemini"
    version: "1.5-pro"
    security: "API key authentication"
  - type: "vector_db"
    vendor: "ChromaDB"
    version: "latest"
    purpose: "Embedding storage"

infrastructure:
  cloud_provider: "GCP"
  regions: ["us-central1"]
  estimated_cost: 
    monthly: "$${sessionData.requirements.budget?.replace(/[^0-9]/g, '') || '500'}"
  
security:
  encryption: "at_rest_and_transit"
  compliance: ["${sessionData.requirements.compliance || 'STANDARD'}"]
  access_control: "RBAC"
\`\`\`

Focus on the specific domain requirements for ${domain}. Include relevant services, databases, and compliance considerations based on the user's requirements.`;

  const response = await callGemini(prompt);
  
  // Extract YAML from response
  const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlMatch) {
    return yamlMatch[1];
  }
  
  throw new Error('Failed to extract YAML from response');
}

async function generateTerraformModules(architecture: string, sessionData: any): Promise<any> {
  const requirements = sessionData.requirements || {};
  const prompt = `You are IaCGenerator, an expert in Infrastructure as Code. Given the architecture YAML below, generate Terraform modules.

ARCHITECTURE:
${architecture}

REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

Generate Terraform code with the following files:

**main.tf:**
\`\`\`terraform
# Main infrastructure configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Application cluster
resource "google_container_cluster" "main" {
  name     = "\${var.project_name}-cluster"
  location = var.region

  initial_node_count = var.min_nodes

  node_config {
    machine_type = var.machine_type
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# Database
resource "google_sql_database_instance" "main" {
  name             = "\${var.project_name}-db"
  database_version = "POSTGRES_14"
  region          = var.region

  settings {
    tier = var.db_tier
  }
}
\`\`\`

**variables.tf:**
\`\`\`terraform
variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "ai-platform"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "min_nodes" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "machine_type" {
  description = "Machine type for nodes"
  type        = string
  default     = "e2-medium"
}

variable "db_tier" {
  description = "Database tier"
  type        = string
  default     = "db-f1-micro"
}
\`\`\`

**outputs.tf:**
\`\`\`terraform
output "cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.main.endpoint
}

output "database_connection" {
  description = "Database connection string"
  value       = google_sql_database_instance.main.connection_name
  sensitive   = true
}
\`\`\`

Include inline comments explaining each resource and ensure idempotency.`;

  const response = await callGemini(prompt);
  
  // Extract terraform files
  const mainTf = response.match(/\*\*main\.tf:\*\*\n```terraform\n([\s\S]*?)\n```/)?.[1];
  const variablesTf = response.match(/\*\*variables\.tf:\*\*\n```terraform\n([\s\S]*?)\n```/)?.[1];
  const outputsTf = response.match(/\*\*outputs\.tf:\*\*\n```terraform\n([\s\S]*?)\n```/)?.[1];
  
  return {
    'main.tf': mainTf,
    'variables.tf': variablesTf,
    'outputs.tf': outputsTf
  };
}

async function generateN8nWorkflow(sessionData: any, domain: string): Promise<any> {
  const requirements = sessionData.requirements || {};
  const prompt = `You are WorkflowBuilder, an expert in n8n workflow automation. Generate an n8n workflow JSON for the ${domain} domain.

REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

Create a workflow that includes:
1. Data ingestion node
2. Data processing node
3. LLM processing node (Gemini)
4. Response formatting node
5. Notification node

Return the n8n workflow JSON structure with proper node connections and configuration.`;

  const response = await callGemini(prompt);
  
  // Extract JSON from response
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  // Fallback basic workflow
  return {
    "name": `${domain} AI Workflow`,
    "nodes": [
      {
        "id": "start",
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "position": [250, 300]
      },
      {
        "id": "llm",
        "name": "LLM Processing",
        "type": "n8n-nodes-base.httpRequest",
        "position": [450, 300]
      }
    ],
    "connections": {
      "Start": {
        "main": [
          [
            {
              "node": "LLM Processing",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  };
}

async function generateCICDTemplate(sessionData: any): Promise<string> {
  const requirements = sessionData.requirements || {};
  const prompt = `You are CICDArchitect, an expert in CI/CD and GitOps. Generate a GitHub Actions workflow for deploying the AI platform.

REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

Generate a comprehensive .github/workflows/ci.yml that includes:
1. Linting (terraform fmt, eslint)
2. Testing (unit tests, terraform validate)
3. Security scanning (tfsec)
4. Manual approval for production
5. Deployment with diff visualization

Include proper job dependencies and error handling.`;

  const response = await callGemini(prompt);
  
  // Extract YAML from response
  const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlMatch) {
    return yamlMatch[1];
  }
  
  throw new Error('Failed to extract CI/CD YAML from response');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let sessionId, sessionData, domain, llmProvider;
  try {
    const body = await req.json();
    sessionId = body.sessionId;
    sessionData = body.sessionData || body.specification;
    domain = body.domain || body.specification?.domain;
    llmProvider = body.llmProvider || body.specification?.llm_provider;

    // Defensive check for sessionData and requirements
    if (!sessionData || !sessionData.requirements) {
      return new Response(JSON.stringify({
        error: 'Invalid input: sessionData/specification or requirements missing',
        debug: { sessionData }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating architecture for session:', sessionId, 'domain:', domain);

    // Get session
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

    console.log('Starting Phase II generation...');

    // Step 1: Generate Architecture Blueprint
    console.log('Step 1: Generating architecture blueprint...');
    const architecture = await generateArchitectureBlueprint(sessionData, domain);

    // Step 2: Generate Terraform Modules
    console.log('Step 2: Generating Terraform modules...');
    const terraform = await generateTerraformModules(architecture, sessionData);

    // Step 3: Generate n8n Workflow
    console.log('Step 3: Generating n8n workflow...');
    const workflow = await generateN8nWorkflow(sessionData, domain);

    // Step 4: Generate CI/CD Template
    console.log('Step 4: Generating CI/CD template...');
    const cicd = await generateCICDTemplate(sessionData);

    // Create generated spec record
    const generatedArtifacts = {
      architecture: {
        yaml: architecture,
        generated_at: new Date().toISOString()
      },
      terraform: {
        files: terraform,
        generated_at: new Date().toISOString()
      },
      workflow: {
        n8n_json: workflow,
        generated_at: new Date().toISOString()
      },
      cicd: {
        github_actions: cicd,
        generated_at: new Date().toISOString()
      },
      metadata: {
        domain,
        llm_provider: llmProvider,
        session_id: sessionId,
        generation_completed: new Date().toISOString()
      }
    };

    const { data: generatedSpec, error: specError } = await supabase
      .from('generated_specs')
      .insert({
        specification: sessionData,
        generated_code: generatedArtifacts,
        status: 'completed',
        version: 1
      })
      .select()
      .single();

    if (specError) {
      console.error('Error saving generated spec:', specError);
    }

    // Update session status
    await supabase
      .from('requirement_sessions')
      .update({
        status: 'generated',
        session_data: {
          ...session.session_data,
          generated_spec_id: generatedSpec?.id,
          phase: 'completed'
        }
      })
      .eq('id', sessionId);

    // Log completion
    await supabase
      .from('audit_logs')
      .insert({
        action: 'architecture_generated',
        resource_type: 'generated_spec',
        resource_id: generatedSpec?.id,
        details: {
          session_id: sessionId,
          domain,
          artifacts_generated: ['architecture', 'terraform', 'workflow', 'cicd']
        }
      });

    return new Response(JSON.stringify({
      success: true,
      generatedSpec: generatedSpec,
      artifacts: generatedArtifacts,
      message: 'Architecture and artifacts generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // TEMP: Return error and input in HTTP response for debugging
    return new Response(JSON.stringify({ 
      error: 'Failed to generate architecture',
      details: error.message,
      debug: {
        error: String(error),
        stack: error?.stack,
        input: { sessionId, sessionData, domain, llmProvider }
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

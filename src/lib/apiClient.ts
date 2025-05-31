
import { supabase } from "@/integrations/supabase/client";

export interface RequirementSession {
  id: string;
  domain: string;
  status: string;
  session_data: any;
  created_at: string;
  updated_at: string;
}

export interface GeneratedSpec {
  id: string;
  specification: any;
  generated_code: any;
  status: string;
  version: number;
  created_at: string;
}

export interface ArtifactRequest {
  sessionId: string;
  domain: string;
  llmProvider?: string;
  compliance?: string[];
  outputFormat?: 'json' | 'yaml' | 'terraform' | 'n8n';
}

export class APIClient {
  async startRequirementSession(domain: string) {
    const { data, error } = await supabase.functions.invoke('start-requirement-session', {
      body: { domain }
    });

    if (error) throw new Error(`Failed to start session: ${error.message}`);
    return data;
  }

  async processRequirement(sessionId: string, response: string) {
    const { data, error } = await supabase.functions.invoke('process-requirement', {
      body: { sessionId, response }
    });

    if (error) throw new Error(`Failed to process requirement: ${error.message}`);
    return data;
  }

  async generateArchitecture(request: ArtifactRequest) {
    const { data, error } = await supabase.functions.invoke('generate-architecture', {
      body: request
    });

    if (error) throw new Error(`Failed to generate architecture: ${error.message}`);
    return data;
  }

  async generateCLI(platform: 'go' | 'rust', spec: any) {
    const { data, error } = await supabase.functions.invoke('cli-generator', {
      body: { action: 'generate-cli', platform, spec }
    });

    if (error) throw new Error(`Failed to generate CLI: ${error.message}`);
    return data;
  }

  async createGitHubIntegration(action: string, payload: any) {
    const { data, error } = await supabase.functions.invoke('github-integration', {
      body: { action, ...payload }
    });

    if (error) throw new Error(`GitHub integration failed: ${error.message}`);
    return data;
  }

  async getObservabilityMetrics(action: string, filters?: any) {
    const { data, error } = await supabase.functions.invoke('observability', {
      body: { action, filters }
    });

    if (error) throw new Error(`Failed to get metrics: ${error.message}`);
    return data;
  }

  async validateSpec(spec: any) {
    // Local validation first
    const requiredFields = ['domain', 'requirements'];
    for (const field of requiredFields) {
      if (!spec[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Server-side validation
    const { data, error } = await supabase.functions.invoke('validate-spec', {
      body: { spec }
    });

    if (error) throw new Error(`Spec validation failed: ${error.message}`);
    return data;
  }

  async getAuditLogs(filters?: any) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(`Failed to get audit logs: ${error.message}`);
    return data;
  }
}

export const apiClient = new APIClient();

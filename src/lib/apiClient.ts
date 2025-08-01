import { supabase } from "@/integrations/supabase/client";

export class APIClient {
  async startRequirementSession(domain: string) {
    try {
      // Get current user's tenant_id
      const { data: { user } } = await supabase.auth.getUser();
      let tenantId = '00000000-0000-0000-0000-000000000000'; // default tenant

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (profile?.tenant_id) {
          tenantId = profile.tenant_id;
        }
      }

      // Get questions for the domain using edge function
      const { data: questions, error: questionsError } = await supabase.functions.invoke('get-question-templates', {
        body: { domain_param: domain }
      });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        // Return mock questions for now
        return {
          sessionId: crypto.randomUUID(), // Use proper UUID
          questions: [
            {
              id: 'q1',
              domain,
              question_order: 1,
              question_text: `What is your primary objective for this ${domain} AI platform?`,
              question_type: 'textarea',
              required: true,
              category: 'Domain Specification',
              options: []
            },
            {
              id: 'q2',
              domain,
              question_order: 2,
              question_text: 'What is your expected user load?',
              question_type: 'select',
              required: true,
              category: 'Performance Requirements',
              options: ['< 100 users', '100 - 1000 users', '1000 - 10000 users', '> 10000 users']
            }
          ],
          domain
        };
      }

      // Create new requirement session with the correct fields
      const sessionData = {
        domain,
        status: 'active',
        session_data: {},
        project_id: null,
        tenant_id: tenantId,
        user_id: user?.id || null
      };

      const { data: session, error: sessionError } = await supabase
        .from('requirement_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }

      return {
        sessionId: session.id,
        questions: questions || [],
        domain
      };
    } catch (error: any) {
      console.error('Error starting requirement session:', error);
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }

  async processRequirement(sessionId: string, answers: any, action: string = 'update') {
    try {
      if (action === 'complete') {
        // Get the session first
        const { data: sessionData, error: sessionFetchError } = await supabase
          .from('requirement_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionFetchError) throw sessionFetchError;

        // Update session with final answers and generate specification
        const { data: session, error: updateError } = await supabase
          .from('requirement_sessions')
          .update({
            session_data: { answers },
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Generate initial specification based on answers
        const specification = this.generateSpecFromAnswers(answers, session.domain);
        
        // Create spec record using proper tenant and user data
        const { data: spec, error: specError } = await supabase
          .from('specs')
          .insert({
            session_id: sessionId,
            tenant_id: sessionData.tenant_id || '00000000-0000-0000-0000-000000000000',
            user_id: sessionData.user_id,
            domain: session.domain,
            payload: specification,
            validation_status: 'completed'
          })
          .select()
          .single();

        if (specError) throw specError;

        return {
          specification,
          recommendations: this.generateRecommendations(answers, session.domain),
          sessionId,
          specId: spec.id
        };
      } else {
        // Just update the session with current answers
        const { error } = await supabase
          .from('requirement_sessions')
          .update({
            session_data: { answers },
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) throw error;

        return { success: true };
      }
    } catch (error: any) {
      console.error('Error processing requirement:', error);
      throw new Error(`Failed to process requirement: ${error.message}`);
    }
  }

  private generateSpecFromAnswers(answers: any, domain: string) {
    return {
      domain,
      requirements: answers,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      compliance: this.extractComplianceFromAnswers(answers),
      architecture: {
        type: 'microservices',
        deployment: 'kubernetes',
        scaling: 'auto'
      }
    };
  }

  private generateRecommendations(answers: any, domain: string) {
    const recommendations = [];
    
    // Domain-specific recommendations
    if (domain === 'healthcare') {
      recommendations.push({
        category: 'Compliance',
        priority: 'high',
        title: 'HIPAA Compliance Setup',
        description: 'Implement end-to-end encryption and audit logging for HIPAA compliance.'
      });
    } else if (domain === 'finance') {
      recommendations.push({
        category: 'Security',
        priority: 'high',
        title: 'PCI DSS Compliance',
        description: 'Configure secure payment processing and data encryption.'
      });
    }

    return recommendations;
  }

  private extractComplianceFromAnswers(answers: any) {
    const compliance = [];
    
    Object.values(answers).forEach((answer: any) => {
      if (Array.isArray(answer)) {
        answer.forEach(item => {
          if (typeof item === 'string' && 
              (item.includes('HIPAA') || item.includes('GDPR') || 
               item.includes('SOC2') || item.includes('PCI'))) {
            compliance.push(item);
          }
        });
      }
    });

    return [...new Set(compliance)];
  }

  async generateArchitecture(request: any) {
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

  async getRequirementHistory() {
    const { data, error } = await supabase
      .from('requirement_sessions')
      .select(`
        *,
        specs!inner(*)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(`Failed to get requirement history: ${error.message}`);
    return data;
  }

  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        specs!inner(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get projects: ${error.message}`);
    return data;
  }
}

export const apiClient = new APIClient();

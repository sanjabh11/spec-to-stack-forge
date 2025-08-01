
export interface Question {
  id: string;
  domain: string;
  subdomain?: string;
  question_order: number;
  question_text: string;
  question_type: 'text' | 'select' | 'multiselect' | 'number' | 'textarea';
  options?: string[];
  required: boolean;
  category: string;
  validation_rules?: any;
}

export interface RequirementSession {
  id: string;
  tenant_id: string;
  user_id?: string;
  domain: string;
  subdomain?: string;
  current_question_index: number;
  status: string;
  answers: any;
  spec_data: any;
  validation_results: any;
  created_at: string;
  updated_at: string;
}

export interface GenerationResultsProps {
  sessionData: {
    sessionId: string;
    domain: string;
    answers: any;
    specification: any;
    recommendations: any;
    specId: string;
  };
  onArtifactsGenerated?: (artifacts: any) => void;
}

export interface User {
  id: string;
  auth_user_id?: string;
  tenant_id: string;
  email: string;
  name?: string;
  role: string;
  profile?: any;
}

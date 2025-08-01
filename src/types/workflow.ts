
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_content: string;
  placeholders: any;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  jurisdiction: string | null;
}

export interface WorkflowTestResult {
  id: string;
  workflow_id: string;
  test_name: string;
  status: 'passed' | 'failed' | 'running';
  execution_time: number;
  results: any;
  error_message?: string;
  created_at: string;
}

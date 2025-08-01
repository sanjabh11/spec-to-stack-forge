
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  domain: string;
  template_data: any;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  preview_image: string | null;
  usage_count: number;
  is_featured: boolean;
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


-- Add viewer role and compliance tables
INSERT INTO roles (name, description) VALUES ('viewer', 'Read-only access') ON CONFLICT (name) DO NOTHING;

-- Create compliance_scores table
CREATE TABLE IF NOT EXISTS public.compliance_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  score INTEGER NOT NULL DEFAULT 0,
  total_checks INTEGER NOT NULL DEFAULT 0,
  passed_checks INTEGER NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create document_tags table
CREATE TABLE IF NOT EXISTS public.document_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_templates table
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view compliance scores for their tenant" ON public.compliance_scores
FOR SELECT USING (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.auth_user_id = auth.uid()));

CREATE POLICY "Users can manage tags for their documents" ON public.document_tags
FOR ALL USING (document_id IN (SELECT documents.id FROM documents WHERE documents.user_id = auth.uid()));

CREATE POLICY "Users can manage versions for their documents" ON public.document_versions
FOR ALL USING (document_id IN (SELECT documents.id FROM documents WHERE documents.user_id = auth.uid()));

CREATE POLICY "Anyone can view active workflow templates" ON public.workflow_templates
FOR SELECT USING (is_active = true);

-- Insert sample workflow templates
INSERT INTO public.workflow_templates (name, description, template_data, category) VALUES
('Document Processing', 'Automatically process uploaded documents', '{"trigger": "upload", "action": "process"}', 'automation'),
('Policy Q&A', 'Answer policy questions using RAG', '{"trigger": "question", "action": "rag_search"}', 'knowledge'),
('Compliance Check', 'Run compliance audits on documents', '{"trigger": "schedule", "action": "audit"}', 'compliance')
ON CONFLICT DO NOTHING;

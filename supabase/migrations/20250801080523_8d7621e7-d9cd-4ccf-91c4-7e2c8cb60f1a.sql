
-- Create core tables for requirements capture and validation
CREATE TABLE IF NOT EXISTS public.requirement_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID,
  domain TEXT NOT NULL,
  subdomain TEXT,
  current_question_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  answers JSONB DEFAULT '{}',
  spec_data JSONB DEFAULT '{}',
  validation_results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create specs table for validated specifications
CREATE TABLE IF NOT EXISTS public.specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  session_id UUID REFERENCES public.requirement_sessions(id),
  user_id UUID,
  domain TEXT NOT NULL,
  payload JSONB NOT NULL,
  validation_status TEXT DEFAULT 'pending',
  validation_errors JSONB DEFAULT '[]',
  llm_provider TEXT DEFAULT 'gemini-2.5-pro',
  token_budget INTEGER DEFAULT 10000,
  latency_budget INTEGER DEFAULT 5000,
  compliance_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table for tracking generated solutions
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  spec_id UUID REFERENCES public.specs(id),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  generated_artifacts JSONB DEFAULT '{}',
  github_integration JSONB DEFAULT '{}',
  deployment_status TEXT DEFAULT 'not_deployed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table for tenant mapping
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT (SELECT id FROM public.tenants WHERE name = 'default' LIMIT 1),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default tenant if not exists
INSERT INTO public.tenants (id, name, domain) 
VALUES ('00000000-0000-0000-0000-000000000000', 'default', 'localhost')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.requirement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for requirement_sessions
CREATE POLICY "Users can manage their requirement sessions" 
ON public.requirement_sessions 
FOR ALL 
USING (
  tenant_id = COALESCE(
    (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- RLS policies for specs
CREATE POLICY "Users can manage their specs" 
ON public.specs 
FOR ALL 
USING (
  tenant_id = COALESCE(
    (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- RLS policies for projects
CREATE POLICY "Users can manage their projects" 
ON public.projects 
FOR ALL 
USING (
  tenant_id = COALESCE(
    (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- RLS policies for users (allow public read for guest access)
CREATE POLICY "Public can read users" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their profile" 
ON public.users 
FOR ALL 
USING (auth_user_id = auth.uid() OR auth.uid() IS NULL);

-- Create trigger to auto-create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, name, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create domain-specific question templates
CREATE TABLE IF NOT EXISTS public.question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  subdomain TEXT,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text',
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT true,
  category TEXT NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on question templates (public read)
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read question templates" 
ON public.question_templates 
FOR SELECT 
USING (true);

-- Insert healthcare domain questions
INSERT INTO public.question_templates (domain, question_order, question_text, question_type, category, required) VALUES
('healthcare', 1, 'What type of healthcare AI solution are you building?', 'select', 'Domain Specification', true),
('healthcare', 2, 'What are your primary data sources?', 'multiselect', 'Data Sources', true),
('healthcare', 3, 'What is your target SLA uptime requirement?', 'select', 'Performance Requirements', true),
('healthcare', 4, 'What compliance requirements must be met?', 'multiselect', 'Compliance', true),
('healthcare', 5, 'What is your expected user concurrency?', 'number', 'Performance Requirements', true),
('healthcare', 6, 'What is your monthly budget for this solution?', 'select', 'Budget Constraints', true);

-- Insert finance domain questions  
INSERT INTO public.question_templates (domain, question_order, question_text, question_type, category, required) VALUES
('finance', 1, 'What type of financial AI solution are you building?', 'select', 'Domain Specification', true),
('finance', 2, 'What financial data sources will you integrate?', 'multiselect', 'Data Sources', true),
('finance', 3, 'What regulatory compliance is required?', 'multiselect', 'Compliance', true),
('finance', 4, 'What is your risk tolerance level?', 'select', 'Risk Management', true),
('finance', 5, 'What is your transaction volume expectation?', 'number', 'Performance Requirements', true);

-- Insert legal domain questions
INSERT INTO public.question_templates (domain, question_order, question_text, question_type, category, required) VALUES
('legal', 1, 'What type of legal AI solution are you building?', 'select', 'Domain Specification', true),
('legal', 2, 'What types of legal documents will be processed?', 'multiselect', 'Data Sources', true),
('legal', 3, 'What jurisdictions must be supported?', 'multiselect', 'Compliance', true),
('legal', 4, 'What is your document processing volume?', 'number', 'Performance Requirements', true);

-- Update question templates with proper options
UPDATE public.question_templates SET options = '["Clinical Decision Support", "Medical Image Analysis", "Drug Discovery", "Patient Risk Assessment", "Electronic Health Records", "Telemedicine Platform"]'::jsonb WHERE domain = 'healthcare' AND question_order = 1;

UPDATE public.question_templates SET options = '["EHR Systems", "Medical Imaging (DICOM)", "Lab Results", "Wearable Devices", "Clinical Notes", "Patient Surveys"]'::jsonb WHERE domain = 'healthcare' AND question_order = 2;

UPDATE public.question_templates SET options = '["99.9% (8.77 hours downtime/year)", "99.95% (4.38 hours downtime/year)", "99.99% (52.6 minutes downtime/year)", "99.999% (5.26 minutes downtime/year)"]'::jsonb WHERE domain = 'healthcare' AND question_order = 3;

UPDATE public.question_templates SET options = '["HIPAA", "GDPR", "SOC2", "FDA", "HITECH", "State Privacy Laws"]'::jsonb WHERE domain = 'healthcare' AND question_order = 4;

UPDATE public.question_templates SET options = '["< $10,000/month", "$10,000 - $50,000/month", "$50,000 - $200,000/month", "> $200,000/month"]'::jsonb WHERE domain = 'healthcare' AND question_order = 6;

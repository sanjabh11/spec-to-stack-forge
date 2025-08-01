
-- Create workflow_templates table
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'automation',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  preview_image TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false
);

-- Add missing columns to requirement_sessions table
ALTER TABLE public.requirement_sessions 
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on workflow_templates
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_templates
CREATE POLICY "Users can view active workflow templates" 
  ON public.workflow_templates 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create workflow templates" 
  ON public.workflow_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflow templates" 
  ON public.workflow_templates 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own workflow templates" 
  ON public.workflow_templates 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create updated_at trigger for workflow_templates
CREATE TRIGGER workflow_templates_updated_at
    BEFORE UPDATE ON public.workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

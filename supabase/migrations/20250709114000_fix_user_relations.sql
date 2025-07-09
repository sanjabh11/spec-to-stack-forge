
-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text,
  saml_config jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role_id uuid REFERENCES public.roles(id),
  tenant_id uuid REFERENCES public.tenants(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES 
  ('admin', 'Administrator with full access'),
  ('user', 'Standard user'),
  ('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Insert default tenant
INSERT INTO public.tenants (name, domain) VALUES 
  ('Default Organization', 'default.com')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY IF NOT EXISTS "Anyone can view roles" ON public.roles FOR SELECT USING (true);

-- RLS Policies for tenants
CREATE POLICY IF NOT EXISTS "Users can view their tenant" ON public.tenants 
  FOR SELECT USING (id IN (
    SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid()
  ));

-- RLS Policies for users
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.users 
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.users 
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.users 
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

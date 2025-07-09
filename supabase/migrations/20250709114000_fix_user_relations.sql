
-- First, clean up any existing problematic structures
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Recreate users table with simpler structure
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL,
  name text,
  role text DEFAULT 'user',
  tenant_id text DEFAULT 'default',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users 
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users 
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.users 
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Insert some default demo users
INSERT INTO public.users (auth_user_id, email, name, role, tenant_id) VALUES 
  (gen_random_uuid(), 'admin@demo.com', 'Admin User', 'admin', 'default'),
  (gen_random_uuid(), 'user@demo.com', 'Demo User', 'user', 'default')
ON CONFLICT DO NOTHING;

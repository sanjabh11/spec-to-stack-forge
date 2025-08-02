
-- Add missing columns to requirement_sessions table
ALTER TABLE public.requirement_sessions 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing records to have default values
UPDATE public.requirement_sessions 
SET tenant_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE tenant_id IS NULL;

UPDATE public.requirement_sessions 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM auth.users);

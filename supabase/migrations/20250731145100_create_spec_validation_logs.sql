-- Migration: Create spec_validation_logs table for tracking specification validation results
-- Generated on 2025-07-31

CREATE TABLE IF NOT EXISTS public.spec_validation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.spec_validation_logs ENABLE ROW LEVEL SECURITY;

-- Row-level policy: users see their tenant's logs
CREATE POLICY "Users can view tenant spec validation logs" ON public.spec_validation_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users WHERE tenant_id = spec_validation_logs.tenant_id
        )
    );

-- Migration: Create compliance_results table for storing compliance scan outcomes
-- Generated on 2025-07-31

CREATE TABLE IF NOT EXISTS public.compliance_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    flag TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;

-- Row-level policy: users see their tenant's compliance results
CREATE POLICY "Users can view tenant compliance results" ON public.compliance_results
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM public.users WHERE tenant_id = compliance_results.tenant_id
        )
    );


-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create requirement_sessions table
CREATE TABLE IF NOT EXISTS public.requirement_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    project_id UUID,
    status TEXT NOT NULL DEFAULT 'active',
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create knowledge_documents table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    domain TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    chunks_count INTEGER DEFAULT 0,
    embeddings_count INTEGER DEFAULT 0,
    processing_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create knowledge_chunks table
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding vector(1536),
    domain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rate_limit_requests table
CREATE TABLE IF NOT EXISTS public.rate_limit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_requests ENABLE ROW LEVEL SECURITY;

-- Policies for tenants
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE tenant_id = id));

-- Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Policies for requirement_sessions
CREATE POLICY "Users can manage own sessions" ON public.requirement_sessions
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE tenant_id = requirement_sessions.tenant_id));

-- Policies for knowledge_documents
CREATE POLICY "Users can manage tenant documents" ON public.knowledge_documents
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE tenant_id = knowledge_documents.tenant_id));

-- Policies for knowledge_chunks
CREATE POLICY "Users can access tenant chunks" ON public.knowledge_chunks
    FOR SELECT USING (auth.uid() IN (
        SELECT u.auth_user_id FROM public.users u 
        JOIN public.knowledge_documents d ON u.tenant_id = d.tenant_id 
        WHERE d.id = knowledge_chunks.document_id
    ));

-- Policies for audit_logs
CREATE POLICY "Users can view tenant logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE tenant_id = audit_logs.tenant_id));

-- Policies for rate_limit_requests
CREATE POLICY "Users can view own rate limits" ON public.rate_limit_requests
    FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = rate_limit_requests.user_id));

-- Insert default tenant
INSERT INTO public.tenants (name, domain) 
VALUES ('Default Organization', 'default.com')
ON CONFLICT (domain) DO NOTHING;

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    query_embedding vector(1536),
    match_domain text,
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    content text,
    document_name text,
    similarity float,
    chunk_index int
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.content,
        kd.name as document_name,
        1 - (kc.embedding <=> query_embedding) as similarity,
        kc.chunk_index
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
    AND kc.domain = match_domain
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

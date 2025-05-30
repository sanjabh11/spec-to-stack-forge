
-- Create knowledge documents table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading',
  processing_progress INTEGER DEFAULT 0,
  chunks_count INTEGER DEFAULT 0,
  embeddings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge chunks table
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.knowledge_chunks 
ADD CONSTRAINT knowledge_chunks_document_id_fkey 
FOREIGN KEY (document_id) REFERENCES public.knowledge_documents(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS knowledge_documents_domain_idx ON public.knowledge_documents(domain);
CREATE INDEX IF NOT EXISTS knowledge_documents_status_idx ON public.knowledge_documents(status);
CREATE INDEX IF NOT EXISTS knowledge_chunks_document_id_idx ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS knowledge_chunks_domain_idx ON public.knowledge_chunks(domain);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on knowledge_documents" ON public.knowledge_documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on knowledge_chunks" ON public.knowledge_chunks FOR ALL USING (true);

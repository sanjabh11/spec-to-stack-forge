
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, domain, documentId } = await req.json();

    switch (action) {
      case 'list-documents':
        return await listDocuments(domain);
      case 'get-progress':
        return await getProgress(documentId);
      case 'delete-document':
        return await deleteDocument(documentId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Knowledge base manager error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function listDocuments(domain: string) {
  const { data: documents, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('domain', domain)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const formattedDocs = documents?.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    status: doc.status,
    chunks: doc.chunks_count || 0,
    embeddings: doc.embeddings_count || 0,
    uploaded_at: doc.created_at
  })) || [];

  return new Response(JSON.stringify({
    success: true,
    documents: formattedDocs
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getProgress(documentId: string) {
  const { data: document, error } = await supabase
    .from('knowledge_documents')
    .select('processing_progress, status')
    .eq('id', documentId)
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    progress: document?.processing_progress || 0,
    status: document?.status
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteDocument(documentId: string) {
  // Delete chunks first
  await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('document_id', documentId);

  // Delete document
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    message: 'Document deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

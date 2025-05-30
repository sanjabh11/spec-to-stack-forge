
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
    const { action, ...params } = await req.json();

    switch (action) {
      case 'list-documents':
        return await listDocuments(params.domain);
      
      case 'get-progress':
        return await getProgress(params.documentId);
      
      case 'delete-document':
        return await deleteDocument(params.documentId);
        
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

  return new Response(JSON.stringify({
    success: true,
    documents: documents || []
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
    status: document?.status || 'processing'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteDocument(documentId: string) {
  // Delete chunks first
  const { error: chunksError } = await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('document_id', documentId);

  if (chunksError) throw chunksError;

  // Delete document
  const { error: docError } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', documentId);

  if (docError) throw docError;

  return new Response(JSON.stringify({
    success: true,
    message: 'Document deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

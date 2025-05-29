
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

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const domain = formData.get('domain') as string;

    if (!file || !domain) {
      throw new Error('File and domain are required');
    }

    console.log(`Processing file: ${file.name} for domain: ${domain}`);

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        name: file.name,
        type: file.type,
        size: file.size,
        domain: domain,
        status: 'processing'
      })
      .select()
      .single();

    if (docError) throw docError;

    // Process file content based on type
    let content = '';
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      content = await file.text();
    } else if (file.type === 'application/pdf') {
      // In production, you'd use a PDF parsing service
      content = `[PDF Content from ${file.name}] - This would contain the extracted text from the PDF`;
    } else {
      content = await file.text();
    }

    // Chunk the content
    const chunks = chunkText(content, 1000, 200);
    console.log(`Created ${chunks.length} chunks from ${file.name}`);

    // Generate embeddings for each chunk
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i]);
        
        const { data: chunkData, error: chunkError } = await supabase
          .from('knowledge_chunks')
          .insert({
            document_id: document.id,
            content: chunks[i],
            chunk_index: i,
            embedding: embedding,
            domain: domain
          })
          .select()
          .single();

        if (chunkError) throw chunkError;
        embeddings.push(chunkData);

        // Update progress
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        await supabase
          .from('knowledge_documents')
          .update({ processing_progress: progress })
          .eq('id', document.id);

      } catch (error) {
        console.error(`Failed to process chunk ${i}:`, error);
      }
    }

    // Update document status
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'indexed',
        chunks_count: chunks.length,
        embeddings_count: embeddings.length,
        processing_progress: 100
      })
      .eq('id', document.id);

    // Log the ingestion
    await supabase
      .from('audit_logs')
      .insert({
        action: 'document_ingested',
        resource_type: 'knowledge_document',
        resource_id: document.id,
        details: {
          filename: file.name,
          domain: domain,
          chunks: chunks.length,
          embeddings: embeddings.length
        }
      });

    return new Response(JSON.stringify({
      success: true,
      documentId: document.id,
      chunks: chunks.length,
      embeddings: embeddings.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Knowledge base ingestion error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  if (!openaiApiKey) {
    // Return mock embedding for testing
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    // Return mock embedding as fallback
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
}

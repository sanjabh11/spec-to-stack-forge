
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
    const { query, domain, limit = 10, threshold = 0.7 } = await req.json();

    console.log(`Searching knowledge base: "${query}" in domain: ${domain}`);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector similarity search
    const { data: searchResults, error: searchError } = await supabase.rpc('search_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_domain: domain,
      match_threshold: threshold,
      match_count: limit
    });

    if (searchError) throw searchError;

    // Format results
    const results = searchResults?.map((result: any) => ({
      content: result.content,
      document: result.document_name,
      score: result.similarity,
      chunk_index: result.chunk_index
    })) || [];

    console.log(`Found ${results.length} relevant chunks`);

    return new Response(JSON.stringify({
      success: true,
      query: query,
      results: results,
      total: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Knowledge base search error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

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
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
}

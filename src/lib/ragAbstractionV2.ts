
// Enhanced RAG abstraction with LlamaIndex integration support

export interface VectorStoreConfig {
  name: string;
  type: 'chromadb' | 'weaviate' | 'qdrant' | 'llamaindex';
  endpoint: string;
  apiKey?: string;
  collection: string;
  dimensions: number;
  isActive: boolean;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  parentDocId: string;
  chunkIndex: number;
}

export interface RAGSearchResult {
  document: DocumentChunk;
  score: number;
  distance: number;
}

export interface RAGIngestionRequest {
  documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
  storeName?: string;
  namespace?: string;
}

export interface RAGSearchRequest {
  query: string;
  storeName?: string;
  namespace?: string;
  topK?: number;
  scoreThreshold?: number;
}

export class EnhancedRAGManager {
  private vectorStores: Map<string, VectorStoreConfig> = new Map();
  private defaultStore: string = 'chromadb-default';

  constructor() {
    this.initializeDefaultStores();
  }

  private initializeDefaultStores() {
    // ChromaDB (existing)
    this.addVectorStore({
      name: 'chromadb-default',
      type: 'chromadb',
      endpoint: 'http://localhost:8000',
      collection: 'documents',
      dimensions: 1536,
      isActive: true
    });

    // Weaviate Cloud
    this.addVectorStore({
      name: 'weaviate-cloud',
      type: 'weaviate',
      endpoint: 'https://your-cluster.weaviate.network',
      collection: 'Document',
      dimensions: 1536,
      isActive: false
    });

    // LlamaIndex integration
    this.addVectorStore({
      name: 'llamaindex-chroma',
      type: 'llamaindex',
      endpoint: 'http://localhost:8002',
      collection: 'llamaindex_docs',
      dimensions: 1536,
      isActive: false
    });
  }

  addVectorStore(config: VectorStoreConfig) {
    this.vectorStores.set(config.name, config);
  }

  getVectorStore(name: string): VectorStoreConfig | undefined {
    return this.vectorStores.get(name);
  }

  listVectorStores(): VectorStoreConfig[] {
    return Array.from(this.vectorStores.values());
  }

  async ingestDocuments(request: RAGIngestionRequest): Promise<void> {
    const store = this.getVectorStore(request.storeName || this.defaultStore);
    if (!store) {
      throw new Error(`Vector store ${request.storeName} not found`);
    }

    console.log(`Ingesting ${request.documents.length} documents into ${store.name}...`);

    switch (store.type) {
      case 'chromadb':
        return this.ingestToChroma(store, request);
      case 'weaviate':
        return this.ingestToWeaviate(store, request);
      case 'llamaindex':
        return this.ingestToLlamaIndex(store, request);
      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }

  async search(request: RAGSearchRequest): Promise<RAGSearchResult[]> {
    const store = this.getVectorStore(request.storeName || this.defaultStore);
    if (!store) {
      throw new Error(`Vector store ${request.storeName} not found`);
    }

    switch (store.type) {
      case 'chromadb':
        return this.searchChroma(store, request);
      case 'weaviate':
        return this.searchWeaviate(store, request);
      case 'llamaindex':
        return this.searchLlamaIndex(store, request);
      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }

  private async ingestToChroma(store: VectorStoreConfig, request: RAGIngestionRequest): Promise<void> {
    const chunks = this.chunkDocuments(request.documents);
    const embeddings = await this.generateEmbeddings(chunks.map(c => c.content));

    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i];
    }

    const response = await fetch(`${store.endpoint}/api/v1/collections/${store.collection}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: chunks.map(c => c.id),
        embeddings: chunks.map(c => c.embedding),
        documents: chunks.map(c => c.content),
        metadatas: chunks.map(c => ({
          ...c.metadata,
          namespace: request.namespace || 'default',
          parentDocId: c.parentDocId
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`ChromaDB ingestion failed: ${await response.text()}`);
    }
  }

  private async ingestToWeaviate(store: VectorStoreConfig, request: RAGIngestionRequest): Promise<void> {
    const chunks = this.chunkDocuments(request.documents);
    
    for (const chunk of chunks) {
      const embedding = await this.generateEmbeddings([chunk.content]);
      
      const response = await fetch(`${store.endpoint}/v1/objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(store.apiKey && { 'Authorization': `Bearer ${store.apiKey}` })
        },
        body: JSON.stringify({
          class: store.collection,
          id: chunk.id,
          properties: {
            content: chunk.content,
            namespace: request.namespace || 'default',
            parentDocId: chunk.parentDocId,
            ...chunk.metadata
          },
          vector: embedding[0]
        })
      });

      if (!response.ok) {
        throw new Error(`Weaviate ingestion failed: ${await response.text()}`);
      }
    }
  }

  private async ingestToLlamaIndex(store: VectorStoreConfig, request: RAGIngestionRequest): Promise<void> {
    const response = await fetch(`${store.endpoint}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: request.documents,
        namespace: request.namespace || 'default',
        collection: store.collection
      })
    });

    if (!response.ok) {
      throw new Error(`LlamaIndex ingestion failed: ${await response.text()}`);
    }
  }

  private async searchChroma(store: VectorStoreConfig, request: RAGSearchRequest): Promise<RAGSearchResult[]> {
    const queryEmbedding = await this.generateEmbeddings([request.query]);
    
    const response = await fetch(`${store.endpoint}/api/v1/collections/${store.collection}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_embeddings: queryEmbedding,
        n_results: request.topK || 5,
        where: request.namespace ? { namespace: request.namespace } : undefined
      })
    });

    const data = await response.json();
    return data.documents[0].map((content: string, i: number) => ({
      document: {
        id: data.ids[0][i],
        content,
        metadata: data.metadatas[0][i],
        parentDocId: data.metadatas[0][i].parentDocId,
        chunkIndex: i
      },
      score: 1 - data.distances[0][i],
      distance: data.distances[0][i]
    }));
  }

  private async searchWeaviate(store: VectorStoreConfig, request: RAGSearchRequest): Promise<RAGSearchResult[]> {
    const queryEmbedding = await this.generateEmbeddings([request.query]);
    
    const response = await fetch(`${store.endpoint}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(store.apiKey && { 'Authorization': `Bearer ${store.apiKey}` })
      },
      body: JSON.stringify({
        query: `
          {
            Get {
              ${store.collection}(
                nearVector: {
                  vector: [${queryEmbedding[0].join(',')}]
                  certainty: ${request.scoreThreshold || 0.7}
                }
                limit: ${request.topK || 5}
                ${request.namespace ? `where: {path: ["namespace"], operator: Equal, valueText: "${request.namespace}"}` : ''}
              ) {
                content
                namespace
                parentDocId
                _additional {
                  id
                  certainty
                  distance
                }
              }
            }
          }
        `
      })
    });

    const data = await response.json();
    const documents = data.data.Get[store.collection] || [];
    
    return documents.map((doc: any, i: number) => ({
      document: {
        id: doc._additional.id,
        content: doc.content,
        metadata: { namespace: doc.namespace },
        parentDocId: doc.parentDocId,
        chunkIndex: i
      },
      score: doc._additional.certainty,
      distance: doc._additional.distance
    }));
  }

  private async searchLlamaIndex(store: VectorStoreConfig, request: RAGSearchRequest): Promise<RAGSearchResult[]> {
    const response = await fetch(`${store.endpoint}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: request.query,
        namespace: request.namespace || 'default',
        top_k: request.topK || 5,
        collection: store.collection
      })
    });

    const data = await response.json();
    return data.results.map((result: any, i: number) => ({
      document: {
        id: result.id,
        content: result.content,
        metadata: result.metadata,
        parentDocId: result.metadata.parentDocId,
        chunkIndex: i
      },
      score: result.score,
      distance: 1 - result.score
    }));
  }

  private chunkDocuments(documents: Array<{ id: string; content: string; metadata?: Record<string, any> }>): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const chunkSize = 1000;
    const overlap = 200;

    for (const doc of documents) {
      const text = doc.content;
      let chunkIndex = 0;

      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize);
        chunks.push({
          id: `${doc.id}_chunk_${chunkIndex}`,
          content: chunk,
          metadata: doc.metadata || {},
          parentDocId: doc.id,
          chunkIndex: chunkIndex++
        });
      }
    }

    return chunks;
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Mock embeddings for now - in production, this would call an embedding service
    return texts.map(() => Array(1536).fill(0).map(() => Math.random()));
  }

  setDefaultStore(storeName: string) {
    if (this.vectorStores.has(storeName)) {
      this.defaultStore = storeName;
    }
  }

  getDefaultStore(): string {
    return this.defaultStore;
  }
}

export const enhancedRAGManager = new EnhancedRAGManager();

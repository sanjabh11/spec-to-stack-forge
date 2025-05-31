
// Advanced RAG abstraction layer with multiple vector store support

export interface VectorStore {
  name: string;
  type: 'chromadb' | 'weaviate' | 'qdrant' | 'pinecone';
  endpoint: string;
  apiKey?: string;
  collection: string;
  dimensions: number;
}

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  document: Document;
  score: number;
  distance: number;
}

export interface RAGConfig {
  vectorStore: VectorStore;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  scoreThreshold: number;
}

export class RAGManager {
  private vectorStores: Map<string, VectorStore> = new Map();
  private config: RAGConfig;

  constructor(config?: Partial<RAGConfig>) {
    this.config = {
      vectorStore: {
        name: 'chromadb-default',
        type: 'chromadb',
        endpoint: 'http://localhost:8000',
        collection: 'documents',
        dimensions: 1536
      },
      embeddingModel: 'text-embedding-3-large',
      chunkSize: 1000,
      chunkOverlap: 200,
      topK: 5,
      scoreThreshold: 0.7,
      ...config
    };

    this.initializeVectorStores();
  }

  private initializeVectorStores() {
    // ChromaDB (default)
    this.addVectorStore({
      name: 'chromadb-default',
      type: 'chromadb',
      endpoint: 'http://localhost:8000',
      collection: 'documents',
      dimensions: 1536
    });

    // Weaviate
    this.addVectorStore({
      name: 'weaviate-cloud',
      type: 'weaviate',
      endpoint: 'https://cluster.weaviate.network',
      collection: 'Document',
      dimensions: 1536
    });

    // Qdrant
    this.addVectorStore({
      name: 'qdrant-local',
      type: 'qdrant',
      endpoint: 'http://localhost:6333',
      collection: 'documents',
      dimensions: 1536
    });
  }

  addVectorStore(store: VectorStore) {
    this.vectorStores.set(store.name, store);
  }

  async ingestDocuments(documents: Document[], storeName?: string): Promise<void> {
    const store = storeName ? this.vectorStores.get(storeName) : this.config.vectorStore;
    if (!store) {
      throw new Error(`Vector store ${storeName} not found`);
    }

    console.log(`Ingesting ${documents.length} documents into ${store.name}...`);

    // Chunk documents
    const chunks = this.chunkDocuments(documents);
    
    // Generate embeddings
    const embeddings = await this.generateEmbeddings(chunks.map(c => c.content));
    
    // Store in vector database
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i];
    }

    await this.storeVectors(store, chunks);
  }

  async search(query: string, storeName?: string): Promise<SearchResult[]> {
    const store = storeName ? this.vectorStores.get(storeName) : this.config.vectorStore;
    if (!store) {
      throw new Error(`Vector store ${storeName} not found`);
    }

    // Generate query embedding
    const queryEmbedding = await this.generateEmbeddings([query]);
    
    // Search vector store
    const results = await this.searchVectors(store, queryEmbedding[0]);
    
    return results.filter(r => r.score >= this.config.scoreThreshold);
  }

  private chunkDocuments(documents: Document[]): Document[] {
    const chunks: Document[] = [];

    for (const doc of documents) {
      const text = doc.content;
      const chunkSize = this.config.chunkSize;
      const overlap = this.config.chunkOverlap;

      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize);
        chunks.push({
          id: `${doc.id}_chunk_${chunks.length}`,
          content: chunk,
          metadata: {
            ...doc.metadata,
            parent_id: doc.id,
            chunk_index: chunks.length,
            chunk_size: chunk.length
          }
        });
      }
    }

    return chunks;
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // This would call your embedding service
    // For now, returning dummy embeddings
    return texts.map(() => Array(this.config.vectorStore.dimensions).fill(0).map(() => Math.random()));
  }

  private async storeVectors(store: VectorStore, documents: Document[]): Promise<void> {
    switch (store.type) {
      case 'chromadb':
        return this.storeInChroma(store, documents);
      case 'weaviate':
        return this.storeInWeaviate(store, documents);
      case 'qdrant':
        return this.storeInQdrant(store, documents);
      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }

  private async searchVectors(store: VectorStore, queryEmbedding: number[]): Promise<SearchResult[]> {
    switch (store.type) {
      case 'chromadb':
        return this.searchChroma(store, queryEmbedding);
      case 'weaviate':
        return this.searchWeaviate(store, queryEmbedding);
      case 'qdrant':
        return this.searchQdrant(store, queryEmbedding);
      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }

  private async storeInChroma(store: VectorStore, documents: Document[]): Promise<void> {
    const response = await fetch(`${store.endpoint}/api/v1/collections/${store.collection}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: documents.map(d => d.id),
        embeddings: documents.map(d => d.embedding),
        documents: documents.map(d => d.content),
        metadatas: documents.map(d => d.metadata)
      })
    });

    if (!response.ok) {
      throw new Error(`ChromaDB error: ${await response.text()}`);
    }
  }

  private async searchChroma(store: VectorStore, queryEmbedding: number[]): Promise<SearchResult[]> {
    const response = await fetch(`${store.endpoint}/api/v1/collections/${store.collection}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_embeddings: [queryEmbedding],
        n_results: this.config.topK
      })
    });

    const data = await response.json();
    return data.documents[0].map((content: string, i: number) => ({
      document: {
        id: data.ids[0][i],
        content,
        metadata: data.metadatas[0][i]
      },
      score: 1 - data.distances[0][i], // Convert distance to similarity
      distance: data.distances[0][i]
    }));
  }

  private async storeInWeaviate(store: VectorStore, documents: Document[]): Promise<void> {
    // Weaviate implementation
    for (const doc of documents) {
      const response = await fetch(`${store.endpoint}/v1/objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(store.apiKey && { 'Authorization': `Bearer ${store.apiKey}` })
        },
        body: JSON.stringify({
          class: store.collection,
          id: doc.id,
          properties: {
            content: doc.content,
            ...doc.metadata
          },
          vector: doc.embedding
        })
      });

      if (!response.ok) {
        throw new Error(`Weaviate error: ${await response.text()}`);
      }
    }
  }

  private async searchWeaviate(store: VectorStore, queryEmbedding: number[]): Promise<SearchResult[]> {
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
                  vector: [${queryEmbedding.join(',')}]
                  certainty: ${this.config.scoreThreshold}
                }
                limit: ${this.config.topK}
              ) {
                content
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
    
    return documents.map((doc: any) => ({
      document: {
        id: doc._additional.id,
        content: doc.content,
        metadata: {}
      },
      score: doc._additional.certainty,
      distance: doc._additional.distance
    }));
  }

  private async storeInQdrant(store: VectorStore, documents: Document[]): Promise<void> {
    const points = documents.map(doc => ({
      id: doc.id,
      vector: doc.embedding,
      payload: {
        content: doc.content,
        ...doc.metadata
      }
    }));

    const response = await fetch(`${store.endpoint}/collections/${store.collection}/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(store.apiKey && { 'Api-Key': store.apiKey })
      },
      body: JSON.stringify({
        points
      })
    });

    if (!response.ok) {
      throw new Error(`Qdrant error: ${await response.text()}`);
    }
  }

  private async searchQdrant(store: VectorStore, queryEmbedding: number[]): Promise<SearchResult[]> {
    const response = await fetch(`${store.endpoint}/collections/${store.collection}/points/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(store.apiKey && { 'Api-Key': store.apiKey })
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        limit: this.config.topK,
        score_threshold: this.config.scoreThreshold,
        with_payload: true
      })
    });

    const data = await response.json();
    
    return data.result.map((point: any) => ({
      document: {
        id: point.id,
        content: point.payload.content,
        metadata: point.payload
      },
      score: point.score,
      distance: 1 - point.score
    }));
  }

  updateConfig(newConfig: Partial<RAGConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getAvailableStores(): VectorStore[] {
    return Array.from(this.vectorStores.values());
  }
}

export const ragManager = new RAGManager();

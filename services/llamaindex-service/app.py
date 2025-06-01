
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.vector_stores.weaviate import WeaviateVectorStore
import chromadb
import weaviate

app = FastAPI(title="LlamaIndex RAG Service", version="1.0.0")

class IngestRequest(BaseModel):
    documents: List[Dict[str, str]]  # [{"id": "...", "content": "..."}]
    namespace: str = "default"
    collection: str = "documents"

class SearchRequest(BaseModel):
    query: str
    namespace: str = "default"
    top_k: int = 5
    collection: str = "documents"

class SearchResult(BaseModel):
    id: str
    content: str
    score: float
    metadata: Dict

# Vector store configurations
VECTOR_STORES = {
    "chromadb": {
        "client": chromadb.PersistentClient(path="./chroma_db"),
        "type": "chroma"
    },
    "weaviate": {
        "client": weaviate.Client(os.getenv("WEAVIATE_URL", "http://localhost:8080")),
        "type": "weaviate"
    }
}

def get_vector_store(store_type: str = "chromadb", collection_name: str = "documents"):
    """Get vector store instance"""
    if store_type == "chromadb":
        chroma_client = VECTOR_STORES["chromadb"]["client"]
        chroma_collection = chroma_client.get_or_create_collection(collection_name)
        return ChromaVectorStore(chroma_collection=chroma_collection)
    
    elif store_type == "weaviate":
        weaviate_client = VECTOR_STORES["weaviate"]["client"]
        return WeaviateVectorStore(
            weaviate_client=weaviate_client,
            index_name=collection_name.title()
        )
    
    else:
        raise ValueError(f"Unsupported vector store: {store_type}")

@app.post("/ingest")
async def ingest_documents(request: IngestRequest):
    """Ingest documents using LlamaIndex"""
    try:
        # Convert documents to LlamaIndex Document objects
        documents = []
        for doc in request.documents:
            documents.append(Document(
                text=doc["content"],
                doc_id=doc["id"],
                metadata={"namespace": request.namespace}
            ))
        
        # Create vector store and index
        vector_store = get_vector_store("chromadb", request.collection)
        index = VectorStoreIndex.from_documents(
            documents,
            vector_store=vector_store
        )
        
        return {
            "status": "success",
            "documents_ingested": len(documents),
            "namespace": request.namespace,
            "collection": request.collection
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@app.post("/search")
async def search_documents(request: SearchRequest):
    """Search documents using LlamaIndex"""
    try:
        # Get vector store and create retriever
        vector_store = get_vector_store("chromadb", request.collection)
        index = VectorStoreIndex.from_vector_store(vector_store)
        
        # Create query engine with retrieval
        query_engine = index.as_query_engine(
            similarity_top_k=request.top_k,
            vector_store_query_mode="default"
        )
        
        # Execute query
        response = query_engine.query(request.query)
        
        # Extract source documents and scores
        results = []
        for node in response.source_nodes:
            results.append(SearchResult(
                id=node.node.doc_id,
                content=node.node.text,
                score=node.score if hasattr(node, 'score') else 0.0,
                metadata=node.node.metadata
            ))
        
        return {
            "results": results,
            "query": request.query,
            "namespace": request.namespace
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "vector_stores": list(VECTOR_STORES.keys())
    }

@app.get("/collections")
async def list_collections():
    """List available collections"""
    collections = []
    try:
        # ChromaDB collections
        chroma_client = VECTOR_STORES["chromadb"]["client"]
        chroma_collections = chroma_client.list_collections()
        for col in chroma_collections:
            collections.append({
                "name": col.name,
                "type": "chromadb",
                "count": col.count()
            })
    except Exception as e:
        print(f"Error listing ChromaDB collections: {e}")
    
    return {"collections": collections}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

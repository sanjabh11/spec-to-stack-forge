
#!/bin/bash

echo "🧪 Testing Enhanced AI Platform..."

# Test LLM Inference Gateway
echo "Testing LLM Inference Gateway..."
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3-70b", "prompt": "Hello, world!", "max_tokens": 10}' \
  --max-time 30

echo -e "\n"

# Test LlamaIndex Service
echo "Testing LlamaIndex Service..."
curl -X GET http://localhost:8002/health \
  --max-time 10

echo -e "\n"

# Test Vector Store ingestion
echo "Testing Vector Store Ingestion..."
curl -X POST http://localhost:8002/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {"id": "test1", "content": "This is a test document for RAG."}
    ],
    "namespace": "test",
    "collection": "test_docs"
  }' \
  --max-time 30

echo -e "\n"

# Test Vector Store search
echo "Testing Vector Store Search..."
curl -X POST http://localhost:8002/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test document",
    "namespace": "test",
    "top_k": 3,
    "collection": "test_docs"
  }' \
  --max-time 30

echo -e "\n✅ All tests completed!"

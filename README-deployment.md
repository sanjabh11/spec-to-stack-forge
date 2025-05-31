
# AI Platform Deployment Guide

This guide covers deploying the AI Platform with LLaMA 3 70B, Mistral, and multi-vector store support on CoreWeave.

## Prerequisites

1. **CoreWeave Account**: Get access to CoreWeave GPU cloud
2. **kubectl**: Configure for CoreWeave cluster
3. **Hugging Face Token**: For model downloads
4. **Docker**: For building custom images (optional)

## Quick Start

### 1. Deploy All Models

```bash
# Set your Hugging Face token
export HUGGING_FACE_TOKEN="your_token_here"

# Deploy all models (LLaMA 3 70B + Mistral 7B)
./scripts/deploy-all-models.sh
```

### 2. Monitor Deployment

```bash
# Monitor GPU usage and model health
./scripts/gpu-monitor.sh

# Check specific model status
kubectl get pods -n ai-models
```

### 3. Scale Models

```bash
# Scale up for high load
./scripts/scale-model.sh up

# Scale down to save costs
./scripts/scale-model.sh down
```

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │───▶│  LLM Gateway     │───▶│  Model Cluster  │
│                 │    │  (Supabase Edge) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                │                 │
                                                ├─ LLaMA 3 70B    │
                                                ├─ Mistral 7B     │
                                                └─ Gemini (API)   │

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   RAG Manager   │───▶│  Vector Stores   │───▶│  Knowledge Base │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                │                 │
                                                ├─ ChromaDB       │
                                                ├─ Weaviate       │
                                                └─ Qdrant         │
```

## Model Configurations

### LLaMA 3 70B
- **Hardware**: 4x NVIDIA A100 (80GB)
- **Memory**: 128GB RAM
- **Tensor Parallel**: 4-way split
- **Context Length**: 4096 tokens
- **Cost**: ~$10/hour

### Mistral 7B
- **Hardware**: 1x NVIDIA RTX A5000
- **Memory**: 24GB RAM
- **Context Length**: 2048 tokens
- **Cost**: ~$1.50/hour

## Vector Store Setup

### ChromaDB (Default)
```bash
# Already included in deployment
# Accessible at: http://chromadb-service:8000
```

### Weaviate Cloud
```bash
# Set up Weaviate cloud instance
export WEAVIATE_URL="https://your-cluster.weaviate.network"
export WEAVIATE_API_KEY="your_api_key"
```

### Qdrant Local
```bash
# Deploy Qdrant locally
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
  namespace: ai-models
spec:
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        - containerPort: 6334
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant-service
  namespace: ai-models
spec:
  selector:
    app: qdrant
  ports:
  - name: http
    port: 6333
    targetPort: 6333
  - name: grpc
    port: 6334
    targetPort: 6334
EOF
```

## Testing

### Model Health Check
```bash
# Test LLaMA 3
curl -X POST http://llama3-service:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "meta-llama/Meta-Llama-3-70B-Instruct", "prompt": "Hello", "max_tokens": 50}'

# Test Mistral
curl -X POST http://mistral-service:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "mistralai/Mistral-7B-Instruct-v0.2", "prompt": "Hello", "max_tokens": 50}'
```

### RAG Pipeline Test
```bash
# Test document ingestion
curl -X POST http://your-app/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"documents": [{"id": "test", "content": "Test document"}]}'

# Test search
curl -X POST http://your-app/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "store": "chromadb-default"}'
```

## Cost Optimization

### Automatic Scaling
- **Scale down** during off-hours
- **Scale up** during peak usage
- Use **spot instances** for development

### Model Selection
- **Mistral 7B**: Fast, cost-effective for simple tasks
- **LLaMA 3 70B**: High quality for complex reasoning
- **Gemini API**: Pay-per-use for occasional queries

### Resource Management
```bash
# Set resource quotas
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: gpu-quota
  namespace: ai-models
spec:
  hard:
    requests.nvidia.com/gpu: "8"
    limits.nvidia.com/gpu: "8"
EOF
```

## Monitoring & Observability

### GPU Metrics
- **Utilization**: Target 80-90% for efficiency
- **Memory**: Monitor VRAM usage
- **Temperature**: Keep under thermal limits

### Model Performance
- **Latency**: Target <2s for inference
- **Throughput**: Monitor tokens/second
- **Error Rate**: Track failed requests

### Cost Tracking
- **GPU Hours**: Primary cost driver
- **API Calls**: For external models
- **Storage**: Vector database size

## Troubleshooting

### Common Issues

1. **Out of Memory**
   - Reduce batch size
   - Enable model quantization
   - Use gradient checkpointing

2. **Slow Inference**
   - Increase tensor parallelism
   - Optimize batch batching
   - Use faster GPU types

3. **Connection Timeouts**
   - Increase health check timeouts
   - Check network policies
   - Verify service endpoints

### Debug Commands
```bash
# Check pod logs
kubectl logs -n ai-models deployment/llama3-70b-vllm

# Shell into pod
kubectl exec -it -n ai-models deployment/llama3-70b-vllm -- bash

# Check GPU status
kubectl exec -n ai-models deployment/llama3-70b-vllm -- nvidia-smi
```

## Security

### Network Policies
```bash
# Restrict access to model pods
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ai-models-policy
  namespace: ai-models
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: default
EOF
```

### Secrets Management
- Store API keys in Kubernetes secrets
- Use RBAC for access control
- Rotate credentials regularly

## Production Checklist

- [ ] Models deployed and healthy
- [ ] Vector stores configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Security policies applied
- [ ] Cost alerts configured
- [ ] Documentation updated

## Support

For issues:
1. Check logs: `kubectl logs -n ai-models <pod-name>`
2. Monitor GPU: `./scripts/gpu-monitor.sh`
3. Test endpoints: Use provided curl commands
4. Scale if needed: `./scripts/scale-model.sh`

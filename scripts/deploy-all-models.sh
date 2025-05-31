
#!/bin/bash
set -e

echo "🚀 Deploying All AI Models on CoreWeave..."

# Check prerequisites
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl not configured for CoreWeave"
    exit 1
fi

if [ -z "$HUGGING_FACE_TOKEN" ]; then
    echo "❌ HUGGING_FACE_TOKEN required"
    exit 1
fi

# Create namespace
kubectl create namespace ai-models --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
kubectl create secret generic model-secrets \
    --from-literal=hf-token="$HUGGING_FACE_TOKEN" \
    --namespace=ai-models \
    --dry-run=client -o yaml | kubectl apply -f -

echo "📦 Deploying LLaMA 3 70B..."
kubectl apply -f k8s/llama3-deployment.yml

echo "📦 Deploying Mistral 7B..."
cat << EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mistral-7b-vllm
  namespace: ai-models
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mistral-7b
  template:
    metadata:
      labels:
        app: mistral-7b
    spec:
      nodeSelector:
        coreweave.com/gpu: "true"
        node.coreweave.com/class: "rtx-a5000"
      containers:
      - name: vllm-server
        image: vllm/vllm-openai:latest
        command: ["python", "-m", "vllm.entrypoints.openai.api_server"]
        args:
          - "--model"
          - "mistralai/Mistral-7B-Instruct-v0.2"
          - "--host"
          - "0.0.0.0"
          - "--port"
          - "8000"
          - "--tensor-parallel-size"
          - "1"
          - "--dtype"
          - "float16"
        ports:
        - containerPort: 8000
        env:
        - name: HUGGING_FACE_HUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: model-secrets
              key: hf-token
        resources:
          requests:
            nvidia.com/gpu: 1
            memory: "16Gi"
          limits:
            nvidia.com/gpu: 1
            memory: "24Gi"
---
apiVersion: v1
kind: Service
metadata:
  name: mistral-service
  namespace: ai-models
spec:
  selector:
    app: mistral-7b
  ports:
  - port: 8000
    targetPort: 8000
EOF

echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=1200s deployment/llama3-70b-vllm -n ai-models
kubectl wait --for=condition=available --timeout=600s deployment/mistral-7b-vllm -n ai-models

echo "✅ All models deployed successfully!"
echo "🔍 Monitor with: ./scripts/gpu-monitor.sh"
echo "📊 Scale with: ./scripts/scale-model.sh"

# Test endpoints
echo "🧪 Testing model endpoints..."
LLAMA_IP=$(kubectl get svc llama3-70b-service -n ai-models -o jsonpath='{.spec.clusterIP}')
MISTRAL_IP=$(kubectl get svc mistral-service -n ai-models -o jsonpath='{.spec.clusterIP}')

echo "LLaMA 3 70B: http://$LLAMA_IP:8000"
echo "Mistral 7B: http://$MISTRAL_IP:8000"

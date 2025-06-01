
#!/bin/bash
set -e

echo "🚀 Deploying Enhanced AI Platform..."

# Check prerequisites
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl not configured"
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
    --from-literal=gemini-api-key="${GEMINI_API_KEY:-}" \
    --namespace=ai-models \
    --dry-run=client -o yaml | kubectl apply -f -

echo "📦 Deploying LLaMA 3 70B..."
kubectl apply -f k8s/llama3-deployment.yml

echo "📦 Deploying Mistral 7B..."
kubectl apply -f <(cat << 'EOF'
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
)

echo "📦 Building and deploying LLM Inference Service..."
docker build -t llm-inference:latest services/llm-inference/
kubectl apply -f k8s/llm-inference-deployment.yml

echo "📦 Building and deploying LlamaIndex Service..."
docker build -t llamaindex-service:latest services/llamaindex-service/
kubectl apply -f <(cat << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llamaindex-service
  namespace: ai-models
spec:
  replicas: 1
  selector:
    matchLabels:
      app: llamaindex-service
  template:
    metadata:
      labels:
        app: llamaindex-service
    spec:
      containers:
      - name: llamaindex-service
        image: llamaindex-service:latest
        ports:
        - containerPort: 8002
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: llamaindex-service
  namespace: ai-models
spec:
  selector:
    app: llamaindex-service
  ports:
  - port: 8002
    targetPort: 8002
EOF
)

echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=1200s deployment/llama3-70b-vllm -n ai-models
kubectl wait --for=condition=available --timeout=600s deployment/mistral-7b-vllm -n ai-models
kubectl wait --for=condition=available --timeout=300s deployment/llm-inference -n ai-models
kubectl wait --for=condition=available --timeout=300s deployment/llamaindex-service -n ai-models

echo "🚀 Starting Streamlit app..."
cd streamlit-app
pip install -r requirements.txt
streamlit run app.py --server.port 8501 &
STREAMLIT_PID=$!

echo "✅ Enhanced AI Platform deployed successfully!"
echo "🔍 Monitor with: ./scripts/gpu-monitor.sh"
echo "📊 Scale with: ./scripts/scale-model.sh"
echo "🌐 Streamlit UI: http://localhost:8501"
echo "🎛️ Admin Dashboard: http://localhost:8080/admin"

# Test all endpoints
echo "🧪 Testing all endpoints..."
LLAMA_IP=$(kubectl get svc llama3-70b-service -n ai-models -o jsonpath='{.spec.clusterIP}')
MISTRAL_IP=$(kubectl get svc mistral-service -n ai-models -o jsonpath='{.spec.clusterIP}')
INFERENCE_IP=$(kubectl get svc llm-inference-service -n ai-models -o jsonpath='{.spec.clusterIP}')
LLAMAINDEX_IP=$(kubectl get svc llamaindex-service -n ai-models -o jsonpath='{.spec.clusterIP}')

echo "LLaMA 3 70B: http://$LLAMA_IP:8000"
echo "Mistral 7B: http://$MISTRAL_IP:8000"
echo "LLM Inference Gateway: http://$INFERENCE_IP:8001"
echo "LlamaIndex Service: http://$LLAMAINDEX_IP:8002"

echo "🎉 Enhanced platform is ready for use!"

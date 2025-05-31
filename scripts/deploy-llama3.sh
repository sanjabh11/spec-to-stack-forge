
#!/bin/bash
set -e

echo "🚀 Deploying LLaMA 3 70B on CoreWeave..."

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl not configured. Please configure CoreWeave cluster access."
    exit 1
fi

# Check if HF token is provided
if [ -z "$HUGGING_FACE_TOKEN" ]; then
    echo "❌ HUGGING_FACE_TOKEN environment variable is required"
    echo "Get your token from: https://huggingface.co/settings/tokens"
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace ai-models --dry-run=client -o yaml | kubectl apply -f -

# Create secret with HF token
kubectl create secret generic model-secrets \
    --from-literal=hf-token="$HUGGING_FACE_TOKEN" \
    --namespace=ai-models \
    --dry-run=client -o yaml | kubectl apply -f -

# Apply deployment
kubectl apply -f k8s/llama3-deployment.yml

echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=1200s deployment/llama3-70b-vllm -n ai-models

# Get service endpoint
SERVICE_IP=$(kubectl get svc llama3-70b-service -n ai-models -o jsonpath='{.spec.clusterIP}')
echo "✅ LLaMA 3 70B deployed successfully!"
echo "📡 Service endpoint: http://$SERVICE_IP:8000"
echo "🧪 Test with: curl -X POST http://$SERVICE_IP:8000/v1/completions -H 'Content-Type: application/json' -d '{\"model\": \"meta-llama/Meta-Llama-3-70B-Instruct\", \"prompt\": \"Hello\", \"max_tokens\": 50}'"

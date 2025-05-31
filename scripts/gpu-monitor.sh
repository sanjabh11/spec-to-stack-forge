
#!/bin/bash
# GPU monitoring script for CoreWeave

NAMESPACE="ai-models"
DEPLOYMENT="llama3-70b-vllm"

echo "🔍 GPU Monitoring Dashboard"
echo "=========================="

while true; do
    clear
    echo "🔍 GPU Monitoring - $(date)"
    echo "=========================="
    
    # Get pod status
    echo "📊 Pod Status:"
    kubectl get pods -n $NAMESPACE -l app=llama3-70b
    echo ""
    
    # Get GPU usage
    echo "🎮 GPU Utilization:"
    kubectl exec -n $NAMESPACE $(kubectl get pods -n $NAMESPACE -l app=llama3-70b -o jsonpath='{.items[0].metadata.name}') -- nvidia-smi --query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null || echo "GPU metrics unavailable"
    echo ""
    
    # Get service status
    echo "🌐 Service Status:"
    kubectl get svc -n $NAMESPACE
    echo ""
    
    # Test model health
    echo "🏥 Model Health Check:"
    SERVICE_IP=$(kubectl get svc llama3-70b-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
    if [ ! -z "$SERVICE_IP" ]; then
        curl -s -X GET http://$SERVICE_IP:8000/health | jq . 2>/dev/null || echo "Health check failed"
    else
        echo "Service not available"
    fi
    echo ""
    
    echo "Press Ctrl+C to exit"
    sleep 10
done

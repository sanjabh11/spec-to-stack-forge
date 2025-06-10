
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import httpx
import json
import os
from datetime import datetime
import logging
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Advisor Orchestration API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service endpoints
SERVICES = {
    "llm_inference": os.getenv("LLM_INFERENCE_URL", "http://llm-inference:8001"),
    "llamaindex": os.getenv("LLAMAINDEX_URL", "http://llamaindex-service:8002"),
    "n8n": os.getenv("N8N_URL", "http://n8n:5678"),
    "monitoring": os.getenv("MONITORING_URL", "http://grafana:3000")
}

N8N_API_KEY = os.getenv("N8N_API_KEY")

# Request/Response Models
class SpecBuilderRequest(BaseModel):
    domain: str
    subdomain: str
    requirements: Dict[str, Any]
    tenant_id: str
    user_id: str

class PromptChainRequest(BaseModel):
    chain_type: str
    inputs: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class WorkflowRequest(BaseModel):
    workflow_id: str
    inputs: Dict[str, Any]
    tenant_id: str

class RAGRequest(BaseModel):
    query: str
    domain: Optional[str] = "default"
    namespace: Optional[str] = "default"
    top_k: Optional[int] = 3
    use_llm: Optional[bool] = True

# Supabase initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        supabase = None
else:
    logger.warning("Supabase URL or Service Key not set. Falling back to in-code config.")

# Domain-specific system prompts
SYSTEM_PROMPTS = {
    "legal": "You are a highly astute AI legal assistant. Your expertise lies in analyzing legal documents, case law, contracts, and filings. You are precise, objective, and always maintain confidentiality. When answering questions or summarizing, refer explicitly to the provided context. Avoid speculation and clearly state if the provided information is insufficient to answer. Your tone should be formal and professional.",
    "finance": "You are an expert AI financial analyst and auditor. You specialize in interpreting financial reports, audit logs, and regulatory compliance documents. You are meticulous, detail-oriented, and prioritize accuracy above all. When analyzing data, highlight key figures, trends, and potential risks. Your responses should be data-driven and clearly articulated for a financial professional audience.",
    "hr_policy": "You are a helpful and knowledgeable AI HR assistant. Your role is to provide clear and accurate information about company policies, benefits, and procedures based on the official HR documents. You are empathetic, patient, and maintain a supportive tone. Ensure employee privacy is respected. If a question falls outside the scope of the provided documents, politely state that.",
    "customer_support": "You are a friendly and efficient AI customer support specialist. Your goal is to help users resolve their issues and understand product features by referencing the official knowledge base. Provide clear, step-by-step instructions when possible. Be patient and understanding. If a query cannot be resolved with the provided information, suggest escalating to a human agent.",
    "engineering_docs": "You are an AI research and engineering assistant with deep technical understanding. You specialize in parsing and synthesizing information from patents, design documents, and technical specifications. Provide precise and detailed answers, explaining complex concepts clearly. When summarizing, focus on key innovations, methodologies, and results.",
    "compliance_audit": "You are an AI compliance and audit specialist. Your function is to meticulously analyze regulatory texts, internal policies, and audit documents. You are thorough, objective, and pay close attention to detail. Identify discrepancies, summarize requirements, and help locate specific information relevant to compliance and audit tasks.",
    "marketing_insights": "You are a creative and analytical AI marketing assistant. You excel at deriving insights from market research, understanding brand guidelines, and generating innovative content ideas. Your tone should be engaging and insightful. When analyzing data, focus on actionable insights for marketing strategy and content creation.",
    "operations_maintenance": "You are an AI operations and maintenance support specialist. You are adept at interpreting technical manuals, sensor logs, and Standard Operating Procedures to assist with troubleshooting and operational efficiency. Provide clear, practical, and step-by-step guidance. Focus on safety and adherence to procedures.",
    "sales_support": "You are an AI sales support assistant. Your role is to help the sales team by summarizing client interactions, drafting proposals, retrieving relevant client history, and providing quick access to product information. You are efficient, organized, and focused on enabling sales success. Ensure all customer data is handled with confidentiality.",
    "healthcare_pharma": "You are an AI assistant for healthcare and pharmaceutical professionals. You process and summarize clinical information, trial data, and medical literature with a high degree of accuracy and adherence to privacy principles (e.g., HIPAA). Your responses should be based strictly on the provided medical context. Clearly state if information is not available in the context. Your tone is professional and objective.",
    "default": "You are a helpful AI assistant. Answer the question based on the provided context."
}
# In a production system, consider loading this from a config file (e.g., JSON, YAML)

# Default model per domain (can be extended)
DEFAULT_MODELS = {
    "legal": "llama3-70b",
    "finance": "llama3-70b",
    "hr_policy": "llama3-70b",
    "customer_support": "llama3-70b",
    "engineering_docs": "llama3-70b",
    "compliance_audit": "llama3-70b",
    "marketing_insights": "llama3-70b",
    "operations_maintenance": "llama3-70b",
    "sales_support": "llama3-70b",
    "healthcare_pharma": "llama3-70b",
    "default": "llama3-70b"
}

# Default namespace per domain
DEFAULT_NAMESPACES = {
    "legal": "legal_docs",
    "finance": "finance_docs",
    "hr_policy": "hr_policy_docs",
    "customer_support": "customer_support_docs",
    "engineering_docs": "engineering_docs",
    "compliance_audit": "compliance_audit_docs",
    "marketing_insights": "marketing_insights_docs",
    "operations_maintenance": "operations_maintenance_docs",
    "sales_support": "sales_support_docs",
    "healthcare_pharma": "healthcare_pharma_docs",
    "default": "default_docs"
}

# Utility function to fetch domain config from Supabase

def get_domain_config(domain: str):
    """
    Fetch namespace, system_prompt, and default_model for a domain from Supabase.
    Fallback to in-code config if Supabase is unavailable or domain not found.
    """
    # Fallbacks
    system_prompt = SYSTEM_PROMPTS.get(domain, SYSTEM_PROMPTS["default"])
    namespace = DEFAULT_NAMESPACES.get(domain, DEFAULT_NAMESPACES["default"])
    model = DEFAULT_MODELS.get(domain, DEFAULT_MODELS["default"])
    if not supabase:
        logger.warning(f"Supabase not available. Using defaults for domain '{domain}'.")
        return {"system_prompt": system_prompt, "namespace": namespace, "model": model}
    try:
        response = supabase.table("domains").select("namespace,system_prompt,default_model").eq("name", domain).execute()
        if response.data and len(response.data) > 0:
            row = response.data[0]
            logger.info(f"Fetched domain config for '{domain}' from Supabase.")
            return {
                "system_prompt": row.get("system_prompt", system_prompt),
                "namespace": row.get("namespace", namespace),
                "model": row.get("default_model", model)
            }
        else:
            logger.warning(f"Domain '{domain}' not found in Supabase. Using defaults.")
            return {"system_prompt": system_prompt, "namespace": namespace, "model": model}
    except Exception as e:
        logger.error(f"Error fetching domain config from Supabase: {e}. Using defaults.")
        return {"system_prompt": system_prompt, "namespace": namespace, "model": model}


# Authentication & RBAC (placeholder for enterprise)
async def get_current_user():
    # TODO: Implement proper JWT/OAuth validation
    return {"user_id": "demo", "tenant_id": "default", "role": "admin"}

async def check_permissions(action: str, user: dict = Depends(get_current_user)):
    # TODO: Implement RBAC logic
    return True

# Health check
@app.get("/health")
async def health_check():
    service_status = {}
    async with httpx.AsyncClient() as client:
        for service, url in SERVICES.items():
            try:
                response = await client.get(f"{url}/health", timeout=5.0)
                service_status[service] = "healthy" if response.status_code == 200 else "unhealthy"
            except:
                service_status[service] = "unreachable"
    
    return {"status": "ok", "services": service_status, "timestamp": datetime.utcnow()}

@app.post("/api/workflow/trigger", status_code=202)
async def trigger_n8n_workflow(
    request: WorkflowRequest,
    user: dict = Depends(get_current_user)
):
    """
    Triggers a specific N8N workflow by its ID.
    """
    logger.info(f"Received request to trigger N8N workflow: {request.workflow_id} for tenant: {request.tenant_id}")

    if not N8N_API_KEY:
        logger.error("N8N_API_KEY is not configured.")
        raise HTTPException(status_code=500, detail="N8N integration is not configured.")

    n8n_url = f"{SERVICES['n8n']}/api/v1/workflows/{request.workflow_id}/executions"
    headers = {"X-N8N-API-Key": N8N_API_KEY}
    
    workflow_payload = request.inputs.copy()
    workflow_payload.update({
        "tenant_id": request.tenant_id,
        "user_id": user.get("user_id")
    })

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(n8n_url, headers=headers, json=workflow_payload, timeout=30.0)
            response.raise_for_status()
        
        logger.info(f"Successfully triggered N8N workflow {request.workflow_id}. Response: {response.json()}")
        return {"message": "Workflow triggered successfully", "execution_data": response.json()}
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error triggering N8N workflow {request.workflow_id}: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Error from N8N: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error triggering N8N workflow {request.workflow_id}: {e}")
        raise HTTPException(status_code=503, detail=f"Could not connect to N8N service: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred while triggering N8N workflow {request.workflow_id}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

# Spec Builder Wizard Logic
@app.post("/api/spec-builder/process")
async def process_spec_builder(
    request: SpecBuilderRequest,
    user: dict = Depends(get_current_user),
    _: bool = Depends(lambda: check_permissions("spec:create"))
):
    """Process specification builder wizard input and generate artifacts"""
    try:
        # Log the request
        logger.info(f"Processing spec builder for domain: {request.domain}")
        
        # Generate specification based on domain and requirements
        spec = {
            "id": f"spec_{datetime.utcnow().timestamp()}",
            "domain": request.domain,
            "subdomain": request.subdomain,
            "requirements": request.requirements,
            "tenant_id": request.tenant_id,
            "user_id": request.user_id,
            "created_at": datetime.utcnow().isoformat(),
            "artifacts": []
        }
        
        # Generate artifacts based on domain
        if request.domain == "legal":
            spec["artifacts"] = [
                "contract_analysis_workflow.json",
                "legal_rag_pipeline.yaml",
                "compliance_dashboard.yaml"
            ]
        elif request.domain == "healthcare":
            spec["artifacts"] = [
                "medical_records_rag.yaml",
                "hipaa_compliance_config.yaml",
                "patient_qa_workflow.json"
            ]
        # Add more domain-specific logic
        
        return {"status": "success", "specification": spec}
        
    except Exception as e:
        logger.error(f"Spec builder error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Prompt Chain Manager
@app.post("/api/prompt-chains/execute")
async def execute_prompt_chain(
    request: PromptChainRequest,
    user: dict = Depends(get_current_user)
):
    """Execute a prompt chain with multiple LLM calls"""
    try:
        chain_results = []
        
        # Example prompt chains for different use cases
        if request.chain_type == "document_analysis":
            # Chain: Extract -> Summarize -> Classify -> Generate insights
            steps = [
                {"action": "extract", "prompt": "Extract key information from: {text}"},
                {"action": "summarize", "prompt": "Summarize the following: {extracted_info}"},
                {"action": "classify", "prompt": "Classify this document: {summary}"},
                {"action": "insights", "prompt": "Generate insights for: {classification}"}
            ]
        elif request.chain_type == "rag_enhanced_qa":
            # Chain: Retrieve -> Rerank -> Generate -> Validate
            steps = [
                {"action": "retrieve", "service": "llamaindex"},
                {"action": "rerank", "service": "llm_inference"},
                {"action": "generate", "service": "llm_inference"},
                {"action": "validate", "service": "llm_inference"}
            ]
        else:
            raise HTTPException(status_code=400, detail=f"Unknown chain type: {request.chain_type}")
        
        # Execute chain steps
        context = request.inputs.copy()
        for step in steps:
            if step.get("service") == "llamaindex":
                # Call LlamaIndex service
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{SERVICES['llamaindex']}/search",
                        json={"query": context.get("query", ""), "top_k": 5}
                    )
                    step_result = response.json()
            elif step.get("service") == "llm_inference":
                # Call LLM service
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{SERVICES['llm_inference']}/generate",
                        json={"prompt": step["prompt"].format(**context), "max_tokens": 256}
                    )
                    step_result = response.json()
            else:
                # Mock result for demonstration
                step_result = {"result": f"Processed {step['action']} with context: {context}"}
            
            chain_results.append({"step": step["action"], "result": step_result})
            context.update(step_result)
        
        return {"status": "success", "chain_results": chain_results}
        
    except Exception as e:
        logger.error(f"Prompt chain execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# n8n Workflow Integration
@app.post("/api/workflows/execute")
async def execute_workflow(
    request: WorkflowRequest,
    user: dict = Depends(get_current_user)
):
    """Execute n8n workflow"""
    try:
        async with httpx.AsyncClient() as client:
            # Trigger n8n workflow
            response = await client.post(
                f"{SERVICES['n8n']}/api/v1/workflows/{request.workflow_id}/execute",
                json=request.inputs,
                headers={"Authorization": f"Bearer {os.getenv('N8N_API_KEY', '')}"}
            )
            
            if response.status_code == 200:
                return {"status": "success", "execution": response.json()}
            else:
                raise HTTPException(status_code=response.status_code, detail="Workflow execution failed")
                
    except Exception as e:
        logger.error(f"Workflow execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced RAG with LLM integration
@app.post("/api/rag/enhanced-query")
async def enhanced_rag_query(
    request: RAGRequest,
    user: dict = Depends(get_current_user)
):
    """Enhanced RAG query with LLM integration"""
    try:
        # Step 1: Retrieve from vector store
        # Fetch config for the requested domain
        domain_config = get_domain_config(request.domain)
        namespace = domain_config["namespace"]
        system_prompt = domain_config["system_prompt"]
        model = domain_config["model"]

        async with httpx.AsyncClient() as client:
            rag_response = await client.post(
                f"{SERVICES['llamaindex']}/search",
                json={
                    "query": request.query,
                    "namespace": namespace,
                    "top_k": request.top_k
                }
            )
            rag_results = rag_response.json()
        
        if not request.use_llm:
            return {"status": "success", "results": rag_results}
        
        # Step 2: Generate enhanced response with LLM
        context = "\n".join([result.get("content", "") for result in rag_results.get("results", [])])
        enhanced_prompt = f"""Based on the following context, answer the question: {request.query}

Context:
{context}

Answer:"""
        
        async with httpx.AsyncClient() as client:
            llm_response = await client.post(
                f"{SERVICES['llm_inference']}/generate",
                json={
                    "prompt": enhanced_prompt,
                    "system_prompt": system_prompt,
                    "max_tokens": 512,
                    "model": model
                }
            )
            llm_result = llm_response.json()
        
        return {
            "status": "success",
            "query": request.query,
            "rag_results": rag_results,
            "enhanced_answer": llm_result.get("text", ""),
            "confidence": 0.85  # Mock confidence score
        }
        
    except Exception as e:
        logger.error(f"Enhanced RAG query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Monitoring and observability endpoints
@app.get("/api/monitoring/metrics")
async def get_metrics(user: dict = Depends(get_current_user)):
    """Get system metrics for monitoring dashboard"""
    try:
        # Mock metrics - in production, integrate with Prometheus/Grafana
        metrics = {
            "llm_costs": {
                "today": 45.67,
                "this_month": 1234.56,
                "breakdown": {
                    "llama3": 567.89,
                    "gemini": 234.56,
                    "embeddings": 432.11
                }
            },
            "rag_performance": {
                "hit_rate": 0.87,
                "avg_latency_ms": 245,
                "queries_today": 1456,
                "embedding_drift_score": 0.12
            },
            "infrastructure": {
                "cpu_usage": 0.68,
                "memory_usage": 0.75,
                "gpu_utilization": 0.82,
                "active_pods": 12
            },
            "business_kpis": {
                "user_satisfaction": 4.2,
                "automation_savings": 15000,
                "compliance_score": 98
            }
        }
        
        return {"status": "success", "metrics": metrics, "timestamp": datetime.utcnow()}
        
    except Exception as e:
        logger.error(f"Metrics retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Artifact generation
@app.post("/api/artifacts/generate")
async def generate_artifacts(
    spec: Dict[str, Any],
    user: dict = Depends(get_current_user)
):
    """Generate deployment artifacts based on specification"""
    try:
        artifacts = []
        
        # Generate Kubernetes manifests
        if spec.get("deployment", {}).get("platform") == "kubernetes":
            k8s_manifest = {
                "apiVersion": "apps/v1",
                "kind": "Deployment",
                "metadata": {"name": f"{spec['domain']}-ai-platform"},
                "spec": {
                    "replicas": spec.get("scale", {}).get("replicas", 1),
                    "selector": {"matchLabels": {"app": f"{spec['domain']}-ai"}},
                    "template": {
                        "metadata": {"labels": {"app": f"{spec['domain']}-ai"}},
                        "spec": {
                            "containers": [
                                {
                                    "name": "ai-service",
                                    "image": f"ai-advisor/{spec['domain']}:latest",
                                    "ports": [{"containerPort": 8000}]
                                }
                            ]
                        }
                    }
                }
            }
            artifacts.append({"name": "k8s-deployment.yaml", "content": k8s_manifest})
        
        # Generate n8n workflows
        workflow_template = {
            "name": f"{spec['domain']}_workflow",
            "nodes": [
                {"name": "Trigger", "type": "n8n-nodes-base.webhook"},
                {"name": "RAG Search", "type": "n8n-nodes-base.httpRequest"},
                {"name": "LLM Generate", "type": "n8n-nodes-base.httpRequest"},
                {"name": "Response", "type": "n8n-nodes-base.respondToWebhook"}
            ]
        }
        artifacts.append({"name": "workflow.json", "content": workflow_template})
        
        return {"status": "success", "artifacts": artifacts}
        
    except Exception as e:
        logger.error(f"Artifact generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

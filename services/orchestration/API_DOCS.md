# AI Advisor Orchestration API – Endpoint Reference

_Last updated: 2025-07-31_

---

## Authentication
All endpoints require authentication (JWT or API key, see RBAC placeholder). Tenant ID is required for multi-tenant isolation.

---

## Endpoints

### 1. `/api/monitoring/metrics`  
**GET**  
Returns live observability metrics from Prometheus for the current tenant.

**Response:**
```json
{
  "status": "success",
  "metrics": {
    "active_sessions": 5,
    "total_requests": 1234,
    "error_rate": 0.012,
    "avg_latency_ms": 210,
    "compliance_flags": ["hipaa", "soc2"],
    "last_scan": "2024-06-01T12:34:56Z"
  }
}
```

---

### 2. `/api/validate/spec`  
**POST**  
Validates a specification JSON via LLM service and logs the result.

**Request:**
```json
{
  "spec": { ... }
}
```
**Response:**
```json
{
  "status": "valid" | "invalid",
  "details": { ... }
}
```

---

### 3. `/api/artifacts/generate`  
**POST**  
Generates deployment artifacts (K8s, Terraform, CI/CD, Compliance) based on specification.

**Request:**
```json
{
  "spec": { ... }
}
```
**Response:**
```json
{
  "status": "success",
  "artifacts": [
    { "name": "main.tf", "content": "..." },
    { "name": "ci.yml", "content": "..." }
  ]
}
```

---

### 4. `/api/git/pr`  
**POST**  
Creates a GitHub PR with generated artifacts.

**Request:**
```json
{
  "repo": "org/repo",
  "branch": "feature-branch",
  "files": { "main.tf": "...", "ci.yml": "..." },
  "pr_title": "Automated PR",
  "pr_body": "Optional PR body"
}
```
**Response:**
```json
{
  "status": "success",
  "pr_url": "https://github.com/org/repo/pull/123"
}
```

---

### 5. `/api/compliance/results`  
**GET**  
Fetches compliance scan results for the tenant.

**Response:**
```json
{
  "status": "success",
  "results": [ ... ]
}
```

**POST**  
Inserts a compliance scan result (e.g., from CI).

**Request:**
```json
{
  "flag": "hipaa",
  "details": { ... }
}
```
**Response:**
```json
{
  "status": "success"
}
```

---

### 6. `/api/workflow/trigger`  
**POST**  
Triggers a specific N8N workflow by its ID.

**Request:**
```json
{
  "workflow_id": "string",
  "inputs": { ... },
  "tenant_id": "string"
}
```
**Response:**
```json
{
  "status": "success",
  "execution_id": "string"
}
```

---

### 7. `/api/workflows/execute`  
**POST**  
Executes an N8N workflow (refactored for best practices).

**Request:**
```json
{
  "workflow_id": "string",
  "inputs": { ... },
  "tenant_id": "string"
}
```
**Response:**
```json
{
  "status": "success",
  "output": { ... }
}
```

---

### 8. `/api/prompt-chains/execute`  
**POST**  
Executes a prompt chain with multiple LLM calls.

**Request:**
```json
{
  "chain_type": "document_analysis",
  "inputs": { ... },
  "context": { ... }
}
```
**Response:**
```json
{
  "status": "success",
  "chain_results": [ ... ]
}
```

---

### 9. `/api/rag/enhanced-query`  
**POST**  
Enhanced RAG query with LLM integration.

**Request:**
```json
{
  "query": "string",
  "domain": "string",
  "namespace": "string",
  "top_k": 3,
  "use_llm": true
}
```
**Response:**
```json
{
  "status": "success",
  "query": "string",
  "rag_results": [ ... ],
  "enhanced_answer": "string",
  "confidence": 0.85
}
```

---

### 10. `/api/spec-builder/process`  
**POST**  
Processes specification builder wizard input and generates artifacts.

**Request:**
```json
{
  "domain": "string",
  "subdomain": "string",
  "requirements": { ... },
  "tenant_id": "string",
  "user_id": "string"
}
```
**Response:**
```json
{
  "status": "success",
  "specification": { ... }
}
```

---

### 11. `/health`  
**GET**  
Returns health status of all services.

**Response:**
```json
{
  "status": "ok",
  "services": { "service": "healthy|unhealthy|unreachable", ... },
  "timestamp": "2025-07-31T16:22:15Z"
}
```

---

## Notes
- All endpoints log audit events to Supabase with tenant/user context.
- RBAC is a placeholder; production deployments should implement full JWT/OAuth and role checks.
- See PRD and README for deployment and migration instructions.

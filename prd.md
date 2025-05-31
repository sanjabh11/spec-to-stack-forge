https://g.co/gemini/share/af0307634d44

* **Mission & Objectives**: Hybrid‐deployable, single-tenant hybrid app with Q\&A wizard, spec validation, automated artifact gen, CI/CD, sandbox, governance.
*
# AI Platform Advisor Chat – Ultimate PRD

## 1. Mission & Objectives
A hybrid-deployable, single-tenant-first web app that:
1. Elicits domain-aware requirements via a Q&A wizard.
2. Validates and de-conflicts specs (JSON Schema + GPT contradiction detector).
3. Invokes Gemini 2.5 Pro (or fallback LLMs) to generate:
   - Architecture blueprints (YAML with autoscaling & SLA).
   - Idempotent Terraform modules (`infra/`).
   - n8n workflows (`workflow/`).
   - CI/CD (GitHub Actions) with manual gates and diff views.
4. Offers one-click PR creation, local sandbox (Docker Compose), CLI tool, and GitOps promotion.
5. Ensures robust governance: RLS, audit logs, secrets, tfsec/Checkov scans, compliance flags (HIPAA, GDPR, SOC2).
6. Provides full observability: token usage/cost, latency, model accuracy, embedding drift, RAG hit ratio.

## 2. Personas & Use Cases
| Persona             | Needs & Criteria                                                                                           |
|---------------------|-------------------------------------------------------------------------------------------------------------|
| Business Analyst    | Clear “why” for each question, no code exposure.                                                            |
| Developer / DevOps  | Spec JSON + validated, Terraform modules + lint/tests, n8n workflows, CI templates, local sandbox.         |
| Admin / Security    | Enforced RLS, audit logs (with `/trace/`), manual approvals, compliance checks.                            |

## 3. Phase I: Requirement Capture
### Data Model & RLS
```sql
-- tenants, users, specs as before, plus:
ALTER TABLE specs ADD COLUMN payload JSONB;
CREATE POLICY tenant_iso ON specs USING (tenant_id = current_setting('app.tenant_id')::uuid);
````

### Key Fields

* `domain`, `subdomain` (e.g. EMR vs Trials), `objective`, `data_sources`
* `llm_provider`, `token_budget`, `latency_budget`
* `throughput`, `concurrency`, `sla_target`
* `compliance_flags`, `integrations`, `output_format`

### API & Validation

```yaml
POST /requirements/start
POST /requirements/respond
POST /validate/spec    # JSON Schema + GPT contradiction check
GET  /requirements/{id}
```

**Prompt (Phase I)**

```
You are SpecBuilder…
- Branch on domain/subdomain for industry-specific follow-ups.
- Validate each answer; if conflict (e.g. low cost + high throughput), ask a clarifying question.
- Support commands: Simplify, Rephrase, Skip, Not clear.
- Complete when spec passes all schema + contradiction checks.
```

## 4. Phase II: Automated Generation

### Step II.1: Architecture Blueprint

**Prompt (SolutionDesigner)**

```
Given spec JSON, output YAML:
services: {name, purpose, autoscale:{min,max}, sla}
tables: {name, columns, compliance_tags}
dependencies: {type, vendor, version, notes}
```

### Step II.2: Terraform Modules

**Prompt (IaCGenerator)**

```
From YAML, generate infra/ with:
- main.tf, variables.tf, outputs.tf
- Vars: throughput, concurrency, budgets, compliance_flags
- Inline comments in plain English
- Ensure idempotency & terraform validate
```

### Step II.3: n8n Workflows

**Prompt (WorkflowBuilder)**

```
Generate n8n JSON with nodes for ingestion, embedding, LLM calls, notifications. Include README.
```

### Step II.4: CI/CD & GitOps

**Prompt (CICDArchitect)**

```
Generate .github/workflows/ci.yml:
- jobs: lint (terraform fmt, eslint, black), test (smoke.sh)
- manual approval for prod apply
- show diffs between branches
```

### Explainability & Prompt Cache

* `/notes/infra.md` explains design choices.
* `/trace/generation.json` logs every prompt & response.
* Prompt cache in Supabase/local for offline CLI.

### Local Sandbox (Docker Compose)

```yaml
services:
  backend, frontend, n8n, chromadb, postgres(pgvector), gpt-stub
```

## 5. Phase III: Delivery & Governance

* **GitOps**: `POST /api/git/pr` → branch, commit, open PR with diffs.
* **Manual Gates**: Approvals via GitHub UI.
* **Canary Deployments**: terraform workspaces or Pulumi stacks.
* **Audit Logs**: Append-only logs table for all LLM calls & infra applies.
* **Security Scans**: tfsec/Checkov in CI.
* **RLS Tests**: Automated tests to verify tenant isolation.

## 6. Observability & ML Metrics

* **Captured Metrics**: token usage & cost, latency percentiles, model accuracy (small gold set), embedding drift, RAG hit ratio.
* **Dashboards**: Sample Grafana JSON under `/examples/grafana.json`.

## 7. Cross-Language CLI Tool

```bash
aiapp generate --spec spec.json --llm-provider gemini-2.5-pro --offline
```

* Written in Go/Rust with offline prompt cache.

## 8. Advanced Compliance Flags

| Flag  | Effects                                                |
| ----- | ------------------------------------------------------ |
| HIPAA | PHI encryption, extended audit retention, RLS enforced |
| GDPR  | Data deletion workflows, EU-hosted DB option           |
| SOC2  | Logging, credential rotation, posture checks           |

## 9. System Prompt (Gemini 2.5 Pro)

```
You are an AI Platform Advisor…
(see main PRD for full prompt)
```

## 10. Key Code Snippets

* **FastAPI + Gemini** (see earlier example)
* **React Chat w/ Simplify/Skip**
* **Terraform Example**
* **n8n Workflow JSON**

---

# Deliverables & Structure

```
/docs/PRD.md
/prompts/
/examples/
/docker-compose.yml
/backend/
/frontend/
/cli/
/notes/
/trace/
```

*End of PRD*

```
```

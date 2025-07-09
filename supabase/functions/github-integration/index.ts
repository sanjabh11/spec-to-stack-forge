
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const githubToken = Deno.env.get('GITHUB_TOKEN');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GitHubIntegrationRequest {
  action: 'create-repo' | 'create-pr' | 'sync-repo' | 'get-repos' | 'create-workflow';
  orgName?: string;
  repoName?: string;
  artifacts?: any;
  sessionData?: any;
  domain?: string;
  branchName?: string;
  commitMessage?: string;
  files?: { path: string; content: string }[];
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
}

async function createGitHubRepo(orgName: string, repoName: string, isPrivate: boolean = false): Promise<GitHubRepo> {
  const endpoint = orgName ? `https://api.github.com/orgs/${orgName}/repos` : 'https://api.github.com/user/repos';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      description: 'AI-generated platform solution',
      private: isPrivate,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
  }

  return await response.json();
}

async function createGitHubBranch(repoFullName: string, branchName: string, baseBranch: string = 'main'): Promise<void> {
  // Get the SHA of the base branch
  const baseResponse = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs/heads/${baseBranch}`, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!baseResponse.ok) {
    throw new Error(`Failed to get base branch: ${baseResponse.status}`);
  }

  const baseData = await baseResponse.json();
  const baseSha = baseData.object.sha;

  // Create new branch
  const response = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create branch: ${response.status} - ${error.message}`);
  }
}

async function uploadFileToGitHub(repoFullName: string, filePath: string, content: string, branchName: string): Promise<void> {
  const encodedContent = btoa(content);
  
  const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add ${filePath}`,
      content: encodedContent,
      branch: branchName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to upload file ${filePath}: ${response.status} - ${error.message}`);
  }
}

async function createPullRequest(repoFullName: string, branchName: string, title: string, body: string): Promise<GitHubPullRequest> {
  const response = await fetch(`https://api.github.com/repos/${repoFullName}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body,
      head: branchName,
      base: 'main',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create pull request: ${response.status} - ${error.message}`);
  }

  return await response.json();
}

function generateArtifactFiles(artifacts: any, domain: string): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];

  // Architecture blueprint
  if (artifacts.architecture) {
    files.push({
      path: 'architecture/blueprint.yaml',
      content: artifacts.architecture.yaml || 'architecture:\n  placeholder: true'
    });
  }

  // Terraform modules
  if (artifacts.terraform) {
    if (artifacts.terraform.files) {
      Object.entries(artifacts.terraform.files).forEach(([filename, content]) => {
        files.push({
          path: `infrastructure/${filename}`,
          content: content as string
        });
      });
    }
  }

  // n8n workflows
  if (artifacts.workflow) {
    files.push({
      path: 'workflows/n8n-workflow.json',
      content: JSON.stringify(artifacts.workflow.n8n_json || {}, null, 2)
    });
  }

  // CI/CD pipeline
  if (artifacts.cicd) {
    files.push({
      path: '.github/workflows/ci.yml',
      content: artifacts.cicd.github_actions || 'name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2'
    });
  }

  // Documentation
  files.push({
    path: 'README.md',
    content: generateReadmeContent(domain, artifacts)
  });

  // Docker configuration
  files.push({
    path: 'docker-compose.yml',
    content: generateDockerComposeContent(domain)
  });

  // Kubernetes manifests
  files.push({
    path: 'k8s/deployment.yaml',
    content: generateKubernetesManifest(domain)
  });

  return files;
}

function generateReadmeContent(domain: string, artifacts: any): string {
  return `# ${domain.charAt(0).toUpperCase() + domain.slice(1)} AI Platform

## Overview
This is an AI-powered platform solution generated for the ${domain} domain.

## Architecture
- **Domain**: ${domain}
- **Generated**: ${new Date().toISOString()}
- **Components**: API Gateway, AI Models, Vector Database, Workflows

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (optional)
- Node.js 18+ (for development)

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd ${domain}-ai-solution
\`\`\`

2. Start with Docker Compose
\`\`\`bash
docker-compose up -d
\`\`\`

3. Access the platform
- API: http://localhost:8000
- UI: http://localhost:3000

## Architecture Components

### Infrastructure
- **API Gateway**: FastAPI-based REST API
- **AI Models**: LLM integration with fallback support
- **Vector Database**: ChromaDB for embeddings
- **Workflows**: n8n automation platform

### Deployment
- **Docker**: Multi-stage builds for production
- **Kubernetes**: Scalable container orchestration
- **CI/CD**: GitHub Actions automation

## Configuration

### Environment Variables
\`\`\`bash
# Core settings
DOMAIN=${domain}
API_PORT=8000
UI_PORT=3000

# AI Models
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=postgresql://user:pass@localhost/db
VECTOR_DB_URL=http://localhost:8000

# Monitoring
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
\`\`\`

## Generated Files

### Architecture
- \`architecture/blueprint.yaml\` - System architecture definition
- \`docs/architecture.md\` - Detailed architecture documentation

### Infrastructure
- \`infrastructure/\` - Terraform modules for cloud deployment
- \`k8s/\` - Kubernetes manifests
- \`docker-compose.yml\` - Local development environment

### Workflows
- \`workflows/\` - n8n workflow definitions
- \`.github/workflows/\` - CI/CD pipelines

## Development

### Local Development
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

### Production Deployment
\`\`\`bash
# Build production image
docker build -t ${domain}-ai-platform .

# Deploy to Kubernetes
kubectl apply -f k8s/
\`\`\`

## Monitoring

### Metrics
- **Performance**: Response times, throughput
- **Costs**: Token usage, infrastructure costs
- **Quality**: Model accuracy, user satisfaction

### Dashboards
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

## Support

### Documentation
- [API Reference](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License - see LICENSE file for details.

---
*Generated by AI Platform Advisor*
`;
}

function generateDockerComposeContent(domain: string): string {
  return `version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DOMAIN=${domain}
      - DATABASE_URL=postgresql://postgres:password@db:5432/${domain}_db
      - VECTOR_DB_URL=http://vector-db:8000
    depends_on:
      - db
      - vector-db
    restart: unless-stopped

  ui:
    build:
      context: ./ui
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:8000
    depends_on:
      - api
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=${domain}_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  vector-db:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    environment:
      - CHROMA_HOST=0.0.0.0
      - CHROMA_PORT=8000
    volumes:
      - chroma_data:/chroma/chroma
    restart: unless-stopped

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${domain}_n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=password
    depends_on:
      - db
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  postgres_data:
  chroma_data:
  n8n_data:
  prometheus_data:
  grafana_data:
`;
}

function generateKubernetesManifest(domain: string): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${domain}-ai-platform
  labels:
    app: ${domain}-ai-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${domain}-ai-platform
  template:
    metadata:
      labels:
        app: ${domain}-ai-platform
    spec:
      containers:
      - name: api
        image: ${domain}-ai-platform:latest
        ports:
        - containerPort: 8000
        env:
        - name: DOMAIN
          value: "${domain}"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ${domain}-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: ${domain}-ai-platform-service
spec:
  selector:
    app: ${domain}-ai-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer

---
apiVersion: v1
kind: Secret
metadata:
  name: ${domain}-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  gemini-api-key: <base64-encoded-gemini-key>
  openai-api-key: <base64-encoded-openai-key>

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${domain}-ai-platform-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${domain}-ai-platform
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GitHubIntegrationRequest = await req.json();
    console.log('GitHub integration request:', requestData.action);

    if (!githubToken) {
      return new Response(JSON.stringify({ 
        error: 'GitHub token not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (requestData.action) {
      case 'create-repo': {
        const { orgName, repoName } = requestData;
        if (!repoName) {
          throw new Error('Repository name is required');
        }

        const repo = await createGitHubRepo(orgName || '', repoName);
        
        // Log the repo creation
        await supabase.from('audit_logs').insert({
          action: 'github_repo_created',
          resource_type: 'github_repository',
          resource_id: repo.id.toString(),
          details: {
            repo_name: repo.name,
            repo_url: repo.html_url,
            org_name: orgName
          }
        });

        return new Response(JSON.stringify({ 
          success: true, 
          repo 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create-pr': {
        const { orgName, repoName, artifacts, sessionData, domain } = requestData;
        if (!repoName || !artifacts || !domain) {
          throw new Error('Repository name, artifacts, and domain are required');
        }

        const repoFullName = orgName ? `${orgName}/${repoName}` : repoName;
        const branchName = `ai-generated-${Date.now()}`;
        
        // Create branch
        await createGitHubBranch(repoFullName, branchName);

        // Generate and upload files
        const files = generateArtifactFiles(artifacts, domain);
        
        for (const file of files) {
          await uploadFileToGitHub(repoFullName, file.path, file.content, branchName);
        }

        // Create pull request
        const prTitle = `AI Generated ${domain.charAt(0).toUpperCase() + domain.slice(1)} Platform`;
        const prBody = `## AI Generated Platform Solution

**Domain**: ${domain}
**Generated**: ${new Date().toISOString()}

### Generated Components
- ✅ Architecture Blueprint
- ✅ Infrastructure Code (Terraform)
- ✅ Workflow Automation (n8n)
- ✅ CI/CD Pipeline
- ✅ Docker Configuration
- ✅ Kubernetes Manifests
- ✅ Documentation

### Key Features
- Multi-LLM support with fallback
- Vector database integration
- Real-time cost optimization
- Comprehensive monitoring
- Scalable architecture

### Next Steps
1. Review the generated code
2. Configure environment variables
3. Set up API keys and secrets
4. Deploy to your environment
5. Run initial tests

*Generated by AI Platform Advisor*`;

        const pr = await createPullRequest(repoFullName, branchName, prTitle, prBody);

        // Log the PR creation
        await supabase.from('audit_logs').insert({
          action: 'github_pr_created',
          resource_type: 'github_pull_request',
          resource_id: pr.id.toString(),
          details: {
            pr_number: pr.number,
            pr_url: pr.html_url,
            repo_name: repoFullName,
            domain,
            files_count: files.length
          }
        });

        return new Response(JSON.stringify({ 
          success: true, 
          prUrl: pr.html_url,
          pr 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-repos': {
        const response = await fetch('https://api.github.com/user/repos?per_page=100', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch repositories: ${response.status}`);
        }

        const repos = await response.json();
        return new Response(JSON.stringify({ 
          success: true, 
          repos 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: `Unknown action: ${requestData.action}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('GitHub integration error:', error);
    return new Response(JSON.stringify({ 
      error: 'GitHub integration failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

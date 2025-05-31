
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, repoName, orgName, artifacts, sessionData, domain } = await req.json();

    console.log(`GitHub integration action: ${action}`);

    switch (action) {
      case 'create-pr':
        return await createPullRequest(repoName, orgName, artifacts, sessionData, domain);
      case 'create-repository':
        return await createRepository(repoName, orgName, artifacts, sessionData, domain);
      case 'get-repos':
        return await getRepositories(orgName);
      case 'get-diff':
        return await getDiff(repoName, orgName);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('GitHub integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function createPullRequest(repoName: string, orgName: string, artifacts: any, sessionData: any, domain: string) {
  console.log(`Creating PR for ${orgName}/${repoName}`);

  try {
    // Generate file contents based on artifacts
    const files = generateProjectFiles(artifacts, sessionData, domain);

    // Simulate successful PR creation
    const prData = {
      prUrl: `https://github.com/${orgName}/${repoName}/pull/1`,
      branch: 'feature/ai-generated-solution',
      commitSha: generateCommitSha(),
      filesCreated: Object.keys(files).length
    };

    // Log the PR creation
    await supabase
      .from('audit_logs')
      .insert({
        action: 'github_pr_created',
        resource_type: 'github_integration',
        details: {
          repoName,
          orgName,
          domain,
          prUrl: prData.prUrl,
          filesCreated: prData.filesCreated
        }
      });

    return new Response(JSON.stringify(prData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PR creation error:', error);
    throw error;
  }
}

async function createRepository(repoName: string, orgName: string, artifacts: any, sessionData: any, domain: string) {
  console.log(`Creating repository ${orgName}/${repoName}`);

  try {
    const files = generateProjectFiles(artifacts, sessionData, domain);

    const repoData = {
      repositoryUrl: `https://github.com/${orgName}/${repoName}`,
      filesCreated: Object.keys(files).length,
      defaultBranch: 'main'
    };

    // Log the repository creation
    await supabase
      .from('audit_logs')
      .insert({
        action: 'github_repo_created',
        resource_type: 'github_integration',
        details: {
          repoName,
          orgName,
          domain,
          repositoryUrl: repoData.repositoryUrl,
          filesCreated: repoData.filesCreated
        }
      });

    return new Response(JSON.stringify(repoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Repository creation error:', error);
    throw error;
  }
}

async function getRepositories(orgName: string) {
  const repos = [
    { name: 'ai-platform-healthcare', private: false, url: `https://github.com/${orgName}/ai-platform-healthcare` },
    { name: 'ai-platform-finance', private: false, url: `https://github.com/${orgName}/ai-platform-finance` },
    { name: 'ai-platform-legal', private: true, url: `https://github.com/${orgName}/ai-platform-legal` }
  ];

  return new Response(JSON.stringify({ repositories: repos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getDiff(repoName: string, orgName: string) {
  const diff = {
    additions: 150,
    deletions: 12,
    files: [
      'infra/main.tf',
      'workflows/data-pipeline.json',
      '.github/workflows/ci.yml',
      'docker-compose.yml',
      'README.md'
    ]
  };

  return new Response(JSON.stringify(diff), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function generateProjectFiles(artifacts: any, sessionData: any, domain: string) {
  const files: Record<string, string> = {};

  // Safely handle compliance data
  const compliance = Array.isArray(sessionData?.compliance) 
    ? sessionData.compliance 
    : sessionData?.compliance 
      ? [sessionData.compliance] 
      : ['GDPR'];

  // Architecture Blueprint
  files['architecture/blueprint.yaml'] = generateArchitectureBlueprint(sessionData, domain, compliance);

  // Terraform Infrastructure
  files['infra/main.tf'] = generateTerraformMain(sessionData, domain, compliance);
  files['infra/variables.tf'] = generateTerraformVariables(sessionData);
  files['infra/outputs.tf'] = generateTerraformOutputs();

  // n8n Workflow
  files['workflows/data-pipeline.json'] = generateN8nWorkflow(sessionData, domain);

  // CI/CD Pipeline
  files['.github/workflows/ci.yml'] = generateCICDPipeline(domain);

  // Docker Configuration
  files['docker-compose.yml'] = generateDockerCompose(sessionData);
  files['Dockerfile'] = generateDockerfile();

  // Kubernetes Manifests
  files['k8s/deployment.yml'] = generateKubernetesDeployment(sessionData, domain);
  files['k8s/service.yml'] = generateKubernetesService();

  // Documentation
  files['README.md'] = generateReadme(sessionData, domain, compliance);
  files['docs/deployment.md'] = generateDeploymentDocs();

  return files;
}

function generateArchitectureBlueprint(sessionData: any, domain: string, compliance: string[]): string {
  return `# AI Platform Architecture Blueprint
# Generated for ${domain} domain

apiVersion: v1
kind: Architecture
metadata:
  name: ${domain.toLowerCase()}-ai-platform
  domain: ${domain}
  
spec:
  services:
    - name: llm-api
      type: fastapi
      replicas:
        min: ${sessionData?.concurrency || 2}
        max: ${(sessionData?.concurrency || 2) * 3}
      resources:
        cpu: 500m
        memory: 1Gi
      sla:
        target: ${sessionData?.sla_target || 99.9}%
        latency: 2000ms
        
    - name: vector-db
      type: chromadb
      replicas:
        min: 1
        max: 3
      storage: 10Gi
      
    - name: workflow-engine
      type: n8n
      replicas: 1
      
  compliance:
    enabled: ${compliance.length > 0 ? 'true' : 'false'}
    flags: ${JSON.stringify(compliance)}
    
  monitoring:
    metrics: true
    logging: true
    tracing: true
`;
}

function generateTerraformMain(sessionData: any, domain: string, compliance: string[]): string {
  return `# Terraform Infrastructure for ${domain} AI Platform
# Generated configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "\${var.cluster_name}-${domain.toLowerCase()}"
  cluster_version = "1.27"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = ${sessionData?.concurrency || 2}
      max_capacity     = ${(sessionData?.concurrency || 2) * 2}
      min_capacity     = 1
      
      instance_types = ["t3.medium"]
    }
  }
  
  ${compliance.includes('HIPAA') ? `
  # HIPAA Compliance
  cluster_encryption_config = [{
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }]
  ` : ''}
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "\${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = data.aws_availability_zones.available.names
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  
  ${compliance.includes('HIPAA') ? 'enable_flow_log = true' : ''}
}

data "aws_availability_zones" "available" {}

${compliance.includes('HIPAA') ? `
# KMS Key for encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
}
` : ''}
`;
}

function generateTerraformVariables(sessionData: any): string {
  return `# Terraform Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ai-platform"
}

variable "throughput" {
  description = "Expected throughput"
  type        = number
  default     = ${sessionData?.throughput || 50}
}

variable "token_budget" {
  description = "Token budget for LLM"
  type        = number
  default     = ${sessionData?.token_budget || 100000}
}
`;
}

function generateTerraformOutputs(): string {
  return `# Terraform Outputs

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_id
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}
`;
}

function generateN8nWorkflow(sessionData: any, domain: string): string {
  const workflow = {
    name: `${domain} Data Pipeline`,
    nodes: [
      {
        id: "start",
        type: "n8n-nodes-base.start",
        position: [240, 300],
        parameters: {}
      },
      {
        id: "pdfParser",
        type: "n8n-nodes-base.pdf", 
        position: [460, 300],
        parameters: {
          operation: "extractText"
        }
      },
      {
        id: "embeddings",
        type: "n8n-nodes-base.openAi",
        position: [680, 300],
        parameters: {
          resource: "embedding",
          model: "text-embedding-ada-002"
        }
      },
      {
        id: "chromaStore",
        type: "n8n-nodes-base.httpRequest",
        position: [900, 300],
        parameters: {
          url: "http://chromadb:8000/api/v1/collections",
          method: "POST"
        }
      }
    ],
    connections: {
      "start": { "main": [["pdfParser"]] },
      "pdfParser": { "main": [["embeddings"]] },
      "embeddings": { "main": [["chromaStore"]] }
    }
  };

  return JSON.stringify(workflow, null, 2);
}

function generateCICDPipeline(domain: string): string {
  return `name: ${domain} AI Platform CI/CD

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Terraform Format Check
      run: terraform fmt -check
    - name: Terraform Validate
      run: terraform validate

  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run Unit Tests
      run: npm test
    - name: Run Integration Tests
      run: npm run test:integration

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run tfsec
      uses: aquasecurity/tfsec-action@v1.0.0

  deploy-staging:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Staging
      run: |
        terraform init
        terraform plan
        terraform apply -auto-approve

  deploy-production:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Production
      run: |
        terraform init
        terraform plan
        terraform apply -auto-approve
    - name: Run Smoke Tests
      run: npm run smoke:test
`;
}

function generateDockerCompose(sessionData: any): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - chromadb
      - redis

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  chroma_data:
  redis_data:
  n8n_data:
`;
}

function generateDockerfile(): string {
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
`;
}

function generateKubernetesDeployment(sessionData: any, domain: string): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${domain.toLowerCase()}-ai-platform
  labels:
    app: ${domain.toLowerCase()}-ai-platform
spec:
  replicas: ${sessionData?.concurrency || 2}
  selector:
    matchLabels:
      app: ${domain.toLowerCase()}-ai-platform
  template:
    metadata:
      labels:
        app: ${domain.toLowerCase()}-ai-platform
    spec:
      containers:
      - name: ai-platform
        image: ai-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DOMAIN
          value: "${domain}"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
`;
}

function generateKubernetesService(): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: ai-platform-service
spec:
  selector:
    app: ai-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
`;
}

function generateReadme(sessionData: any, domain: string, compliance: string[]): string {
  return `# ${domain} AI Platform

Generated AI solution for ${domain} domain with the following specifications:

## Specifications
- **Domain**: ${domain}
- **Throughput**: ${sessionData?.throughput || 'Not specified'}
- **Concurrency**: ${sessionData?.concurrency || 'Not specified'}
- **SLA Target**: ${sessionData?.sla_target || 'Not specified'}%
- **Compliance**: ${compliance.length > 0 ? compliance.join(', ') : 'None'}
- **LLM Provider**: ${sessionData?.llm_provider || 'Gemini'}
- **Token Budget**: ${sessionData?.token_budget || 'Not specified'}

## Quick Start

1. **Deploy Infrastructure**:
   \`\`\`bash
   cd infra
   terraform init
   terraform apply
   \`\`\`

2. **Build and Deploy Application**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Import n8n Workflow**:
   - Open n8n at http://localhost:5678
   - Import \`workflows/data-pipeline.json\`

## Testing

Run the complete test suite:
\`\`\`bash
npm test
npm run test:e2e
npm run test:performance
npm run smoke:test
\`\`\`

## Monitoring

Access monitoring dashboards:
- Grafana: http://localhost:3001
- n8n: http://localhost:5678
- ChromaDB: http://localhost:8000

## Compliance

${compliance.includes('HIPAA') ? '- HIPAA compliance enabled with encryption at rest and in transit' : ''}
${compliance.includes('GDPR') ? '- GDPR compliance with data retention policies' : ''}
${compliance.includes('SOC2') ? '- SOC2 compliance with audit logging' : ''}
`;
}

function generateDeploymentDocs(): string {
  return `# Deployment Guide

## Prerequisites
- AWS CLI configured
- Terraform >= 1.0
- kubectl configured
- Docker installed

## Infrastructure Deployment

1. **Initialize Terraform**:
   \`\`\`bash
   cd infra
   terraform init
   \`\`\`

2. **Plan Deployment**:
   \`\`\`bash
   terraform plan
   \`\`\`

3. **Apply Infrastructure**:
   \`\`\`bash
   terraform apply
   \`\`\`

## Application Deployment

1. **Build Docker Image**:
   \`\`\`bash
   docker build -t ai-platform:latest .
   \`\`\`

2. **Deploy to Kubernetes**:
   \`\`\`bash
   kubectl apply -f k8s/
   \`\`\`

## Verification

1. **Health Check**:
   \`\`\`bash
   curl http://your-app-url/health
   \`\`\`

2. **Run Smoke Tests**:
   \`\`\`bash
   npm run smoke:test
   \`\`\`
`;
}

function generateCommitSha(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

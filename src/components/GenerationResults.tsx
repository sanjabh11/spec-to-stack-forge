
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileCode2, 
  Download, 
  Copy, 
  CheckCircle2, 
  Loader2,
  GitBranch,
  Cloud,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GenerationResultsProps {
  sessionData: any;
  domain: string;
  onArtifactsGenerated: (artifacts: any) => void;
}

interface GeneratedArtifact {
  type: string;
  name: string;
  content: string;
  description: string;
  downloadName: string;
}

export const GenerationResults = ({ sessionData, domain, onArtifactsGenerated }: GenerationResultsProps) => {
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('blueprint');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (sessionData && Object.keys(sessionData).length > 0) {
      generateArtifacts();
    }
  }, [sessionData]);

  const generateArtifacts = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progressive generation
      const steps = [
        { name: 'Architecture Blueprint', progress: 20 },
        { name: 'Terraform Infrastructure', progress: 40 },
        { name: 'n8n Workflow', progress: 60 },
        { name: 'CI/CD Pipeline', progress: 80 },
        { name: 'Docker Configuration', progress: 100 }
      ];

      for (const step of steps) {
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate actual artifacts based on session data
      const generatedArtifacts = await createArtifacts(sessionData, domain);
      setArtifacts(generatedArtifacts);
      onArtifactsGenerated(generatedArtifacts);

      toast({
        title: "Artifacts Generated",
        description: "All infrastructure code and configurations have been generated successfully",
      });

    } catch (error: any) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate artifacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createArtifacts = async (data: any, domain: string): Promise<GeneratedArtifact[]> => {
    const compliance = data.compliance || 'GDPR';
    const budget = data.budget || '$5000';
    const performance = data.performance || '100 requests/sec';
    
    return [
      {
        type: 'blueprint',
        name: 'Architecture Blueprint',
        description: 'Complete system architecture specification',
        downloadName: 'architecture-blueprint.yaml',
        content: `# AI Platform Architecture Blueprint
# Domain: ${domain}
# Generated: ${new Date().toISOString()}

apiVersion: v1
kind: Architecture
metadata:
  name: ${domain.toLowerCase()}-ai-platform
  domain: ${domain}
  compliance: [${compliance}]
  budget: ${budget}

spec:
  services:
    api_gateway:
      type: nginx-ingress
      replicas: 2
      resources:
        cpu: 500m
        memory: 1Gi
      
    ai_backend:
      type: fastapi
      replicas: 3
      resources:
        cpu: 1000m
        memory: 2Gi
      environment:
        - DOMAIN=${domain}
        - LLM_PROVIDER=gemini
        - COMPLIANCE_MODE=${compliance}
        
    vector_db:
      type: chromadb
      replicas: 2
      persistence: true
      resources:
        cpu: 500m
        memory: 4Gi
        
    workflow_engine:
      type: n8n
      replicas: 1
      resources:
        cpu: 250m
        memory: 1Gi

  networking:
    ingress:
      enabled: true
      tls: true
      annotations:
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
        
  security:
    rbac: enabled
    networkPolicies: enabled
    podSecurityStandards: restricted
    
  monitoring:
    prometheus: enabled
    grafana: enabled
    alerts: enabled

  scaling:
    hpa:
      enabled: true
      minReplicas: 2
      maxReplicas: 10
      targetCPU: 70
      
  compliance:
    ${compliance.includes('HIPAA') ? 'hipaa: enabled' : ''}
    ${compliance.includes('GDPR') ? 'gdpr: enabled' : ''}
    ${compliance.includes('SOC2') ? 'soc2: enabled' : ''}
    encryption: enabled
    auditLogs: enabled`
      },
      {
        type: 'terraform',
        name: 'Terraform Infrastructure',
        description: 'Infrastructure as Code for cloud deployment',
        downloadName: 'main.tf',
        content: `# Terraform Infrastructure for ${domain} AI Platform
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-vpc"
    Domain = "${domain}"
    Compliance = "${compliance}"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "\${var.project_name}-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]

  tags = {
    Name = "\${var.project_name}-eks"
    Domain = "${domain}"
  }
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "${domain.toLowerCase()}-ai-platform"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}`
      },
      {
        type: 'n8n',
        name: 'n8n Workflow',
        description: 'Automation workflow for document processing',
        downloadName: 'document-processing-workflow.json',
        content: JSON.stringify({
          "name": `${domain} Document Processing`,
          "nodes": [
            {
              "parameters": {
                "httpMethod": "POST",
                "path": "/webhook/document-upload",
                "responseMode": "onReceived",
                "options": {}
              },
              "id": "webhook-trigger",
              "name": "Document Upload Webhook",
              "type": "n8n-nodes-base.webhook",
              "typeVersion": 1,
              "position": [240, 300]
            },
            {
              "parameters": {
                "functionCode": `// Extract and validate document\nconst document = $input.first().json;\n\nif (!document.file || !document.domain) {\n  throw new Error('Missing required fields: file, domain');\n}\n\n// Validate domain\nconst allowedDomains = ['Legal', 'Finance', 'Healthcare', 'Human Resources', 'Customer Support'];\nif (!allowedDomains.includes(document.domain)) {\n  throw new Error('Invalid domain specified');\n}\n\nreturn {\n  filename: document.file.filename,\n  content: document.file.content,\n  domain: document.domain,\n  uploadTime: new Date().toISOString(),\n  processingId: 'proc_' + Math.random().toString(36).substr(2, 9)\n};`
              },
              "id": "validate-document",
              "name": "Validate Document",
              "type": "n8n-nodes-base.function",
              "typeVersion": 1,
              "position": [460, 300]
            }
          ],
          "connections": {
            "Document Upload Webhook": {
              "main": [[{
                "node": "Validate Document",
                "type": "main",
                "index": 0
              }]]
            }
          },
          "active": true,
          "settings": {
            "timezone": "America/New_York"
          },
          "createdAt": new Date().toISOString(),
          "updatedAt": new Date().toISOString(),
          "id": `workflow_${domain.toLowerCase()}_${Date.now()}`
        }, null, 2)
      },
      {
        type: 'cicd',
        name: 'CI/CD Pipeline',
        description: 'GitHub Actions workflow for automated deployment',
        downloadName: '.github-workflows-deploy.yml',
        content: `# CI/CD Pipeline for ${domain} AI Platform
# Generated: ${new Date().toISOString()}

name: Deploy ${domain} AI Platform

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-west-2
  EKS_CLUSTER_NAME: ${domain.toLowerCase()}-ai-platform-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: |
        npm run test
        npm run test:e2e
        npm run test:integration

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to EKS
      run: |
        kubectl apply -f k8s/production/
        kubectl rollout status deployment/${domain.toLowerCase()}-api -n production`
      },
      {
        type: 'docker',
        name: 'Docker Configuration',
        description: 'Docker and Kubernetes deployment manifests',
        downloadName: 'docker-compose.yml',
        content: `# Docker Compose for ${domain} AI Platform
# Generated: ${new Date().toISOString()}

version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${domain.toLowerCase()}_db
    depends_on:
      - db
      - chromadb
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${domain.toLowerCase()}_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    volumes:
      - chromadb_data:/chroma/chroma
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000
    restart: unless-stopped

volumes:
  postgres_data:
  chromadb_data:`
      }
    ];
  };

  const handleDownload = (artifact: GeneratedArtifact) => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `${artifact.name} has been downloaded`,
    });
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive"
      });
    }
  };

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Artifacts...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generation Progress</span>
              <span>{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
          </div>
          <div className="text-center text-gray-600">
            <p>Please wait while we generate your infrastructure code...</p>
            <p className="text-sm">This may take a few minutes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Artifacts Generated Successfully</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {artifacts.length} Files Generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <FileCode2 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="font-medium">Infrastructure</p>
              <p className="text-sm text-gray-600">Terraform + K8s</p>
            </div>
            <div className="text-center">
              <GitBranch className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-medium">CI/CD</p>
              <p className="text-sm text-gray-600">GitHub Actions</p>
            </div>
            <div className="text-center">
              <Settings className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="font-medium">Workflows</p>
              <p className="text-sm text-gray-600">n8n Automation</p>
            </div>
            <div className="text-center">
              <Cloud className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="font-medium">Deployment</p>
              <p className="text-sm text-gray-600">Docker + Cloud</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artifacts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Code & Configuration Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
              <TabsTrigger value="terraform">Terraform</TabsTrigger>
              <TabsTrigger value="n8n">n8n Workflow</TabsTrigger>
              <TabsTrigger value="cicd">CI/CD</TabsTrigger>
              <TabsTrigger value="docker">Docker</TabsTrigger>
            </TabsList>

            {artifacts.map((artifact, index) => (
              <TabsContent key={artifact.type} value={artifact.type} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{artifact.name}</h3>
                    <p className="text-sm text-gray-600">{artifact.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(artifact.content, index)}
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(artifact)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <pre className="bg-gray-50 p-4 text-sm overflow-x-auto max-h-96">
                    <code>{artifact.content}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">1. Review & Customize</h4>
              <p className="text-sm text-gray-600">
                Review the generated code and customize it according to your specific requirements.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">2. Deploy Infrastructure</h4>
              <p className="text-sm text-gray-600">
                Use the Terraform files to provision your cloud infrastructure.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">3. Set up CI/CD</h4>
              <p className="text-sm text-gray-600">
                Configure the GitHub Actions workflow for automated deployments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Code, 
  GitBranch, 
  Settings, 
  Copy,
  Check,
  Eye,
  ExternalLink,
  Rocket,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DeploymentDashboard } from './DeploymentDashboard';

interface GenerationResultsProps {
  sessionData: any;
  domain: string;
  onArtifactsGenerated: (artifacts: any) => void;
}

export const GenerationResults = ({ sessionData, domain, onArtifactsGenerated }: GenerationResultsProps) => {
  const [copiedItem, setCopiedItem] = useState<string>('');
  const [showDeployment, setShowDeployment] = useState(false);
  const [artifacts, setArtifacts] = useState<any>(null);

  // Mock artifacts generation - in real implementation this would come from props
  useState(() => {
    const mockArtifacts = {
      architecture: {
        yaml: `# ${domain} AI Solution Architecture
version: "3.8"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/aiplatform
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=aiplatform
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass`
      },
      terraform: {
        files: {
          "main.tf": `provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1d0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "${domain}-ai-platform"
  }
}`,
          "variables.tf": `variable "region" {
  description = "AWS region"
  default     = "us-west-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t2.micro"
}`
        }
      },
      workflow: {
        n8n_json: {
          "nodes": [
            {
              "parameters": {
                "httpMethod": "POST",
                "path": "/webhook",
                "responseMode": "responseNode"
              },
              "id": "webhook-1",
              "name": "Webhook",
              "type": "n8n-nodes-base.webhook",
              "typeVersion": 1,
              "position": [250, 300]
            }
          ],
          "connections": {}
        }
      },
      cicd: {
        github_actions: `name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run tests
      run: |
        npm install
        npm test
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: echo "Deploying ${domain} AI solution"`
      }
    };
    
    setArtifacts(mockArtifacts);
    onArtifactsGenerated(mockArtifacts);
  });

  const copyToClipboard = async (content: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(''), 2000);
      toast({
        title: "Copied!",
        description: `${itemName} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CodeBlock = ({ content, language, filename }: { content: string; language: string; filename: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
        <span className="text-sm font-medium text-gray-700">{filename}</span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content, filename)}
          >
            {copiedItem === filename ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadFile(content, filename)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <pre className="bg-gray-50 p-4 overflow-x-auto text-sm max-h-96">
        <code>{content}</code>
      </pre>
    </div>
  );

  if (showDeployment && artifacts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setShowDeployment(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Phase III - Deployment
          </Badge>
        </div>
        <DeploymentDashboard 
          artifacts={artifacts} 
          sessionData={sessionData} 
          domain={domain} 
        />
      </div>
    );
  }

  if (!artifacts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating artifacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-800">🎉 Generation Complete!</CardTitle>
              <p className="text-green-600 mt-2">
                Your {domain} AI solution architecture has been generated successfully.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Phase II Complete
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowDeployment(true)}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deploy & Monitor
            </Button>
            <Button className="bg-gray-800 hover:bg-gray-900">
              <ExternalLink className="w-4 h-4 mr-2" />
              Create GitHub PR
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All Files
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview Deployment
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Local Sandbox
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Artifacts */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Artifacts</CardTitle>
          <p className="text-gray-600">
            Review and download your generated architecture files below.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="architecture" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="architecture" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Architecture</span>
              </TabsTrigger>
              <TabsTrigger value="terraform" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Terraform</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>n8n Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="cicd" className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>CI/CD</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="architecture" className="mt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">System Architecture Blueprint</h3>
                  <p className="text-blue-600 text-sm">
                    YAML specification defining services, databases, dependencies, and infrastructure requirements.
                  </p>
                </div>
                <CodeBlock 
                  content={artifacts.architecture.yaml} 
                  language="yaml" 
                  filename="architecture.yml" 
                />
              </div>
            </TabsContent>

            <TabsContent value="terraform" className="mt-6">
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Infrastructure as Code</h3>
                  <p className="text-orange-600 text-sm">
                    Terraform modules for provisioning cloud infrastructure with proper variable configuration.
                  </p>
                </div>
                {Object.entries(artifacts.terraform.files).map(([filename, content]) => (
                  <CodeBlock 
                    key={filename}
                    content={content as string} 
                    language="terraform" 
                    filename={filename} 
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="mt-6">
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Workflow Automation</h3>
                  <p className="text-green-600 text-sm">
                    n8n workflow configuration for data processing, LLM integration, and notifications.
                  </p>
                </div>
                <CodeBlock 
                  content={JSON.stringify(artifacts.workflow.n8n_json, null, 2)} 
                  language="json" 
                  filename="workflow.json" 
                />
              </div>
            </TabsContent>

            <TabsContent value="cicd" className="mt-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">CI/CD Pipeline</h3>
                  <p className="text-purple-600 text-sm">
                    GitHub Actions workflow for automated testing, security scanning, and deployment.
                  </p>
                </div>
                <CodeBlock 
                  content={artifacts.cicd.github_actions} 
                  language="yaml" 
                  filename=".github/workflows/ci.yml" 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1. Review & Customize</h3>
              <p className="text-sm text-gray-600">
                Review the generated artifacts and customize them according to your specific needs.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">2. Deploy Infrastructure</h3>
              <p className="text-sm text-gray-600">
                Use the Terraform modules to provision your cloud infrastructure.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">3. Monitor & Optimize</h3>
              <p className="text-sm text-gray-600">
                Use the deployment dashboard to monitor performance and optimize costs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

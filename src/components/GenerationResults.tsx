
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
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GenerationResultsProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

export const GenerationResults = ({ artifacts, sessionData, domain }: GenerationResultsProps) => {
  const [copiedItem, setCopiedItem] = useState<string>('');

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
            <Button className="bg-purple-600 hover:bg-purple-700">
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
              <h3 className="font-semibold mb-2">3. Set Up Workflows</h3>
              <p className="text-sm text-gray-600">
                Import the n8n workflow and configure your automation pipelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

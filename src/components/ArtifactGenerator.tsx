
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface ArtifactGeneratorProps {
  sessionId: string;
  specification: any;
}

export const ArtifactGenerator: React.FC<ArtifactGeneratorProps> = ({ sessionId, specification }) => {
  const [artifacts, setArtifacts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('architecture');

  const generateArtifacts = async () => {
    try {
      setLoading(true);
      const result = await apiClient.generateArchitecture({
        sessionId,
        domain: specification.domain,
        llmProvider: specification.llm_provider || 'gemini'
      });
      
      setArtifacts(result.artifacts);
      toast.success('Artifacts generated successfully!');
    } catch (error) {
      toast.error('Failed to generate artifacts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadArtifact = (content: string, filename: string) => {
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

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const renderArtifactContent = (artifact: any, type: string) => {
    if (!artifact) return <div>No content available</div>;

    const content = typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{type.toUpperCase()}</Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadArtifact(content, `${type}.${getFileExtension(type)}`)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-96 w-full border rounded-md p-4">
          <pre className="text-sm">{content}</pre>
        </ScrollArea>
      </div>
    );
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case 'architecture': return 'yml';
      case 'terraform': return 'tf';
      case 'workflow': return 'json';
      case 'cicd': return 'yml';
      default: return 'txt';
    }
  };

  const renderTerraformFiles = () => {
    if (!artifacts?.terraform?.files) return <div>No Terraform files available</div>;

    return (
      <div className="space-y-4">
        {Object.entries(artifacts.terraform.files).map(([filename, content]) => (
          <div key={filename} className="space-y-2">
            <div className="flex justify-between items-center">
              <Badge variant="secondary">{filename}</Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(content as string)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadArtifact(content as string, filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <pre className="text-sm">{content}</pre>
            </ScrollArea>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Artifacts</CardTitle>
        <CardDescription>
          Infrastructure code, workflows, and deployment configurations for your AI platform
        </CardDescription>
        {!artifacts && (
          <Button onClick={generateArtifacts} disabled={loading}>
            {loading ? 'Generating...' : 'Generate All Artifacts'}
          </Button>
        )}
      </CardHeader>
      
      {artifacts && (
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="terraform">Infrastructure</TabsTrigger>
              <TabsTrigger value="workflow">Workflows</TabsTrigger>
              <TabsTrigger value="cicd">CI/CD</TabsTrigger>
            </TabsList>
            
            <TabsContent value="architecture" className="mt-4">
              {renderArtifactContent(artifacts.architecture?.yaml, 'architecture')}
            </TabsContent>
            
            <TabsContent value="terraform" className="mt-4">
              {renderTerraformFiles()}
            </TabsContent>
            
            <TabsContent value="workflow" className="mt-4">
              {renderArtifactContent(artifacts.workflow?.n8n_json, 'workflow')}
            </TabsContent>
            
            <TabsContent value="cicd" className="mt-4">
              {renderArtifactContent(artifacts.cicd?.github_actions, 'cicd')}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Code2, Database, GitBranch, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface ArtifactGenerationWorkflowProps {
  specification: any;
  onArtifactsGenerated: (artifacts: any) => void;
}

export const ArtifactGenerationWorkflow: React.FC<ArtifactGenerationWorkflowProps> = ({
  specification,
  onArtifactsGenerated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [artifacts, setArtifacts] = useState<any>(null);

  const artifactTypes = [
    { id: 'architecture', name: 'System Architecture', icon: Database, description: 'Detailed system design' },
    { id: 'code', name: 'Code Generation', icon: Code2, description: 'Generate boilerplate code' },
    { id: 'deployment', name: 'Deployment Config', icon: Rocket, description: 'K8s and CI/CD configs' },
    { id: 'docs', name: 'Documentation', icon: FileText, description: 'API docs and guides' },
    { id: 'github', name: 'GitHub Setup', icon: GitBranch, description: 'Repository initialization' }
  ];

  const generateArtifacts = async () => {
    setIsGenerating(true);
    
    // Simulate step-by-step generation
    for (let i = 0; i < artifactTypes.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const generatedArtifacts = {
      architecture: {
        diagrams: ['system_architecture.mmd', 'data_flow.mmd'],
        documents: ['architecture_spec.md']
      },
      code: {
        backend: ['api_gateway.ts', 'auth_service.ts', 'core_engine.py'],
        frontend: ['app.tsx', 'components/', 'hooks/'],
        database: ['schema.sql', 'migrations/']
      },
      deployment: {
        kubernetes: ['deployment.yaml', 'service.yaml', 'ingress.yaml'],
        cicd: ['.github/workflows/deploy.yml'],
        docker: ['Dockerfile', 'docker-compose.yml']
      },
      documentation: {
        api: ['openapi.yaml'],
        guides: ['setup.md', 'development.md', 'deployment.md']
      },
      github: {
        repository: `${specification.domain}-ai-platform`,
        initialized: true,
        branches: ['main', 'development']
      }
    };

    setArtifacts(generatedArtifacts);
    setIsGenerating(false);
    onArtifactsGenerated(generatedArtifacts);
    toast.success('All artifacts generated successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Artifact Generation Workflow</CardTitle>
          <CardDescription>
            Generate complete implementation artifacts from your specification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isGenerating && !artifacts && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artifactTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  );
                })}
              </div>
              
              <Button onClick={generateArtifacts} className="w-full" size="lg">
                Generate All Artifacts
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <Progress value={(currentStep + 1) / artifactTypes.length * 100} />
              <div className="text-center">
                <div className="text-lg font-medium">
                  Generating {artifactTypes[currentStep]?.name}...
                </div>
                <div className="text-sm text-muted-foreground">
                  {artifactTypes[currentStep]?.description}
                </div>
              </div>
            </div>
          )}

          {artifacts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-800">Generation Complete!</h3>
                <Badge variant="secondary">{Object.keys(artifacts).length} artifact types</Badge>
              </div>

              <Tabs defaultValue="architecture">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="deployment">Deploy</TabsTrigger>
                  <TabsTrigger value="documentation">Docs</TabsTrigger>
                  <TabsTrigger value="github">GitHub</TabsTrigger>
                </TabsList>

                {Object.entries(artifacts).map(([key, value]: [string, any]) => (
                  <TabsContent key={key} value={key} className="space-y-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 capitalize">{key} Artifacts</h4>
                      {Object.entries(value).map(([subKey, files]: [string, any]) => (
                        <div key={subKey} className="mb-2">
                          <span className="text-sm font-medium capitalize">{subKey}:</span>
                          <div className="ml-4 text-sm text-muted-foreground">
                            {Array.isArray(files) 
                              ? files.map(file => (
                                  <div key={file} className="flex items-center justify-between">
                                    <span>{file}</span>
                                    <Button size="sm" variant="ghost">
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))
                              : typeof files === 'string' 
                                ? <span>{files}</span>
                                : <span>{JSON.stringify(files)}</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

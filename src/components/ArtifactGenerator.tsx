import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtifactGeneratorProps {
  sessionId: string;
  specification: any;
  onComplete?: (artifacts: any) => void;
}

export const ArtifactGenerator: React.FC<ArtifactGeneratorProps> = ({ 
  sessionId, 
  specification, 
  onComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [artifacts, setArtifacts] = useState<any>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');

  const generationSteps = [
    { id: 'architecture', name: 'System Architecture', weight: 20 },
    { id: 'infrastructure', name: 'Infrastructure Code', weight: 25 },
    { id: 'workflows', name: 'n8n Workflows', weight: 20 },
    { id: 'cicd', name: 'CI/CD Pipelines', weight: 15 },
    { id: 'monitoring', name: 'Monitoring Setup', weight: 10 },
    { id: 'documentation', name: 'Documentation', weight: 10 }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    setProgress(0);
    
    try {
      let currentProgress = 0;
      
      for (const step of generationSteps) {
        setCurrentStep(step.name);
        
        // Simulate step processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentProgress += step.weight;
        setProgress(currentProgress);
      }

      // Defensive: ensure requirements field is present
      const specWithRequirements = {
        ...specification,
        requirements: specification.requirements || {
          objective: specification.objective,
          users: specification.users,
          throughput: specification.throughput,
          sla_target: specification.sla_target,
          llm_provider: specification.llm_provider,
          compliance: specification.compliance,
          data_types: specification.data_types,
          // ...add any other fields you expect
        }
      };

      // Call the generation API
      const { data, error } = await supabase.functions.invoke('generate-architecture', {
        body: {
          sessionId,
          specification: specWithRequirements,
          generateAll: true
        }
      });

      if (error) throw error;

      setArtifacts(data);
      setGenerationStatus('completed');
      onComplete?.(data);
      toast.success('Artifacts generated successfully!');
      
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationStatus('error');
      toast.error('Failed to generate artifacts');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const renderArtifactPreview = (artifactType: string, content: any) => {
    if (typeof content === 'string') {
      return (
        <ScrollArea className="h-64 w-full border rounded p-4">
          <pre className="text-sm">{content}</pre>
        </ScrollArea>
      );
    }
    
    return (
      <ScrollArea className="h-64 w-full border rounded p-4">
        <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>
      </ScrollArea>
    );
  };

  if (generationStatus === 'idle') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Generate Artifacts</span>
          </CardTitle>
          <CardDescription>
            Generate complete infrastructure, workflows, and deployment artifacts based on your specification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {generationSteps.map(step => (
                <div key={step.id} className="flex items-center space-x-2 p-3 border rounded">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{step.name}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate} className="w-full" size="lg">
              Start Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generationStatus === 'generating') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Generating Artifacts</span>
          </CardTitle>
          <CardDescription>
            Current step: {currentStep}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generationStatus === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Generation Failed</span>
          </CardTitle>
          <CardDescription>
            There was an error generating your artifacts. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} variant="outline" className="w-full">
            Retry Generation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span>Artifacts Generated</span>
        </CardTitle>
        <CardDescription>
          All artifacts have been successfully generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="architecture" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="architecture" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">System Architecture</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            {renderArtifactPreview('architecture', artifacts?.architecture)}
          </TabsContent>
          
          <TabsContent value="infrastructure" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Infrastructure Code</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            {renderArtifactPreview('infrastructure', artifacts?.infrastructure)}
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">n8n Workflows</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            {renderArtifactPreview('workflows', artifacts?.workflows)}
          </TabsContent>
          
          <TabsContent value="cicd" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">CI/CD Pipelines</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            {renderArtifactPreview('cicd', artifacts?.cicd)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

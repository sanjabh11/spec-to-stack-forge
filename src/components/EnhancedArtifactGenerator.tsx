
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, Download, Eye, Zap, Brain, Shield } from 'lucide-react';
import { enhancedArchitectureGenerator } from '@/lib/enhancedArchitectureGenerator';
import { toast } from 'sonner';

export interface EnhancedArtifactGeneratorProps {
  sessionId: string;
  specification: any;
  onComplete?: (artifacts: any) => void;
}

export const EnhancedArtifactGenerator: React.FC<EnhancedArtifactGeneratorProps> = ({ 
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
    { id: 'blueprint', name: 'Architecture Blueprint', weight: 25, icon: Brain },
    { id: 'infrastructure', name: 'Infrastructure Code', weight: 20, icon: Shield },
    { id: 'workflows', name: 'Workflow Automation', weight: 15, icon: Zap },
    { id: 'documentation', name: 'Documentation', weight: 15, icon: Eye },
    { id: 'validation', name: 'Validation & Optimization', weight: 15, icon: CheckCircle },
    { id: 'finalization', name: 'Finalization', weight: 10, icon: Download }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    setProgress(0);
    
    try {
      let currentProgress = 0;
      
      // Simulate progressive generation
      for (const step of generationSteps) {
        setCurrentStep(step.name);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        currentProgress += step.weight;
        setProgress(currentProgress);
      }

      // Build the architecture request
      const architectureRequest = {
        domain: specification.domain || 'general',
        requirements: {
          objective: specification.requirements?.objective || specification.objective || 'AI platform',
          users: specification.requirements?.users || specification.users || 100,
          throughput: specification.requirements?.throughput || specification.throughput || 10,
          sla_target: specification.requirements?.sla_target || specification.sla_target || 99.5,
          compliance: specification.requirements?.compliance || specification.compliance || 'STANDARD',
          data_types: specification.requirements?.data_types || specification.data_types || ['text'],
          budget: specification.requirements?.budget || specification.budget || '$1000',
          timeline: specification.requirements?.timeline || specification.timeline || '3 months'
        },
        preferences: {
          cloud_provider: specification.preferences?.cloud_provider || 'GCP',
          deployment_type: specification.preferences?.deployment_type || 'kubernetes',
          scaling_strategy: specification.preferences?.scaling_strategy || 'auto',
          monitoring_level: specification.preferences?.monitoring_level || 'standard',
          security_level: specification.preferences?.security_level || 'standard'
        }
      };

      // Generate architecture using the enhanced generator
      const generatedArchitecture = await enhancedArchitectureGenerator.generateArchitecture(architectureRequest);

      setArtifacts(generatedArchitecture);
      setGenerationStatus('completed');
      onComplete?.(generatedArchitecture);
      
      toast.success('Enhanced architecture generated successfully!', {
        description: `Generated in ${generatedArchitecture.metadata.generation_time}ms with ${Math.round(generatedArchitecture.metadata.confidence_score * 100)}% confidence`
      });
      
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationStatus('error');
      toast.error('Failed to generate architecture', {
        description: error.message
      });
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
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Enhanced Architecture Generation</span>
          </CardTitle>
          <CardDescription>
            Generate comprehensive, production-ready architecture with AI-powered optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {generationSteps.map(step => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Enhanced Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Multi-LLM architecture optimization</li>
                <li>• Real-time cost estimation and optimization</li>
                <li>• Comprehensive validation and security checks</li>
                <li>• Production-ready infrastructure code</li>
                <li>• Automated workflow generation</li>
                <li>• Complete documentation suite</li>
              </ul>
            </div>
            
            <Button onClick={handleGenerate} className="w-full" size="lg">
              <Brain className="w-4 h-4 mr-2" />
              Generate Enhanced Architecture
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
            <span>Generating Architecture</span>
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {generationSteps.map(step => {
                const Icon = step.icon;
                const isComplete = progress >= generationSteps.slice(0, generationSteps.indexOf(step) + 1).reduce((sum, s) => sum + s.weight, 0);
                const isCurrent = currentStep === step.name;
                
                return (
                  <div key={step.id} className={`flex items-center space-x-2 p-2 rounded ${
                    isComplete ? 'bg-green-100 text-green-800' : 
                    isCurrent ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{step.name}</span>
                    {isComplete && <CheckCircle className="w-3 h-3 ml-auto" />}
                  </div>
                );
              })}
            </div>
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
            There was an error generating your architecture. Please try again.
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
          <span>Architecture Generated Successfully</span>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center space-x-4 text-sm">
            <span>Model: {artifacts.metadata.llm_model_used}</span>
            <span>Confidence: {Math.round(artifacts.metadata.confidence_score * 100)}%</span>
            <span>Time: {artifacts.metadata.generation_time}ms</span>
            <span>Cost: ${artifacts.infrastructure.estimated_cost}/month</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="blueprint" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="documentation">Docs</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blueprint" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Architecture Blueprint</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">Score: {artifacts.blueprint.validation_score}/100</Badge>
                  <Badge variant="secondary">Completeness: {artifacts.blueprint.completeness}%</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download YAML
                </Button>
              </div>
            </div>
            {renderArtifactPreview('blueprint', artifacts.blueprint.yaml)}
          </TabsContent>
          
          <TabsContent value="infrastructure" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Infrastructure Code</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">Terraform</Badge>
                  <Badge variant="secondary">Kubernetes</Badge>
                  <Badge variant="secondary">Docker</Badge>
                  <Badge variant="outline">Est. Cost: ${artifacts.infrastructure.estimated_cost}/month</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
            <Tabs defaultValue="terraform" className="w-full">
              <TabsList>
                <TabsTrigger value="terraform">Terraform</TabsTrigger>
                <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
                <TabsTrigger value="docker">Docker</TabsTrigger>
              </TabsList>
              <TabsContent value="terraform">
                {renderArtifactPreview('terraform', artifacts.infrastructure.terraform)}
              </TabsContent>
              <TabsContent value="kubernetes">
                {renderArtifactPreview('kubernetes', artifacts.infrastructure.kubernetes)}
              </TabsContent>
              <TabsContent value="docker">
                {renderArtifactPreview('docker', artifacts.infrastructure.docker)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Workflow Automation</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">n8n Workflows</Badge>
                  <Badge variant="secondary">CI/CD Pipeline</Badge>
                  <Badge variant="secondary">Monitoring</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
            <Tabs defaultValue="n8n" className="w-full">
              <TabsList>
                <TabsTrigger value="n8n">n8n Workflows</TabsTrigger>
                <TabsTrigger value="cicd">CI/CD</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>
              <TabsContent value="n8n">
                {renderArtifactPreview('n8n', artifacts.workflows.n8n_workflows)}
              </TabsContent>
              <TabsContent value="cicd">
                {renderArtifactPreview('cicd', artifacts.workflows.cicd_pipeline)}
              </TabsContent>
              <TabsContent value="monitoring">
                {renderArtifactPreview('monitoring', artifacts.workflows.monitoring_setup)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="documentation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Documentation Suite</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">README</Badge>
                  <Badge variant="secondary">Architecture Guide</Badge>
                  <Badge variant="secondary">API Docs</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
            <Tabs defaultValue="readme" className="w-full">
              <TabsList>
                <TabsTrigger value="readme">README</TabsTrigger>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
              <TabsContent value="readme">
                {renderArtifactPreview('readme', artifacts.documentation.readme)}
              </TabsContent>
              <TabsContent value="architecture">
                {renderArtifactPreview('architecture', artifacts.documentation.architecture_guide)}
              </TabsContent>
              <TabsContent value="deployment">
                {renderArtifactPreview('deployment', artifacts.documentation.deployment_guide)}
              </TabsContent>
              <TabsContent value="api">
                {renderArtifactPreview('api', artifacts.documentation.api_documentation)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Validation Results</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">Confidence: {Math.round(artifacts.metadata.confidence_score * 100)}%</Badge>
                  <Badge variant="secondary">Validation Score: {artifacts.blueprint.validation_score}/100</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {artifacts.metadata.validation_results.map((result: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.category}</h4>
                    <Badge variant={result.score >= 80 ? "default" : "secondary"}>
                      {result.score}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, FileText, Code, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SpecificationGeneratorProps {
  sessionData: any;
  onSpecGenerated: (spec: any) => void;
}

export const SpecificationGenerator: React.FC<SpecificationGeneratorProps> = ({
  sessionData,
  onSpecGenerated
}) => {
  const [generationStep, setGenerationStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<any>(null);

  const generationSteps = [
    { name: 'Analyzing Requirements', icon: FileText, description: 'Processing user inputs' },
    { name: 'Architecture Design', icon: Database, description: 'Creating system architecture' },
    { name: 'Code Generation', icon: Code, description: 'Generating implementation code' },
    { name: 'Validation', icon: CheckCircle, description: 'Validating generated specification' }
  ];

  const generateSpecification = async () => {
    setIsGenerating(true);
    
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate the actual specification
    const spec = {
      id: crypto.randomUUID(),
      domain: sessionData.domain,
      requirements: sessionData.answers,
      architecture: {
        type: 'microservices',
        components: ['API Gateway', 'Auth Service', 'Core AI Engine', 'Data Storage'],
        deployment: 'kubernetes',
        scaling: 'auto'
      },
      implementation: {
        backend: 'Node.js/TypeScript',
        frontend: 'React/TypeScript',
        database: 'PostgreSQL',
        ai_framework: 'TensorFlow'
      },
      compliance: ['HIPAA', 'SOC2'],
      estimatedTimeline: '12-16 weeks',
      generatedAt: new Date().toISOString()
    };

    setGeneratedSpec(spec);
    setIsGenerating(false);
    onSpecGenerated(spec);
    toast.success('Specification generated successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Platform Specification Generator</CardTitle>
          <CardDescription>
            Generate comprehensive technical specification from your requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Domain:</span>
              <Badge variant="outline" className="ml-2">{sessionData.domain}</Badge>
            </div>
            <div>
              <span className="font-medium">Requirements:</span>
              <span className="ml-2">{Object.keys(sessionData.answers || {}).length} items</span>
            </div>
          </div>

          {!isGenerating && !generatedSpec && (
            <Button onClick={generateSpecification} className="w-full">
              Generate Technical Specification
            </Button>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <Progress value={(generationStep + 1) / generationSteps.length * 100} />
              <div className="space-y-2">
                {generationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === generationStep;
                  const isComplete = index < generationStep;
                  
                  return (
                    <div key={step.name} className={`flex items-center space-x-3 p-2 rounded ${
                      isActive ? 'bg-blue-50' : isComplete ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                      </div>
                      {isActive && <Clock className="w-4 h-4 text-blue-600 animate-spin ml-auto" />}
                      {isComplete && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {generatedSpec && (
            <div className="space-y-4 p-4 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Specification Generated Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Architecture:</span>
                  <span className="ml-2">{generatedSpec.architecture.type}</span>
                </div>
                <div>
                  <span className="font-medium">Timeline:</span>
                  <span className="ml-2">{generatedSpec.estimatedTimeline}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

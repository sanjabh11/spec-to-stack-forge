
import React, { useState } from 'react';
import { RequirementWizard } from '@/components/RequirementWizard';
import { ArtifactGenerator } from '@/components/ArtifactGenerator';
import { DevOpsDashboard } from '@/components/DevOpsDashboard';
import { CostEstimator } from '@/components/CostEstimator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PlatformBuilder() {
  const [currentPhase, setCurrentPhase] = useState<'requirements' | 'generation' | 'deployment'>('requirements');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [specification, setSpecification] = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any>(null);

  const handleRequirementsComplete = (id: string, spec: any) => {
    setSessionId(id);
    setSpecification(spec);
    setCurrentPhase('generation');
  };

  const handleArtifactsGenerated = (generatedArtifacts: any) => {
    setArtifacts(generatedArtifacts);
    setCurrentPhase('deployment');
  };

  const phases = [
    { id: 'requirements', label: 'Requirements', completed: !!specification },
    { id: 'generation', label: 'Generation', completed: !!artifacts },
    { id: 'deployment', label: 'Deployment', completed: false }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Platform Builder</h1>
        <p className="text-xl text-muted-foreground">
          Generate complete AI platform architectures with infrastructure, workflows, and deployment automation
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center">
            <Badge 
              variant={currentPhase === phase.id ? 'default' : phase.completed ? 'secondary' : 'outline'}
              className="px-4 py-2"
            >
              {index + 1}. {phase.label}
            </Badge>
            {index < phases.length - 1 && (
              <Separator orientation="horizontal" className="w-8 mx-2" />
            )}
          </div>
        ))}
      </div>

      <Tabs defaultValue="wizard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wizard">Requirements Wizard</TabsTrigger>
          <TabsTrigger value="cost-estimator">Cost Estimator</TabsTrigger>
          <TabsTrigger value="generation" disabled={!specification}>Generation</TabsTrigger>
          <TabsTrigger value="deployment" disabled={!artifacts}>Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard">
          <div className="min-h-[600px]">
            {currentPhase === 'requirements' && (
              <RequirementWizard onComplete={handleRequirementsComplete} />
            )}

            {currentPhase === 'generation' && sessionId && specification && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Specification Summary</CardTitle>
                    <CardDescription>
                      Review your requirements before generating artifacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="font-medium">Domain:</span>
                        <div>{specification.domain}</div>
                      </div>
                      <div>
                        <span className="font-medium">Users:</span>
                        <div>{specification.users}</div>
                      </div>
                      <div>
                        <span className="font-medium">SLA:</span>
                        <div>{specification.sla_target}%</div>
                      </div>
                      <div>
                        <span className="font-medium">Compliance:</span>
                        <div className="flex flex-wrap gap-1">
                          {specification.compliance?.map((c: string) => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ArtifactGenerator 
                  sessionId={sessionId} 
                  specification={specification}
                  onComplete={handleArtifactsGenerated}
                />
              </div>
            )}

            {currentPhase === 'deployment' && sessionId && artifacts && (
              <DevOpsDashboard sessionId={sessionId} artifacts={artifacts} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="cost-estimator">
          <CostEstimator />
        </TabsContent>

        <TabsContent value="generation">
          {sessionId && specification ? (
            <ArtifactGenerator 
              sessionId={sessionId} 
              specification={specification}
              onComplete={handleArtifactsGenerated}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Complete the requirements wizard first to access artifact generation
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployment">
          {artifacts ? (
            <DevOpsDashboard sessionId={sessionId!} artifacts={artifacts} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Generate artifacts first to access deployment dashboard
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

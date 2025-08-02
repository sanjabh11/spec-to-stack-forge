
import React, { useState } from 'react';
import RequirementWizard from './RequirementWizard';
import { SpecificationGenerator } from './SpecificationGenerator';
import { ArtifactGenerationWorkflow } from './ArtifactGenerationWorkflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface EnhancedRequirementWizardProps {
  selectedDomain: string;
}

const WORKFLOW_STEPS = [
  'Requirements Capture',
  'Specification Generation', 
  'Artifact Generation',
  'Deployment Ready'
];

export const EnhancedRequirementWizard: React.FC<EnhancedRequirementWizardProps> = ({
  selectedDomain
}) => {
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [specification, setSpecification] = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any>(null);

  const handleRequirementsComplete = (data: any) => {
    setSessionData(data);
    setCompletedSteps(prev => [...prev, 0]);
    setCurrentWorkflowStep(1);
  };

  const handleSpecGenerated = (spec: any) => {
    setSpecification(spec);
    setCompletedSteps(prev => [...prev, 1]);
    setCurrentWorkflowStep(2);
  };

  const handleArtifactsGenerated = (generatedArtifacts: any) => {
    setArtifacts(generatedArtifacts);
    setCompletedSteps(prev => [...prev, 2, 3]);
    setCurrentWorkflowStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Platform Development Workflow</span>
            <Badge variant="outline">{selectedDomain}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(completedSteps.length / WORKFLOW_STEPS.length) * 100} className="mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step} className={`text-center p-3 rounded-lg border ${
                completedSteps.includes(index) 
                  ? 'bg-green-50 border-green-200' 
                  : index === currentWorkflowStep 
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      index === currentWorkflowStep 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : 'border-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium">{step}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {currentWorkflowStep === 0 && (
        <RequirementWizard 
          domain={selectedDomain} 
          onComplete={handleRequirementsComplete}
        />
      )}

      {currentWorkflowStep === 1 && sessionData && (
        <SpecificationGenerator 
          sessionData={sessionData}
          onSpecGenerated={handleSpecGenerated}
        />
      )}

      {currentWorkflowStep === 2 && specification && (
        <ArtifactGenerationWorkflow
          specification={specification}
          onArtifactsGenerated={handleArtifactsGenerated}
        />
      )}

      {currentWorkflowStep === 3 && artifacts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">🎉 Platform Ready for Deployment!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Your {selectedDomain} AI platform has been fully generated and is ready for deployment.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Generated Assets</h4>
                  <ul className="text-sm space-y-1">
                    <li>✅ System Architecture</li>
                    <li>✅ Complete Codebase</li>
                    <li>✅ Deployment Configs</li>
                    <li>✅ Documentation</li>
                    <li>✅ GitHub Repository</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <ul className="text-sm space-y-1">
                    <li>📋 Review generated code</li>
                    <li>🚀 Deploy to staging</li>
                    <li>🧪 Run integration tests</li>
                    <li>📊 Monitor performance</li>
                    <li>🔄 Iterate based on feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

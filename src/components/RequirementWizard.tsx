import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { CostEstimator } from '@/components/CostEstimator';

interface RequirementWizardProps {
  onComplete: (sessionId: string, specification: any) => void;
}

const DOMAINS = [
  'Healthcare', 'Finance', 'Legal', 'Manufacturing', 'Retail', 'Education', 
  'Government', 'Technology', 'Energy', 'Transportation'
];

const COMPLIANCE_OPTIONS = [
  { id: 'HIPAA', label: 'HIPAA (Healthcare)' },
  { id: 'SOC2', label: 'SOC 2 (Security)' },
  { id: 'GDPR', label: 'GDPR (Privacy)' },
  { id: 'PCI-DSS', label: 'PCI DSS (Payment)' },
  { id: 'ISO27001', label: 'ISO 27001 (Security)' },
  { id: 'FedRAMP', label: 'FedRAMP (Government)' }
];

const steps = [
  'Domain Selection',
  'Basic Requirements', 
  'Technical Specifications',
  'Compliance & Security',
  'Cost Estimation',
  'Final Review'
];

export const RequirementWizard: React.FC<RequirementWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<any>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);

  useEffect(() => {
    if (responses.domain) {
      loadDomainQuestions();
    }
  }, [responses.domain]);

  const loadDomainQuestions = async () => {
    try {
      setLoading(true);
      const session = await apiClient.startRequirementSession(responses.domain);
      setSessionId(session.sessionId);
      
      // Generate domain-specific questions
      const domainQuestions = generateDomainQuestions(responses.domain);
      setQuestions(domainQuestions);
    } catch (error) {
      toast.error('Failed to initialize session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateDomainQuestions = (domain: string) => {
    const baseQuestions = [
      {
        id: 'objective',
        question: 'What is the primary objective of your AI platform?',
        type: 'textarea',
        required: true
      },
      {
        id: 'users',
        question: 'How many users do you expect to serve?',
        type: 'select',
        options: ['1-100', '100-1K', '1K-10K', '10K-100K', '100K+'],
        required: true
      },
      {
        id: 'data_types',
        question: 'What types of data will you process?',
        type: 'multiselect',
        options: ['Text', 'Images', 'Audio', 'Video', 'Structured Data', 'Time Series'],
        required: true
      }
    ];

    const domainSpecific = getDomainSpecificQuestions(domain);
    return [...baseQuestions, ...domainSpecific];
  };

  const getDomainSpecificQuestions = (domain: string) => {
    switch (domain) {
      case 'Healthcare':
        return [
          {
            id: 'patient_data',
            question: 'Will you process patient health information (PHI)?',
            type: 'boolean',
            required: true
          },
          {
            id: 'medical_devices',
            question: 'Will you integrate with medical devices or EHR systems?',
            type: 'boolean'
          }
        ];
      case 'Finance':
        return [
          {
            id: 'financial_data',
            question: 'What types of financial data will you process?',
            type: 'multiselect',
            options: ['Transaction Data', 'Market Data', 'Customer Data', 'Risk Data']
          },
          {
            id: 'real_time',
            question: 'Do you need real-time processing capabilities?',
            type: 'boolean'
          }
        ];
      case 'Legal':
        return [
          {
            id: 'document_types',
            question: 'What types of legal documents will you process?',
            type: 'multiselect',
            options: ['Contracts', 'Case Law', 'Regulations', 'Patents', 'Litigation Documents']
          },
          {
            id: 'confidentiality',
            question: 'What level of confidentiality is required?',
            type: 'select',
            options: ['Public', 'Internal', 'Confidential', 'Highly Confidential']
          }
        ];
      default:
        return [];
    }
  };

  const handleStepSubmit = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finalizeSpecification();
    }
  };

  const finalizeSpecification = async () => {
    try {
      setLoading(true);
      
      const specification = {
        domain: responses.domain,
        ...responses,
        cost_estimate: costEstimate,
        compliance: responses.compliance || [],
        generated_at: new Date().toISOString()
      };

      // Validate specification
      await apiClient.validateSpec(specification);

      toast.success('Specification generated successfully!');
      onComplete(sessionId!, specification);
    } catch (error) {
      toast.error('Failed to generate specification');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCostCalculated = (estimate: any) => {
    setCostEstimate(estimate);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Domain</label>
              <Select value={responses.domain} onValueChange={(value) => setResponses({...responses, domain: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {questions.slice(0, 3).map(question => (
              <div key={question.id}>
                <label className="text-sm font-medium">{question.question}</label>
                {question.type === 'textarea' && (
                  <Textarea
                    value={responses[question.id] || ''}
                    onChange={(e) => setResponses({...responses, [question.id]: e.target.value})}
                    placeholder="Enter your response..."
                  />
                )}
                {question.type === 'select' && (
                  <Select value={responses[question.id]} onValueChange={(value) => setResponses({...responses, [question.id]: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option: string) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Expected Throughput (requests/second)</label>
              <Input
                type="number"
                value={responses.throughput || ''}
                onChange={(e) => setResponses({...responses, throughput: e.target.value})}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">SLA Target (%)</label>
              <Input
                type="number"
                value={responses.sla_target || ''}
                onChange={(e) => setResponses({...responses, sla_target: e.target.value})}
                placeholder="e.g., 99.9"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred LLM Provider</label>
              <Select value={responses.llm_provider} onValueChange={(value) => setResponses({...responses, llm_provider: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose LLM provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="claude">Anthropic Claude</SelectItem>
                  <SelectItem value="local">Local/Open Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Compliance Requirements</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMPLIANCE_OPTIONS.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={responses.compliance?.includes(option.id)}
                      onCheckedChange={(checked) => {
                        const current = responses.compliance || [];
                        if (checked) {
                          setResponses({...responses, compliance: [...current, option.id]});
                        } else {
                          setResponses({...responses, compliance: current.filter((c: string) => c !== option.id)});
                        }
                      }}
                    />
                    <label htmlFor={option.id} className="text-sm">{option.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Cost Estimation
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Cost Estimation</h3>
              <p className="text-sm text-muted-foreground">
                Get an accurate cost estimate for your AI platform based on your requirements
              </p>
            </div>
            <CostEstimator
              initialData={{
                domain: responses.domain,
                data_volume_gb: parseFloat(responses.data_volume) || 50,
                throughput_qps: parseInt(responses.throughput) || 100,
                concurrent_users: parseInt(responses.users?.split('-')[0]) || 20,
                model: responses.llm_provider === 'openai' ? 'gpt-4' : 
                       responses.llm_provider === 'gemini' ? 'gemini-2.5' : 'local-model',
                compliance_requirements: responses.compliance || [],
              }}
              onCostCalculated={handleCostCalculated}
              showTitle={false}
            />
          </div>
        );

      case 5: // Final Review
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Specification</h3>
            <div className="space-y-2">
              <div><strong>Domain:</strong> {responses.domain}</div>
              <div><strong>Objective:</strong> {responses.objective}</div>
              <div><strong>Users:</strong> {responses.users}</div>
              <div><strong>Throughput:</strong> {responses.throughput} req/s</div>
              <div><strong>SLA:</strong> {responses.sla_target}%</div>
              <div><strong>LLM Provider:</strong> {responses.llm_provider}</div>
              {responses.compliance?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <strong>Compliance:</strong>
                  {responses.compliance.map((c: string) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))}
                </div>
              )}
              {costEstimate && (
                <div className="mt-4 p-4 border rounded-lg bg-green-50">
                  <strong>Estimated Monthly Cost:</strong> ${costEstimate.total_monthly_cost}
                  <div className="text-sm text-muted-foreground mt-1">
                    This includes infrastructure, AI models, storage, and compliance requirements
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Platform Requirements Wizard</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </CardDescription>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          <Button 
            onClick={handleStepSubmit}
            disabled={loading}
            className="ml-auto"
          >
            {loading ? 'Processing...' : currentStep < steps.length - 1 ? 'Next' : 'Generate Specification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

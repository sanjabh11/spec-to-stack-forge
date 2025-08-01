
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: 'text' | 'select' | 'multiselect' | 'number' | 'textarea';
  options?: string[];
  required: boolean;
  category: string;
}

interface WizardProps {
  domain: string;
  onComplete: (sessionData: any) => void;
}

export default function RequirementWizard({ domain, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSession();
  }, [domain]);

  const initializeSession = async () => {
    try {
      const data = await apiClient.startRequirementSession(domain);
      setSessionId(data.sessionId);
      setQuestions(data.questions);
    } catch (error: any) {
      toast({
        title: "Failed to start session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
  };

  const nextStep = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeSession();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSession = async () => {
    setLoading(true);
    try {
      const data = await apiClient.processRequirement(sessionId, answers, 'complete');

      onComplete({
        sessionId,
        domain,
        answers,
        specification: data.specification,
        recommendations: data.recommendations,
        specId: data.specId
      });
    } catch (error: any) {
      toast({
        title: "Failed to complete session",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Initializing requirements session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Requirements Capture</span>
                <Badge variant="outline">{domain}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep + 1} of {questions.length} • {currentQuestion.category}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.question_type === 'text' && (
            <Input
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full"
            />
          )}

          {currentQuestion.question_type === 'textarea' && (
            <Textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Provide detailed information..."
              rows={4}
              className="w-full"
            />
          )}

          {currentQuestion.question_type === 'select' && currentQuestion.options && (
            <Select 
              value={answers[currentQuestion.id] || ''} 
              onValueChange={handleAnswer}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {currentQuestion.question_type === 'number' && (
            <Input
              type="number"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              placeholder="Enter a number..."
              className="w-full"
            />
          )}

          {currentQuestion.question_type === 'multiselect' && currentQuestion.options && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select all that apply:</p>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map((option) => {
                  const selected = (answers[currentQuestion.id] || []).includes(option);
                  return (
                    <Badge
                      key={option}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = answers[currentQuestion.id] || [];
                        const updated = selected
                          ? current.filter((item: string) => item !== option)
                          : [...current, option];
                        handleAnswer(updated);
                      }}
                    >
                      {option}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            disabled={
              loading ||
              (currentQuestion.required && 
               (!answers[currentQuestion.id] || 
                (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)))
            }
            className="flex items-center space-x-2"
          >
            {currentStep === questions.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? 'Completing...' : 'Complete'}</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

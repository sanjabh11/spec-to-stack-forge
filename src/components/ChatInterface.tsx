
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  ArrowLeft,
  Clock,
  Target,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  selectedDomain: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  validation?: {
    status: 'valid' | 'warning' | 'error';
    message: string;
  };
}

export const ChatInterface = ({ selectedDomain }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [spec, setSpec] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const domainQuestions = [
    {
      question: `Great choice on ${selectedDomain}! Let's start with the basics. What specific problem or objective are you trying to solve in your ${selectedDomain.toLowerCase()} domain?`,
      field: 'objective',
      validation: (answer: string) => {
        if (answer.length < 10) {
          return { status: 'warning' as const, message: 'Please provide more detail about your objective.' };
        }
        return { status: 'valid' as const, message: 'Clear objective defined!' };
      }
    },
    {
      question: 'What data sources will your AI solution need to work with? (e.g., databases, APIs, documents, real-time feeds)',
      field: 'data_sources',
      validation: (answer: string) => {
        if (!answer.includes('database') && !answer.includes('API') && !answer.includes('document')) {
          return { status: 'warning' as const, message: 'Consider specifying concrete data sources for better architecture planning.' };
        }
        return { status: 'valid' as const, message: 'Data sources identified!' };
      }
    },
    {
      question: 'What are your performance requirements? Please specify expected throughput (requests/hour), concurrency (simultaneous users), and response time targets.',
      field: 'performance',
      validation: (answer: string) => {
        const hasNumbers = /\d+/.test(answer);
        if (!hasNumbers) {
          return { status: 'warning' as const, message: 'Please provide specific numbers for throughput and response times.' };
        }
        return { status: 'valid' as const, message: 'Performance requirements captured!' };
      }
    },
    {
      question: 'Do you have any compliance requirements? (e.g., HIPAA, GDPR, SOC2, PCI-DSS) This will affect our security and data handling recommendations.',
      field: 'compliance',
      validation: (answer: string) => {
        return { status: 'valid' as const, message: 'Compliance requirements noted!' };
      }
    },
    {
      question: 'What\'s your preferred budget range for cloud infrastructure and LLM API costs per month? This helps us optimize the architecture recommendations.',
      field: 'budget',
      validation: (answer: string) => {
        const hasBudget = /\$|budget|cost|price|\d+/.test(answer.toLowerCase());
        if (!hasBudget) {
          return { status: 'warning' as const, message: 'Budget information helps optimize recommendations.' };
        }
        return { status: 'valid' as const, message: 'Budget constraints understood!' };
      }
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: `Welcome to the AI Platform Advisor! I'm here to help you design and generate a complete AI solution for your ${selectedDomain} needs. I'll ask you a series of questions to understand your requirements, then generate validated specs, architecture blueprints, and deployment-ready code.`,
      timestamp: new Date()
    };

    const firstQuestion: Message = {
      id: '2',
      type: 'assistant',
      content: domainQuestions[0].question,
      timestamp: new Date()
    };

    setMessages([welcomeMessage, firstQuestion]);
  }, [selectedDomain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const validateResponse = (answer: string, questionIndex: number) => {
    if (questionIndex < domainQuestions.length) {
      return domainQuestions[questionIndex].validation(answer);
    }
    return { status: 'valid' as const, message: 'Response recorded!' };
  };

  const detectContradictions = (newField: string, value: string) => {
    // Simple contradiction detection logic
    if (newField === 'budget' && spec.performance) {
      const isLowBudget = value.toLowerCase().includes('low') || value.toLowerCase().includes('minimal');
      const isHighPerformance = spec.performance.toLowerCase().includes('high') || spec.performance.toLowerCase().includes('fast');
      
      if (isLowBudget && isHighPerformance) {
        return {
          detected: true,
          message: 'I notice a potential contradiction: you mentioned high performance requirements but indicated a low budget. Would you like to prioritize cost optimization or performance?'
        };
      }
    }
    
    return { detected: false, message: '' };
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate the response
    const validation = validateResponse(currentInput, currentQuestion);
    
    // Update spec
    if (currentQuestion < domainQuestions.length) {
      const field = domainQuestions[currentQuestion].field;
      const newSpec = { ...spec, [field]: currentInput };
      setSpec(newSpec);

      // Check for contradictions
      const contradiction = detectContradictions(field, currentInput);
      
      if (contradiction.detected) {
        const contradictionMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: contradiction.message,
          timestamp: new Date(),
          validation: { status: 'warning', message: 'Contradiction detected' }
        };
        setMessages(prev => [...prev, contradictionMessage]);
        setIsTyping(false);
        return;
      }
    }

    // Prepare response
    let responseContent = '';
    
    if (validation.status === 'warning') {
      responseContent = `${validation.message} `;
    } else {
      responseContent = `${validation.message} `;
    }

    // Move to next question or finish
    if (currentQuestion < domainQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      responseContent += `\n\n${domainQuestions[nextQuestion].question}`;
    } else {
      responseContent += `\n\nExcellent! I have all the information needed. Let me validate your specifications and prepare to generate your AI solution architecture...`;
      
      // Show completion
      setTimeout(() => {
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: 'Specifications validated! Ready to generate architecture blueprints, Terraform modules, and deployment workflows.',
          timestamp: new Date(),
          validation: { status: 'valid', message: 'Requirements complete' }
        };
        setMessages(prev => [...prev, completionMessage]);
        
        toast({
          title: "Requirements Complete!",
          description: "Your specifications have been validated and are ready for generation.",
        });
      }, 2000);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      validation
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.type === 'user') return <User className="w-5 h-5" />;
    if (message.type === 'system') return <CheckCircle2 className="w-5 h-5" />;
    return <Bot className="w-5 h-5" />;
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {selectedDomain}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Question {currentQuestion + 1}/{domainQuestions.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>~2 min remaining</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Validated Specs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="bg-white/60 backdrop-blur-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-xl ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'system'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {getMessageIcon(message)}
                </div>
                
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'system'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-gray-50 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.validation && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-current/20">
                        {getValidationIcon(message.validation.status)}
                        <span className="text-xs opacity-80">{message.validation.message}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-gray-50 text-gray-800 p-4 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
        <div className="flex space-x-4">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            className="flex-1 bg-white/50"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              Simplify
            </Button>
            <Button variant="ghost" size="sm">
              Skip Question
            </Button>
            <Button variant="ghost" size="sm">
              Not Clear
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Progress: {Math.round(((currentQuestion + 1) / domainQuestions.length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

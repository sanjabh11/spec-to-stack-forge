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
  Shield,
  Zap,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GenerationResults } from './GenerationResults';

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
    suggestions?: string[];
  };
  contradiction?: {
    detected: boolean;
    message?: string;
  };
}

interface SessionData {
  objective?: string;
  data_sources?: string;
  performance?: string;
  compliance?: string;
  budget?: string;
  llm_provider?: string;
}

export const ChatInterface = ({ selectedDomain }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [llmProvider, setLlmProvider] = useState<string>('gemini');
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, [selectedDomain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('start-requirement-session', {
        body: { domain: selectedDomain }
      });

      if (error) throw error;

      setSessionId(data.sessionId);
      
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: `Welcome to the AI Platform Advisor! I'm here to help you design and generate a complete AI solution for your ${selectedDomain} needs. I'll ask you a series of questions to understand your requirements, validate them in real-time, and then generate production-ready code and infrastructure.`,
        timestamp: new Date()
      };

      const firstQuestion: Message = {
        id: '2',
        type: 'assistant',
        content: data.firstQuestion.question,
        timestamp: new Date()
      };

      setMessages([welcomeMessage, firstQuestion]);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start requirement session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !sessionId) return;

    // Check if user wants to generate
    if (isComplete && currentInput.toLowerCase().includes('generate')) {
      await handleGeneration();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-requirement', {
        body: {
          sessionId,
          userResponse: currentInput,
          currentQuestion,
          domain: selectedDomain,
          llmProvider
        }
      });

      if (error) throw error;

      // Update session data
      setSessionData(data.sessionData);

      let responseContent = '';

      // Handle validation feedback
      if (data.validation.valid) {
        responseContent = `✅ ${data.validation.message}`;
      } else {
        responseContent = `⚠️ ${data.validation.message}`;
        if (data.validation.suggestions && data.validation.suggestions.length > 0) {
          responseContent += `\n\nSuggestions:\n${data.validation.suggestions.map((s: string) => `• ${s}`).join('\n')}`;
        }
      }

      // Handle contradiction detection
      if (data.contradiction.detected) {
        responseContent += `\n\n🚨 **Potential Contradiction Detected:**\n${data.contradiction.message}`;
        
        const contradictionMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          validation: data.validation,
          contradiction: data.contradiction
        };
        
        setMessages(prev => [...prev, contradictionMessage]);
        setIsTyping(false);
        return;
      }

      // Check if complete
      if (data.isComplete) {
        setIsComplete(true);
        responseContent += `\n\n🎉 **Requirements Complete!** I have all the information needed to generate your AI solution architecture. 

I will now generate:
• **Architecture Blueprint** (YAML) - System design and service specifications
• **Infrastructure as Code** (Terraform) - Cloud resource provisioning
• **Workflow Automation** (n8n) - Data processing and AI pipelines  
• **CI/CD Templates** (GitHub Actions) - Automated deployment pipelines

Type **"generate"** to start the automated generation process!`;

        toast({
          title: "Requirements Complete!",
          description: "Your specifications have been validated and are ready for generation.",
        });
      } else if (data.nextQuestion) {
        setCurrentQuestion(prev => prev + 1);
        responseContent += `\n\n${data.nextQuestion.question}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        validation: data.validation
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to process requirement:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, there was an error processing your response. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGeneration = async () => {
    setIsGenerating(true);
    setCurrentInput('');
    
    const generationMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: '🚀 Starting automated generation process...\n\n• Step 1: Generating architecture blueprint\n• Step 2: Creating Terraform modules\n• Step 3: Building n8n workflows\n• Step 4: Setting up CI/CD templates\n\nThis may take a few moments...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, generationMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-architecture', {
        body: {
          sessionId,
          sessionData,
          domain: selectedDomain,
          llmProvider
        }
      });

      if (error) throw error;

      setGeneratedArtifacts(data.artifacts);
      setShowResults(true);

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `✅ **Generation Complete!**\n\nYour ${selectedDomain} AI solution has been successfully generated! You can now review and download all artifacts below.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);

      toast({
        title: "Generation Complete!",
        description: "Your AI solution architecture has been generated successfully.",
      });

    } catch (error) {
      console.error('Failed to generate architecture:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate architecture. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, there was an error during generation. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
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

  const totalQuestions = 5;
  const progress = Math.round(((currentQuestion + 1) / totalQuestions) * 100);

  if (showResults && generatedArtifacts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {selectedDomain} - Generated
          </Badge>
        </div>
        <GenerationResults 
          artifacts={generatedArtifacts} 
          sessionData={sessionData} 
          domain={selectedDomain} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {selectedDomain}
            </Badge>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <select 
                value={llmProvider} 
                onChange={(e) => setLlmProvider(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="gemini">Gemini 2.5 Pro</option>
                <option value="gpt4">GPT-4</option>
                <option value="claude">Claude</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Question {currentQuestion + 1}/{totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Progress: {progress}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Validated</span>
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
                      : message.contradiction?.detected
                      ? 'bg-red-50 text-red-800 border border-red-200'
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
            
            {(isTyping || isGenerating) && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
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
            placeholder={
              isComplete 
                ? "Type 'generate' to start generation..." 
                : isGenerating 
                ? "Generating..." 
                : "Type your response..."
            }
            className="flex-1 bg-white/50"
            disabled={isTyping || isGenerating}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isTyping || isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
            LLM: {llmProvider.charAt(0).toUpperCase() + llmProvider.slice(1)} • Progress: {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Send, SkipForward, Lightbulb, RotateCcw, CheckCircle2, Loader2, ArrowLeft, Bot, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { GenerationResults } from '@/components/GenerationResults';

interface ChatInterfaceProps {
  domain: string;
  onSessionComplete: (sessionData: any) => void;
}

interface Message {
  id: string;
  type: 'question' | 'answer' | 'suggestion';
  content: string;
  timestamp: Date;
}

interface SessionData {
  [key: string]: any;
}

const domainQuestions = {
  'Legal': [
    "What specific legal problem are you trying to solve? (e.g., contract analysis, compliance monitoring, legal research)",
    "What data sources will your legal AI solution need to work with? (e.g., contract databases, legal documents, case law APIs)",
    "What are your performance requirements? Please specify expected document processing volume, concurrent users, and response time targets.",
    "Do you have compliance requirements? (e.g., attorney-client privilege, GDPR, data retention policies)",
    "What's your preferred budget range for cloud infrastructure and LLM API costs per month?"
  ],
  'Finance': [
    "What specific financial problem are you trying to solve? (e.g., risk assessment, fraud detection, financial planning)",
    "What data sources will your financial AI solution need to work with? (e.g., transaction databases, market data APIs, financial statements)",
    "What are your performance requirements? Please specify expected transaction volume, concurrent users, and response time targets.",
    "Do you have regulatory compliance requirements? (e.g., PCI-DSS, SOX, Basel III, MiFID II)",
    "What's your preferred budget range for cloud infrastructure and LLM API costs per month?"
  ],
  'Healthcare': [
    "What specific healthcare problem are you trying to solve? Please specify if this is for EMR systems, clinical trials, diagnostics, or patient management.",
    "What data sources will your healthcare AI solution need to work with? (e.g., EMR systems, medical devices, lab results, imaging data)",
    "What are your performance requirements? Please specify expected patient records processed, concurrent users, and response time targets.",
    "Do you have healthcare compliance requirements? (e.g., HIPAA, HITECH, FDA 21 CFR Part 11, GDPR for EU patients)",
    "What's your preferred budget range for cloud infrastructure and LLM API costs per month?"
  ],
  'Human Resources': [
    "What specific HR challenge are you trying to solve? (e.g., recruitment automation, performance analysis, employee engagement)",
    "What data sources will your HR AI solution need to work with? (e.g., HRIS systems, applicant tracking, performance data)",
    "What are your performance requirements? Please specify expected employee records processed, concurrent users, and response time targets.",
    "Do you have HR compliance requirements? (e.g., GDPR for employee data, equal employment opportunity, data retention policies)",
    "What's your preferred budget range for cloud infrastructure and LLM API costs per month?"
  ],
  'Customer Support': [
    "What specific customer support problem are you trying to solve? (e.g., ticket automation, sentiment analysis, knowledge base)",
    "What data sources will your support AI solution need to work with? (e.g., ticket systems, customer databases, chat logs)",
    "What are your performance requirements? Please specify expected ticket volume, concurrent users, and response time targets.",
    "Do you have customer data compliance requirements? (e.g., GDPR, CCPA, data retention policies)",
    "What's your preferred budget range for cloud infrastructure and LLM API costs per month?"
  ]
};

export const ChatInterface = ({ domain, onSessionComplete }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [llmProvider, setLlmProvider] = useState<string>('gemini');
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestionActive, setSuggestionActive] = useState(false);
  const [suggestedText, setSuggestedText] = useState('');
  const [questions, setQuestions] = useState<string[]>(domainQuestions[domain] || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startSession();
  }, [domain]);

  const startSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('start-requirement-session', {
        body: { domain }
      });

      if (error) throw error;

      setSessionId(data.sessionId);
      
      // Add first question
      const firstMessage: Message = {
        id: Date.now().toString(),
        type: 'question',
        content: questions[0],
        timestamp: new Date()
      };
      
      setMessages([firstMessage]);
    } catch (error: any) {
      console.error('Failed to start session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start requirement session",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !sessionId) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'answer',
      content: currentInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('process-requirement', {
        body: {
          sessionId,
          userResponse: currentInput,
          currentQuestion: currentQuestionIndex,
          domain,
          llmProvider: 'gemini'
        }
      });

      if (error) throw error;

      // Update session data
      setSessionData(data.sessionData);

      // Handle validation
      if (!data.validation.valid) {
        setSuggestions(data.validation.suggestions || []);
        setShowSuggestions(true);
        
        toast({
          title: "Response needs improvement",
          description: data.validation.message,
          variant: "destructive"
        });
      } else {
        setShowSuggestions(false);
        
        // Check if complete
        if (data.isComplete) {
          onSessionComplete(data.sessionData);
        } else if (data.nextQuestion) {
          // Add next question
          const nextMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'question',
            content: data.nextQuestion.question,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, nextMessage]);
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }

      // Handle contradictions
      if (data.contradiction && data.contradiction.detected) {
        toast({
          title: "Potential Contradiction Detected",
          description: data.contradiction.message,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Failed to process response:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCurrentInput('');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextMessage: Message = {
        id: Date.now().toString(),
        type: 'question',
        content: questions[currentQuestionIndex + 1],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, nextMessage]);
      setCurrentQuestionIndex(prev => prev + 1);
      setShowSuggestions(false);
    } else {
      // Complete session with current data
      onSessionComplete(sessionData);
    }
  };

  const handleImproveQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const simplifiedQuestion = `Let me simplify: ${currentQuestion.split('(')[0].trim()}?`;
    
    const simplifiedMessage: Message = {
      id: Date.now().toString(),
      type: 'suggestion',
      content: simplifiedQuestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, simplifiedMessage]);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setCurrentInput(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.type === 'answer') return <User className="w-5 h-5" />;
    if (message.type === 'suggestion') return <CheckCircle2 className="w-5 h-5" />;
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
  const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Handler for Suggest button
  const handleSuggest = (suggestion: string) => {
    setCurrentInput(suggestion);
    setSuggestedText(suggestion);
    setSuggestionActive(true);
  };

  // Handler for Accept button
  const handleAccept = () => {
    handleSendMessage();
    setSuggestionActive(false);
    setSuggestedText('');
  };

  if (showResults && generatedArtifacts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {domain} - Generated
          </Badge>
        </div>
        <GenerationResults 
          sessionData={sessionData} 
          domain={domain}
          onArtifactsGenerated={setGeneratedArtifacts}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Requirements Capture - {domain}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{currentQuestionIndex + 1} of {questions.length}</Badge>
              <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setCurrentQuestionIndex(0); setSessionData({}); setCurrentInput(''); }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-white/60 backdrop-blur-sm border border-gray-200 mb-6">
        <CardContent className="p-6">
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'answer' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-xl ${
                  message.type === 'answer' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'suggestion'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {getMessageIcon(message)}
                </div>
                <div className={`flex-1 ${message.type === 'answer' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-2xl ${
                    message.type === 'answer'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'suggestion'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-gray-50 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Suggestions to improve your answer:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => handleUseSuggestion(suggestion)}
                  >
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 mt-6">
            <div className="flex space-x-4">
              <Input
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  setSuggestionActive(false);
                  setSuggestedText('');
                }}
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
                <Button variant="ghost" size="sm" onClick={handleImproveQuestion}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Simplify
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSkipQuestion}>
                  Skip Question
                </Button>
                <Button variant="ghost" size="sm">
                  Not Clear
                </Button>
              </div>
              {/* Session Summary */}
              {Object.keys(sessionData).length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Session Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {Object.entries(sessionData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{String(value).slice(0, 50)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

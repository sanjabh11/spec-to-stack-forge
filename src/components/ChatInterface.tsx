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
import { Dialog } from '@/components/ui/dialog';

interface ChatInterfaceProps {
  domain: string;
  onSessionComplete: (sessionData: any) => void;
  restoredSession?: any;
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
    { field: 'objective', question: "What specific legal problem are you trying to solve? (e.g., contract analysis, compliance monitoring, legal research)" },
    { field: 'data_sources', question: "What data sources will your legal AI solution need to work with? (e.g., contract databases, legal documents, case law APIs)" },
    { field: 'performance', question: "What are your performance requirements? Please specify expected document processing volume, concurrent users, and response time targets." },
    { field: 'compliance', question: "Do you have compliance requirements? (e.g., attorney-client privilege, GDPR, data retention policies)" },
    { field: 'budget', question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?" }
  ],
  'Finance': [
    { field: 'objective', question: "What specific financial problem are you trying to solve? (e.g., risk assessment, fraud detection, financial planning)" },
    { field: 'data_sources', question: "What data sources will your financial AI solution need to work with? (e.g., transaction databases, market data APIs, financial statements)" },
    { field: 'performance', question: "What are your performance requirements? Please specify expected transaction volume, concurrent users, and response time targets." },
    { field: 'compliance', question: "Do you have regulatory compliance requirements? (e.g., PCI-DSS, SOX, Basel III, MiFID II)" },
    { field: 'budget', question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?" }
  ],
  'Healthcare': [
    { field: 'objective', question: "What specific healthcare problem are you trying to solve? Please specify if this is for EMR systems, clinical trials, diagnostics, or patient management." },
    { field: 'data_sources', question: "What data sources will your healthcare AI solution need to work with? (e.g., EMR systems, medical devices, lab results, imaging data)" },
    { field: 'performance', question: "What are your performance requirements? Please specify expected patient records processed, concurrent users, and response time targets." },
    { field: 'compliance', question: "Do you have healthcare compliance requirements? (e.g., HIPAA, HITECH, FDA 21 CFR Part 11, GDPR for EU patients)" },
    { field: 'budget', question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?" }
  ],
  'Human Resources': [
    { field: 'objective', question: "What specific HR challenge are you trying to solve? (e.g., recruitment automation, performance analysis, employee engagement)" },
    { field: 'data_sources', question: "What data sources will your HR AI solution need to work with? (e.g., HRIS systems, applicant tracking, performance data)" },
    { field: 'performance', question: "What are your performance requirements? Please specify expected employee records processed, concurrent users, and response time targets." },
    { field: 'compliance', question: "Do you have HR compliance requirements? (e.g., GDPR for employee data, equal employment opportunity, data retention policies)" },
    { field: 'budget', question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?" }
  ],
  'Customer Support': [
    { field: 'objective', question: "What specific customer support problem are you trying to solve? (e.g., ticket automation, sentiment analysis, knowledge base)" },
    { field: 'data_sources', question: "What data sources will your support AI solution need to work with? (e.g., ticket systems, customer databases, chat logs)" },
    { field: 'performance', question: "What are your performance requirements? Please specify expected ticket volume, concurrent users, and response time targets." },
    { field: 'compliance', question: "Do you have customer data compliance requirements? (e.g., GDPR, CCPA, data retention policies)" },
    { field: 'budget', question: "What's your preferred budget range for cloud infrastructure and LLM API costs per month?" }
  ]
};

export const ChatInterface = ({ domain, onSessionComplete, restoredSession }: ChatInterfaceProps) => {
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
  const [questions, setQuestions] = useState<{ field: string; question: string }[]>(domainQuestions[domain] || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'requirements' | 'kb-qa'>('requirements');
  const [qaInput, setQaInput] = useState('');
  const [qaResults, setQaResults] = useState<any[]>([]);
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (restoredSession) {
      const prevMessages: Message[] = [];
      const sessionQ = domainQuestions[restoredSession.session_data?.domain || domain] || [];
      let lastAnsweredIdx = -1;
      sessionQ.forEach((qObj, idx) => {
        prevMessages.push({
          id: `q-${idx}`,
          type: 'question',
          content: qObj.question,
          timestamp: new Date(restoredSession.created_at)
        });
        const answer = restoredSession.session_data?.[qObj.field];
        if (answer) {
          prevMessages.push({
            id: `a-${idx}`,
            type: 'answer',
            content: answer,
            timestamp: new Date(restoredSession.updated_at)
          });
          lastAnsweredIdx = idx;
        }
      });
      setMessages(prevMessages);
      setCurrentQuestionIndex(lastAnsweredIdx + 1);
      setSessionId(restoredSession.id);
      setSessionData(restoredSession.session_data);
      setIsComplete(restoredSession.status === 'complete' || lastAnsweredIdx === sessionQ.length - 1);
    } else {
      startSession();
    }
  }, [domain, restoredSession]);

  function getFieldForIndex(idx: number): string {
    return questions[idx]?.field || `q${idx + 1}`;
  }

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
        content: questions[0]?.question || '',
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
            id: Date.now().toString(),
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
        content: questions[currentQuestionIndex + 1]?.question || '',
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
    const currentQuestion = questions[currentQuestionIndex]?.question || '';
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

  // Handler for KB Q&A
  const handleKbQa = async () => {
    if (!qaInput.trim()) return;
    setQaLoading(true);
    setQaResults([]);
    setQaAnswer('');
    try {
      // 1. Retrieve relevant chunks from knowledge base
      const { data, error } = await supabase.functions.invoke('knowledge-base-search', {
        body: {
          query: qaInput,
          domain,
          limit: 5,
          threshold: 0.7
        }
      });
      if (error) throw error;
      setQaResults(data.results || []);
      // 2. Compose context for LLM
      const context = (data.results || []).map((r: any) => r.content).join('\n---\n');
      // 3. Call LLM (reuse process-requirement or add a new endpoint if needed)
      const llmRes = await supabase.functions.invoke('process-requirement', {
        body: {
          sessionId: sessionId || 'kb-qa',
          userResponse: qaInput,
          context,
          domain,
          llmProvider: 'gemini',
          mode: 'kb-qa'
        }
      });
      if (llmRes.error) throw llmRes.error;
      setQaAnswer(llmRes.data.answer || 'No answer generated.');
    } catch (err: any) {
      toast({ title: 'Q&A Error', description: err.message, variant: 'destructive' });
    } finally {
      setQaLoading(false);
    }
  };

  // Save session to backend
  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('requirement_sessions')
        .update({ session_data: sessionData, status: 'reviewed', updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
      toast({ title: 'Session saved!', description: 'Your requirements have been saved and are ready for the next step.' });
      setShowReviewModal(false);
      setShowNextSteps(true);
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
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

      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chatbot</CardTitle>
            <div className="flex gap-2">
              <Button variant={mode === 'requirements' ? 'default' : 'outline'} onClick={() => setMode('requirements')}>Requirements Session</Button>
              <Button variant={mode === 'kb-qa' ? 'default' : 'outline'} onClick={() => setMode('kb-qa')}>Knowledge Base Q&A</Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      {mode === 'requirements' ? (
        <>
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
                    <p className="whitespace-pre-wrap cursor-pointer" onClick={() => {
                      if (message.type === 'question') setCurrentQuestionIndex(Math.floor(idx/2));
                    }}>{message.content}</p>
                    {message.type === 'answer' && (
                      <button className="ml-2 text-xs underline text-yellow-200 hover:text-yellow-400" onClick={() => {
                        setCurrentInput(message.content);
                        setCurrentQuestionIndex(Math.floor(idx/2));
                        // Remove downstream answers
                        setMessages(messages.slice(0, idx+1));
                        // Remove downstream sessionData
                        const newSessionData = {...sessionData};
                        Object.keys(newSessionData).forEach((k, i) => {
                          if (i > Math.floor(idx/2)) delete newSessionData[k];
                        });
                        setSessionData(newSessionData);
                      }}>Edit</button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Session Complete Banner */}
          {isComplete && (
            <div className="my-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold">
              Session Complete ✓
              <div className="mt-4">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg shadow hover:bg-blue-700 transition"
                  onClick={() => setShowReviewModal(true)}
                >
                  Review & Save
                </button>
              </div>
            </div>
          )}

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
                    {Object.entries(sessionData).map(([key, value], i) => (
                      <div key={key} className="flex justify-between cursor-pointer hover:bg-blue-50 rounded px-1" onClick={() => setCurrentQuestionIndex(i)}>
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
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Q&A</CardTitle>
            <p className="text-gray-600">Ask any question. The answer will be grounded in your uploaded documents.</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={qaInput}
                onChange={e => setQaInput(e.target.value)}
                placeholder="Ask a question about your knowledge base..."
                onKeyDown={e => e.key === 'Enter' && handleKbQa()}
                disabled={qaLoading}
              />
              <Button onClick={handleKbQa} disabled={qaLoading || !qaInput.trim()}>
                {qaLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} Ask
              </Button>
            </div>
            {qaResults.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Relevant Context</h4>
                <ul className="space-y-2">
                  {qaResults.map((r, i) => (
                    <li key={i} className="p-2 bg-gray-50 rounded border text-sm">{r.content}</li>
                  ))}
                </ul>
              </div>
            )}
            {qaAnswer && (
              <div className="mt-4 p-4 bg-green-50 rounded border">
                <h4 className="font-semibold mb-2">Answer</h4>
                <p>{qaAnswer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        {showReviewModal && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Review Your Requirements</h2>
            <div className="space-y-2 mb-4">
              {Object.entries(sessionData).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b py-1">
                  <span className="capitalize font-medium">{key.replace('_', ' ')}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded font-bold" onClick={handleSaveSession} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* What's Next Panel */}
      {showNextSteps && (
        <div className="my-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center space-y-4">
          <h2 className="text-2xl font-bold mb-2">What's Next?</h2>
          <p className="mb-4 text-gray-700">You've completed and saved your requirements. Choose your next step:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700" onClick={() => window.location.href = '/upload'}>
              Upload Knowledge Base
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700" onClick={() => window.location.href = '/platform-builder'}>
              Create Integration/Workflow
            </button>
            <button className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800" onClick={() => window.location.href = '/platform-builder'}>
              Generate Architecture
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold shadow hover:bg-gray-700" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

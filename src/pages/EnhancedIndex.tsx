import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, Users, Zap, Shield, ArrowRight, LogOut, LogIn } from "lucide-react";
import RequirementWizard from "@/components/RequirementWizard";
import { GenerationResults } from "@/components/GenerationResults";
import { StatsOverview } from "@/components/StatsOverview";
import { RequirementHistory } from "@/components/RequirementHistory";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface EnhancedIndexProps {
  user: User | null;
  onLogout: () => void;
}

export default function EnhancedIndex({ user, onLogout }: EnhancedIndexProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [currentSessionData, setCurrentSessionData] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const domains = [
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'HIPAA-compliant AI solutions for medical applications',
      icon: '🏥',
      compliance: ['HIPAA', 'FDA', 'GDPR'],
      useCases: ['Clinical Decision Support', 'Medical Imaging', 'Patient Risk Assessment']
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Secure financial AI platforms with regulatory compliance',
      icon: '💰',
      compliance: ['SOX', 'PCI-DSS', 'GDPR'],
      useCases: ['Fraud Detection', 'Risk Assessment', 'Algorithmic Trading']
    },
    {
      id: 'legal',
      name: 'Legal',
      description: 'AI-powered legal document analysis and contract review',
      icon: '⚖️',
      compliance: ['GDPR', 'Attorney-Client Privilege'],
      useCases: ['Contract Analysis', 'Legal Research', 'Document Review']
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Personalized learning platforms and educational AI',
      icon: '🎓',
      compliance: ['FERPA', 'COPPA', 'GDPR'],
      useCases: ['Personalized Learning', 'Assessment Tools', 'Content Generation']
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'Customer experience and inventory optimization AI',
      icon: '🛍️',
      compliance: ['PCI-DSS', 'GDPR', 'CCPA'],
      useCases: ['Recommendation Engines', 'Inventory Management', 'Customer Service']
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'Industrial AI for predictive maintenance and optimization',
      icon: '🏭',
      compliance: ['ISO 27001', 'IEC 62443'],
      useCases: ['Predictive Maintenance', 'Quality Control', 'Supply Chain Optimization']
    }
  ];

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setShowWizard(true);
  };

  const handleWizardComplete = (sessionData: any) => {
    setCurrentSessionData(sessionData);
    setShowWizard(false);
    setShowResults(true);
  };

  const handleStartNew = () => {
    setSelectedDomain('');
    setCurrentSessionData(null);
    setShowWizard(false);
    setShowResults(false);
  };

  const handleArtifactsGenerated = (artifacts: any) => {
    console.log('Artifacts generated:', artifacts);
    toast({
      title: "Artifacts Generated",
      description: "Your architecture artifacts have been successfully generated.",
    });
  };

  if (showWizard && selectedDomain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Requirements Capture</h1>
              <p className="text-muted-foreground">Domain: {selectedDomain}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleStartNew}>
                Back to Domains
              </Button>
              {user ? (
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
          <RequirementWizard 
            domain={selectedDomain} 
            onComplete={handleWizardComplete}
          />
        </div>
      </div>
    );
  }

  if (showResults && currentSessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Generated Architecture</h1>
              <p className="text-muted-foreground">Session: {currentSessionData.sessionId}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleStartNew}>
                Start New Project
              </Button>
              {user ? (
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
          <GenerationResults 
            sessionData={currentSessionData}
            domain={currentSessionData.domain}
            onArtifactsGenerated={handleArtifactsGenerated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Platform Advisor
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Transform your vision into production-ready AI platforms
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Guest Mode
                </Badge>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Platform Builder</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Domain Selection */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Choose Your Domain</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Select the industry domain for your AI platform. Each domain comes with specialized templates, 
                  compliance requirements, and best practices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain) => (
                  <Card 
                    key={domain.id} 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-blue-300"
                    onClick={() => handleDomainSelect(domain.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{domain.icon}</span>
                        <div>
                          <CardTitle className="text-xl">{domain.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {domain.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Compliance Standards:</p>
                        <div className="flex flex-wrap gap-1">
                          {domain.compliance.map((standard) => (
                            <Badge key={standard} variant="secondary" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Common Use Cases:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {domain.useCases.map((useCase) => (
                            <li key={useCase} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full mt-4 group">
                        Start Building
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <Zap className="w-8 h-8 text-blue-600" />
                  <CardTitle>Rapid Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate production-ready infrastructure and deployment configurations in minutes, not months.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-600" />
                  <CardTitle>Enterprise Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built-in compliance frameworks, security best practices, and audit trails for enterprise deployment.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Users className="w-8 h-8 text-purple-600" />
                  <CardTitle>Team Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Multi-tenant architecture with role-based access control and collaborative development workflows.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="history">
            <RequirementHistory />
          </TabsContent>

          <TabsContent value="analytics">
            <StatsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

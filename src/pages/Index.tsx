import { useState } from "react";
import { Header } from "@/components/Header";
import { DomainSelector } from "@/components/DomainSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { GenerationResults } from "@/components/GenerationResults";
import { StatsOverview } from "@/components/StatsOverview";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { HealthCheck } from "@/components/HealthCheck";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ObservabilityDashboard } from "@/components/ObservabilityDashboard";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  User, 
  Settings, 
  Database, 
  ArrowLeft,
  GitBranch,
  BarChart3,
  Upload,
  DollarSign,
  Zap,
  Brain,
  Shield,
  Cpu
} from "lucide-react";
import { RequirementHistory } from '@/components/RequirementHistory';

interface IndexProps {
  user: any;
  onLogout: () => void;
}

const Index = ({ user, onLogout }: IndexProps) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [artifacts, setArtifacts] = useState(null);
  const [currentView, setCurrentView] = useState<'domains' | 'chat' | 'results' | 'deploy' | 'upload' | 'observability'>('domains');
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [restoredSession, setRestoredSession] = useState<any>(null);

  // Debug log for user prop
  console.log('Index page user prop:', user);

  const resetToStart = () => {
    setSelectedDomain("");
    setSessionData(null);
    setArtifacts(null);
    setCurrentView('domains');
  };

  const handleSessionComplete = (data: any) => {
    setSessionData(data);
    setCurrentView('results');
  };

  const handleArtifactsGenerated = (data: any) => {
    setArtifacts(data);
    setCurrentView('deploy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* User Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">
                {user?.name || "Guest"}
              </p>
              <p className="text-sm text-gray-600">
                {user?.email || "No email"}
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              {user?.role || "No role"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowHealthCheck(!showHealthCheck)}>
              <Settings className="w-4 h-4 mr-2" />
              System Status
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        <Header />
        
        {/* Health Check Panel */}
        {showHealthCheck && (
          <div className="max-w-md mx-auto">
            <HealthCheck />
          </div>
        )}
        
        {/* Navigation */}
        {currentView !== 'domains' && (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={resetToStart}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <div className="flex space-x-2">
              {selectedDomain && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedDomain}
                </Badge>
              )}
              {sessionData && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Requirements Complete
                </Badge>
              )}
              {artifacts && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Artifacts Generated
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentView === 'domains' && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🚀 AI Platform Advisor - Enterprise Solution Generator
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Generate complete AI solutions with architecture, infrastructure, and deployment automation.
                Select your domain to begin the journey.
              </p>
            </div>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/cost-estimator'}>
                <CardHeader className="text-center pb-3">
                  <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <CardTitle className="text-lg">Cost Estimator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Calculate deployment costs and ROI for your AI platform</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/platform-builder'}>
                <CardHeader className="text-center pb-3">
                  <Zap className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <CardTitle className="text-lg">Platform Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Build complete AI platforms with guided workflows</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('upload')}>
                <CardHeader className="text-center pb-3">
                  <Database className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <CardTitle className="text-lg">Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Upload and manage documents for RAG</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('observability')}>
                <CardHeader className="text-center pb-3">
                  <BarChart3 className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Monitor performance and usage metrics</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Project History - show all previous requirements */}
            <div className="max-w-4xl mx-auto">
              <RequirementHistory 
                tenantId={user?.tenant_id}
                onRestore={(session) => {
                  setSessionData(session.session_data);
                  setSelectedDomain(session.session_data?.domain || '');
                  setCurrentView('chat');
                  setRestoredSession(session);
                }}
              />
            </div>
            
            <DomainSelector 
              onSelect={(domain) => {
                setSelectedDomain(domain);
                setCurrentView('chat');
              }} 
            />
          </div>
        )}

        {currentView === 'chat' && selectedDomain && (
          <ChatInterface 
            domain={selectedDomain} 
            onSessionComplete={handleSessionComplete}
            restoredSession={restoredSession}
          />
        )}

        {currentView === 'results' && sessionData && (
          <GenerationResults 
            sessionData={sessionData} 
            domain={selectedDomain}
            onArtifactsGenerated={handleArtifactsGenerated}
          />
        )}

        {currentView === 'deploy' && artifacts && sessionData && (
          <Tabs defaultValue="deployment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="github">GitHub Integration</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deployment">
              <DeploymentDashboard 
                artifacts={artifacts}
                sessionData={sessionData}
                domain={selectedDomain}
              />
            </TabsContent>
            
            <TabsContent value="github">
              <GitHubIntegration 
                artifacts={artifacts}
                sessionData={sessionData}
                domain={selectedDomain}
              />
            </TabsContent>
            
            <TabsContent value="monitoring">
              <ObservabilityDashboard />
            </TabsContent>
          </Tabs>
        )}

        {currentView === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('domains')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domains
              </Button>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Document Upload & Ingestion
              </Badge>
            </div>
            <DocumentUpload 
              domain={selectedDomain || 'General'}
              onUploadComplete={(docs) => {
                console.log('Documents uploaded:', docs);
                // Optionally redirect back to domains or show success
              }}
            />
          </div>
        )}

        {currentView === 'observability' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('domains')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Observability & Analytics
              </Badge>
            </div>
            <ObservabilityDashboard />
          </div>
        )}

        {/* Always show stats at the bottom */}
        <StatsOverview />
      </div>
    </div>
  );
};

export default Index;

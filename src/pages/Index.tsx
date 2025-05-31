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
import { 
  LogOut, 
  User, 
  Settings, 
  Database, 
  ArrowLeft,
  GitBranch,
  BarChart3,
  Upload
} from "lucide-react";

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

  // Debug log for user prop
  console.log('Index page user prop:', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* User Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">
                {user && user.name ? user.name : <span className="text-gray-400">Guest</span>}
              </p>
              <p className="text-sm text-gray-600">
                {user && user.email ? user.email : <span className="text-gray-300">No email</span>}
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              {user && user.role ? user.role : <span className="text-gray-300">No role</span>}
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
            
            <div className="flex justify-center space-x-4 mb-6">
              <Button 
                onClick={() => setCurrentView('upload')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Manage Knowledge Base
              </Button>
              <Button
                onClick={() => window.location.href = '/builder'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🛠️ Open Builder
              </Button>
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

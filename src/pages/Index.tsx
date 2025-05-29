
import { useState } from "react";
import { Header } from "@/components/Header";
import { DomainSelector } from "@/components/DomainSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { GenerationResults } from "@/components/GenerationResults";
import { StatsOverview } from "@/components/StatsOverview";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { HealthCheck } from "@/components/HealthCheck";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database, ArrowLeft } from "lucide-react";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";

interface IndexProps {
  user: any;
  onLogout: () => void;
}

const Index = ({ user, onLogout }: IndexProps) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [artifacts, setArtifacts] = useState(null);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showHealthCheck, setShowHealthCheck] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* User Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Badge variant="outline" className="ml-2">
              {user.role}
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
        
        {!selectedDomain && !showKnowledgeBase && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🚀 AI Platform - Enterprise Solution Generator
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Generate complete AI solutions with architecture, infrastructure, and deployment automation.
                Select your domain to begin the journey.
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <Button 
                onClick={() => setShowKnowledgeBase(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Manage Knowledge Base
              </Button>
            </div>
            
            <DomainSelector onSelect={setSelectedDomain} />
          </div>
        )}

        {showKnowledgeBase && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setShowKnowledgeBase(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domains
              </Button>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Knowledge Base Management
              </Badge>
            </div>
            <KnowledgeBaseManager 
              domain={selectedDomain || 'General'}
              onDocumentsIndexed={(docs) => console.log('Documents indexed:', docs)}
            />
          </div>
        )}

        {selectedDomain && !sessionData && !showKnowledgeBase && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 {selectedDomain} AI Solution
              </h3>
              <p className="text-gray-600">
                Let's start gathering your requirements for the {selectedDomain.toLowerCase()} AI solution.
              </p>
            </div>
            <ChatInterface 
              domain={selectedDomain} 
              onSessionComplete={setSessionData}
            />
          </div>
        )}

        {sessionData && !artifacts && !showKnowledgeBase && (
          <div className="space-y-6">
            <GenerationResults 
              sessionData={sessionData} 
              domain={selectedDomain}
              onArtifactsGenerated={setArtifacts}
            />
          </div>
        )}

        {artifacts && !showKnowledgeBase && (
          <div className="space-y-6">
            <DeploymentDashboard 
              artifacts={artifacts}
              sessionData={sessionData}
              domain={selectedDomain}
            />
          </div>
        )}

        <StatsOverview />
      </div>
    </div>
  );
};

export default Index;


import { useState } from "react";
import { Header } from "@/components/Header";
import { DomainSelector } from "@/components/DomainSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { GenerationResults } from "@/components/GenerationResults";
import { StatsOverview } from "@/components/StatsOverview";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IndexProps {
  user: any;
  onLogout: () => void;
}

const Index = ({ user, onLogout }: IndexProps) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [artifacts, setArtifacts] = useState(null);

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
          <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        <Header />
        
        {!selectedDomain && (
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
            <DomainSelector onSelect={setSelectedDomain} />
          </div>
        )}

        {selectedDomain && !sessionData && (
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

        {sessionData && !artifacts && (
          <div className="space-y-6">
            <GenerationResults 
              sessionData={sessionData} 
              domain={selectedDomain}
              onArtifactsGenerated={setArtifacts}
            />
          </div>
        )}

        {artifacts && (
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

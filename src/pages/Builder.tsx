import { useState } from "react";
import { Header } from "@/components/Header";
import { DomainSelector } from "@/components/DomainSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { GenerationResults } from "@/components/GenerationResults";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BuilderProps {
  user: any;
  onLogout: () => void;
}

const Builder = ({ user, onLogout }: BuilderProps) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [artifacts, setArtifacts] = useState(null);

  // Defensive check for user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">User not authenticated.</p>
          <Button onClick={onLogout}>Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-900">{user.name || "User"}</span>
            <span className="text-sm text-gray-600">{user.email || "No email"}</span>
          </div>
          <Button variant="outline" onClick={onLogout}>Logout</Button>
        </div>
      </div>
      <div className="container mx-auto py-8 space-y-8">
        <Header />
        {!selectedDomain && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🛠️ Builder: Start Your AI Solution
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your domain to begin the requirement wizard and generate a complete, deployable AI solution.
            </p>
            <DomainSelector onSelect={setSelectedDomain} />
          </div>
        )}
        {selectedDomain && !sessionData && (
          <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDomain("")}> <ArrowLeft className="w-4 h-4 mr-2" /> Back to Domains </Button>
            <ChatInterface domain={selectedDomain} onSessionComplete={setSessionData} />
          </div>
        )}
        {sessionData && !artifacts && (
          <div className="space-y-6">
            <GenerationResults sessionData={sessionData} domain={selectedDomain} onArtifactsGenerated={setArtifacts} />
          </div>
        )}
        {artifacts && (
          <div className="space-y-6">
            <DeploymentDashboard artifacts={artifacts} sessionData={sessionData} domain={selectedDomain} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder; 
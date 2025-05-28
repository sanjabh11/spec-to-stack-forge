
import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { DomainSelector } from '@/components/DomainSelector';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';

const Index = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [chatStarted, setChatStarted] = useState(false);

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setChatStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {!chatStarted ? (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
              AI Platform Advisor Chat
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into production-ready AI solutions with our intelligent requirements wizard.
              Get validated specs, infrastructure blueprints, and deployment-ready code.
            </p>
          </div>

          <StatsOverview />
          
          <div className="mt-16">
            <DomainSelector onDomainSelect={handleDomainSelect} />
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-4">
          <ChatInterface selectedDomain={selectedDomain} />
        </div>
      )}
    </div>
  );
};

export default Index;

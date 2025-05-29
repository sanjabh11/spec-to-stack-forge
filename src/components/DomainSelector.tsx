import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  DollarSign, 
  Users, 
  HeadphonesIcon, 
  Briefcase, 
  Shield, 
  TrendingUp, 
  Settings, 
  ShoppingCart,
  Heart,
  Building,
  Laptop
} from 'lucide-react';

interface DomainSelectorProps {
  onSelect: (domain: string) => void;
}

export const DomainSelector = ({ onSelect }: DomainSelectorProps) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const domains = [
    {
      id: 'legal',
      name: 'Legal',
      icon: Scale,
      description: 'Contract analysis, compliance monitoring, legal research',
      subdomains: ['Contract Management', 'Regulatory Compliance', 'Legal Research'],
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      description: 'Risk assessment, fraud detection, financial planning',
      subdomains: ['Risk Management', 'Fraud Detection', 'Investment Analysis'],
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: Users,
      description: 'Recruitment, performance analysis, employee engagement',
      subdomains: ['Talent Acquisition', 'Performance Management', 'Employee Analytics'],
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'support',
      name: 'Customer Support',
      icon: HeadphonesIcon,
      description: 'Ticket automation, sentiment analysis, knowledge base',
      subdomains: ['Ticket Automation', 'Sentiment Analysis', 'Knowledge Management'],
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: Settings,
      description: 'Process optimization, supply chain, quality control',
      subdomains: ['Process Automation', 'Supply Chain', 'Quality Assurance'],
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: TrendingUp,
      description: 'Campaign optimization, lead scoring, content generation',
      subdomains: ['Campaign Analytics', 'Lead Generation', 'Content Creation'],
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: ShoppingCart,
      description: 'Lead qualification, pipeline management, forecasting',
      subdomains: ['Lead Qualification', 'Pipeline Analytics', 'Sales Forecasting'],
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Heart,
      description: 'Patient management, clinical research, diagnostics',
      subdomains: ['EMR Systems', 'Clinical Trials', 'Diagnostic Support'],
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
      iconColor: 'text-teal-600'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      description: 'Regulatory monitoring, audit automation, policy management',
      subdomains: ['Regulatory Tracking', 'Audit Automation', 'Policy Management'],
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      iconColor: 'text-gray-600'
    },
    {
      id: 'research',
      name: 'R&D',
      icon: Briefcase,
      description: 'Research automation, data analysis, innovation tracking',
      subdomains: ['Research Analytics', 'Innovation Tracking', 'Patent Analysis'],
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'real-estate',
      name: 'Real Estate',
      icon: Building,
      description: 'Property valuation, market analysis, tenant management',
      subdomains: ['Property Valuation', 'Market Analytics', 'Tenant Management'],
      color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: Laptop,
      description: 'Code generation, system monitoring, deployment automation',
      subdomains: ['Code Generation', 'System Monitoring', 'DevOps Automation'],
      color: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
      iconColor: 'text-slate-600'
    }
  ];

  const handleDomainClick = (domainId: string) => {
    setSelectedDomain(domainId);
  };

  const handleGetStarted = () => {
    if (selectedDomain) {
      const domain = domains.find(d => d.id === selectedDomain);
      onSelect(domain?.name || selectedDomain);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Domain
        </h2>
        <p className="text-lg text-gray-600">
          Select the industry or functional area for your AI solution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {domains.map((domain) => (
          <div
            key={domain.id}
            onClick={() => handleDomainClick(domain.id)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedDomain === domain.id 
                ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 border-blue-200' 
                : domain.color
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                <domain.icon className={`w-6 h-6 ${domain.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {domain.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {domain.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {domain.subdomains.slice(0, 2).map((subdomain, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subdomain}
                    </Badge>
                  ))}
                  {domain.subdomains.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{domain.subdomains.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDomain && (
        <div className="text-center animate-fade-in">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Building Your AI Solution
          </Button>
        </div>
      )}
    </div>
  );
};


import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  DollarSign, 
  Heart, 
  Users, 
  MessageSquare,
  Building2,
  Zap,
  Target
} from 'lucide-react';

interface DomainSelectorProps {
  onSelect: (domain: string) => void;
}

export const DomainSelector = ({ onSelect }: DomainSelectorProps) => {
  const domains = [
    {
      id: 'Legal',
      name: 'Legal',
      icon: Scale,
      description: 'Contract analysis, compliance monitoring, legal research automation',
      color: 'bg-blue-500',
      examples: ['Contract Review', 'Compliance Monitoring', 'Legal Research'],
      testId: 'domain-legal'
    },
    {
      id: 'Finance',
      name: 'Finance',
      icon: DollarSign,
      description: 'Risk assessment, fraud detection, financial planning and analysis',
      color: 'bg-green-500',
      examples: ['Risk Assessment', 'Fraud Detection', 'Financial Planning'],
      testId: 'domain-finance'
    },
    {
      id: 'Healthcare',
      name: 'Healthcare',
      icon: Heart,
      description: 'Clinical decision support, patient monitoring, medical research',
      color: 'bg-red-500',
      examples: ['Clinical Notes', 'Patient Monitoring', 'Diagnosis Support'],
      testId: 'domain-healthcare'
    },
    {
      id: 'Human Resources',
      name: 'Human Resources',
      icon: Users,
      description: 'Recruitment automation, performance analysis, employee engagement',
      color: 'bg-purple-500',
      examples: ['Resume Screening', 'Performance Review', 'Employee Surveys'],
      testId: 'domain-hr'
    },
    {
      id: 'Customer Support',
      name: 'Customer Support',
      icon: MessageSquare,
      description: 'Ticket automation, sentiment analysis, knowledge base management',
      color: 'bg-orange-500',
      examples: ['Ticket Routing', 'Sentiment Analysis', 'FAQ Automation'],
      testId: 'domain-support'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 Choose Your Domain
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the industry or use case that best matches your AI solution requirements. 
          Each domain is optimized with specific templates and compliance considerations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => {
          const IconComponent = domain.icon;
          return (
            <Card 
              key={domain.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm"
              onClick={() => onSelect(domain.id)}
              data-testid={domain.testId}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-xl ${domain.color} text-white group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{domain.name}</h4>
                    <Badge variant="outline" className="text-xs">AI-Powered</Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {domain.description}
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use Cases:</h5>
                  <div className="flex flex-wrap gap-1">
                    {domain.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Target className="w-3 h-3" />
                    <span>Optimized Templates</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-blue-600 group-hover:text-blue-700">
                    <Zap className="w-3 h-3" />
                    <span>Quick Start</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Don't see your domain? Contact us to add custom domain templates.
        </p>
      </div>
    </div>
  );
};

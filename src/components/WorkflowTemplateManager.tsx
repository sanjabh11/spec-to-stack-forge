
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Play, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  DollarSign,
  Shield,
  Briefcase,
  Heart,
  TrendingUp,
  Cog,
  MessageSquare,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  status: 'ready' | 'configured' | 'testing' | 'active';
  endpoints: string[];
  features: string[];
  icon: React.ReactNode;
  color: string;
}

export const WorkflowTemplateManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('legal');

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'legal-document-ingestion',
      name: 'Legal Document Ingestion',
      description: 'Automatically process legal documents, contracts, and case files with privilege protection',
      domain: 'legal',
      status: 'ready',
      endpoints: ['/legal-document-ingest'],
      features: ['Document Processing', 'Privilege Protection', 'Case Law Analysis', 'Contract Review'],
      icon: <Briefcase className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'hr-policy-qa',
      name: 'HR Policy Q&A Workflow',
      description: 'Real-time employee policy questions with Slack integration for urgent issues',
      domain: 'hr',
      status: 'ready',
      endpoints: ['/hr-qa'],
      features: ['Policy Q&A', 'Slack Integration', 'Urgency Detection', 'Employee Support'],
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'finance-report-automation',
      name: 'Finance Report Automation',
      description: 'Automated financial document processing with risk assessment and compliance checking',
      domain: 'finance',
      status: 'ready',
      endpoints: ['/finance-report-automation'],
      features: ['Risk Assessment', 'Compliance Checking', 'SOX/GAAP Support', 'Email Alerts'],
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'customer-support-kb',
      name: 'Customer Support Knowledge Base',
      description: 'Smart customer support with ticket analysis and automated responses',
      domain: 'customer_support',
      status: 'configured',
      endpoints: ['/customer-support-kb'],
      features: ['Ticket Analysis', 'Auto-Response', 'Escalation Logic', 'Knowledge Mining'],
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'rd-patent-analysis',
      name: 'R&D Patent Analysis',
      description: 'Intellectual property analysis and prior art research for R&D teams',
      domain: 'r_and_d',
      status: 'configured',
      endpoints: ['/rd-patent-analysis'],
      features: ['Patent Search', 'Prior Art Analysis', 'IP Protection', 'Innovation Tracking'],
      icon: <Database className="w-5 h-5" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'compliance-monitoring',
      name: 'Compliance Monitoring',
      description: 'Continuous regulatory compliance monitoring and audit preparation',
      domain: 'compliance',
      status: 'testing',
      endpoints: ['/compliance-monitoring'],
      features: ['Regulatory Tracking', 'Audit Preparation', 'Risk Monitoring', 'Policy Updates'],
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      id: 'marketing-insights',
      name: 'Marketing Intelligence',
      description: 'Market research analysis and competitive intelligence gathering',
      domain: 'marketing',
      status: 'testing',
      endpoints: ['/marketing-insights'],
      features: ['Market Analysis', 'Competitor Tracking', 'Trend Analysis', 'Content Insights'],
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      id: 'operations-maintenance',
      name: 'Operations & Maintenance',
      description: 'Equipment maintenance tracking and SOP management with safety protocols',
      domain: 'operations',
      status: 'active',
      endpoints: ['/operations-maintenance'],
      features: ['SOP Management', 'Equipment Tracking', 'Safety Protocols', 'Maintenance Logs'],
      icon: <Cog className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'sales-crm-automation',
      name: 'Sales CRM Automation',
      description: 'Automated lead scoring, proposal generation, and client communication',
      domain: 'sales',
      status: 'active',
      endpoints: ['/sales-crm-automation'],
      features: ['Lead Scoring', 'Proposal Generation', 'Client History', 'Revenue Forecasting'],
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-teal-500'
    },
    {
      id: 'healthcare-clinical',
      name: 'Healthcare Clinical Assistant',
      description: 'HIPAA-compliant clinical documentation and medical literature analysis',
      domain: 'healthcare',
      status: 'configured',
      endpoints: ['/healthcare-clinical'],
      features: ['HIPAA Compliance', 'Clinical Notes', 'Literature Analysis', 'Patient Safety'],
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-rose-500'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'configured': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'testing': return <Play className="w-4 h-4 text-orange-500" />;
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ready: 'bg-yellow-100 text-yellow-800',
      configured: 'bg-blue-100 text-blue-800',
      testing: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const installWorkflow = async (template: WorkflowTemplate) => {
    toast.info(`Installing ${template.name}...`);
    
    try {
      // Simulate API call to install workflow in N8N
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${template.name} installed successfully!`);
    } catch (error) {
      toast.error(`Failed to install ${template.name}`);
    }
  };

  const testWorkflow = async (template: WorkflowTemplate) => {
    toast.info(`Testing ${template.name}...`);
    
    try {
      // Simulate workflow test
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(`${template.name} test completed successfully!`);
    } catch (error) {
      toast.error(`${template.name} test failed`);
    }
  };

  const domains = [
    { id: 'legal', label: 'Legal', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'hr', label: 'HR', icon: <Users className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'customer_support', label: 'Support', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'r_and_d', label: 'R&D', icon: <Database className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
    { id: 'marketing', label: 'Marketing', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'operations', label: 'Operations', icon: <Cog className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales', icon: <FileText className="w-4 h-4" /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="w-4 h-4" /> }
  ];

  const filteredTemplates = workflowTemplates.filter(template => template.domain === activeTab);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">N8N Workflow Templates</h2>
        <p className="text-muted-foreground">
          Ready-to-deploy automation workflows for enterprise use cases
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          {domains.map(domain => (
            <TabsTrigger key={domain.id} value={domain.id} className="flex items-center space-x-1">
              {domain.icon}
              <span className="hidden sm:inline">{domain.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {domains.map(domain => (
          <TabsContent key={domain.id} value={domain.id} className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${template.color} text-white`}>
                          {template.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(template.status)}
                        <Badge className={getStatusBadge(template.status)}>
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Endpoints:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.endpoints.map(endpoint => (
                          <Badge key={endpoint} variant="outline" className="font-mono">
                            {endpoint}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map(feature => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => installWorkflow(template)}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Install
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => testWorkflow(template)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to deploy workflows to your N8N instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Import Workflow Templates</h4>
            <p className="text-sm text-muted-foreground">
              Copy the JSON from <code>/workflow-templates/</code> and import into N8N
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Configure Credentials</h4>
            <p className="text-sm text-muted-foreground">
              Set up Supabase, Gmail, and Slack credentials in N8N
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Test Workflows</h4>
            <p className="text-sm text-muted-foreground">
              Use the test buttons above to validate each workflow
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Activate & Monitor</h4>
            <p className="text-sm text-muted-foreground">
              Enable workflows and monitor through the N8N dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

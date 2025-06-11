import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Send,
  FileText,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: string;
  duration?: number;
  response?: any;
}

export const WorkflowTester: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [testPayload, setTestPayload] = useState('');
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const workflows = [
    {
      id: 'legal-document-ingestion',
      name: 'Legal Document Ingestion',
      endpoint: '/legal-document-ingest',
      samplePayload: JSON.stringify({
        id: "legal-doc-001",
        document_type: "contract",
        jurisdiction: "US",
        practice_area: "corporate",
        client_matter: "ACME Corp Acquisition",
        content: "This is a sample legal document content for testing purposes...",
        file_name: "acme-acquisition-contract.pdf",
        file_size: 245678,
        confidentiality_level: "attorney-client",
        user_id: "lawyer-001"
      }, null, 2)
    },
    {
      id: 'hr-policy-qa',
      name: 'HR Policy Q&A',
      endpoint: '/hr-qa',
      samplePayload: JSON.stringify({
        question: "What is the company policy on remote work?",
        employee_id: "emp-001",
        department: "engineering",
        urgency: "normal",
        category: "policy",
        session_id: "hr-session-001"
      }, null, 2)
    },
    {
      id: 'finance-report-automation',
      name: 'Finance Report Automation',
      endpoint: '/finance-report-automation',
      samplePayload: JSON.stringify({
        id: "fin-report-001",
        report_type: "quarterly_earnings",
        period: "Q1_2024",
        department: "finance",
        content: "Q1 2024 Financial Results: Revenue $10M, Expenses $7M, Net Income $3M...",
        financial_data: {
          revenue: 10000000,
          expenses: 7000000,
          net_income: 3000000,
          ebitda: 3500000
        },
        file_name: "Q1-2024-earnings.pdf",
        user_id: "cfo-001"
      }, null, 2)
    },
    {
      id: 'customer-support-kb',
      name: 'Customer Support Knowledge Base',
      endpoint: '/customer-support-kb',
      samplePayload: JSON.stringify({
        ticket_id: "TICK-001",
        query: "How do I reset my password?",
        customer_id: "cust-12345",
        urgency: "normal",
        category: "account",
        channel: "web",
        customer_tier: "premium"
      }, null, 2)
    },
    {
      id: 'rd-patent-analysis',
      name: 'R&D Patent Analysis',
      endpoint: '/rd-patent-analysis',
      samplePayload: JSON.stringify({
        id: "rd-analysis-001",
        innovation_type: "software_algorithm",
        description: "Novel machine learning algorithm for real-time data processing...",
        inventor_team: ["Dr. Smith", "Prof. Johnson"],
        research_area: "artificial_intelligence",
        priority_level: "high",
        project_code: "AI-2024-001",
        confidentiality_level: "internal"
      }, null, 2)
    },
    {
      id: 'compliance-monitoring',
      name: 'Compliance Monitoring',
      endpoint: '/compliance-monitoring',
      samplePayload: JSON.stringify({
        id: "comp-audit-001",
        regulation_type: "GDPR",
        jurisdiction: "EU",
        compliance_area: "data_privacy",
        document_content: "Data processing procedures for customer information handling...",
        audit_scope: "operational",
        department: "compliance",
        risk_category: "medium"
      }, null, 2)
    },
    {
      id: 'marketing-insights',
      name: 'Marketing Intelligence',
      endpoint: '/marketing-insights',
      samplePayload: JSON.stringify({
        id: "market-analysis-001",
        campaign_type: "competitive_analysis",
        target_market: "B2B_SaaS",
        content_type: "market_research",
        market_data: "Competitive landscape analysis for enterprise software market...",
        analysis_scope: "competitive",
        geographic_scope: "North_America",
        industry_vertical: "technology"
      }, null, 2)
    },
    {
      id: 'operations-maintenance',
      name: 'Operations & Maintenance',
      endpoint: '/operations-maintenance',
      samplePayload: JSON.stringify({
        id: "ops-log-001",
        operation_type: "preventive_maintenance",
        equipment_id: "EQUIP-M-001",
        facility: "manufacturing_plant_1",
        procedure_content: "Monthly maintenance check on production line equipment...",
        safety_level: "standard",
        operator_id: "tech-003",
        shift: "day"
      }, null, 2)
    },
    {
      id: 'sales-crm-automation',
      name: 'Sales CRM Automation',
      endpoint: '/sales-crm-automation',
      samplePayload: JSON.stringify({
        id: "sales-interaction-001",
        lead_type: "enterprise_prospect",
        company_size: "large",
        industry: "financial_services",
        interaction_content: "Initial discovery call with Fortune 500 financial institution...",
        deal_stage: "qualification",
        sales_rep: "sales-rep-001",
        lead_score: 75,
        revenue_potential: 500000
      }, null, 2)
    },
    {
      id: 'healthcare-clinical',
      name: 'Healthcare Clinical Assistant',
      endpoint: '/healthcare-clinical',
      samplePayload: JSON.stringify({
        id: "clinical-note-001",
        document_type: "progress_note",
        patient_category: "ambulatory",
        specialty: "cardiology",
        clinical_content: "Patient follow-up for cardiac evaluation and treatment plan...",
        urgency_level: "routine",
        clinician_id: "dr-smith-001",
        patient_anonymized: true
      }, null, 2)
    }
  ];

  const runWorkflowTest = async () => {
    if (!selectedWorkflow || !testPayload) {
      toast.error('Please select a workflow and provide test payload');
      return;
    }

    setIsLoading(true);
    setTestResults({ status: 'pending', message: 'Running test...', timestamp: new Date().toISOString() });

    const startTime = Date.now();

    try {
      const workflow = workflows.find(w => w.id === selectedWorkflow);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Simulate N8N webhook call
      const response = await fetch(`http://localhost:5678/webhook${workflow.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testPayload,
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json();

      if (response.ok) {
        setTestResults({
          status: 'success',
          message: `Workflow executed successfully`,
          timestamp: new Date().toISOString(),
          duration,
          response: responseData
        });
        toast.success('Workflow test completed successfully!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        duration
      });
      toast.error('Workflow test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSamplePayload = () => {
    const workflow = workflows.find(w => w.id === selectedWorkflow);
    if (workflow) {
      setTestPayload(workflow.samplePayload);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">N8N Workflow Tester</h2>
        <p className="text-muted-foreground">
          Test your workflow templates with sample data across all 10 business domains
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Test Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure and run workflow tests for all domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-select">Select Workflow</Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger id="workflow-select">
                  <SelectValue placeholder="Choose a workflow to test" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map(workflow => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWorkflow && (
              <div className="space-y-2">
                <Label>Endpoint</Label>
                <Input 
                  value={workflows.find(w => w.id === selectedWorkflow)?.endpoint || ''} 
                  readOnly 
                  className="font-mono bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="test-payload">Test Payload (JSON)</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadSamplePayload}
                  disabled={!selectedWorkflow}
                >
                  Load Sample
                </Button>
              </div>
              <Textarea
                id="test-payload"
                placeholder="Enter JSON payload for testing..."
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="font-mono min-h-[200px]"
              />
            </div>

            <Button 
              onClick={runWorkflowTest} 
              disabled={!selectedWorkflow || !testPayload || isLoading}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? 'Running Test...' : 'Run Test'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Test Results</span>
            </CardTitle>
            <CardDescription>
              View workflow execution results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testResults.status)}
                    <Badge 
                      className={
                        testResults.status === 'success' ? 'bg-green-100 text-green-800' :
                        testResults.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {testResults.status.toUpperCase()}
                    </Badge>
                  </div>
                  {testResults.duration && (
                    <span className="text-sm text-muted-foreground">
                      {testResults.duration}ms
                    </span>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    {testResults.message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Timestamp</Label>
                  <Input 
                    value={new Date(testResults.timestamp).toLocaleString()} 
                    readOnly 
                    className="font-mono bg-muted"
                  />
                </div>

                {testResults.response && (
                  <div className="space-y-2">
                    <Label>Response</Label>
                    <Textarea
                      value={JSON.stringify(testResults.response, null, 2)}
                      readOnly
                      className="font-mono bg-muted min-h-[150px]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No test results yet</p>
                <p className="text-sm">Run a workflow test to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enterprise Workflow Testing Guide</CardTitle>
          <CardDescription>
            Best practices for testing N8N workflows across all business domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Pre-Test Checklist</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• N8N instance is running</li>
                <li>• All 10 workflows imported</li>
                <li>• Credentials configured</li>
                <li>• Supabase connection active</li>
                <li>• Email services configured</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Test Scenarios</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Valid payload processing</li>
                <li>• Error handling validation</li>
                <li>• Integration endpoints</li>
                <li>• Alert notifications</li>
                <li>• Escalation workflows</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Domain Coverage</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Legal & Compliance</li>
                <li>• HR & Finance</li>
                <li>• Customer & Sales</li>
                <li>• R&D & Operations</li>
                <li>• Marketing & Healthcare</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

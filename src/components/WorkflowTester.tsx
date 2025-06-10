
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
          Test your workflow templates with sample data
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
              Configure and run workflow tests
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
          <CardTitle>Testing Guide</CardTitle>
          <CardDescription>
            Best practices for testing N8N workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Pre-Test Checklist</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• N8N instance is running</li>
                <li>• Workflows are imported and active</li>
                <li>• Required credentials are configured</li>
                <li>• Supabase connection is working</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Test Scenarios</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Valid payload processing</li>
                <li>• Error handling and validation</li>
                <li>• Integration endpoints</li>
                <li>• Notification systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

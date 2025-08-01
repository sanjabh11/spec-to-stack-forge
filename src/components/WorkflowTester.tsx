
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestExecution {
  id: string;
  workflow_name: string;
  status: 'running' | 'success' | 'failed' | 'waiting';
  started_at: string;
  finished_at?: string;
  duration?: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
}

export const WorkflowTester: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [testInput, setTestInput] = useState<string>('{}');
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const mockWorkflows = [
    { id: 'healthcare-ehr', name: 'Healthcare EHR Integration', domain: 'healthcare' },
    { id: 'finance-fraud', name: 'Finance Fraud Detection', domain: 'finance' },
    { id: 'legal-doc', name: 'Legal Document Analysis', domain: 'legal' },
    { id: 'hr-onboarding', name: 'HR Employee Onboarding', domain: 'hr' }
  ];

  useEffect(() => {
    // Load recent executions
    setExecutions([
      {
        id: '1',
        workflow_name: 'Healthcare EHR Integration',
        status: 'success',
        started_at: '2024-01-15T10:30:00Z',
        finished_at: '2024-01-15T10:32:00Z',
        duration: 120,
        input_data: { patient_id: '12345' },
        output_data: { processed: true, records_updated: 5 }
      },
      {
        id: '2',
        workflow_name: 'Finance Fraud Detection',
        status: 'failed',
        started_at: '2024-01-15T09:15:00Z',
        finished_at: '2024-01-15T09:16:30Z',
        duration: 90,
        input_data: { transaction_id: 'tx_67890' },
        error_message: 'API rate limit exceeded'
      }
    ]);
  }, []);

  const runTest = async () => {
    if (!selectedWorkflow) {
      toast.error('Please select a workflow to test');
      return;
    }

    try {
      const inputData = JSON.parse(testInput);
      setIsRunning(true);

      // Simulate workflow execution
      const newExecution: TestExecution = {
        id: Date.now().toString(),
        workflow_name: mockWorkflows.find(w => w.id === selectedWorkflow)?.name || 'Unknown',
        status: 'running',
        started_at: new Date().toISOString(),
        input_data: inputData
      };

      setExecutions(prev => [newExecution, ...prev]);

      // Simulate execution time
      setTimeout(() => {
        setExecutions(prev => prev.map(exec => 
          exec.id === newExecution.id 
            ? {
                ...exec,
                status: Math.random() > 0.7 ? 'failed' : 'success',
                finished_at: new Date().toISOString(),
                duration: Math.floor(Math.random() * 300) + 30,
                output_data: exec.status === 'success' ? { result: 'processed successfully' } : undefined,
                error_message: exec.status === 'failed' ? 'Simulated error for testing' : undefined
              }
            : exec
        ));
        setIsRunning(false);
        toast.success('Test execution completed');
      }, 3000);

    } catch (error) {
      toast.error('Invalid JSON input');
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Workflow Testing Environment</h2>
        <p className="text-muted-foreground">
          Test and validate your N8N workflows with sample data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configure Test</CardTitle>
            <CardDescription>
              Select a workflow and provide test input data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger>
                <SelectValue placeholder="Select workflow to test..." />
              </SelectTrigger>
              <SelectContent>
                {mockWorkflows.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <label className="text-sm font-medium">Test Input (JSON)</label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <Button 
              onClick={runTest} 
              disabled={isRunning || !selectedWorkflow}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent workflow test executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executions.map(execution => (
                <div key={execution.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-medium text-sm">
                        {execution.workflow_name}
                      </span>
                    </div>
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Started: {new Date(execution.started_at).toLocaleString()}</div>
                    {execution.duration && (
                      <div>Duration: {execution.duration}s</div>
                    )}
                  </div>

                  {execution.error_message && (
                    <Alert className="mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        {execution.error_message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

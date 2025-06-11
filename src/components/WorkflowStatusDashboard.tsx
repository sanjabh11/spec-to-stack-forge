
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'running';
  lastRun: string;
  nextRun?: string;
  executions: number;
  successRate: number;
}

export const WorkflowStatusDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setWorkflows([
      {
        id: 'legal-doc-ingestion',
        name: 'Legal Document Ingestion',
        status: 'active',
        lastRun: '2024-01-15T10:30:00Z',
        nextRun: '2024-01-15T14:30:00Z',
        executions: 145,
        successRate: 98.5
      },
      {
        id: 'hr-policy-qa',
        name: 'HR Policy Q&A',
        status: 'active',
        lastRun: '2024-01-15T09:15:00Z',
        executions: 89,
        successRate: 96.2
      },
      {
        id: 'finance-report-automation',
        name: 'Finance Report Automation',
        status: 'inactive',
        lastRun: '2024-01-14T18:00:00Z',
        executions: 23,
        successRate: 100
      }
    ]);
  }, []);

  const refreshWorkflows = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from N8N API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Workflow status refreshed');
    } catch (error) {
      toast.error('Failed to refresh workflow status');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: newStatus as any } : w
      ));
      toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to toggle workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <Pause className="w-4 h-4 text-gray-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workflow Status Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your N8N workflow executions
          </p>
        </div>
        <Button onClick={refreshWorkflows} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Alert>
          <Activity className="w-4 h-4" />
          <AlertDescription>
            No workflows found. Make sure N8N is running and workflows are imported.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {workflows.map(workflow => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>ID: {workflow.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleWorkflow(workflow.id, workflow.status)}
                    >
                      {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Last Run</span>
                    <div className="text-sm">
                      {new Date(workflow.lastRun).toLocaleString()}
                    </div>
                  </div>
                  {workflow.nextRun && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Next Run</span>
                      <div className="text-sm">
                        {new Date(workflow.nextRun).toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Executions</span>
                    <div className="text-sm font-semibold">{workflow.executions}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
                    <div className="text-sm font-semibold text-green-600">
                      {workflow.successRate}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>N8N Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Activity className="w-4 h-4" />
            <AlertDescription>
              Connected to N8N instance at localhost:5678. 
              Make sure your N8N instance is running and accessible.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

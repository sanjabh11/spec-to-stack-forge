
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, 
  Shield, 
  Activity, 
  Database, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink 
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface DevOpsDashboardProps {
  sessionId: string;
  artifacts: any;
}

export const DevOpsDashboard: React.FC<DevOpsDashboardProps> = ({ sessionId, artifacts }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityScans, setSecurityScans] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load observability metrics
      const metricsData = await apiClient.getObservabilityMetrics('get-dashboard');
      setMetrics(metricsData);

      // Load audit logs
      const logs = await apiClient.getAuditLogs();
      setAuditLogs(logs);

      // Simulate security scan results
      setSecurityScans([
        { type: 'RLS', status: 'passed', score: 95 },
        { type: 'Secrets Scan', status: 'passed', score: 100 },
        { type: 'Dependency Audit', status: 'warning', score: 85 },
        { type: 'Infrastructure Scan', status: 'passed', score: 92 }
      ]);

      // Simulate deployment status
      setDeploymentStatus({
        environment: 'staging',
        status: 'deployed',
        version: '1.0.0',
        last_deployment: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerDeployment = async (environment: string) => {
    try {
      setLoading(true);
      
      // Create GitHub repository/PR with artifacts
      await apiClient.createGitHubIntegration('create-repository', {
        repoName: `ai-platform-${sessionId.slice(0, 8)}`,
        orgName: 'your-org',
        artifacts,
        domain: artifacts?.metadata?.domain || 'AI Platform'
      });

      toast.success(`Deployment to ${environment} initiated`);
      await loadDashboardData();
    } catch (error) {
      toast.error('Deployment failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployment Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deploymentStatus?.status || 'Not Deployed'}
            </div>
            <p className="text-xs text-muted-foreground">
              {deploymentStatus?.environment} environment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityScans.length > 0 
                ? Math.round(securityScans.reduce((acc, scan) => acc + scan.score, 0) / securityScans.length)
                : 'N/A'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.active_sessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Current requirement sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="observability">Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Pipeline</CardTitle>
              <CardDescription>
                Deploy your generated artifacts to staging or production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => triggerDeployment('staging')}
                  disabled={loading}
                  className="w-full"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Deploy to Staging
                </Button>
                <Button 
                  onClick={() => triggerDeployment('production')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Server className="mr-2 h-4 w-4" />
                  Deploy to Production
                </Button>
              </div>
              
              {deploymentStatus && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Last deployment: {new Date(deploymentStatus.last_deployment).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Scans</CardTitle>
              <CardDescription>
                Automated security checks and compliance validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scan.status)}
                      <div>
                        <div className="font-medium">{scan.type}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {scan.score}%
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(scan.status)}>
                      {scan.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="observability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>
                Real-time monitoring and observability data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>API Response Time</span>
                    <span>{metrics?.avg_response_time || '0'}ms</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span>{metrics?.success_rate || '99.9'}%</span>
                  </div>
                  <Progress value={99.9} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Token Usage</span>
                    <span>{metrics?.token_usage || '75'}%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span>{metrics?.error_rate || '0.1'}%</span>
                  </div>
                  <Progress value={0.1} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete audit log of all platform activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.resource_type} - {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline">{log.resource_type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

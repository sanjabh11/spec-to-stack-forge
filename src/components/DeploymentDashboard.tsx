
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  Rocket, 
  Activity, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Database,
  Server,
  Eye,
  ExternalLink,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeploymentDashboardProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

export const DeploymentDashboard = ({ artifacts, sessionData, domain }: DeploymentDashboardProps) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [llmUsage, setLlmUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, auditRes, usageRes] = await Promise.all([
        supabase.functions.invoke('observability', {
          body: { action: 'get-metrics' }
        }),
        supabase.functions.invoke('observability', {
          body: { action: 'get-audit-logs', filters: { limit: 10 } }
        }),
        supabase.functions.invoke('observability', {
          body: { action: 'get-llm-usage' }
        })
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (auditRes.data) setAuditLogs(auditRes.data.logs || []);
      if (usageRes.data) setLlmUsage(usageRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAction = async (action: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: {
          action,
          artifacts,
          sessionData,
          repositoryUrl: 'https://github.com/user/ai-solution'
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${action} completed successfully`,
      });

      if (data.pr_url || data.repository_url) {
        window.open(data.pr_url || data.repository_url, '_blank');
      }

      loadDashboardData(); // Refresh audit logs
    } catch (error) {
      console.error(`GitHub ${action} failed:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-800">🚀 Phase III: Deployment & Observability</CardTitle>
              <p className="text-blue-600 mt-2">
                GitOps integration, deployment management, and comprehensive monitoring for your {domain} AI solution.
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Production Ready
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="deployment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployment" className="flex items-center space-x-2">
            <Rocket className="w-4 h-4" />
            <span>Deployment</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Cost Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* GitOps Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span>GitOps & Deployment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleGitHubAction('create-repository')}
                    className="bg-gray-800 hover:bg-gray-900"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Create Repo
                  </Button>
                  <Button 
                    onClick={() => handleGitHubAction('create-pr')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create PR
                  </Button>
                  <Button 
                    onClick={() => handleGitHubAction('get-diff')}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Diff
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Local Setup
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Deployment Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Infrastructure</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Workflows</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Validated
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CI/CD</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.overview.success_rate}%
                      </div>
                      <div className="text-sm text-blue-600">Success Rate</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.overview.avg_generation_time}s
                      </div>
                      <div className="text-sm text-green-600">Avg Generation</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.overview.total_sessions}
                      </div>
                      <div className="text-sm text-purple-600">Total Sessions</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${metrics.overview.total_cost}
                      </div>
                      <div className="text-sm text-orange-600">Total Cost</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* LLM Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>LLM Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Model Accuracy</span>
                        <div className="text-lg font-semibold">{metrics.llm_metrics.model_accuracy}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">RAG Hit Ratio</span>
                        <div className="text-lg font-semibold">{metrics.llm_metrics.rag_hit_ratio}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">P95 Latency</span>
                        <div className="text-lg font-semibold">{metrics.llm_metrics.avg_latency_p95}s</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Tokens</span>
                        <div className="text-lg font-semibold">{metrics.llm_metrics.total_tokens.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Infrastructure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="font-semibold">{metrics.infrastructure.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="font-semibold">{metrics.infrastructure.memory_usage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Connections</span>
                      <span className="font-semibold">{metrics.infrastructure.active_connections}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Cost Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {llmUsage && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${llmUsage.cost_breakdown.total_spend}
                      </div>
                      <div className="text-sm text-green-600">Total Monthly Spend</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">By Operation</h4>
                      {Object.entries(llmUsage.cost_breakdown.by_operation).map(([operation, cost]: [string, any]) => (
                        <div key={operation} className="flex justify-between">
                          <span className="text-sm capitalize">{operation.replace('_', ' ')}</span>
                          <span className="font-semibold">${cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Usage */}
            <Card>
              <CardHeader>
                <CardTitle>LLM Provider Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {llmUsage && (
                  <div className="space-y-3">
                    {llmUsage.providers.map((provider: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{provider.name}</span>
                          <Badge variant="outline">{provider.success_rate}% success</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Requests:</span> {provider.total_requests.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-gray-600">Cost:</span> ${provider.total_cost}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Audit Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-sm text-gray-600">{log.resource_type}</span>
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(log.details, null, 2).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
                
                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

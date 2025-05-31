
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const ObservabilityDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObservabilityData();
  }, []);

  const loadObservabilityData = async () => {
    setLoading(true);
    try {
      // Load metrics
      const { data: metricsData } = await supabase.functions.invoke('observability', {
        body: { action: 'get-metrics' }
      });

      // Load audit logs
      const { data: logsData } = await supabase.functions.invoke('observability', {
        body: { action: 'get-audit-logs', filters: { limit: 50 } }
      });

      setMetrics(metricsData);
      setAuditLogs(logsData?.logs || []);
    } catch (error) {
      console.error('Failed to load observability data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Observability Dashboard</h2>
          <p className="text-gray-600">Monitor your AI platform's performance, costs, and compliance</p>
        </div>
        <Button onClick={loadObservabilityData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview?.total_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.overview?.success_rate || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview?.avg_generation_time || 0}s</div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics?.llm_metrics?.avg_latency_p95 || 0}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.overview?.total_cost || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.llm_metrics?.total_tokens || 0} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="flex space-x-1 mt-1">
              <Badge variant="outline" className="text-xs">HIPAA</Badge>
              <Badge variant="outline" className="text-xs">SOC2</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Sessions and generations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics?.time_series || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                    <Line type="monotone" dataKey="generations" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage by Domain</CardTitle>
                <CardDescription>Session distribution across domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.usage_by_domain || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                      label={({ domain, sessions }) => `${domain}: ${sessions}`}
                    >
                      {(metrics?.usage_by_domain || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>LLM Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for AI operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics?.llm_metrics?.model_accuracy || 0}%</div>
                  <div className="text-sm text-gray-600">Model Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics?.llm_metrics?.rag_hit_ratio || 0}%</div>
                  <div className="text-sm text-gray-600">RAG Hit Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics?.llm_metrics?.cache_effectiveness || 0}%</div>
                  <div className="text-sm text-gray-600">Cache Effectiveness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{metrics?.llm_metrics?.contradiction_detection_rate || 0}%</div>
                  <div className="text-sm text-gray-600">Contradiction Detection</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current compliance with industry standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics?.compliance_flags && Object.entries(metrics.compliance_flags).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {value ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>Security monitoring and threats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Failed Auth Attempts</span>
                  <Badge variant="outline">{metrics?.security_metrics?.failed_auth_attempts || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious Activities</span>
                  <Badge variant="outline">{metrics?.security_metrics?.suspicious_activities || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Policy Violations</span>
                  <Badge variant="outline">{metrics?.security_metrics?.policy_violations || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vulnerability Count</span>
                  <Badge variant="outline">{metrics?.security_metrics?.vulnerability_count || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>LLM usage costs and optimization opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.usage_by_domain || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>System activity and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-gray-600">
                        {log.resource_type} • {new Date(log.created_at).toLocaleString()}
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

      <Card>
        <CardHeader>
          <CardTitle>External Links</CardTitle>
          <CardDescription>Access external monitoring and management tools</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start" asChild>
            <a href="https://grafana.example.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Grafana Dashboard
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="https://n8n.example.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              n8n Workflows
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="https://chromadb.example.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              ChromaDB Console
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

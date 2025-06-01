
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, 
  Cpu, 
  Database, 
  DollarSign, 
  RefreshCw, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SystemMetrics {
  llm_costs: {
    today: number;
    this_month: number;
    breakdown: Record<string, number>;
  };
  rag_performance: {
    hit_rate: number;
    avg_latency_ms: number;
    queries_today: number;
    embedding_drift_score: number;
  };
  infrastructure: {
    cpu_usage: number;
    memory_usage: number;
    gpu_utilization: number;
    active_pods: number;
  };
  business_kpis: {
    user_satisfaction: number;
    automation_savings: number;
    compliance_score: number;
  };
}

export const OrchestrationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/metrics');
      const data = await response.json();
      setMetrics(data.metrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Orchestration Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of AI platform performance and costs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's LLM Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.llm_costs.today || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics?.llm_costs.this_month || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RAG Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(metrics?.rag_performance.hit_rate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.rag_performance.queries_today || 0} queries today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPU Utilization</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(metrics?.infrastructure.gpu_utilization || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.infrastructure.active_pods || 0} active pods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.business_kpis.compliance_score || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              User satisfaction: {metrics?.business_kpis.user_satisfaction || 0}/5
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>RAG Performance Metrics</CardTitle>
                <CardDescription>Vector search and retrieval performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Hit Rate</span>
                  <Badge variant="default">
                    {formatPercent(metrics?.rag_performance.hit_rate || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Latency</span>
                  <Badge variant="outline">
                    {metrics?.rag_performance.avg_latency_ms || 0}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Embedding Drift</span>
                  <Badge variant={
                    (metrics?.rag_performance.embedding_drift_score || 0) > 0.2 ? "destructive" : "default"
                  }>
                    {formatPercent(metrics?.rag_performance.embedding_drift_score || 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Volume Trend</CardTitle>
                <CardDescription>24-hour query patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { time: '00:00', queries: 45 },
                      { time: '06:00', queries: 78 },
                      { time: '12:00', queries: 156 },
                      { time: '18:00', queries: 203 },
                      { time: '23:59', queries: 89 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="queries" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>LLM and infrastructure costs by service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics?.llm_costs.breakdown || {}).map(([service, cost]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="capitalize">{service}</span>
                    <Badge variant="outline">{formatCurrency(cost)}</Badge>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total This Month</span>
                    <Badge variant="default">
                      {formatCurrency(metrics?.llm_costs.this_month || 0)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span>{formatPercent(metrics?.infrastructure.cpu_usage || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(metrics?.infrastructure.cpu_usage || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span>{formatPercent(metrics?.infrastructure.memory_usage || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(metrics?.infrastructure.memory_usage || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>GPU Utilization</span>
                    <span>{formatPercent(metrics?.infrastructure.gpu_utilization || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(metrics?.infrastructure.gpu_utilization || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Health</CardTitle>
                <CardDescription>Status of all platform services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Orchestration API', status: 'healthy' },
                  { name: 'LLM Inference', status: 'healthy' },
                  { name: 'LlamaIndex Service', status: 'healthy' },
                  { name: 'n8n Workflows', status: 'degraded' },
                  { name: 'Vector Database', status: 'healthy' }
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <span>{service.name}</span>
                    <div className="flex items-center space-x-2">
                      {service.status === 'healthy' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <Badge variant={service.status === 'healthy' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>n8n workflow execution status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Workflow Monitoring</h3>
                <p className="text-muted-foreground">
                  Workflow execution metrics and logs will be displayed here
                </p>
                <Button className="mt-4" variant="outline">
                  View n8n Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  Brain,
  Users,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface MetricsData {
  latency: number;
  chatCount: number;
  cost: number;
  budget: number;
  accuracy: number;
  userSatisfaction: number;
  activeUsers: number;
  completionRate: number;
  costTrend: number;
  accuracyTrend: number;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

function StatCard({ 
  label, 
  value, 
  trend, 
  icon: Icon, 
  format = 'number',
  subtitle 
}: {
  label: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  subtitle?: string;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      case 'time':
        return `${val}ms`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = (trend?: number) => {
    if (!trend) return '';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Icon className="h-6 w-6 text-muted-foreground" />
            {trend !== undefined && (
              <div className={`flex items-center text-sm ${getTrendColor(trend)}`}>
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedExecutiveDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['executive-metrics'],
    queryFn: async (): Promise<MetricsData> => {
      const response = await fetch('/api/metrics/executive');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Avg Response Time"
          value={metrics.latency}
          format="time"
          icon={Clock}
          subtitle="Target: < 500ms"
        />
        
        <StatCard
          label="Chat Volume"
          value={metrics.chatCount}
          icon={MessageSquare}
          subtitle="This month"
        />
        
        <StatCard
          label="Cost vs Budget"
          value={metrics.cost}
          trend={metrics.costTrend}
          format="currency"
          icon={DollarSign}
          subtitle={`Budget: $${metrics.budget.toLocaleString()}`}
        />
        
        <StatCard
          label="RAG Accuracy"
          value={metrics.accuracy}
          trend={metrics.accuracyTrend}
          format="percentage"
          icon={Brain}
          subtitle="Average confidence"
        />
        
        <StatCard
          label="User Satisfaction"
          value={metrics.userSatisfaction}
          format="number"
          icon={Users}
          subtitle="Out of 5.0"
        />
        
        <StatCard
          label="Active Users"
          value={metrics.activeUsers}
          icon={Users}
          subtitle="Last 30 days"
        />
        
        <StatCard
          label="Task Completion"
          value={metrics.completionRate}
          format="percentage"
          icon={Target}
          subtitle="Success rate"
        />
        
        <StatCard
          label="System Health"
          value={96}
          format="percentage"
          icon={CheckCircle}
          subtitle="Uptime"
        />
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Budget Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Current Usage</span>
              <span className="font-medium">
                ${metrics.cost.toLocaleString()} / ${metrics.budget.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={(metrics.cost / metrics.budget) * 100} 
              className="h-3" 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round((metrics.cost / metrics.budget) * 100)}% used</span>
              <span>${(metrics.budget - metrics.cost).toLocaleString()} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border"
                >
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={
                    alert.type === 'error' ? 'destructive' :
                    alert.type === 'warning' ? 'secondary' : 'default'
                  }>
                    {alert.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

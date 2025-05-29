
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const HealthCheck = () => {
  const { health, checkHealth } = useHealthCheck();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? 
      <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>System Health</span>
            <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
              {health.status}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={checkHealth}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            {getStatusIcon(health.services.database)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Edge Functions</span>
            {getStatusIcon(health.services.functions)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Authentication</span>
            {getStatusIcon(health.services.auth)}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Last checked: {health.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

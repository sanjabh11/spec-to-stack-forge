
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Key,
  Database,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ComplianceSecurityDashboard = () => {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [securityScans, setSecurityScans] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      const [complianceRes, scansRes, auditRes] = await Promise.all([
        supabase.functions.invoke('observability', {
          body: { action: 'get-compliance-status' }
        }),
        supabase.functions.invoke('observability', {
          body: { action: 'get-security-scans' }
        }),
        supabase.functions.invoke('observability', {
          body: { action: 'get-audit-trail', filters: { limit: 20 } }
        })
      ]);

      if (complianceRes.data) setComplianceData(complianceRes.data);
      if (scansRes.data) setSecurityScans(scansRes.data.scans || []);
      if (auditRes.data) setAuditTrail(auditRes.data.logs || []);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load compliance data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !complianceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-800 flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Compliance & Security Dashboard</span>
          </CardTitle>
          <p className="text-purple-600">
            Comprehensive security monitoring, compliance tracking, and audit management
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="security">Security Scans</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>HIPAA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PHI Encryption</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Retention</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      7 Years
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>GDPR</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Deletion</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Automated
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EU Hosting</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>SOC 2</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credential Rotation</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      90 Days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Posture</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Security Scans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityScans.length > 0 ? securityScans.map((scan, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{scan.type}</span>
                      <Badge variant={scan.status === 'passed' ? 'default' : 'destructive'}>
                        {scan.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last run: {new Date(scan.timestamp).toLocaleString()}
                    </div>
                    {scan.findings && (
                      <div className="mt-2 text-sm">
                        {scan.findings} findings
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No security scans available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Audit Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditTrail.length > 0 ? auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{entry.action}</Badge>
                        <span className="text-sm text-gray-600">{entry.resource}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        User: {entry.user_id} | IP: {entry.ip_address}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No audit entries available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>RLS Policies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Data Isolation</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tenant Separation</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Enforced
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Override</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Restricted
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Access Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Multi-Factor Auth</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Required
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Timeout</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      24 Hours
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Allowlisting</span>
                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                      Optional
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

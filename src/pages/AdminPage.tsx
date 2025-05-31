
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminModelConfig } from '@/components/AdminModelConfig';
import { WorkflowLibrary } from '@/components/WorkflowLibrary';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
            <TabsTrigger value="models">Model Config</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Library</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="models">
            <AdminModelConfig />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowLibrary />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
              <p className="text-muted-foreground">
                Additional configuration options will be available here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

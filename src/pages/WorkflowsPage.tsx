
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowTemplateManager } from '@/components/WorkflowTemplateManager';
import { WorkflowTester } from '@/components/WorkflowTester';
import { WorkflowStatusDashboard } from '@/components/WorkflowStatusDashboard';
import { 
  Settings, 
  TestTube, 
  Activity,
  FileCode
} from 'lucide-react';

export const WorkflowsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">N8N Workflow Management</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Manage, test, and monitor your enterprise automation workflows across all 10 business domains
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileCode className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Testing</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <WorkflowTemplateManager />
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <WorkflowTester />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <WorkflowStatusDashboard />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Workflow Settings</h3>
            <p className="text-muted-foreground">
              Advanced workflow configuration options coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

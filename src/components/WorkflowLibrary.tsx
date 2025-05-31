
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Workflow, 
  Download, 
  Play, 
  FileText, 
  Database, 
  Mail, 
  MessageSquare,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'notification' | 'integration' | 'ai';
  tags: string[];
  nodes: number;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPopular: boolean;
}

export const WorkflowLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Document RAG Ingestion',
      description: 'Automatically ingest documents from Google Drive, extract text, generate embeddings, and store in vector database',
      category: 'document',
      tags: ['RAG', 'Google Drive', 'Embeddings', 'ChromaDB'],
      nodes: 8,
      estimatedTime: '15 min',
      difficulty: 'medium',
      isPopular: true
    },
    {
      id: '2',
      name: 'Legal Document Summarization',
      description: 'Process legal documents, extract key clauses, generate summaries, and notify stakeholders',
      category: 'ai',
      tags: ['Legal', 'Summarization', 'LLM', 'Notifications'],
      nodes: 6,
      estimatedTime: '10 min',
      difficulty: 'easy',
      isPopular: true
    },
    {
      id: '3',
      name: 'HR Policy Q&A Bot',
      description: 'Create a conversational bot that answers HR policy questions using RAG pipeline',
      category: 'ai',
      tags: ['HR', 'Chatbot', 'Q&A', 'Slack'],
      nodes: 12,
      estimatedTime: '25 min',
      difficulty: 'hard',
      isPopular: false
    },
    {
      id: '4',
      name: 'Email Alert System',
      description: 'Send automated email notifications when documents are processed or questions are answered',
      category: 'notification',
      tags: ['Email', 'Notifications', 'SMTP'],
      nodes: 4,
      estimatedTime: '5 min',
      difficulty: 'easy',
      isPopular: false
    },
    {
      id: '5',
      name: 'Finance Report Automation',
      description: 'Extract data from financial documents, generate reports, and distribute to stakeholders',
      category: 'document',
      tags: ['Finance', 'Reports', 'Automation', 'Excel'],
      nodes: 10,
      estimatedTime: '20 min',
      difficulty: 'medium',
      isPopular: true
    },
    {
      id: '6',
      name: 'Slack Integration Workflow',
      description: 'Connect Slack to your AI platform for real-time Q&A and notifications',
      category: 'integration',
      tags: ['Slack', 'Integration', 'Real-time'],
      nodes: 7,
      estimatedTime: '12 min',
      difficulty: 'medium',
      isPopular: false
    }
  ];

  const filteredWorkflows = workflowTemplates.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Templates', icon: Workflow },
    { id: 'document', label: 'Document Processing', icon: FileText },
    { id: 'ai', label: 'AI & ML', icon: Database },
    { id: 'notification', label: 'Notifications', icon: Mail },
    { id: 'integration', label: 'Integrations', icon: MessageSquare }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'ai': return <Database className="w-4 h-4" />;
      case 'notification': return <Mail className="w-4 h-4" />;
      case 'integration': return <MessageSquare className="w-4 h-4" />;
      default: return <Workflow className="w-4 h-4" />;
    }
  };

  const installWorkflow = (workflow: WorkflowTemplate) => {
    toast.success(`Installing ${workflow.name}...`);
    // In a real implementation, this would call n8n API to install the workflow
    setTimeout(() => {
      toast.success(`${workflow.name} installed successfully!`);
    }, 2000);
  };

  const previewWorkflow = (workflow: WorkflowTemplate) => {
    toast.info(`Opening ${workflow.name} preview...`);
    // In a real implementation, this would show a modal with workflow diagram
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">n8n Workflow Library</h2>
        <p className="text-muted-foreground">
          Ready-to-use automation workflows for your AI platform
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 bg-background"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map(workflow => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(workflow.category)}
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    {workflow.isPopular && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {workflow.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{workflow.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{workflow.nodes} nodes</span>
                    <span>{workflow.estimatedTime}</span>
                    <Badge className={getDifficultyColor(workflow.difficulty)}>
                      {workflow.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => previewWorkflow(workflow)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => installWorkflow(workflow)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Custom Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Custom Workflow</span>
          </CardTitle>
          <CardDescription>
            Don't see what you need? Create a custom n8n workflow from scratch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            Open n8n Editor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

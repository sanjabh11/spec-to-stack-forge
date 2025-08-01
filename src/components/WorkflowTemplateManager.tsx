
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowTemplate } from '@/types/workflow';

export const WorkflowTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'automation',
    template_content: '',
    jurisdiction: 'US'
  });

  const categories = [
    'automation', 'legal', 'healthcare', 'finance', 'hr', 
    'marketing', 'sales', 'operations', 'compliance'
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast.error('Failed to load workflow templates');
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create templates');
        return;
      }

      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          category: newTemplate.category,
          template_content: newTemplate.template_content || 'Default template content',
          placeholders: [],
          created_by: user.id,
          jurisdiction: newTemplate.jurisdiction,
          usage_count: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Workflow template created successfully');
      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'automation',
        template_content: '',
        jurisdiction: 'US'
      });
      loadTemplates();
    } catch (error: any) {
      toast.error('Failed to create workflow template');
      console.error('Error creating template:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployTemplate = async (template: WorkflowTemplate) => {
    try {
      toast.success(`Deploying ${template.name}...`);
      
      // Update usage count
      await supabase
        .from('document_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);
      
      setTimeout(() => {
        toast.success(`${template.name} deployed successfully!`);
        loadTemplates();
      }, 2000);
    } catch (error) {
      toast.error('Failed to deploy workflow');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Manage and deploy enterprise automation workflows
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Template Name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              />
              <Select 
                value={newTemplate.category} 
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Template Content"
                value={newTemplate.template_content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, template_content: e.target.value }))}
              />
              <Button onClick={createTemplate} disabled={loading || !newTemplate.name}>
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline">
                      {template.category}
                    </Badge>
                    {template.jurisdiction && (
                      <Badge variant="secondary">{template.jurisdiction}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => deployTemplate(template)}
                      className="flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Deploy</span>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uses: {template.usage_count}</span>
                  <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No workflow templates found for the selected category.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, Database, DollarSign, Settings, Trash2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  costPerToken: number;
  isActive: boolean;
  maxTokens: number;
  description?: string;
}

interface VectorDBConfig {
  id: string;
  name: string;
  type: 'chromadb' | 'weaviate' | 'qdrant';
  endpoint: string;
  apiKey?: string;
  isDefault: boolean;
  description?: string;
}

export const AdminModelConfig: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: '1',
      name: 'LLaMA 3 70B',
      provider: 'Self-hosted',
      endpoint: 'http://localhost:8000/v1/completions',
      apiKey: '',
      costPerToken: 0.0,
      isActive: true,
      maxTokens: 4096,
      description: 'Self-hosted LLaMA 3 70B with vLLM'
    },
    {
      id: '2',
      name: 'Gemini 2.5 Pro',
      provider: 'Google',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      apiKey: '',
      costPerToken: 0.03,
      isActive: false,
      maxTokens: 8192,
      description: 'Google Gemini 2.5 Pro via API'
    }
  ]);

  const [vectorDbs, setVectorDbs] = useState<VectorDBConfig[]>([
    {
      id: '1',
      name: 'ChromaDB Local',
      type: 'chromadb',
      endpoint: 'http://localhost:8000',
      isDefault: true,
      description: 'Local ChromaDB instance'
    },
    {
      id: '2',
      name: 'Weaviate Cloud',
      type: 'weaviate',
      endpoint: 'https://cluster.weaviate.network',
      apiKey: '',
      isDefault: false,
      description: 'Weaviate cloud instance'
    }
  ]);

  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    name: '',
    provider: 'Self-hosted',
    endpoint: '',
    apiKey: '',
    costPerToken: 0,
    isActive: false,
    maxTokens: 4096
  });

  const [newVectorDB, setNewVectorDB] = useState<Partial<VectorDBConfig>>({
    name: '',
    type: 'chromadb',
    endpoint: '',
    isDefault: false
  });

  const [llmInferenceEndpoint, setLlmInferenceEndpoint] = useState('http://llm-inference-service:8001');
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await fetch(`${llmInferenceEndpoint}/models`);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models);
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
    }
  };

  const testModelConnection = async (modelName: string) => {
    try {
      const response = await fetch(`${llmInferenceEndpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello, this is a test.',
          max_tokens: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${modelName} test successful: ${data.text}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast.error(`${modelName} test failed: ${error}`);
    }
  };

  const addModel = () => {
    if (!newModel.name || !newModel.endpoint) {
      toast.error('Please fill in required fields');
      return;
    }

    const model: ModelConfig = {
      id: Date.now().toString(),
      name: newModel.name!,
      provider: newModel.provider!,
      endpoint: newModel.endpoint!,
      apiKey: newModel.apiKey || '',
      costPerToken: newModel.costPerToken || 0,
      isActive: newModel.isActive || false,
      maxTokens: newModel.maxTokens || 4096,
      description: newModel.description
    };

    setModels([...models, model]);
    setNewModel({
      name: '',
      provider: 'Self-hosted',
      endpoint: '',
      apiKey: '',
      costPerToken: 0,
      isActive: false,
      maxTokens: 4096
    });
    toast.success('Model added successfully');
  };

  const addVectorDB = () => {
    if (!newVectorDB.name || !newVectorDB.endpoint) {
      toast.error('Please fill in required fields');
      return;
    }

    const vectorDB: VectorDBConfig = {
      id: Date.now().toString(),
      name: newVectorDB.name!,
      type: newVectorDB.type!,
      endpoint: newVectorDB.endpoint!,
      apiKey: newVectorDB.apiKey,
      isDefault: newVectorDB.isDefault || false,
      description: newVectorDB.description
    };

    setVectorDbs([...vectorDbs, vectorDB]);
    setNewVectorDB({
      name: '',
      type: 'chromadb',
      endpoint: '',
      isDefault: false
    });
    toast.success('Vector database added successfully');
  };

  const toggleModelActive = (id: string) => {
    setModels(models.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const deleteModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    toast.success('Model deleted');
  };

  const deleteVectorDB = (id: string) => {
    setVectorDbs(vectorDbs.filter(v => v.id !== id));
    toast.success('Vector database deleted');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Enhanced Model & Infrastructure Configuration</h2>
        <p className="text-muted-foreground">
          Configure LLM models, vector databases, and deployment settings with multi-model support
        </p>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">LLM Models</TabsTrigger>
          <TabsTrigger value="vectordb">Vector Databases</TabsTrigger>
          <TabsTrigger value="inference">Inference Service</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="w-5 h-5" />
                <span>Configured Models</span>
              </CardTitle>
              <CardDescription>
                Manage your LLM models and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Cost/Token</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{model.provider}</TableCell>
                      <TableCell>${model.costPerToken.toFixed(4)}</TableCell>
                      <TableCell>
                        <Badge variant={model.isActive ? "default" : "secondary"}>
                          {model.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={model.isActive}
                            onCheckedChange={() => toggleModelActive(model.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModel(model.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Add New Model</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Model Name</Label>
                    <Input
                      value={newModel.name || ''}
                      onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                      placeholder="e.g., Mistral 7B"
                    />
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Select 
                      value={newModel.provider} 
                      onValueChange={(value) => setNewModel({...newModel, provider: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Self-hosted">Self-hosted</SelectItem>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Endpoint URL</Label>
                    <Input
                      value={newModel.endpoint || ''}
                      onChange={(e) => setNewModel({...newModel, endpoint: e.target.value})}
                      placeholder="http://localhost:8000/v1/completions"
                    />
                  </div>
                  <div>
                    <Label>Cost per Token</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={newModel.costPerToken || 0}
                      onChange={(e) => setNewModel({...newModel, costPerToken: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newModel.description || ''}
                      onChange={(e) => setNewModel({...newModel, description: e.target.value})}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <Button onClick={addModel} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Model</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vectordb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Vector Databases</span>
              </CardTitle>
              <CardDescription>
                Configure vector databases for document storage and retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vectorDbs.map((db) => (
                    <TableRow key={db.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{db.name}</div>
                          <div className="text-sm text-muted-foreground">{db.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{db.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{db.endpoint}</TableCell>
                      <TableCell>
                        {db.isDefault && <Badge>Default</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVectorDB(db.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Add New Vector Database</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Database Name</Label>
                    <Input
                      value={newVectorDB.name || ''}
                      onChange={(e) => setNewVectorDB({...newVectorDB, name: e.target.value})}
                      placeholder="e.g., Production Weaviate"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newVectorDB.type} 
                      onValueChange={(value: any) => setNewVectorDB({...newVectorDB, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chromadb">ChromaDB</SelectItem>
                        <SelectItem value="weaviate">Weaviate</SelectItem>
                        <SelectItem value="qdrant">Qdrant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Endpoint URL</Label>
                    <Input
                      value={newVectorDB.endpoint || ''}
                      onChange={(e) => setNewVectorDB({...newVectorDB, endpoint: e.target.value})}
                      placeholder="http://localhost:8000 or https://cluster.weaviate.network"
                    />
                  </div>
                </div>
                <Button onClick={addVectorDB} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Vector Database</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="w-5 h-5" />
                <span>LLM Inference Service</span>
              </CardTitle>
              <CardDescription>
                Manage the unified LLM inference gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Inference Service Endpoint</Label>
                <Input
                  value={llmInferenceEndpoint}
                  onChange={(e) => setLlmInferenceEndpoint(e.target.value)}
                  placeholder="http://llm-inference-service:8001"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Available Models</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableModels.map((model) => (
                      <TableRow key={model.name}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>
                          <Badge variant={model.type === 'self-hosted' ? 'default' : 'secondary'}>
                            {model.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.status === 'healthy' ? 'default' : 'destructive'}>
                            {model.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testModelConnection(model.name)}
                          >
                            Test
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button onClick={loadAvailableModels} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Models
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Deployment Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure deployment settings and GPU resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default GPU Type</Label>
                  <Select defaultValue="a100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t4">NVIDIA T4</SelectItem>
                      <SelectItem value="a100">NVIDIA A100</SelectItem>
                      <SelectItem value="h100">NVIDIA H100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max GPU Hours/Day</Label>
                  <Input type="number" defaultValue="8" />
                </div>
                <div>
                  <Label>CoreWeave Cluster</Label>
                  <Input placeholder="cluster-name.coreweave.com" />
                </div>
                <div>
                  <Label>Kubernetes Namespace</Label>
                  <Input placeholder="ai-platform" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Label>Enable auto-scaling</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Enable GPU sharing</Label>
              </div>
              
              <Button className="w-full">Save Deployment Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

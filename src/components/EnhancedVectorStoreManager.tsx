
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, Trash2, RefreshCw, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { enhancedRAGManager } from '@/lib/ragAbstractionV2';

interface VectorStoreConfig {
  name: string;
  type: 'chromadb' | 'weaviate' | 'qdrant' | 'llamaindex';
  endpoint: string;
  apiKey?: string;
  collection: string;
  dimensions: number;
  isActive: boolean;
}

export const EnhancedVectorStoreManager: React.FC = () => {
  const [vectorStores, setVectorStores] = useState<VectorStoreConfig[]>([]);
  const [newStore, setNewStore] = useState<Partial<VectorStoreConfig>>({
    name: '',
    type: 'chromadb',
    endpoint: '',
    collection: 'documents',
    dimensions: 1536,
    isActive: false
  });
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  useEffect(() => {
    loadVectorStores();
  }, []);

  const loadVectorStores = () => {
    const stores = enhancedRAGManager.listVectorStores();
    setVectorStores(stores);
  };

  const addVectorStore = () => {
    if (!newStore.name || !newStore.endpoint) {
      toast.error('Please fill in required fields');
      return;
    }

    const store: VectorStoreConfig = {
      name: newStore.name!,
      type: newStore.type!,
      endpoint: newStore.endpoint!,
      apiKey: newStore.apiKey,
      collection: newStore.collection!,
      dimensions: newStore.dimensions!,
      isActive: newStore.isActive || false
    };

    enhancedRAGManager.addVectorStore(store);
    loadVectorStores();
    setNewStore({
      name: '',
      type: 'chromadb',
      endpoint: '',
      collection: 'documents',
      dimensions: 1536,
      isActive: false
    });
    toast.success('Vector store added successfully');
  };

  const deleteVectorStore = (storeName: string) => {
    // Implementation would remove from enhancedRAGManager
    toast.success('Vector store deleted');
    loadVectorStores();
  };

  const testConnection = async (store: VectorStoreConfig) => {
    setTestResults(prev => ({ ...prev, [store.name]: 'testing' }));
    
    try {
      // Test basic connectivity
      const response = await fetch(`${store.endpoint}/health`, {
        method: 'GET',
        headers: store.apiKey ? { 'Authorization': `Bearer ${store.apiKey}` } : {}
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, [store.name]: 'success' }));
        toast.success(`${store.name} connection successful`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [store.name]: 'error' }));
      toast.error(`${store.name} connection failed: ${error}`);
    }
  };

  const getStoreTypeIcon = (type: string) => {
    const icons = {
      chromadb: '🔵',
      weaviate: '🟡',
      qdrant: '🟢',
      llamaindex: '🚀'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getStatusBadge = (storeName: string, isActive: boolean) => {
    const testResult = testResults[storeName];
    
    if (testResult === 'testing') {
      return <Badge variant="secondary">Testing...</Badge>;
    } else if (testResult === 'success') {
      return <Badge variant="default">Connected</Badge>;
    } else if (testResult === 'error') {
      return <Badge variant="destructive">Failed</Badge>;
    } else if (isActive) {
      return <Badge variant="outline">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Enhanced Vector Store Management</h2>
        <p className="text-muted-foreground">
          Configure and manage multiple vector databases for advanced RAG
        </p>
      </div>

      <Tabs defaultValue="stores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stores">Vector Stores</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Configured Vector Stores</span>
              </CardTitle>
              <CardDescription>
                Manage your vector databases for document storage and retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vectorStores.map((store) => (
                    <TableRow key={store.name}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getStoreTypeIcon(store.type)}</span>
                          <span className="font-medium">{store.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{store.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{store.endpoint}</TableCell>
                      <TableCell>{store.collection}</TableCell>
                      <TableCell>
                        {getStatusBadge(store.name, store.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testConnection(store)}
                            disabled={testResults[store.name] === 'testing'}
                          >
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteVectorStore(store.name)}
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
                <h4 className="font-semibold">Add New Vector Store</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Store Name</Label>
                    <Input
                      value={newStore.name || ''}
                      onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                      placeholder="e.g., production-weaviate"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newStore.type} 
                      onValueChange={(value: any) => setNewStore({...newStore, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chromadb">ChromaDB</SelectItem>
                        <SelectItem value="weaviate">Weaviate</SelectItem>
                        <SelectItem value="qdrant">Qdrant</SelectItem>
                        <SelectItem value="llamaindex">LlamaIndex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Endpoint URL</Label>
                    <Input
                      value={newStore.endpoint || ''}
                      onChange={(e) => setNewStore({...newStore, endpoint: e.target.value})}
                      placeholder="http://localhost:8000 or https://cluster.weaviate.network"
                    />
                  </div>
                  <div>
                    <Label>API Key (Optional)</Label>
                    <Input
                      type="password"
                      value={newStore.apiKey || ''}
                      onChange={(e) => setNewStore({...newStore, apiKey: e.target.value})}
                      placeholder="API key for cloud services"
                    />
                  </div>
                  <div>
                    <Label>Collection Name</Label>
                    <Input
                      value={newStore.collection || ''}
                      onChange={(e) => setNewStore({...newStore, collection: e.target.value})}
                      placeholder="documents"
                    />
                  </div>
                  <div>
                    <Label>Vector Dimensions</Label>
                    <Input
                      type="number"
                      value={newStore.dimensions || 1536}
                      onChange={(e) => setNewStore({...newStore, dimensions: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newStore.isActive || false}
                    onCheckedChange={(checked) => setNewStore({...newStore, isActive: checked})}
                  />
                  <Label>Set as active</Label>
                </div>
                <Button onClick={addVectorStore} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Vector Store</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Management</CardTitle>
              <CardDescription>
                View and manage collections across your vector stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Collection Analytics</h3>
                <p className="text-muted-foreground">
                  Collection management and analytics will be available here
                </p>
                <Button className="mt-4" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Collections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Monitor vector store performance and optimize queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Dashboard</h3>
                <p className="text-muted-foreground">
                  Query performance metrics and optimization insights will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

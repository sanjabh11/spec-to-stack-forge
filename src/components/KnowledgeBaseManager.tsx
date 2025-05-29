
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Database, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  chunks: number;
  embeddings: number;
  uploaded_at: string;
}

interface KnowledgeBaseManagerProps {
  domain: string;
  onDocumentsIndexed: (documents: Document[]) => void;
}

export const KnowledgeBaseManager = ({ domain, onDocumentsIndexed }: KnowledgeBaseManagerProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [domain]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-base-manager', {
        body: { action: 'list-documents', domain }
      });

      if (error) throw error;
      setDocuments(data.documents || []);
      onDocumentsIndexed(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load knowledge base documents",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    setIndexingProgress(0);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('domain', domain);

        const { data, error } = await supabase.functions.invoke('knowledge-base-ingest', {
          body: formData
        });

        if (error) throw error;

        // Monitor indexing progress
        const documentId = data.documentId;
        const pollProgress = setInterval(async () => {
          const { data: progressData } = await supabase.functions.invoke('knowledge-base-manager', {
            body: { action: 'get-progress', documentId }
          });

          if (progressData?.progress) {
            setIndexingProgress(progressData.progress);
            if (progressData.progress >= 100) {
              clearInterval(pollProgress);
              loadDocuments();
              toast({
                title: "Document Indexed",
                description: `${file.name} has been successfully indexed`
              });
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload and index documents",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setIndexingProgress(0);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-base-search', {
        body: { 
          query: searchQuery, 
          domain,
          limit: 10,
          threshold: 0.7
        }
      });

      if (error) throw error;
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Failed to search knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('knowledge-base-manager', {
        body: { action: 'delete-document', documentId }
      });

      if (error) throw error;
      
      loadDocuments();
      toast({
        title: "Document Deleted",
        description: "Document removed from knowledge base"
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Knowledge Base Manager - {domain}</span>
          </CardTitle>
          <p className="text-gray-600">
            Upload and manage documents for RAG-enhanced AI responses
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="documents">Manage Documents</TabsTrigger>
              <TabsTrigger value="search">Test Search</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Documents
                </p>
                <p className="text-gray-500 mb-4">
                  Supported formats: PDF, TXT, DOCX, MD
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.md"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={uploading}>
                    <span>
                      {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {uploading ? 'Processing...' : 'Choose Files'}
                    </span>
                  </Button>
                </label>
              </div>

              {uploading && indexingProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Indexing Progress</span>
                    <span>{indexingProgress}%</span>
                  </div>
                  <Progress value={indexingProgress} className="w-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Documents ({documents.length})
                </h3>
                <Button variant="outline" onClick={loadDocuments}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {(doc.size / 1024).toFixed(1)} KB • {doc.chunks} chunks • {doc.embeddings} embeddings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{doc.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{result.document}</p>
                      <Badge variant="outline">Score: {result.score?.toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

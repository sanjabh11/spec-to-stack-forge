
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Brain, 
  Database, 
  Zap, 
  FileText, 
  Code, 
  BookOpen,
  Target,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VectorSearchProps {
  domain: string;
  artifacts?: any;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  type: 'documentation' | 'code' | 'architecture' | 'best-practice';
  source: string;
  metadata: {
    category: string;
    lastUpdated: string;
    tags: string[];
  };
}

interface SearchContext {
  query: string;
  filters: {
    type: string[];
    score: number;
    category: string;
  };
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

export const VectorSearch = ({ domain, artifacts }: VectorSearchProps) => {
  const [searchContext, setSearchContext] = useState<SearchContext>({
    query: '',
    filters: {
      type: [],
      score: 0.7,
      category: 'all'
    },
    results: [],
    totalResults: 0,
    searchTime: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const performSemanticSearch = async () => {
    if (!searchContext.query.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    // Simulate semantic search with vector embeddings
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResults: SearchResult[] = generateMockResults(searchContext.query, domain);
    const searchTime = Date.now() - startTime;

    setSearchContext(prev => ({
      ...prev,
      results: mockResults,
      totalResults: mockResults.length + Math.floor(Math.random() * 50),
      searchTime
    }));

    setIsSearching(false);
    toast({
      title: "Search Complete",
      description: `Found ${mockResults.length} relevant results in ${searchTime}ms`
    });
  };

  const generateMockResults = (query: string, domain: string): SearchResult[] => {
    const baseResults = [
      {
        id: '1',
        title: `${domain} AI Architecture Best Practices`,
        content: `Comprehensive guide for implementing AI solutions in ${domain.toLowerCase()} environments. Covers microservices architecture, data pipelines, model deployment strategies, and scalability considerations. This document provides detailed insights into building robust AI platforms that can handle enterprise-scale workloads while maintaining high availability and performance.`,
        score: 0.95,
        type: 'best-practice' as const,
        source: 'Enterprise AI Handbook',
        metadata: {
          category: 'Architecture',
          lastUpdated: '2024-01-15',
          tags: ['ai', 'architecture', 'microservices', 'scalability']
        }
      },
      {
        id: '2',
        title: `Implementing Vector Databases for ${domain}`,
        content: `Technical implementation guide for vector databases in ${domain.toLowerCase()} applications. Includes setup instructions for Pinecone, Weaviate, and Chroma, with performance benchmarks and cost analysis. Covers embedding strategies, indexing optimization, and query performance tuning for production deployments.`,
        score: 0.92,
        type: 'documentation' as const,
        source: 'Vector DB Guide',
        metadata: {
          category: 'Database',
          lastUpdated: '2024-01-10',
          tags: ['vector-db', 'embeddings', 'search', 'performance']
        }
      },
      {
        id: '3',
        title: `${domain} Data Pipeline Code Examples`,
        content: `Python and TypeScript code examples for building data pipelines in ${domain.toLowerCase()}. Includes ETL processes, real-time streaming, batch processing, and ML model integration. Features error handling, monitoring, and deployment automation scripts.`,
        score: 0.89,
        type: 'code' as const,
        source: 'Code Repository',
        metadata: {
          category: 'Development',
          lastUpdated: '2024-01-12',
          tags: ['python', 'typescript', 'etl', 'pipeline']
        }
      },
      {
        id: '4',
        title: `Security Framework for ${domain} AI Systems`,
        content: `Security considerations and implementation guidelines for AI systems in ${domain.toLowerCase()}. Covers data encryption, access controls, audit logging, compliance requirements, and threat modeling. Includes security testing methodologies and incident response procedures.`,
        score: 0.87,
        type: 'documentation' as const,
        source: 'Security Handbook',
        metadata: {
          category: 'Security',
          lastUpdated: '2024-01-08',
          tags: ['security', 'compliance', 'encryption', 'audit']
        }
      },
      {
        id: '5',
        title: `${domain} ML Model Deployment Architecture`,
        content: `Reference architecture for deploying machine learning models in ${domain.toLowerCase()} production environments. Covers containerization, orchestration, auto-scaling, A/B testing, and model versioning. Includes monitoring and observability setup for ML operations.`,
        score: 0.84,
        type: 'architecture' as const,
        source: 'ML Ops Guide',
        metadata: {
          category: 'MLOps',
          lastUpdated: '2024-01-14',
          tags: ['mlops', 'deployment', 'monitoring', 'versioning']
        }
      }
    ];

    // Filter results based on search context
    return baseResults.filter(result => {
      const matchesType = searchContext.filters.type.length === 0 || 
                         searchContext.filters.type.includes(result.type);
      const matchesScore = result.score >= searchContext.filters.score;
      const matchesCategory = searchContext.filters.category === 'all' || 
                             result.metadata.category.toLowerCase() === searchContext.filters.category.toLowerCase();
      
      return matchesType && matchesScore && matchesCategory;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.8) return 'text-blue-600 bg-blue-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <BookOpen className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'architecture': return <Database className="w-4 h-4" />;
      case 'best-practice': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSearchContext(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-800 flex items-center space-x-2">
                <Search className="w-6 h-6" />
                <span>Vector Search & RAG</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">
                Semantic search through {domain} knowledge base using advanced vector embeddings
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              Enhanced RAG
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Semantic Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder={`Search ${domain} knowledge base...`}
                value={searchContext.query}
                onChange={(e) => setSearchContext(prev => ({ ...prev, query: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
                className="flex-1"
              />
              <Button 
                onClick={performSemanticSearch}
                disabled={isSearching}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Content Type</label>
                <select 
                  onChange={(e) => handleFilterChange('type', e.target.value ? [e.target.value] : [])}
                  className="ml-2 text-sm border rounded px-2 py-1"
                >
                  <option value="">All Types</option>
                  <option value="documentation">Documentation</option>
                  <option value="code">Code</option>
                  <option value="architecture">Architecture</option>
                  <option value="best-practice">Best Practices</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Category</label>
                <select 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="ml-2 text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  <option value="architecture">Architecture</option>
                  <option value="database">Database</option>
                  <option value="development">Development</option>
                  <option value="security">Security</option>
                  <option value="mlops">MLOps</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Min Score</label>
                <select 
                  onChange={(e) => handleFilterChange('score', parseFloat(e.target.value))}
                  className="ml-2 text-sm border rounded px-2 py-1"
                >
                  <option value="0">Any Score</option>
                  <option value="0.7">0.7+</option>
                  <option value="0.8">0.8+</option>
                  <option value="0.9">0.9+</option>
                </select>
              </div>
            </div>

            {/* Search Stats */}
            {searchContext.results.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <span>
                  Found {searchContext.results.length} results 
                  {searchContext.totalResults > searchContext.results.length && 
                    ` (${searchContext.totalResults} total)`
                  }
                </span>
                <span>Search time: {searchContext.searchTime}ms</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchContext.results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Search Results</h3>
            {searchContext.results.map((result) => (
              <Card 
                key={result.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedResult?.id === result.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedResult(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(result.type)}
                      <h4 className="font-semibold">{result.title}</h4>
                    </div>
                    <Badge className={`${getScoreColor(result.score)} border-0`}>
                      {(result.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {result.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.metadata.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{result.source}</span>
                  </div>
                  
                  <div className="mt-2">
                    <Progress value={result.score * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Result Detail */}
          <div className="sticky top-6">
            {selectedResult ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getTypeIcon(selectedResult.type)}
                      <span>Result Details</span>
                    </CardTitle>
                    <Badge className={`${getScoreColor(selectedResult.score)} border-0`}>
                      {(selectedResult.score * 100).toFixed(0)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedResult.title}</h3>
                      <p className="text-sm text-gray-600">{selectedResult.content}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Source:</span>
                          <span>{selectedResult.source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span>{selectedResult.metadata.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Updated:</span>
                          <span>{selectedResult.metadata.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Full
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a search result to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* RAG Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>RAG Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="embeddings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
              <TabsTrigger value="indexing">Vector Index</TabsTrigger>
              <TabsTrigger value="retrieval">Retrieval Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="embeddings" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Current Model</h4>
                    <p className="text-sm text-gray-600 mb-2">text-embedding-3-large</p>
                    <Badge className="bg-green-100 text-green-700">1536 dimensions</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Embedding Speed:</span>
                        <span>~2ms/doc</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Accuracy:</span>
                        <span>94.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="indexing" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Index Size</h4>
                    <p className="text-2xl font-bold text-blue-600">2.4M</p>
                    <p className="text-sm text-gray-600">documents indexed</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Update Frequency</h4>
                    <p className="text-2xl font-bold text-green-600">Real-time</p>
                    <p className="text-sm text-gray-600">incremental updates</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Storage Used</h4>
                    <p className="text-2xl font-bold text-purple-600">8.7GB</p>
                    <p className="text-sm text-gray-600">vector storage</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retrieval" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Search Strategy</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Hybrid search (semantic + keyword)</li>
                      <li>• Re-ranking with cross-encoders</li>
                      <li>• Context-aware filtering</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Top-k results:</span>
                        <span>20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Similarity threshold:</span>
                        <span>0.7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max context length:</span>
                        <span>4096 tokens</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

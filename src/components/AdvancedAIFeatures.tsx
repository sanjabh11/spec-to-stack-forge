import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  GitCompare, 
  Star, 
  Search, 
  Settings, 
  Zap,
  TrendingUp,
  Database,
  ArrowRight
} from 'lucide-react';
import { ModelComparison } from './ModelComparison';
import { QualityScoring } from './QualityScoring';
import { VectorSearch } from './VectorSearch';

interface AdvancedAIFeaturesProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

export const AdvancedAIFeatures = ({ artifacts, sessionData, domain }: AdvancedAIFeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState<string>('overview');

  const features = [
    {
      id: 'comparison',
      name: 'Model Comparison',
      icon: GitCompare,
      description: 'Side-by-side comparison of different LLM outputs',
      status: 'active',
      metrics: { accuracy: '94.2%', speed: '2.1s', cost: '$0.023' }
    },
    {
      id: 'quality',
      name: 'Quality Scoring',
      icon: Star,
      description: 'Automated quality assessment of generated artifacts',
      status: 'active',
      metrics: { score: '87/100', grade: 'B+', improvements: '3' }
    },
    {
      id: 'vector-search',
      name: 'Vector Search',
      icon: Search,
      description: 'Enhanced RAG with semantic search capabilities',
      status: 'active',
      metrics: { indexed: '2.4M docs', speed: '~2ms', accuracy: '96.1%' }
    },
    {
      id: 'fine-tuning',
      name: 'Fine-tuning Integration',
      icon: Settings,
      description: 'Custom model training on domain-specific data',
      status: 'coming-soon',
      metrics: { datasets: '12', models: '3', performance: '+15%' }
    }
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'comparison':
        return <ModelComparison artifacts={artifacts} sessionData={sessionData} domain={domain} />;
      case 'quality':
        return <QualityScoring artifacts={artifacts} sessionData={sessionData} domain={domain} />;
      case 'vector-search':
        return <VectorSearch domain={domain} artifacts={artifacts} />;
      case 'fine-tuning':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fine-tuning Integration</h3>
              <p className="text-gray-600 mb-4">
                Custom model training capabilities are coming soon. This will enable domain-specific 
                fine-tuning for improved performance on your {domain} use cases.
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (activeFeature !== 'overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setActiveFeature('overview')}>
            ← Back to Overview
          </Button>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Advanced AI Features
          </Badge>
        </div>
        {renderFeatureContent()}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-800 flex items-center space-x-2">
                <Brain className="w-6 h-6" />
                <span>Advanced AI Features</span>
              </CardTitle>
              <p className="text-purple-600 mt-2">
                Enhanced AI capabilities for your {domain} solution
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              AI Powered
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              feature.status === 'coming-soon' ? 'opacity-75' : 'hover:scale-105'
            }`}
            onClick={() => feature.status === 'active' && setActiveFeature(feature.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                {feature.status === 'active' ? (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                ) : (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(feature.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-semibold text-purple-700">{value}</div>
                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>AI Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <div className="text-sm text-blue-600">Average Accuracy</div>
              <div className="text-xs text-gray-500 mt-1">Across all models</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2.1s</div>
              <div className="text-sm text-green-600">Avg Response Time</div>
              <div className="text-xs text-gray-500 mt-1">End-to-end processing</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">87/100</div>
              <div className="text-sm text-purple-600">Quality Score</div>
              <div className="text-xs text-gray-500 mt-1">Automated assessment</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">2.4M</div>
              <div className="text-sm text-orange-600">Indexed Documents</div>
              <div className="text-xs text-gray-500 mt-1">Vector search ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-left p-3">Use Case</th>
                  <th className="text-left p-3">Performance</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <GitCompare className="w-4 h-4 text-blue-500" />
                      <span>Model Comparison</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    Compare outputs from different LLMs side-by-side
                  </td>
                  <td className="p-3">
                    <Badge className="bg-blue-100 text-blue-700">94% accuracy</Badge>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Quality Scoring</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    Automated quality assessment with detailed metrics
                  </td>
                  <td className="p-3">
                    <Badge className="bg-yellow-100 text-yellow-700">87/100 score</Badge>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-purple-500" />
                      <span>Vector Search</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    Semantic search with enhanced RAG capabilities
                  </td>
                  <td className="p-3">
                    <Badge className="bg-purple-100 text-purple-700">2ms search</Badge>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Fine-tuning</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    Custom model training on domain-specific data
                  </td>
                  <td className="p-3">
                    <Badge className="bg-gray-100 text-gray-700">+15% boost</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">Coming Soon</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Integration Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="api-usage">API Usage</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">1. Enable Advanced Features</h4>
                  <p className="text-sm text-blue-600">
                    Advanced AI features are automatically enabled for your {domain} project. 
                    No additional configuration required.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">2. Configure API Keys</h4>
                  <p className="text-sm text-green-600">
                    Ensure your OpenAI, Anthropic, and Google API keys are configured in 
                    the environment settings for full model comparison capabilities.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">3. Start Exploring</h4>
                  <p className="text-sm text-purple-600">
                    Click on any feature above to start exploring the advanced AI capabilities 
                    available for your {domain} solution.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api-usage" className="mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Example API Usage</h4>
                <pre className="text-sm overflow-x-auto">
{`// Model Comparison
const comparison = await aiFeatures.compareModels({
  prompt: "Generate ${domain} architecture",
  models: ["gpt-4o", "claude-3.5-sonnet", "gemini-2.5-pro"]
});

// Quality Scoring
const qualityScore = await aiFeatures.scoreQuality({
  artifact: generatedCode,
  domain: "${domain}",
  metrics: ["completeness", "security", "performance"]
});

// Vector Search
const searchResults = await aiFeatures.vectorSearch({
  query: "best practices for ${domain}",
  filters: { type: "documentation", score: 0.8 }
});`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="best-practices" className="mt-6">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-semibold text-blue-800">Model Selection</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Use model comparison to identify the best LLM for specific tasks within your {domain} workflow.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold text-green-800">Quality Monitoring</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Regularly run quality assessments on generated artifacts to maintain high standards.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                  <h4 className="font-semibold text-purple-800">Search Optimization</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Leverage vector search for domain-specific knowledge retrieval and context enhancement.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

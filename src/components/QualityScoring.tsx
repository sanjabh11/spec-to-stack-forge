
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Target,
  Shield,
  Zap,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QualityScoringProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

interface QualityMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions: string[];
}

interface QualityReport {
  overallScore: number;
  grade: string;
  metrics: QualityMetric[];
  summary: string;
  recommendations: string[];
}

export const QualityScoring = ({ artifacts, sessionData, domain }: QualityScoringProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState('architecture');

  useEffect(() => {
    runQualityAnalysis();
  }, [selectedArtifact]);

  const runQualityAnalysis = async () => {
    setIsAnalyzing(true);

    // Simulate quality analysis process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const metrics = generateQualityMetrics(selectedArtifact);
    const overallScore = calculateOverallScore(metrics);
    const grade = getGrade(overallScore);

    const report: QualityReport = {
      overallScore,
      grade,
      metrics,
      summary: generateSummary(overallScore, grade, selectedArtifact),
      recommendations: generateRecommendations(metrics, selectedArtifact)
    };

    setQualityReport(report);
    setIsAnalyzing(false);

    toast({
      title: "Quality Analysis Complete",
      description: `Overall score: ${overallScore}/100 (${grade})`
    });
  };

  const generateQualityMetrics = (artifactType: string): QualityMetric[] => {
    const baseMetrics = [
      {
        name: 'Completeness',
        score: 85 + Math.random() * 10,
        weight: 0.25,
        description: 'How complete and comprehensive the artifact is',
        status: 'good' as const,
        suggestions: ['Add more detailed configuration', 'Include edge cases', 'Expand documentation']
      },
      {
        name: 'Best Practices',
        score: 78 + Math.random() * 15,
        weight: 0.20,
        description: 'Adherence to industry standards and best practices',
        status: 'good' as const,
        suggestions: ['Follow naming conventions', 'Implement security patterns', 'Use recommended structures']
      },
      {
        name: 'Security',
        score: 82 + Math.random() * 12,
        weight: 0.20,
        description: 'Security considerations and implementations',
        status: 'good' as const,
        suggestions: ['Add input validation', 'Implement authentication', 'Use encryption']
      },
      {
        name: 'Scalability',
        score: 75 + Math.random() * 20,
        weight: 0.15,
        description: 'Ability to handle growth and increased load',
        status: 'good' as const,
        suggestions: ['Add auto-scaling', 'Implement caching', 'Use load balancing']
      },
      {
        name: 'Maintainability',
        score: 88 + Math.random() * 8,
        weight: 0.10,
        description: 'Ease of maintenance and updates',
        status: 'excellent' as const,
        suggestions: ['Add monitoring', 'Improve documentation', 'Implement logging']
      },
      {
        name: 'Performance',
        score: 79 + Math.random() * 16,
        weight: 0.10,
        description: 'Efficiency and speed of the solution',
        status: 'good' as const,
        suggestions: ['Optimize queries', 'Add caching layers', 'Use CDN']
      }
    ];

    return baseMetrics.map(metric => ({
      ...metric,
      status: getMetricStatus(metric.score),
      suggestions: metric.suggestions.slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  const getMetricStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  };

  const calculateOverallScore = (metrics: QualityMetric[]): number => {
    const weightedSum = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
    return Math.round(weightedSum);
  };

  const getGrade = (score: number): string => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    return 'D';
  };

  const generateSummary = (score: number, grade: string, artifactType: string): string => {
    const summaries = {
      excellent: `Exceptional ${artifactType} artifact with comprehensive coverage and strong adherence to best practices.`,
      good: `Solid ${artifactType} implementation with good structure and reasonable coverage of requirements.`,
      fair: `Adequate ${artifactType} with room for improvement in several areas.`,
      poor: `${artifactType} needs significant enhancement to meet production standards.`
    };

    if (score >= 90) return summaries.excellent;
    if (score >= 80) return summaries.good;
    if (score >= 70) return summaries.fair;
    return summaries.poor;
  };

  const generateRecommendations = (metrics: QualityMetric[], artifactType: string): string[] => {
    const lowScoreMetrics = metrics.filter(m => m.score < 80).sort((a, b) => a.score - b.score);
    
    const recommendations = [
      `Focus on improving ${lowScoreMetrics[0]?.name.toLowerCase()} for better overall quality`,
      `Consider implementing automated testing for ${artifactType}`,
      `Add comprehensive documentation and examples`,
      `Implement monitoring and observability features`,
      `Review and enhance security configurations`
    ];

    return recommendations.slice(0, 3 + Math.floor(Math.random() * 2));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'fair': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fair': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-800 flex items-center space-x-2">
                <Star className="w-6 h-6" />
                <span>Quality Assessment Dashboard</span>
              </CardTitle>
              <p className="text-green-600 mt-2">
                Automated quality scoring and recommendations for your {domain} AI artifacts
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              AI Quality Analysis
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Artifact</label>
              <select 
                value={selectedArtifact}
                onChange={(e) => setSelectedArtifact(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="architecture">System Architecture</option>
                <option value="terraform">Infrastructure Code</option>
                <option value="workflow">Workflow Configuration</option>
                <option value="cicd">CI/CD Pipeline</option>
              </select>
            </div>
            <Button 
              onClick={runQualityAnalysis}
              disabled={isAnalyzing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Quality'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      {qualityReport && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8 py-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
                  {qualityReport.overallScore}
                </div>
                <div className="text-lg text-gray-600">out of 100</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
                  {qualityReport.grade}
                </div>
                <div className="text-lg text-gray-600">Grade</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={qualityReport.overallScore} className="h-4" />
            </div>
            <p className="text-center text-gray-600 mt-4">{qualityReport.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {qualityReport && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {qualityReport.metrics.map((metric, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getStatusColor(metric.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <h3 className="font-semibold">{metric.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        Weight: {(metric.weight * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score.toFixed(1)}/100
                    </div>
                  </div>
                  <p className="text-sm mb-3">{metric.description}</p>
                  <div className="mb-3">
                    <Progress value={metric.score} className="h-2" />
                  </div>
                  {metric.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Suggestions for improvement:</h4>
                      <ul className="space-y-1">
                        {metric.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm flex items-center">
                            <div className="w-1 h-1 bg-current rounded-full mr-2"></div>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {qualityReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Improvement Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityReport.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Trends */}
      {qualityReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quality Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="strengths" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                <TabsTrigger value="roadmap">Quality Roadmap</TabsTrigger>
              </TabsList>

              <TabsContent value="strengths" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qualityReport.metrics
                    .filter(m => m.score >= 85)
                    .map((metric, index) => (
                    <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-green-800">{metric.name}</h3>
                      </div>
                      <p className="text-sm text-green-600">{metric.description}</p>
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-700">
                          Excellent: {metric.score.toFixed(1)}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qualityReport.metrics
                    .filter(m => m.score < 85)
                    .sort((a, b) => a.score - b.score)
                    .map((metric, index) => (
                    <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">{metric.name}</h3>
                      </div>
                      <p className="text-sm text-yellow-600 mb-3">{metric.description}</p>
                      <div className="space-y-2">
                        {metric.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center text-sm text-yellow-700">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full mr-2"></div>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="roadmap" className="mt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Short Term (1-2 weeks)</h3>
                    <ul className="space-y-1 text-sm text-blue-600">
                      <li>• Address security vulnerabilities and implement basic authentication</li>
                      <li>• Add comprehensive error handling and logging</li>
                      <li>• Improve documentation and code comments</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Medium Term (1-2 months)</h3>
                    <ul className="space-y-1 text-sm text-purple-600">
                      <li>• Implement automated testing and CI/CD improvements</li>
                      <li>• Add performance monitoring and optimization</li>
                      <li>• Enhance scalability and reliability features</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Long Term (3+ months)</h3>
                    <ul className="space-y-1 text-sm text-green-600">
                      <li>• Advanced security features and compliance</li>
                      <li>• Machine learning model optimization</li>
                      <li>• Enterprise-grade features and integrations</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

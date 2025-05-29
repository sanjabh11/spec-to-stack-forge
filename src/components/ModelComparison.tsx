
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Compare, 
  Brain, 
  Clock, 
  DollarSign, 
  Zap, 
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ModelComparisonProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

interface ModelResult {
  model: string;
  provider: string;
  response: string;
  qualityScore: number;
  responseTime: number;
  cost: number;
  pros: string[];
  cons: string[];
}

export const ModelComparison = ({ artifacts, sessionData, domain }: ModelComparisonProps) => {
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ModelResult[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('architecture');

  const prompts = {
    architecture: `Generate a system architecture for a ${domain} AI solution with microservices, databases, and API gateways.`,
    terraform: `Create Terraform configuration for deploying a ${domain} AI platform on AWS with auto-scaling and monitoring.`,
    workflow: `Design an n8n workflow for ${domain} data processing with AI integration and notification systems.`,
    documentation: `Write comprehensive documentation for a ${domain} AI solution including setup, configuration, and usage guides.`
  };

  useEffect(() => {
    // Simulate initial comparison on component mount
    runComparison();
  }, []);

  const runComparison = async () => {
    setIsComparing(true);
    
    // Simulate API calls to different LLM providers
    const models = [
      { name: 'GPT-4o', provider: 'OpenAI' },
      { name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      { name: 'Gemini 2.5 Pro', provider: 'Google' },
      { name: 'Llama 3.3 70B', provider: 'Meta' }
    ];

    const mockResults: ModelResult[] = [];

    for (const model of models) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResult: ModelResult = {
        model: model.name,
        provider: model.provider,
        response: generateMockResponse(model.name, selectedPrompt),
        qualityScore: 75 + Math.random() * 20,
        responseTime: 1000 + Math.random() * 3000,
        cost: 0.01 + Math.random() * 0.05,
        pros: generatePros(model.name),
        cons: generateCons(model.name)
      };

      mockResults.push(mockResult);
      setComparisonResults([...mockResults]);
    }

    setIsComparing(false);
    toast({
      title: "Comparison Complete",
      description: "Model comparison analysis finished successfully."
    });
  };

  const generateMockResponse = (model: string, prompt: string) => {
    const responses = {
      'GPT-4o': {
        architecture: `# ${domain} AI Solution Architecture

## Core Components
- **API Gateway**: Kong or AWS API Gateway for request routing
- **Microservices**: Node.js/Python services in Docker containers
- **Database**: PostgreSQL for relational data, Redis for caching
- **AI Processing**: Dedicated ML inference service with GPU support
- **Message Queue**: RabbitMQ for async processing

## Scalability
- Horizontal pod autoscaling based on CPU/memory
- Load balancing with health checks
- Circuit breaker pattern for fault tolerance`,
        terraform: `provider "aws" {
  region = var.aws_region
}

resource "aws_ecs_cluster" "${domain.toLowerCase()}_cluster" {
  name = "${domain}-ai-platform"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_application_load_balancer" "main" {
  name               = "${domain}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnets
}`,
        workflow: `{
  "nodes": [
    {
      "id": "trigger",
      "type": "webhook",
      "name": "${domain} Data Ingestion",
      "parameters": {
        "path": "/${domain.toLowerCase()}/data",
        "method": "POST"
      }
    },
    {
      "id": "validate",
      "type": "function",
      "name": "Data Validation"
    },
    {
      "id": "ai-process",
      "type": "openai",
      "name": "AI Processing"
    }
  ]
}`,
        documentation: `# ${domain} AI Platform Documentation

## Quick Start
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure environment variables
4. Run: \`npm start\`

## Architecture Overview
This platform provides AI-powered solutions for ${domain.toLowerCase()} use cases...`
      },
      'Claude 3.5 Sonnet': {
        architecture: `# Comprehensive ${domain} AI Architecture

## System Design Philosophy
- **Event-Driven Architecture**: Ensures loose coupling and high scalability
- **Domain-Driven Design**: Clear separation of business logic
- **CQRS Pattern**: Optimized read/write operations

## Technical Stack
- **Frontend**: React/Vue.js with TypeScript
- **Backend**: FastAPI/Express.js microservices
- **Data Layer**: PostgreSQL + MongoDB for different data types
- **AI/ML**: TensorFlow Serving, MLflow for model management
- **Infrastructure**: Kubernetes with Istio service mesh`,
        terraform: `terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

module "${domain.toLowerCase()}_infrastructure" {
  source = "./modules/ai-platform"
  
  environment = var.environment
  domain_name = "${domain.toLowerCase()}"
  
  # Auto-scaling configuration
  min_capacity = 2
  max_capacity = 100
}`,
        workflow: `{
  "meta": {
    "instanceId": "${domain.toLowerCase()}-workflow"
  },
  "nodes": [
    {
      "id": "data-source",
      "type": "schedule-trigger",
      "name": "Scheduled Data Processing"
    },
    {
      "id": "etl-process",
      "type": "python-function",
      "name": "Data Transformation"
    },
    {
      "id": "ml-inference",
      "type": "http-request",
      "name": "ML Model Inference"
    }
  ]
}`,
        documentation: `# ${domain} AI Platform - Enterprise Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Deployment](#deployment)

## Getting Started
This enterprise-grade AI platform is designed for ${domain.toLowerCase()} applications...`
      }
    };

    return responses[model as keyof typeof responses]?.[prompt as keyof typeof responses['GPT-4o']] || 
           `Mock response from ${model} for ${prompt} prompt in ${domain} domain.`;
  };

  const generatePros = (model: string) => {
    const prosMap = {
      'GPT-4o': ['Excellent reasoning', 'Strong code generation', 'Good context handling'],
      'Claude 3.5 Sonnet': ['Superior analysis', 'Ethical responses', 'Long context'],
      'Gemini 2.5 Pro': ['Fast processing', 'Multimodal capable', 'Cost effective'],
      'Llama 3.3 70B': ['Open source', 'Good performance', 'Privacy focused']
    };
    return prosMap[model as keyof typeof prosMap] || ['Good performance', 'Reliable', 'Accurate'];
  };

  const generateCons = (model: string) => {
    const consMap = {
      'GPT-4o': ['Higher cost', 'Rate limits', 'API dependency'],
      'Claude 3.5 Sonnet': ['Limited availability', 'Higher latency', 'Cost considerations'],
      'Gemini 2.5 Pro': ['Beta features', 'Limited fine-tuning', 'New platform'],
      'Llama 3.3 70B': ['Self-hosting required', 'Resource intensive', 'Setup complexity']
    };
    return consMap[model as keyof typeof consMap] || ['Some limitations', 'Cost factor', 'Setup required'];
  };

  const getBestModel = () => {
    if (comparisonResults.length === 0) return null;
    return comparisonResults.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-800 flex items-center space-x-2">
                <Compare className="w-6 h-6" />
                <span>Model Comparison Dashboard</span>
              </CardTitle>
              <p className="text-blue-600 mt-2">
                Compare LLM outputs side-by-side for your {domain} AI solution
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Advanced AI Features
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Prompt Type</label>
              <select 
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="architecture">System Architecture</option>
                <option value="terraform">Infrastructure Code</option>
                <option value="workflow">Workflow Design</option>
                <option value="documentation">Documentation</option>
              </select>
            </div>
            <Button 
              onClick={runComparison}
              disabled={isComparing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isComparing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Compare className="w-4 h-4 mr-2" />
              )}
              {isComparing ? 'Comparing...' : 'Run Comparison'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Overview */}
      {comparisonResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {comparisonResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg relative">
                  {getBestModel()?.model === result.model && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Best
                      </Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-semibold">{result.model}</h3>
                    <p className="text-sm text-gray-600 mb-2">{result.provider}</p>
                    <div className={`text-2xl font-bold ${getScoreColor(result.qualityScore)}`}>
                      {result.qualityScore.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500">Quality Score</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Avg Response Time</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {(comparisonResults.reduce((sum, r) => sum + r.responseTime, 0) / comparisonResults.length / 1000).toFixed(2)}s
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Avg Cost</span>
                </div>
                <div className="text-xl font-bold text-green-700">
                  ${(comparisonResults.reduce((sum, r) => sum + r.cost, 0) / comparisonResults.length).toFixed(3)}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Best Score</span>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {Math.max(...comparisonResults.map(r => r.qualityScore)).toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison */}
      {comparisonResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="responses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="responses">Model Responses</TabsTrigger>
                <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                <TabsTrigger value="analysis">Pros & Cons</TabsTrigger>
              </TabsList>

              <TabsContent value="responses" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {comparisonResults.map((result, index) => (
                    <div key={index} className="border rounded-lg">
                      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{result.model}</h3>
                          <p className="text-sm text-gray-600">{result.provider}</p>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(result.qualityScore)}`}>
                          {result.qualityScore.toFixed(1)}/100
                        </div>
                      </div>
                      <div className="p-4">
                        <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                          {result.response}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="mt-6">
                <div className="space-y-6">
                  {comparisonResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{result.model}</h3>
                        <Badge variant="outline">{result.provider}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Quality Score</span>
                            <span className="text-sm font-medium">{result.qualityScore.toFixed(1)}/100</span>
                          </div>
                          <Progress value={result.qualityScore} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Response Time</span>
                            <span className="text-sm font-medium">{(result.responseTime / 1000).toFixed(2)}s</span>
                          </div>
                          <Progress value={Math.min((result.responseTime / 5000) * 100, 100)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Cost</span>
                            <span className="text-sm font-medium">${result.cost.toFixed(3)}</span>
                          </div>
                          <Progress value={Math.min((result.cost / 0.1) * 100, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {comparisonResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{result.model}</h3>
                        <Badge variant="outline">{result.provider}</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-green-700 flex items-center mb-2">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-red-700 flex items-center mb-2">
                            <XCircle className="w-4 h-4 mr-1" />
                            Limitations
                          </h4>
                          <ul className="space-y-1">
                            {result.cons.map((con, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      {comparisonResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

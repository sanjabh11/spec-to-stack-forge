
// Enhanced multi-model abstraction layer with advanced routing and cost optimization

export interface LLMProvider {
  name: string;
  type: 'self-hosted' | 'api' | 'local';
  endpoint: string;
  apiKey?: string;
  modelName: string;
  maxTokens: number;
  costPerToken: number;
  capabilities: string[];
  latencyMs: number;
  reliability: number;
  isActive: boolean;
  region?: string;
  priority: number;
}

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  stream?: boolean;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
  fallbackModels?: string[];
}

export interface LLMResponse {
  text: string;
  tokens: number;
  model: string;
  cost: number;
  latency: number;
  provider: string;
  confidence?: number;
  cached?: boolean;
}

export interface ModelMetrics {
  totalRequests: number;
  totalCost: number;
  averageLatency: number;
  errorRate: number;
  lastUsed: Date;
}

export class EnhancedModelManager {
  private providers: Map<string, LLMProvider> = new Map();
  private defaultProvider: string = 'llama3-70b';
  private metrics: Map<string, ModelMetrics> = new Map();
  private cache: Map<string, { response: LLMResponse; timestamp: number }> = new Map();
  private loadBalancer: Map<string, number> = new Map();
  private circuit: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();

  constructor() {
    this.initializeProviders();
    this.startMetricsCollection();
  }

  private initializeProviders() {
    // Self-hosted LLaMA 3 70B - Primary
    this.addProvider({
      name: 'llama3-70b',
      type: 'self-hosted',
      endpoint: 'http://llama3-70b-service.ai-models.svc.cluster.local:8000',
      modelName: 'meta-llama/Meta-Llama-3-70B-Instruct',
      maxTokens: 4096,
      costPerToken: 0.0,
      capabilities: ['text-generation', 'instruction-following', 'reasoning'],
      latencyMs: 800,
      reliability: 0.95,
      isActive: true,
      priority: 1
    });

    // Gemini 2.5 Pro - High quality fallback
    this.addProvider({
      name: 'gemini-2.5-pro',
      type: 'api',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      modelName: 'gemini-2.5-pro',
      maxTokens: 8192,
      costPerToken: 0.03,
      capabilities: ['text-generation', 'vision', 'function-calling'],
      latencyMs: 1200,
      reliability: 0.98,
      isActive: true,
      priority: 2
    });

    // Mistral 7B - Fast and lightweight
    this.addProvider({
      name: 'mistral-7b',
      type: 'self-hosted',
      endpoint: 'http://mistral-service.ai-models.svc.cluster.local:8000',
      modelName: 'mistralai/Mistral-7B-Instruct-v0.2',
      maxTokens: 2048,
      costPerToken: 0.0,
      capabilities: ['text-generation', 'instruction-following'],
      latencyMs: 400,
      reliability: 0.92,
      isActive: true,
      priority: 3
    });

    // Claude 3 Sonnet - Premium option
    this.addProvider({
      name: 'claude-3-sonnet',
      type: 'api',
      endpoint: 'https://api.anthropic.com/v1/messages',
      modelName: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      costPerToken: 0.015,
      capabilities: ['text-generation', 'reasoning', 'analysis'],
      latencyMs: 1000,
      reliability: 0.97,
      isActive: false, // Requires API key
      priority: 4
    });
  }

  addProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
    this.metrics.set(provider.name, {
      totalRequests: 0,
      totalCost: 0,
      averageLatency: 0,
      errorRate: 0,
      lastUsed: new Date()
    });
    this.circuit.set(provider.name, {
      failures: 0,
      lastFailure: new Date(0),
      isOpen: false
    });
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
      return { ...cached.response, cached: true };
    }

    // Select optimal provider
    const provider = await this.selectOptimalProvider(request);
    if (!provider) {
      throw new Error('No available providers');
    }

    const startTime = Date.now();
    let response: LLMResponse;

    try {
      // Route to appropriate implementation
      if (provider.type === 'self-hosted') {
        response = await this.callSelfHosted(provider, request);
      } else if (provider.type === 'api') {
        response = await this.callExternalAPI(provider, request);
      } else {
        throw new Error(`Unsupported provider type: ${provider.type}`);
      }

      const latency = Date.now() - startTime;
      const tokens = this.estimateTokens(response.text);
      const cost = tokens * provider.costPerToken / 1000;

      const finalResponse: LLMResponse = {
        text: response.text,
        tokens,
        model: provider.modelName,
        cost,
        latency,
        provider: provider.name,
        confidence: response.confidence || 0.8
      };

      // Update metrics
      this.updateMetrics(provider.name, cost, latency, true);
      
      // Cache response
      this.cache.set(cacheKey, { response: finalResponse, timestamp: Date.now() });
      
      // Reset circuit breaker on success
      this.resetCircuitBreaker(provider.name);

      return finalResponse;
    } catch (error) {
      this.updateMetrics(provider.name, 0, Date.now() - startTime, false);
      this.handleProviderError(provider.name, error);
      
      // Try fallback providers
      if (request.fallbackModels && request.fallbackModels.length > 0) {
        for (const fallbackModel of request.fallbackModels) {
          try {
            const fallbackProvider = this.providers.get(fallbackModel);
            if (fallbackProvider && this.isProviderHealthy(fallbackProvider.name)) {
              console.log(`Falling back to ${fallbackModel}`);
              return await this.generateText({ ...request, model: fallbackModel, fallbackModels: [] });
            }
          } catch (fallbackError) {
            console.error(`Fallback ${fallbackModel} also failed:`, fallbackError);
          }
        }
      }
      
      throw error;
    }
  }

  private async selectOptimalProvider(request: LLMRequest): Promise<LLMProvider | null> {
    const requestedModel = request.model || this.defaultProvider;
    let candidates = [requestedModel];
    
    // Add fallback models if available
    if (request.fallbackModels) {
      candidates = candidates.concat(request.fallbackModels);
    }
    
    // Filter by health and availability
    const availableProviders = candidates
      .map(name => this.providers.get(name))
      .filter((provider): provider is LLMProvider => 
        provider !== undefined && 
        provider.isActive && 
        this.isProviderHealthy(provider.name)
      );

    if (availableProviders.length === 0) {
      return null;
    }

    // Smart routing based on request priority and provider characteristics
    if (request.priority === 'high') {
      // Prioritize reliability and performance
      return availableProviders.sort((a, b) => 
        (b.reliability * 0.6 + (1 / b.latencyMs) * 0.4) - (a.reliability * 0.6 + (1 / a.latencyMs) * 0.4)
      )[0];
    } else if (request.priority === 'low') {
      // Prioritize cost efficiency
      return availableProviders.sort((a, b) => a.costPerToken - b.costPerToken)[0];
    } else {
      // Balanced approach with load balancing
      return this.loadBalanceProviders(availableProviders);
    }
  }

  private loadBalanceProviders(providers: LLMProvider[]): LLMProvider {
    // Simple round-robin with weight adjustment
    const weighted = providers.map(provider => {
      const usage = this.loadBalancer.get(provider.name) || 0;
      const weight = 1 / (usage + 1) * provider.reliability;
      return { provider, weight };
    });

    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const item of weighted) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        this.loadBalancer.set(item.provider.name, (this.loadBalancer.get(item.provider.name) || 0) + 1);
        return item.provider;
      }
    }
    
    return providers[0];
  }

  private isProviderHealthy(providerName: string): boolean {
    const circuit = this.circuit.get(providerName);
    if (!circuit) return true;
    
    // Circuit breaker logic
    if (circuit.isOpen) {
      const timeSinceFailure = Date.now() - circuit.lastFailure.getTime();
      if (timeSinceFailure > 60000) { // 1 minute cooldown
        circuit.isOpen = false;
        circuit.failures = 0;
        return true;
      }
      return false;
    }
    
    return circuit.failures < 3;
  }

  private handleProviderError(providerName: string, error: any) {
    const circuit = this.circuit.get(providerName);
    if (circuit) {
      circuit.failures++;
      circuit.lastFailure = new Date();
      
      if (circuit.failures >= 3) {
        circuit.isOpen = true;
        console.warn(`Circuit breaker opened for ${providerName}`);
      }
    }
  }

  private resetCircuitBreaker(providerName: string) {
    const circuit = this.circuit.get(providerName);
    if (circuit) {
      circuit.failures = 0;
      circuit.isOpen = false;
    }
  }

  private async callSelfHosted(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${provider.endpoint}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider.apiKey && { 'Authorization': `Bearer ${provider.apiKey}` })
      },
      body: JSON.stringify({
        model: provider.modelName,
        prompt: request.prompt,
        max_tokens: request.maxTokens || 512,
        temperature: request.temperature || 0.7,
        stream: request.stream || false
      }),
      signal: AbortSignal.timeout(request.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].text,
      confidence: data.choices[0].finish_reason === 'stop' ? 0.9 : 0.7
    } as LLMResponse;
  }

  private async callExternalAPI(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    if (provider.name.includes('gemini')) {
      return this.callGeminiAPI(provider, request);
    } else if (provider.name.includes('claude')) {
      return this.callClaudeAPI(provider, request);
    }
    
    throw new Error(`External API ${provider.name} not implemented`);
  }

  private async callGeminiAPI(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${provider.endpoint}/gemini-2.5-pro:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 512
        }
      }),
      signal: AbortSignal.timeout(request.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      confidence: data.candidates?.[0]?.finishReason === 'STOP' ? 0.9 : 0.7
    } as LLMResponse;
  }

  private async callClaudeAPI(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.modelName,
        max_tokens: request.maxTokens || 512,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7
      }),
      signal: AbortSignal.timeout(request.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.content?.[0]?.text || '',
      confidence: data.stop_reason === 'end_turn' ? 0.9 : 0.7
    } as LLMResponse;
  }

  private updateMetrics(providerName: string, cost: number, latency: number, success: boolean) {
    const metrics = this.metrics.get(providerName);
    if (metrics) {
      metrics.totalRequests++;
      metrics.totalCost += cost;
      metrics.averageLatency = (metrics.averageLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
      metrics.errorRate = success ? metrics.errorRate * 0.95 : Math.min(metrics.errorRate + 0.1, 1);
      metrics.lastUsed = new Date();
    }
  }

  private generateCacheKey(request: LLMRequest): string {
    const keyData = {
      prompt: request.prompt,
      model: request.model || this.defaultProvider,
      maxTokens: request.maxTokens || 512,
      temperature: request.temperature || 0.7
    };
    return btoa(JSON.stringify(keyData));
  }

  private estimateTokens(text: string): number {
    // Improved token estimation
    return Math.ceil(text.length / 3.8);
  }

  private startMetricsCollection() {
    // Clean up old cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > 300000) {
          this.cache.delete(key);
        }
      }
    }, 300000);
  }

  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name);
  }

  listProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  getMetrics(): Map<string, ModelMetrics> {
    return new Map(this.metrics);
  }

  setDefaultProvider(name: string) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    }
  }

  async healthCheck(): Promise<Map<string, boolean>> {
    const health = new Map<string, boolean>();
    
    for (const [name, provider] of this.providers) {
      if (!provider.isActive) {
        health.set(name, false);
        continue;
      }
      
      try {
        const testResponse = await this.generateText({
          prompt: 'Health check',
          model: name,
          maxTokens: 10,
          timeout: 5000
        });
        health.set(name, testResponse.text.length > 0);
      } catch (error) {
        health.set(name, false);
      }
    }
    
    return health;
  }
}

export const enhancedModelManager = new EnhancedModelManager();

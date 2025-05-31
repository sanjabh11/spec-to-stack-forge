
// Multi-model abstraction layer for LLM providers

export interface LLMProvider {
  name: string;
  type: 'self-hosted' | 'api' | 'local';
  endpoint: string;
  apiKey?: string;
  modelName: string;
  maxTokens: number;
  costPerToken: number;
  capabilities: string[];
}

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  stream?: boolean;
}

export interface LLMResponse {
  text: string;
  tokens: number;
  model: string;
  cost: number;
  latency: number;
}

export class ModelManager {
  private providers: Map<string, LLMProvider> = new Map();
  private defaultProvider: string = 'llama3-70b';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Self-hosted LLaMA 3 70B
    this.addProvider({
      name: 'llama3-70b',
      type: 'self-hosted',
      endpoint: 'http://llama3-70b-service.ai-models.svc.cluster.local:8000',
      modelName: 'meta-llama/Meta-Llama-3-70B-Instruct',
      maxTokens: 4096,
      costPerToken: 0.0,
      capabilities: ['text-generation', 'instruction-following', 'reasoning']
    });

    // Gemini Pro
    this.addProvider({
      name: 'gemini-2.5-pro',
      type: 'api',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      modelName: 'gemini-2.5-pro',
      maxTokens: 8192,
      costPerToken: 0.03,
      capabilities: ['text-generation', 'vision', 'function-calling']
    });

    // Mistral (self-hosted)
    this.addProvider({
      name: 'mistral-7b',
      type: 'self-hosted',
      endpoint: 'http://mistral-service.ai-models.svc.cluster.local:8000',
      modelName: 'mistralai/Mistral-7B-Instruct-v0.2',
      maxTokens: 2048,
      costPerToken: 0.0,
      capabilities: ['text-generation', 'instruction-following']
    });
  }

  addProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name);
  }

  listProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const providerName = request.model || this.defaultProvider;
    const provider = this.getProvider(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const startTime = Date.now();

    try {
      let response;
      
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

      return {
        text: response.text,
        tokens,
        model: provider.modelName,
        cost,
        latency
      };
    } catch (error) {
      console.error(`Error calling ${providerName}:`, error);
      throw error;
    }
  }

  private async callSelfHosted(provider: LLMProvider, request: LLMRequest) {
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
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].text
    };
  }

  private async callExternalAPI(provider: LLMProvider, request: LLMRequest) {
    // Implementation for external APIs (Gemini, Claude, etc.)
    if (provider.name.includes('gemini')) {
      return this.callGeminiAPI(provider, request);
    }
    
    throw new Error(`External API ${provider.name} not implemented`);
  }

  private async callGeminiAPI(provider: LLMProvider, request: LLMRequest) {
    const response = await fetch(`${provider.endpoint}/gemini-2.5-pro:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 512
        }
      })
    });

    const data = await response.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  setDefaultProvider(name: string) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    }
  }
}

export const modelManager = new ModelManager();

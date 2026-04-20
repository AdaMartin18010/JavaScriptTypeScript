/**
 * @file LLM Gateway / Router
 * @category AI Integration → Gateway
 * @difficulty hard
 * @tags ai, llm, gateway, routing, fallback, retry, caching, budget
 *
 * @description
 * LLM 网关/路由器实现：
 * - 多提供商路由（OpenAI, Anthropic, local）
 * - 降级与重试逻辑（指数退避）
 * - Token 用量追踪与预算管理
 * - 请求/响应日志与缓存
 */

// ============================================================================
// 1. 多提供商路由
// ============================================================================

export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latencyMs: number;
}

export interface LLMProvider {
  name: string;
  priority: number;
  models: string[];
  chat: (request: ChatRequest) => Promise<ChatResponse>;
  streamChat?: (request: ChatRequest) => AsyncGenerator<string>;
}

export interface RoutingRule {
  modelPattern: RegExp;
  providerName: string;
}

export class MultiProviderRouter {
  private providers = new Map<string, LLMProvider>();
  private rules: RoutingRule[] = [];

  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  addRule(rule: RoutingRule): void {
    this.rules.push(rule);
  }

  selectProvider(request: ChatRequest): LLMProvider {
    for (const rule of this.rules) {
      if (rule.modelPattern.test(request.model)) {
        const provider = this.providers.get(rule.providerName);
        if (provider) return provider;
      }
    }
    for (const provider of this.providers.values()) {
      if (provider.models.includes(request.model)) return provider;
    }
    const sorted = Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
    if (sorted.length === 0) throw new Error('No LLM provider registered');
    return sorted[0];
  }

  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
  }
}

// ============================================================================
// 2. 降级与重试逻辑
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export class FallbackRetryHandler {
  private router: MultiProviderRouter;
  private retryConfig: RetryConfig;

  constructor(router: MultiProviderRouter, retryConfig?: Partial<RetryConfig>) {
    this.router = router;
    this.retryConfig = {
      maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 30000, backoffMultiplier: 2,
      retryableErrors: ['timeout', 'rate_limit', 'connection_error', 'service_unavailable'],
      ...retryConfig
    };
  }

  async execute(request: ChatRequest): Promise<ChatResponse> {
    const providers = this.router.getProviders();
    const lastError: Error[] = [];
    for (const provider of providers) {
      try {
        return await this.executeWithRetry(provider, request);
      } catch (err) {
        console.warn(`[Gateway] Provider ${provider.name} failed: ${(err as Error).message}`);
        lastError.push(err as Error);
      }
    }
    throw new Error(`All providers failed. Errors: ${lastError.map(e => e.message).join('; ')}`);
  }

  private async executeWithRetry(provider: LLMProvider, request: ChatRequest): Promise<ChatResponse> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const start = Date.now();
        const result = await provider.chat(request);
        result.latencyMs = Date.now() - start;
        return result;
      } catch (err) {
        lastError = err as Error;
        const msg = lastError.message.toLowerCase();
        const isRetryable = this.retryConfig.retryableErrors!.some(e => msg.includes(e));
        if (!isRetryable || attempt === this.retryConfig.maxRetries) throw lastError;
        const delay = this.calculateDelay(attempt);
        console.log(`[Gateway] Retry ${attempt + 1}/${this.retryConfig.maxRetries} for ${provider.name} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    return Math.min(
      this.retryConfig.baseDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelayMs
    );
  }
}

// ============================================================================
// 3. Token 用量追踪与预算管理
// ============================================================================

export interface TokenBudget {
  dailyLimit: number;
  monthlyLimit: number;
  alertThreshold: number;
}

export interface UsageRecord {
  timestamp: number;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

export class TokenUsageTracker {
  private records: UsageRecord[] = [];
  private budget: TokenBudget;
  private costPer1K: Record<string, number> = {
    'gpt-4': 0.03, 'gpt-3.5-turbo': 0.0015, 'claude-3': 0.008, 'local-model': 0
  };

  constructor(budget: TokenBudget) {
    this.budget = budget;
  }

  record(response: ChatResponse, providerName: string): void {
    const cost = this.estimateCost(response.model, response.usage.total_tokens);
    this.records.push({
      timestamp: Date.now(), provider: providerName, model: response.model,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens, costUsd: cost
    });
    this.checkBudgetAlerts();
  }

  getDailyUsage(date = new Date()): { tokens: number; cost: number } {
    const start = new Date(date).setHours(0, 0, 0, 0);
    return this.aggregateUsage(start, start + 86400000);
  }

  getMonthlyUsage(year: number, month: number): { tokens: number; cost: number } {
    const start = new Date(year, month - 1, 1).getTime();
    return this.aggregateUsage(start, new Date(year, month, 1).getTime());
  }

  getProviderBreakdown(): Record<string, { tokens: number; cost: number; requests: number }> {
    const breakdown: Record<string, { tokens: number; cost: number; requests: number }> = {};
    for (const r of this.records) {
      if (!breakdown[r.provider]) breakdown[r.provider] = { tokens: 0, cost: 0, requests: 0 };
      breakdown[r.provider].tokens += r.totalTokens;
      breakdown[r.provider].cost += r.costUsd;
      breakdown[r.provider].requests++;
    }
    return breakdown;
  }

  isWithinBudget(): boolean {
    const daily = this.getDailyUsage();
    const monthly = this.getMonthlyUsage(new Date().getFullYear(), new Date().getMonth() + 1);
    return daily.tokens < this.budget.dailyLimit && monthly.tokens < this.budget.monthlyLimit;
  }

  setCostPer1K(model: string, cost: number): void {
    this.costPer1K[model] = cost;
  }

  private estimateCost(model: string, tokens: number): number {
    return (tokens / 1000) * (this.costPer1K[model] ?? this.costPer1K['gpt-4']);
  }

  private aggregateUsage(start: number, end: number): { tokens: number; cost: number } {
    return this.records
      .filter(r => r.timestamp >= start && r.timestamp < end)
      .reduce((acc, r) => ({ tokens: acc.tokens + r.totalTokens, cost: acc.cost + r.costUsd }), { tokens: 0, cost: 0 });
  }

  private checkBudgetAlerts(): void {
    const daily = this.getDailyUsage();
    const ratio = daily.tokens / this.budget.dailyLimit;
    if (ratio >= this.budget.alertThreshold) {
      console.warn(`[Budget Alert] Daily usage at ${(ratio * 100).toFixed(1)}% (${daily.tokens}/${this.budget.dailyLimit})`);
    }
  }
}

// ============================================================================
// 4. 请求/响应日志与缓存
// ============================================================================

export interface CacheEntry {
  requestHash: string;
  response: ChatResponse;
  expiresAt: number;
}

export class RequestResponseCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTLMs: number;

  constructor(defaultTTLMs = 5 * 60 * 1000) {
    this.defaultTTLMs = defaultTTLMs;
  }

  get(request: ChatRequest): ChatResponse | undefined {
    const hash = this.hashRequest(request);
    const entry = this.cache.get(hash);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return undefined;
    }
    console.log(`[Cache] Hit for request hash ${hash.slice(0, 8)}`);
    return entry.response;
  }

  set(request: ChatRequest, response: ChatResponse, ttlMs?: number): void {
    const hash = this.hashRequest(request);
    this.cache.set(hash, { requestHash: hash, response, expiresAt: Date.now() + (ttlMs ?? this.defaultTTLMs) });
  }

  invalidate(model?: string): void {
    if (!model) { this.cache.clear(); return; }
    for (const [hash, entry] of this.cache) {
      if (entry.response.model === model) this.cache.delete(hash);
    }
  }

  private hashRequest(request: ChatRequest): string {
    const key = JSON.stringify({
      model: request.model, messages: request.messages,
      temperature: request.temperature, max_tokens: request.max_tokens
    });
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(16);
  }
}

export class RequestLogger {
  private logs: Array<{
    timestamp: number; request: ChatRequest; response?: ChatResponse;
    error?: string; durationMs: number;
  }> = [];

  logRequest(request: ChatRequest): number {
    this.logs.push({ timestamp: Date.now(), request, durationMs: 0 });
    return this.logs.length - 1;
  }

  logResponse(logId: number, response: ChatResponse, durationMs: number): void {
    const entry = this.logs[logId];
    if (entry) { entry.response = response; entry.durationMs = durationMs; }
  }

  logError(logId: number, error: string, durationMs: number): void {
    const entry = this.logs[logId];
    if (entry) { entry.error = error; entry.durationMs = durationMs; }
  }

  getLogs(): typeof this.logs { return this.logs; }

  getStats(): { totalRequests: number; successRate: number; avgLatency: number; errorsByType: Record<string, number> } {
    const total = this.logs.length;
    const successes = this.logs.filter(l => l.response && !l.error).length;
    const latencies = this.logs.filter(l => l.durationMs > 0).map(l => l.durationMs);
    const errorsByType: Record<string, number> = {};
    for (const log of this.logs) {
      if (log.error) {
        const type = log.error.split(':')[0] || 'unknown';
        errorsByType[type] = (errorsByType[type] || 0) + 1;
      }
    }
    return {
      totalRequests: total,
      successRate: total > 0 ? successes / total : 0,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      errorsByType
    };
  }
}

// ============================================================================
// 5. LLM Gateway 组合
// ============================================================================

export interface GatewayConfig {
  retry?: Partial<RetryConfig>;
  budget?: Partial<TokenBudget>;
  cacheTTLMs?: number;
}

export class LLMGateway {
  private router: MultiProviderRouter;
  private fallbackHandler: FallbackRetryHandler;
  private usageTracker: TokenUsageTracker;
  private cache: RequestResponseCache;
  private logger: RequestLogger;

  constructor(config: GatewayConfig = {}) {
    this.router = new MultiProviderRouter();
    this.fallbackHandler = new FallbackRetryHandler(this.router, config.retry);
    this.usageTracker = new TokenUsageTracker({ dailyLimit: 100000, monthlyLimit: 2000000, alertThreshold: 0.8, ...config.budget });
    this.cache = new RequestResponseCache(config.cacheTTLMs);
    this.logger = new RequestLogger();
  }

  registerProvider(provider: LLMProvider): void {
    this.router.registerProvider(provider);
  }

  addRoutingRule(rule: RoutingRule): void {
    this.router.addRule(rule);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.usageTracker.isWithinBudget()) throw new Error('Token budget exceeded');
    const cached = this.cache.get(request);
    if (cached) return { ...cached, id: `${cached.id}_cached` };

    const logId = this.logger.logRequest(request);
    const start = Date.now();
    try {
      const response = await this.fallbackHandler.execute(request);
      const duration = Date.now() - start;
      this.usageTracker.record(response, this.router.selectProvider(request).name);
      this.logger.logResponse(logId, response, duration);
      this.cache.set(request, response);
      return response;
    } catch (err) {
      this.logger.logError(logId, (err as Error).message, Date.now() - start);
      throw err;
    }
  }

  getUsageReport(): {
    daily: { tokens: number; cost: number };
    monthly: { tokens: number; cost: number };
    providerBreakdown: Record<string, { tokens: number; cost: number; requests: number }>;
    logs: ReturnType<RequestLogger['getLogs']>;
    stats: ReturnType<RequestLogger['getStats']>;
  } {
    const now = new Date();
    return {
      daily: this.usageTracker.getDailyUsage(),
      monthly: this.usageTracker.getMonthlyUsage(now.getFullYear(), now.getMonth() + 1),
      providerBreakdown: this.usageTracker.getProviderBreakdown(),
      logs: this.logger.getLogs(),
      stats: this.logger.getStats()
    };
  }
}

// ============================================================================
// 6. Mock Provider 工厂
// ============================================================================

function createMockProvider(name: string, priority: number, models: string[], failRate = 0): LLMProvider {
  return {
    name, priority, models,
    chat: async (request) => {
      if (Math.random() < failRate) throw new Error(`service_unavailable: ${name}`);
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
      const promptTokens = Math.round(request.messages.reduce((s, m) => s + m.content.length / 4, 0));
      return {
        id: `resp_${Math.random().toString(36).substring(2, 10)}`,
        model: request.model,
        content: `[${name}] Response to: ${request.messages[request.messages.length - 1].content.slice(0, 30)}...`,
        usage: { prompt_tokens: promptTokens, completion_tokens: 50, total_tokens: promptTokens + 50 },
        latencyMs: 0
      };
    }
  };
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== LLM Gateway / Router ===\n');

  const gateway = new LLMGateway({
    retry: { maxRetries: 2, baseDelayMs: 100 },
    budget: { dailyLimit: 10000, monthlyLimit: 200000, alertThreshold: 0.5 },
    cacheTTLMs: 60000
  });

  gateway.registerProvider(createMockProvider('openai', 1, ['gpt-4', 'gpt-3.5-turbo']));
  gateway.registerProvider(createMockProvider('anthropic', 2, ['claude-3']));
  gateway.registerProvider(createMockProvider('local', 3, ['local-model'], 0.3));

  gateway.addRoutingRule({ modelPattern: /^gpt/, providerName: 'openai' });
  gateway.addRoutingRule({ modelPattern: /^claude/, providerName: 'anthropic' });

  console.log('1. 多提供商路由');
  const req1: ChatRequest = {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'What is TypeScript?' }]
  };
  const res1 = await gateway.chat(req1);
  console.log(`   Model: ${res1.model}, Tokens: ${res1.usage.total_tokens}`);

  console.log('\n2. 请求缓存');
  const cached = await gateway.chat(req1);
  console.log(`   Cached response ID: ${cached.id}`);

  console.log('\n3. Token 用量追踪与统计');
  const requests: ChatRequest[] = [
    { model: 'claude-3', messages: [{ role: 'user', content: 'Explain React hooks' }] },
    { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'Write a function' }] },
    { model: 'local-model', messages: [{ role: 'user', content: 'Local inference test' }] }
  ];
  for (const req of requests) {
    try { console.log(`   [${(await gateway.chat(req)).model}] ${(await gateway.chat(req)).content.slice(0, 40)}`); }
    catch (err) { console.log(`   [Error] ${(err as Error).message}`); }
  }

  console.log('\n4. Gateway 报告');
  const report = gateway.getUsageReport();
  console.log(`   Daily: ${report.daily.tokens.toFixed(0)} tokens, $${report.daily.cost.toFixed(4)}`);
  console.log(`   Monthly: ${report.monthly.tokens.toFixed(0)} tokens, $${report.monthly.cost.toFixed(4)}`);
  console.log('   Provider breakdown:', Object.entries(report.providerBreakdown).map(([n, d]) => `${n}=${d.requests}`).join(', '));
  console.log(`   Stats: ${report.stats.totalRequests} reqs, ${(report.stats.successRate * 100).toFixed(0)}% success, ${report.stats.avgLatency.toFixed(0)}ms avg`);

  console.log('\nLLM Gateway 要点:');
  console.log('- 多提供商路由: 根据模型名称或规则选择最优后端');
  console.log('- 降级重试: 一个提供商失败时自动切换到下一个');
  console.log('- 指数退避: 避免对故障服务造成雪崩效应');
  console.log('- 用量追踪: 监控 token 消耗和成本');
  console.log('- 预算管理: 防止意外超支');
  console.log('- 请求缓存: 重复查询直接返回缓存结果，降低成本');
  console.log('- 日志记录: 完整的请求生命周期可追溯');
}

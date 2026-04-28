import { describe, it, expect } from 'vitest';
import {
  MultiProviderRouter,
  FallbackRetryHandler,
  TokenUsageTracker,
  RequestResponseCache,
  RequestLogger,
  LLMGateway
} from './llm-gateway.js';
import type { LLMProvider, ChatRequest, ChatResponse } from './llm-gateway.js';

function createMockProvider(
  name: string,
  priority: number,
  models: string[],
  failRate = 0
): LLMProvider {
  return {
    name,
    priority,
    models,
    chat: async (request) => {
      if (Math.random() < failRate) {
        throw new Error(`service_unavailable: ${name}`);
      }
      const promptTokens = Math.round(request.messages.reduce((s, m) => s + m.content.length / 4, 0));
      return {
        id: `resp_${name}`,
        model: request.model,
        content: `from ${name}`,
        usage: { prompt_tokens: promptTokens, completion_tokens: 10, total_tokens: promptTokens + 10 },
        latencyMs: 0
      };
    }
  };
}

describe('MultiProviderRouter', () => {
  it('selects provider by model', () => {
    const router = new MultiProviderRouter();
    router.registerProvider(createMockProvider('p1', 1, ['m1']));
    router.registerProvider(createMockProvider('p2', 2, ['m2']));

    const req: ChatRequest = { model: 'm2', messages: [{ role: 'user', content: 'hi' }] };
    expect(router.selectProvider(req).name).toBe('p2');
  });

  it('selects by routing rule', () => {
    const router = new MultiProviderRouter();
    router.registerProvider(createMockProvider('openai', 1, ['gpt-4']));
    router.addRule({ modelPattern: /^gpt/, providerName: 'openai' });

    const req: ChatRequest = { model: 'gpt-3.5', messages: [{ role: 'user', content: 'hi' }] };
    expect(router.selectProvider(req).name).toBe('openai');
  });

  it('falls back to lowest priority when no match', () => {
    const router = new MultiProviderRouter();
    router.registerProvider(createMockProvider('default', 5, []));
    const req: ChatRequest = { model: 'unknown', messages: [{ role: 'user', content: 'hi' }] };
    expect(router.selectProvider(req).name).toBe('default');
  });
});

describe('FallbackRetryHandler', () => {
  it('executes via primary provider', async () => {
    const router = new MultiProviderRouter();
    router.registerProvider(createMockProvider('primary', 1, ['m1']));
    const handler = new FallbackRetryHandler(router);

    const req: ChatRequest = { model: 'm1', messages: [{ role: 'user', content: 'hi' }] };
    const res = await handler.execute(req);
    expect(res.content).toBe('from primary');
  });

  it('falls back to secondary provider', async () => {
    const router = new MultiProviderRouter();
    router.registerProvider(createMockProvider('failing', 1, ['m1'], 1));
    router.registerProvider(createMockProvider('backup', 2, ['m1']));
    const handler = new FallbackRetryHandler(router, { maxRetries: 0 });

    const req: ChatRequest = { model: 'm1', messages: [{ role: 'user', content: 'hi' }] };
    const res = await handler.execute(req);
    expect(res.content).toBe('from backup');
  });
});

describe('TokenUsageTracker', () => {
  it('records usage and calculates costs', () => {
    const tracker = new TokenUsageTracker({
      dailyLimit: 1000,
      monthlyLimit: 10000,
      alertThreshold: 0.5
    });

    tracker.record({
      id: '1', model: 'gpt-4', content: '',
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      latencyMs: 0
    }, 'openai');

    const daily = tracker.getDailyUsage();
    expect(daily.tokens).toBe(150);
    expect(daily.cost).toBeGreaterThan(0);
  });

  it('tracks provider breakdown', () => {
    const tracker = new TokenUsageTracker({
      dailyLimit: 1000, monthlyLimit: 10000, alertThreshold: 0.5
    });

    tracker.record({ id: '1', model: 'gpt-4', content: '', usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }, latencyMs: 0 }, 'openai');
    tracker.record({ id: '2', model: 'claude-3', content: '', usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }, latencyMs: 0 }, 'anthropic');

    const breakdown = tracker.getProviderBreakdown();
    expect(breakdown.openai.tokens).toBe(20);
    expect(breakdown.anthropic.tokens).toBe(20);
  });
});

describe('RequestResponseCache', () => {
  it('caches and retrieves responses', () => {
    const cache = new RequestResponseCache();
    const req: ChatRequest = { model: 'm1', messages: [{ role: 'user', content: 'hello' }] };
    const res: ChatResponse = { id: '1', model: 'm1', content: 'hi', usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, latencyMs: 0 };

    cache.set(req, res);
    const cached = cache.get(req);
    expect(cached?.content).toBe('hi');
  });

  it('returns undefined for expired entries', () => {
    const cache = new RequestResponseCache(-1);
    const req: ChatRequest = { model: 'm1', messages: [{ role: 'user', content: 'hello' }] };
    const res: ChatResponse = { id: '1', model: 'm1', content: 'hi', usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, latencyMs: 0 };

    cache.set(req, res);
    expect(cache.get(req)).toBeUndefined();
  });
});

describe('RequestLogger', () => {
  it('logs requests and responses', () => {
    const logger = new RequestLogger();
    const req: ChatRequest = { model: 'm1', messages: [{ role: 'user', content: 'hi' }] };
    const id = logger.logRequest(req);

    logger.logResponse(id, { id: 'r1', model: 'm1', content: 'hello', usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, latencyMs: 0 }, 100);
    expect(logger.getLogs().length).toBe(1);
    expect(logger.getStats().totalRequests).toBe(1);
    expect(logger.getStats().successRate).toBe(1);
  });
});

describe('LLMGateway', () => {
  it('routes chat through gateway', async () => {
    const gateway = new LLMGateway();
    gateway.registerProvider(createMockProvider('openai', 1, ['gpt-4']));
    gateway.addRoutingRule({ modelPattern: /^gpt/, providerName: 'openai' });

    const res = await gateway.chat({ model: 'gpt-4', messages: [{ role: 'user', content: 'test' }] });
    expect(res.content).toContain('from openai');
  });

  it('returns cached response on duplicate request', async () => {
    const gateway = new LLMGateway({ cacheTTLMs: 60000 });
    gateway.registerProvider(createMockProvider('openai', 1, ['gpt-4']));

    const req: ChatRequest = { model: 'gpt-4', messages: [{ role: 'user', content: 'cache test' }] };
    const res1 = await gateway.chat(req);
    const res2 = await gateway.chat(req);
    expect(res2.id).toContain('cached');
  });

  it('generates usage report', async () => {
    const gateway = new LLMGateway();
    gateway.registerProvider(createMockProvider('openai', 1, ['gpt-4']));

    await gateway.chat({ model: 'gpt-4', messages: [{ role: 'user', content: 'report' }] });
    const report = gateway.getUsageReport();
    expect(report.stats.totalRequests).toBeGreaterThan(0);
    expect(report.providerBreakdown.openai).toBeDefined();
  });
});

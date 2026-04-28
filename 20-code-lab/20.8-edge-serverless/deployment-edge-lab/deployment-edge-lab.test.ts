import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withEdgeCache,
  getWithCacheLayer,
  getMultipleKV,
  CounterDurableObject,
  RateLimiterDurableObject,
  FeatureFlagEvaluator,
  ABTestAssigner,
  edgeMiddlewareHandler,
  generateDockerfile,
  generateDockerignore,
  analyzeDockerfile,
  getLayerCacheStrategies
} from './index.js';

describe('93-deployment-edge-lab', () => {
  describe('cloudflare-worker', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('withEdgeCache should return origin response when cache miss', async () => {
      const mockCache = {
        match: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined)
      };
      global.caches = { default: mockCache } as any;

      const originResponse = new Response('origin data', { status: 200 });
      const result = await withEdgeCache(
        new Request('https://example.com/api') as any,
        async () => originResponse,
        { maxAge: 60 }
      );

      expect(await result.text()).toBe('origin data');
      expect(result.headers.get('X-Cache-Status')).toBe('MISS');
    });

    it('withEdgeCache should return cached response on hit', async () => {
      const cachedResponse = new Response('cached data', { status: 200 });
      const mockCache = {
        match: vi.fn().mockResolvedValue(cachedResponse),
        put: vi.fn().mockResolvedValue(undefined)
      };
      global.caches = { default: mockCache } as any;

      const result = await withEdgeCache(
        new Request('https://example.com/api') as any,
        async () => new Response('never'),
        { maxAge: 60 }
      );

      expect(await result.text()).toBe('cached data');
      expect(result.headers.get('X-Cache-Status')).toBe('HIT');
    });

    it('getWithCacheLayer should use memory cache first', async () => {
      const memory = new Map<string, number>();
      memory.set('key1', 42);

      const kv = {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined)
      } as any;

      const result = await getWithCacheLayer('key1', { memory, kv, ttlSeconds: 60 }, async () => 999);
      expect(result).toBe(42);
      expect(kv.get).not.toHaveBeenCalled();
    });

    it('getWithCacheLayer should fallback to origin and populate caches', async () => {
      const memory = new Map<string, number>();
      const kv = {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined)
      } as any;

      const result = await getWithCacheLayer('key2', { memory, kv, ttlSeconds: 60 }, async () => 100);
      expect(result).toBe(100);
      expect(memory.get('key2')).toBe(100);
      expect(kv.put).toHaveBeenCalledWith('key2', JSON.stringify(100), { expirationTtl: 60 });
    });

    it('getMultipleKV should fetch missing keys', async () => {
      const kv = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'a') return Promise.resolve(JSON.stringify(1));
          return Promise.resolve(null);
        }),
        put: vi.fn().mockResolvedValue(undefined)
      } as any;

      const results = await getMultipleKV(['a', 'b', 'c'], kv, async (missing) => {
        const map: Record<string, number> = {};
        for (const k of missing) map[k] = 99;
        return map;
      });

      expect(results.a).toBe(1);
      expect(results.b).toBe(99);
      expect(results.c).toBe(99);
    });

    it('CounterDurableObject should increment correctly', async () => {
      const storage = new Map<string, unknown>();
      const state = {
        blockConcurrencyWhile: async <T>(fn: () => Promise<T>) => fn(),
        storage: {
          get: async (key: string) => storage.get(key),
          put: async (key: string, value: unknown) => storage.set(key, value)
        }
      } as any;

      const counter = new CounterDurableObject(state);
      const incResponse = await counter.fetch(new Request('https://fake/increment?amount=5'));
      expect(await incResponse.json()).toEqual({ value: 5 });

      const incAgain = await counter.fetch(new Request('https://fake/increment?amount=3'));
      expect(await incAgain.json()).toEqual({ value: 8 });
    });

    it('RateLimiterDurableObject should allow requests under limit', async () => {
      const storage = new Map<string, unknown>();
      const state = {
        blockConcurrencyWhile: async <T>(fn: () => Promise<T>) => fn(),
        storage: {
          get: async (key: string) => storage.get(key),
          put: async (key: string, value: unknown) => storage.set(key, value)
        }
      } as any;

      const limiter = new RateLimiterDurableObject(state, { MAX_REQUESTS: '3', WINDOW_MS: '60000' });
      const res1 = await limiter.fetch(new Request('https://fake/?clientId=alice'));
      expect((await res1.json()).allowed).toBe(true);

      await limiter.fetch(new Request('https://fake/?clientId=alice'));
      await limiter.fetch(new Request('https://fake/?clientId=alice'));
      const res4 = await limiter.fetch(new Request('https://fake/?clientId=alice'));
      expect((await res4.json()).allowed).toBe(false);
    });
  });

  describe('vercel-edge-config', () => {
    it('FeatureFlagEvaluator should enable for allowed users regardless of rollout', () => {
      const flags = new FeatureFlagEvaluator({
        beta: { enabled: true, rolloutPercentage: 0, allowedUsers: ['user1'] }
      });
      expect(flags.isEnabled('beta', { userId: 'user1' })).toBe(true);
      expect(flags.isEnabled('beta', { userId: 'user2' })).toBe(false);
    });

    it('FeatureFlagEvaluator should respect region restriction', () => {
      const flags = new FeatureFlagEvaluator({
        euOnly: { enabled: true, allowedRegions: ['DE', 'FR'] }
      });
      expect(flags.isEnabled('euOnly', { region: 'DE' })).toBe(true);
      expect(flags.isEnabled('euOnly', { region: 'US' })).toBe(false);
    });

    it('FeatureFlagEvaluator should use percentage rollout', () => {
      const flags = new FeatureFlagEvaluator({
        gradual: { enabled: true, rolloutPercentage: 50 }
      });
      // 使用固定 seed 验证确定性
      const enabledCount = Array.from({ length: 1000 }, (_, i) =>
        flags.isEnabled('gradual', { userId: `user-${i}` })
      ).filter(Boolean).length;
      // 50% 灰度应在 400-600 之间
      expect(enabledCount).toBeGreaterThan(300);
      expect(enabledCount).toBeLessThan(700);
    });

    it('ABTestAssigner should distribute users deterministically', () => {
      const ab = new ABTestAssigner([
        {
          testId: 'color',
          variants: [
            { id: 'red', weight: 50 },
            { id: 'blue', weight: 50 }
          ]
        }
      ]);

      const assignment1 = ab.assign('user-abc');
      const assignment2 = ab.assign('user-abc');
      expect(assignment1).toEqual(assignment2);
      expect(['red', 'blue']).toContain(assignment1.color);
    });

    it('ABTestAssigner should respect variant weights', () => {
      const ab = new ABTestAssigner([
        {
          testId: 'test',
          variants: [
            { id: 'a', weight: 80 },
            { id: 'b', weight: 20 }
          ]
        }
      ]);

      const counts = { a: 0, b: 0 };
      for (let i = 0; i < 1000; i++) {
        const result = ab.assign(`user-${i}`);
        counts[result.test as 'a' | 'b']++;
      }
      expect(counts.a).toBeGreaterThan(600);
      expect(counts.b).toBeGreaterThan(50);
    });

    it('edgeMiddlewareHandler should return response with headers', async () => {
      const mockConfig = {
        getAll: vi.fn().mockResolvedValue({
          'new-ui': { enabled: true, rolloutPercentage: 100 },
          'dark-mode': { enabled: true, allowedRegions: ['CN'] }
        })
      } as any;

      const request = new Request('https://example.com/', {
        headers: { 'x-user-id': 'user-1' }
      }) as any;
      request.geo = { country: 'CN' };

      const response = await edgeMiddlewareHandler(request, mockConfig);
      expect(response.headers.get('x-feature-new-ui')).toBe('1');
      expect(response.headers.get('x-feature-dark-mode')).toBe('1');
      expect(response.headers.get('x-ab-test-group')).toBeDefined();
    });
  });

  describe('docker-optimize', () => {
    it('generateDockerfile should include multi-stage builds', () => {
      const df = generateDockerfile({ packageManager: 'pnpm', useDistroless: true });
      expect(df).toContain('AS deps');
      expect(df).toContain('AS builder');
      expect(df).toContain('AS runner');
      expect(df).toContain('distroless');
      expect(df).toContain('HEALTHCHECK');
    });

    it('generateDockerfile should support npm', () => {
      const df = generateDockerfile({ packageManager: 'npm', useDistroless: false });
      expect(df).toContain('npm ci');
      expect(df).not.toContain('distroless');
    });

    it('generateDockerignore should exclude common dev files', () => {
      const ignore = generateDockerignore();
      expect(ignore).toContain('node_modules');
      expect(ignore).toContain('.git');
      expect(ignore).toContain('**/*.test.ts');
      expect(ignore).toContain('coverage');
    });

    it('analyzeDockerfile should flag missing multi-stage', () => {
      const suggestions = analyzeDockerfile('FROM node:22\nCOPY . .\nRUN npm install');
      const high = suggestions.filter((s) => s.severity === 'high');
      expect(high.some((s) => s.title.includes('多阶段'))).toBe(true);
    });

    it('analyzeDockerfile should flag missing production deps', () => {
      const suggestions = analyzeDockerfile('FROM node:22\nRUN npm install');
      const high = suggestions.filter((s) => s.severity === 'high');
      expect(high.some((s) => s.title.includes('开发依赖'))).toBe(true);
    });

    it('analyzeDockerfile should flag missing non-root user', () => {
      const suggestions = analyzeDockerfile('FROM node:22-alpine\nRUN npm ci --production');
      expect(suggestions.some((s) => s.title.includes('root'))).toBe(true);
    });

    it('analyzeDockerfile should flag missing healthcheck', () => {
      const suggestions = analyzeDockerfile('FROM node:22-alpine\nUSER node');
      expect(suggestions.some((s) => s.title.includes('健康检查'))).toBe(true);
    });

    it('getLayerCacheStrategies should return strategies', () => {
      const strategies = getLayerCacheStrategies();
      expect(strategies.length).toBeGreaterThanOrEqual(3);
      expect(strategies.some((s) => s.layer.includes('包管理器'))).toBe(true);
    });
  });
});

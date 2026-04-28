/**
 * @file Vercel Edge Config / Edge Function 模式
 * @category Deployment & Edge → Vercel Edge
 * @difficulty medium
 * @tags vercel, edge-config, feature-flags, ab-testing
 */

// ============================================================================
// 1. Edge Config 客户端模拟
// ============================================================================

export interface EdgeConfigItem {
  value: unknown;
  updatedAt: number;
}

export interface EdgeConfigClient {
  get<T = unknown>(key: string): Promise<T | undefined>;
  getAll<T = Record<string, unknown>>(): Promise<T>;
  has(key: string): Promise<boolean>;
}

/**
 * 简易 Edge Config 客户端（模拟 @vercel/edge-config）
 * 生产环境应直接使用官方 SDK
 */
export class VercelEdgeConfig implements EdgeConfigClient {
  private baseUrl: string;
  private token: string;
  private cache = new Map<string, unknown>();

  constructor(connectionString: string) {
    // 解析 edge-config://token@id 格式
    const match = connectionString.match(/edge-config:\/\/([^@]+)@(.+)/);
    if (!match) throw new Error('无效的 Edge Config 连接字符串');
    this.token = match[1]!;
    const configId = match[2]!;
    this.baseUrl = `https://edge-config.vercel.com/${configId}`;
  }

  private async fetchConfig(): Promise<Record<string, unknown>> {
    const response = await fetch(this.baseUrl, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    if (!response.ok) throw new Error(`Edge Config 读取失败: ${response.status}`);
    return (await response.json()) as Record<string, unknown>;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    // 优先读取本地缓存
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    const all = await this.fetchConfig();
    // 回写缓存
    for (const [k, v] of Object.entries(all)) {
      this.cache.set(k, v);
    }
    return all[key] as T | undefined;
  }

  async getAll<T = Record<string, unknown>>(): Promise<T> {
    const all = await this.fetchConfig();
    for (const [k, v] of Object.entries(all)) {
      this.cache.set(k, v);
    }
    return all as T;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /** 清除本地缓存 */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// 2. 特性开关 (Feature Flags)
// ============================================================================

export interface FeatureFlag {
  /** 开关状态 */
  enabled: boolean;
  /** 灰度比例 0-1 */
  rolloutPercentage?: number;
  /** 允许的用户白名单 */
  allowedUsers?: string[];
  /** 允许的地理位置 */
  allowedRegions?: string[];
}

export interface FeatureFlagsConfig {
  [flagName: string]: FeatureFlag;
}

/**
 * 特性开关评估器，支持百分比灰度、用户白名单、地域限制
 */
export class FeatureFlagEvaluator {
  private config: FeatureFlagsConfig;

  constructor(config: FeatureFlagsConfig) {
    this.config = { ...config };
  }

  /**
   * 评估特性开关是否对当前用户生效
   * @param flagName 开关名称
   * @param context 评估上下文
   */
  isEnabled(
    flagName: string,
    context: {
      userId?: string;
      region?: string;
      // 用于百分比灰度的稳定哈希值，默认使用 userId
      hashSeed?: string;
    } = {}
  ): boolean {
    const flag = this.config[flagName];
    if (!flag) return false;
    if (!flag.enabled) return false;

    // 白名单优先
    if (flag.allowedUsers && context.userId && flag.allowedUsers.includes(context.userId)) {
      return true;
    }

    // 地域限制
    if (flag.allowedRegions && context.region && !flag.allowedRegions.includes(context.region)) {
      return false;
    }

    // 百分比灰度
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const seed = context.hashSeed ?? context.userId ?? '';
      const hash = this.fnv1a(seed + flagName);
      const percentage = (hash % 10000) / 100; // 0.00 - 99.99
      return percentage < flag.rolloutPercentage;
    }

    return true;
  }

  /**
   * FNV-1a 哈希，用于稳定的百分比灰度计算
   */
  private fnv1a(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * 从 Edge Config 加载特性开关配置
   */
  static async fromEdgeConfig(client: EdgeConfigClient): Promise<FeatureFlagEvaluator> {
    const config = await client.getAll<FeatureFlagsConfig>();
    return new FeatureFlagEvaluator(config);
  }
}

// ============================================================================
// 3. A/B 测试分组
// ============================================================================

export interface ABTestVariant {
  id: string;
  weight: number;
  config?: Record<string, unknown>;
}

export interface ABTest {
  testId: string;
  variants: ABTestVariant[];
}

/**
 * A/B 测试分组器，基于用户 ID 的确定性哈希分配
 */
export class ABTestAssigner {
  private tests: ABTest[];

  constructor(tests: ABTest[]) {
    this.tests = tests;
  }

  /**
   * 为用户分配实验组
   * @returns 每个实验分配的 variant id
   */
  assign(userId: string): Record<string, string> {
    const result: Record<string, string> = {};

    for (const test of this.tests) {
      const hash = this.fnv1a(`${userId}:${test.testId}`);
      const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
      let point = (hash % totalWeight);

      for (const variant of test.variants) {
        point -= variant.weight;
        if (point < 0) {
          result[test.testId] = variant.id;
          break;
        }
      }
    }

    return result;
  }

  /**
   * 获取用户在某实验中的完整 variant 配置
   */
  getVariantConfig(userId: string, testId: string): ABTestVariant['config'] | undefined {
    const assignment = this.assign(userId);
    const variantId = assignment[testId];
    if (!variantId) return undefined;

    const test = this.tests.find((t) => t.testId === testId);
    return test?.variants.find((v) => v.id === variantId)?.config;
  }

  private fnv1a(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * 从 Edge Config 加载 A/B 测试配置
   */
  static async fromEdgeConfig(client: EdgeConfigClient): Promise<ABTestAssigner> {
    const tests = await client.getAll<ABTest[]>();
    return new ABTestAssigner(Array.isArray(tests) ? tests : []);
  }
}

// ============================================================================
// 4. Edge Function 处理器模板
// ============================================================================

export interface EdgeFunctionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface EdgeFunctionRequest extends Request {
  geo?: {
    city?: string;
    country?: string;
    region?: string;
    latitude?: string;
    longitude?: string;
  };
  ip?: string;
}

/**
 * 基于 Edge Config 的中间件处理器：注入特性开关与 A/B 分组到响应头
 */
export async function edgeMiddlewareHandler(
  request: EdgeFunctionRequest,
  configClient: EdgeConfigClient
): Promise<Response> {
  const userId = request.headers.get('x-user-id') ?? 'anonymous';
  const region = request.geo?.country ?? 'unknown';

  // 加载配置
  const [flags, abTests] = await Promise.all([
    FeatureFlagEvaluator.fromEdgeConfig(configClient),
    ABTestAssigner.fromEdgeConfig(configClient)
  ]);

  const assignments = abTests.assign(userId);

  // 构建注入头
  const headers = new Headers();
  headers.set('x-feature-new-ui', flags.isEnabled('new-ui', { userId, region }) ? '1' : '0');
  headers.set('x-feature-dark-mode', flags.isEnabled('dark-mode', { userId, region }) ? '1' : '0');
  headers.set('x-ab-test-group', JSON.stringify(assignments));

  // 返回原始请求 + 注入头（实际中间件应调用 next() 或回源）
  return new Response(null, {
    status: 200,
    headers
  });
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== Vercel Edge Config / Edge Function 演示 ===\n');

  // 1. 特性开关
  console.log('--- 1. 特性开关评估 ---');
  const flags = new FeatureFlagEvaluator({
    'new-ui': { enabled: true, rolloutPercentage: 10, allowedUsers: ['admin'] },
    'dark-mode': { enabled: true, allowedRegions: ['CN', 'US'] }
  });

  console.log('admin 用户 new-ui:', flags.isEnabled('new-ui', { userId: 'admin' }));
  console.log('普通用户 new-ui (10%灰度):', flags.isEnabled('new-ui', { userId: 'user-123' }));
  console.log('CN 用户 dark-mode:', flags.isEnabled('dark-mode', { region: 'CN' }));

  // 2. A/B 测试
  console.log('\n--- 2. A/B 测试分组 ---');
  const ab = new ABTestAssigner([
    {
      testId: 'button-color',
      variants: [
        { id: 'control', weight: 50 },
        { id: 'blue', weight: 25, config: { color: '#0000ff' } },
        { id: 'green', weight: 25, config: { color: '#00ff00' } }
      ]
    }
  ]);

  const assignment = ab.assign('user-alice');
  console.log('user-alice 分组:', assignment);
  console.log('user-alice 配置:', ab.getVariantConfig('user-alice', 'button-color'));

  console.log('\n=== 演示结束 ===\n');
}

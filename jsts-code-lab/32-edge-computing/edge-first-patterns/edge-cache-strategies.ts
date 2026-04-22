/**
 * =============================================================================
 * 边缘缓存策略实践 — edge-cache-strategies.ts
 * =============================================================================
 *
 * 本模块演示在边缘计算环境中 4 种核心缓存策略的 TypeScript 实现。
 * 边缘缓存是边缘架构的核心能力之一，它直接决定了延迟、成本和可用性。
 *
 * 使用的策略：
 * 1. Cache-First          — 边缘缓存优先，未命中时回源获取
 * 2. Stale-While-Revalidate — 返回过期缓存同时异步刷新，保证低延迟
 * 3. Cache-Then-Network   — 先返回缓存，再异步更新（适合非关键数据）
 * 4. Edge-Invalidation    — 基于标签/事件的主动缓存失效机制
 *
 * 所有策略均使用 Map 模拟边缘 KV 存储，便于在 Node.js 环境中直接运行演示。
 * 每个策略都包含「错误做法（反例）」和「正确模式（生产级）」的对比。
 * =============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义区
// ─────────────────────────────────────────────────────────────────────────────

/** 缓存条目元数据结构 */
interface CacheEntry<T> {
  value: T;
  /** 条目创建时间（Unix 时间戳，毫秒） */
  createdAt: number;
  /** 条目的 TTL（毫秒） */
  ttlMs: number;
  /** 可选的标签列表，用于按标签批量失效 */
  tags?: string[];
  /** 最后访问时间 */
  lastAccessedAt: number;
  /** 访问计数 */
  accessCount: number;
}

/** 模拟的边缘 KV 存储接口 */
interface EdgeKVStore {
  get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  put<T>(key: string, entry: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<boolean>;
  listByTag(tag: string): Promise<string[]>;
}

/** 模拟的源站（Origin）响应 */
interface OriginResponse<T> {
  data: T;
  headers: Record<string, string>;
}

/** 源站获取函数类型 */
type OriginFetcher<T> = () => Promise<OriginResponse<T>>;

// ─────────────────────────────────────────────────────────────────────────────
// 模拟边缘 KV 存储实现（基于内存 Map）
// ─────────────────────────────────────────────────────────────────────────────

class SimulatedEdgeKV implements EdgeKVStore {
  private store = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    // 更新访问统计
    entry.lastAccessedAt = Date.now();
    entry.accessCount += 1;
    return entry as CacheEntry<T>;
  }

  async put<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    this.store.set(key, entry as CacheEntry<unknown>);
    // 维护标签索引
    if (entry.tags && entry.tags.length > 0) {
      for (const tag of entry.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (entry?.tags) {
      for (const tag of entry.tags) {
        this.tagIndex.get(tag)?.delete(key);
      }
    }
    return this.store.delete(key);
  }

  async listByTag(tag: string): Promise<string[]> {
    const keys = this.tagIndex.get(tag);
    return keys ? Array.from(keys) : [];
  }

  /** 辅助：清空存储（测试用） */
  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
  }

  /** 辅助：获取当前存储大小 */
  size(): number {
    return this.store.size;
  }
}

// 全局单例 KV 实例（模拟单个边缘节点的本地缓存）
const edgeKV = new SimulatedEdgeKV();

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────────

/** 判断缓存条目是否已过期 */
function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.createdAt > entry.ttlMs;
}

/** 判断缓存条目是否处于「可返回的过期状态」（用于 Stale-While-Revalidate） */
function isStale<T>(entry: CacheEntry<T>, staleMultiplier = 2): boolean {
  return Date.now() - entry.createdAt > entry.ttlMs * staleMultiplier;
}

/** 模拟网络延迟 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 模拟源站请求（带随机延迟） */
async function fetchFromOrigin<T>(resourceName: string, data: T): Promise<OriginResponse<T>> {
  const latency = Math.floor(Math.random() * 100) + 50; // 50-150ms
  await delay(latency);
  return {
    data,
    headers: {
      'x-origin-latency': `${latency}ms`,
      'x-fetched-at': new Date().toISOString(),
    },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 策略 1: Cache-First（缓存优先，未命中回源）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：直接在业务逻辑中混合缓存和回源逻辑，没有统一的缓存策略抽象。
 * 问题：
 *   1. 代码耦合严重，每次请求都重复写缓存判断逻辑
 *   2. 没有统一的缓存键命名规范
 *   3. 没有处理并发回源（thundering herd）问题
 *   4. 错误直接抛出，没有降级逻辑
 */
async function cacheFirst_BAD<T>(
  key: string,
  fetcher: OriginFetcher<T>,
  ttlMs: number
): Promise<T> {
  const cached = await edgeKV.get<T>(key);
  if (cached && !isExpired(cached)) {
    return cached.value;
  }
  // 并发时多个请求同时回源，造成源站压力（惊群效应）
  const response = await fetcher();
  await edgeKV.put(key, {
    value: response.data,
    createdAt: Date.now(),
    ttlMs,
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });
  return response.data;
}

/**
 * ✅ 正确做法：Cache-First 生产级实现
 * 改进点：
 *   1. 引入「正在回源」锁（in-flight deduplication），防止惊群效应
 *   2. 统一的缓存键生成策略
 *   3. 支持标签化失效
 *   4. 回源失败时返回过期缓存作为降级（stale-if-error）
 *   5. 完整的日志输出，便于调试
 */
class CacheFirstStrategy {
  private inFlight = new Map<string, Promise<unknown>>();

  async get<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    options: {
      ttlMs: number;
      tags?: string[];
      /** 回源失败时是否允许返回过期缓存 */
      staleIfError?: boolean;
    }
  ): Promise<T> {
    const { ttlMs, tags, staleIfError = true } = options;

    // 1. 尝试从边缘缓存读取
    const cached = await edgeKV.get<T>(key);

    if (cached && !isExpired(cached)) {
      console.log(`  [Cache-First] ✅ 缓存命中: key="${key}", 已存活 ${Date.now() - cached.createdAt}ms`);
      return cached.value;
    }

    // 2. 缓存未命中或已过期，检查是否有正在进行的回源请求（去重）
    const existingFetch = this.inFlight.get(key) as Promise<T> | undefined;
    if (existingFetch) {
      console.log(`  [Cache-First] ⏳ 检测到并发回源请求，复用 in-flight: key="${key}"`);
      return existingFetch;
    }

    // 3. 执行回源（带锁）
    const fetchPromise = this.doFetch(key, fetcher, cached, ttlMs, tags, staleIfError);
    this.inFlight.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inFlight.delete(key);
    }
  }

  private async doFetch<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    cached: CacheEntry<T> | undefined,
    ttlMs: number,
    tags: string[] | undefined,
    staleIfError: boolean
  ): Promise<T> {
    try {
      console.log(`  [Cache-First] 🌐 缓存未命中，回源获取: key="${key}"`);
      const response = await fetcher();

      await edgeKV.put(key, {
        value: response.data,
        createdAt: Date.now(),
        ttlMs,
        tags,
        lastAccessedAt: Date.now(),
        accessCount: 1,
      });

      console.log(`  [Cache-First] 💾 回源成功，已写入缓存: key="${key}", TTL=${ttlMs}ms`);
      return response.data;
    } catch (error) {
      console.error(`  [Cache-First] ❌ 回源失败: key="${key}", error=${(error as Error).message}`);

      // 4. 降级：返回过期缓存（如果允许）
      if (staleIfError && cached) {
        console.log(`  [Cache-First] 🛡️ 降级返回过期缓存: key="${key}"`);
        return cached.value;
      }

      throw error;
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 策略 2: Stale-While-Revalidate（返回过期缓存同时异步刷新）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：直接等待回源完成才返回，用户感受到的是源站延迟。
 * 问题：
 *   1. 缓存过期后所有请求都要等待回源
 *   2. 没有异步刷新机制
 *   3. 用户体验差（延迟波动大）
 */
async function staleWhileRevalidate_BAD<T>(
  key: string,
  fetcher: OriginFetcher<T>,
  ttlMs: number
): Promise<T> {
  const cached = await edgeKV.get<T>(key);
  if (cached && !isExpired(cached)) {
    return cached.value;
  }
  // 缓存过期了，直接同步回源，用户必须等待
  const response = await fetcher();
  await edgeKV.put(key, {
    value: response.data,
    createdAt: Date.now(),
    ttlMs,
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });
  return response.data;
}

/**
 * ✅ 正确做法：Stale-While-Revalidate 生产级实现
 * 核心思想：
 *   - 在缓存的「新鲜期」内直接返回缓存（fast path）
 *   - 在「过期但未陈腐期（stale period）」内返回缓存 + 异步触发回源
 *   - 在「陈腐期」外才同步回源
 *
 * 改进点：
 *   1. 用户几乎永远感受不到回源延迟（P99 极低）
 *   2. 异步刷新使用 fire-and-forget 模式
 *   3. 防止并发异步刷新（使用刷新锁）
 */
class StaleWhileRevalidateStrategy {
  private refreshing = new Set<string>();

  async get<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    options: {
      ttlMs: number;
      /** 可容忍的陈腐期倍数（默认 2 倍 TTL） */
      staleMultiplier?: number;
      tags?: string[];
    }
  ): Promise<T> {
    const { ttlMs, staleMultiplier = 2, tags } = options;
    const now = Date.now();

    const cached = await edgeKV.get<T>(key);

    if (!cached) {
      // 无缓存，必须同步回源
      console.log(`  [SWR] 🌐 无缓存，同步回源: key="${key}"`);
      return this.fetchAndStore(key, fetcher, ttlMs, tags);
    }

    const age = now - cached.createdAt;

    if (age <= ttlMs) {
      // 新鲜期内，直接返回
      console.log(`  [SWR] ✅ 缓存新鲜: key="${key}", age=${age}ms < TTL=${ttlMs}ms`);
      return cached.value;
    }

    if (age <= ttlMs * staleMultiplier) {
      // 陈腐期内，返回缓存 + 异步刷新
      console.log(
        `  [SWR] 🟡 缓存过期但可接受 (stale): key="${key}", age=${age}ms, 返回旧数据并异步刷新`
      );
      this.triggerBackgroundRefresh(key, fetcher, ttlMs, tags);
      return cached.value;
    }

    // 超过陈腐期，同步回源
    console.log(`  [SWR] 🔴 缓存过旧，同步回源: key="${key}", age=${age}ms`);
    return this.fetchAndStore(key, fetcher, ttlMs, tags);
  }

  private async fetchAndStore<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    ttlMs: number,
    tags: string[] | undefined
  ): Promise<T> {
    const response = await fetcher();
    await edgeKV.put(key, {
      value: response.data,
      createdAt: Date.now(),
      ttlMs,
      tags,
      lastAccessedAt: Date.now(),
      accessCount: 1,
    });
    return response.data;
  }

  private triggerBackgroundRefresh<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    ttlMs: number,
    tags: string[] | undefined
  ): void {
    if (this.refreshing.has(key)) {
      console.log(`  [SWR] ⏳ 已有正在进行的后台刷新，跳过: key="${key}"`);
      return;
    }

    this.refreshing.add(key);
    console.log(`  [SWR] 🔄 触发后台刷新: key="${key}"`);

    this.fetchAndStore(key, fetcher, ttlMs, tags)
      .then(() => {
        console.log(`  [SWR] ✅ 后台刷新完成: key="${key}"`);
      })
      .catch((err) => {
        console.error(`  [SWR] ❌ 后台刷新失败: key="${key}", error=${(err as Error).message}`);
      })
      .finally(() => {
        this.refreshing.delete(key);
      });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 策略 3: Cache-Then-Network（先返回缓存，再异步更新）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：完全不使用缓存，每次都等待网络请求完成。
 * 问题：
 *   1. 延迟高
 *   2. 没有利用边缘缓存的优势
 *   3. 用户体验差
 */
async function cacheThenNetwork_BAD<T>(key: string, fetcher: OriginFetcher<T>): Promise<T> {
  // 错误：即使缓存存在也不使用
  const response = await fetcher();
  return response.data;
}

/**
 * ✅ 正确做法：Cache-Then-Network 生产级实现
 * 适用场景：
 *   - 数据不需要强一致性（如新闻列表、排行榜、配置信息）
 *   - 用户希望页面立即响应
 *   - 可以接受「先看到旧数据，几秒后自动更新」的体验
 *
 * 设计要点：
 *   1. 总是先返回缓存（即使过期）
 *   2. 同时异步发起网络请求
 *   3. 提供回调机制通知调用方数据已更新
 *   4. 新数据写入缓存供下次使用
 */
class CacheThenNetworkStrategy {
  async get<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    options: {
      ttlMs: number;
      tags?: string[];
      /** 数据更新后的回调 */
      onUpdate?: (newData: T) => void;
    }
  ): Promise<T> {
    const { ttlMs, tags, onUpdate } = options;

    const cached = await edgeKV.get<T>(key);

    if (!cached) {
      // 无缓存，必须等待网络
      console.log(`  [CTN] 🌐 无缓存，同步获取: key="${key}"`);
      const data = await this.fetchAndStore(key, fetcher, ttlMs, tags);
      return data;
    }

    // 总是先返回缓存
    console.log(`  [CTN] ✅ 立即返回缓存: key="${key}", 同时发起异步更新`);

    // 异步更新（不阻塞返回）
    this.fetchAndStore(key, fetcher, ttlMs, tags)
      .then((newData) => {
        // 检查数据是否真正发生了变化（简单 JSON 对比）
        const hasChanged = JSON.stringify(newData) !== JSON.stringify(cached.value);
        if (hasChanged) {
          console.log(`  [CTN] 🔄 数据已更新: key="${key}"`);
          onUpdate?.(newData);
        } else {
          console.log(`  [CTN] ➖ 数据无变化: key="${key}"`);
        }
      })
      .catch((err) => {
        console.error(`  [CTN] ❌ 异步更新失败: key="${key}", error=${(err as Error).message}`);
      });

    return cached.value;
  }

  private async fetchAndStore<T>(
    key: string,
    fetcher: OriginFetcher<T>,
    ttlMs: number,
    tags: string[] | undefined
  ): Promise<T> {
    const response = await fetcher();
    await edgeKV.put(key, {
      value: response.data,
      createdAt: Date.now(),
      ttlMs,
      tags,
      lastAccessedAt: Date.now(),
      accessCount: 1,
    });
    return response.data;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 策略 4: Edge-Invalidation（基于标签/事件的主动缓存失效）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：使用基于 TTL 的被动失效，数据更新后等待 TTL 过期。
 * 问题：
 *   1. 数据更新后用户仍可能看到旧数据长达一个 TTL 周期
 *   2. 对于需要强一致性的业务不可接受
 *   3. 无法按需精确失效
 */
async function edgeInvalidation_BAD(key: string): Promise<void> {
  // 错误：只能等待 TTL 自然过期，或者粗暴地全量清空缓存
  // 在真实场景中，这可能意味着用户下单后仍看到旧库存数长达 5 分钟
  console.log(`  [Invalidation-BAD] 等待 TTL 自然过期，无法主动失效 key="${key}"`);
}

/**
 * ✅ 正确做法：Edge-Invalidation 生产级实现
 * 核心能力：
 *   1. 按 Key 精确失效
 *   2. 按 Tag 批量失效（如 "product:*", "user:123:*"）
 *   3. 基于事件订阅的自动失效（如数据库变更事件）
 *   4. 支持「软失效」（标记为 stale，下次请求触发刷新）
 *
 * 在真实边缘平台（如 Cloudflare Workers）中，通常通过:
 *   - Cache API + Purge by Tag
 *   - Kafka / Webhook 事件监听
 *   - 数据库 CDC (Change Data Capture) 触发失效
 */
class EdgeInvalidationStrategy {
  /** 按精确 Key 失效 */
  async invalidateByKey(key: string): Promise<boolean> {
    const existed = await edgeKV.delete(key);
    console.log(
      `  [Invalidation] 🗑️ 按 Key 失效: "${key}", 命中=${existed}`
    );
    return existed;
  }

  /** 按 Tag 批量失效 */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = await edgeKV.listByTag(tag);
    let count = 0;
    for (const key of keys) {
      const existed = await edgeKV.delete(key);
      if (existed) count++;
    }
    console.log(
      `  [Invalidation] 🗑️ 按 Tag 失效: "${tag}", 影响 ${count}/${keys.length} 个条目`
    );
    return count;
  }

  /** 按 Tag 软失效（标记为过期，下次请求触发刷新而非返回过期数据） */
  async softInvalidateByTag(tag: string): Promise<number> {
    const keys = await edgeKV.listByTag(tag);
    let count = 0;
    for (const key of keys) {
      const entry = await edgeKV.get<unknown>(key);
      if (entry) {
        // 将 createdAt 设为 0，使缓存立即过期（但保留数据用于 stale-if-error）
        const softExpiredEntry: CacheEntry<unknown> = {
          ...entry,
          createdAt: 0,
          ttlMs: entry.ttlMs,
        };
        await edgeKV.put(key, softExpiredEntry);
        count++;
      }
    }
    console.log(
      `  [Invalidation] 🟡 按 Tag 软失效: "${tag}", 影响 ${count}/${keys.length} 个条目`
    );
    return count;
  }

  /** 模拟「基于事件的自动失效」— 监听数据库变更事件 */
  async handleDatabaseEvent(event: {
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    rowId: string;
    /** 变更影响的标签 */
    affectedTags: string[];
  }): Promise<void> {
    console.log(
      `  [Invalidation] 📡 收到数据库变更事件: ${event.operation} ${event.table}(id=${event.rowId})`
    );

    for (const tag of event.affectedTags) {
      await this.invalidateByTag(tag);
    }
  }

  /** 预热缓存 — 在失效后主动填充热点数据 */
  async warmUp<T>(
    entries: Array<{ key: string; fetcher: OriginFetcher<T>; ttlMs: number; tags?: string[] }>
  ): Promise<void> {
    console.log(`  [Invalidation] 🔥 开始缓存预热，共 ${entries.length} 个条目`);
    await Promise.all(
      entries.map(async ({ key, fetcher, ttlMs, tags }) => {
        try {
          const response = await fetcher();
          await edgeKV.put(key, {
            value: response.data,
            createdAt: Date.now(),
            ttlMs,
            tags,
            lastAccessedAt: Date.now(),
            accessCount: 1,
          });
          console.log(`  [Invalidation] 🔥 预热完成: "${key}"`);
        } catch (err) {
          console.error(`  [Invalidation] ❌ 预热失败: "${key}", error=${(err as Error).message}`);
        }
      })
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Demo 演示函数
// ═════════════════════════════════════════════════════════════════════════════

/** 生成演示用的商品数据 */
function generateProductData(productId: string): { id: string; name: string; price: number; stock: number; version: number } {
  return {
    id: productId,
    name: `商品-${productId}`,
    price: 199 + Math.floor(Math.random() * 800),
    stock: Math.floor(Math.random() * 100),
    version: 1,
  };
}

export async function demo(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    边缘缓存策略演示 — Edge Cache Strategies                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ── 演示 1: Cache-First ────────────────────────────────────────────────────
  console.log('▶▶▶ 策略 1: Cache-First（缓存优先，未命中回源）◀◀◀\n');

  const cacheFirst = new CacheFirstStrategy();
  const productKey = 'product:p123';

  console.log('--- 第一轮请求（缓存未命中，回源）---');
  const result1 = await cacheFirst.get(productKey, () => fetchFromOrigin(productKey, generateProductData('p123')), {
    ttlMs: 5000,
    tags: ['product:p123', 'category:electronics'],
  });
  console.log('  返回结果:', result1);

  console.log('\n--- 第二轮请求（缓存命中）---');
  const result2 = await cacheFirst.get(productKey, () => fetchFromOrigin(productKey, generateProductData('p123')), {
    ttlMs: 5000,
    tags: ['product:p123', 'category:electronics'],
  });
  console.log('  返回结果:', result2);

  console.log('\n--- 并发请求测试（3 个并发请求，应只触发 1 次回源）---');
  const concurrentResults = await Promise.all([
    cacheFirst.get('product:p999', () => fetchFromOrigin('product:p999', generateProductData('p999')), {
      ttlMs: 5000,
    }),
    cacheFirst.get('product:p999', () => fetchFromOrigin('product:p999', generateProductData('p999')), {
      ttlMs: 5000,
    }),
    cacheFirst.get('product:p999', () => fetchFromOrigin('product:p999', generateProductData('p999')), {
      ttlMs: 5000,
    }),
  ]);
  console.log(`  3 个并发请求返回了相同的库存数据（防止了惊群效应）`);
  console.log('  结果 1 stock:', (concurrentResults[0] as { stock: number }).stock);
  console.log('  结果 2 stock:', (concurrentResults[1] as { stock: number }).stock);
  console.log('  结果 3 stock:', (concurrentResults[2] as { stock: number }).stock);

  // ── 演示 2: Stale-While-Revalidate ─────────────────────────────────────────
  console.log('\n\n▶▶▶ 策略 2: Stale-While-Revalidate（返回过期缓存同时异步刷新）◀◀◀\n');

  const swr = new StaleWhileRevalidateStrategy();
  const swrKey = 'config:app-settings';

  // 先写入一个即将过期的缓存
  await edgeKV.put(swrKey, {
    value: { theme: 'dark', version: 1, features: ['a', 'b'] },
    createdAt: Date.now() - 4000, // 4 秒前创建
    ttlMs: 3000, // TTL 3 秒，已过期 1 秒
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });

  console.log('--- 请求 1：缓存已过期但在 stale 窗口内（返回旧数据 + 异步刷新）---');
  const swrResult1 = await swr.get(
    swrKey,
    () => fetchFromOrigin(swrKey, { theme: 'dark', version: 2, features: ['a', 'b', 'c'] }),
    { ttlMs: 3000, staleMultiplier: 2 }
  );
  console.log('  同步返回结果:', swrResult1);

  // 等待后台刷新完成
  await delay(300);

  console.log('\n--- 请求 2：后台刷新已完成，现在返回新数据 ---');
  const swrResult2 = await swr.get(
    swrKey,
    () => fetchFromOrigin(swrKey, { theme: 'dark', version: 3, features: ['a', 'b', 'c', 'd'] }),
    { ttlMs: 3000, staleMultiplier: 2 }
  );
  console.log('  同步返回结果:', swrResult2);

  // ── 演示 3: Cache-Then-Network ─────────────────────────────────────────────
  console.log('\n\n▶▶▶ 策略 3: Cache-Then-Network（先返回缓存，再异步更新）◀◀◀\n');

  const ctn = new CacheThenNetworkStrategy();
  const ctnKey = 'news:latest';

  // 预置旧缓存
  await edgeKV.put(ctnKey, {
    value: { headlines: ['旧新闻 A', '旧新闻 B'], updatedAt: '2024-01-01T00:00:00Z' },
    createdAt: Date.now(),
    ttlMs: 60000,
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });

  console.log('--- 请求：立即返回缓存，同时异步更新 ---');
  let updatedData: unknown = null;
  const ctnResult = await ctn.get(
    ctnKey,
    () =>
      fetchFromOrigin(ctnKey, {
        headlines: ['实时新闻 X', '实时新闻 Y', '实时新闻 Z'],
        updatedAt: new Date().toISOString(),
      }),
    {
      ttlMs: 60000,
      onUpdate: (newData) => {
        updatedData = newData;
        console.log('  📢 [onUpdate 回调] 页面/组件已收到更新通知:', newData);
      },
    }
  );
  console.log('  同步返回结果:', ctnResult);

  // 等待异步更新完成
  await delay(300);
  if (!updatedData) {
    console.log('  ⚠️ 异步更新未触发回调（可能是数据无变化或网络延迟）');
  }

  // ── 演示 4: Edge-Invalidation ──────────────────────────────────────────────
  console.log('\n\n▶▶▶ 策略 4: Edge-Invalidation（基于标签/事件的主动缓存失效）◀◀◀\n');

  const invalidator = new EdgeInvalidationStrategy();

  // 预置一批带标签的缓存
  await edgeKV.put('product:x1', {
    value: generateProductData('x1'),
    createdAt: Date.now(),
    ttlMs: 3600000,
    tags: ['product:x1', 'category:shoes', 'brand:nike'],
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });
  await edgeKV.put('product:x2', {
    value: generateProductData('x2'),
    createdAt: Date.now(),
    ttlMs: 3600000,
    tags: ['product:x2', 'category:shoes', 'brand:adidas'],
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });
  await edgeKV.put('product:x3', {
    value: generateProductData('x3'),
    createdAt: Date.now(),
    ttlMs: 3600000,
    tags: ['product:x3', 'category:hats', 'brand:nike'],
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });

  console.log(`当前缓存条目数: ${edgeKV.size()}`);

  console.log('\n--- 按 Key 精确失效 ---');
  await invalidator.invalidateByKey('product:x1');
  console.log(`当前缓存条目数: ${edgeKV.size()}`);

  console.log('\n--- 按 Tag 批量失效（category:shoes）---');
  await invalidator.invalidateByTag('category:shoes');
  console.log(`当前缓存条目数: ${edgeKV.size()}`);

  // 重新填充数据用于软失效演示
  await edgeKV.put('product:y1', {
    value: generateProductData('y1'),
    createdAt: Date.now(),
    ttlMs: 3600000,
    tags: ['product:y1', 'category:electronics', 'brand:apple'],
    lastAccessedAt: Date.now(),
    accessCount: 1,
  });

  console.log('\n--- 按 Tag 软失效（brand:apple）---');
  await invalidator.softInvalidateByTag('brand:apple');

  console.log('\n--- 模拟数据库 CDC 事件触发的自动失效 ---');
  await invalidator.handleDatabaseEvent({
    table: 'products',
    operation: 'UPDATE',
    rowId: 'z100',
    affectedTags: ['product:z100', 'category:watches'],
  });

  console.log('\n--- 缓存预热演示 ---');
  await invalidator.warmUp([
    {
      key: 'hot:homepage-banner',
      fetcher: () => fetchFromOrigin('hot:homepage-banner', { bannerId: 'bn-001', url: '/img/banner.jpg' }),
      ttlMs: 300000,
      tags: ['hot', 'homepage'],
    },
    {
      key: 'hot:top-products',
      fetcher: () => fetchFromOrigin('hot:top-products', [{ id: 'p1' }, { id: 'p2' }]),
      ttlMs: 300000,
      tags: ['hot', 'products'],
    },
  ]);

  console.log(`\n演示结束，最终缓存条目数: ${edgeKV.size()}`);
  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}

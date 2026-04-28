/**
 * @file LRU Cache
 * @category Caching → LRU Cache
 * @difficulty medium
 * @tags cache, lru, eviction, linked-list
 *
 * @description
 * 基于 Map 和双向链表实现的 LRU (Least Recently Used) 缓存
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface LRUCacheOptions {
  maxSize: number;
}

export interface CacheEntry<V> {
  key: string;
  value: V;
  timestamp: number;
}

// ============================================================================
// LRU 节点
// ============================================================================

class LRUNode<V> {
  prev: LRUNode<V> | null = null;
  next: LRUNode<V> | null = null;

  constructor(
    public key: string,
    public value: V
  ) {}
}

// ============================================================================
// LRU Cache 实现
// ============================================================================

export class LRUCache<V = unknown> {
  private cache = new Map<string, LRUNode<V>>();
  private head: LRUNode<V> | null = null;
  private tail: LRUNode<V> | null = null;
  private maxSize: number;

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize;
  }

  /**
   * 获取值并移动到最近使用
   */
  get(key: string): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    this.moveToHead(node);
    return node.value;
  }

  /**
   * 设置值
   */
  set(key: string, value: V): void {
    const existing = this.cache.get(key);

    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node = new LRUNode(key, value);
    this.cache.set(key, node);
    this.addToHead(node);

    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除键
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * 获取当前大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  /**
   * 获取最近使用的键（从最近到最久）
   */
  keys(): string[] {
    const keys: string[] = [];
    let current = this.head;

    while (current) {
      keys.push(current.key);
      current = current.next;
    }

    return keys;
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; maxSize: number; oldestKey: string | null; newestKey: string | null } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      oldestKey: this.tail?.key ?? null,
      newestKey: this.head?.key ?? null
    };
  }

  private addToHead(node: LRUNode<V>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: LRUNode<V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private evictLRU(): void {
    if (!this.tail) return;

    this.cache.delete(this.tail.key);
    this.removeNode(this.tail);
  }
}

// ============================================================================
// LRU-K Cache（考虑访问频率）
// ============================================================================

export class LRUKCache<V = unknown> {
  private history = new Map<string, number[]>(); // key -> access timestamps
  private cache = new Map<string, V>();
  private maxSize: number;
  private k: number;

  constructor(maxSize: number, k = 2) {
    this.maxSize = maxSize;
    this.k = k;
  }

  /**
   * 获取值
   */
  get(key: string): V | undefined {
    const timestamps = this.history.get(key);
    if (!timestamps) return undefined;

    timestamps.push(Date.now());

    // 只保留最近的 k 次访问时间
    if (timestamps.length > this.k) {
      timestamps.shift();
    }

    return this.cache.get(key);
  }

  /**
   * 设置值
   */
  set(key: string, value: V): void {
    const timestamps = this.history.get(key);

    if (timestamps) {
      timestamps.push(Date.now());
      this.cache.set(key, value);
    } else {
      this.history.set(key, [Date.now()]);

      if (this.cache.size >= this.maxSize) {
        this.evict();
      }

      this.cache.set(key, value);
    }
  }

  /**
   * 删除键
   */
  delete(key: string): boolean {
    this.history.delete(key);
    return this.cache.delete(key);
  }

  private evict(): void {
    let evictKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, timestamps] of this.history) {
      // 如果访问次数不足 k 次，优先淘汰
      if (timestamps.length < this.k) {
        evictKey = key;
        break;
      }

      // 否则淘汰第 k 次访问最早的
      const kthTime = timestamps[0];
      if (kthTime < oldestTime) {
        oldestTime = kthTime;
        evictKey = key;
      }
    }

    if (evictKey) {
      this.history.delete(evictKey);
      this.cache.delete(evictKey);
    }
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== LRU Cache ===\n');

  const cache = new LRUCache<string>({ maxSize: 3 });

  cache.set('a', 'apple');
  cache.set('b', 'banana');
  cache.set('c', 'cherry');
  console.log('Initial keys:', cache.keys());

  cache.get('a'); // 访问 a，使其变为最近使用
  cache.set('d', 'date'); // 触发淘汰，应该淘汰 b
  console.log('After adding d:', cache.keys());

  console.log('\n--- LRU-K Cache ---');
  const lruk = new LRUKCache<string>(3, 2);
  lruk.set('a', 'apple');
  lruk.set('b', 'banana');
  lruk.get('a'); // 第二次访问 a
  lruk.set('c', 'cherry');
  lruk.set('d', 'date'); // 应该淘汰 b（访问次数不足 k 次）
  console.log('LRU-K keys after eviction: a, c, d (b evicted)');
}

/**
 * @file 浏览器观察器模式实战
 * @category Web APIs → Observers
 * @difficulty medium
 * @tags intersectionobserver, resizeobserver, mutationobserver
 */

// ============================================================================
// 1. IntersectionObserver：懒加载 + 无限滚动
// ============================================================================

export interface LazyLoadOptions {
  /** 提前加载的距离（px） */
  rootMargin?: string;
  /** 触发阈值 */
  threshold?: number;
  /** 元素进入视口时的回调 */
  onEnter: (element: Element) => void;
  /** 元素离开视口时的回调（可选） */
  onLeave?: (element: Element) => void;
}

/**
 * 懒加载观察器：当元素进入视口时触发回调
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver;
  private callbacks = new WeakMap<Element, { onEnter: (el: Element) => void; onLeave?: (el: Element) => void }>();

  constructor(options: Omit<LazyLoadOptions, 'onEnter' | 'onLeave'>) {
    this.observer = new IntersectionObserver((entries) => this.handleEntries(entries), {
      rootMargin: options.rootMargin ?? '50px',
      threshold: options.threshold ?? 0
    });
  }

  private handleEntries(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const cb = this.callbacks.get(entry.target);
      if (!cb) continue;

      if (entry.isIntersecting) {
        cb.onEnter(entry.target);
      } else {
        cb.onLeave?.(entry.target);
      }
    }
  }

  /**
   * 观察一个元素
   */
  observe(element: Element, callbacks: { onEnter: (el: Element) => void; onLeave?: (el: Element) => void }): void {
    this.callbacks.set(element, callbacks);
    this.observer.observe(element);
  }

  /**
   * 停止观察元素
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }

  /**
   * 销毁观察器
   */
  disconnect(): void {
    this.observer.disconnect();
  }
}

// ============================================================================
// 2. ResizeObserver：响应式元素尺寸追踪
// ============================================================================

export interface SizeChangeEntry {
  element: Element;
  contentRect: DOMRectReadOnly;
  borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  contentBoxSize: ReadonlyArray<ResizeObserverSize>;
}

/**
 * 防抖的 ResizeObserver，避免高频 resize 回调导致性能问题
 */
export class DebouncedResizeObserver {
  private observer: ResizeObserver;
  private timerMap = new WeakMap<Element, ReturnType<typeof setTimeout>>();
  private delay: number;

  constructor(callback: (entries: SizeChangeEntry[]) => void, delay = 100) {
    this.delay = delay;
    this.observer = new ResizeObserver((entries) => {
      const debouncedEntries: SizeChangeEntry[] = [];

      for (const entry of entries) {
        const existingTimer = this.timerMap.get(entry.target);
        if (existingTimer) clearTimeout(existingTimer);

        const timer = setTimeout(() => {
          debouncedEntries.push({
            element: entry.target,
            contentRect: entry.contentRect,
            borderBoxSize: entry.borderBoxSize,
            contentBoxSize: entry.contentBoxSize
          });
          // 批量回调
          if (debouncedEntries.length > 0) {
            callback([...debouncedEntries]);
            debouncedEntries.length = 0;
          }
        }, this.delay);

        this.timerMap.set(entry.target, timer);
      }
    });
  }

  observe(element: Element): void {
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    const timer = this.timerMap.get(element);
    if (timer) clearTimeout(timer);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

/**
 * 简易版 ResizeObserver 封装，直接回调
 */
export class ElementSizeTracker {
  private observer: ResizeObserver;
  private sizes = new Map<Element, { width: number; height: number }>();

  constructor(onChange?: (element: Element, size: { width: number; height: number }) => void) {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = { width: entry.contentRect.width, height: entry.contentRect.height };
        this.sizes.set(entry.target, size);
        onChange?.(entry.target, size);
      }
    });
  }

  observe(element: Element): void {
    this.observer.observe(element);
  }

  getSize(element: Element): { width: number; height: number } | undefined {
    return this.sizes.get(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.sizes.clear();
  }
}

// ============================================================================
// 3. MutationObserver：DOM 变化监听
// ============================================================================

export interface DOMChangeRecord {
  type: 'childList' | 'attributes' | 'characterData';
  target: Node;
  addedNodes: Node[];
  removedNodes: Node[];
  attributeName?: string;
  oldValue?: string;
}

/**
 * DOM 变化观察器，支持批量去重与过滤
 */
export class DOMChangeObserver {
  private observer: MutationObserver;
  private buffer: DOMChangeRecord[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushDelay: number;

  constructor(
    private callback: (records: DOMChangeRecord[]) => void,
    options: { flushDelay?: number } = {}
  ) {
    this.flushDelay = options.flushDelay ?? 50;
    this.observer = new MutationObserver((records) => this.handleRecords(records));
  }

  private handleRecords(records: MutationRecord[]): void {
    for (const record of records) {
      this.buffer.push({
        type: record.type as DOMChangeRecord['type'],
        target: record.target,
        addedNodes: Array.from(record.addedNodes),
        removedNodes: Array.from(record.removedNodes),
        attributeName: record.attributeName ?? undefined,
        oldValue: record.oldValue ?? undefined
      });
    }

    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), this.flushDelay);
  }

  private flush(): void {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    this.callback(batch);
  }

  /**
   * 开始观察目标节点
   */
  observe(target: Node, options?: MutationObserverInit): void {
    this.observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      ...options
    });
  }

  /**
   * 停止观察
   */
  disconnect(): void {
    this.observer.disconnect();
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.buffer = [];
  }

  /**
   * 立即刷新缓冲区的记录
   */
  takeRecords(): DOMChangeRecord[] {
    const batch = this.buffer;
    this.buffer = [];
    return batch;
  }
}

// ============================================================================
// 4. 组合观察器：性能监控面板
// ============================================================================

export interface PerformanceMetrics {
  /** 视口内元素数量 */
  visibleElements: number;
  /** 容器尺寸变化次数 */
  resizeCount: number;
  /** DOM 变更次数 */
  domChangeCount: number;
}

/**
 * 组合多个 Observer 实现页面性能/状态监控
 */
export class PageMonitor {
  private intersectionObserver: IntersectionObserver;
  private resizeObserver: ResizeObserver;
  private mutationObserver: MutationObserver;

  private metrics: PerformanceMetrics = {
    visibleElements: 0,
    resizeCount: 0,
    domChangeCount: 0
  };

  private watchedElements = new Set<Element>();
  private callback: ((metrics: PerformanceMetrics) => void) | null = null;

  constructor() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.watchedElements.add(entry.target);
        } else {
          this.watchedElements.delete(entry.target);
        }
      }
      this.metrics.visibleElements = this.watchedElements.size;
      this.emit();
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.metrics.resizeCount++;
      this.emit();
    });

    this.mutationObserver = new MutationObserver(() => {
      this.metrics.domChangeCount++;
      this.emit();
    });
  }

  private emit(): void {
    this.callback?.({ ...this.metrics });
  }

  /**
   * 设置指标变化回调
   */
  onUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.callback = callback;
  }

  /**
   * 监控一个元素是否可见
   */
  trackVisibility(element: Element): void {
    this.intersectionObserver.observe(element);
  }

  /**
   * 监控容器尺寸变化
   */
  trackResize(element: Element): void {
    this.resizeObserver.observe(element);
  }

  /**
   * 监控 DOM 变化
   */
  trackDOMChanges(target: Node): void {
    this.mutationObserver.observe(target, { childList: true, subtree: true });
  }

  /**
   * 获取当前指标快照
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 销毁所有观察器
   */
  destroy(): void {
    this.intersectionObserver.disconnect();
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.watchedElements.clear();
    this.callback = null;
  }
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== 浏览器观察器模式演示 ===\n');

  // 注意：以下演示需要在真实浏览器 DOM 环境中运行
  // 此处仅展示 API 调用方式

  console.log('--- 1. LazyLoadObserver ---');
  const lazyObserver = new LazyLoadObserver({ rootMargin: '100px' });
  console.log('LazyLoadObserver 已创建，调用 observe(element, { onEnter: ... }) 即可使用');
  lazyObserver.disconnect();

  console.log('\n--- 2. ElementSizeTracker ---');
  const sizeTracker = new ElementSizeTracker((el, size) => {
    console.log(`元素尺寸变化: ${size.width}x${size.height}`);
  });
  console.log('ElementSizeTracker 已创建');
  sizeTracker.disconnect();

  console.log('\n--- 3. DOMChangeObserver ---');
  const domObserver = new DOMChangeObserver((records) => {
    console.log(`收到 ${records.length} 条 DOM 变更记录`);
  });
  console.log('DOMChangeObserver 已创建');
  domObserver.disconnect();

  console.log('\n--- 4. PageMonitor ---');
  const monitor = new PageMonitor();
  monitor.onUpdate((metrics) => {
    console.log('页面指标:', metrics);
  });
  console.log('PageMonitor 已创建');
  monitor.destroy();

  console.log('\n=== 演示结束 ===\n');
}

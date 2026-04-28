/**
 * @file 渲染性能优化
 * @category Performance → Rendering Optimization
 * @difficulty hard
 * @tags performance, rendering, raf, virtual-scrolling, dom-optimization
 * 
 * @description
 * DOM 渲染性能优化技术：
 * - requestAnimationFrame 调度
 * - 虚拟滚动 (Virtual Scrolling)
 * - DOM 操作批处理
 * - 减少重排重绘
 */

// Node.js / 测试环境兼容性存根
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  (globalThis as unknown as { requestAnimationFrame: (cb: () => void) => ReturnType<typeof setTimeout> }).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  (globalThis as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame = (id: number) => { clearTimeout(id as unknown as ReturnType<typeof setTimeout>); };
}
if (typeof globalThis.document === 'undefined') {
  (globalThis as unknown as { document: object }).document = {
    createDocumentFragment: () => ({ appendChild: () => {} }),
    createElement: (_tag: string) => ({
      tagName: _tag,
      style: { cssText: '' },
      appendChild: () => {},
      dispatchEvent: () => {}
    })
  };
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof globalThis.Image === 'undefined') {
  (globalThis as unknown as { Image: unknown }).Image = class ImageStub {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _src = '';
    get src() { return this._src; }
    set src(value: string) {
      this._src = value;
      setTimeout(() => this.onload?.(), 0);
    }
  };
}
if (typeof globalThis.Event === 'undefined') {
  (globalThis as unknown as { Event: unknown }).Event = class EventStub {
    type: string;
    constructor(type: string) { this.type = type; }
  };
}

// ============================================================================
// 1. requestAnimationFrame 调度器
// ============================================================================

export class RAFScheduler {
  private frameId: number | null = null;
  private tasks: (() => void)[] = [];
  private running = false;

  addTask(task: () => void): void {
    this.tasks.push(task);
    this.schedule();
  }

  addPriorityTask(task: () => void): void {
    this.tasks.unshift(task);
    this.schedule();
  }

  private schedule(): void {
    if (this.running) return;
    
    this.running = true;
    this.frameId = requestAnimationFrame(() => { this.execute(); });
  }

  private execute(): void {
    const startTime = performance.now();
    const budget = 16; // 16ms = 60fps

    while (this.tasks.length > 0) {
      // 检查是否超时
      if (performance.now() - startTime > budget) {
        this.schedule();
        return;
      }

      const task = this.tasks.shift();
      task?.();
    }

    this.running = false;
    this.frameId = null;
  }

  clear(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.tasks = [];
    this.running = false;
  }
}

// ============================================================================
// 2. 虚拟滚动 (Virtual Scrolling)
// ============================================================================

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number; // 额外渲染的项目数
}

export interface VirtualScrollState {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  offset: number;
  totalHeight: number;
}

export class VirtualScroller {
  private config: VirtualScrollConfig;
  private scrollTop = 0;

  constructor(config: VirtualScrollConfig) {
    this.config = {
      overscan: 3,
      ...config
    };
  }

  updateScroll(scrollTop: number): VirtualScrollState {
    this.scrollTop = scrollTop;
    return this.calculateVisibleRange();
  }

  private calculateVisibleRange(): VirtualScrollState {
    const { itemHeight, containerHeight, totalItems, overscan } = this.config;

    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - overscan!);
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + visibleItems + overscan! * 2
    );

    return {
      startIndex,
      endIndex,
      visibleItems,
      offset: startIndex * itemHeight,
      totalHeight: totalItems * itemHeight
    };
  }

  // 获取项目样式
  getItemStyle(index: number): Record<string, string> {
    return {
      height: `${this.config.itemHeight}px`,
      transform: `translateY(${index * this.config.itemHeight}px)`,
      position: 'absolute' as const,
      top: '0',
      left: '0',
      right: '0'
    };
  }

  // 估算滚动位置
  estimateScrollPosition(index: number): number {
    return index * this.config.itemHeight;
  }
}

// ============================================================================
// 3. DOM 操作批处理 (DocumentFragment)
// ============================================================================

export class DOMBatcher {
  private operations: (() => void)[] = [];
  private scheduled = false;

  add(operation: () => void): void {
    this.operations.push(operation);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    // 批量执行所有 DOM 操作
    const fragment = document.createDocumentFragment();
    
    for (const op of this.operations) {
      op();
    }

    this.operations = [];
    this.scheduled = false;
  }

  // 创建批量插入方法
  createBatchAppender(parent: HTMLElement): {
    append: (element: HTMLElement) => void;
    commit: () => void;
  } {
    const fragment = document.createDocumentFragment();
    
    return {
      append: (element: HTMLElement) => {
        fragment.appendChild(element);
      },
      commit: () => {
        parent.appendChild(fragment);
      }
    };
  }
}

// ============================================================================
// 4. 减少重排重绘
// ============================================================================

export class LayoutOptimizer {
  // 读取和写入分离
  private readQueue: (() => void)[] = [];
  private writeQueue: (() => void)[] = [];

  read(fn: () => void): void {
    this.readQueue.push(fn);
    this.schedule();
  }

  write(fn: () => void): void {
    this.writeQueue.push(fn);
    this.schedule();
  }

  private scheduled = false;

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.processQueues();
    });
  }

  private processQueues(): void {
    // 先执行所有读取（避免强制同步布局）
    for (const fn of this.readQueue) {
      fn();
    }
    this.readQueue = [];

    // 再执行所有写入
    for (const fn of this.writeQueue) {
      fn();
    }
    this.writeQueue = [];

    this.scheduled = false;
  }

  // 批量样式修改
  batchStyles(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>
  ): void {
    // 使用 cssText 一次性设置多个样式
    const styleStrings = Object.entries(styles).map(
      ([prop, value]) => `${this.camelToKebab(prop)}: ${value}`
    );
    element.style.cssText += ';' + styleStrings.join(';');
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }
}

// ============================================================================
// 5. Intersection Observer 懒加载
// ============================================================================

export class LazyLoader<T extends HTMLElement> {
  private observer: IntersectionObserver;
  private elements = new Map<T, (entry: IntersectionObserverEntry) => void>();

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      (entries) => { this.handleEntries(entries); },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  observe(element: T, callback: (entry: IntersectionObserverEntry) => void): void {
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: T): void {
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  private handleEntries(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const callback = this.elements.get(entry.target as T);
      if (callback && entry.isIntersecting) {
        callback(entry);
        // 可选：加载后取消观察
        // this.unobserve(entry.target as T);
      }
    }
  }

  disconnect(): void {
    this.observer.disconnect();
    this.elements.clear();
  }
}

// ============================================================================
// 6. 图像懒加载与优化
// ============================================================================

export interface ImageOptimizationConfig {
  placeholderColor?: string;
  blurAmount?: number;
  transitionDuration?: number;
}

export class ImageOptimizer {
  private lazyLoader: LazyLoader<HTMLImageElement>;

  constructor() {
    this.lazyLoader = new LazyLoader<HTMLImageElement>();
  }

  setupLazyImage(
    img: HTMLImageElement,
    src: string,
    options: ImageOptimizationConfig = {}
  ): void {
    const { placeholderColor = '#f0f0f0' } = options;

    // 设置占位样式
    img.style.backgroundColor = placeholderColor;
    img.style.transition = 'opacity 0.3s';
    img.style.opacity = '0';

    this.lazyLoader.observe(img, () => {
      this.loadImage(img, src);
    });
  }

  private loadImage(img: HTMLImageElement, src: string): void {
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      img.style.opacity = '1';
      img.style.backgroundColor = 'transparent';
    };
    
    tempImg.onerror = () => {
      img.dispatchEvent(new Event('error'));
    };
    
    tempImg.src = src;
  }

  // 响应式图片 srcset
  generateSrcSet(
    baseUrl: string,
    widths: number[]
  ): string {
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  }

  disconnect(): void {
    this.lazyLoader.disconnect();
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 渲染性能优化演示 ===\n');

  // RAF 调度器
  console.log('--- requestAnimationFrame 调度 ---');
  const scheduler = new RAFScheduler();
  
  for (let i = 0; i < 10; i++) {
    scheduler.addTask(() => {
      console.log(`  执行任务 ${i}`);
    });
  }

  // 虚拟滚动
  console.log('\n--- 虚拟滚动计算 ---');
  const scroller = new VirtualScroller({
    itemHeight: 50,
    containerHeight: 400,
    totalItems: 10000,
    overscan: 5
  });

  const state = scroller.updateScroll(500);
  console.log(`滚动位置: 500px`);
  console.log(`可见范围: ${state.startIndex} - ${state.endIndex}`);
  console.log(`渲染项目数: ${state.endIndex - state.startIndex + 1}`);
  console.log(`总高度: ${state.totalHeight}px`);

  // 布局优化器
  console.log('\n--- 读写分离 ---');
  const optimizer = new LayoutOptimizer();
  
  optimizer.read(() => {
    console.log('  读取布局信息 (offsetHeight等)');
  });
  
  optimizer.write(() => {
    console.log('  写入样式修改');
  });

  console.log('\n渲染优化演示完成');
}

// ============================================================================
// 导出
// ============================================================================

;

;

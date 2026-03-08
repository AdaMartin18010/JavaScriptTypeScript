/**
 * @file 响应式编程
 * @category Data Flow → Reactive Programming
 * @difficulty hard
 * @tags reactive, observable, stream, rxjs, signal
 * 
 * @description
 * 响应式编程模式实现：
 * - Observable / Observer 模式
 * - 信号 (Signal) 系统
 * - 数据流转换
 * - 自动依赖追踪
 */

// ============================================================================
// 1. Observable 实现 (简化版 RxJS)
// ============================================================================

export type Observer<T> = {
  next: (value: T) => void;
  error?: (err: Error) => void;
  complete?: () => void;
};

export type TeardownLogic = (() => void) | { unsubscribe(): void };

export class Observable<T> {
  constructor(private subscribeFn: (observer: Observer<T>) => TeardownLogic | void) {}

  subscribe(observer: Partial<Observer<T>>): { unsubscribe(): void } {
    const safeObserver: Observer<T> = {
      next: observer.next || (() => {}),
      error: observer.error || (() => {}),
      complete: observer.complete || (() => {})
    };

    const teardown = this.subscribeFn(safeObserver);

    return {
      unsubscribe: () => {
        if (typeof teardown === 'function') {
          teardown();
        } else if (teardown && 'unsubscribe' in teardown) {
          teardown.unsubscribe();
        }
      }
    };
  }

  // 转换操作符
  map<U>(fn: (value: T) => U): Observable<U> {
    return new Observable<U>(observer => {
      return this.subscribe({
        next: value => observer.next(fn(value)),
        error: err => observer.error?.(err),
        complete: () => observer.complete?.()
      });
    });
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>(observer => {
      return this.subscribe({
        next: value => {
          if (predicate(value)) {
            observer.next(value);
          }
        },
        error: err => observer.error?.(err),
        complete: () => observer.complete?.()
      });
    });
  }

  // 合并多个 Observable
  static merge<T>(...observables: Observable<T>[]): Observable<T> {
    return new Observable<T>(observer => {
      const subscriptions = observables.map(obs => 
        obs.subscribe({
          next: v => observer.next(v),
          error: e => observer.error?.(e),
          complete: () => {
            // 简化处理：任一完成就全部完成
            observer.complete?.();
          }
        })
      );

      return {
        unsubscribe: () => subscriptions.forEach(s => s.unsubscribe())
      };
    });
  }

  // 创建静态方法
  static of<T>(...values: T[]): Observable<T> {
    return new Observable<T>(observer => {
      values.forEach(v => observer.next(v));
      observer.complete?.();
    });
  }

  static from<T>(iterable: Iterable<T>): Observable<T> {
    return new Observable<T>(observer => {
      try {
        for (const item of iterable) {
          observer.next(item);
        }
        observer.complete?.();
      } catch (err) {
        observer.error?.(err as Error);
      }
    });
  }

  // 时间相关操作符
  debounceTime(ms: number): Observable<T> {
    return new Observable<T>(observer => {
      let timeoutId: ReturnType<typeof setTimeout>;

      return this.subscribe({
        next: value => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => observer.next(value), ms);
        },
        error: err => observer.error?.(err),
        complete: () => observer.complete?.()
      });
    });
  }

  throttleTime(ms: number): Observable<T> {
    return new Observable<T>(observer => {
      let lastEmit = 0;

      return this.subscribe({
        next: value => {
          const now = Date.now();
          if (now - lastEmit >= ms) {
            lastEmit = now;
            observer.next(value);
          }
        },
        error: err => observer.error?.(err),
        complete: () => observer.complete?.()
      });
    });
  }
}

// ============================================================================
// 2. 信号系统 (Signal-based Reactivity)
// ============================================================================

export interface Signal<T> {
  (): T;  // 读取
  set(value: T): void;  // 写入
  subscribe(fn: (value: T) => void): () => void;  // 订阅
}

export function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const signal = function(): T {
    return value;
  } as Signal<T>;

  signal.set = (newValue: T) => {
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach(fn => fn(value));
    }
  };

  signal.subscribe = (fn: (value: T) => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return signal;
}

// 计算信号 (Computed Signal)
export function createComputed<T>(compute: () => T): Signal<T> {
  const signal = createSignal<T>(compute());
  
  // 简化实现：立即计算
  // 实际应实现依赖追踪
  
  return signal;
}

// 副作用 (Effect)
export function createEffect(fn: () => void, deps: Signal<unknown>[]): void {
  const run = () => fn();
  
  deps.forEach(dep => {
    dep.subscribe(run);
  });
  
  run(); // 立即执行一次
}

// ============================================================================
// 3. 数据流图
// ============================================================================

export interface DataNode<T> {
  id: string;
  value: T;
  sources: string[];
  compute?: (inputs: unknown[]) => T;
}

export class DataFlowGraph {
  private nodes = new Map<string, DataNode<unknown>>();
  private dependents = new Map<string, Set<string>>();

  addNode<T>(node: DataNode<T>): void {
    this.nodes.set(node.id, node as DataNode<unknown>);
    
    // 建立依赖关系
    node.sources.forEach(sourceId => {
      if (!this.dependents.has(sourceId)) {
        this.dependents.set(sourceId, new Set());
      }
      this.dependents.get(sourceId)!.add(node.id);
    });
  }

  // 更新节点值，触发级联更新
  updateNode<T>(id: string, value: T): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.value = value;
    
    // 递归更新依赖节点
    const toUpdate = this.dependents.get(id);
    if (toUpdate) {
      toUpdate.forEach(depId => this.recomputeNode(depId));
    }
  }

  private recomputeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node || !node.compute) return;

    const inputs = node.sources.map(sourceId => 
      this.nodes.get(sourceId)?.value
    );

    node.value = node.compute(inputs);
    
    // 继续级联
    const toUpdate = this.dependents.get(id);
    if (toUpdate) {
      toUpdate.forEach(depId => this.recomputeNode(depId));
    }
  }

  getValue<T>(id: string): T | undefined {
    return this.nodes.get(id)?.value as T;
  }

  // 可视化依赖图
  visualize(): string {
    const lines: string[] = ['数据流图:'];
    
    for (const [id, node] of this.nodes) {
      const deps = node.sources.length > 0 
        ? ` ← ${node.sources.join(', ')}` 
        : '';
      lines.push(`  ${id}: ${JSON.stringify(node.value)}${deps}`);
    }
    
    return lines.join('\n');
  }
}

// ============================================================================
// 4. 状态机 (State Machine)
// ============================================================================

type StateTransition<S, E> = {
  from: S;
  event: E;
  to: S;
  action?: () => void;
};

export class StateMachine<S extends string, E extends string> {
  private state: S;
  private transitions = new Map<string, StateTransition<S, E>>();
  private listeners = new Set<(state: S) => void>();

  constructor(initialState: S) {
    this.state = initialState;
  }

  addTransition(transition: StateTransition<S, E>): void {
    const key = `${transition.from}:${transition.event}`;
    this.transitions.set(key, transition);
  }

  send(event: E): boolean {
    const key = `${this.state}:${event}`;
    const transition = this.transitions.get(key);
    
    if (!transition) {
      console.warn(`No transition for ${this.state} + ${event}`);
      return false;
    }

    this.state = transition.to;
    transition.action?.();
    this.listeners.forEach(fn => fn(this.state));
    
    return true;
  }

  getState(): S {
    return this.state;
  }

  subscribe(fn: (state: S) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // 可视化状态机
  visualize(): string {
    const lines = ['状态机:'];
    lines.push(`  当前状态: ${this.state}`);
    lines.push('  转换规则:');
    
    for (const [key, trans] of this.transitions) {
      lines.push(`    ${trans.from} --[${trans.event}]--> ${trans.to}`);
    }
    
    return lines.join('\n');
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 响应式编程 ===\n');

  // Observable 示例
  console.log('--- Observable ---');
  const numbers$ = Observable.of(1, 2, 3, 4, 5);
  
  const subscription = numbers$
    .map(x => x * 2)
    .filter(x => x > 4)
    .subscribe({
      next: value => console.log(`值: ${value}`),
      complete: () => console.log('完成')
    });

  subscription.unsubscribe();

  // 信号系统示例
  console.log('\n--- 信号系统 ---');
  const count = createSignal(0);
  const doubled = createComputed(() => count() * 2);

  const unsubscribe = count.subscribe(v => {
    console.log(`count 变化: ${v}`);
  });

  count.set(1);
  count.set(2);
  unsubscribe();

  // 数据流图示例
  console.log('\n--- 数据流图 ---');
  const graph = new DataFlowGraph();
  
  graph.addNode({ id: 'a', value: 1, sources: [] });
  graph.addNode({ id: 'b', value: 2, sources: [] });
  graph.addNode({
    id: 'sum',
    value: 0,
    sources: ['a', 'b'],
    compute: ([a, b]) => (a as number) + (b as number)
  });

  console.log(graph.visualize());
  
  graph.updateNode('a', 10);
  console.log('更新 a=10 后:');
  console.log(`sum = ${graph.getValue('sum')}`);

  // 状态机示例
  console.log('\n--- 状态机 ---');
  type TrafficLightState = 'red' | 'yellow' | 'green';
  type TrafficLightEvent = 'timer';

  const trafficLight = new StateMachine<TrafficLightState, TrafficLightEvent>('red');
  
  trafficLight.addTransition({ from: 'red', event: 'timer', to: 'green' });
  trafficLight.addTransition({ from: 'green', event: 'timer', to: 'yellow' });
  trafficLight.addTransition({ from: 'yellow', event: 'timer', to: 'red' });

  console.log(trafficLight.visualize());
  
  console.log(`当前: ${trafficLight.getState()}`);
  trafficLight.send('timer');
  console.log(`切换后: ${trafficLight.getState()}`);
  trafficLight.send('timer');
  console.log(`切换后: ${trafficLight.getState()}`);

  console.log('\n响应式编程要点:');
  console.log('1. Observable 用于处理异步数据流');
  console.log('2. Signal 提供细粒度的响应式更新');
  console.log('3. 数据流图适合复杂的数据依赖关系');
  console.log('4. 状态机适合明确的状态转换场景');
}

// ============================================================================
// 导出
// ============================================================================

export {
  Observable,
  createSignal,
  createComputed,
  createEffect,
  DataFlowGraph,
  StateMachine
};

export type {
  Observer,
  TeardownLogic,
  Signal,
  DataNode,
  StateTransition
};

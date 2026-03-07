/**
 * @file 观察者模式 (Observer Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty easy
 * @tags observer, pub-sub, event-driven, reactive
 * 
 * @description
 * 定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖者自动收到通知
 */

// ============================================================================
// 1. 基础实现
// ============================================================================

type Observer<T> = (data: T) => void;

class Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): () => void {
    this.observers.push(observer);
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer(data));
  }
}

// ============================================================================
// 2. 带事件类型的观察者 (Event Emitter)
// ============================================================================

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventHandler<T> = (payload: T) => void;

class EventEmitter<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: EventHandler<Events[K]>[] } = {};

  on<K extends EventKey<Events>>(
    event: K,
    handler: EventHandler<Events[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);

    return () => this.off(event, handler);
  }

  off<K extends EventKey<Events>>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void {
    const handlers = this.listeners[event];
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<K extends EventKey<Events>>(event: K, payload: Events[K]): void {
    const handlers = this.listeners[event];
    handlers?.forEach(handler => handler(payload));
  }

  once<K extends EventKey<Events>>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void {
    const onceHandler = (payload: Events[K]) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}

// ============================================================================
// 3. 响应式状态管理 (简化版)
// ============================================================================

class ObservableState<T> {
  private _value: T;
  private observers: Set<(value: T, oldValue: T) => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this.notify(newValue, oldValue);
    }
  }

  subscribe(callback: (value: T, oldValue: T) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notify(value: T, oldValue: T): void {
    this.observers.forEach(cb => cb(value, oldValue));
  }
}

// ============================================================================
// 4. 实际应用：数据存储
// ============================================================================

interface StoreEvents {
  'user:login': { userId: string; name: string };
  'user:logout': { userId: string };
  'data:update': { key: string; value: unknown };
}

class Store {
  private emitter = new EventEmitter<StoreEvents>();
  private state = new Map<string, unknown>();

  on = this.emitter.on.bind(this.emitter);
  off = this.emitter.off.bind(this.emitter);

  login(userId: string, name: string): void {
    this.state.set('currentUser', { userId, name });
    this.emitter.emit('user:login', { userId, name });
  }

  logout(): void {
    const user = this.state.get('currentUser') as { userId: string } | undefined;
    if (user) {
      this.state.delete('currentUser');
      this.emitter.emit('user:logout', { userId: user.userId });
    }
  }

  setData(key: string, value: unknown): void {
    this.state.set(key, value);
    this.emitter.emit('data:update', { key, value });
  }

  getData<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }
}

// ============================================================================
// 5. 使用 Proxy 的自动通知
// ============================================================================

function createObservable<T extends object>(
  target: T,
  onChange: (prop: string | symbol, value: unknown) => void
): T {
  return new Proxy(target, {
    set(obj, prop, value) {
      const result = Reflect.set(obj, prop, value);
      onChange(prop, value);
      return result;
    }
  });
}

// ============================================================================
// 导出
// ============================================================================

export {
  Subject,
  EventEmitter,
  ObservableState,
  Store,
  createObservable
};

export type { Observer, EventMap, EventKey, EventHandler, StoreEvents };

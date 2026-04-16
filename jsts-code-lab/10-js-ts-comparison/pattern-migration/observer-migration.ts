/**
 * @file Observer 模式迁移: JavaScript -> TypeScript
 * @category JS/TS Comparison → Pattern Migration
 * @difficulty easy
 * @tags migration, observer, event-emitter, generics, typed-events
 *
 * @description
 * 展示如何将 JavaScript 基于字符串的 EventEmitter 迁移到 TypeScript 的泛型事件映射。
 */

// ============================================================================
// JavaScript 版本: 基于字符串的 EventEmitter
// ============================================================================

/*
class EventEmitterJS {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

const emitter = new EventEmitterJS();
emitter.on('data', (payload) => console.log(payload));
emitter.emit('data', { id: 1 });
// 问题: 事件名拼写错误只能在运行时暴露；payload 无任何类型约束
*/

// ============================================================================
// TypeScript 版本: TypedEmitter<TEventMap> 泛型事件映射
// ============================================================================

type EventCallback<T> = (payload: T) => void;

export class TypedEmitter<TEventMap> {
  private listeners = new Map<keyof TEventMap, EventCallback<unknown>[]>();

  on<K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as EventCallback<unknown>);

    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback as EventCallback<unknown>);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        (callback as EventCallback<TEventMap[K]>)(payload);
      }
    }
  }

  once<K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>
  ): void {
    const unsubscribe = this.on(event, (payload: TEventMap[K]) => {
      callback(payload);
      unsubscribe();
    });
  }
}

// 使用示例
interface AppEvents {
  'user:login': { userId: string; name: string };
  'user:logout': { userId: string };
  'error': { message: string; code: number };
}

export function createAppEmitter(): TypedEmitter<AppEvents> {
  return new TypedEmitter<AppEvents>();
}

// ============================================================================
// 迁移收益
// ============================================================================

/**
 * 1. 事件名在编译期被约束为 TEventMap 的 key，杜绝拼写错误。
 * 2. callback 的 payload 类型根据事件名自动推导。
 * 3. emit 时传入错误类型的 payload 会立即在编译期报错。
 */

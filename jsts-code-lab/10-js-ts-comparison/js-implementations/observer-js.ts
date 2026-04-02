/**
 * @file 观察者模式 - JavaScript vs TypeScript 对比
 * @category JS/TS Comparison → Implementations
 * @difficulty medium
 * @tags comparison, observer-pattern, event-driven, javascript, typescript
 * 
 * @description
 * 观察者模式的 JS/TS 实现对比：
 * - TypeScript: 类型安全的订阅者管理
 * - JavaScript: 动态类型的灵活性
 * - 类型擦除对事件系统的影响
 */

// ============================================================================
// TypeScript 实现 - 类型安全的事件系统
// ============================================================================

// 事件映射接口
type EventMap = {
  [event: string]: any;
};

// 类型安全的事件监听器
type EventListener<T> = (data: T) => void;

export class TypedEventEmitter<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<EventListener<Events[K]>>
  } = {};

  // 订阅事件 - 类型安全的订阅
  on<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    // 返回取消订阅函数
    return () => {
      this.off(event, listener);
    };
  }

  // 取消订阅
  off<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>
  ): void {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件 - 类型检查确保数据格式正确
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // 一次性订阅
  once<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>
  ): void {
    const onceWrapper = (data: Events[K]) => {
      this.off(event, onceWrapper);
      listener(data);
    };
    this.on(event, onceWrapper);
  }

  // 获取监听器数量
  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners[event]?.length || 0;
  }

  // 移除所有监听器
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// 定义具体事件类型
interface UserEvents {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; duration: number };
  'user:update': { userId: string; changes: Partial<{ name: string; email: string }> };
  'error': { message: string; code: number };
}

// 使用示例
export const userEventBus = new TypedEventEmitter<UserEvents>();

// ============================================================================
// JavaScript 实现 - 动态类型
// ============================================================================

/**
 * JavaScript 版本 - 无类型约束
 * 问题:
 * 1. 无法确保事件名正确
 * 2. 无法确保数据格式正确
 * 3. 重构时容易遗漏
 * 4. IDE 无法提供自动补全
 */
class EventEmitterJS {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    return () => this.off(event, listener);
  }

  off(event, listener) {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  once(event, listener) {
    const onceWrapper = (data) => {
      this.off(event, onceWrapper);
      listener(data);
    };
    this.on(event, onceWrapper);
  }
}

// ============================================================================
// JavaScript 防御式实现 - 带运行时检查
// ============================================================================

class EventEmitterJSDefensive {
  constructor() {
    this.listeners = new Map();
    this.validEvents = new Set();
  }

  // 注册有效事件名
  registerEvent(eventName) {
    this.validEvents.add(eventName);
  }

  on(event, listener) {
    // 运行时检查事件名
    if (!this.validEvents.has(event)) {
      console.warn(`Warning: Event "${event}" is not registered`);
    }

    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);

    return () => this.off(event, listener);
  }

  emit(event, data) {
    if (!this.validEvents.has(event)) {
      console.warn(`Warning: Emitting unregistered event "${event}"`);
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for "${event}":`, error);
        }
      });
    }
  }

  // 数据验证
  emitWithValidation(event, data, validator) {
    if (validator && !validator(data)) {
      throw new TypeError(`Invalid data for event "${event}"`);
    }
    this.emit(event, data);
  }
}

// ============================================================================
// 类型擦除对比
// ============================================================================

/**
 * TypeScript 编译后的 JavaScript (概念展示):
 * 
 * 编译前:
 *   class TypedEventEmitter<Events extends EventMap> {
 *     on<K extends keyof Events>(
 *       event: K,
 *       listener: EventListener<Events[K]>
 *     ): () => void { ... }
 *   }
 * 
 * 编译后:
 *   class TypedEventEmitter {
 *     on(event, listener) { ... }  // 泛型和类型参数被擦除
 *   }
 * 
 * 关键区别:
 * - 编译时: TypeScript 确保事件名和数据类型的正确性
 * - 运行时: 两者完全相同，都没有类型信息
 * - 事件类型映射只在编译时存在
 */

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 观察者模式 - JS/TS 对比 ===\n');

  // TypeScript 版本
  console.log('--- TypeScript 版本 (类型安全) ---');
  
  // 订阅事件 - 有自动补全和类型检查
  const unsubscribeLogin = userEventBus.on('user:login', (data) => {
    console.log(`用户登录: ${data.userId} at ${new Date(data.timestamp)}`);
  });

  const unsubscribeUpdate = userEventBus.on('user:update', (data) => {
    console.log(`用户更新: ${data.userId}`, data.changes);
  });

  // 触发事件 - 类型检查确保数据格式正确
  userEventBus.emit('user:login', { 
    userId: 'user-123', 
    timestamp: Date.now() 
  });

  userEventBus.emit('user:update', {
    userId: 'user-123',
    changes: { name: 'Alice', email: 'alice@example.com' }
  });

  // 编译错误示例 (取消注释查看):
  // userEventBus.emit('user:login', { userId: '123' }); // 错误: 缺少 timestamp
  // userEventBus.emit('user:unknown', {}); // 错误: 事件名不存在

  console.log('\n监听器数量:', userEventBus.listenerCount('user:login'));

  // 取消订阅
  unsubscribeLogin();
  console.log('取消订阅后:', userEventBus.listenerCount('user:login'));

  // JavaScript 版本
  console.log('\n--- JavaScript 版本 (动态类型) ---');
  const jsEmitter = new EventEmitterJS();

  jsEmitter.on('user:login', (data) => {
    console.log('JS 用户登录:', data);
  });

  // 可以传入任何数据，没有类型检查
  jsEmitter.emit('user:login', { userId: '123' }); // 缺少字段也不会报错
  jsEmitter.emit('user:login', '错误的字符串数据'); // 类型错误也不会报错
  jsEmitter.emit('user:unknown', {}); // 不存在的事件名也不会报错

  // JavaScript 防御式版本
  console.log('\n--- JavaScript 防御式版本 ---');
  const defensiveEmitter = new EventEmitterJSDefensive();
  
  defensiveEmitter.registerEvent('data:received');
  defensiveEmitter.registerEvent('data:processed');

  defensiveEmitter.on('data:received', (data) => {
    console.log('收到数据:', data);
  });

  defensiveEmitter.emit('data:received', { id: 1, content: 'Hello' });
  defensiveEmitter.emit('unregistered:event', {}); // 会触发警告

  // 对比总结
  console.log('\n--- 对比总结 ---');
  console.log('TypeScript:');
  console.log('  ✅ 编译时检查事件名有效性');
  console.log('  ✅ 数据类型自动推断和检查');
  console.log('  ✅ 重构时自动更新所有引用');
  console.log('  ✅ 智能提示和文档');
  
  console.log('\nJavaScript:');
  console.log('  ⚠️ 运行时才能发现事件名错误');
  console.log('  ⚠️ 数据格式依赖约定和文档');
  console.log('  ⚠️ 需要额外的运行时检查代码');
  console.log('  ✅ 更灵活，动态添加事件');

  console.log('\n结论: 事件系统中 TS 的类型安全可以防止订阅/触发不匹配的错误');
}

// ============================================================================
// 导出
// ============================================================================

export { EventEmitterJS, EventEmitterJSDefensive };;

export type {
  EventMap,
  EventListener,
  UserEvents
};

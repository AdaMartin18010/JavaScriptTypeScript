import type { EventHandler } from './types';

/**
 * 简单的事件总线实现
 */
class EventBus {
  private events: Map<string, Set<EventHandler>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 监听事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler as EventHandler);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  /**
   * 监听一次性事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  once<T>(event: string, handler: EventHandler<T>): void {
    const onceHandler = (payload: T) => {
      this.off(event, onceHandler);
      handler(payload);
    };
    this.on(event, onceHandler);
  }

  /**
   * 取消监听
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param payload - 事件数据
   */
  emit<T>(event: string, payload?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * 清除所有事件监听
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * 获取事件监听数量
   * @param event - 事件名称 (可选)
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.events.get(event)?.size ?? 0;
    }
    return Array.from(this.events.values()).reduce(
      (sum, handlers) => sum + handlers.size,
      0
    );
  }
}

export default EventBus;

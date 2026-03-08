/**
 * @file 消息队列实现
 * @category Message Queue → Implementation
 * @difficulty hard
 * @tags message-queue, pub-sub, task-queue, delay-queue
 */

export interface Message<T = unknown> {
  id: string;
  topic: string;
  payload: T;
  timestamp: number;
  priority?: number;
  delay?: number;
  attempts?: number;
  maxAttempts?: number;
}

// 发布订阅
export class PubSub {
  private subscribers: Map<string, Set<(msg: Message) => void>> = new Map();
  
  subscribe(topic: string, handler: (msg: Message) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);
    
    return () => this.subscribers.get(topic)?.delete(handler);
  }
  
  publish(topic: string, payload: unknown): void {
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      topic,
      payload,
      timestamp: Date.now()
    };
    
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.forEach(h => {
        try {
          h(msg);
        } catch (error) {
          console.error(`Handler error for topic ${topic}:`, error);
        }
      });
    }
  }
  
  getSubscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.size || 0;
  }
}

// 任务队列
export class TaskQueue {
  private queue: Message[] = [];
  private processing = false;
  private handlers: Map<string, (payload: unknown) => Promise<unknown>> = new Map();
  
  registerHandler(taskType: string, handler: (payload: unknown) => Promise<unknown>): void {
    this.handlers.set(taskType, handler);
  }
  
  async enqueue(taskType: string, payload: unknown, priority: number = 5): Promise<string> {
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      topic: taskType,
      payload,
      timestamp: Date.now(),
      priority,
      attempts: 0,
      maxAttempts: 3
    };
    
    // 按优先级插入
    const index = this.queue.findIndex(m => (m.priority || 5) > priority);
    if (index === -1) {
      this.queue.push(msg);
    } else {
      this.queue.splice(index, 0, msg);
    }
    
    if (!this.processing) {
      this.processQueue();
    }
    
    return msg.id;
  }
  
  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const msg = this.queue.shift()!;
      const handler = this.handlers.get(msg.topic);
      
      if (handler) {
        try {
          msg.attempts = (msg.attempts || 0) + 1;
          await handler(msg.payload);
          console.log(`[TaskQueue] 任务完成: ${msg.id}`);
        } catch (error) {
          console.error(`[TaskQueue] 任务失败: ${msg.id}`, error);
          
          if ((msg.attempts || 0) < (msg.maxAttempts || 3)) {
            this.queue.push(msg); // 重试
          }
        }
      }
    }
    
    this.processing = false;
  }
  
  getQueueLength(): number {
    return this.queue.length;
  }
}

// 延迟队列
export class DelayQueue {
  private delayedMessages: Array<{ msg: Message; executeAt: number }> = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private pubsub = new PubSub();
  
  start(): void {
    this.timer = setInterval(() => this.checkDelayedMessages(), 1000);
  }
  
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  schedule(topic: string, payload: unknown, delayMs: number): string {
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      topic,
      payload,
      timestamp: Date.now(),
      delay: delayMs
    };
    
    this.delayedMessages.push({
      msg,
      executeAt: Date.now() + delayMs
    });
    
    // 排序：最早执行的在前
    this.delayedMessages.sort((a, b) => a.executeAt - b.executeAt);
    
    return msg.id;
  }
  
  private checkDelayedMessages(): void {
    const now = Date.now();
    const ready: typeof this.delayedMessages = [];
    
    // 找出已到期消息
    this.delayedMessages = this.delayedMessages.filter(item => {
      if (item.executeAt <= now) {
        ready.push(item);
        return false;
      }
      return true;
    });
    
    // 发布到期消息
    ready.forEach(item => {
      this.pubsub.publish(item.msg.topic, item.msg.payload);
    });
  }
  
  subscribe(topic: string, handler: (msg: Message) => void): () => void {
    return this.pubsub.subscribe(topic, handler);
  }
  
  getPendingCount(): number {
    return this.delayedMessages.length;
  }
}

export function demo(): void {
  console.log('=== 消息队列 ===\n');
  
  // PubSub演示
  const pubsub = new PubSub();
  const unsubscribe = pubsub.subscribe('user:created', (msg) => {
    console.log('收到用户创建事件:', msg.payload);
  });
  
  pubsub.publish('user:created', { id: 1, name: 'John' });
  console.log('订阅者数量:', pubsub.getSubscriberCount('user:created'));
  
  // TaskQueue演示
  const taskQueue = new TaskQueue();
  taskQueue.registerHandler('send-email', async (payload) => {
    console.log('发送邮件:', payload);
  });
  
  taskQueue.enqueue('send-email', { to: 'user@example.com', subject: 'Hello' }, 1);
  
  // DelayQueue演示
  const delayQueue = new DelayQueue();
  delayQueue.start();
  
  delayQueue.subscribe('reminder', (msg) => {
    console.log('提醒触发:', msg.payload);
  });
  
  delayQueue.schedule('reminder', { text: 'Meeting in 5 min' }, 100);
  
  setTimeout(() => {
    delayQueue.stop();
    console.log('延迟队列停止，待处理:', delayQueue.getPendingCount());
  }, 200);
}

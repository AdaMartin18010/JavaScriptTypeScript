/**
 * @file 事件溯源存储
 * @category Event Sourcing → Event Store
 * @difficulty hard
 * @tags event-sourcing, cqrs, event-store, saga
 * 
 * @description
 * 事件溯源实现：
 * - 事件存储
 * - 聚合重建
 * - 投影读取模型
 * - Saga 流程编排
 */

// ============================================================================
// 1. 领域事件
// ============================================================================

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateVersion: number;
  timestamp: Date;
  payload: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
  };
}

export interface EventStream {
  streamId: string;
  events: DomainEvent[];
  version: number;
}

// ============================================================================
// 2. 事件存储
// ============================================================================

export class EventStore {
  private streams: Map<string, DomainEvent[]> = new Map();
  private eventHandlers: Map<string, ((event: DomainEvent) => void)[]> = new Map();
  private allEventHandlers: ((event: DomainEvent) => void)[] = [];

  // 追加事件到流
  async appendEvents(streamId: string, expectedVersion: number, events: DomainEvent[]): Promise<void> {
    const existingEvents = this.streams.get(streamId) || [];
    
    // 乐观并发控制
    if (existingEvents.length !== expectedVersion) {
      throw new Error(`Concurrency conflict: expected version ${expectedVersion}, found ${existingEvents.length}`);
    }

    // 验证版本号
    for (let i = 0; i < events.length; i++) {
      events[i].aggregateVersion = expectedVersion + i + 1;
    }

    existingEvents.push(...events);
    this.streams.set(streamId, existingEvents);

    // 发布事件
    for (const event of events) {
      await this.publish(event);
    }
  }

  // 读取事件流
  async getEvents(streamId: string, fromVersion = 0): Promise<DomainEvent[]> {
    const events = this.streams.get(streamId) || [];
    return events.filter(e => e.aggregateVersion > fromVersion);
  }

  // 读取所有事件
  async getAllEvents(eventTypes?: string[]): Promise<DomainEvent[]> {
    const allEvents: DomainEvent[] = [];
    
    for (const events of this.streams.values()) {
      allEvents.push(...events);
    }

    allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (eventTypes) {
      return allEvents.filter(e => eventTypes.includes(e.type));
    }

    return allEvents;
  }

  // 订阅特定事件类型
  subscribe(eventType: string, handler: (event: DomainEvent) => void): () => void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);

    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  // 订阅所有事件
  subscribeAll(handler: (event: DomainEvent) => void): () => void {
    this.allEventHandlers.push(handler);
    return () => {
      const idx = this.allEventHandlers.indexOf(handler);
      if (idx > -1) this.allEventHandlers.splice(idx, 1);
    };
  }

  private async publish(event: DomainEvent): Promise<void> {
    // 类型特定处理器
    const handlers = this.eventHandlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    }

    // 全局处理器
    for (const handler of this.allEventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('Global event handler error:', error);
      }
    }
  }
}

// ============================================================================
// 3. 聚合根
// ============================================================================

export abstract class AggregateRoot {
  protected id: string = '';
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markCommitted(): void {
    this.uncommittedEvents = [];
  }

  protected applyEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.when(event);
    this.version = event.aggregateVersion;
  }

  abstract when(event: DomainEvent): void;

  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.when(event);
      this.version = event.aggregateVersion;
    }
  }
}

// ============================================================================
// 4. 示例：订单聚合
// ============================================================================

export class Order extends AggregateRoot {
  private status: 'pending' | 'paid' | 'shipped' | 'cancelled' = 'pending';
  private items: Array<{ productId: string; quantity: number; price: number }> = [];
  private totalAmount: number = 0;

  static create(orderId: string, customerId: string): Order {
    const order = new Order();
    const event: DomainEvent = {
      id: generateId(),
      type: 'OrderCreated',
      aggregateId: orderId,
      aggregateVersion: 1,
      timestamp: new Date(),
      payload: { orderId, customerId }
    };
    order.applyEvent(event);
    return order;
  }

  addItem(productId: string, quantity: number, price: number): void {
    if (this.status !== 'pending') {
      throw new Error('Cannot modify order after payment');
    }

    const event: DomainEvent = {
      id: generateId(),
      type: 'ItemAddedToOrder',
      aggregateId: this.id,
      aggregateVersion: this.version + 1,
      timestamp: new Date(),
      payload: { productId, quantity, price }
    };
    this.applyEvent(event);
  }

  pay(paymentId: string): void {
    if (this.status !== 'pending') {
      throw new Error('Order already paid');
    }

    const event: DomainEvent = {
      id: generateId(),
      type: 'OrderPaid',
      aggregateId: this.id,
      aggregateVersion: this.version + 1,
      timestamp: new Date(),
      payload: { paymentId, amount: this.totalAmount }
    };
    this.applyEvent(event);
  }

  when(event: DomainEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        this.id = event.payload.orderId as string;
        break;
      case 'ItemAddedToOrder':
        const { productId, quantity, price } = event.payload;
        this.items.push({ productId: productId as string, quantity: quantity as number, price: price as number });
        this.totalAmount += (quantity as number) * (price as number);
        break;
      case 'OrderPaid':
        this.status = 'paid';
        break;
    }
  }

  getStatus(): string {
    return this.status;
  }

  getTotalAmount(): number {
    return this.totalAmount;
  }
}

// ============================================================================
// 5. 投影读取模型
// ============================================================================

export class OrderProjection {
  private orders: Map<string, { 
    id: string; 
    status: string; 
    totalAmount: number;
    itemCount: number;
    createdAt: Date;
  }> = new Map();

  handleEvent(event: DomainEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        this.orders.set(event.aggregateId, {
          id: event.aggregateId,
          status: 'pending',
          totalAmount: 0,
          itemCount: 0,
          createdAt: event.timestamp
        });
        break;
      
      case 'ItemAddedToOrder':
        const order = this.orders.get(event.aggregateId);
        if (order) {
          const { quantity, price } = event.payload;
          order.totalAmount += (quantity as number) * (price as number);
          order.itemCount += quantity as number;
        }
        break;
      
      case 'OrderPaid':
        const paidOrder = this.orders.get(event.aggregateId);
        if (paidOrder) {
          paidOrder.status = 'paid';
        }
        break;
    }
  }

  getOrder(id: string) {
    return this.orders.get(id);
  }

  getAllOrders() {
    return Array.from(this.orders.values());
  }

  getPaidOrders() {
    return Array.from(this.orders.values()).filter(o => o.status === 'paid');
  }
}

// ============================================================================
// 6. Saga 流程编排
// ============================================================================

export interface SagaStep {
  name: string;
  action: () => Promise<void>;
  compensate: () => Promise<void>;
}

export class Saga {
  private steps: SagaStep[] = [];
  private completedSteps: string[] = [];
  private state: 'pending' | 'running' | 'completed' | 'compensating' | 'failed' = 'pending';

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    this.state = 'running';
    
    for (const step of this.steps) {
      try {
        console.log(`  Executing step: ${step.name}`);
        await step.action();
        this.completedSteps.push(step.name);
      } catch (error) {
        console.error(`  Step ${step.name} failed:`, error);
        await this.compensate();
        throw error;
      }
    }

    this.state = 'completed';
  }

  private async compensate(): Promise<void> {
    this.state = 'compensating';
    console.log('  Starting compensation...');

    // 逆序补偿
    for (const stepName of this.completedSteps.reverse()) {
      const step = this.steps.find(s => s.name === stepName);
      if (step) {
        try {
          console.log(`  Compensating step: ${step.name}`);
          await step.compensate();
        } catch (error) {
          console.error(`  Compensation failed for ${step.name}:`, error);
        }
      }
    }

    this.state = 'failed';
  }

  getState(): string {
    return this.state;
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function demo(): Promise<void> {
  console.log('=== 事件溯源存储 ===\n');

  const eventStore = new EventStore();
  const orderProjection = new OrderProjection();

  // 订阅事件更新投影
  eventStore.subscribeAll(event => orderProjection.handleEvent(event));

  console.log('1. 创建订单聚合');
  const orderId = generateId();
  const order = Order.create(orderId, 'customer-123');
  console.log('   Order ID:', order.getId());
  console.log('   Version:', order.getVersion());

  console.log('\n2. 添加商品');
  order.addItem('product-1', 2, 100);
  order.addItem('product-2', 1, 50);
  console.log('   Total Amount:', order.getTotalAmount());
  console.log('   Uncommitted Events:', order.getUncommittedEvents().length);

  console.log('\n3. 支付订单');
  order.pay('payment-456');
  console.log('   Status:', order.getStatus());
  console.log('   Total Amount:', order.getTotalAmount());

  console.log('\n4. 持久化事件');
  await eventStore.appendEvents(orderId, 0, order.getUncommittedEvents());
  order.markCommitted();
  console.log('   Events persisted');

  console.log('\n5. 投影读取模型');
  const projectedOrder = orderProjection.getOrder(orderId);
  console.log('   Projected Order:', projectedOrder);

  console.log('\n6. 重建聚合');
  const events = await eventStore.getEvents(orderId);
  const restoredOrder = new Order();
  restoredOrder.loadFromHistory(events);
  console.log('   Restored Order Status:', restoredOrder.getStatus());
  console.log('   Restored Total Amount:', restoredOrder.getTotalAmount());

  console.log('\n7. Saga 流程');
  const orderSaga = new Saga()
    .addStep({
      name: 'reserveInventory',
      action: async () => { console.log('    Reserving inventory...'); },
      compensate: async () => { console.log('    Releasing inventory...'); }
    })
    .addStep({
      name: 'processPayment',
      action: async () => { console.log('    Processing payment...'); },
      compensate: async () => { console.log('    Refunding payment...'); }
    })
    .addStep({
      name: 'sendNotification',
      action: async () => { console.log('    Sending notification...'); },
      compensate: async () => { console.log('    No compensation needed'); }
    });

  await orderSaga.execute();
  console.log('   Saga State:', orderSaga.getState());

  console.log('\n事件溯源要点:');
  console.log('- 事件是不可变的，追加到事件存储');
  console.log('- 聚合通过重放事件重建状态');
  console.log('- 投影读取模型通过订阅事件更新');
  console.log('- Saga 用于跨聚合的长事务');
  console.log('- 乐观并发控制防止并发冲突');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================

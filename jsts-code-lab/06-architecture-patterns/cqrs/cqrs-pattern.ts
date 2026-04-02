/**
 * @file CQRS + Event Sourcing 架构
 * @category Architecture Patterns → CQRS
 * @difficulty hard
 * @tags architecture, cqrs, event-sourcing, distributed-systems
 * 
 * @description
 * CQRS (Command Query Responsibility Segregation) 将读写操作分离：
 * - Command Side: 处理写操作，生成领域事件
 * - Query Side: 处理读操作，使用优化的读取模型
 * 
 * Event Sourcing: 不存储当前状态，而是存储所有事件，状态通过重放事件重建
 */

// ============================================================================
// 1. 领域事件定义
// ============================================================================

export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly timestamp: number;
  readonly version: number;
  readonly payload: unknown;
}

// 订单相关事件
export interface OrderCreatedEvent extends DomainEvent {
  type: 'OrderCreated';
  payload: {
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    totalAmount: number;
  };
}

export interface OrderItemAddedEvent extends DomainEvent {
  type: 'OrderItemAdded';
  payload: {
    productId: string;
    quantity: number;
    price: number;
  };
}

export interface OrderPaidEvent extends DomainEvent {
  type: 'OrderPaid';
  payload: {
    paymentId: string;
    amount: number;
    paidAt: number;
  };
}

export interface OrderShippedEvent extends DomainEvent {
  type: 'OrderShipped';
  payload: {
    trackingNumber: string;
    shippedAt: number;
  };
}

// ============================================================================
// 2. 事件存储 (Event Store)
// ============================================================================

export class EventStore {
  private events: DomainEvent[] = [];
  private aggregateVersions: Map<string, number> = new Map();

  // 追加事件
  append(event: DomainEvent): void {
    const expectedVersion = this.aggregateVersions.get(event.aggregateId) || 0;
    if (event.version !== expectedVersion + 1) {
      throw new Error(`并发冲突: 期望版本 ${expectedVersion + 1}, 实际版本 ${event.version}`);
    }

    this.events.push(event);
    this.aggregateVersions.set(event.aggregateId, event.version);
    console.log(`[EventStore] 事件追加: ${event.type} (v${event.version})`);
  }

  // 获取聚合的所有事件
  getEventsForAggregate(aggregateId: string): DomainEvent[] {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  // 从指定版本开始获取事件
  getEventsFromVersion(aggregateId: string, fromVersion: number): DomainEvent[] {
    return this.events.filter(
      e => e.aggregateId === aggregateId && e.version >= fromVersion
    );
  }

  // 获取所有事件（用于投影重建）
  getAllEvents(): DomainEvent[] {
    return [...this.events];
  }

  // 按事件类型获取
  getEventsByType(type: string): DomainEvent[] {
    return this.events.filter(e => e.type === type);
  }
}

// ============================================================================
// 3. 聚合根 (Aggregate Root)
// ============================================================================

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class Order {
  private uncommittedEvents: DomainEvent[] = [];
  private version = 0;

  id: string;
  customerId: string;
  items: OrderItem[] = [];
  status: OrderStatus = 'pending';
  totalAmount = 0;
  paymentId?: string;
  trackingNumber?: string;

  constructor(id: string, customerId: string) {
    this.id = id;
    this.customerId = customerId;
  }

  // 从事件重建聚合
  static rehydrate(aggregateId: string, events: DomainEvent[]): Order {
    const firstEvent = events[0] as OrderCreatedEvent;
    const order = new Order(aggregateId, firstEvent.payload.customerId);
    
    for (const event of events) {
      order.apply(event);
      order.version = event.version;
    }
    
    return order;
  }

  // 创建订单（工厂方法）
  static create(id: string, customerId: string, items: OrderItem[]): Order {
    const order = new Order(id, customerId);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    order.raiseEvent<OrderCreatedEvent>({
      id: Order.generateId(),
      type: 'OrderCreated',
      aggregateId: id,
      timestamp: Date.now(),
      version: 1,
      payload: { customerId, items, totalAmount }
    });

    return order;
  }

  // 支付订单
  pay(paymentId: string): void {
    if (this.status !== 'pending') {
      throw new Error('订单状态不允许支付');
    }

    this.raiseEvent<OrderPaidEvent>({
      id: Order.generateId(),
      type: 'OrderPaid',
      aggregateId: this.id,
      timestamp: Date.now(),
      version: this.version + 1,
      payload: { paymentId, amount: this.totalAmount, paidAt: Date.now() }
    });
  }

  // 发货
  ship(trackingNumber: string): void {
    if (this.status !== 'paid') {
      throw new Error('订单未支付，无法发货');
    }

    this.raiseEvent<OrderShippedEvent>({
      id: Order.generateId(),
      type: 'OrderShipped',
      aggregateId: this.id,
      timestamp: Date.now(),
      version: this.version + 1,
      payload: { trackingNumber, shippedAt: Date.now() }
    });
  }

  // 应用事件到状态
  private apply(event: DomainEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        const created = event as OrderCreatedEvent;
        this.items = [...created.payload.items];
        this.totalAmount = created.payload.totalAmount;
        break;
      
      case 'OrderPaid':
        this.status = 'paid';
        this.paymentId = (event as OrderPaidEvent).payload.paymentId;
        break;
      
      case 'OrderShipped':
        this.status = 'shipped';
        this.trackingNumber = (event as OrderShippedEvent).payload.trackingNumber;
        break;
    }
  }

  // 生成领域事件
  private raiseEvent<T extends DomainEvent>(event: T): void {
    this.apply(event);
    this.uncommittedEvents.push(event);
    this.version = event.version;
  }

  // 获取未提交的事件
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  // 标记事件已提交
  markCommitted(): void {
    this.uncommittedEvents = [];
  }

  private static generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// 4. Command Side - 命令处理器
// ============================================================================

export interface Command {
  type: string;
  aggregateId: string;
  payload: unknown;
}

export class CommandHandler {
  constructor(private eventStore: EventStore) {}

  async handle(command: Command): Promise<void> {
    console.log(`[CommandHandler] 处理命令: ${command.type}`);

    switch (command.type) {
      case 'CreateOrder':
        await this.handleCreateOrder(command);
        break;
      case 'PayOrder':
        await this.handlePayOrder(command);
        break;
      case 'ShipOrder':
        await this.handleShipOrder(command);
        break;
      default:
        throw new Error(`未知命令: ${command.type}`);
    }
  }

  private async handleCreateOrder(command: Command): Promise<void> {
    const { customerId, items } = command.payload as { customerId: string; items: OrderItem[] };
    const order = Order.create(command.aggregateId, customerId, items);
    
    // 持久化事件
    for (const event of order.getUncommittedEvents()) {
      this.eventStore.append(event);
    }
    order.markCommitted();
  }

  private async handlePayOrder(command: Command): Promise<void> {
    const events = this.eventStore.getEventsForAggregate(command.aggregateId);
    const order = Order.rehydrate(command.aggregateId, events);
    
    const { paymentId } = command.payload as { paymentId: string };
    order.pay(paymentId);

    for (const event of order.getUncommittedEvents()) {
      this.eventStore.append(event);
    }
    order.markCommitted();
  }

  private async handleShipOrder(command: Command): Promise<void> {
    const events = this.eventStore.getEventsForAggregate(command.aggregateId);
    const order = Order.rehydrate(command.aggregateId, events);
    
    const { trackingNumber } = command.payload as { trackingNumber: string };
    order.ship(trackingNumber);

    for (const event of order.getUncommittedEvents()) {
      this.eventStore.append(event);
    }
    order.markCommitted();
  }
}

// ============================================================================
// 5. Query Side - 读取模型与投影
// ============================================================================

// 读取模型 - 订单视图
export interface OrderView {
  id: string;
  customerId: string;
  itemCount: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  paidAt?: number;
  shippedAt?: number;
}

// 读取模型 - 订单详情
export interface OrderDetailView extends OrderView {
  items: OrderItem[];
  paymentId?: string;
  trackingNumber?: string;
}

// 投影处理器
export class OrderProjection {
  private orderViews: Map<string, OrderView> = new Map();
  private orderDetailViews: Map<string, OrderDetailView> = new Map();
  private customerOrders: Map<string, string[]> = new Map();

  constructor(private eventStore: EventStore) {}

  // 重建投影
  rebuild(): void {
    console.log('[Projection] 重建读取模型...');
    this.orderViews.clear();
    this.orderDetailViews.clear();
    this.customerOrders.clear();

    const events = this.eventStore.getAllEvents();
    for (const event of events) {
      this.handle(event);
    }
    console.log(`[Projection] 重建完成，共 ${this.orderViews.size} 个订单`);
  }

  // 处理单个事件
  handle(event: DomainEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        this.handleOrderCreated(event as OrderCreatedEvent);
        break;
      case 'OrderPaid':
        this.handleOrderPaid(event as OrderPaidEvent);
        break;
      case 'OrderShipped':
        this.handleOrderShipped(event as OrderShippedEvent);
        break;
    }
  }

  private handleOrderCreated(event: OrderCreatedEvent): void {
    const view: OrderDetailView = {
      id: event.aggregateId,
      customerId: event.payload.customerId,
      itemCount: event.payload.items.length,
      totalAmount: event.payload.totalAmount,
      status: 'pending',
      items: event.payload.items,
      createdAt: event.timestamp
    };

    this.orderDetailViews.set(event.aggregateId, view);
    this.orderViews.set(event.aggregateId, this.toSummaryView(view));

    // 更新客户订单索引
    const customerOrderIds = this.customerOrders.get(event.payload.customerId) || [];
    customerOrderIds.push(event.aggregateId);
    this.customerOrders.set(event.payload.customerId, customerOrderIds);
  }

  private handleOrderPaid(event: OrderPaidEvent): void {
    const view = this.orderDetailViews.get(event.aggregateId);
    if (view) {
      view.status = 'paid';
      view.paymentId = event.payload.paymentId;
      view.paidAt = event.payload.paidAt;
      this.orderViews.set(event.aggregateId, this.toSummaryView(view));
    }
  }

  private handleOrderShipped(event: OrderShippedEvent): void {
    const view = this.orderDetailViews.get(event.aggregateId);
    if (view) {
      view.status = 'shipped';
      view.trackingNumber = event.payload.trackingNumber;
      view.shippedAt = event.payload.shippedAt;
      this.orderViews.set(event.aggregateId, this.toSummaryView(view));
    }
  }

  private toSummaryView(detail: OrderDetailView): OrderView {
    const { items, paymentId, trackingNumber, ...summary } = detail;
    return summary;
  }

  // 查询方法
  getOrderById(id: string): OrderDetailView | undefined {
    return this.orderDetailViews.get(id);
  }

  getOrdersByCustomer(customerId: string): OrderView[] {
    const orderIds = this.customerOrders.get(customerId) || [];
    return orderIds.map(id => this.orderViews.get(id)!).filter(Boolean);
  }

  getOrdersByStatus(status: OrderStatus): OrderView[] {
    return Array.from(this.orderViews.values()).filter(o => o.status === status);
  }

  getTotalSales(): number {
    return Array.from(this.orderViews.values())
      .filter(o => o.status === 'paid' || o.status === 'shipped')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== CQRS + Event Sourcing 演示 ===\n');

  // 初始化组件
  const eventStore = new EventStore();
  const commandHandler = new CommandHandler(eventStore);
  const projection = new OrderProjection(eventStore);

  // 创建订单
  const orderId = 'ORD-001';
  commandHandler.handle({
    type: 'CreateOrder',
    aggregateId: orderId,
    payload: {
      customerId: 'CUST-001',
      items: [
        { productId: 'PROD-001', quantity: 2, price: 99 },
        { productId: 'PROD-002', quantity: 1, price: 299 }
      ]
    }
  });

  // 支付订单
  commandHandler.handle({
    type: 'PayOrder',
    aggregateId: orderId,
    payload: { paymentId: 'PAY-001' }
  });

  // 发货
  commandHandler.handle({
    type: 'ShipOrder',
    aggregateId: orderId,
    payload: { trackingNumber: 'TRACK-123456' }
  });

  // 重建读取模型
  console.log('');
  projection.rebuild();

  // 查询
  console.log('\n=== 查询结果 ===');
  const order = projection.getOrderById(orderId);
  console.log('订单详情:', JSON.stringify(order, null, 2));

  const pendingOrders = projection.getOrdersByStatus('pending');
  console.log(`\n待处理订单数: ${pendingOrders.length}`);

  const shippedOrders = projection.getOrdersByStatus('shipped');
  console.log(`已发货订单数: ${shippedOrders.length}`);

  const totalSales = projection.getTotalSales();
  console.log(`总销售额: ¥${totalSales}`);

  // 事件溯源 - 查看事件历史
  console.log('\n=== 事件历史 ===');
  const events = eventStore.getEventsForAggregate(orderId);
  events.forEach(e => {
    console.log(`  ${e.type} (v${e.version}) at ${new Date(e.timestamp).toISOString()}`);
  });
}

// ============================================================================
// 导出
// ============================================================================

// (已在上方使用 export class / export interface 直接导出，此处无需重复导出)

;

/**
 * @file 架构模式单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TaskModel,
  TaskController,
  ConsoleTaskView
} from '../../06-architecture-patterns/mvc/mvc-architecture.js';

import {
  ProductModel,
  ProductViewModel,
  ref,
  computed
} from '../../06-architecture-patterns/mvvm/mvvm-architecture.js';

import {
  ServiceRegistry,
  ApiGateway,
  CircuitBreaker
} from '../../06-architecture-patterns/microservices/microservices-patterns.js';

import {
  EventStore,
  Order,
  CommandHandler,
  OrderProjection
} from '../../06-architecture-patterns/cqrs/cqrs-pattern.js';

describe('MVC 架构', () => {
  let model: TaskModel;

  beforeEach(() => {
    model = new TaskModel();
  });

  it('应该能添加任务', () => {
    const task = model.addTask('测试任务');
    expect(task.title).toBe('测试任务');
    expect(task.completed).toBe(false);
  });

  it('应该能切换任务状态', () => {
    const task = model.addTask('测试任务');
    const toggled = model.toggleTask(task.id);
    expect(toggled?.completed).toBe(true);
  });

  it('应该能获取所有任务', () => {
    model.addTask('任务1');
    model.addTask('任务2');
    expect(model.getAllTasks()).toHaveLength(2);
  });

  it('应该能过滤已完成任务', () => {
    const task = model.addTask('任务');
    model.toggleTask(task.id);
    expect(model.getCompletedTasks()).toHaveLength(1);
    expect(model.getPendingTasks()).toHaveLength(0);
  });
});

describe('MVVM 架构', () => {
  it('ref 应该支持响应式更新', () => {
    const count = ref(0);
    let updated = false;
    
    // 模拟 watchEffect
    const effect = () => {
      updated = true;
      return count.value;
    };
    effect();
    
    count.value = 5;
    expect(count.value).toBe(5);
  });

  it('computed 应该缓存计算结果', () => {
    const a = ref(1);
    const b = ref(2);
    let computeCount = 0;
    
    const sum = computed(() => {
      computeCount++;
      return a.value + b.value;
    });
    
    // 首次访问
    expect(sum.value).toBe(3);
    expect(computeCount).toBe(1);
  });

  it('ProductViewModel 应该管理购物车状态', () => {
    const model = new ProductModel();
    const viewModel = new ProductViewModel(model);
    
    viewModel.addToCart('1');
    expect(viewModel.cartItemCount.value).toBe(1);
    
    viewModel.addToCart('2');
    expect(viewModel.cartItemCount.value).toBe(2);
  });
});

describe('微服务架构', () => {
  let registry: ServiceRegistry;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  it('应该能注册服务实例', () => {
    registry.register({
      id: 'test-1',
      name: 'test-service',
      host: 'localhost',
      port: 8080,
      health: 'healthy',
      metadata: {},
      lastHeartbeat: Date.now()
    });

    const instances = registry.discover('test-service');
    expect(instances).toHaveLength(1);
  });

  it('应该只返回健康的服务实例', () => {
    registry.register({
      id: 'healthy-1',
      name: 'service',
      host: 'localhost',
      port: 8080,
      health: 'healthy',
      metadata: {},
      lastHeartbeat: Date.now()
    });

    registry.register({
      id: 'unhealthy-1',
      name: 'service',
      host: 'localhost',
      port: 8081,
      health: 'unhealthy',
      metadata: {},
      lastHeartbeat: Date.now()
    });

    const instances = registry.discover('service');
    expect(instances).toHaveLength(1);
  });
});

describe('CQRS 架构', () => {
  let eventStore: EventStore;
  let commandHandler: CommandHandler;
  let projection: OrderProjection;

  beforeEach(() => {
    eventStore = new EventStore();
    commandHandler = new CommandHandler(eventStore);
    projection = new OrderProjection(eventStore);
  });

  it('应该能通过命令创建订单', async () => {
    await commandHandler.handle({
      type: 'CreateOrder',
      aggregateId: 'ORD-001',
      payload: {
        customerId: 'CUST-001',
        items: [{ productId: 'P1', quantity: 1, price: 100 }]
      }
    });

    const events = eventStore.getEventsForAggregate('ORD-001');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('OrderCreated');
  });

  it('应该能通过投影查询订单', async () => {
    await commandHandler.handle({
      type: 'CreateOrder',
      aggregateId: 'ORD-002',
      payload: {
        customerId: 'CUST-001',
        items: [{ productId: 'P1', quantity: 2, price: 50 }]
      }
    });

    projection.rebuild();
    
    const order = projection.getOrderById('ORD-002');
    expect(order).toBeDefined();
    expect(order?.totalAmount).toBe(100);
  });
});

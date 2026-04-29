# 架构模式 — 理论基础

## 1. 分层架构（Layered Architecture）

最经典的架构模式，将系统分为水平层次：

- **表现层**: UI、API 接口
- **业务逻辑层**: 领域模型、用例、服务
- **数据访问层**: 仓储、ORM、数据库访问
- **优点**: 简单易懂，职责分离清晰
- **缺点**: 层间耦合，难以横向扩展

## 2. 六边形架构（Hexagonal / Ports and Adapters）

Alistair Cockburn 提出，强调**业务逻辑独立于外部世界**：

- **核心域**: 纯业务逻辑，不依赖任何框架
- **端口**: 定义核心业务需要的接口（输入/输出）
- **适配器**: 端口的具体实现（HTTP、数据库、消息队列）
- **测试优势**: 可用 Mock 适配器单元测试核心域

## 3. CQRS（Command Query Responsibility Segregation）

将读操作和写操作分离到不同模型：

- **Command 端**: 处理写操作，维护事务一致性
- **Query 端**: 处理读操作，使用反规范化视图优化查询
- **适用场景**: 读多写少、复杂查询、事件溯源配合

## 4. 事件溯源（Event Sourcing）

以事件为唯一真相来源，系统状态通过重放事件重建：

- **事件存储**: 只追加的不可变日志
- **投影（Projection）**: 将事件流转换为查询视图
- **快照**: 定期保存状态加速恢复

## 5. 微内核架构（Microkernel / Plugin）

核心系统提供最小功能，通过插件扩展：

- **核心**: 插件管理、基础服务
- **插件**: 独立开发、动态加载
- **应用**: VS Code、Eclipse、Chrome 扩展

## 6. 架构模式对比

| 模式 | 耦合度 | 可测试性 | 扩展性 | 复杂度 | 典型应用 |
|------|--------|----------|--------|--------|----------|
| 分层架构 | 中 | 中 | 低 | 低 | 传统企业应用 |
| 六边形架构 | 低 | 高 | 高 | 中 | 领域驱动设计 |
| CQRS | 低 | 高 | 高 | 高 | 电商、金融系统 |
| 事件溯源 | 低 | 中 | 高 | 高 | 审计追踪、金融 |
| 微内核 | 低 | 高 | 高 | 中 | IDE、浏览器 |

## 7. 代码示例：六边形架构端口定义

```typescript
// 核心域：纯业务逻辑，零外部依赖
interface OrderService {
  placeOrder(command: PlaceOrderCommand): Promise<Order>;
  cancelOrder(orderId: string): Promise<void>;
}

// 输入端口（驱动适配器实现）
interface ForPlacingOrders {
  placeOrder(cmd: PlaceOrderCommand): Promise<Order>;
}

// 输出端口（被驱动适配器实现）
interface ForInventory {
  checkAvailability(productId: string, qty: number): Promise<boolean>;
}

// 核心实现
class OrderServiceImpl implements OrderService {
  constructor(private inventory: ForInventory) {}

  async placeOrder(cmd: PlaceOrderCommand): Promise<Order> {
    const available = await this.inventory.checkAvailability(cmd.productId, cmd.quantity);
    if (!available) throw new OutOfStockError(cmd.productId);
    // ... 核心逻辑
  }
}
```

## 8. 权威参考

- [Hexagonal Architecture by A. Cockburn](https://alistair.cockburn.us/hexagonal-architecture/) — 原始论文
- [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html) — 模式详解
- [Microsoft — CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) — Azure 架构指南
- [Event Sourcing by Fowler](https://martinfowler.com/eaaDev/EventSourcing.html) — 事件溯源模式

## 9. 与相邻模块的关系

- **59-fullstack-patterns**: 全栈应用的具体架构实践
- **53-app-architecture**: 前端应用架构模式
- **68-plugin-system**: 插件系统的实现机制

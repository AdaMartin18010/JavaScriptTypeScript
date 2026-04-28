# 事件溯源 — 理论基础

## 1. 核心概念

与传统 CRUD 直接修改状态不同，事件溯源将状态变更记录为**不可变事件序列**：

```
状态 = fold(初始状态, 事件列表)
```

## 2. 事件结构

```typescript
interface DomainEvent {
  eventId: string       // 唯一标识
  eventType: string     // 事件类型
  aggregateId: string   // 聚合根 ID
  version: number       // 版本号（乐观并发控制）
  timestamp: Date       // 发生时间
  payload: object       // 事件数据
}
```

## 3. 读写分离

- **写模型（Command Side）**: 接收命令，验证业务规则，追加事件
- **读模型（Query Side）**: 通过投影将事件流物化为查询优化的视图
- **CQRS**: 命令与查询责任分离，常配合事件溯源使用

## 4. 投影（Projection）

将事件流转换为查询视图的过程：

- **同步投影**: 事务内同步更新（强一致性，性能较低）
- **异步投影**: 消息队列异步处理（最终一致性，性能高）
- **快照**: 定期保存聚合状态，避免从头重放所有事件

## 5. 挑战与应对

| 挑战 | 应对策略 |
|------|---------|
| 事件演变 | 向上/向下转换器（Upcaster/Downcaster） |
| 查询复杂 | CQRS + 物化视图 |
| 外部系统集成 | 在投影中发送外部通知 |
| 事件存储增长 | 归档旧事件、压缩、快照 |

## 6. 与相邻模块的关系

- **06-architecture-patterns**: 架构模式（CQRS、事件驱动）
- **70-distributed-systems**: 分布式系统中的事件一致性
- **25-microservices**: 微服务间的事件通信

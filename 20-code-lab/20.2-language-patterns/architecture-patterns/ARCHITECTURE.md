# 架构模式 — 架构设计

## 1. 架构概述

本模块实现企业级应用的核心架构模式，涵盖从单体到分布式、从同步到异步的多种架构风格。每种模式都配有可运行的 TypeScript 示例，展示其实现方式与适用场景。

## 2. 核心组件

### 2.1 分层架构实现

- **Presentation Layer**: HTTP 路由、请求/响应转换
- **Business Layer**: 领域服务、用例编排、业务规则验证
- **Data Layer**: 仓储接口、数据库访问抽象

### 2.2 六边形架构（Ports & Adapters）

- **Domain Core**: 纯业务逻辑，零外部依赖
- **Inbound Adapters**: HTTP 控制器、CLI 命令、消息消费者
- **Outbound Adapters**: 数据库仓储、外部 API 客户端、消息生产者

### 2.3 CQRS + Event Sourcing

- **Command Handler**: 接收命令，验证业务规则，生成事件
- **Event Store**: 只追加的不可变事件日志
- **Projection Worker**: 异步构建查询视图

## 3. 数据流

```
HTTP Request → Router → Controller → Use Case → Domain Service → Repository → Database
                                    ↓
                              Domain Event → Event Bus → Projection Handler → Read Model
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 依赖注入 | 手动注入 + 工厂模式 | 减少框架依赖，保持领域纯净 |
| 事件存储 | 内存实现 + 接口抽象 | 便于测试和替换为真实数据库 |
| 错误处理 | Result 类型替代异常 | 强制调用方处理错误路径 |

## 5. 质量属性

- **可测试性**: 领域层无框架依赖，可 100% 单元测试
- **可扩展性**: 新增适配器不影响核心领域
- **可维护性**: 清晰的分层使变更影响范围可控

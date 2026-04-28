# Serverless — 理论基础

## 1. Serverless 定义

Serverless 是一种云计算执行模型，开发者无需管理服务器：

- **FaaS（Function as a Service）**: 事件触发函数执行
- **BaaS（Backend as a Service）**: 托管的后端服务（Auth、DB、Storage）

## 2. 函数生命周期

```
代码部署 → 冷启动（加载运行时 + 初始化）→ 热启动（复用实例）→ 空闲 → 销毁
```

- **冷启动**: 100ms-3s，是 Serverless 的核心痛点
- **优化策略**: 保持最小实例数、使用轻量运行时（如 Go/Rust）、减少依赖体积

## 3. 事件源触发器

| 事件源 | 触发场景 |
|--------|---------|
| HTTP 请求 | API Gateway 路由 |
| 定时任务 | CRON 表达式（CloudWatch/EventBridge）|
| 文件上传 | S3 / Blob Storage 对象创建 |
| 数据库变更 | DynamoDB Streams / CDC |
| 消息队列 | SQS / SNS / EventHub 消息到达 |

## 4. Serverless 架构模式

- **Lambda 单体**: 单个函数处理所有请求（简单场景）
- **Lambda 分层**: 按职责拆分函数（API、Processor、Worker）
- **Step Functions**: 工作流编排，状态机管理复杂业务流程
- **EventBridge**: 事件总线，解耦发布者和消费者

## 5. 与相邻模块的关系

- **32-edge-computing**: 边缘函数与 Serverless 的关系
- **22-deployment-devops**: Serverless 的 CI/CD 策略
- **93-deployment-edge-lab**: 边缘部署实践

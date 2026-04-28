# 共识算法 — 架构设计

## 1. 架构概述

本模块深入实现了多种分布式共识算法的核心逻辑，包括 Raft、PBFT 和 Gossip 协议。通过模拟网络环境验证算法在故障场景下的行为。

## 2. 核心组件

### 2.1 Raft 实现

- **Election Module**: 超时驱动的领导者选举
- **Log Manager**: 日志索引、任期管理、提交判定
- **Snapshotter**: 状态快照，加速新节点加入

### 2.2 PBFT 实现

- **Message Handler**: Pre-Prepare/Prepare/Commit 三阶段处理
- **View Changer**: 主节点故障时的视图切换
- **Checkpoint Manager**: 周期性检查点，清理旧日志

### 2.3 Gossip 实现

- **Peer Selector**: 随机选择通信邻居
- **Digest Exchange**: 摘要比较，只同步差异
- **Anti-Entropy**: 周期性全量同步修复不一致

## 3. 数据流

```
Client → Leader/Primary → Broadcast to Replicas → Collect Ack → Commit → Reply to Client
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 消息传递 | 事件驱动模拟 | 便于测试和可视化 |
| 持久化 | 内存 + 可选落盘 | 教学用途优先 |
| 网络模型 | 可配置延迟/丢包/分区 | 模拟真实网络 |

## 5. 质量属性

- **正确性**: 严格遵循论文规范
- **可教育性**: 清晰的日志和状态输出
- **可扩展性**: 模块化设计，便于添加新算法

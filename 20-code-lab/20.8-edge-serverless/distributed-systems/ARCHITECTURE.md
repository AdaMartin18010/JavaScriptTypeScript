# 分布式系统 — 架构设计

## 1. 架构概述

本模块模拟了分布式系统的核心问题：共识、一致性、分区容错和故障恢复。通过 TypeScript 实现 Raft 算法、Gossip 协议和分布式事务的简化版本。

## 2. 核心组件

### 2.1 共识引擎

- **Raft Node**: 领导者选举、日志复制、安全性保证
- **State Machine**: 确定性状态机执行
- **Log Replicator**: 异步日志复制到跟随者

### 2.2 成员管理

- **Membership List**: 集群节点状态维护
- **Failure Detector**: 基于心跳的故障检测
- **Partition Handler**: 网络分区场景处理

### 2.3 一致性协调

- **Quorum Calculator**: 读写仲裁计算
- **Version Vector**: 冲突检测和版本追踪
- **Conflict Resolver**: 最后写入获胜 / 自定义合并策略

## 3. 数据流

```
Client Request → Leader Node → Log Entry → Replicate to Followers → Commit → Apply to State Machine → Response
                     ↓
              Heartbeat / Election
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 共识算法 | Raft（简化版）| 可理解性强，工程实用 |
| 故障检测 | 超时 + 心跳 | 简单有效 |
| 一致性级别 | 可调（强/最终）| 根据业务需求权衡 |

## 5. 质量属性

- **容错性**: 少数节点故障不影响整体服务
- **一致性**: 可配置的一致性级别
- **可观测性**: 节点状态、日志复制进度的实时监控

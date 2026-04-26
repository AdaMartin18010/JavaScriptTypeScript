# 现代 ORM 实验室 — 架构设计

## 1. 架构概述

本模块实现了现代 ORM 的核心引擎，包括 Schema 定义、查询构建器、迁移系统和边缘适配层。展示从类型定义到数据库查询的完整类型安全链路。

## 2. 核心组件

### 2.1 Schema 引擎
- **Type Parser**: TypeScript 类型反射和解析
- **Schema Validator**: 字段类型、约束、关系的验证
- **Migration Generator**: 基于 Schema 差异的迁移脚本生成

### 2.2 查询构建器
- **Query AST**: 查询的抽象语法树表示
- **SQL Generator**: AST 到 SQL 的转换（多方言支持）
- **Type Inferencer**: 查询结果的 TypeScript 类型推断

### 2.3 运行时层
- **Connection Pool**: 数据库连接池管理
- **Transaction Manager**: 事务的 ACID 保证
- **Edge Adapter**: HTTP 协议数据库适配（Turso、D1）

### 2.4 迁移系统
- **Migration Runner**: 版本化迁移的顺序执行
- **Rollback Engine**: 迁移回滚和基线重置
- **Schema Diff**: 目标 Schema 与当前数据库的差异分析

## 3. 数据流

```
TypeScript Schema → Validation → Migration Plan → Database → Query Builder → SQL → Result (Typed)
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 查询 API | 链式 + 原始 SQL 混合 | 灵活性与类型安全兼顾 |
| 迁移策略 | 声明式 + 手动调整 | 自动化与可控性平衡 |
| 边缘适配 | HTTP 驱动器 | 无持久连接的边缘环境 |

## 5. 质量属性

- **类型安全**: 编译时查询验证和结果推断
- **性能**: 查询优化和连接池管理
- **可移植性**: 多数据库方言和边缘环境支持

---
title: JavaScript/TypeScript 全景知识库
description: "Awesome JS/TS Ecosystem 项目的知识图谱，展示各专题间的关联关系与学习路径"
---

# JavaScript/TypeScript 全景知识库 - 项目知识图谱

> 本项目构建了一个完整的 JavaScript/TypeScript 学习与知识体系。本图谱展示了各专题间的关联关系，帮助学习者规划最优学习路径。

## 知识图谱总览

```mermaid
mindmap
  root((JS/TS<br/>知识体系))
    语言基础
      语言语义
      类型系统
      执行模型
      模块系统
      对象模型
      ECMAScript规范
    工程实践
      构建工具
      测试工程
      性能工程
      安全合规
      DevOps
    前端框架
      React生态
      Vue生态
      Svelte/Solid
      状态管理
    后端与API
      Node.js
      API设计
      数据库ORM
      微服务
    前沿技术
      WebAssembly
      AI/ML推理
      边缘计算
      Rust工具链
    理论基础
      范畴论
      类型论
      认知科学
```

## 核心学习路径

```mermaid
flowchart LR
    subgraph 基础路径
        A[语言语义] --> B[类型系统]
        B --> C[执行模型]
        C --> D[模块系统]
    end
    subgraph 工程路径
        E[构建工具] --> F[测试工程]
        F --> G[性能工程]
        G --> H[DevOps]
    end
    subgraph 进阶路径
        I[设计模式] --> J[架构模式]
        J --> K[微服务]
        K --> L[边缘计算]
    end
    D --> E
    H --> I
```

## 专题关联矩阵

| 专题 | 前置知识 | 关联专题 | 难度 |
|------|----------|----------|------|
| 语言语义 | 无 | 类型系统、执行模型 | 🌱 初级 |
| 类型系统 | 语言语义 | 执行模型、对象模型 | 🌿 中级 |
| 执行模型 | 语言语义 | 性能工程、内存模型 | 🌿 中级 |
| 模块系统 | 语言语义 | DevOps、微服务 | 🌿 中级 |
| 状态管理 | 前端框架 | 设计模式、性能工程 | 🌿 中级 |
| 微服务 | 模块系统、API设计 | DevOps、数据库 | 🍂 高级 |
| WebAssembly | 执行模型、性能工程 | 边缘计算、Rust | 🍂 高级 |
| 范畴论 | 类型系统 | 函数式编程 | 🍁 专家 |

## 项目结构导航

```mermaid
flowchart TB
    subgraph 源码目录
        A[10-fundamentals] --> B[语言核心文档]
        C[20-code-lab] --> D[动手实验]
        E[30-knowledge-base] --> F[知识体系]
        G[50-examples] --> H[实战示例]
        I[70-theoretical-foundations] --> J[理论前沿]
    end
    subgraph 网站
        K[website/] --> L[VitePress站点]
        L --> M[指南与示例]
    end
    B --> L
    D --> L
    F --> L
    H --> L
    J --> L
```

## 推荐学习路径

### 路径一：前端工程师进阶

```mermaid
flowchart LR
    A[语言基础] --> B[前端框架]
    B --> C[状态管理]
    C --> D[性能优化]
    D --> E[测试工程]
    E --> F[DevOps]
```

### 路径二：全栈工程师

```mermaid
flowchart LR
    A[语言基础] --> B[Node.js]
    B --> C[数据库ORM]
    C --> D[API设计]
    D --> E[微服务]
    E --> F[DevOps]
```

### 路径三：前沿技术探索

```mermaid
flowchart LR
    A[类型系统] --> B[WebAssembly]
    B --> C[Rust工具链]
    C --> D[AI推理]
    D --> E[边缘计算]
```

## 知识图谱使用指南

### 如何阅读此图谱

1. **找到当前位置**：根据你的经验水平确定所在区域
2. **识别前置知识**：查看指向当前节点的入边（ prerequisite ）
3. **规划学习路径**：沿着出边探索后续主题
4. **交叉验证**：在相关专题之间建立联系

### 知识深度分层

| 层级 | 颜色标记 | 说明 |
|------|----------|------|
| 基础 | 🌱 | 必须掌握的核心概念 |
| 中级 | 🌿 | 工程实践常用技术 |
| 高级 | 🍂 | 特定场景的深度优化 |
| 专家 | 🍁 | 理论研究与前沿探索 |

## 参考资源

- [项目首页](/) — 完整知识体系列表
- [理论前沿](/theoretical-foundations/) — 36篇理论摘要
- [代码实验室](/code-lab/) — 动手实验集合
- [学习路径](/learning-paths/) — 系统性成长路线

---

 [← 返回架构图首页](./)

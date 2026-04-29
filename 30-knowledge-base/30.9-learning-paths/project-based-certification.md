---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 项目制认证体系 (Project-Based Certification)

> 将学习路径从「阅读列表」升级为「项目驱动认证」，以可交付成果验证真实能力

## 目录

- [项目制认证体系 (Project-Based Certification)](#项目制认证体系-project-based-certification)
  - [目录](#目录)
  - [🎯 认证体系概览](#-认证体系概览)
    - [认证等级与要求](#认证等级与要求)
    - [项目递进关系](#项目递进关系)
  - [🌱 初级认证项目 (JSTS-Junior)](#-初级认证项目-jsts-junior)
    - [项目 1: Calculator（计算器）](#项目-1-calculator计算器)
      - [需求文档](#需求文档)
      - [验收标准（必须全部通过）](#验收标准必须全部通过)
      - [评分 Rubric](#评分-rubric)
      - [参考答案位置](#参考答案位置)
      - [扩展挑战](#扩展挑战)
    - [项目 2: Todo List（待办清单）](#项目-2-todo-list待办清单)
      - [需求文档](#需求文档-1)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-1)
      - [评分 Rubric](#评分-rubric-1)
      - [参考答案位置](#参考答案位置-1)
      - [扩展挑战](#扩展挑战-1)
    - [项目 3: Blog（博客）](#项目-3-blog博客)
      - [需求文档](#需求文档-2)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-2)
      - [评分 Rubric](#评分-rubric-2)
      - [参考答案位置](#参考答案位置-2)
      - [扩展挑战](#扩展挑战-2)
    - [项目 4: E-commerce Mini（迷你电商）](#项目-4-e-commerce-mini迷你电商)
      - [需求文档](#需求文档-3)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-3)
      - [评分 Rubric](#评分-rubric-3)
      - [参考答案位置](#参考答案位置-3)
      - [扩展挑战](#扩展挑战-3)
  - [⚙️ 中级认证项目 (JSTS-Professional)](#️-中级认证项目-jsts-professional)
    - [项目 1: Real-time Chat（实时聊天）](#项目-1-real-time-chat实时聊天)
      - [需求文档](#需求文档-4)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-4)
      - [评分 Rubric](#评分-rubric-4)
      - [参考答案位置](#参考答案位置-4)
      - [扩展挑战](#扩展挑战-4)
    - [项目 2: Performance Dashboard（性能监控面板）](#项目-2-performance-dashboard性能监控面板)
      - [需求文档](#需求文档-5)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-5)
      - [评分 Rubric](#评分-rubric-5)
      - [参考答案位置](#参考答案位置-5)
      - [扩展挑战](#扩展挑战-5)
    - [项目 3: Microservice System（微服务系统）](#项目-3-microservice-system微服务系统)
      - [需求文档](#需求文档-6)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-6)
      - [评分 Rubric](#评分-rubric-6)
      - [参考答案位置](#参考答案位置-6)
      - [扩展挑战](#扩展挑战-6)
  - [🏗️ 高级认证项目 (JSTS-Architect)](#️-高级认证项目-jsts-architect)
    - [项目 1: Compiler Toy（编译器玩具）](#项目-1-compiler-toy编译器玩具)
      - [需求文档](#需求文档-7)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-7)
      - [评分 Rubric](#评分-rubric-7)
      - [参考答案位置](#参考答案位置-7)
      - [扩展挑战](#扩展挑战-7)
    - [项目 2: Distributed Consensus（分布式共识）](#项目-2-distributed-consensus分布式共识)
      - [需求文档](#需求文档-8)
      - [验收标准（必须全部通过）](#验收标准必须全部通过-8)
      - [评分 Rubric](#评分-rubric-8)
      - [参考答案位置](#参考答案位置-8)
      - [扩展挑战](#扩展挑战-8)
  - [📋 认证流程](#-认证流程)
    - [提交方式](#提交方式)
      - [方案 A：GitHub Pull Request（推荐）](#方案-agithub-pull-request推荐)
      - [方案 B：个人仓库提交](#方案-b个人仓库提交)
    - [评审标准](#评审标准)
    - [证书与徽章](#证书与徽章)
  - [📝 自测题库](#-自测题库)
    - [初级认证自测题 (JSTS-Junior)](#初级认证自测题-jsts-junior)
    - [中级认证自测题 (JSTS-Professional)](#中级认证自测题-jsts-professional)
    - [高级认证自测题 (JSTS-Architect)](#高级认证自测题-jsts-architect)
  - [🚀 下一步](#-下一步)

---

## 🎯 认证体系概览

本认证体系将传统的「被动阅读」转化为「主动构建」，每个级别通过完成一系列递进式项目来证明实际工程能力。通过全部项目并通过自测题库后，即可获得相应级别的认证徽章。

### 认证等级与要求

| 认证等级 | 徽章名称 | 项目数量 | 预计总时长 | 核心能力验证 |
|---------|---------|---------|-----------|------------|
| **初级认证** | JSTS-Junior | 4 个递进项目 | 4-6 周 | 语言基础、前端开发、全栈入门 |
| **中级认证** | JSTS-Professional | 3 个递进项目 | 6-8 周 | 并发编程、性能优化、微服务架构 |
| **高级认证** | JSTS-Architect | 2 个递进项目 | 8-12 周 | 编译原理、分布式共识、系统设计 |

**晋级规则**：

- 初级认证无需前置条件，适合有 0-6 个月编程经验的学习者
- 中级认证需先通过初级认证，或提供同等能力证明
- 高级认证需先通过中级认证，并建议具备 3 年以上工程经验

### 项目递进关系

```
┌─────────────────────────────────────────────────────────────────┐
│                      项目能力递进图谱                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  初级 (JSTS-Junior)          中级 (JSTS-Professional)           │
│  ┌──────────────┐            ┌──────────────────┐              │
│  │ Calculator   │ ─────────→ │ Real-time Chat   │              │
│  │ (类型+测试)   │            │ (并发+实时同步)   │              │
│  └──────────────┘            └──────────────────┘              │
│         ↓                           ↓                          │
│  ┌──────────────┐            ┌──────────────────┐              │
│  │ Todo List    │ ─────────→ │ Perf Dashboard   │              │
│  │ (DOM+状态)   │            │ (性能+可视化)     │              │
│  └──────────────┘            └──────────────────┘              │
│         ↓                           ↓                          │
│  ┌──────────────┐            ┌──────────────────┐              │
│  │ Blog         │ ─────────→ │ Microservice     │              │
│  │ (组件+路由)   │            │ (架构+容器化)     │              │
│  └──────────────┘            └──────────────────┘              │
│         ↓                                                      │
│  ┌──────────────┐            ┌──────────────────┐              │
│  │ E-commerce   │ ───────────────────────────→ │ Compiler Toy   │
│  │ (全栈+认证)   │                              │ (编译原理)      │
│  └──────────────┘                              └──────────────────┘
│                                                       ↓          │
│                                              ┌──────────────────┐│
│                                              │ Distributed      ││
│                                              │ Consensus        ││
│                                              │ (Raft+容错)      ││
│                                              └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌱 初级认证项目 (JSTS-Junior)

初级认证包含 4 个递进项目，覆盖 TypeScript 基础、DOM 操作、前端框架和全栈开发。完成全部 4 个项目并通过 10 道自测题，即可获得 **JSTS-Junior** 认证。

### 项目 1: Calculator（计算器）

> 难度: ⭐⭐
> 预计时间: 3-5 天
> 关联 code-lab: [00-language-core](../../20-code-lab/language-core/)
> 关联理论文档: [语言核心基础](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md)

#### 需求文档

**功能需求**：

1. 实现一个支持加、减、乘、除四则运算的计算器类 `Calculator`
2. 支持链式调用（Chaining），如 `calc.add(1).multiply(2).value()`
3. 支持历史记录查询，可回溯最近 10 次运算
4. 提供命令行界面（CLI）和程序化 API 两种调用方式

**非功能需求**：

1. 所有公开 API 必须具备完整的 TypeScript 类型签名
2. 除数为零时必须抛出类型安全的自定义错误 `DivisionByZeroError`
3. 运算结果精度误差不得超过 `Number.EPSILON` 范围

#### 验收标准（必须全部通过）

- [ ] 至少 10 个单元测试通过，覆盖四则运算、边界情况和异常场景
- [ ] 支持加减乘除四种运算，结果准确
- [ ] 类型安全：禁止隐式 `any`，启用 `strict` 模式无编译错误
- [ ] 链式调用接口类型正确推断，IDE 可自动补全
- [ ] 历史记录功能完整，支持查询和清空

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 类型安全性 | 30% | 零 `any`，使用泛型和条件类型 | 基本类型完整，少量 `any` | 大量类型缺失或错误 |
| 测试覆盖 | 25% | ≥10 个测试，含边界和异常 | 8-9 个测试，覆盖主路径 | <8 个测试或覆盖率不足 |
| 代码规范 | 20% | ESLint 零警告，命名规范 | 少量警告，命名基本规范 | 大量警告或命名混乱 |
| 功能完整度 | 25% | 全部功能+扩展挑战完成 | 核心功能完成 | 核心功能缺失 |

#### 参考答案位置

- 参考实现: [jsts-code-lab/00-language-core/calculator-example/](../../20-code-lab/language-core/)
- 测试模板: [jsts-code-lab/07-testing/](../../20-code-lab/testing/)

#### 扩展挑战

1. 使用 TypeScript 模板字面量类型实现「运算表达式解析」，如 `calc.evaluate<"1+2*3">` 在类型层面推断结果为 `7`
2. 为计算器添加单元测试覆盖率报告，目标 >90%
3. 使用 `bigint` 支持任意精度整数运算

---

### 项目 2: Todo List（待办清单）

> 难度: ⭐⭐⭐
> 预计时间: 5-7 天
> 关联 code-lab: [00-language-core](../../20-code-lab/language-core/), [02-design-patterns](../../20-code-lab/design-patterns/)
> 关联理论文档: [设计模式入门](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/03_design_patterns.md)

#### 需求文档

**功能需求**：

1. 完整的 CRUD（Create, Read, Update, Delete）操作：添加、查看、编辑、删除待办事项
2. 任务状态管理：待完成（Pending）、进行中（In Progress）、已完成（Completed）
3. 筛选功能：按状态筛选、按关键字搜索
4. 优先级标记：高（High）、中（Medium）、低（Low）

**非功能需求**：

1. 数据持久化：使用 `localStorage` 或 `IndexedDB` 保存数据
2. 类型安全：定义完整的 `TodoItem`、`FilterCriteria` 等接口
3. 使用至少一种设计模式（观察者模式 Observer 或命令模式 Command）

#### 验收标准（必须全部通过）

- [ ] CRUD 操作完整，用户可添加、编辑、删除、查看任务
- [ ] 刷新页面后数据不丢失，持久化实现正确
- [ ] 类型安全，核心数据结构使用接口/类型别名定义
- [ ] 使用至少一种设计模式，并在代码注释中说明
- [ ] UI 具备基本的可用性和视觉层次（可使用原生 DOM 或轻量框架）

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 功能完整度 | 30% | CRUD + 筛选 + 搜索 + 优先级 | CRUD + 筛选 | CRUD 不完整 |
| 持久化实现 | 25% | 使用 IndexedDB，错误处理完善 | localStorage 实现正确 | 持久化失败或无错误处理 |
| 类型与设计 | 25% | 完整类型 + 设计模式应用恰当 | 基本类型 + 尝试设计模式 | 类型缺失或模式误用 |
| 代码质量 | 20% | 模块化清晰，职责分离 | 基本模块化 | 代码耦合严重 |

#### 参考答案位置

- 参考实现: [examples/beginner-todo-master/](../../examples/beginner-todo-master/)
- 设计模式参考: [jsts-code-lab/02-design-patterns/observer/](../../20-code-lab/design-patterns/)

#### 扩展挑战

1. 将应用拆分为 Model-View-Presenter（MVP）架构，实现关注点分离
2. 添加拖拽排序功能（Drag & Drop），使用原生 HTML5 API
3. 实现 undo/redo 功能，使用命令模式（Command Pattern）管理操作历史

---

### 项目 3: Blog（博客）

> 难度: ⭐⭐⭐⭐
> 预计时间: 7-10 天
> 关联 code-lab: [18-frontend-frameworks](../../20-code-lab/frontend-frameworks/)
> 关联理论文档: 前端框架解析

#### 需求文档

**功能需求**：

1. 文章列表页：展示所有文章摘要，支持分页
2. 文章详情页：渲染 Markdown 格式正文，显示作者和发布时间
3. 文章分类与标签系统：支持按分类和标签筛选文章
4. 评论功能：读者可在文章下方发表评论（前端模拟存储）

**非功能需求**：

1. 响应式布局：适配桌面端（≥1024px）、平板端（768px-1023px）和移动端（<768px）
2. 使用 React（推荐）或 Vue 构建，组件化开发
3. 路由管理：使用 React Router 或 Vue Router 实现页面导航

#### 验收标准（必须全部通过）

- [ ] 文章列表/详情页面功能完整，Markdown 渲染正确
- [ ] 路由配置正确，支持浏览器前进/后退，刷新不丢失当前页面
- [ ] 响应式布局在三种视口下均正常显示，无元素溢出或错位
- [ ] 组件拆分合理，至少包含 `Header`、`ArticleList`、`ArticleDetail`、`CommentSection` 等独立组件
- [ ] 类型安全：为 Props、State、API 响应定义完整类型

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 组件设计 | 25% | 组件粒度恰当，复用性高 | 基本拆分，少量复用 | 组件过于庞大或拆分过碎 |
| 路由与状态 | 25% | 路由守卫+状态管理（Context/Redux/Pinia） | 基础路由+局部状态 | 路由错误或状态混乱 |
| 响应式布局 | 25% | 三种视口完美适配 | 两种主要视口适配 | 仅桌面端或严重错位 |
| Markdown 渲染 | 25% | 支持代码高亮、表格、TOC | 基础 Markdown 渲染 | 渲染错误或样式缺失 |

#### 参考答案位置

- 前端框架参考: [jsts-code-lab/18-frontend-frameworks/](../../20-code-lab/frontend-frameworks/)
- 设计系统参考: [jsts-code-lab/57-design-system/](../../20-code-lab/design-system/)

#### 扩展挑战

1. 使用 Next.js 或 Nuxt.js 实现服务端渲染（SSR），优化首屏加载
2. 集成 `react-markdown` + `remark-gfm` 支持 GitHub Flavored Markdown
3. 实现暗色模式（Dark Mode）切换，使用 CSS 变量或 Tailwind Dark Mode

---

### 项目 4: E-commerce Mini（迷你电商）

> 难度: ⭐⭐⭐⭐
> 预计时间: 10-14 天
> 关联 code-lab: [19-backend-development](../../20-code-lab/backend-development/), [21-api-security](../../20-code-lab/api-security/)
> 关联理论文档: [API 安全与认证](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/05_distributed_systems.md)

#### 需求文档

**功能需求**：

1. 商品展示：商品列表、分类筛选、商品详情页
2. 购物车：添加商品、修改数量、删除商品、实时计算总价
3. 结账流程：填写收货信息、选择支付方式、提交订单
4. 用户认证：注册、登录、JWT 会话管理、个人中心

**非功能需求**：

1. 全栈架构：前端 + Node.js 后端 + 内存数据库（或 SQLite）
2. API 设计遵循 RESTful 规范，响应格式统一
3. 安全防护：密码 bcrypt 加密、JWT 安全传输、基础 XSS 防护

#### 验收标准（必须全部通过）

- [ ] 商品展示、购物车、结账流程功能完整，交互流畅
- [ ] 用户认证系统可用：注册、登录、登出、受保护路由
- [ ] API 设计规范，使用标准 HTTP 方法和状态码
- [ ] 类型安全：前后端共享 DTO（Data Transfer Object）类型定义
- [ ] 至少 5 个后端 API 测试通过

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 全栈完整性 | 30% | 前后端分离，数据流清晰 | 基本全栈功能 | 前端 mock 或后端缺失 |
| 认证与安全 | 25% | JWT + bcrypt + XSS 防护 | JWT + 密码加密 | 明文存储或无认证 |
| API 设计 | 25% | RESTful + 统一响应 + 错误处理 | 基本 RESTful | 路由混乱或状态码错误 |
| 测试覆盖 | 20% | ≥5 API 测试 + 前端组件测试 | ≥3 API 测试 | 测试缺失 |

#### 参考答案位置

- 后端参考: [jsts-code-lab/19-backend-development/](../../20-code-lab/backend-development/)
- 安全参考: [jsts-code-lab/21-api-security/](../../20-code-lab/api-security/)
- 全栈示例: [examples/fullstack-tanstack-start/](../../examples/fullstack-tanstack-start/)

#### 扩展挑战

1. 使用 Prisma ORM 连接 PostgreSQL 或 MySQL，替换内存数据库
2. 集成 Stripe 或 PayPal 沙盒环境实现真实支付流程
3. 实现基于角色的访问控制（RBAC）：区分普通用户和管理员权限

---

## ⚙️ 中级认证项目 (JSTS-Professional)

中级认证包含 3 个递进项目，聚焦并发编程、性能优化和微服务架构。完成全部 3 个项目并通过 10 道自测题，即可获得 **JSTS-Professional** 认证。

### 项目 1: Real-time Chat（实时聊天）

> 难度: ⭐⭐⭐⭐
> 预计时间: 10-14 天
> 关联 code-lab: [03-concurrency](../../20-code-lab/concurrency/), [20-database-orm](../../20-code-lab/database-orm/)
> 关联理论文档: [并发编程与实时通信](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md)

#### 需求文档

**功能需求**：

1. 实时消息传输：用户加入/离开房间、发送文本消息、接收在线用户列表
2. 房间系统：支持创建/加入房间，房间间消息隔离
3. 消息持久化：聊天记录保存至数据库，支持历史消息分页加载
4. 消息状态：已发送、已送达、已读状态追踪

**非功能需求**：

1. 使用 WebSocket（推荐 Socket.IO 或原生 ws）实现双向实时通信
2. 并发控制：单房间支持 ≥100 并发连接，消息延迟 < 200ms
3. 错误恢复：连接断开后自动重连，未发送消息本地队列缓存

#### 验收标准（必须全部通过）

- [ ] 多用户实时通信正常，消息广播延迟可感知范围内
- [ ] 房间隔离正确，用户只能接收所在房间的消息
- [ ] 历史消息可分页加载，数据库查询优化（索引+分页）
- [ ] 连接断开后自动重连，用户体验无明显中断
- [ ] 并发测试：单房间 50+ 模拟用户同时发送消息无丢失

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 实时通信 | 30% | WebSocket + 心跳检测 + 重连 | 基础 WebSocket 通信 | 轮询或通信不稳定 |
| 并发处理 | 25% | 支持 100+ 并发，消息有序 | 支持 50+ 并发 | 并发下消息丢失或乱序 |
| 数据持久化 | 25% | ORM + 索引 + 分页 + 事务 | 基础 ORM 存储 | 数据丢失或查询低效 |
| 架构设计 | 20% | 模块化，职责分离清晰 | 基本模块化 | 前后端耦合严重 |

#### 参考答案位置

- 并发模式参考: [jsts-code-lab/03-concurrency/](../../20-code-lab/concurrency/)
- ORM 参考: [jsts-code-lab/20-database-orm/](../../20-code-lab/database-orm/)
- 实时通信参考: [jsts-code-lab/30-real-time-communication/](../../20-code-lab/real-time-communication/)

#### 扩展挑战

1. 实现消息已读回执（Read Receipts），使用发布-订阅模式广播状态变更
2. 添加文件传输功能，支持图片/文件的分片上传和进度显示
3. 使用 Redis Pub/Sub 实现多服务器横向扩展（Horizontal Scaling）

---

### 项目 2: Performance Dashboard（性能监控面板）

> 难度: ⭐⭐⭐⭐⭐
> 预计时间: 12-16 天
> 关联 code-lab: [08-performance](../../20-code-lab/performance/), [11-benchmarks](../../20-code-lab/benchmarks/)
> 关联理论文档: 性能优化方法论

#### 需求文档

**功能需求**：

1. 核心 Web Vitals 监控：LCP（Largest Contentful Paint）、FID（First Input Delay）、CLS（Cumulative Layout Shift）实时采集
2. 性能数据可视化：折线图展示性能指标趋势，柱状图对比不同页面
3. 告警系统：当性能指标超过阈值时触发告警（控制台/邮件模拟）
4. 资源分析：加载瀑布图，展示各资源加载时间和大小

**非功能需求**：

1. 使用 Performance API 和 PerformanceObserver 采集真实性能数据
2. 数据缓存策略：本地缓存最近 100 条记录，支持时间范围筛选
3. 大数据量渲染优化：虚拟列表（Virtual List）展示超过 1000 条日志记录

#### 验收标准（必须全部通过）

- [ ] 至少采集 3 项 Core Web Vitals 指标，数据准确
- [ ] 数据可视化使用图表库（Chart.js、D3.js 或 ECharts）实现
- [ ] 虚拟列表实现正确，滚动 1000+ 条记录无卡顿（帧率 ≥ 30fps）
- [ ] 告警阈值可配置，触发时正确记录告警事件
- [ ] 提供性能基准测试（Benchmark），证明优化前后的量化对比

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 数据采集 | 25% | 3+ Web Vitals + 自定义指标 | 基础 Performance API | 数据缺失或不准确 |
| 可视化 | 25% | 多图表 + 交互 + 响应式 | 基础图表展示 | 图表缺失或错误 |
| 渲染性能 | 25% | 虚拟列表 + 60fps | 虚拟列表基本可用 | 卡顿严重 |
| 缓存与告警 | 25% | 多级缓存 + 可配置告警 | 基础缓存 + 固定阈值 | 无缓存或告警失效 |

#### 参考答案位置

- 性能优化参考: [jsts-code-lab/08-performance/](../../20-code-lab/performance/)
- 基准测试参考: [jsts-code-lab/11-benchmarks/](../../20-code-lab/benchmarks/)
- 数据可视化参考: [jsts-code-lab/58-data-visualization/](../../20-code-lab/data-visualization/)

#### 扩展挑战

1. 使用 Web Workers 将数据处理逻辑从主线程卸载，避免阻塞渲染
2. 实现 Service Worker 离线缓存，支持无网络环境下查看历史数据
3. 使用 Rust + WebAssembly 实现高性能数据聚合模块，与纯 JS 实现对比 Benchmark

---

### 项目 3: Microservice System（微服务系统）

> 难度: ⭐⭐⭐⭐⭐
> 预计时间: 14-21 天
> 关联 code-lab: [25-microservices](../../20-code-lab/microservices/), [26-event-sourcing](../../20-code-lab/event-sourcing/)
> 关联理论文档: [微服务与事件溯源](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/07_architecture.md)

#### 需求文档

**功能需求**：

1. 用户服务（User Service）：用户注册、认证、profile 管理
2. 订单服务（Order Service）：订单创建、状态流转、订单查询
3. 库存服务（Inventory Service）：库存扣减、预占、释放
4. API 网关（API Gateway）：统一入口、路由转发、请求限流

**非功能需求**：

1. 服务间通信：使用 HTTP REST 或消息队列（RabbitMQ/BullMQ）
2. 事件溯源（Event Sourcing）：订单状态变更以事件形式存储
3. 容器化：提供 Dockerfile，服务可一键启动（docker-compose）
4. 分布式追踪：使用 OpenTelemetry 或简单日志关联 ID 追踪请求链路

#### 验收标准（必须全部通过）

- [ ] 至少 3 个微服务独立运行，通过 API 网关可访问
- [ ] 服务间通信正常，订单创建时正确扣减库存
- [ ] 提供 `docker-compose.yml`，一键启动全部服务
- [ ] 事件溯源实现：可重放订单事件流，重建任意时刻状态
- [ ] 请求链路可追溯，每个请求有唯一 Correlation ID

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 服务拆分 | 25% | 领域边界清晰，独立部署 | 基本拆分，少量耦合 | 单体伪装成分布式 |
| 事件溯源 | 25% | 完整事件存储+重放+投影 | 基础事件记录 | 无事件溯源或实现错误 |
| 容器化 | 25% | Docker + Compose + 健康检查 | Docker 基础运行 | 无法容器化运行 |
| 可观测性 | 25% | 链路追踪 + 结构化日志 + 监控 | 日志关联 ID | 无可观测性设计 |

#### 参考答案位置

- 微服务参考: [jsts-code-lab/25-microservices/](../../20-code-lab/microservices/)
- 事件溯源参考: [jsts-code-lab/26-event-sourcing/](../../20-code-lab/event-sourcing/)
- 架构示例: [examples/intermediate-microservice-workshop/](../../examples/intermediate-microservice-workshop/)

#### 扩展挑战

1. 实现 Saga 模式处理分布式事务，订单失败时补偿库存
2. 使用 Kubernetes 配置文件（YAML）部署至本地 K3s 或 Minikube
3. 实现断路器（Circuit Breaker）模式，使用 Opossum 库防止级联故障

---

## 🏗️ 高级认证项目 (JSTS-Architect)

高级认证包含 2 个递进项目，深入编译原理和分布式共识算法。完成全部 2 个项目并通过 10 道自测题，即可获得 **JSTS-Architect** 认证。

### 项目 1: Compiler Toy（编译器玩具）

> 难度: ⭐⭐⭐⭐⭐
> 预计时间: 21-30 天
> 关联 code-lab: [01-ecmascript-evolution](../../20-code-lab/ecmascript-evolution/), [79-compiler-design](../../20-code-lab/compiler-design/)
> 关联理论文档: [ECMAScript 规范与演进](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md), [编译器设计](../../20-code-lab/compiler-design/THEORY.md)

#### 需求文档

**功能需求**：

1. 词法分析（Lexical Analysis）：将源码字符串解析为 Token 序列，支持数字、标识符、运算符、括号
2. 语法分析（Syntax Analysis）：使用递归下降（Recursive Descent）或 Pratt Parser 构建 AST（Abstract Syntax Tree）
3. 语义分析（Semantic Analysis）：变量声明检查、类型推断（简单数字类型）
4. 代码生成（Code Generation）：将 AST 编译为 JavaScript 代码或可执行的栈机字节码

**非功能需求**：

1. 语言特性支持：变量声明（`let`）、算术表达式、函数定义与调用、条件语句（`if`）
2. 测试驱动：每个编译阶段有独立测试，端到端测试验证完整编译流程
3. 错误报告：词法/语法/语义错误需给出行号和友好提示

#### 验收标准（必须全部通过）

- [ ] 词法分析器正确识别所有 Token，错误输入给出明确错误位置
- [ ] 语法分析器生成正确 AST，支持表达式优先级和结合性
- [ ] 语义分析器检测未声明变量使用，给出编译时错误
- [ ] 代码生成器输出可执行 JavaScript，运算结果正确
- [ ] 端到端测试：至少 5 个完整程序（从源码到执行结果）验证通过

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 词法分析 | 20% | 完整 Token 类型 + 错误恢复 | 基础 Token 识别 | 词法错误频繁 |
| 语法分析 | 25% | 正确优先级 + 结合性 + 错误恢复 | 基础 AST 生成 | 语法错误未处理 |
| 语义分析 | 25% | 符号表 + 类型检查 + 作用域 | 基础变量检查 | 无语义检查 |
| 代码生成 | 20% | JS 代码生成或字节码 + VM | 基础代码生成 | 生成代码错误 |
| 测试覆盖 | 10% | 分阶段测试 + 端到端测试 | 端到端测试 | 测试严重不足 |

#### 参考答案位置

- 编译器参考: [examples/advanced-compiler-workshop/](../../examples/advanced-compiler-workshop/)
- ECMAScript 演进: [jsts-code-lab/01-ecmascript-evolution/](../../20-code-lab/ecmascript-evolution/)
- 编译器理论: [jsts-code-lab/79-compiler-design/](../../20-code-lab/compiler-design/)

#### 扩展挑战

1. 实现一个基于栈的虚拟机（Stack-based VM）和对应的字节码解释器，替代直接生成 JS
2. 添加闭包（Closure）支持，实现词法作用域（Lexical Scoping）和 upvalue 捕获
3. 使用 Visitor 模式重构编译器，支持插件化优化 Pass（如常量折叠 Constant Folding）

---

### 项目 2: Distributed Consensus（分布式共识）

> 难度: ⭐⭐⭐⭐⭐⭐
> 预计时间: 30-45 天
> 关联 code-lab: [70-distributed-systems](../../20-code-lab/distributed-systems/), [71-consensus-algorithms](../../20-code-lab/consensus-algorithms/)
> 关联理论文档: [分布式系统理论](../../20-code-lab/distributed-systems/THEORY.md), [共识算法](../../20-code-lab/consensus-algorithms/THEORY.md)

#### 需求文档

**功能需求**：

1. Raft 算法核心实现：领导者选举（Leader Election）、日志复制（Log Replication）、安全性（Safety）
2. 状态机复制：在多个节点间同步键值存储（Key-Value Store）操作
3. 集群成员变更：支持动态添加/移除节点（可选，单节点配置变更）
4. 客户端接口：提供 `get(key)` 和 `set(key, value)` HTTP API

**非功能需求**：

1. 容错能力：集群在少数节点（≤N/2）故障时仍可正常服务
2. 一致性保证：线性一致性（Linearizability）读取，已提交的写操作不可丢失
3. 日志持久化：使用 LevelDB 或 SQLite 持久化 Raft 日志和快照（Snapshot）
4. 测试验证：使用 Jepsen-style 故障注入测试，模拟网络分区、节点崩溃、延迟

#### 验收标准（必须全部通过）

- [ ] 3-5 节点集群正常启动，自动完成领导者选举
- [ ] 写操作在多数节点确认后才返回成功，保证持久性
- [ ] 领导者崩溃后，集群在合理时间内（<5s）完成新领导者选举
- [ ] 网络分区恢复后，集群自动合并日志，保证一致性
- [ ] 故障注入测试通过：随机杀死节点/延迟网络，数据不丢失不冲突

#### 评分 Rubric

| 维度 | 权重 | 优秀 (90-100) | 合格 (60-89) | 不合格 (<60) |
|------|------|--------------|-------------|-------------|
| 算法正确性 | 30% | 完整 Raft + 论文级安全性 | 核心算法正确 | 选举或复制错误 |
| 容错能力 | 25% | 网络分区 + 崩溃恢复 + 快照 | 基础故障恢复 | 分区后数据冲突 |
| 持久化 | 20% | WAL + 快照 + 崩溃恢复 | 基础日志持久化 | 无持久化 |
| 测试验证 | 25% | 故障注入 + 一致性验证 | 单元测试 + 集成测试 | 测试不足 |

#### 参考答案位置

- 分布式系统理论: [jsts-code-lab/70-distributed-systems/](../../20-code-lab/distributed-systems/)
- 共识算法参考: [jsts-code-lab/71-consensus-algorithms/](../../20-code-lab/consensus-algorithms/)
- Raft 论文: [The Raft Consensus Paper](https://raft.github.io/raft.pdf)

#### 扩展挑战

1. 实现日志快照（Snapshot）和增量快照传输，防止日志无限增长
2. 实现多 Raft Group（Multi-Raft），支持数据分片（Sharding）水平扩展
3. 使用 TLA+ 或 Coq 对核心共识模块进行形式化验证（Formal Verification）

---

## 📋 认证流程

### 提交方式

#### 方案 A：GitHub Pull Request（推荐）

1. Fork [JavaScriptTypeScript](https://github.com/luyanisme/JavaScriptTypeScript) 官方仓库
2. 在 `submissions/<你的GitHub用户名>/<认证级别>/` 目录下创建项目
3. 每个项目需包含：
   - `README.md`：项目说明、运行方式、设计决策记录
   - `src/`：源代码
   - `tests/`：测试文件
   - `docs/`：架构文档（中级及以上必须）
4. 提交 Pull Request，标题格式：`[认证] JSTS-Junior - @<用户名>`

#### 方案 B：个人仓库提交

1. 在个人 GitHub/GitLab 仓库中完成所有项目
2. 确保仓库公开可读，每个项目独立目录
3. 填写 [认证申请表](https://github.com/luyanisme/JavaScriptTypeScript/issues/new?template=certification.md)
4. 维护者将在 7 个工作日内完成代码评审

### 评审标准

```
┌─────────────────────────────────────────────────────────────┐
│                     评审流程与时限                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  提交 → 自动化检查 → 人工代码评审 → 反馈/通过 → 颁发徽章       │
│                                                             │
│  - 自动化检查: ESLint + TypeScript 编译 + 测试运行 (<10min)   │
│  - 人工评审: 2 名维护者评审，关注设计和架构 (<7工作日)         │
│  - 反馈轮次: 最多 3 轮反馈，每轮需在 14 天内响应              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**评审关注点**：

| 优先级 | 关注点 | 说明 |
|-------|--------|------|
| P0 | 功能正确性 | 验收标准是否全部通过 |
| P0 | 类型安全 | `strict` 模式下无 `any` 滥用 |
| P1 | 测试质量 | 测试是否验证行为而非实现细节 |
| P1 | 代码可读性 | 命名、注释、模块边界是否清晰 |
| P2 | 架构设计 | 是否应用合适的设计模式和架构原则 |
| P2 | 文档完整度 | README、架构决策记录是否充分 |

### 证书与徽章

通过认证后，你将获得：

1. **电子徽章（Digital Badge）**：符合 [Open Badges 2.0](https://www.imsglobal.org/activity/digital-badges) 标准，可嵌入 LinkedIn 或个人网站
2. **认证证书（PDF）**：包含认证编号、完成日期和项目清单
3. **仓库展示权**：优秀项目将被收录至官方 `showcase/` 目录

```
┌────────────────────────────────────────┐
│     🏅 JSTS-Junior Certified           │
│                                        │
│  认证编号: JSTS-J-2026-XXXX            │
│  认证日期: 2026-04-21                  │
│  完成项目: Calculator / Todo / Blog    │
│            / E-commerce Mini           │
│                                        │
│  [验证链接]  [添加到 LinkedIn]          │
└────────────────────────────────────────┘
```

---

## 📝 自测题库

自测题库用于检验理论知识掌握程度，每个级别 10 题，答对 7 题及以上视为通过。建议在完成项目前作为诊断测试，或在完成后作为巩固复习。

### 初级认证自测题 (JSTS-Junior)

**1. TypeScript 中，`unknown` 和 `any` 的核心区别是什么？**

- A. `unknown` 可以赋值给任何类型，`any` 不行
- B. `any` 会关闭类型检查，`unknown` 在使用前需要类型收窄 ✅
- C. `unknown` 只能用于函数返回值
- D. 两者完全等价，只是命名不同

**解析**: `any` 完全绕过类型系统，而 `unknown` 是类型安全的顶层类型，必须经类型守卫或类型断言后才能使用。

**2. 以下哪个不是 TypeScript 的严格模式选项？**

- A. `strictNullChecks`
- B. `strictFunctionTypes`
- C. `strictPropertyInitialization`
- D. `strictAnyChecks` ✅

**解析**: `strictAnyChecks` 不是 TypeScript 编译器选项。严格模式包含 `strictNullChecks`、`strictFunctionTypes`、`strictPropertyInitialization` 等。

**3. DOM 事件流（Event Flow）的三个阶段按顺序是？**

- A. 目标阶段 → 冒泡阶段 → 捕获阶段
- B. 捕获阶段 → 目标阶段 → 冒泡阶段 ✅
- C. 冒泡阶段 → 捕获阶段 → 目标阶段
- D. 捕获阶段 → 冒泡阶段 → 目标阶段

**解析**: W3C 标准事件流为：捕获阶段（Capturing）→ 目标阶段（Target）→ 冒泡阶段（Bubbling）。

**4. 在 React 中，`useEffect` 的清理函数（Cleanup Function）在什么时机执行？**

- A. 组件挂载时
- B. 依赖项变化前和组件卸载时 ✅
- C. 仅在组件卸载时
- D. 每次渲染后

**解析**: `useEffect` 的清理函数在依赖项更新前执行旧 effect 的清理，并在组件卸载时执行最后一次清理。

**5. 以下哪个 HTTP 状态码表示「未授权」？**

- A. 403 Forbidden
- B. 401 Unauthorized ✅
- C. 404 Not Found
- D. 500 Internal Server Error

**解析**: 401 Unauthorized 表示需要身份认证；403 Forbidden 表示已认证但权限不足。

**6. `localStorage` 和 `sessionStorage` 的主要区别是？**

- A. `localStorage` 容量更大
- B. `sessionStorage` 在页面会话结束时清除，`localStorage` 持久保存 ✅
- C. `localStorage` 只能存储字符串
- D. 两者无区别

**解析**: `localStorage` 数据持久化存储，`sessionStorage` 仅在当前浏览器标签页会话期间保留。

**7. CSS Flexbox 中，`justify-content` 控制的是？**

- A. 交叉轴（Cross Axis）对齐
- B. 主轴（Main Axis）对齐 ✅
- C. 单个子元素的自身对齐
- D. 行的对齐

**解析**: `justify-content` 控制主轴方向上的对齐，`align-items` 控制交叉轴方向。

**8. 以下哪个不是 JavaScript 的原始类型（Primitive Type）？**

- A. `symbol`
- B. `bigint`
- C. `object` ✅
- D. `undefined`

**解析**: `object` 是引用类型。原始类型包括：`string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint`。

**9. JWT（JSON Web Token）由哪三部分组成？**

- A. Header、Body、Signature
- B. Header、Payload、Signature ✅
- C. Body、Payload、Hash
- D. Meta、Data、Sign

**解析**: JWT 结构为 `Header.Payload.Signature`，通过 Base64Url 编码并用点号连接。

**10. 以下哪个命令用于安装开发依赖（devDependencies）？**

- A. `npm install <pkg> --save`
- B. `npm install <pkg> --dev`
- C. `npm install <pkg> --save-dev` ✅
- D. `npm install <pkg> -g`

**解析**: `--save-dev` 或 `-D` 将包安装为开发依赖，不会被打包进生产环境。

---

### 中级认证自测题 (JSTS-Professional)

**1. WebSocket 与 HTTP 长轮询（Long Polling）相比，核心优势是？**

- A. WebSocket 更安全
- B. WebSocket 建立全双工（Full-Duplex）持久连接，延迟更低 ✅
- C. WebSocket 兼容性更好
- D. WebSocket 不需要服务器支持

**解析**: WebSocket 在握手后升级为持久 TCP 连接，支持服务器主动推送，避免了 HTTP 轮询的开销。

**2. 在 Node.js 中，`setImmediate` 和 `setTimeout(fn, 0)` 的执行顺序是？**

- A. `setTimeout` 总是先于 `setImmediate`
- B. `setImmediate` 总是先于 `setTimeout`
- C. 取决于当前是否处于 I/O 周期（I/O Cycle）✅
- D. 两者同时执行

**解析**: 在主模块中，`setTimeout` 和 `setImmediate` 顺序不确定；在 I/O 回调中，`setImmediate` 总是先于 `setTimeout(0)`。

**3. 虚拟列表（Virtual List）的核心优化原理是？**

- A. 使用更高效的排序算法
- B. 仅渲染视口（Viewport）内的 DOM 节点 ✅
- C. 使用 Web Workers 处理数据
- D. 减少 HTTP 请求数量

**解析**: 虚拟列表通过计算可视区域的起止索引，只渲染可见项，将 DOM 节点数从 N 降至常数级。

**4. 以下哪种缓存策略最适合不频繁变更的静态资源？**

- A. Cache-Aside
- B. Write-Through
- C. Immutable + Long-Term Cache ✅
- D. Write-Behind

**解析**: 对带哈希指纹的静态资源（如 `app.a1b2c3.js`），可设置极长缓存时间（1年），因为文件名变化即表示内容变化。

**5. 微服务架构中，断路器模式（Circuit Breaker）的主要作用是？**

- A. 加密服务间通信
- B. 防止故障级联传播，快速失败 ✅
- C. 自动扩容服务实例
- D. 记录服务调用日志

**解析**: 断路器在下游服务故障时快速返回错误，避免线程阻塞和故障蔓延，给故障服务恢复时间。

**6. Event Sourcing 与传统 CRUD 状态存储的核心区别是？**

- A. Event Sourcing 使用 NoSQL 数据库
- B. Event Sourcing 存储状态变更事件而非最终状态 ✅
- C. Event Sourcing 不需要数据库
- D. Event Sourcing 只适用于小型系统

**解析**: Event Sourcing 将每次状态变更记录为不可变事件，系统状态可通过重放事件流重建。

**7. Docker 容器中，以下哪个最佳实践是正确的？**

- A. 在容器内使用 `root` 用户运行应用以简化权限管理
- B. 每个容器应只运行一个主进程 ✅
- C. 将数据直接存储在容器可写层以提升性能
- D. 容器镜像越大越好，包含所有可能的依赖

**解析**: 单容器单进程是 Docker 核心哲学，便于生命周期管理、日志收集和故障隔离。

**8. 以下哪个指标直接衡量用户感知的页面加载性能？**

- A. TTFB（Time to First Byte）
- B. LCP（Largest Contentful Paint）✅
- C. CLS（Cumulative Layout Shift）
- D. FID（First Input Delay）

**解析**: LCP 衡量视口中最大内容元素的渲染时间，直接反映主要内容对用户的可见速度。

**9. 消息队列中，「至少一次投递」（At-Least-Once Delivery）可能产生的问题是？**

- A. 消息丢失
- B. 消息重复消费 ✅
- C. 消息顺序错乱
- D. 消息过期

**解析**: At-Least-Once 保证消息不丢失，但可能因网络超时重试导致消费者收到重复消息，需要幂等处理。

**10. 在分布式系统中，CAP 定理指出不可能同时满足的是？**

- A. 一致性、可用性、分区容错性 ✅
- B. 一致性、原子性、持久性
- C. 可用性、分区容错性、隔离性
- D. 一致性、可用性、持久性

**解析**: CAP 定理：在分布式系统中，一致性（Consistency）、可用性（Availability）、分区容错性（Partition Tolerance）三者不可兼得，必须至少牺牲一项。

---

### 高级认证自测题 (JSTS-Architect)

**1. 编译器的「前端」（Front End）通常不包含以下哪个阶段？**

- A. 词法分析
- B. 语法分析
- C. 代码优化 ✅
- D. 语义分析

**解析**: 代码优化（Optimization）和代码生成通常属于编译器后端（Back End）。前端负责源码到中间表示的转换。

**2. 在递归下降解析器中，处理左递归（Left Recursion）Grammar 的正确方式是？**

- A. 直接实现左递归规则
- B. 改写为右递归，或使用循环结构（迭代）替代递归 ✅
- C. 增加栈深度限制
- D. 左递归无需特殊处理

**解析**: 直接实现左递归会导致无限递归。标准做法是改写 Grammar 消除左递归，或在解析函数中使用循环处理左结合运算符。

**3. Raft 算法中，领导者（Leader）向跟随者（Follower）发送的是？**

- A. 完整的状态快照
- B. 心跳（Heartbeat）和日志条目（Log Entries）✅
- C. 投票请求
- D. 客户端重定向地址

**解析**: Leader 定期发送心跳维持权威，并将客户端请求封装为日志条目复制给 Followers。

**4. 以下哪个是线性一致性（Linearizability）的关键特征？**

- A. 所有操作按全局实时顺序执行，如同原子操作 ✅
- B. 最终所有节点数据一致
- C. 允许读取到稍旧的数据
- D. 不需要全局时钟

**解析**: 线性一致性要求每个操作在调用和返回之间的某个时间点原子生效，且所有操作看起来按全局实时顺序执行。

**5. 语法分析中，LL(1) Grammar 的「1」表示？**

- A. 只需查看 1 个非终结符
- B. 只需向前查看（Lookahead）1 个 Token ✅
- C. 语法树深度为 1
- D. 产生式右侧最多 1 个符号

**解析**: LL(1) 表示从左到右扫描输入，产生最左推导，只需向前查看 1 个 Token 即可决定使用哪条产生式。

**6. 在 Raft 的领导者选举中，候选人（Candidate）成为领导者需要获得多少票？**

- A. 所有节点的票
- B. 超过半数（Majority）节点的票 ✅
- C. 至少 1 票
- D. 当前 Leader 的确认

**解析**: Raft 要求 Candidate 获得集群中超过半数节点的投票才能成为 Leader，保证任意时刻最多只有一个有效 Leader。

**7. 以下哪种中间表示（IR）形式最适合执行数据流分析和优化？**

- A. AST（抽象语法树）
- B. SSA 形式（Static Single Assignment）✅
- C. 源代码
- D. 机器码

**解析**: SSA 形式保证每个变量只被赋值一次，简化了数据流分析和许多优化（如常量传播、死代码消除）。

**8. 分布式系统中的「两阶段提交」（2PC）的主要缺点是？**

- A. 实现过于简单
- B. 协调者（Coordinator）单点故障和阻塞问题 ✅
- C. 不支持跨服务事务
- D. 只能用于单机系统

**解析**: 2PC 在协调者故障时，参与者可能处于不确定状态而阻塞。此外协调者是单点故障源。

**9. 编译器优化中的「常量折叠」（Constant Folding）是指？**

- A. 将常量移动到循环外部
- B. 在编译期计算常量表达式的值 ✅
- C. 将变量声明为常量
- D. 删除未使用的常量

**解析**: 常量折叠在编译时计算 `2 + 3` 这类纯常量表达式，直接替换为结果 `5`，减少运行时计算。

**10. 以下哪个不是形式化验证（Formal Verification）的常用工具或语言？**

- A. TLA+
- B. Coq
- C. Jest ✅
- D. Alloy

**解析**: Jest 是 JavaScript 测试框架，用于单元测试而非形式化验证。TLA+、Coq、Alloy 是形式化规格说明和证明工具。

---

## 🚀 下一步

完成项目制认证后，你可以：

1. **参与社区维护**：成为本知识库的认证评审员，帮助审核其他学习者的提交
2. **挑战架构设计**：参考 [高级学习路径](./advanced-path.md) 中的「架构设计挑战」，设计 Twitter 时间线、协作编辑器等系统
3. **贡献开源项目**：将认证项目扩展为开源工具，如将 Compiler Toy 发展为教育用语言
4. **持续学习**：关注 [年度生态审计](../../scripts/annual-ecosystem-audit-template.md)，掌握 JavaScript/TypeScript 生态最新趋势

> 💡 **提示**: 项目制认证不是终点，而是工程实践的起点。每个项目都可以迭代优化，从「合格」走向「卓越」。

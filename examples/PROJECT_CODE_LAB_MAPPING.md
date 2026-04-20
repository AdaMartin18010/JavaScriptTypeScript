# 示例项目 ↔ Code-Lab 模块关联图谱

> 本文档建立 `examples/` 目录下的所有示例项目与 `jsts-code-lab/` 模块之间的显性关联关系，
> 帮助学习者将理论知识与动手实践紧密结合。

---

## 关联图谱总览

```
examples/
├── beginner-todo-master/ ──────→ jsts-code-lab/00-language-core/
│                                   jsts-code-lab/02-design-patterns/
│                                   jsts-code-lab/07-testing/
│                                   jsts-code-lab/18-frontend-frameworks/
│
├── advanced-compiler-workshop/ ──→ jsts-code-lab/00-language-core/
│                                   jsts-code-lab/10-js-ts-comparison/
│                                   jsts-code-lab/79-compiler-design/
│
├── intermediate-microservice-workshop/
│                               ──→ jsts-code-lab/06-architecture-patterns/
│                                   jsts-code-lab/21-api-security/
│                                   jsts-code-lab/25-microservices/
│                                   jsts-code-lab/70-distributed-systems/
│
├── monorepo-fullstack-saas/ ────→ jsts-code-lab/12-package-management/
│                                   jsts-code-lab/22-deployment-devops/
│                                   jsts-code-lab/59-fullstack-patterns/
│
├── edge-observability-starter/ ──→ jsts-code-lab/32-edge-computing/
│                                   jsts-code-lab/74-observability/
│                                   jsts-code-lab/93-deployment-edge-lab/
│
├── nodejs-api-security-boilerplate/
│                               ──→ jsts-code-lab/21-api-security/
│                                   jsts-code-lab/38-web-security/
│
├── fullstack-tanstack-start/ ────→ jsts-code-lab/18-frontend-frameworks/
│                                   jsts-code-lab/59-fullstack-patterns/
│                                   jsts-code-lab/86-tanstack-start-cloudflare/
│
├── design-patterns-ts/ ──────────→ jsts-code-lab/02-design-patterns/
│
├── edge-ai-inference/ ───────────→ jsts-code-lab/33-ai-integration/
│                                   jsts-code-lab/36-web-assembly/
│                                   jsts-code-lab/82-edge-ai/
│
├── mobile-react-native-expo/ ────→ jsts-code-lab/00-language-core/
│     [P0-1 新增]                     jsts-code-lab/02-design-patterns/
│                                   jsts-code-lab/18-frontend-frameworks/
│                                   docs/categories/16-mobile-development.md
│
├── desktop-tauri-react/ ─────────→ jsts-code-lab/00-language-core/
│     [P0-2 新增]                     jsts-code-lab/02-design-patterns/
│                                   jsts-code-lab/18-frontend-frameworks/
│                                   jsts-code-lab/23-toolchain-configuration/
│                                   docs/platforms/desktop-development.md
│
└── ai-agent-production/ ─────────→ jsts-code-lab/33-ai-integration/
      [P0-3 新增]                     jsts-code-lab/56-code-generation/
                                    jsts-code-lab/94-ai-agent-lab/
                                    jsts-code-lab/21-api-security/
                                    jsts-code-lab/31-serverless/
                                    docs/categories/28-ai-agent-infrastructure.md
```

---

## 详细关联表

### beginner-todo-master

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| Milestone 1: Vanilla JS → TypeScript | `00-language-core/` | 类型覆盖率 ≥ 80% |
| Milestone 2: 组件化设计 | `02-design-patterns/` | 使用 2+ 种设计模式 |
| Milestone 3: 状态管理 | `05-state-management/` | 实现不可变状态更新 |
| Milestone 4: 测试覆盖 | `07-testing/` | 测试覆盖率 ≥ 70% |
| Milestone 5: 构建部署 | `22-deployment-devops/` | CI/CD 流水线通过 |
| Milestone 6: 性能优化 | `08-performance/` | Lighthouse ≥ 85 |

**学习路径**: `docs/learning-paths/beginners-path.md` 阶段 4

---

### advanced-compiler-workshop

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| Milestone 1: Mini Parser | `79-compiler-design/` | 能解析表达式语法 |
| Milestone 2: Type Checker | `10-js-ts-comparison/` | 实现基础类型推断 |
| Milestone 3: 泛型推断 | `00-language-core/` | 支持泛型约束 |
| Milestone 4: 条件类型 | `10-js-ts-comparison/type-theory/` | 实现分布式条件类型 |
| Milestone 5: Type Challenges | `00-language-core/` | 通过 50+ 类型挑战 |

**学习路径**: `docs/learning-paths/advanced-path.md` 形式化验证阶段

---

### intermediate-microservice-workshop

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| Milestone 1: API Gateway | `06-architecture-patterns/` | 实现路由、限流、认证 |
| Milestone 2: 服务发现 | `25-microservices/` | 健康检查 + 负载均衡 |
| Milestone 3: 事件总线 | `03-concurrency/` | 实现发布-订阅模式 |
| Milestone 4: 分布式追踪 | `74-observability/` | OpenTelemetry 集成 |

**学习路径**: `docs/learning-paths/intermediate-path.md` 阶段 4

---

### monorepo-fullstack-saas

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 架构设计 | `12-package-management/` | pnpm workspaces + catalogs |
| 全栈开发 | `59-fullstack-patterns/` | 端到端类型安全 |
| 部署运维 | `22-deployment-devops/` | Docker + CI/CD |

**学习路径**: `docs/learning-paths/intermediate-path.md` 综合项目

---

### edge-observability-starter

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 边缘计算 | `32-edge-computing/` | Cloudflare Workers 部署 |
| 可观测性 | `74-observability/` | 结构化日志 + 指标 |
| 边缘部署 | `93-deployment-edge-lab/` | 边缘函数冷启动 < 50ms |

**学习路径**: `docs/learning-paths/advanced-path.md` 前沿技术阶段

---

### nodejs-api-security-boilerplate

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| API 安全 | `21-api-security/` | OWASP Top 10 防护 |
| Web 安全 | `38-web-security/` | 安全扫描通过 |
| 认证授权 | `95-auth-modern-lab/` | Passkeys + OAuth 2.1 |

**学习路径**: `docs/learning-paths/intermediate-path.md` 阶段 4

---

### fullstack-tanstack-start

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 全栈框架 | `59-fullstack-patterns/` | TanStack Start 完整应用 |
| 边缘部署 | `86-tanstack-start-cloudflare/` | Cloudflare 部署 |
| 前端框架 | `18-frontend-frameworks/` | React 19 + Server Components |

**学习路径**: `docs/learning-paths/intermediate-path.md` 阶段 4

---

### design-patterns-ts

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 创建型模式 | `02-design-patterns/creational/` | 5 种模式实现 |
| 结构型模式 | `02-design-patterns/structural/` | 7 种模式实现 |
| 行为型模式 | `02-design-patterns/behavioral/` | 11 种模式实现 |

**学习路径**: `docs/learning-paths/beginners-path.md` 阶段 2

---

### edge-ai-inference

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| AI 集成 | `33-ai-integration/` | 模型加载 + 推理 |
| WebAssembly | `36-web-assembly/` | WASM 性能提升 |
| 边缘 AI | `82-edge-ai/` | 边缘设备推理 |

**学习路径**: `docs/learning-paths/advanced-path.md` 前沿技术阶段

---

### mobile-react-native-expo [P0-1 新增]

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 跨平台开发 | `18-frontend-frameworks/` | React Native New Architecture |
| 移动端模式 | `02-design-patterns/` | 移动端适配的设计模式 |
| 状态管理 | `05-state-management/` | 移动端状态持久化 |
| 网络请求 | `09-real-world-examples/` | API 客户端 + 离线支持 |

**学习路径**: `docs/learning-paths/intermediate-path.md` 阶段 4
**跟练教程**: `examples/mobile-react-native-expo/TUTORIAL.md`

---

### desktop-tauri-react [P0-2 新增]

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 桌面端开发 | `18-frontend-frameworks/` | Tauri v2 前后端通信 |
| 系统 API | `91-nodejs-core-lab/` | 文件系统 + 系统信息 |
| 安全模型 | `38-web-security/` | Tauri 权限配置 |
| 构建工具 | `23-toolchain-configuration/` | Vite + Rust 构建 |

**学习路径**: `docs/learning-paths/intermediate-path.md` 阶段 4
**跟练教程**: `examples/desktop-tauri-react/TUTORIAL.md`

---

### ai-agent-production [P0-3 新增]

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| AI Agent | `94-ai-agent-lab/` | Mastra + MCP 集成 |
| AI SDK | `33-ai-integration/` | Vercel AI SDK 多模型 |
| 认证安全 | `21-api-security/` | better-auth + RBAC |
| 边缘部署 | `31-serverless/` | Cloudflare Workers 部署 |
| 工作流编排 | `56-code-generation/` | DAG 工作流实现 |

**学习路径**: `docs/learning-paths/advanced-path.md` 前沿技术阶段
**跟练教程**: `examples/ai-agent-production/TUTORIAL.md`

---

## 使用方式

### 对于学习者

1. 选择一条学习路径（`docs/learning-paths/`）
2. 完成每个阶段的理论学习（`jsts-code-lab/` 模块）
3. 完成 Checkpoint 项目（本文档中的验证标准）
4. 对照验证标准自检，全部通过后方可进入下一阶段

### 对于讲师

1. 使用本文档设计课程作业
2. 每个 Checkpoint 项目可作为期中期末项目
3. 验证标准可作为评分 rubric

---

## 维护说明

当新增示例项目时，请在本文档中添加关联记录。
格式模板：

```markdown
### project-name

| 学习路径 | 关联模块 | 验证标准 |
|---------|---------|---------|
| 功能 A | `xx-module/` | 标准 1 |
| 功能 B | `yy-module/` | 标准 2 |

**学习路径**: `docs/learning-paths/xxx-path.md` 阶段 X
```

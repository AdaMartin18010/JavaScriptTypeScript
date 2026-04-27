# TC39 / TypeScript / WinterTC 月度跟踪简报 — 2026 年 5 月

> 跟踪来源: tc39/proposals, microsoft/TypeScript, wintertc.org
> 整理日期: 2026-04-27
> 下次更新: 2026-06-27

---

## 📋 TC39 提案状态更新

### Stage 4 → ES2026 / ES2027

| 提案 | 描述 | 对项目的影响 |
|------|------|-------------|
| **Temporal API** | Date 的现代化替代 | 高 — 已在 `01-ecmascript-evolution` 覆盖；Chrome 144+/Firefox 139+ 已原生支持，Safari TP 跟进中 |
| **Error.isError** | 跨 realm 的 Error 品牌检查 | 中 — 新增安全工具方法 |
| **Math.sumPrecise** | 精确浮点数求和 | 低 — 数值计算场景补充 |
| **Uint8Array Base64** | 原生 Base64 编解码 | 中 — 可替代 atob/btoa 和第三方库 |
| **Explicit Resource Management** | `using` / `await using` 声明自动释放资源 | **高** — 2026-05 TC39 会议确认进入 Stage 4；Chrome/Node/Deno/Moddable XS 已 shipping，Firefox flag 支持 |

### Stage 3 → 即将进入 Stage 4

| 提案 | 描述 | 预计 Stage 4 时间 |
|------|------|-------------------|
| **Decorator Metadata** | 装饰器元数据 API（`Symbol.metadata`） | 2026 Q3 — TypeScript 5.9 已稳定支持；框架迁移中（Angular 18+、NestJS 11+） |
| **Atomics.pause** | 共享内存自旋锁优化 | 2026 Q2 — 实现反馈收集中 |
| **Source Phase Imports** | 导入模块的源码阶段表示 | 2026 Q3 — 工具链（bundler、test runner）集成验证中 |

### Stage 2.7 → 值得关注

| 提案 | 描述 | 风险/机会 |
|------|------|----------|
| **Immutable ArrayBuffer** | 不可变 ArrayBuffer | 安全增强，Web Crypto 场景 |
| **Iterator Chunking** | `Iterator.prototype.chunk` | 数据处理效率提升 |
| **Seeded PRNG** | 可播种伪随机数生成器 | 测试确定性 |
| **Joint Iteration** | 多迭代器同步推进 | 异步流处理场景 |

### Stage 2 / Stage 3 → 早期观察与进度更新

| 提案 | 描述 | 评估 |
|------|------|------|
| **Import Defer** | 延迟加载模块（`import defer * as mod from "./mod"`） | 高潜力 — 首屏优化；**当前 Stage 3**，2026-05 会议讨论实现反馈，预计 2026 Q4 进入 Stage 4 |
| **Import Text** | 导入文本文件为字符串 | 中潜力 — 构建工具简化；Stage 3， bundler 对齐中 |
| **Dynamic Code Brand Checks** | 动态代码加载前的品牌检查 | 安全场景；Stage 3，CSP / eval 治理 |
| **Module Expressions** | 内联模块定义 | 中潜力 — 动态模块场景；Stage 2， Worker 与测试隔离场景 |
| **Pattern Matching** | `match (value) { when {...} -> ... }` | 高潜力 — Rust/OCaml 式匹配；Stage 2，语法与性能仍在细化 |
| **Records & Tuples** | 深层不可变值类型 | **已撤回** — TC39 未达成共识，从跟踪列表移除 |

---

## 🔷 TypeScript 更新跟踪

### TypeScript 7.0 (tsgo)

| 维度 | 状态 | 详情 |
|------|------|------|
| 版本状态 | **Beta**（2026-04-22） | `@typescript/native-preview` 可用 |
| 构建速度 | 10x 提升 | Go 重写，并行解析；VS Code 77.8s → 7.5s |
| Compiler API | 断裂风险 | 工具链作者需迁移至 WASM/LSP |
| `--strict` 默认 | 已启用 | TypeScript 7.0 起 `--strict` 为默认 |
| 废弃项硬化 | 已生效 | `target: es5`、`moduleResolution: node/node10`、AMD/UMD/SystemJS、`baseUrl` 等不再支持 |

**对项目的影响评估**:

- 高 — 需更新 `guides/typescript-7-migration.md`
- 高 — 需评估 jsts-language-core-system 中类型系统文档的兼容性
- 中 — 工具链对比矩阵需加入 tsgo 实测数据
- 中 — Node.js 24 strip-types 与 tsgo 共存策略需明确

### TypeScript 6.x 最新动态

- 6.0 已于 2026-03-23 发布，为最后一个基于 JavaScript 代码基的主要版本
- 6.x 系列是向 7.0 过渡的桥梁版本，主要包含语言服务性能优化与废弃项预警

---

## 🌐 WinterTC / TC55 标准化跟踪

### Minimum Common Web API

| API | 状态 | Node.js | Deno | Bun |
|-----|------|---------|------|-----|
| `fetch` | 标准 | ✅ | ✅ | ✅ |
| `WebSocket` | 标准 | ✅ (实验) | ✅ | ✅ |
| `Blob` / `File` | 标准 | ✅ | ✅ | ✅ |
| `CacheStorage` | 评估中 | ❌ | ✅ | ❌ |
| `CompressionStream` | 标准 | ✅ | ✅ | ✅ |
| **Explicit Resource Management** | Stage 4 | ✅ (v24+) | ✅ | ✅ |

### Hono 与 WinterTC 对齐

- Hono 3.x+ 已通过 WinterTC 兼容性测试
- 成为"WinterTC 世界的 Express"
- 对项目影响：更新 `backend-frameworks-compare.md` 中 Hono 的定位描述

---

## 📊 本月行动清单

- [x] Temporal API Stage 4 确认，更新 ES2026 文档
- [x] tsgo Beta 发布，更新 TS 7.0 迁移指南
- [x] Error.isError / Math.sumPrecise / Uint8Array Base64 定稿
- [x] **Explicit Resource Management Stage 4 确认（2026-05 会议）**
- [ ] **Import Defer** 推进至 Stage 3 后期，跟踪 2026 Q4 Stage 4 预期
- [ ] **Decorator Metadata** 浏览器实现状态（Chrome/SpiderMonkey）
- [ ] **Pattern Matching** Stage 2.7 目标评估
- [ ] Node.js 24 LTS 与 `using` 声明兼容性验证

---

> 自动生成提示：可考虑使用 GitHub API 抓取 tc39/proposals 的 README 变更
> 人工复核：每月最后一个周五由维护者复核并发布

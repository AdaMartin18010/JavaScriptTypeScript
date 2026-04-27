# TC39 / TypeScript / WinterTC 月度跟踪简报 — 2026 年 4 月

> 跟踪来源: tc39/proposals, microsoft/TypeScript, wintertc.org
> 整理日期: 2026-04-27
> 下次更新: 2026-05-27

---

## 📋 TC39 提案状态更新

### Stage 4 → ES2026 (已定稿)

| 提案 | 描述 | 对项目的影响 |
|------|------|-------------|
| **Temporal API** | Date 的现代化替代 | 高 — 已在 `01-ecmascript-evolution` 覆盖，需更新浏览器兼容性矩阵 |
| **Error.isError** | 跨 realm 的 Error 品牌检查 | 中 — 新增安全工具方法 |
| **Math.sumPrecise** | 精确浮点数求和 | 低 — 数值计算场景补充 |
| **Uint8Array Base64** | 原生 Base64 编解码 | 中 — 可替代 atob/btoa 和第三方库 |

### Stage 3 → 即将进入 Stage 4

| 提案 | 描述 | 预计 Stage 4 时间 |
|------|------|-------------------|
| **Explicit Resource Management** | `using` 声明自动释放资源 | 2026 Q2 |
| **Decorator Metadata** | 装饰器元数据 API | 2026 Q3 |
| **Atomics.pause** | 共享内存自旋锁优化 | 2026 Q2 |

### Stage 2.7 → 值得关注

| 提案 | 描述 | 风险/机会 |
|------|------|----------|
| **Immutable ArrayBuffer** | 不可变 ArrayBuffer | 安全增强，Web Crypto 场景 |
| **Iterator Chunking** | `Iterator.prototype.chunk` | 数据处理效率提升 |
| **Seeded PRNG** | 可播种伪随机数生成器 | 测试确定性 |

### Stage 2 → 早期观察

| 提案 | 描述 | 评估 |
|------|------|------|
| **Import Defer** | 延迟加载模块 | 高潜力 — 首屏优化 |
| **Import Bytes** | 导入二进制文件为 Uint8Array | 中潜力 — 资源打包简化 |
| **Module Expressions** | 内联模块定义 | 中潜力 — 动态模块场景 |

---

## 🔷 TypeScript 更新跟踪

### TypeScript 7.0 (tsgo)

| 维度 | 状态 | 详情 |
|------|------|------|
| 版本状态 | Beta (2026-04) | `@typescript/native-preview` |
| 构建速度 | 10x 提升 | Go 重写，并行解析 |
| Compiler API | 断裂风险 | 工具链作者需迁移至 WASM/LSP |
| `--strict` 默认 | 计划中 | 可能在 7.0 或 8.0 启用 |
| `stableTypeOrdering` | 新配置项 | 类型检查顺序稳定性 |

**对项目的影响评估**:

- 高 — 需更新 `guides/typescript-7-migration.md`
- 高 — 需评估 jsts-language-core-system 中类型系统文档的兼容性
- 中 — 工具链对比矩阵需加入 tsgo 实测数据

### TypeScript 6.x 最新动态

- 6.0 Beta 已发布，主要包含语言服务性能优化
- 6.x 系列是向 7.0 过渡的桥梁版本

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

### Hono 与 WinterTC 对齐

- Hono 3.x+ 已通过 WinterTC 兼容性测试
- 成为"WinterTC 世界的 Express"
- 对项目影响：更新 `backend-frameworks-compare.md` 中 Hono 的定位描述

---

## 📊 本月行动清单

- [x] Temporal API Stage 4 确认，更新 ES2026 文档
- [x] tsgo Beta 发布，更新 TS 7.0 迁移指南
- [x] Error.isError / Math.sumPrecise / Uint8Array Base64 定稿
- [ ] Import Defer 进度跟踪（Stage 2 → 2.7）
- [ ] Explicit Resource Management Stage 4 预期（2026-05 会议）
- [ ] Decorator Metadata 浏览器实现状态

---

> 自动生成提示：可考虑使用 GitHub API 抓取 tc39/proposals 的 README 变更
> 人工复核：每月最后一个周五由维护者复核并发布

# 文档工程理论：从注释到文档站点

> **目标读者**：技术写作者、开源维护者、重视开发者体验的团队
> **关联文档**：[`docs/categories/29-documentation.md`](../../docs/categories/29-documentation.md)
> **版本**：2026-04
> **字数**：约 3,500 字

---

## 1. 文档工程的定义与价值

### 1.1 为什么文档是"一等公民"

在软件工程中，文档常被贬为"事后补充"。但 2025-2026 年的网络现实证明：**文档质量直接决定项目采用率**。

| 项目 | Stars | 文档特点 |
|------|-------|---------|
| Next.js | 130K+ | 交互式教程 + 部署模板 |
| shadcn/ui | 80K+ | 组件级复制粘贴 + 设计令牌 |
| Prisma | 40K+ | 多语言文档 + 实时 Playground |

文档不仅降低学习成本，更是**API 契约的权威来源**、**团队知识沉淀的载体**、**社区贡献的入口**。

### 1.2 文档工程的层次模型

```
L4 文档站点 (VitePress / Docusaurus / Nextra)
    ↓ 自动生成
L3 API 参考 (TypeDoc / JSDoc → JSON → 渲染)
    ↓ 从代码提取
L2 代码注释 (JSDoc / TSDoc / Python Docstring)
    ↓ 人工编写
L1 设计文档 (RFC / ADR / 架构图)
    ↓ 团队协作
L0 需求与规范 (PRD / 用户故事)
```

**关键洞察**：每一层都依赖下一层的质量。如果 L2 代码注释缺失，L3 自动生成只能是骨架。

---

## 2. API 文档生成方法论

### 2.1 JSDoc / TSDoc 标准

TSDoc 是微软主导的标准化注释格式，目标是**让工具理解你的注释**。

**TSDoc 核心标签**：

| 标签 | 用途 | 示例 |
|------|------|------|
| `@param` | 参数说明 | `@param options - 配置对象` |
| `@returns` | 返回值 | `@returns 用户的显示名称` |
| `@throws` | 异常说明 | `@throws {ValidationError} 当 email 格式非法时` |
| `@example` | 使用示例 | `@example \nconst name = getUserName(user);` |
| `@deprecated` | 废弃标记 | `@deprecated 使用 v2 API` |
| `@internal` | 内部 API | `@internal 不要直接使用` |
| `@alpha` / `@beta` | 稳定性 | `@beta 此 API 可能变更` |

**反例**：

```typescript
// ❌ 模糊的注释
function process(data: any) {
  // do something with data
}

// ✅ TSDoc 标准注释
/**
 * 处理用户提交的数据，执行验证和转换。
 *
 * @param data - 原始用户数据，必须包含 `email` 和 `name` 字段
 * @returns 处理后的标准化用户对象
 * @throws {ValidationError} 当必填字段缺失或格式非法时
 *
 * @example
 * ```typescript
 * const user = processUserData({ email: "a@b.com", name: "Alice" });
 * console.log(user.normalizedEmail); // "a@b.com"
 * ```
 */
function processUserData(data: unknown): ProcessedUser {
  // ...
}
```

### 2.2 自动生成工具链

```
源代码 (TS/JS)
    ↓ TypeDoc / JSDoc
JSON 中间格式 (typedoc-json)
    ↓ 自定义主题 / VitePress 插件
渲染后的 HTML / Markdown
    ↓ GitHub Pages / Vercel / Netlify
在线文档站点
```

**工具对比**：

| 工具 | 输入 | 输出 | 特点 |
|------|------|------|------|
| **TypeDoc** | TypeScript | HTML / JSON | TS 生态标准，支持自定义主题 |
| **JSDoc** | JavaScript | HTML | 老牌工具，生态广泛 |
| **api-extractor** | TypeScript | .d.ts + 报告 | 微软出品，适合库发布 |
| **ts-morph** | AST | 自定义 | 底层 API，灵活度高 |

### 2.3 代码与文档的同步策略

**问题**：代码更新后，文档不同步是最常见的文档腐烂原因。

**解决方案矩阵**：

| 策略 | 实现方式 | 适用场景 |
|------|---------|---------|
| **CI 阻断** | 提交时运行 TypeDoc，文档变更未同步则拒绝合并 | 开源库、API 产品 |
| **自动生成** | 文档完全从代码注释生成，无独立维护成本 | 内部工具、快速迭代项目 |
| **文档即代码** | Markdown 与源码同仓库，PR 一并审查 | 所有项目 |
| **版本锁定** | 每个版本有独立文档分支，旧版本文档冻结 | 长期维护的框架 |

---

## 3. 文档驱动开发 (Documentation-Driven Development)

### 3.1 DDD 工作流

```
1. 编写设计文档 (RFC) → 2. 编写 API 文档草稿 → 3. 实现代码 → 4. 验证文档准确性 → 5. 发布
```

**关键原则**：在写第一行实现代码之前，先写出**目标用户能看懂的文档**。

### 3.2 Readme-Driven Development

对于小型库，README 驱动的开发足够有效：

1. 先写 README 中的**安装说明**
2. 再写**最小使用示例**
3. 然后写**API 概述**
4. 最后实现代码，确保 README 中的示例能直接运行

---

## 4. 文档站点构建

### 4.1 主流工具选型

| 工具 | 技术栈 | 优势 | 劣势 |
|------|--------|------|------|
| **VitePress** | Vue + Vite | 极快冷启动、Vue 生态、默认主题美观 | Vue 依赖 |
| **Docusaurus** | React + Webpack | 插件丰富、i18n 完善、版本化 | 构建较慢 |
| **Nextra** | React + Next.js | 基于 Next.js、SSG/SSR 灵活 | Next.js 版本锁定 |
| **Astro Starlight** | Astro | 零 JS 默认、性能极致 | 新工具，生态较小 |
| **MkDocs** | Python | Python 生态、Material 主题美观 | 非 JS 生态 |

### 4.2 文档站点架构设计

```
docs/
├── getting-started/          # 快速开始
│   ├── installation.md
│   └── first-steps.md
├── guides/                   # 深度指南
│   ├── configuration.md
│   └── deployment.md
├── api/                      # API 参考（自动生成）
│   └── reference.md
├── examples/                 # 示例集合
│   └── cookbook.md
└── contribute.md             # 贡献指南
```

---

## 5. 文档质量评估

### 5.1 量化指标

| 指标 | 测量方式 | 目标值 |
|------|---------|--------|
| **文档覆盖率** | 公共 API 中有注释的比例 | > 90% |
| **示例可运行率** | 文档中代码示例能直接运行的比例 | > 95% |
| **文档新鲜度** | 最后一次更新距今天数 | < 30 天 |
| **用户反馈率** | 文档页面的 "有帮助/无帮助" 比例 | > 80% |
| **搜索命中率** | 用户通过搜索找到所需内容的比例 | > 70% |

### 5.2 文档审查清单

```markdown
- [ ] 安装说明在干净环境中可复现
- [ ] 所有代码示例经过实际运行验证
- [ ] API 文档覆盖所有公共导出
- [ ] 变更日志 (Changelog) 与版本号对应
- [ ] 错误处理场景有明确说明
- [ ] 性能特征有基准数据
- [ ] 多语言支持（如适用）
```

---

## 6. 反模式与陷阱

### 反模式 1：文档与代码分离

❌ 文档放在独立 wiki，代码在 GitHub。
✅ 文档即代码，Markdown 与源码同仓库。

### 反模式 2：过度文档化

❌ 为内部工具写 50 页用户手册。
✅ 根据用户调研决定文档深度，README + 几个示例往往足够。

### 反模式 3：自动生成的文档不加人工审查

❌ TypeDoc 生成后直接发布，API 描述都是 "参数 p1" "返回值 r"。
✅ 自动生成后人工润色，确保描述有语义价值。

### 反模式 4：文档不更新

❌ v3.0 发布后，文档仍写着 v2.x 的 API。
✅ CI 中集成文档新鲜度检查，超期自动提醒。

---

## 7. 总结

文档工程不是"写完就忘"的一次性任务，而是**与代码同等重要的持续维护过程**。

**三个核心原则**：

1. **文档即代码**：同仓库、同审查、同 CI
2. **自动化优先**：能生成的不要手写，能验证的不要人眼检查
3. **用户视角**：文档的目标读者是"未来的自己"和"新加入的队友"

---

## 参考资源

- [TSDoc 规范](https://tsdoc.org/)
- [TypeDoc 官方文档](https://typedoc.org/)
- [Diátaxis 文档框架](https://diataxis.fr/) — 教程/指南/参考/解释四象限
- [Write the Docs](https://www.writethedocs.org/) — 技术写作者社区

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `api-docs-generator.ts`
- `index.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27

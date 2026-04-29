# CSS 框架 (CSS Frameworks)

> 2026 年 CSS 工具链全景：从原子化 CSS 到类型安全样式系统的选型矩阵。

---

## 核心概念

现代 CSS 框架分为**两大范式**：

| 范式 | 特点 | 代表 |
|------|------|------|
| **Utility-First（原子化）** | 小工具类组合，HTML 内联样式 | Tailwind, UnoCSS |
| **CSS-in-JS（对象化）** | TypeScript 对象定义样式，编译时提取 | Panda CSS, Styled Components |
| **Component-Based** | 预构建组件，快速搭建 UI | Bootstrap, shadcn/ui |

> **2026 共识**：Utility-First 已成为主流，但类型安全和设计系统需求推动 CSS-in-JS 方案（Panda）崛起。

---

## 工具对比矩阵

| 维度 | Tailwind CSS v4 | UnoCSS | Panda CSS | Bootstrap 6 |
|------|----------------|--------|-----------|-------------|
| **引擎** | Lightning CSS (Rust) | Vite 原生 | 代码生成 + 提取 | Sass |
| **构建速度** | ~30ms (v4) | ~0.9s (cold) | ~1.2s (cold) | 预编译 |
| **包体积 (gz)** | ~3.2KB | ~2.8KB | ~4.1KB | ~18.7KB |
| **类型安全** | ❌（字符串类名） | ❌（字符串类名） | ✅（TS 对象） | ❌ |
| **运行时** | 零 | 零 | 零 | 零 |
| **生态系统** | 最大（UI 库/模板） | 中等（预设生态） | 较小（Chakra 生态） | 大但老旧 |
| **学习曲线** | 低 | 中–高 | 中–高 | 低 |
| **无障碍 (WCAG)** | 依赖开发者 | 依赖开发者 | 部分内置 | 内置 ARIA |
| **RSC 兼容** | ✅ | ✅ | ✅（设计初衷） | ✅ |
| **配置方式** | CSS `@theme` | 预设 + 规则 | `panda.config.ts` | Sass 变量 |

---

## Tailwind CSS v4 关键升级

### 从 PostCSS 到 Lightning CSS

| 特性 | v3 (PostCSS) | v4 (Lightning CSS) |
|------|-------------|-------------------|
| 构建速度 | ~300ms | ~30ms (**10x**) |
| 配置 | `tailwind.config.js` | CSS `@theme` 指令 |
| 内容检测 | 手动 `content` 配置 | 自动检测 |
| 容器查询 | 需插件 | 内置 |
| 引擎语言 | JavaScript | Rust |

### v4 配置示例

```css
/* input.css */
@import "tailwindcss";

@theme {
  --color-brand: #0ea5e9;
  --font-sans: "Inter", sans-serif;
}
```

### 迁移路径

```bash
# 官方 codemod 自动迁移
npx @tailwindcss/upgrade
# 多数项目可在 10 分钟内完成升级
```

---

## 选型决策树

```
项目需求？
├── 快速 MVP / 内部工具 → Bootstrap 6（组件丰富，开箱即用）
├── 标准 Web 应用 / SaaS →
│   ├── 追求生态与招聘友好 → Tailwind CSS v4
│   ├── 追求极致构建速度 + 定制化 → UnoCSS
│   └── 设计系统 + 类型安全优先 → Panda CSS
└── 已有组件库（shadcn/ui, Radix）→ Tailwind（默认样式引擎）
```

---

## 2026 新兴趋势

### Pico CSS v2

- **零类名**：样式原生 HTML 元素，无需学习工具类
- **自动暗色模式**：基于 `prefers-color-scheme`
- **体积极小**：~4.1KB gzipped，无障碍评分 96/100
- **适用场景**：文档站、内部工具、快速原型

### Open Props

- **设计令牌即 CSS 变量**：`--color-1`, `--size-3`
- **无构建步骤**：直接通过 CDN 使用
- **可组合**：与任何 CSS 方法论共存

### CSS 容器查询普及

Tailwind v4 和 UnoCSS 均已内置 `@container` 支持，响应式设计从 viewport 优先转向**组件级自适应**。

---

## 性能基准

**生产项目对比（15K–50K LOC，Next.js + React 18）**：

| 指标 | Tailwind v4.1 | UnoCSS | Panda CSS |
|------|--------------|--------|-----------|
| Cold Build | 4.8s | 0.9s ✓ | 1.2s |
| Hot Reload | 420ms | 85ms ✓ | 110ms |
| 生产包体积 | 48KB | 18KB ✓ | 22KB |
| Dev 包体积 | 3.2MB | 240KB | 180KB ✓ |

> 测试环境：MacBook Pro M3, 16GB RAM。数据来自 2025-12 至 2026-01 生产项目实测。

---

## 最佳实践

1. **Tailwind 作为默认**：最大生态、最低学习成本、所有框架模板原生支持
2. **暗色模式策略**：使用 `darkMode: 'class'` 配合 next-themes 实现可切换主题
3. **设计令牌统一**：通过 `@theme` 或 CSS 变量定义品牌色，避免硬编码
4. **组件抽象**：使用 `@apply` 或 shadcn/ui 模式，避免 HTML 中 20+ 个工具类堆叠
5. **性能监控**：生产构建后检查 CSS 包体积，Tailwind v4 典型值为 15–25KB gzipped

---

## 参考资源

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [UnoCSS Documentation](https://unocss.dev/)
- [Panda CSS Documentation](https://panda-css.com/)
- [Tailwind CSS v4 Complete Guide (2026)](https://www.mortexsolutions.com/blog/tailwind-css-v4-complete-guide-2026)
- [Tailwind vs UnoCSS vs Panda (2026)](https://trybuildpilot.com/360-tailwind-css-vs-unocss-vs-panda-css-2026)

---

## 关联文档

- `30-knowledge-base/30.2-categories/05-forms.md`
- `20-code-lab/20.5-frontend-frameworks/ui-components/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*

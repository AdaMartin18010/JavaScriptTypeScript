# CSS-in-JS 样式方案

> JavaScript 生态 CSS-in-JS 方案选型：从运行时样式到编译时提取的演进。

---

## 方案对比

| 方案 | 运行时 | 包体积 | TypeScript | SSR | 2026 状态 |
|------|--------|--------|------------|-----|----------|
| **Styled Components** | ✅ | ~12KB | 良好 | 需配置 | ⚠️ 维护放缓 |
| **Emotion** | ✅ | ~10KB | 良好 | 需配置 | ⚠️ 维护放缓 |
| **Linaria** | ❌（编译时） | 0 | 良好 | 原生 | ✅ 活跃 |
| **Panda CSS** | ❌（编译时） | 0 | 优秀 | 原生 | ✅ 快速增长 |
| **Vanilla Extract** | ❌（编译时） | 0 | 优秀 | 原生 | ✅ 活跃 |
| **Tailwind + CSS Modules** | ❌ | 0 | 需配置 | 原生 | ✅ 主流 |

---

## 2026 趋势

**运行时 CSS-in-JS 衰退**：Styled Components 和 Emotion 因 RSC（React Server Components）兼容性问题，在 Next.js App Router 中难以使用。社区转向：

- **编译时方案**：Panda CSS, Vanilla Extract, Linaria
- **原子化 CSS**：Tailwind CSS（最主流选择）
- **CSS Modules**：零运行时开销，TypeScript 通过 `*.module.css.d.ts` 支持

---

## 选型建议

| 场景 | 推荐方案 |
|------|---------|
| Next.js App Router | Tailwind CSS 或 Panda CSS |
| 设计系统 | Panda CSS（类型安全令牌） |
| 零依赖偏好 | CSS Modules + PostCSS |
| 遗留项目维护 | 保持 Styled Components，逐步迁移 |

---

*最后更新: 2026-04-29*

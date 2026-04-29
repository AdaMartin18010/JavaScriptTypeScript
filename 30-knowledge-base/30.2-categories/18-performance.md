# 性能优化 (Performance)

> Web 性能优化的系统化框架：从 Core Web Vitals 到 JavaScript 运行时性能的深度实践指南。

---

## 核心概念

性能优化围绕**三个指标**和**两个维度**展开：

| 指标 | 目标 | 测量工具 |
|------|------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals Extension |
| **INP** (Interaction to Next Paint) | < 200ms | Chrome DevTools, CrUX |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |

| 维度 | 关注点 |
|------|--------|
| **加载性能** | 资源大小、网络策略、渲染阻塞 |
| **运行时性能** | 主线程占用、内存泄漏、重渲染 |

> **关键更新**：FID (First Input Delay) 已于 2024-03 被 INP 取代，INP 测量整个页面生命周期中的所有交互延迟。

---

## 优化策略矩阵

| 策略 | 加载性能 | 运行时性能 | 实施复杂度 |
|------|---------|-----------|-----------|
| **资源压缩 + Brotli/Gzip** | ✅ 显著 | — | 低 |
| **图片优化（WebP/AVIF）** | ✅ 显著 | — | 低 |
| **代码分割（Code Splitting）** | ✅ 显著 | — | 中 |
| **Tree Shaking** | ✅ 中等 | — | 低（构建工具自动） |
| **懒加载（Lazy Load）** | ✅ 显著 | — | 低 |
| **预加载关键资源** | ✅ 中等 | — | 低 |
| **Service Worker 缓存** | ✅ 显著 | — | 中 |
| **减少主线程工作** | — | ✅ 显著 | 高 |
| **虚拟列表（Virtual List）** | — | ✅ 显著 | 中 |
| **React Compiler（自动记忆化）** | — | ✅ 显著 | 低（React 19） |
| **Web Workers / WASM** | — | ✅ 中等 | 高 |

---

## JavaScript 特定优化

### bundle 体积控制

```javascript
// 分析 bundle 体积
npx vite-bundle-visualizer
npx @next/bundle-analyzer
```

| 技术 | 效果 | 说明 |
|------|------|------|
| **动态导入** | 减少初始包 | `import('./heavy-module')` |
| **barrels 优化** | 避免全量导入 | 不用 `index.ts` 聚合导出 |
| **日期库替换** | -80% 体积 | date-fns / dayjs 替代 moment |
| **lodash 按需** | -90% 体积 | `lodash-es` 或单函数包 |

### React 性能模式

| 模式 | 适用场景 | API |
|------|---------|-----|
| **组件记忆化** | 纯展示组件，props 不变 | React.memo |
| **值记忆化** |  expensive 计算 | useMemo |
| **回调记忆化** | 子组件依赖回调 | useCallback |
| **自动记忆化** | React 19+ 所有组件 | React Compiler |
| **状态 Colocation** | 减少 Context 订阅 | 将状态移至最近叶子 |

> **React 19 变化**：Compiler 自动处理记忆化，手动 `useMemo`/`useCallback` 逐步淘汰。

---

## 2026 生态动态

### INP 优化实战

INP 测量从用户交互到下一帧绘制的时间：

- **目标 < 200ms**：良好的交互响应
- **瓶颈来源**：长任务（>50ms）阻塞主线程

```javascript
// 将长任务拆分为小块
await scheduler.yield();  // Chrome 129+，主动让出主线程
```

### 边缘缓存策略

| 平台 | 缓存层级 | 配置方式 |
|------|---------|---------|
| Vercel | Edge / CDN / 浏览器 | `vercel.json` + Headers |
| Cloudflare | CDN / 浏览器 | Cache Rules + Workers |
| Netlify | CDN / 浏览器 | `_headers` + `_redirects` |

### 核心优化清单

- [ ] 启用 Brotli 压缩（比 Gzip 小 15–25%）
- [ ] 使用 `<img loading="lazy">` 和 `fetchpriority`
- [ ] 预连接关键域名：`<link rel="preconnect">`
- [ ] 字体 `font-display: swap` 避免 FOIT
- [ ] 第三方脚本延迟加载（Google Analytics, 广告）
- [ ] INP 监控：部署 CrUX 数据收集

---

## 参考资源

- [web.dev/performance](https://web.dev/performance) — Google 性能指南
- [Core Web Vitals](https://web.dev/vitals/) — 官方文档
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [INP Optimization Guide](https://web.dev/articles/optimize-inp)

---

## 关联文档

- `30-knowledge-base/30.2-categories/10-css-frameworks.md`
- `20-code-lab/20.9-observability-security/performance/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*

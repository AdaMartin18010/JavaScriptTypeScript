---
title: 浏览器 APIs 完全指南 2026
description: "Awesome JS/TS Ecosystem 指南: 浏览器 APIs 完全指南 2026"
---

---
title: 浏览器 APIs 完全指南 2026
description: "2025-2026 浏览器 Web Platform APIs 完全指南，覆盖 ES2025/ES2026、View Transitions、Popover、WebGPU、Observables 等新特性"
---

# 浏览器 APIs 完全指南 2026

> 最后更新: 2026-05-01 | 对齐: Baseline 2025/2026, ECMAScript 2025/2026

---

## ECMAScript 2025/2026 语言特性

### ES2025 (已发布)

| 特性 | 代码示例 | 浏览器支持 |
|------|---------|-----------|
| `Object.groupBy` | `Object.groupBy(items, ({ type }) => type)` | Baseline 2025 |
| `Map.groupBy` | `Map.groupBy(items, ({ status }) => status)` | Baseline 2025 |
| `Promise.withResolvers` | `const { promise, resolve, reject } = Promise.withResolvers()` | Baseline 2025 |
| `Atomics.waitAsync` | `await Atomics.waitAsync(lock, 0, 1)` | Baseline 2025 |
| RegExp `v` flag | `/[\p{Emoji}]/v` | Baseline 2025 |

### ES2026 Stage 3 提案

| 特性 | 状态 | 预计发布 |
|------|------|---------|
| **Import Defer** | Stage 3 | ES2026 |
| **Temporal API** | Stage 3 | ES2026 |
| **Pattern Matching** | Stage 2.7 | ES2027? |
| **Records & Tuples** | Stage 2 | 待定 |
| **Decorator Metadata** | Stage 3 | ES2026 |

---

## Web Platform 新 APIs

### 视图过渡与动画

```javascript
// View Transitions API (Baseline 2025)
document.startViewTransition(() => updateDOM());
```

| API | 说明 | 支持 |
|-----|------|------|
| **View Transitions** | 跨页面/同页面 DOM 变更的平滑动画 | Chrome 126+, Firefox 开发中 |
| **Scroll-driven Animations** | CSS 动画由滚动位置驱动 | Chrome 115+, Safari 18+ |
| **Popover API** | 原生弹窗/下拉/提示 | Baseline 2024 |
| **Anchor Positioning** | 元素相对于锚点定位 | Chrome 125+, Firefox 开发中 |

### 性能与加载

| API | 说明 | 支持 |
|-----|------|------|
| **Speculation Rules** | 预渲染/预取下一页 | Chrome 121+ |
| **Long Animation Frames** | 测量长动画帧耗时 | Chrome 123+ |
| **Early Hints (103)** | 服务器提前发送资源提示 | 服务器 + 浏览器协作 |
| **Critical-CH** | 客户端提示的优先级处理 | Chrome 108+ |

### 存储与文件

| API | 说明 | 支持 |
|-----|------|------|
| **Storage Buckets** | 隔离的存储分区 | Chrome 122+ |
| **OPFS (Origin Private FS)** | 高性能文件系统访问 | Baseline 2023 |
| **File System Access** | 原生文件选择器 | Chrome/Edge |

### 安全与隐私

| API | 说明 | 支持 |
|-----|------|------|
| **Trusted Types** | 防止 DOM XSS | Chrome 83+ |
| **Credential Management** | Passkeys / WebAuthn | Baseline 2024 |
| **Storage Access API** | 跨站 Cookie 访问请求 | Baseline 2024 |
| **CHIPS** | 分区第三方 Cookie | Chrome 114+ |

### PWA 与设备集成

| API | 说明 | 支持 |
|-----|------|------|
| **Badging API** | 应用图标角标 | Baseline 2024 |
| **Contact Picker** | 访问设备联系人 | Chrome 80+ |
| **File Handling** | PWA 作为文件默认打开方式 | Chrome 102+ |
| **Web Share API Level 2** | 分享文件 | Baseline 2023 |
| **Window Controls Overlay** | 自定义标题栏 | Chrome 105+ |

---

## CSS 2025/2026 新特性

| 特性 | 说明 | 支持 |
|------|------|------|
| **CSS Nesting** | 原生嵌套选择器 | Baseline 2023 |
| **`:has()`** | 父选择器 | Baseline 2023 |
| **Container Queries** | 基于容器尺寸查询 | Baseline 2023 |
| **`@layer`** | 级联层控制优先级 | Baseline 2022 |
| **CSS Subgrid** | 子网格布局 | Firefox, Safari 16+ |
| **`color-mix()`** | 颜色混合 | Baseline 2024 |
| **Scoped CSS** | `@scope` 规则 | Chrome 118+ |

---

## 网络 APIs

| API | 说明 | 支持 |
|-----|------|------|
| **fetch priority** | `fetch(url, { priority: 'high' })` | Baseline 2024 |
| **fetch streaming** | 请求/响应流式处理 | Baseline 2022 |
| **WebTransport** | HTTP/3 双向流 | Chrome 97+ |
| **Compression Streams** | 原生 gzip/deflate | Baseline 2023 |

---

## WebAssembly 2025/2026

| 特性 | 说明 | 状态 |
|------|------|------|
| **WASM 2.0** | 多内存、SIMD、异常处理 | 广泛支持 |
| **Component Model** | 跨语言组件接口 | 预览阶段 |
| **WASI Preview 2** | 系统接口标准化 | 预览阶段 |
| **JS String Builtins** | 直接操作 JS 字符串 | 提案中 |

---

## Baseline 概念

**Baseline**: WebDX 社区组定义的标准，表示一个 Web 平台特性在所有主流浏览器（Chrome、Edge、Firefox、Safari）中可用。

- **Baseline 2024**: 2024 年及之前在所有浏览器中可用的特性
- **Baseline 2025**: 2025 年达成广泛支持的特性
- **Newly available**: 刚在所有浏览器中可用

---

## 参考资源

- [MDN Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline)
- [Web Platform Baseline](https://web-platform-dx.github.io/web-features/)
- [Can I Use](https://caniuse.com/)
- [ECMAScript Proposals](https://github.com/tc39/proposals)
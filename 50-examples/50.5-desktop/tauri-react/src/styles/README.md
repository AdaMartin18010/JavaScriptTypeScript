# 样式目录 (styles)

> **路径**: `50-examples/50.5-desktop/tauri-react/src/styles/`

## 概述

此目录管理 Tauri + React 桌面应用的全部全局样式资源。与组件级 `*.module.css` 或 Tailwind 的 utility classes 不同，`src/styles/` 专注于**跨页面、跨组件的样式基础设施**，包括 CSS 变量主题系统、Tailwind 指令入口、以及桌面应用特有的平台适配样式。

## 文件说明

| 文件 | 说明 |
|------|------|
| `globals.css` | 全局样式入口文件，包含 Tailwind 三层指令、CSS 变量主题定义、Tauri 标题栏适配与滚动条美化 |

## 核心内容详解

### 1. Tailwind CSS 三层指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

这三行是 Tailwind CSS 的编译入口：

- **`@tailwind base`**：注入 CSS Reset（Preflight）与基础样式
- **`@tailwind components`**：注入由 `@layer components` 定义的组件级样式
- **`@tailwind utilities`**：注入所有 utility classes（`flex`、`bg-red-500`、`p-4` 等）

在桌面应用中，Tailwind 的 utility-first 方法论同样适用，且由于无需考虑移动端适配的复杂度，可以更充分地利用其设计系统能力。

### 2. CSS 变量主题系统 (Theming)

文件中使用 `@layer base` 定义了一套完整的 CSS 自定义属性（Custom Properties），覆盖：

| 变量前缀 | 用途 |
|----------|------|
| `--background` / `--foreground` | 页面主背景与文字颜色 |
| `--primary` / `--primary-foreground` | 主按钮、关键交互元素 |
| `--secondary` / `--secondary-foreground` | 次要按钮、标签、徽章 |
| `--muted` / `--muted-foreground` | 禁用态、辅助文字、描述信息 |
| `--accent` | 悬停、聚焦、选中态高亮 |
| `--destructive` | 危险操作（删除、退出） |
| `--border` / `--input` / `--ring` | 边框、输入框、聚焦环 |
| `--radius` | 圆角基准值 |

通过 `:root`（亮色模式）与 `.dark`（暗色模式）两套变量值，应用可以一键切换主题，无需修改任何组件代码。

### 3. Tauri 自定义标题栏样式

桌面应用常需要隐藏系统默认标题栏以实现沉浸式 UI，此时必须手动声明可拖拽区域：

```css
[data-tauri-drag-region] {
  -webkit-app-region: drag;
  app-region: drag;
}

[data-tauri-drag-region] button,
[data-tauri-drag-region] a {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
```

- **`drag`**：该区域支持点击拖拽移动窗口
- **`no-drag`**：按钮、链接等交互元素必须排除在拖拽区域外，否则无法点击

### 4. 滚动条美化

使用 `::-webkit-scrollbar` 伪元素统一 WebKit 内核浏览器（Tauri 默认使用系统 WebView）的滚动条外观：

- 窄边框设计（`8px`），与整体 UI 风格协调
- 悬停时颜色加深，提供视觉反馈
- 轨道透明，最大化内容展示区域

## 开发规范

1. **避免直接写元素选择器**：除 `body`、`*` 等全局重置外，优先使用 Tailwind classes 或 `@layer components` 定义具名样式。
2. **变量命名语义化**：CSS 变量应描述用途（`--primary`）而非具体色值（`--blue-500`），便于主题切换。
3. **平台兼容性测试**：Tauri 在 Windows 使用 WebView2、macOS 使用 WKWebView、Linux 使用 WebKitGTK，CSS 特性需在各平台验证。
4. **暗色模式切换**：通过给 `<html>` 添加/移除 `.dark` 类实现，可在 React 中监听系统主题或提供手动切换按钮。

## 扩展方向

- **`animations.css`**：定义桌面应用常用的微交互动画（窗口弹出、侧边栏滑入、Toast 通知）
- **`fonts.css`**：引入自定义字体文件，统一跨平台字体栈
- **`print.css`**：若应用支持打印预览，可在此定义打印专用样式

---

*此目录是整个应用视觉体系的根基，CSS 变量的统一设计决定了产品在不同主题、不同平台下的一致性与专业感。*

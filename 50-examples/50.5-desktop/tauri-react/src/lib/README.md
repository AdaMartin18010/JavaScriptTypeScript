# 前端工具库目录 (lib)

> **路径**: `50-examples/50.5-desktop/tauri-react/src/lib/`

## 概述

此目录存放 Tauri + React 桌面应用的前端通用工具函数与辅助模块。在桌面应用架构中，`src/lib/` 扮演"共享基础设施"的角色：所有 React 组件、页面、Hooks 都可以从这里导入与 UI 框架无关的纯函数逻辑，从而实现关注点分离与代码复用。

## 文件说明

| 文件 | 说明 |
|------|------|
| `utils.ts` | 通用工具函数集合，包括类名合并、文件大小格式化、日期格式化、防抖函数 |

## 核心工具详解

### 1. `cn(...inputs: ClassValue[]): string`

Tailwind CSS 类名合并函数，基于 `clsx` + `tailwind-merge` 实现：

- **条件类名**：根据状态动态拼接类名字符串
- **冲突解决**：当多个类名作用于同一属性时，智能保留优先级最高的声明
- **外部覆盖**：允许通过 `className` prop 覆盖组件内部默认样式

这是与 shadcn/ui 生态兼容的标准工具，在整个 React 前端代码库中被广泛使用。

### 2. `formatFileSize(bytes: number, decimals?: number): string`

将字节数转换为人类可读的文件大小字符串：

```ts
formatFileSize(1536);        // "1.5 KB"
formatFileSize(1048576);     // "1 MB"
formatFileSize(1073741824, 0); // "1 GB"
```

在桌面应用中，此函数常用于文件管理器、资源监视器、上传列表等需要展示文件元数据的场景。

### 3. `formatDate(timestamp: number): string`

将 Unix 时间戳（毫秒）格式化为本地化的日期时间字符串：

```ts
formatDate(Date.now()); // "2026/4/29 14:30:00"（取决于 locale）
```

配合 Tauri 后端命令返回的 `modified_at` 字段，可在文件列表中展示友好的修改时间。

### 4. `debounce<T>(fn: T, delay: number): (...args: Parameters<T>) => void`

标准防抖函数，常用于：

- **搜索输入**：用户连续输入时只触发最后一次查询
- **窗口调整**：监听 resize 事件时避免频繁重绘
- **表单校验**：输入完成后延迟校验，减少即时反馈的干扰

```ts
const debouncedSearch = debounce((query: string) => {
  fetchSearchResults(query);
}, 300);
```

## 开发规范

1. **纯函数优先**：`lib/` 中的函数应尽量无副作用，不直接操作 DOM、不访问 Tauri API、不依赖 React 生命周期。
2. **类型安全**：所有公共函数都必须有完整的 TypeScript 类型签名，使用泛型时需提供约束说明。
3. **单测覆盖**：工具函数最适合单元测试，建议配合 Vitest 为每个函数编写边界用例（空值、极大/极小值、特殊字符等）。
4. **命名约定**：文件名使用 `camelCase`，导出函数使用 `camelCase`，常量使用 `SCREAMING_SNAKE_CASE`。

## 扩展方向

随着应用功能增加，可向此目录添加：

- **`storage.ts`**：对 `localStorage` 的封装，支持 JSON 序列化与类型安全读写
- **`validators.ts`**：表单字段校验规则（邮箱、路径、端口号等桌面应用常见输入）
- **`formatters.ts`**：更多格式化函数（时长、汇率、百分比等）
- **`errors.ts`**：前端错误码定义与统一错误提示映射

---

*此目录是前端业务代码与底层能力之间的桥梁，保持简洁、可测试、框架无关是设计原则。*

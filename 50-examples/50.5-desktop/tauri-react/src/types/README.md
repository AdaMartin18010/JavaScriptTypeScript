# TypeScript 类型定义目录 (types)

> **路径**: `50-examples/50.5-desktop/tauri-react/src/types/`

## 概述

此目录集中管理 Tauri + React 桌面应用的**全局 TypeScript 类型定义**。在 Tauri 架构中，前端（React + TypeScript）与后端（Rust）通过 IPC（进程间通信）交换数据，类型的一致性至关重要。`src/types/` 作为前端类型的单一数据源，不仅服务于 React 组件与工具函数，还作为与 Rust 后端类型对齐的参考基准。

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.ts` | 全局类型出口文件，定义文件系统条目、系统信息、命令响应、导航项、主题等核心接口 |

## 核心类型详解

### 1. `FsEntry` — 文件系统条目

```ts
export interface FsEntry {
  name: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: number;
}
```

对应 Rust 后端的 `FsEntry` struct，用于 `read_directory` 命令返回的目录列表。前端文件管理器组件通过此类型渲染文件列表。

**设计考量**：

- `size` 使用 `number`（字节），由 `formatFileSize` 工具函数转换显示
- `modifiedAt` 使用 Unix 毫秒时间戳，便于排序与格式化

### 2. `SystemInfoData` — 系统信息数据

```ts
export interface SystemInfoData {
  platform: string;
  version: string;
  hostname: string;
  arch: string;
  cpuCores: number;
  totalMemory: number;
  appVersion: string;
}
```

对应 Rust 后端的 `SystemInfoData` struct，由 `get_system_info` 命令返回。常用于"关于本机"页面或系统监控面板。

**字段映射**：

| 前端字段 | Rust 字段 | 来源 |
|----------|-----------|------|
| `platform` | `platform` | `tauri-plugin-os` |
| `version` | `version` | `tauri-plugin-os` |
| `hostname` | `hostname` | `tauri-plugin-os` |
| `arch` | `arch` | `tauri-plugin-os` |
| `cpuCores` | `cpu_cores` | `std::thread::available_parallelism()` |
| `totalMemory` | `total_memory` | 平台特定系统调用 |
| `appVersion` | `app_version` | `app.package_info().version` |

> **命名规范注意**：前端遵循 camelCase，Rust 遵循 snake_case。类型注释应明确标注对应关系，以便后续维护。

### 3. `CommandResult<T>` — 命令响应包装

```ts
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

标准化的 Tauri 命令响应格式。Rust 后端可选择直接返回裸数据（由 Tauri 自动序列化），也可采用此包装器统一错误处理。前端调用处通过检查 `success` 字段决定是展示数据还是错误提示。

### 4. `NavItem` — 侧边栏导航项

```ts
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}
```

纯前端类型，用于配置驱动式导航菜单。`icon` 字段存储 lucide-react 图标名称字符串，由组件动态映射为图标组件。

### 5. `Theme` — 主题类型

```ts
export type Theme = "light" | "dark" | "system";
```

联合类型限制主题取值范围：

- `light`：强制亮色模式
- `dark`：强制暗色模式
- `system`：跟随操作系统偏好（通过 `window.matchMedia('(prefers-color-scheme: dark)')` 监听）

## 开发规范

1. **前后端类型同步**：当修改此目录中的类型时，务必检查 Rust 后端对应 struct 是否需要同步调整，反之亦然。
2. **避免业务逻辑类型污染**：组件局部使用的 props 类型应定义在组件文件内部或相邻的 `types.ts` 中，不要放入全局 `types/`。
3. **使用 JSDoc 注释**：为每个字段添加中文注释，IDE 悬浮提示可显著提升开发体验。
4. **索引文件出口**：`index.ts` 应集中 re-export 所有类型，方便其他模块通过 `import type { ... } from '@/types'` 一次性导入。

## 扩展方向

- **`tauri.d.ts`**：扩展 Tauri 的 `invoke` 函数签名，实现调用时的参数与返回值类型推断
- **`window.d.ts`**：扩展 `Window` 接口，声明应用挂载的全局变量
- **`env.d.ts`**：Vite 环境变量的类型声明（`import.meta.env.VITE_*`）

---

*此目录是前后端协作的"类型契约"，清晰的类型定义能极大减少 IPC 通信中的运行时错误，是桌面应用类型安全的第一道防线。*

# 学习里程碑

本文档为 `desktop-tauri-react` 示例项目设计 5 个递进式学习里程碑，帮助开发者系统掌握 Tauri v2 + React 桌面应用开发。

---

## 📊 桌面应用里程碑总览

| 里程碑 | 主题 | 预计时间 | 难度 | 前置知识 | Tauri + React 检查点 | 状态 |
|--------|------|---------|------|---------|---------------------|------|
| M1 | 项目初始化与 Tauri v2 架构理解 | 2h | ⭐⭐ | Rust 基础语法 | `tauri.conf.json` 正确配置 | ⬜ |
| M2 | 前端 UI 搭建（shadcn/ui + Tailwind v4） | 3h | ⭐⭐ | React Hooks | 主题切换 + 自定义标题栏 | ⬜ |
| M3 | Rust 后端命令开发（文件系统、系统信息） | 4h | ⭐⭐⭐ | Rust 所有权 | `#[tauri::command]` 类型安全 | ⬜ |
| M4 | 前后端通信与状态同步 | 3h | ⭐⭐⭐ | IPC 概念 | `useTauriCommand` Hook | ⬜ |
| M5 | 打包、签名与跨平台分发 | 2h | ⭐⭐⭐ | 代码签名概念 | 生成 `.msi` / `.dmg` / `.AppImage` | ⬜ |

**总预计时间**：14 小时

---

## 里程碑 1：项目初始化与 Tauri v2 架构理解

**学习目标**

- 理解 Tauri v2 的核心架构（前端 + Rust 后端 + IPC）
- 掌握 `tauri.conf.json` 配置文件结构
- 理解 Tauri v2 的能力系统（Capabilities）与 v1 allowlist 的区别
- 成功运行开发服务器并看到窗口

**预计时间**：2 小时

**关联 code-lab 模块**

- `jsts-code-lab/00-language-core/` — TypeScript 类型系统基础
- `jsts-code-lab/18-frontend-frameworks/` — React 项目初始化与配置

**验证标准**

- [ ] 成功执行 `npm install` 和 `cargo build`
- [ ] `npm run tauri:dev` 能正常启动应用窗口
- [ ] 能解释 `src-tauri/` 与 `src/` 的职责分工
- [ ] 能说明 `capabilities/default.json` 中至少 3 个权限的作用

### 🏗️ Tauri + React 检查点：v2 能力配置

```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "os:allow-platform",
    "notification:default"
  ]
}
```

---

## 里程碑 2：前端 UI 搭建（shadcn/ui + Tailwind v4）

**学习目标**

- 使用 Tailwind CSS v4 的原子化类构建响应式布局
- 掌握基于 CSS 变量的主题切换机制（浅色/深色模式）
- 理解 React 19 函数组件 + Hooks 的最佳实践
- 实现自定义标题栏（TitleBar）和侧边栏导航（Sidebar）

**预计时间**：3 小时

**关联 code-lab 模块**

- `jsts-code-lab/18-frontend-frameworks/` — React 组件与状态管理
- `jsts-code-lab/02-design-patterns/` — 组件组合模式与自定义 Hooks

**验证标准**

- [ ] 应用界面包含完整的标题栏、侧边栏、主内容区
- [ ] 点击侧边栏能切换不同视图
- [ ] 主题切换按钮能正确切换浅色/深色模式
- [ ] 自定义标题栏的最小化/最大化/关闭按钮功能正常
- [ ] 所有组件使用 TypeScript 严格类型

### 🏗️ Tauri + React 检查点：主题切换 Hook

```typescript
// src/hooks/use-theme.ts
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const activeTheme = theme === "system" ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
```

---

## 里程碑 3：Rust 后端命令开发（文件系统、系统信息）

**学习目标**

- 编写 `#[tauri::command]` 函数并暴露给前端
- 使用 Rust 标准库进行文件系统操作
- 调用 Tauri v2 插件 API（os、fs、notification）
- 处理跨平台差异（Windows / macOS / Linux）

**预计时间**：4 小时

**关联 code-lab 模块**

- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_TS_现代运行时深度分析.md` — 运行时与系统调用边界
- `jsts-code-lab/00-language-core/` — 类型系统与接口设计

**验证标准**

- [ ] `read_directory` 命令能正确列出目录内容
- [ ] `get_system_info` 命令能返回准确的 OS 信息
- [ ] 文件浏览器组件能正确展示目录结构和文件大小
- [ ] 系统信息卡片能展示平台、版本、内存等信息
- [ ] 能在 `tauri.conf.json` 中正确配置所需的权限

### 🏗️ Tauri + React 检查点：Rust 命令 + TS 类型绑定

```rust
// src-tauri/src/lib.rs
use tauri::command;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
struct FileEntry {
    name: String,
    size: u64,
    is_dir: bool,
    modified: Option<u64>,
}

#[derive(Serialize)]
struct SystemInfo {
    platform: String,
    version: String,
    arch: String,
    total_memory: u64,
}

#[command]
async fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        result.push(FileEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            size: metadata.len(),
            is_dir: metadata.is_dir(),
            modified: metadata.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_secs()),
        });
    }
    Ok(result)
}

#[command]
async fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        platform: std::env::consts::OS.to_string(),
        version: os_info::get().version().to_string(),
        arch: std::env::consts::ARCH.to_string(),
        total_memory: sysinfo::System::new_all().total_memory(),
    })
}
```

```typescript
// src/lib/commands.ts —— 前端类型安全绑定
import { invoke } from "@tauri-apps/api/core";

export interface FileEntry {
  name: string;
  size: number;
  isDir: boolean;
  modified?: number;
}

export interface SystemInfo {
  platform: string;
  version: string;
  arch: string;
  totalMemory: number;
}

export const commands = {
  readDirectory: (path: string): Promise<FileEntry[]> =>
    invoke("read_directory", { path }),
  getSystemInfo: (): Promise<SystemInfo> =>
    invoke("get_system_info"),
};
```

---

## 里程碑 4：前后端通信与状态同步

**学习目标**

- 掌握 `invoke()` 的调用方式和类型安全实践
- 设计自定义 Hook 封装 Tauri 命令调用（加载状态、错误处理）
- 实现剪贴板读写和系统通知的发送
- 理解 IPC 通信的性能特点和数据大小限制

**预计时间**：3 小时

**关联 code-lab 模块**

- `jsts-code-lab/02-design-patterns/` — Hook 模式与状态同步
- `jsts-code-lab/18-frontend-frameworks/` — 异步状态管理

**验证标准**

- [ ] `useTauriCommand` Hook 能正确管理 loading/error/data 状态
- [ ] 前端能成功调用 `write_clipboard` 将文本写入系统剪贴板
- [ ] 前端能成功调用 `send_notification` 发送桌面通知
- [ ] 错误处理：当命令失败时，UI 能展示友好的错误信息
- [ ] 能解释为什么前端不能直接访问 fs/os API

### 🏗️ Tauri + React 检查点：useTauriCommand Hook

```typescript
// src/hooks/use-tauri-command.ts
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CommandState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useTauriCommand<T, P extends Record<string, unknown>>(
  command: string
) {
  const [state, setState] = useState<CommandState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (params?: P) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await invoke<T>(command, params);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    [command]
  );

  return { ...state, execute };
}

// 使用示例
function SystemInfoCard() {
  const { data, loading, error, execute } = useTauriCommand<SystemInfo>("get_system_info");

  return (
    <div>
      <button onClick={() => execute()}>获取系统信息</button>
      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">错误: {error}</p>}
      {data && (
        <ul>
          <li>平台: {data.platform}</li>
          <li>架构: {data.arch}</li>
          <li>内存: {(data.totalMemory / 1024 / 1024).toFixed(0)} MB</li>
        </ul>
      )}
    </div>
  );
}
```

---

## 里程碑 5：打包、签名与跨平台分发

**学习目标**

- 配置 Tauri 构建选项（目标平台、图标、元数据）
- 理解代码签名的重要性（Windows、macOS）
- 生成各平台安装包（.msi / .dmg / .AppImage / .deb）
- 掌握自动更新机制的基本原理

**预计时间**：2 小时

**关联 code-lab 模块**

- `docs/platforms/desktop-development.md` — 桌面端开发最佳实践
- `jsts-code-lab/18-frontend-frameworks/` — 构建优化与生产部署

**验证标准**

- [ ] 成功执行 `npm run tauri:build` 生成目标平台的可执行文件
- [ ] 了解 `tauri.conf.json` 中 `bundle` 配置项的作用
- [ ] 能说明 Windows 代码签名证书和 macOS 签名身份的配置方式
- [ ] 能解释 `.msi`、`.dmg`、`.AppImage` 三种包格式的适用场景
- [ ] 生成的安装包能在目标系统正常运行

### 🏗️ Tauri + React 检查点：打包配置

```json
// src-tauri/tauri.conf.json (部分)
{
  "bundle": {
    "active": true,
    "targets": ["msi", "dmg", "appimage", "deb"],
    "identifier": "com.example.desktop-app",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    },
    "macOS": {
      "entitlements": "Entitlements.plist",
      "signingIdentity": null,
      "providerShortName": null
    }
  }
}
```

---

## 学习路径总览

```
里程碑 1 (2h) ──→ 里程碑 2 (3h) ──→ 里程碑 3 (4h) ──→ 里程碑 4 (3h) ──→ 里程碑 5 (2h)
   架构理解          UI 搭建           Rust 后端         前后端通信         打包分发
```

**总预计时间**：14 小时

**建议学习方式**：按顺序完成每个里程碑，每个里程碑结束后运行完整测试确保功能正常，再进行下一个里程碑。

---

## 🔗 权威参考链接

- [Tauri v2 官方文档](https://v2.tauri.app/)
- [Tauri v2 迁移指南](https://v2.tauri.app/start/migrate/)
- [Tauri 安全最佳实践](https://v2.tauri.app/security/)
- [Tauri 权限系统](https://v2.tauri.app/plugin/security-permissions/)
- [React 19 官方文档](https://react.dev/)
- [Tailwind CSS v4 文档](https://tailwindcss.com/)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Rust 官方文档](https://www.rust-lang.org/learn)
- [代码签名指南 — Windows](https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage)
- [代码签名指南 — Apple](https://developer.apple.com/documentation/xcode/creating-distribution-signed-code-for-the-mac)

# Tauri v2 与 Electron 详细对比

## 概述

Tauri 和 Electron 是目前最流行的两个跨平台桌面应用开发框架。本对比从架构、性能、安全、开发体验、生态等多维度分析两者的差异。

---

## 1. 架构对比

### Electron 架构

```
┌─────────────────────────────────────────────┐
│              Electron App                     │
│  ┌─────────────┐    ┌─────────────┐         │
│  │  Renderer 1 │    │  Renderer 2 │         │
│  │  (Chromium) │    │  (Chromium) │         │
│  │  + Node.js  │    │  + Node.js  │         │
│  └──────┬──────┘    └──────┬──────┘         │
│         │                  │                 │
│  ┌──────┴──────────────────┴──────┐         │
│  │         Main Process            │         │
│  │      (Node.js + libuv)        │         │
│  └─────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

每个 Electron 应用都捆绑完整的 Chromium 渲染引擎和 Node.js 运行时。

### Tauri v2 架构

```
┌─────────────────────────────────────────────┐
│               Tauri App                       │
│  ┌─────────────┐    ┌─────────────┐         │
│  │  WebView 1  │    │  WebView 2  │         │
│  │ (系统原生)   │    │ (系统原生)   │         │
│  │  无 Node.js │    │  无 Node.js │         │
│  └──────┬──────┘    └──────┬──────┘         │
│         │                  │                 │
│  ┌──────┴──────────────────┴──────┐         │
│  │         Rust Runtime            │         │
│  │    (tokio + wry + tao)        │         │
│  └─────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

Tauri 使用操作系统原生 WebView（Windows: WebView2, macOS: WKWebView, Linux: WebKitGTK），不捆绑浏览器引擎。

---

## 2. 包体积对比

| 场景 | Electron | Tauri v2 | 差异 |
|---|---|---|---|
| Hello World 应用 | ~150 MB | ~3 MB | Tauri 小 50 倍 |
| 包含 React + UI 库 | ~180 MB | ~5 MB | Tauri 小 36 倍 |
| 更新包增量 | ~50-80 MB | ~1-2 MB | Tauri 更新极快 |

**分析**：Electron 的体积主要来自 Chromium（~130 MB）和 Node.js（~30 MB）。Tauri 复用系统已有的 WebView 运行时，仅需打包前端资源和 Rust 二进制。

---

## 3. 内存占用对比

| 指标 | Electron | Tauri v2 |
|---|---|---|
| 启动内存 | 150-300 MB | 30-80 MB |
| 多窗口增量 | ~80 MB/窗口 | ~20 MB/窗口 |
| 空闲内存 | 较高（Chromium 常驻进程） | 较低 |

**分析**：Electron 的 Chromium 是多进程架构（Browser + Renderer + GPU + Network），常驻进程较多。Tauri 的 WebView 由操作系统管理，通常共享系统级进程。

---

## 4. 安全模型对比

### Electron 安全

| 特性 | 说明 |
|---|---|
| contextIsolation | 隔离主进程和渲染进程的上下文 |
| preload 脚本 | 在隔离环境中暴露安全的 API |
| nodeIntegration | 控制是否启用 Node.js（默认关闭） |
| 风险 | 若配置不当，渲染进程可能获取 Node.js 权限 |

### Tauri v2 安全

| 特性 | 说明 |
|---|---|
| 前端沙箱 | 前端**默认无 Node.js / Rust 访问权限** |
| Capabilities | 基于能力的细粒度权限系统 |
| CSP | 强制内容安全策略 |
| 命令隔离 | 只有显式 `#[command]` 函数可被调用 |
| 风险 | 攻击面显著更小，Rust 内存安全避免常见漏洞 |

**结论**：Tauri 的安全模型更简单、更严格。Electron 的灵活性带来了更高的配置复杂度，错误配置可能导致安全风险。

---

## 5. 开发体验对比

### 前端技术栈

| 方面 | Electron | Tauri v2 |
|---|---|---|
| 前端框架 | 任意（React, Vue, Svelte...） | 任意 |
| 构建工具 | Webpack, Vite, Rollup | Vite（推荐）, 任意 |
| 调试工具 | Chrome DevTools | Chrome DevTools / Safari DevTools |
| 热更新 | 支持 | 支持（Vite HMR 集成更好） |

### 后端语言

| 方面 | Electron | Tauri v2 |
|---|---|---|
| 主进程语言 | JavaScript / TypeScript（Node.js） | Rust |
| 性能 | 良好 | 极佳（Rust 零成本抽象） |
| 系统调用 | 丰富（npm 生态） | 需 Rust 库或 FFI |
| 学习曲线 | 平缓（JS 开发者熟悉） | 陡峭（需学习 Rust） |

**Tauri 命令示例（前端 ↔ Rust 通信）**：

```rust
// src-tauri/src/lib.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct FileMeta {
    name: String,
    size: u64,
}

#[command]
async fn read_dir(path: String) -> Result<Vec<FileMeta>, String> {
    let mut entries = Vec::new();
    let mut dir = tokio::fs::read_dir(&path)
        .await
        .map_err(|e| e.to_string())?;

    while let Ok(Some(entry)) = dir.next_entry().await {
        let meta = entry.metadata().await.map_err(|e| e.to_string())?;
        entries.push(FileMeta {
            name: entry.file_name().to_string_lossy().into(),
            size: meta.len(),
        });
    }
    Ok(entries)
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```typescript
// src/App.tsx — 前端调用 Rust 命令
import { invoke } from '@tauri-apps/api/core';

interface FileMeta {
  name: string;
  size: number;
}

async function listFiles(dir: string): Promise<FileMeta[]> {
  return invoke<FileMeta[]>('read_dir', { path: dir });
}

// 使用示例
const files = await listFiles('/Users/alice/Documents');
console.log(files.map(f => `${f.name} (${f.size} bytes)`));
```

---

## 6. 功能与生态对比

| 功能 | Electron | Tauri v2 |
|---|---|---|
| 自动更新 | electron-updater（成熟） | tauri-plugin-updater（发展中） |
| 代码签名 | 完善文档和工具链 | 完善文档和工具链 |
| 原生模块 | Node.js 原生 addon / N-API | Rust crate / FFI |
| 插件生态 | 非常丰富（npm） | 快速增长（Rust crates + 官方插件） |
| 多窗口 | 成熟支持 | 支持（v2 改进显著） |
| 深度系统集成 | 深度（系统托盘、全局快捷键等） | 深度（通过插件扩展） |
| 移动端支持 | 不支持 | **支持**（Tauri v2 新增 iOS/Android） |

**Tauri v2 的重要突破**：通过 `tauri-mobile` 支持 iOS 和 Android 构建，一套代码可覆盖桌面 + 移动端。

**Tauri v2 移动端配置示例**：

```json
// src-tauri/tauri.conf.json
{
  "identifier": "com.example.myapp",
  "plugins": {
    "shell": {
      "open": true
    }
  },
  "app": {
    "windows": [
      {
        "title": "My App",
        "width": 800,
        "height": 600
      }
    ]
  }
}
```

---

## 7. 适用场景对比

### 选择 Electron 的场景

- 团队已有 Node.js 技术栈，无 Rust 经验
- 需要复用大量 Node.js npm 包作为后端逻辑
- 应用需要深度集成特定的 Node.js 原生模块
- 对自动更新、崩溃报告等基础设施有极高成熟度要求
- 应用需要旧版浏览器兼容性（可控制 Chromium 版本）

### 选择 Tauri v2 的场景

- 对应用体积和内存占用敏感
- 重视安全性，希望默认安全
- 团队愿意学习 Rust，或已有 Rust 经验
- 需要同时构建桌面端和移动端（一套代码）
- 前端是主要复杂度，后端逻辑相对简单
- 追求极致的启动速度和运行性能

---

## 8. 总结

| 维度 | 推荐选择 |
|---|---|
| 最小体积 | **Tauri** |
| 最小内存 | **Tauri** |
| 最高安全性 | **Tauri** |
| 最快启动 | **Tauri** |
| 最低学习成本 | **Electron**（无 Rust） |
| 最成熟生态 | **Electron** |
| 最佳移动端覆盖 | **Tauri v2** |
| 最佳 Node.js 复用 | **Electron** |

**最终建议**：

- 新项目、对体积和安全敏感 → **Tauri v2**
- 已有大型 Electron 代码库、重度依赖 Node.js 生态 → **Electron**
- 需要同时覆盖桌面 + 移动端 → **Tauri v2**

---

## 9. 权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Tauri 官方文档 | [tauri.app](https://tauri.app/) | v2 完整指南与 API 参考 |
| Tauri v2 迁移指南 | [tauri.app/start/migrate/from-tauri-1](https://tauri.app/start/migrate/from-tauri-1/) | 从 v1 升级的官方路径 |
| Electron 官方文档 | [electronjs.org/docs](https://www.electronjs.org/docs/latest/) | 主进程/渲染进程/安全最佳实践 |
| Electron Fiddle | [electronjs.org/fiddle](https://www.electronjs.org/fiddle) | 官方快速实验环境 |
| Electron 安全清单 | [electronjs.org/docs/latest/tutorial/security](https://www.electronjs.org/docs/latest/tutorial/security) | 官方安全最佳实践 |
| WebView2 Runtime | [learn.microsoft.com/microsoft-edge/webview2](https://learn.microsoft.com/en-us/microsoft-edge/webview2/) | Windows 原生 WebView 文档 |
| WKWebView (Apple) | [developer.apple.com/documentation/webkit/wkwebview](https://developer.apple.com/documentation/webkit/wkwebview) | macOS/iOS WebView 官方文档 |
| Rust 官方学习资源 | [rust-lang.org/learn](https://www.rust-lang.org/learn) | Tauri 后端开发基础 |
| Tauri 插件仓库 | [github.com/tauri-apps/plugins-workspace](https://github.com/tauri-apps/plugins-workspace) | 官方维护的插件集合 |
| Electron Forge | [electronforge.io](https://www.electronforge.io/) | Electron 官方构建与发布工具 |

---

*最后更新: 2026-04-29*

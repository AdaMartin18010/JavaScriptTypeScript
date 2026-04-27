# Desktop Tauri React — 跨平台桌面应用实战教程

> 基于 **Tauri v2 + React 19 + TypeScript + Tailwind CSS v4** 的跨平台桌面应用示例项目，展示现代桌面端开发的最佳实践。

---

## 📖 第一章：项目概述与 Tauri v2 架构说明

### 1.1 项目介绍

本项目是一个功能完整的跨平台桌面应用示例，展示了如何使用现代 Web 技术栈（React + TypeScript + Tailwind CSS）构建桌面应用，并通过 Tauri v2 的 Rust 后端调用操作系统原生 API。核心功能包括：

- **自定义标题栏**：使用 Tauri 窗口 API 实现最小化、最大化、关闭
- **文件浏览器**：通过 Rust 后端安全读取文件系统
- **系统信息展示**：获取操作系统平台、版本、CPU、内存等信息
- **深色模式切换**：Tailwind CSS `dark` 变体 + CSS 变量实现主题切换
- **剪贴板与通知**：调用系统原生 API

### 1.2 Tauri v2 架构

Tauri 是一个使用 Web 前端 + Rust 后端构建跨平台桌面应用的框架：

```
┌─────────────────────────────────────────────┐
│  前端（Frontend）                              │
│  React 19 + TypeScript + Tailwind CSS v4     │
│  运行在系统原生 WebView 中                     │
├─────────────────────────────────────────────┤
│  通信层（IPC）                                │
│  Tauri IPC（基于 JSON 序列化）                │
│  前端 invoke() ←────→ 后端 #[tauri::command] │
├─────────────────────────────────────────────┤
│  后端（Backend）                             │
│  Rust 运行时 + 操作系统 API                  │
│  安全沙箱 + 基于能力的权限系统                │
└─────────────────────────────────────────────┘
```

### 1.3 Tauri v2 与 Electron 的对比

| 维度 | Tauri v2 | Electron |
|---|---|---|
| 应用体积 | ~3-5 MB | ~150-200 MB |
| 内存占用 | 低（共享系统 WebView） | 高（内置 Chromium） |
| 启动速度 | 快 | 较慢 |
| 安全模型 | 默认沙箱 + 能力权限 | 需手动配置 contextIsolation |
| 后端语言 | Rust | Node.js |
| 移动端支持 | ✅ iOS / Android | ❌ 不支持 |

### 1.4 学习目标

完成本教程后，你将能够：

1. 理解 Tauri v2 的架构设计与安全模型
2. 搭建 React + TypeScript + Tailwind CSS v4 前端项目
3. 使用 Rust 编写后端命令并暴露给前端
4. 配置 Tauri 的能力权限系统
5. 打包发布 Windows / macOS / Linux 安装包
6. 配置自动更新机制

---

## 🚀 第二章：环境准备

### 2.1 Node.js 安装

```bash
# 验证 Node.js 版本（>= 20.0.0）
node -v

# 如果不符合，使用 nvm 安装
nvm install 20
nvm use 20
```

### 2.2 Rust 工具链安装

Tauri 后端基于 Rust，需要安装 Rust 工具链：

```bash
# 官方安装脚本（支持 Windows/macOS/Linux）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows 用户可下载 rustup-init.exe 安装
# https://rustup.rs/

# 验证安装
rustc --version    # 1.70+ 才能使用 Tauri v2
cargo --version
```

### 2.3 系统依赖

#### Windows

- **WebView2 Runtime**：Windows 10/11 通常已预装。如缺少，请从 [Microsoft 官网](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) 下载。
- **Microsoft Visual C++ Build Tools**：安装 C++ 桌面开发工作负载。

#### macOS

```bash
# 安装 Xcode Command Line Tools
xcode-select --install
```

#### Linux（Ubuntu/Debian）

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### 2.4 安装项目依赖

```bash
cd examples/desktop-tauri-react

# 安装前端依赖
npm install

# 安装 Tauri CLI（若未全局安装）
npm install -g @tauri-apps/cli
```

---

## 🛠️ 第三章：分步实现指南

### 3.1 第一步：前端 React 项目搭建

#### 3.1.1 项目初始化

本项目使用 Vite 作为前端构建工具：

```bash
# 如果从头创建
npm create vite@latest desktop-tauri-react -- --template react-ts
```

#### 3.1.2 Tailwind CSS v4 配置

Tailwind CSS v4 采用基于 CSS 的配置方式：

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
}

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #0a0a0a;
  --card-foreground: #fafafa;
  --primary: #fafafa;
  --primary-foreground: #171717;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --destructive: #7f1d1d;
  --destructive-foreground: #fafafa;
}
```

#### 3.1.3 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
  // 必须配置，Tauri 使用固定端口
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
```

#### 3.1.4 根组件实现

```tsx
// src/App.tsx
import { useState, useEffect } from "react";
import TitleBar from "@components/TitleBar";
import Sidebar from "@components/Sidebar";
import FileExplorer from "@components/FileExplorer";
import SystemInfo from "@components/SystemInfo";
import ThemeToggle from "@components/ThemeToggle";

type ViewType = "explorer" | "system" | "settings";

export default function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>("explorer");
  const [isDark, setIsDark] = useState<boolean>(false);

  // 初始化时读取系统主题偏好
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  // 切换深色模式
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const renderView = (): JSX.Element => {
    switch (currentView) {
      case "explorer":
        return <FileExplorer />;
      case "system":
        return <SystemInfo />;
      case "settings":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">设置</h2>
            <p className="text-muted-foreground">应用设置面板（示例占位）</p>
          </div>
        );
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 border-b border-border flex items-center justify-end px-4 gap-2">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          </div>

          <div className="flex-1 overflow-auto">{renderView()}</div>
        </main>
      </div>
    </div>
  );
}
```

---

### 3.2 第二步：Tauri 配置

#### 3.2.1 tauri.conf.json 详解

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "DesktopTauriReact",
  "version": "1.0.0",
  "identifier": "com.example.desktop-tauri-react",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "Tauri v2 + React 19 桌面应用",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "center": true,
        "resizable": true,
        "maximizable": true,
        "minimizable": true,
        "closable": true,
        "decorations": false,
        "transparent": false,
        "alwaysOnTop": false,
        "fullscreen": false,
        "visible": true,
        "shadow": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    },
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "10.13",
      "signingIdentity": null,
      "entitlements": null
    },
    "linux": {
      "appimage": {
        "bundleMediaFramework": false
      }
    }
  },
  "plugins": {
    "notification": {
      "active": true
    },
    "clipboardManager": {
      "active": true
    }
  }
}
```

**关键配置说明：**

- `decorations: false`：隐藏系统默认标题栏，使用自定义标题栏
- `frontendDist`：指向 Vite 构建输出目录
- `devUrl`：开发模式下前端服务器地址
- `csp`：内容安全策略，限制资源加载来源

#### 3.2.2 能力权限配置（Capabilities）

Tauri v2 采用基于能力的权限模型：

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../node_modules/@tauri-apps/cli/schema.json",
  "identifier": "default",
  "description": "应用默认能力集",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "fs:allow-home-read",
    "clipboard-manager:allow-write-text",
    "clipboard-manager:allow-read-text",
    "notification:allow-request-permission",
    "notification:allow-show",
    "os:allow-platform",
    "os:allow-version",
    "os:allow-os-type",
    "os:allow-family",
    "os:allow-arch",
    "os:allow-exe-extension",
    "os:allow-locale",
    "os:allow-hostname",
    "shell:allow-open"
  ]
}
```

**权限说明：**

- `fs:allow-read-dir`：允许读取目录内容
- `fs:allow-home-read`：允许读取用户主目录
- `clipboard-manager:allow-write-text`：允许写入剪贴板
- `notification:allow-show`：允许发送通知
- `os:allow-*`：允许获取操作系统信息

---

### 3.3 第三步：Rust 后端命令开发

#### 3.3.1 命令注册

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::new()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            desktop_tauri_react::read_directory,
            desktop_tauri_react::get_system_info,
            desktop_tauri_react::write_clipboard,
            desktop_tauri_react::send_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 3.3.2 文件系统命令

```rust
// src-tauri/src/lib.rs
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle, Manager};

/// 文件系统条目
#[derive(Debug, Serialize, Deserialize)]
pub struct FsEntry {
    pub name: String,
    pub is_directory: bool,
    pub size: u64,
    pub modified_at: u64,
}

/**
 * 读取指定目录的内容
 * 
 * # 安全性
 * - 路径经过规范化处理，防止目录遍历攻击
 * - 空路径默认读取用户主目录
 */
#[command]
pub fn read_directory(path: String) -> Result<Vec<FsEntry>, String> {
    let target_path = if path.is_empty() {
        dirs::home_dir().unwrap_or_else(|| PathBuf::from("."))
    } else {
        PathBuf::from(&path)
    };

    let entries = std::fs::read_dir(&target_path)
        .map_err(|e| format!("读取目录失败: {}", e))?;

    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("遍历条目失败: {}", e))?;
        let metadata = entry.metadata().ok();

        let name = entry.file_name().to_string_lossy().to_string();
        let is_directory = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
        let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
        let modified_at = metadata
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        result.push(FsEntry {
            name,
            is_directory,
            size,
            modified_at,
        });
    }

    Ok(result)
}
```

#### 3.3.3 系统信息命令

```rust
/// 系统信息数据
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfoData {
    pub platform: String,
    pub version: String,
    pub hostname: String,
    pub arch: String,
    pub cpu_cores: usize,
    pub total_memory: u64,
    pub app_version: String,
}

#[command]
pub fn get_system_info(app: AppHandle) -> Result<SystemInfoData, String> {
    use tauri_plugin_os::{arch, hostname, platform, version};

    let cpu_cores = std::thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(1);

    let total_memory = get_total_memory_mb();
    let app_version = app.package_info().version.to_string();

    Ok(SystemInfoData {
        platform: platform().to_string(),
        version: version().to_string(),
        hostname: hostname().unwrap_or_else(|| "unknown".into()),
        arch: arch().to_string(),
        cpu_cores,
        total_memory,
        app_version,
    })
}

#[cfg(target_os = "windows")]
fn get_total_memory_mb() -> u64 {
    use windows_sys::Win32::System::SystemInformation::GetPhysicallyInstalledSystemMemory;
    let mut mem_kb: u64 = 0;
    unsafe {
        GetPhysicallyInstalledSystemMemory(&mut mem_kb);
    }
    mem_kb / 1024
}

#[cfg(target_os = "macos")]
fn get_total_memory_mb() -> u64 {
    // macOS 实现...
    0
}

#[cfg(target_os = "linux")]
fn get_total_memory_mb() -> u64 {
    // Linux 实现...
    0
}
```

#### 3.3.4 剪贴板与通知命令

```rust
/// 写入文本到剪贴板
#[command]
pub async fn write_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard()
        .write_text(text)
        .map_err(|e| format!("写入剪贴板失败: {}", e))
}

/// 发送系统原生通知
#[command]
pub async fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    let permission = app.notification().permission_state().map_err(|e| e.to_string())?;
    
    if permission != tauri_plugin_notification::PermissionState::Granted {
        app.notification().request_permission().map_err(|e| e.to_string())?;
    }

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("发送通知失败: {}", e))?;

    Ok(())
}
```

---

### 3.4 第四步：前端调用后端命令

#### 3.4.1 直接调用（invoke）

```tsx
// src/components/FileExplorer.tsx
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { FsEntry } from "@types/index";

export default function FileExplorer(): JSX.Element {
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  const readDirectory = useCallback(async (path: string) => {
    try {
      const result = await invoke<FsEntry[]>("read_directory", { path });
      const sorted = result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(sorted);
      setCurrentPath(path);
    } catch (err) {
      console.error("读取目录失败:", err);
    }
  }, []);

  useEffect(() => {
    readDirectory(""); // 空路径表示用户主目录
  }, [readDirectory]);

  return (
    <div>
      {entries.map((entry) => (
        <div key={entry.name}>
          {entry.isDirectory ? "📁" : "📄"} {entry.name}
        </div>
      ))}
    </div>
  );
}
```

#### 3.4.2 封装自定义 Hook

```tsx
// src/hooks/useTauriCommand.ts
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface UseTauriCommandResult<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useTauriCommand<T>(command: string): UseTauriCommandResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const payload =
          args.length === 1 && typeof args[0] === "object" && args[0] !== null
            ? args[0]
            : {};
        const result = await invoke<T>(command, payload as Record<string, unknown>);
        setData(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [command]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    setError(null);
  }, []);

  return { execute, data, loading, error, reset };
}
```

#### 3.4.3 自定义标题栏

```tsx
// src/components/TitleBar.tsx
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export default function TitleBar(): JSX.Element {
  const appWindow = getCurrentWindow();

  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, [appWindow]);

  const handleMaximize = useCallback(async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }, [appWindow]);

  const handleClose = useCallback(async () => {
    await appWindow.close();
  }, [appWindow]);

  return (
    <div
      data-tauri-drag-region
      className="h-9 bg-card border-b border-border flex items-center justify-between select-none"
    >
      <div className="flex items-center gap-2 px-3" data-tauri-drag-region>
        <span className="text-sm font-medium">Tauri React App</span>
      </div>

      <div className="flex items-center h-full">
        <button onClick={handleMinimize} className="h-full w-11 flex items-center justify-center hover:bg-muted">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={handleMaximize} className="h-full w-11 flex items-center justify-center hover:bg-muted">
          <Square className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleClose} className="h-full w-11 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

> 💡 **注意**：`data-tauri-drag-region` 属性使该区域支持窗口拖拽。

---

## 📦 第四章：打包与发布

### 4.1 开发模式运行

```bash
# 同时启动前端开发服务器和 Tauri 桌面窗口
npm run tauri:dev

# 前端服务运行在 http://localhost:1420
# Tauri 窗口自动加载该地址
```

### 4.2 构建生产版本

```bash
# 构建前端并编译 Rust 后端，生成本地安装包
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下：

- **Windows**：`.msi` 安装包 + `.exe` 安装程序
- **macOS**：`.dmg` 磁盘镜像 + `.app` 应用包
- **Linux**：`.AppImage` / `.deb` / `.rpm` 包

### 4.3 跨平台构建

#### 使用 GitHub Actions

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: dtolnay/rust-action@stable
      - run: npm install
      - run: npm run tauri:build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 使用 Docker（Linux 构建）

```dockerfile
FROM rust:1.75-slim

RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    nodejs \
    npm

WORKDIR /app
COPY . .
RUN npm install
RUN npm run tauri:build
```

### 4.4 代码签名

#### Windows（使用 signtool）

```bash
# 使用代码签名证书签名 .msi
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 /fd sha256 "src-tauri/target/release/bundle/msi/*.msi"
```

#### macOS（使用 codesign）

```bash
# 使用 Apple Developer ID 证书签名
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" "src-tauri/target/release/bundle/macos/*.app"

# 公证
xcrun notarytool submit "src-tauri/target/release/bundle/macos/*.dmg" --keychain-profile "AC_PASSWORD" --wait
```

---

## 🔄 第五章：自动更新配置

### 5.1 使用 Tauri 内置更新器

Tauri v2 内置了自动更新功能，支持多种更新服务端点。

#### 5.1.1 启用更新器插件

```json
// src-tauri/tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_ED25519_PUBLIC_KEY"
    }
  }
}
```

#### 5.1.2 生成签名密钥

```bash
# 使用 Tauri CLI 生成密钥
tauri signer generate --workspace

# 输出示例：
# Private key saved at: /home/user/.tauri/myapp.key
# Public key: dW50cnVzdGVkIGNvbW1lbnQ6I...（复制到 tauri.conf.json 的 pubkey 字段）
```

#### 5.1.3 前端检查更新

```tsx
// src/hooks/useUpdater.ts
import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";

export function useUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    async function checkUpdate() {
      const update = await check();
      if (update) {
        setUpdateAvailable(true);
        const yes = await ask(
          `发现新版本 ${update.version}，是否立即更新？`,
          { title: "更新可用", kind: "info" }
        );
        if (yes) {
          await update.downloadAndInstall();
        }
      }
    }

    checkUpdate();
  }, []);

  return { updateAvailable };
}
```

### 5.2 自定义更新服务器

你可以搭建简单的静态文件服务器作为更新源：

```
releases/
├── darwin/
│   ├── aarch64/
│   │   └── 1.0.0.json
│   └── x86_64/
│       └── 1.0.0.json
├── windows/
│   └── x86_64/
│       └── 1.0.0.json
└── linux/
    └── x86_64/
        └── 1.0.0.json
```

更新 JSON 格式：

```json
{
  "version": "1.1.0",
  "notes": "修复了一些 bug，提升了性能",
  "pub_date": "2024-01-15T12:00:00Z",
  "signature": "BASE64_SIGNATURE_HERE",
  "url": "https://releases.myapp.com/v1.1.0/MyApp_1.1.0_x64_en-US.msi.zip"
}
```

---

## 🐛 第六章：常见问题与调试

### 6.1 构建失败

#### 问题：缺少 WebView2 Runtime（Windows）

```
error: WebView2 is not installed
```

**解决方案**：
- Windows 11：通常已预装
- Windows 10：从 [Microsoft 官网](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) 下载 WebView2 Runtime

#### 问题：Rust 编译错误

```
error: linking with `link.exe` failed: exit code: 1181
```

**解决方案**：安装 Visual Studio Build Tools，选择「使用 C++ 的桌面开发」工作负载。

### 6.2 运行时问题

#### 问题：文件浏览器只能访问特定目录

**原因**：Tauri v2 的能力权限系统限制了文件系统访问范围。

**解决方案**：在 `src-tauri/capabilities/default.json` 中添加所需权限：

```json
{
  "permissions": [
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "fs:allow-home-read",
    "fs:allow-appdata-read"
  ]
}
```

#### 问题：前端无法调用后端命令

**原因**：命令未在 `main.rs` 的 `invoke_handler` 中注册。

**解决方案**：

```rust
.invoke_handler(tauri::generate_handler![
    your_new_command,  // 添加新命令
])
```

### 6.3 调试 Rust 后端

1. **开发模式 DevTools**：Tauri 窗口自动打开 Chrome DevTools
2. **Rust 日志**：使用 `tauri-plugin-log` 输出日志
3. **终端输出**：开发模式下 `println!` 会显示在启动终端

```rust
// 在 Rust 代码中添加日志
println!("[DEBUG] 读取目录: {:?}", target_path);
```

---

## 🎓 第七章：进阶扩展

### 7.1 添加新后端命令

```rust
// src-tauri/src/lib.rs
#[command]
pub fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// main.rs 中注册
.invoke_handler(tauri::generate_handler![
    greet,
    // ... 其他命令
])
```

```tsx
// 前端调用
import { invoke } from "@tauri-apps/api/core";

const greeting = await invoke<string>("greet", { name: "World" });
console.log(greeting); // "Hello, World! You've been greeted from Rust!"
```

### 7.2 多窗口支持

```rust
use tauri::Manager;

// 创建新窗口
#[command]
pub fn create_window(app: AppHandle, label: String) -> Result<(), String> {
    let _window = tauri::WebviewWindowBuilder::new(
        &app,
        &label,
        tauri::WebviewUrl::App("index.html".into())
    )
    .title("新窗口")
    .inner_size(800.0, 600.0)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
```

### 7.3 系统托盘

```rust
// main.rs
.use_system_tray(
    SystemTray::new()
        .with_menu(
            SystemTrayMenu::new()
                .add_item(CustomMenuItem::new("show", "显示"))
                .add_item(CustomMenuItem::new("quit", "退出")),
        ),
)
.on_system_tray_event(|app, event| {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => std::process::exit(0),
            "show" => {
                let window = app.get_webview_window("main").unwrap();
                window.show().unwrap();
            }
            _ => {}
        },
        _ => {}
    }
})
```

---

## 📚 学习资源

本项目作为示例，建议配合以下资料学习：

- **桌面端开发指南**: `docs/platforms/desktop-development.md`
- **TypeScript 语言核心**: `jsts-code-lab/00-language-core/`
- **设计模式实践**: `jsts-code-lab/02-design-patterns/`
- **前端框架深入**: `jsts-code-lab/18-frontend-frameworks/`
- **运行时深度分析**: `JSTS全景综述/JS_TS_现代运行时深度分析.md`

---

## License

MIT

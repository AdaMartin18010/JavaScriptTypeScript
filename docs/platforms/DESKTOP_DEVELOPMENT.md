# 桌面应用开发指南

> 涵盖 Electron 和 Tauri 两大主流桌面应用框架的深度实践指南

---

## 目录

- [桌面应用开发指南](#桌面应用开发指南)
  - [目录](#目录)
  - [1. Electron 架构原理](#1-electron-架构原理)
    - [1.1 概念解释](#11-概念解释)
    - [1.2 架构图](#12-架构图)
    - [1.3 代码示例](#13-代码示例)
    - [1.4 工具推荐](#14-工具推荐)
  - [2. Tauri 与 Electron 对比](#2-tauri-与-electron-对比)
    - [2.1 概念解释](#21-概念解释)
    - [2.2 架构对比图](#22-架构对比图)
    - [2.3 详细对比表](#23-详细对比表)
    - [2.4 Tauri 代码示例](#24-tauri-代码示例)
    - [2.5 工具推荐](#25-工具推荐)
  - [3. 桌面应用的安全模型](#3-桌面应用的安全模型)
    - [3.1 概念解释](#31-概念解释)
    - [3.2 安全架构图](#32-安全架构图)
    - [3.3 代码示例](#33-代码示例)
    - [3.4 工具推荐](#34-工具推荐)
  - [4. 原生 API 访问](#4-原生-api-访问)
    - [4.1 概念解释](#41-概念解释)
    - [4.2 API 架构图](#42-api-架构图)
    - [4.3 代码示例](#43-代码示例)
    - [4.4 工具推荐](#44-工具推荐)
  - [5. 自动更新机制](#5-自动更新机制)
    - [5.1 概念解释](#51-概念解释)
    - [5.2 更新架构图](#52-更新架构图)
    - [5.3 代码示例](#53-代码示例)
    - [5.4 工具推荐](#54-工具推荐)
  - [6. 应用签名和分发](#6-应用签名和分发)
    - [6.1 概念解释](#61-概念解释)
    - [6.2 签名流程图](#62-签名流程图)
    - [6.3 代码示例](#63-代码示例)
    - [6.4 工具推荐](#64-工具推荐)
  - [7. 性能优化](#7-性能优化)
    - [7.1 概念解释](#71-概念解释)
    - [7.2 性能架构图](#72-性能架构图)
    - [7.3 代码示例](#73-代码示例)
    - [7.4 工具推荐](#74-工具推荐)
  - [8. 多窗口管理](#8-多窗口管理)
    - [8.1 概念解释](#81-概念解释)
    - [8.2 多窗口架构图](#82-多窗口架构图)
    - [8.3 代码示例](#83-代码示例)
    - [8.4 工具推荐](#84-工具推荐)
  - [9. 系统托盘和菜单](#9-系统托盘和菜单)
    - [9.1 概念解释](#91-概念解释)
    - [9.2 架构图](#92-架构图)
    - [9.3 代码示例](#93-代码示例)
    - [9.4 工具推荐](#94-工具推荐)
  - [10. 跨平台打包](#10-跨平台打包)
    - [10.1 概念解释](#101-概念解释)
    - [10.2 打包架构图](#102-打包架构图)
    - [10.3 代码示例](#103-代码示例)
    - [10.4 工具推荐](#104-工具推荐)
  - [总结](#总结)

---

## 1. Electron 架构原理

### 1.1 概念解释

Electron 是一个使用 Web 技术（HTML、CSS、JavaScript）构建跨平台桌面应用的框架。其核心架构基于 Chromium 渲染引擎和 Node.js 运行时。

**核心组件：**

- **主进程 (Main Process)**：负责应用生命周期管理、原生 API 访问、窗口创建
- **渲染进程 (Renderer Process)**：负责 UI 渲染，每个窗口对应一个独立的 Chromium 渲染进程
- **预加载脚本 (Preload Script)**：在渲染进程加载前执行，用于安全地桥接主进程和渲染进程

### 1.2 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Electron 应用架构                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         主进程 (Main Process)                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │  app 生命周期 │  │  ipcMain     │  │    原生 Node.js API      │   │   │
│  │  │  - ready     │  │  - 处理消息   │  │    - fs, path, os        │   │   │
│  │  │  - quit      │  │  - 事件转发   │  │    - 自定义原生模块       │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│              ┌─────────────────────┼─────────────────────┐                 │
│              │  IPC 通信           │  IPC 通信           │                 │
│              ▼                     ▼                     ▼                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   窗口 1         │    │   窗口 2         │    │   窗口 N         │         │
│  │  渲染进程        │    │  渲染进程        │    │  渲染进程        │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │  Chromium   │ │    │ │  Chromium   │ │    │ │  Chromium   │ │         │
│  │ │  渲染引擎    │ │    │ │  渲染引擎    │ │    │ │  渲染引擎    │ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │ Preload     │ │    │ │ Preload     │ │    │ │ Preload     │ │         │
│  │ │ Script      │ │    │ │ Script      │ │    │ │ Script      │ │         │
│  │ │ (安全桥接)   │ │    │ │ (安全桥接)   │ │    │ │ (安全桥接)   │ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │  Web 应用   │ │    │ │  Web 应用   │ │    │ │  Web 应用   │ │         │
│  │ │  (UI 层)    │ │    │ │  (UI 层)    │ │    │ │  (UI 层)    │ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 代码示例

**主进程 (main.js)**

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 保持窗口对象的全局引用，防止被垃圾回收
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // 启用预加载脚本，隔离上下文
      preload: path.join(__dirname, 'preload.js'),
      // 禁用 Node.js 集成以提高安全性
      nodeIntegration: false,
      contextIsolation: true,
      // 启用沙盒
      sandbox: true
    }
  });

  // 加载应用页面
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron 初始化完成
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: 点击 dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 处理示例
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});
```

**预加载脚本 (preload.js)**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 版本信息
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  // 文件操作（受限）
  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  // 平台信息
  platform: process.platform,

  // 事件监听
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },

  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
```

**渲染进程 (renderer.js)**

```javascript
// 使用预加载脚本暴露的 API
async function initApp() {
  // 获取应用版本
  const version = await window.electronAPI.getAppVersion();
  document.getElementById('version').textContent = version;

  // 监听更新事件
  window.electronAPI.onUpdateAvailable((event, info) => {
    console.log('Update available:', info);
  });
}

initApp();
```

### 1.4 工具推荐

| 工具 | 用途 | 推荐理由 |
|------|------|----------|
| **electron-builder** | 打包分发 | 最成熟的 Electron 打包工具，支持自动更新 |
| **electron-forge** | 开发构建 | 官方推荐，集成度高，插件丰富 |
| **electron-vite** | 开发工具 | Vite + Electron，热更新快 |
| **electron-devtools-installer** | 调试工具 | 自动安装 React/Vue DevTools |

---

## 2. Tauri 与 Electron 对比

### 2.1 概念解释

**Tauri** 是一个使用 Web 前端构建桌面应用的框架，与 Electron 不同，它使用操作系统原生 WebView 而不是捆绑 Chromium。

**核心差异：**

- **运行时**：Electron 捆绑 Chromium + Node.js；Tauri 使用系统 WebView + Rust 后端
- **包大小**：Tauri 应用通常 < 5MB；Electron 应用通常 > 100MB
- **内存占用**：Tauri 内存占用显著低于 Electron
- **安全性**：Tauri 默认启用更多安全特性

### 2.2 架构对比图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Electron vs Tauri 架构对比                           │
├─────────────────────────────────────────┬───────────────────────────────────┤
│              Electron                   │              Tauri                │
├─────────────────────────────────────────┼───────────────────────────────────┤
│                                         │                                   │
│  ┌─────────────────────────────────┐   │  ┌─────────────────────────────┐  │
│  │      Chromium (完整浏览器)       │   │  │   系统 WebView (WKWebView/   │  │
│  │   - V8 引擎                      │   │  │   WebView2/WebKitGTK)        │  │
│  │   - Blink 渲染引擎               │   │  │   - 使用系统自带渲染引擎      │  │
│  │   - DevTools                     │   │  │   - 无需额外下载              │  │
│  └─────────────────────────────────┘   │  └─────────────────────────────┘  │
│                                         │                                   │
│  ┌─────────────────────────────────┐   │  ┌─────────────────────────────┐  │
│  │       Node.js 运行时            │   │  │        Rust Core            │  │
│  │   - 完整的 Node API             │   │  │   - 零成本抽象               │  │
│  │   - npm 生态系统                │   │  │   - 内存安全                 │  │
│  │   - 较大的运行时开销            │   │  │   - 极小的运行时             │  │
│  └─────────────────────────────────┘   │  └─────────────────────────────┘  │
│                                         │                                   │
│  包大小: ~150MB+                        │  包大小: ~3-5MB                   │
│  内存: ~100MB+ 每窗口                   │  内存: ~15-30MB 每窗口            │
│  启动时间: 较慢                          │  启动时间: 快                      │
│                                         │                                   │
└─────────────────────────────────────────┴───────────────────────────────────┘
```

### 2.3 详细对比表

| 特性 | Electron | Tauri |
|------|----------|-------|
| **前端技术** | HTML/CSS/JS | HTML/CSS/JS |
| **后端语言** | JavaScript/Node.js | Rust |
| **渲染引擎** | 捆绑 Chromium | 系统 WebView |
| **包大小** | 100-200MB | 3-10MB |
| **内存占用** | 高 | 低 |
| **启动速度** | 较慢 | 快 |
| **API 安全** | 需手动配置 | 默认安全 |
| **前端框架** | 任意 | 任意 |
| **移动支持** | 无 | 实验性支持 |
| **社区规模** | 大 | 增长中 |

### 2.4 Tauri 代码示例

**tauri.conf.json**

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": true,
        "scope": ["$APPDATA/**", "$HOME/**"]
      },
      "dialog": {
        "open": true,
        "save": true
      },
      "shell": {
        "all": false,
        "open": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.example.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self'"
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "My Tauri App",
        "width": 1200,
        "height": 800
      }
    ]
  }
}
```

**src-tauri/src/main.rs (Rust 后端)**

```rust
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, State};
use std::sync::Mutex;

// 应用状态
struct AppState {
    counter: Mutex<i32>,
}

// 命令处理器
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn increment_counter(state: State<AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter += 1;
    *counter
}

#[tauri::command]
async fn open_dialog(window: tauri::Window) -> Result<Option<String>, String> {
    let file_path = tauri::api::dialog::FileDialogBuilder::new()
        .add_filter("Text Files", &["txt"])
        .pick_file();

    Ok(file_path.map(|p| p.to_string_lossy().to_string()))
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            counter: Mutex::new(0),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            increment_counter,
            open_dialog
        ])
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();

            #[cfg(debug_assertions)]
            main_window.open_devtools();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**前端调用 (JavaScript)**

```javascript
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';

// 调用 Rust 命令
async function greetUser(name) {
  const response = await invoke('greet', { name });
  console.log(response);
}

// 使用内置 API
async function pickAndReadFile() {
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'Text',
      extensions: ['txt', 'md']
    }]
  });

  if (selected) {
    const content = await readTextFile(selected);
    return content;
  }
}
```

### 2.5 工具推荐

| 工具 | 适用框架 | 用途 |
|------|----------|------|
| **@tauri-apps/cli** | Tauri | 官方 CLI 工具 |
| **create-tauri-app** | Tauri | 快速创建项目脚手架 |
| **tauri-plugin-*** | Tauri | 官方插件生态 |
| **electron-vite** | Electron | Vite 集成方案 |

---

## 3. 桌面应用的安全模型

### 3.1 概念解释

桌面应用的安全模型涉及多个层面：进程隔离、上下文隔离、内容安全策略、权限控制等。

**关键安全原则：**

- **最小权限原则**：只暴露必要的 API
- **上下文隔离**：主进程和渲染进程严格分离
- **内容安全策略 (CSP)**：防止 XSS 攻击
- **沙盒机制**：限制渲染进程的能力

### 3.2 安全架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          桌面应用安全架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         安全层 (Security Layer)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   进程隔离    │  │  上下文隔离   │  │   沙盒机制    │               │   │
│  │  │  (Process    │  │ (Context     │  │  (Sandbox)   │               │   │
│  │  │  Isolation)  │  │  Isolation)  │  │              │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐   │
│  │                      内容安全策略 (CSP)                                │   │
│  │  default-src 'self';                                                  │   │
│  │  script-src 'self' 'unsafe-inline';                                   │   │
│  │  style-src 'self' 'unsafe-inline';                                    │   │
│  │  img-src 'self' data: https:;                                         │   │
│  │  connect-src 'self' https://api.example.com;                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐   │
│  │                        权限控制 (Permission Control)                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │ 文件系统  │ │ 网络请求  │ │  剪贴板   │ │ 通知推送  │ │  摄像头   │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 代码示例

**Electron 安全配置**

```javascript
// main.js - 安全配置示例
const { app, BrowserWindow, session } = require('electron');

function createSecureWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 设置内容安全策略
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "script-src 'self';" +
          "style-src 'self' 'unsafe-inline';" +
          "img-src 'self' data: https:;" +
          "connect-src 'self' https://api.example.com;"
        ]
      }
    });
  });

  return win;
}

// 防止新窗口打开
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});
```

**Tauri 安全配置 (tauri.conf.json)**

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "readFile": true,
        "writeFile": false,
        "scope": {
          "allow": ["$APP/*", "$APPDATA/*"],
          "deny": ["$APP/secrets.txt"]
        }
      },
      "http": {
        "request": true,
        "scope": ["https://api.example.com/*"]
      }
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    }
  }
}
```

**安全通信模式 (preload.js)**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

const validChannels = {
  send: ['app:quit', 'window:minimize'],
  invoke: ['app:get-info', 'file:read'],
  receive: ['update:available']
};

contextBridge.exposeInMainWorld('secureAPI', {
  send: (channel, data) => {
    if (validChannels.send.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  invoke: async (channel, data) => {
    if (validChannels.invoke.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Unauthorized channel: ${channel}`);
  },

  on: (channel, callback) => {
    if (validChannels.receive.includes(channel)) {
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  }
});
```

### 3.4 工具推荐

| 工具 | 用途 | 说明 |
|------|------|------|
| **DOMPurify** | XSS 防护 | 清理 HTML 输入 |
| **CSP Evaluator** | CSP 检测 | Google 开发的 CSP 分析工具 |
| **Snyk** | 漏洞扫描 | 依赖项安全检测 |

---

## 4. 原生 API 访问

### 4.1 概念解释

桌面应用需要访问操作系统原生 API 来实现文件操作、系统通知、硬件访问等功能。

**常见原生 API 类别：**

- 文件系统操作
- 系统通知
- 剪贴板
- 系统信息
- 硬件访问
- 原生对话框

### 4.2 API 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        原生 API 访问架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        应用层 (Application)                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  文件系统 │ │  对话框   │ │  通知中心 │ │  剪贴板  │ │ 系统信息 │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────┘   │
│          │            │            │            │            │             │
│  ┌───────┴────────────┴────────────┴────────────┴────────────┴────────┐   │
│  │                      IPC / FFI 层                                    │   │
│  └───────┬─────────────────────────────┘────────┬─────────────────────┘   │
│          │                                       │                         │
│  ┌───────┴────────────────┐   ┌─────────────────┴──────────────┐         │
│  │   Node.js 后端          │   │      Rust Core API             │         │
│  │  ┌──────────────────┐  │   │  ┌──────────────────────────┐  │         │
│  │  │  fs, path, os    │  │   │  │ std::fs, std::path       │  │         │
│  │  │  native addons   │◄─┼───┼──┼─► tauri::api::file       │  │         │
│  │  └──────────────────┘  │   │  │ tauri::api::dialog       │  │         │
│  └────────────────────────┘   │  │ tauri::api::notification │  │         │
│                               │  └──────────────────────────┘  │         │
│                               └────────────────────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 代码示例

**Electron 文件系统操作**

```javascript
// main.js
const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// 安全的文件读取
ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    const allowedDir = path.join(app.getPath('userData'), 'documents');

    if (!resolvedPath.startsWith(allowedDir)) {
      throw new Error('Access denied');
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 系统通知
ipcMain.handle('notification:show', (event, { title, body }) => {
  const { Notification } = require('electron');

  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
    return { success: true };
  }
  return { success: false };
});

// 剪贴板操作
ipcMain.handle('clipboard:writeText', (event, text) => {
  const { clipboard } = require('electron');
  clipboard.writeText(text);
  return { success: true };
});
```

**Tauri 文件系统操作 (Rust)**

```rust
// src-tauri/src/main.rs
use tauri::command;
use std::fs;

#[command]
async fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[command]
async fn write_file_content(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[command]
fn show_notification(title: String, body: String) -> Result<(), String> {
    tauri::api::notification::Notification::new(&title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}
```

**前端统一调用接口**

```javascript
// api.js - 统一的 API 调用层
const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export const fileSystem = {
  async readFile(path) {
    if (isTauri) {
      const { readTextFile } = await import('@tauri-apps/api/fs');
      return await readTextFile(path);
    } else if (isElectron) {
      const result = await window.electronAPI.invoke('fs:readFile', path);
      return result.content;
    }
    throw new Error('Unsupported platform');
  }
};

export const notifications = {
  async show(title, body) {
    if (isTauri) {
      const { sendNotification } = await import('@tauri-apps/api/notification');
      sendNotification({ title, body });
    } else if (isElectron) {
      await window.electronAPI.invoke('notification:show', { title, body });
    }
  }
};
```

### 4.4 工具推荐

| 工具 | 平台 | 用途 |
|------|------|------|
| **@tauri-apps/api** | Tauri | 官方 JS API 绑定 |
| **node-gyp** | Electron | 编译原生 Node 模块 |
| **electron-rebuild** | Electron | 重建原生模块 |

---

## 5. 自动更新机制

### 5.1 概念解释

自动更新允许应用自动检测、下载和安装新版本，无需用户手动操作。

**更新流程：**

1. 检查更新：向更新服务器查询新版本
2. 下载更新：后台下载更新包
3. 安装更新：应用退出后安装新版本
4. 重启应用：启动新版本

### 5.2 更新架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         自动更新机制架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         更新服务器                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │  版本清单    │  │  更新包存储   │  │  签名验证                │   │   │
│  │  │  latest.yml  │  │  .exe, .dmg  │  │  .sig 文件              │   │   │
│  │  │  latest.json │  │  .AppImage   │  │  SHA256 校验            │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                    ┌───────────────┴───────────────┐                        │
│                    │      HTTPS 下载通道          │                        │
│                    └───────────────┬───────────────┘                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        桌面客户端                                    │   │
│  │                                                                     │   │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐          │   │
│  │   │ 检查更新 │───►│ 下载更新 │───►│ 验证签名 │───►│ 准备安装 │          │   │
│  │   └─────────┘    └─────────┘    └─────────┘    └────────┘          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 代码示例

**Electron + electron-updater**

```javascript
// main.js - 自动更新实现
const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}，是否现在下载？`,
        buttons: ['立即下载', '稍后提醒']
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '更新已下载',
        message: '新版本已下载完成，是否立即安装？',
        buttons: ['立即安装', '稍后安装']
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    });
  }

  async checkForUpdates() {
    await autoUpdater.checkForUpdates();
  }
}
```

**更新服务器配置 (electron-builder.yml)**

```yaml
appId: com.example.myapp
publish:
  provider: github
  owner: your-username
  repo: your-repo
  releaseType: release
```

**Tauri 自动更新**

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://updates.example.com/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### 5.4 工具推荐

| 工具 | 平台 | 用途 |
|------|------|------|
| **electron-updater** | Electron | 官方自动更新方案 |
| **@tauri-apps/api/updater** | Tauri | Tauri 自动更新 |
| **vercel/hazel** | 通用 | 开源更新服务器 |

---

## 6. 应用签名和分发

### 6.1 概念解释

应用签名是验证应用来源和完整性的安全机制，分发是将应用交付给用户的渠道。

**签名类型：**

- **代码签名证书**：验证开发者身份
- **Mac 公证 (Notarization)**：Apple 的安全扫描
- **Windows 签名**：防止 SmartScreen 警告

**分发渠道：**

- 官方应用商店 (Mac App Store, Microsoft Store)
- 自托管下载
- 包管理器 (Homebrew, Chocolatey, Snap)

### 6.2 签名流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         应用签名和分发流程                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   构建应用    │──►│   代码签名    │──►│   公证/扫描   │──►│   打包分发    │ │
│  │  electron    │   │  证书签名    │   │  Notarization │   │  上传服务器   │ │
│  │  tauri build │   │  Sign code   │   │  恶意软件扫描  │   │  发布商店     │ │
│  └──────────────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│                            │                  │                  │         │
│  ┌─────────────────────────┴──────────────────┴──────────────────┘         │
│  │                        签名验证链                                         │
│  │  ┌─────────────────────────────────────────────────────────────┐       │
│  │  │  Developer Certificate ──► Apple/Microsoft CA ──► Trust Root │       │
│  │  └─────────────────────────────────────────────────────────────┘       │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        分发渠道                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  官方商店     │  │  自托管       │  │  包管理器     │              │   │
│  │  │  App Store   │  │  GitHub       │  │  Homebrew    │              │   │
│  │  │  MS Store    │  │  Releases     │  │  Chocolatey  │              │   │
│  │  │  Snap Store  │  │  官网下载     │  │  Scoop       │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 代码示例

**Electron 签名配置 (electron-builder.yml)**

```yaml
# macOS 签名和公证
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  target:
    - target: dmg
      arch: [x64, arm64]
    - target: zip
      arch: [x64, arm64]

# Windows 签名
win:
  certificateFile: build/certificate.p12
  certificatePassword: ${WIN_CSC_KEY_PASSWORD}
  publisherName: "Your Company Name"
  verifyUpdateCodeSignature: true
  target:
    - target: nsis
      arch: [x64, ia32]

# Linux 签名（使用 GPG）
linux:
  target:
    - AppImage
    - deb
    - rpm
  maintainer: "Your Name <email@example.com>"

# 发布配置
publish:
  provider: github
  owner: ${GITHUB_OWNER}
  repo: ${GITHUB_REPO}
  token: ${GITHUB_TOKEN}
```

**macOS 权限声明文件 (entitlements.mac.plist)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

**公证脚本 (notarize.js)**

```javascript
const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: 'com.example.yourapp',
    appPath: path.join(appOutDir, `${appName}.app`),
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  });
};
```

**GitHub Actions 自动签名工作流**

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      # macOS 签名和公证
      - name: Build and Sign (macOS)
        if: matrix.os == 'macos-latest'
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
        run: npm run dist:mac

      # Windows 签名
      - name: Build and Sign (Windows)
        if: matrix.os == 'windows-latest'
        env:
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
        run: npm run dist:win

      # Linux 构建
      - name: Build (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: npm run dist:linux
```

### 6.4 工具推荐

| 工具 | 用途 | 说明 |
|------|------|------|
| **@electron/notarize** | macOS 公证 | Electron 官方公证工具 |
| **electron-osx-sign** | macOS 签名 | 代码签名工具 |
| **signtool** | Windows 签名 | Windows SDK 签名工具 |

---

## 7. 性能优化

### 7.1 概念解释

桌面应用性能优化包括减少内存占用、加快启动速度、优化渲染性能等方面。

**优化策略：**

- **启动优化**：懒加载、代码分割、预加载关键资源
- **内存优化**：避免内存泄漏、及时释放资源、使用虚拟列表
- **渲染优化**：减少重绘、使用 GPU 加速、优化动画

### 7.2 性能架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         性能优化策略架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      启动时间优化                                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │   代码分割    │  │   懒加载      │  │   预加载关键资源         │   │   │
│  │  │  Code Split  │  │  Lazy Load   │  │  Preload Critical        │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      内存优化                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │  垃圾回收优化 │  │  资源释放     │  │   数据结构优化           │   │   │
│  │  │  - 避免闭包   │  │  - 清理定时器 │  │  - 虚拟列表              │   │   │
│  │  │  - 弱引用     │  │  - 关闭连接   │  │  - 对象池                │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      渲染优化                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │  GPU 加速    │  │  减少重绘     │  │   动画优化               │   │   │
│  │  │  - CSS3 3D   │  │  - will-change│  │  - requestAnimationFrame │   │   │
│  │  │  - Canvas    │  │  - transform  │  │  - 节流/防抖             │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 代码示例

**启动优化 - 主进程**

```javascript
// main.js - 启动优化
const { app, BrowserWindow } = require('electron');

// 禁用 GPU 沙盒
app.commandLine.appendSwitch('disable-gpu-sandbox');

// 延迟加载模块
let mainWindow;
let autoUpdater;

app.whenReady().then(async () => {
  // 1. 先显示窗口
  mainWindow = createWindow();

  // 2. 延迟加载非关键模块
  setTimeout(() => {
    initAutoUpdater();
    initSystemTray();
  }, 1000);

  // 3. 延迟加载大型模块
  setTimeout(() => {
    initAnalytics();
  }, 5000);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // 加载完成后再显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webgl: false, // 禁用不需要的功能
      plugins: false
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadFile('index.html');

  return win;
}
```

**内存优化 - 虚拟列表**

```javascript
// renderer.js - 虚拟列表实现
class VirtualList {
  constructor(container, itemHeight, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.startIndex = 0;

    this.init();
  }

  init() {
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.style.height = `${this.totalItems * this.itemHeight}px`;
    this.scrollContainer.style.position = 'relative';

    this.container.appendChild(this.scrollContainer);

    this.visibleContainer = document.createElement('div');
    this.visibleContainer.style.position = 'absolute';
    this.visibleContainer.style.top = '0';
    this.visibleContainer.style.left = '0';
    this.visibleContainer.style.right = '0';
    this.scrollContainer.appendChild(this.visibleContainer);

    this.container.addEventListener('scroll', this.handleScroll.bind(this));

    this.render();
  }

  handleScroll() {
    const scrollTop = this.container.scrollTop;
    this.startIndex = Math.floor(scrollTop / this.itemHeight);
    this.render();
  }

  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleItems,
      this.totalItems
    );

    this.visibleContainer.style.transform =
      `translateY(${this.startIndex * this.itemHeight}px)`;

    this.visibleContainer.innerHTML = '';
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.createItem(i);
      this.visibleContainer.appendChild(item);
    }
  }

  createItem(index) {
    const div = document.createElement('div');
    div.style.height = `${this.itemHeight}px`;
    div.textContent = `Item ${index}`;
    return div;
  }
}
```

**渲染优化 - CSS 和 DOM**

```css
/* styles.css - 渲染优化 */

/* GPU 加速 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

/* 减少重绘 */
.smooth-animation {
  transform: translateX(0);
  transition: transform 0.3s ease;
}

/* 图片懒加载 */
img[data-src] {
  opacity: 0;
  transition: opacity 0.3s;
}

img.loaded {
  opacity: 1;
}
```

```javascript
// 防抖和节流
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### 7.4 工具推荐

| 工具 | 用途 | 说明 |
|------|------|------|
| **Chrome DevTools** | 性能分析 | 内存、CPU、网络分析 |
| **webpack-bundle-analyzer** | 包大小分析 | 可视化分析打包结果 |

---

## 8. 多窗口管理

### 8.1 概念解释

多窗口管理涉及窗口的创建、通信、状态同步和生命周期管理。

**窗口类型：**

- **主窗口**：应用的主界面
- **模态窗口**：阻塞式对话框
- **工具窗口**：辅助工具面板
- **弹出窗口**：提示、通知类窗口

### 8.2 多窗口架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         多窗口管理架构                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         主进程 (Main Process)                        │   │
│  │                                                                     │   │
│  │   ┌─────────────────────────────────────────────────────────────┐  │   │
│  │   │                    窗口管理器 (Window Manager)               │  │   │
│  │   │                                                             │  │   │
│  │   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │  │   │
│  │   │  │ MainWin │  │ ModalWin│  │ ToolWin │  │ PopWin  │       │  │   │
│  │   │  │  ID: 1  │  │  ID: 2  │  │  ID: 3  │  │  ID: 4  │       │  │   │
│  │   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │  │   │
│  │   │       └─────────────┴─────────────┴─────────────┘           │  │   │
│  │   │                    │                                        │  │   │
│  │   │       ┌────────────┴──────────────────────────┐            │  │   │
│  │   │       │         IPC 消息路由                  │            │  │   │
│  │   │       │   window-to-window communication      │            │  │   │
│  │   │       └───────────────────────────────────────┘            │  │   │
│  │   └─────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      窗口间通信方式                                  │   │
│  │                                                                     │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐  │   │
│  │   │  IPC 中继    │   │  Shared     │   │   BroadcastChannel      │  │   │
│  │   │  Main 中转   │   │  Storage    │   │   (浏览器 API)          │  │   │
│  │   └─────────────┘   └─────────────┘   └─────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 代码示例

**Electron 多窗口管理**

```javascript
// window-manager.js
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.setupIPCHandlers();
  }

  createWindow(type, options = {}) {
    const id = Date.now().toString();

    const configs = {
      main: { width: 1200, height: 800 },
      settings: { width: 600, height: 500, modal: true, resizable: false },
      popup: { width: 400, height: 300, frame: false, alwaysOnTop: true }
    };

    const config = {
      ...configs[type],
      ...options,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
      }
    };

    if (config.parent && this.windows.has(config.parent)) {
      config.parent = this.windows.get(config.parent);
    }

    const window = new BrowserWindow(config);
    this.windows.set(id, window);

    window.windowId = id;
    window.windowType = type;

    window.loadFile(`${type}.html`);

    window.on('closed', () => {
      this.windows.delete(id);
      this.broadcast('window:closed', { windowId: id, type });
    });

    return { id, window };
  }

  // 向所有窗口广播消息
  broadcast(channel, ...args) {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    });
  }

  setupIPCHandlers() {
    ipcMain.handle('window:create', (event, type, options) => {
      const { id } = this.createWindow(type, options);
      return { windowId: id };
    });

    ipcMain.handle('window:broadcast', (event, channel, data) => {
      const senderWindow = BrowserWindow.fromWebContents(event.sender);
      this.broadcast(channel, { from: senderWindow.windowId, data });
    });
  }
}

module.exports = { WindowManager };
```

**窗口状态同步**

```javascript
// state-sync.js - 跨窗口状态同步
class CrossWindowState {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.init();
  }

  async init() {
    this.windowId = await window.windowAPI.getCurrentWindowId();

    window.windowAPI.onBroadcast('state:update', ({ key, value, from }) => {
      if (from !== this.windowId) {
        this.state.set(key, value);
        this.notifyListeners(key, value);
      }
    });
  }

  set(key, value) {
    this.state.set(key, value);
    window.windowAPI.broadcast('state:update', {
      key, value, from: this.windowId
    });
    this.notifyListeners(key, value);
  }

  get(key) {
    return this.state.get(key);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    if (this.state.has(key)) {
      callback(this.state.get(key));
    }

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  notifyListeners(key, value) {
    this.listeners.get(key)?.forEach(callback => {
      try {
        callback(value);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }
}
```

### 8.4 工具推荐

| 工具 | 用途 | 说明 |
|------|------|------|
| **electron-window-state** | 窗口状态保存 | 保存窗口位置和大小 |
| **electron-localshortcut** | 快捷键管理 | 窗口级快捷键 |

---

## 9. 系统托盘和菜单

### 9.1 概念解释

系统托盘和菜单是桌面应用与操作系统集成的重要方式，提供快速访问和后台运行能力。

**系统托盘功能：**

- 显示应用图标
- 右键菜单
- 气泡通知
- 托盘图标动画

**应用菜单类型：**

- **应用菜单 (macOS)**：顶部菜单栏
- **窗口菜单**：窗口内菜单
- **上下文菜单**：右键菜单

### 9.2 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      系统托盘和菜单架构                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        系统托盘 (System Tray)                        │   │
│  │                                                                     │   │
│  │   ┌─────────────────────────────────────────────────────────────┐  │   │
│  │   │                      托盘图标                                 │  │   │
│  │   │  ┌─────────────────────────────────────────────────────────┐ │  │   │
│  │   │  │  图标  │  左键点击 ──► 显示/隐藏窗口                     │ │  │   │
│  │   │  └──────┘  右键点击 ──► 显示菜单                          │ │  │   │
│  │   │                                                        │  │   │
│  │   │  右键菜单：                                             │  │   │
│  │   │  ┌─────────────────────────┐                           │  │   │
│  │   │  │  打开应用               │                           │  │   │
│  │   │  │  快速操作 1             │                           │  │   │
│  │   │  │  快速操作 2             │                           │  │   │
│  │   │  │  关于                   │                           │  │   │
│  │   │  │  退出                   │                           │  │   │
│  │   │  └─────────────────────────┘                           │  │   │
│  │   └─────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        应用菜单 (Application Menu)                   │   │
│  │                                                                     │   │
│  │  ┌────────────────────────────────────────────────────────┐         │   │
│  │  │ App │ File │ Edit │ View │ Window │ Help               │         │   │
│  │  └────────────────────────────────────────────────────────┘         │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 代码示例

**Electron 系统托盘实现**

```javascript
// tray-manager.js
const { Tray, Menu, BrowserWindow } = require('electron');
const path = require('path');

class TrayManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tray = null;
    this.isQuiting = false;
    this.init();
  }

  init() {
    const iconPath = path.join(__dirname, 'assets/tray-icon.png');
    this.tray = new Tray(iconPath);
    this.tray.setToolTip('My Desktop App');

    this.updateContextMenu();

    this.tray.on('click', () => {
      this.toggleWindow();
    });

    this.mainWindow.on('close', (event) => {
      if (!this.isQuiting && process.platform !== 'darwin') {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });
  }

  updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开应用',
        click: () => this.showWindow()
      },
      {
        label: '显示/隐藏',
        click: () => this.toggleWindow()
      },
      { type: 'separator' },
      {
        label: '快速操作',
        submenu: [
          {
            label: '新建任务',
            click: () => {
              this.showWindow();
              this.mainWindow.webContents.send('tray:quick-action', 'new-task');
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          this.isQuiting = true;
          const { app } = require('electron');
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  toggleWindow() {
    if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  }

  showWindow() {
    this.mainWindow.show();
    this.mainWindow.focus();
  }
}

module.exports = { TrayManager };
```

**Electron 应用菜单**

```javascript
// menu-template.js
const { app, Menu, shell } = require('electron');

function createMenuTemplate(mainWindow) {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:new-file');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' }
      ]
    },

    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },

    {
      label: '帮助',
      submenu: [
        {
          label: '文档',
          click: () => {
            shell.openExternal('https://docs.example.com');
          }
        },
        {
          label: '检查更新',
          click: () => {
            mainWindow.webContents.send('menu:check-update');
          }
        }
      ]
    }
  ];

  return template;
}

module.exports = { createMenuTemplate };
```

**Tauri 系统托盘**

```rust
// src-tauri/src/tray.rs
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};

pub fn create_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "显示应用");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏应用");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            toggle_window(app);
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "show" => show_window(app),
                "hide" => hide_window(app),
                "quit" => app.exit(0),
                _ => {}
            }
        }
        _ => {}
    }
}
```

### 9.4 工具推荐

| 工具 | 平台 | 用途 |
|------|------|------|
| **menubar** | Electron | 创建 menubar 应用 |
| **electron-traywindow-positioner** | Electron | 窗口定位到托盘旁 |

---

## 10. 跨平台打包

### 10.1 概念解释

跨平台打包是将应用构建为各平台可执行文件的过程，需要考虑不同平台的差异和特性。

**打包目标：**

- **Windows**：.exe (NSIS), .msi, .portable
- **macOS**：.dmg, .zip, .pkg
- **Linux**：.AppImage, .deb, .rpm, .snap

### 10.2 打包架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       跨平台打包架构                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     源代码 (Source Code)                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │   │
│  │  │ 主进程    │  │ 渲染进程  │  │ 预加载脚本│  │ 静态资源            │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                        │
│                    ▼               ▼               ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     打包工具 (Build Tools)                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │ electron     │  │ tauri        │  │      签名工具             │   │   │
│  │  │ -builder     │  │ -build       │  │  - codesign              │   │   │
│  │  │ -forge       │  │              │  │  - signtool              │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                    │               │               │                        │
│        ┌───────────┴───────────┐   │   ┌───────────┴───────────┐            │
│        ▼                       ▼   ▼   ▼                       ▼            │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐         │
│  │   Windows    │        │    macOS     │        │    Linux     │         │
│  │  ┌────────┐  │        │  ┌────────┐  │        │  ┌────────┐  │         │
│  │  │ .exe   │  │        │  │ .dmg   │  │        │  │.AppImage│  │         │
│  │  │ .msi   │  │        │  │ .zip   │  │        │  │ .deb   │  │         │
│  │  │.portable│  │        │  │ .pkg   │  │        │  │ .rpm   │  │         │
│  │  └────────┘  │        │  └────────┘  │        │  └────────┘  │         │
│  └──────────────┘        └──────────────┘        └──────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 代码示例

**Electron Builder 配置**

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.example.myapp',
  productName: 'MyApp',
  directories: {
    output: 'dist'
  },

  files: [
    'main/**/*',
    'renderer/**/*',
    'preload/**/*',
    'package.json'
  ],

  // macOS 配置
  mac: {
    category: 'public.app-category.productivity',
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] }
    ],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist'
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    window: { width: 540, height: 380 }
  },

  // Windows 配置
  win: {
    target: [
      { target: 'nsis', arch: ['x64', 'ia32'] },
      { target: 'portable', arch: ['x64'] }
    ],
    publisherName: 'Your Company Name'
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },

  // Linux 配置
  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] },
      { target: 'rpm', arch: ['x64'] }
    ],
    category: 'Office',
    maintainer: 'Your Name'
  },

  // 发布配置
  publish: {
    provider: 'github',
    owner: 'your-username',
    repo: 'your-repo'
  }
};
```

**Tauri 打包配置**

```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "category": "Productivity",
      "copyright": "2024 Your Company",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.example.app",
      "shortDescription": "Application description",
      "targets": "all",
      "windows": {
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    }
  }
}
```

**GitHub Actions CI/CD 配置**

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      # macOS 构建
      - name: Build (macOS)
        if: matrix.os == 'macos-latest'
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
        run: npm run dist:mac

      # Windows 构建
      - name: Build (Windows)
        if: matrix.os == 'windows-latest'
        env:
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
        run: npm run dist:win

      # Linux 构建
      - name: Build (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: npm run dist:linux

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}-artifacts
          path: |
            dist/*.dmg
            dist/*.zip
            dist/*.exe
            dist/*.msi
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm
```

### 10.4 工具推荐

| 工具 | 用途 | 说明 |
|------|------|------|
| **electron-builder** | Electron 打包 | 最成熟的 Electron 打包工具 |
| **electron-forge** | Electron 构建 | 官方推荐的构建工具 |
| **@tauri-apps/cli** | Tauri 打包 | Tauri 官方 CLI 工具 |
| **create-dmg** | macOS DMG | 创建 macOS 安装包 |

---

## 总结

本指南全面介绍了桌面应用开发的各个方面，涵盖 Electron 和 Tauri 两大主流框架：

1. **架构原理**：理解主进程、渲染进程、预加载脚本的协作方式
2. **框架对比**：根据需求选择合适的框架（Electron 生态丰富 vs Tauri 轻量高效）
3. **安全模型**：实施 CSP、上下文隔离、最小权限原则
4. **原生 API**：通过 IPC/FFI 安全访问文件、通知、剪贴板等系统功能
5. **自动更新**：实现无缝的版本更新体验
6. **签名分发**：确保应用可信并选择合适的分发渠道
7. **性能优化**：优化启动速度、内存占用和渲染性能
8. **多窗口管理**：实现窗口创建、通信和状态同步
9. **系统托盘**：提供后台运行和快速访问能力
10. **跨平台打包**：使用 CI/CD 自动化构建各平台安装包

**选择建议：**

- **选择 Electron**：需要丰富原生功能、成熟的插件生态、快速开发
- **选择 Tauri**：追求更小体积、更低内存占用、更高安全性、Rust 技术栈

---

*文档版本: 1.0*
*最后更新: 2024年*

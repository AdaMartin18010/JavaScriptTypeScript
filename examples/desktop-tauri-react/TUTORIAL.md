# Desktop Tauri React 跟练教程

> 难度等级: ⭐⭐⭐
> 预计时间: 2-3 小时
> 前置知识: React 基础、TypeScript 基础、命令行操作基础；无需 Rust 经验

## 目标

完成本教程后，你将能够：

- 安装 Rust 工具链和 Tauri CLI，搭建 Tauri v2 开发环境
- 创建基于 Tauri v2 + React + TypeScript 的桌面应用项目
- 使用 Tauri 的 Command 系统实现前端与 Rust 后端的通信
- 在 Windows、macOS、Linux 上运行和调试桌面应用
- 打包生成各平台的原生安装包 (.msi/.exe/.dmg/.AppImage)

## 环境准备

- **Node.js**: `>= 18.0.0`
- **包管理器**: npm `>= 9.0.0` 或 pnpm/yarn
- **Git**: 用于克隆示例代码
- **编辑器**: VS Code (推荐安装 Tauri 扩展、rust-analyzer 扩展)

### 必须安装的系统依赖

**Rust 工具链** (Tauri 后端使用 Rust 编写)

```bash
# 安装 Rust (如已安装可跳过)
# Windows: 访问 https://rustup.rs/ 下载 rustup-init.exe 运行
# macOS/Linux:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 验证 Rust 安装
rustc --version   # 应输出 1.70+ 版本
cargo --version
```

**Windows 额外依赖**

```powershell
# 使用 PowerShell (管理员) 安装 Microsoft C++ 构建工具
# 或下载安装 Visual Studio 2022 Build Tools，勾选 "Desktop development with C++"
winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools"

# 安装 WebView2 Runtime (Windows 10/11 通常已预装)
# 如没有，访问: https://developer.microsoft.com/microsoft-edge/webview2/
```

**macOS 额外依赖**

```bash
# 安装 Xcode Command Line Tools
xcode-select --install
```

**Linux 额外依赖**

```bash
# Ubuntu/Debian:
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo3 libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora:
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
```

### 全局工具安装

```bash
# 安装 Tauri CLI
cargo install tauri-cli

# 或使用 npx (推荐，无需全局安装)
npx tauri --version

# 验证
cargo tauri --version
```

## Step 1: 进入项目并安装依赖

```bash
cd e:\_src\JavaScriptTypeScript\examples\desktop-tauri-react

# 安装前端依赖
npm install

# 或使用 pnpm
pnpm install
```

### 验证

```bash
npm list react react-dom @tauri-apps/api
rustc --version
```

确认前端依赖和 Rust 工具链都已就绪。

## Step 2: 项目结构解析

Tauri 项目由两部分组成：**前端** (React) 和 **后端** (Rust)。

```
.
├── src/                    # 前端 React + TypeScript 源码
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   ├── components/         # React 组件
│   └── App.css             # 样式文件
├── src-tauri/              # Rust 后端源码
│   ├── src/
│   │   └── main.rs         # Rust 程序入口
│   ├── Cargo.toml          # Rust 依赖配置
│   ├── tauri.conf.json     # Tauri 应用配置
│   ├── icons/              # 应用图标
│   └── ...
├── index.html              # 前端 HTML 模板
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
└── package.json
```

关键文件说明：

- **`src-tauri/tauri.conf.json`**: 定义应用窗口、权限、资源等
- **`src-tauri/src/main.rs`**: Rust 后端主程序，注册 Command
- **`src-tauri/Cargo.toml`**: Rust 包管理和依赖

### 验证

确认 `src-tauri/` 目录存在：

```bash
ls src-tauri/
```

## Step 3: 配置前端 (React + Vite)

本项目前端使用 Vite + React + TypeScript。核心配置已就绪：

**vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Tauri 开发服务器端口固定为 1420
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"], // 忽略 Rust 目录
    },
  },
});
```

**tsconfig.json** 已配置好 React 和 Tauri API 的类型支持。

查看前端入口 `src/main.tsx`：

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 验证

```bash
# 单独启动前端开发服务器
npm run dev
```

浏览器访问 `http://localhost:1420`，应能看到基础页面（注意：此时没有 Tauri API 能力）。

## Step 4: 添加 Rust Command (前后端通信)

Tauri 的核心能力是前端调用 Rust 后端代码。我们来添加一个自定义 Command。

**1. 编辑 `src-tauri/src/main.rs`**

在 `main` 函数上方添加新的 Command：

```rust
// 引入 Tauri 宏
use tauri::Manager;

// 已有的 Command 示例：获取系统信息
#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 这条消息来自 Rust 后端 🦀", name)
}

// 新增 Command：读取文件内容
#[tauri::command]
fn read_file_content(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

// 新增 Command：获取系统平台信息
#[tauri::command]
fn get_platform_info() -> serde_json::Value {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "family": std::env::consts::FAMILY,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file_content,    // 注册新 Command
            get_platform_info,    // 注册新 Command
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");
}
```

**2. 在前端调用 Rust Command**

编辑 `src/App.tsx`：

```tsx
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [platformInfo, setPlatformInfo] = useState<Record<string, string> | null>(null);

  async function handleGreet() {
    // 调用 Rust 的 greet Command
    const response = await invoke("greet", { name });
    setGreetMsg(response as string);
  }

  async function handleGetPlatform() {
    // 调用 Rust 的 get_platform_info Command
    const info = await invoke("get_platform_info");
    setPlatformInfo(info as Record<string, string>);
  }

  return (
    <div className="container">
      <h1>Tauri + React + TypeScript</h1>

      <div className="row">
        <input
          id="greet-input"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="输入你的名字"
        />
        <button type="button" onClick={handleGreet}>
          打招呼
        </button>
      </div>

      {greetMsg && <p className="greet-message">{greetMsg}</p>}

      <div className="row">
        <button type="button" onClick={handleGetPlatform}>
          获取系统信息
        </button>
      </div>

      {platformInfo && (
        <div className="info-card">
          <h3>系统信息</h3>
          <p>平台: {platformInfo.platform}</p>
          <p>架构: {platformInfo.arch}</p>
          <p>家族: {platformInfo.family}</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

**3. 确保 Cargo.toml 依赖完整**

打开 `src-tauri/Cargo.toml`，确认依赖项：

```toml
[package]
name = "desktop-tauri-react"
version = "0.1.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### 验证

```bash
# 运行开发版本 (同时启动前端和 Tauri 桌面窗口)
npm run tauri dev
```

桌面窗口弹出后：

1. 在输入框输入名字，点击「打招呼」，应显示来自 Rust 的问候消息
2. 点击「获取系统信息」，应显示当前操作系统和架构信息

## Step 5: 配置 Tauri 应用

编辑 `src-tauri/tauri.conf.json` 来自定义应用行为：

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "Tauri React App",
  "version": "0.1.0",
  "identifier": "com.example.tauri-react",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "我的 Tauri 应用",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": null
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
    ]
  }
}
```

关键配置项：

- **`productName`**: 应用显示名称
- **`identifier`**: 应用唯一标识（反向域名格式）
- **`windows`**: 窗口大小、标题等
- **`bundle.targets`**: 打包目标平台

### 验证

重新运行 `npm run tauri dev`，确认：

- 窗口标题显示为「我的 Tauri 应用」
- 窗口尺寸为 1200x800
- 窗口在屏幕居中

## Step 6: 打包桌面应用

```bash
# 构建生产版本 (生成各平台安装包)
npm run tauri build
```

打包输出位置：

- **Windows**: `src-tauri/target/release/bundle/msi/*.msi` 和 `src-tauri/target/release/bundle/nsis/*.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/*.dmg` 和 `src-tauri/target/release/bundle/macos/*.app`
- **Linux**: `src-tauri/target/release/bundle/appimage/*.AppImage` 和 `src-tauri/target/release/bundle/deb/*.deb`

### 验证

```bash
# Windows: 检查生成的安装包
ls src-tauri/target/release/bundle/msi/
ls src-tauri/target/release/bundle/nsis/
```

确认 `.msi` 或 `.exe` 文件已生成，大小在 3-10MB 左右（Tauri 应用体积小巧）。

### 安装测试

双击生成的安装包进行安装，确认：

- 安装过程正常完成
- 应用从开始菜单/桌面快捷方式正常启动
- 所有功能（打招呼、获取系统信息）正常工作

## Step 7: 添加文件系统权限 (高级)

Tauri v2 使用 Capability 系统管理权限。要允许应用读取文件，需要配置权限。

**1. 创建 Capability 文件**

创建 `src-tauri/capabilities/default.json`：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "默认权限配置",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:allow-read-file",
    "fs:allow-read-dir",
    "dialog:allow-open"
  ]
}
```

**2. 添加相关插件依赖**

在 `src-tauri/Cargo.toml` 中添加：

```toml
[dependencies]
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
```

在 `src-tauri/src/main.rs` 中初始化插件：

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file_content,
            get_platform_info,
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");
}
```

**3. 前端使用文件对话框**

```tsx
import { open } from "@tauri-apps/plugin-dialog";

async function handleOpenFile() {
  const filePath = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "文本文件", extensions: ["txt", "md"] }],
  });
  if (filePath) {
    const content = await invoke("read_file_content", { path: filePath });
    console.log(content);
  }
}
```

### 验证

```bash
# 重新构建并运行
npm run tauri dev
```

测试文件选择对话框能正常弹出，并正确读取选中的文本文件内容。

## 常见错误排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `cargo: command not found` | Rust 未安装或环境变量未配置 | 重新安装 Rust，重启终端；Windows 需将 `%USERPROFILE%\.cargo\bin` 加入 PATH |
| `error: linker link.exe not found` | Windows 缺少 C++ 构建工具 | 安装 Visual Studio Build Tools，勾选 "Desktop development with C++" |
| `WebView2 not found` | Windows 缺少 WebView2 Runtime | 从微软官网下载安装 WebView2 Runtime |
| `failed to run custom build command for webkit2gtk` | Linux 缺少 WebKit 开发库 | 安装 `libwebkit2gtk-4.1-dev` (Ubuntu/Debian) |
| `error: could not compile` (Rust 编译错误) | `main.rs` 中的 Command 未正确注册 | 检查 `tauri::generate_handler![]` 宏中是否包含所有 Command 名称 |
| `invoke error: command greet not found` | 前端调用的 Command 名与 Rust 后端不匹配 | 检查 `invoke("greet")` 与 `#[tauri::command] fn greet` 名称是否一致 |
| `AssetNotFound: index.html` | 前端未构建 | 运行 `npm run build` 生成 `dist/` 目录 |
| `error: failed to get cargo metadata` | Cargo.toml 格式错误 | 检查 `src-tauri/Cargo.toml` 语法 |
| `nsis build failed` | Windows 打包需要 NSIS | 安装 NSIS (`winget install NSIS.NSIS`) |

## 扩展挑战

1. **添加系统托盘**: 配置 Tauri 让应用在关闭窗口后驻留在系统托盘
2. **添加快捷键**: 使用 Tauri 的全局快捷键 API 注册应用级快捷键
3. **本地数据库**: 使用 `tauri-plugin-sql` 在 Rust 后端集成 SQLite 数据库
4. **自动更新**: 集成 `tauri-plugin-updater` 实现应用自动更新
5. **自定义窗口标题栏**: 隐藏原生标题栏，使用 React 实现自定义 UI 标题栏
6. **多窗口支持**: 使用 Tauri API 创建和管理多个应用窗口
7. **推送通知**: 使用 `tauri-plugin-notification` 发送系统通知
8. **代码签名**: 配置 Windows/macOS 的代码签名证书，发布正式版本

## 相关学习资源

- **code-lab**: `jsts-code-lab/00-language-core` — TypeScript 核心语法与类型系统
- **code-lab**: `jsts-code-lab/18-frontend-frameworks` — React Hooks、组件设计、状态管理
- **理论文档**: `JSTS全景综述/01_language_core.md` — JS/TS 语言特性参考
- **理论文档**: `JSTS全景综述/07_architecture.md` — 应用架构设计原则
- **外部参考**: [Tauri 官方文档 v2](https://v2.tauri.app/)
- **外部参考**: [Tauri API 参考](https://v2.tauri.app/reference/)
- **外部参考**: [Rust 官方学习资源](https://www.rust-lang.org/learn)

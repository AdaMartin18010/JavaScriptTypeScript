# 架构决策记录（Architecture Decision Record）

## 1. 为什么选 Tauri v2 而非 Electron

### 1.1 包体积对比

| 指标 | Tauri v2 | Electron |
|---|---|---|
| 最小应用体积 | ~3 MB | ~150 MB |
| 内存占用 | 低（共享系统 WebView） | 高（内置完整 Chromium） |
| 启动速度 | 快 | 较慢 |
| 安全攻击面 | 小（无内置 Node.js） | 大 |

**决策理由**：本项目作为示例项目，希望展示现代桌面开发的最佳实践。Tauri v2 基于操作系统原生 WebView，避免了捆绑整个 Chromium，显著降低分发体积。

### 1.2 安全模型差异

- **Electron**：前端代码运行在具有完整 Node.js 环境的渲染进程中，虽然可通过 `contextIsolation` 和 `preload` 脚本缓解，但攻击面仍然较大。
- **Tauri v2**：前端完全沙箱化，无 Node.js 访问权限。所有系统 API 调用必须通过 Rust 后端显式暴露的 `#[command]` 函数，且受 **Capabilities（能力）** 权限系统约束。

### 1.3 前端技术自由度

两者均支持任意前端框架。Tauri v2 对前端无侵入，仅要求构建产物为静态文件即可。

---

## 2. 前后端通信模型

### 2.1 Tauri v2 通信架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端 (Frontend)                       │
│  React 19 + TypeScript + Vite                            │
│  ┌──────────────┐                                        │
│  │ invoke(cmd)  │──────┐                                 │
│  └──────────────┘      │                                 │
│                        ▼                                 │
│              ┌─────────────────┐                         │
│              │  Tauri IPC Bridge │ ←── 序列化 (JSON)      │
│              └─────────────────┘                         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                        ▼                                 │
│                     后端 (Backend)                        │
│  Rust + Tauri Runtime                                    │
│  ┌──────────────────────────────────────────────┐       │
│  │ #[tauri::command]                            │       │
│  │ pub fn read_directory(path: String) -> ...   │       │
│  └──────────────────────────────────────────────┘       │
│                         │                                │
│              ┌──────────┴──────────┐                    │
│              ▼                     ▼                    │
│        OS File API            OS System API             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 通信方式

| 方向 | 方式 | 说明 |
|---|---|---|
| 前端 → 后端 | `invoke(command, payload)` | 请求/响应模式，支持 async/await |
| 后端 → 前端 | `window.emit(event, payload)` | 事件推送模式（本示例未使用） |
| 后端 → 前端 | `window.eval(js)` | 不推荐，仅在特殊场景使用 |

### 2.3 数据序列化

Tauri 使用 **JSON** 作为 IPC 序列化格式。Rust 端通过 `serde` 自动处理序列化/反序列化，前端获得类型安全的 TypeScript 类型。

---

## 3. 安全模型详解

### 3.1 能力系统（Capabilities）

Tauri v2 引入基于能力的权限模型，替代了 v1 的 allowlist：

```json
// capabilities/default.json
{
  "identifier": "default",
  "permissions": [
    "fs:allow-read-dir",
    "clipboard-manager:allow-write-text",
    "notification:allow-show"
  ]
}
```

**原则**：默认拒绝（Deny by Default），必须显式声明每个权限。

### 3.2 内容安全策略（CSP）

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' ipc:"
    }
  }
}
```

- 禁止加载外部资源
- 仅允许同源和 IPC 通信
- 有效防止 XSS 和数据泄露

### 3.3 前端沙箱

Tauri 前端运行在**无 Node.js 的 WebView 沙箱**中：

- 无法访问 `fs`、`path`、`os` 等模块
- 无法执行系统命令
- 无法读取用户文件

所有系统交互必须通过 Rust 命令代理，并在 Capabilities 中授权。

---

## 4. 项目目录结构逻辑

```
desktop-tauri-react/
├── src/                    # 前端源码（React 19 + TypeScript）
│   ├── components/         # UI 组件（按功能划分）
│   ├── hooks/              # 自定义 Hooks（业务逻辑复用）
│   ├── lib/                # 工具函数（纯函数，无状态）
│   ├── types/              # 全局类型定义（前后端共享数据结构）
│   └── styles/             # 全局样式（Tailwind v4 + CSS 变量）
├── src-tauri/              # Rust 后端源码
│   ├── src/
│   │   ├── main.rs         # 应用入口（注册命令、初始化插件）
│   │   └── lib.rs          # 命令实现（业务逻辑）
│   ├── capabilities/       # 权限配置（v2 能力系统）
│   └── Cargo.toml          # Rust 依赖
├── docs/                   # 项目文档
└── package.json            # 前端依赖
```

---

## 5. 构建与分发流程

```
1. 前端构建: npm run build
   └─→ 生成 dist/ 静态文件

2. 后端构建: cargo build --release
   └─→ Rust 编译 + 嵌入前端资源

3. 打包: npm run tauri:build
   └─→ 平台特定安装包 (.msi, .dmg, .AppImage, .deb)
```

---

## 6. 关键技术选型对比

| 技术 | 版本 | 选型理由 |
|---|---|---|
| Tauri | v2 | 原生 WebView、Rust 后端、能力权限系统 |
| React | 19 | 最新稳定版，并发特性，更好的类型支持 |
| TypeScript | 5.6 | 严格类型检查，更好的编辑器体验 |
| Tailwind CSS | v4 | 原子化 CSS，快速开发，深色模式支持 |
| Vite | 6 | 极速 HMR，原生 ESM，与 Tauri 集成良好 |
| Lucide | 最新 | 轻量级图标库，树摇优化 |

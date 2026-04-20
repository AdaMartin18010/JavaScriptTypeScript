# Desktop Tauri React

基于 **Tauri v2 + React 19 + TypeScript + Tailwind CSS v4** 的跨平台桌面应用示例项目，展示现代桌面端开发的最佳实践。

---

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| [Tauri](https://tauri.app/) | v2 | 跨平台桌面应用框架（Rust 后端 + 原生 WebView） |
| [React](https://react.dev/) | 19 | 前端 UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.6 | 静态类型系统 |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | 原子化 CSS 框架 |
| [Vite](https://vitejs.dev/) | 6 | 前端构建工具 |
| [Lucide React](https://lucide.dev/) | latest | 图标库 |
| [Rust](https://www.rust-lang.org/) | 1.70+ | Tauri 后端运行时 |

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 20.0.0
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- 操作系统对应的原生 WebView 运行时：
  - **Windows**: WebView2（Windows 10/11 通常已预装）
  - **macOS**: WKWebView（系统自带）
  - **Linux**: WebKitGTK（需手动安装）

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装 Tauri CLI（若未全局安装）
npm install -g @tauri-apps/cli
```

### 开发模式

```bash
# 同时启动前端开发服务器和 Tauri 桌面窗口
npm run tauri:dev
```

前端服务运行在 `http://localhost:1420`，Tauri 窗口自动加载该地址。

### 构建生产版本

```bash
# 构建前端并编译 Rust 后端，生成本地安装包
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下：

- **Windows**: `.msi` 安装包
- **macOS**: `.dmg` 磁盘镜像
- **Linux**: `.AppImage` / `.deb` 包

### 运行测试

```bash
# 运行前端单元测试
npm run test

# 运行测试（UI 模式）
npm run test:ui
```

---

## 项目结构

```
desktop-tauri-react/
├── src/                              # 前端源码
│   ├── main.tsx                      # React 应用入口
│   ├── App.tsx                       # 根组件（布局 + 状态管理）
│   ├── components/                   # UI 组件
│   │   ├── TitleBar.tsx              # 自定义标题栏（窗口控制）
│   │   ├── Sidebar.tsx               # 侧边栏导航
│   │   ├── FileExplorer.tsx          # 文件浏览器（调用 Tauri FS API）
│   │   ├── SystemInfo.tsx            # 系统信息展示
│   │   ├── ThemeToggle.tsx           # 浅色/深色主题切换
│   │   └── __tests__/                # 组件测试
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── useTauriCommand.ts        # Tauri 命令调用封装
│   │   ├── useLocalStorage.ts        # localStorage 状态管理
│   │   └── __tests__/                # Hook 测试
│   ├── lib/                          # 工具函数
│   │   └── utils.ts                  # cn 合并、格式化、防抖
│   ├── types/                        # 全局 TypeScript 类型
│   │   └── index.ts                  # FsEntry、SystemInfoData 等
│   └── styles/                       # 全局样式
│       └── globals.css               # Tailwind 指令 + CSS 变量 + 滚动条
├── src-tauri/                        # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs                   # 应用入口（命令注册 + 插件初始化）
│   │   └── lib.rs                    # 命令实现（FS、系统信息、剪贴板、通知）
│   ├── capabilities/
│   │   └── default.json              # Tauri v2 能力（权限）配置
│   ├── Cargo.toml                    # Rust 依赖
│   └── tauri.conf.json               # Tauri 应用配置
├── docs/                             # 项目文档
│   ├── ARCHITECTURE.md               # 架构决策记录
│   ├── MILESTONES.md                 # 5 个学习里程碑
│   └── TAURI_VS_ELECTRON.md          # Tauri 与 Electron 详细对比
├── package.json                      # 前端依赖
├── tsconfig.json                     # TypeScript 配置
├── vite.config.ts                    # Vite 构建配置
├── tailwind.config.js                # Tailwind CSS 配置
└── index.html                        # HTML 入口
```

---

## 核心功能演示

### 1. 自定义标题栏

应用隐藏系统默认标题栏（`decorations: false`），使用 Tauri 的窗口 API 实现最小化、最大化、关闭按钮，同时保留窗口拖拽功能。

### 2. 文件浏览器

前端通过 `invoke("read_directory")` 调用 Rust 后端命令，安全读取文件系统。目录内容在前端以表格形式展示，支持进入子目录和返回上级。

### 3. 系统信息

通过 `tauri-plugin-os` 获取操作系统平台、版本、主机名、架构等信息，结合 Rust 代码获取 CPU 核心数和总内存，展示为信息卡片。

### 4. 主题切换

使用 Tailwind CSS 的 `dark` 变体和 CSS 变量实现浅色/深色模式切换，状态持久化到 `localStorage`。

### 5. 深色模式支持

所有组件自适应深色模式，通过 `document.documentElement.classList.toggle("dark")` 切换主题类。

---

## Tauri v2 与 Electron 的对比

| 维度 | Tauri v2 | Electron |
|---|---|---|
| 应用体积 | ~3-5 MB | ~150-200 MB |
| 内存占用 | 低（共享系统 WebView） | 高（内置 Chromium） |
| 启动速度 | 快 | 较慢 |
| 安全模型 | 默认沙箱 + 能力权限 | 需手动配置 contextIsolation |
| 后端语言 | Rust | Node.js |
| 移动端支持 | ✅ iOS / Android | ❌ 不支持 |

更多详细对比请参阅 [`docs/TAURI_VS_ELECTRON.md`](./docs/TAURI_VS_ELECTRON.md)。

---

## 学习资源

本项目作为示例，建议配合以下资料学习：

- **桌面端开发指南**: `docs/platforms/desktop-development.md`
- **TypeScript 语言核心**: `jsts-code-lab/00-language-core/`
- **设计模式实践**: `jsts-code-lab/02-design-patterns/`
- **前端框架深入**: `jsts-code-lab/18-frontend-frameworks/`
- **运行时深度分析**: `JSTS全景综述/JS_TS_现代运行时深度分析.md`

---

## 架构说明

本项目采用前后端分离架构：

- **前端**（`src/`）：React 19 构建的 SPA，负责 UI 渲染和用户交互
- **后端**（`src-tauri/`）：Rust 运行时，负责系统 API 代理和安全沙箱
- **通信层**：Tauri IPC（基于 JSON 序列化），前端通过 `invoke()` 调用后端命令

完整架构决策请参阅 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)。

---

## 学习路径

本项目设计了 5 个递进式学习里程碑：

1. **项目初始化与 Tauri v2 架构理解**（2 小时）
2. **前端 UI 搭建（Tailwind v4 + React 19）**（3 小时）
3. **Rust 后端命令开发（文件系统、系统信息）**（4 小时）
4. **前后端通信与状态同步**（3 小时）
5. **打包、签名与跨平台分发**（2 小时）

详细内容请参阅 [`docs/MILESTONES.md`](./docs/MILESTONES.md)。

---

## 常见问题

### Q: 如何调试 Rust 后端代码？

A: 开发模式下会自动打开 DevTools。Rust 端日志通过 `tauri-plugin-log` 输出，也可以使用 `cargo run` 时在终端查看 `println!` 输出。

### Q: 为什么文件浏览器只能访问特定目录？

A: Tauri v2 采用基于能力的权限系统。请在 `src-tauri/capabilities/default.json` 中添加 `fs:allow-*` 相关权限，并在 `tauri.conf.json` 中配置作用域。

### Q: 构建失败提示缺少 WebView2？

A: Windows 系统需要安装 [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。Windows 11 通常已预装。

---

## License

MIT

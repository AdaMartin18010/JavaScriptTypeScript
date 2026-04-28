# 学习里程碑

本文档为 `desktop-tauri-react` 示例项目设计 5 个递进式学习里程碑，帮助开发者系统掌握 Tauri v2 + React 桌面应用开发。

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

---

## 学习路径总览

```
里程碑 1 (2h) ──→ 里程碑 2 (3h) ──→ 里程碑 3 (4h) ──→ 里程碑 4 (3h) ──→ 里程碑 5 (2h)
   架构理解          UI 搭建           Rust 后端         前后端通信         打包分发
```

**总预计时间**：14 小时

**建议学习方式**：按顺序完成每个里程碑，每个里程碑结束后运行完整测试确保功能正常，再进行下一个里程碑。

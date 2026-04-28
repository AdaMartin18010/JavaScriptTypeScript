# 桌面端示例项目

> **定位**：`50-examples/50.5-desktop/`
> **新增**：2026-04

---

## 项目：Tauri v2 + React + TypeScript

**技术栈**：

- Tauri v2（Rust 后端 + Web 前端）
- React 19
- TypeScript Strict
- 本地文件系统访问

**功能特性**：

- 跨平台桌面应用（Windows/macOS/Linux）
- 本地 SQLite 数据库
- 系统通知
- 自动更新

**对比 Electron**：

| 维度 | Electron | Tauri v2 |
|------|---------|---------|
| 包体积 | 150MB+ | **3-5MB** |
| 内存占用 | 高 | **低** |
| 安全模型 | 全权限 | **显式权限** |
| 后端语言 | Node.js | **Rust** |

**关联 code-lab 模块**：

- `20.5-frontend-frameworks/`
- `20.9-observability-security/`

---

*本目录为桌面端开发生态的完整示例，基于 Tauri v2 的现代架构。*

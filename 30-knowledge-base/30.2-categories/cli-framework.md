# CLI 框架

> JavaScript/TypeScript CLI 工具开发框架选型。

---

## 主流方案

| 框架 | 特点 | 包体积 |
|------|------|--------|
| **Commander.js** | 最流行，简单命令解析 | ~15KB |
| **oclif** | Heroku/Slack 出品，插件化 | ~50KB |
| **Ink** | React 渲染终端 UI | ~30KB |
| **Pastel** | 基于 Ink 的框架 | ~20KB |
| **Clack** | 交互式提示，现代体验 | ~10KB |
| **cac** | 极简，零依赖 | ~5KB |

## 2026 推荐

- **简单脚本**：Commander.js 或 cac
- **复杂交互式 CLI**：Clack + Ink
- **企业级工具**：oclif

---

*最后更新: 2026-04-29*

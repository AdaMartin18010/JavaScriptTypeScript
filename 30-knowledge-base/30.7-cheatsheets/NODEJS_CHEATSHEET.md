# Node.js 速查表（v24+）

> **定位**：`30-knowledge-base/30.7-cheatsheets/`

---

## 核心模块

| 模块 | 用途 | 替代方案 |
|------|------|---------|
| `fs/promises` | 文件系统 | — |
| `path` | 路径处理 | — |
| `http` / `https` | HTTP 服务器 | `fastify` / `express` |
| `stream` | 流处理 | — |
| `crypto` | 加密 | — |
| `events` | EventEmitter | `EventTarget` |
| `worker_threads` | 多线程 | — |
| `child_process` | 子进程 | — |
| `cluster` | 集群 | PM2 |
| `sqlite` | 内置 SQLite | `better-sqlite3` |

## v24 新特性

| 特性 | 命令/用法 |
|------|----------|
| 原生 TS 执行 | `node --experimental-strip-types` |
| 内置测试 | `node --test` |
| Watch 模式 | `node --watch` |
| 权限模型 | `node --permission` |
| 内置 SQLite | `const db = new sqlite.DatabaseSync(':memory:')` |

## 常用命令

```bash
# 运行测试
node --test

# 监视模式
node --watch app.js

# 原生 TS
node --experimental-strip-types app.ts

# 检查权限
node --permission --allow-fs-read=* app.js
```

---

*速查表针对 Node.js v24+，涵盖核心 API 与新特性。*

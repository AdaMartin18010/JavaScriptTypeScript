# Node.js 核心实验室 — 理论基础

## 1. Node.js 运行时架构

### 1.1 事件驱动模型

Node.js 基于 libuv 实现跨平台异步 IO：

- **事件循环**: 单线程执行 JavaScript，异步操作委托给线程池
- **线程池**: libuv 管理的线程池处理文件系统、DNS 等阻塞操作
- **回调队列**: 异步操作完成后回调进入队列，等待事件循环执行

### 1.2 核心模块

| 模块 | 用途 |
|------|------|
| **fs** | 文件系统操作（同步/异步/Stream） |
| **http/https** | HTTP 服务器和客户端 |
| **stream** | 流处理（Readable/Writable/Transform） |
| **buffer** | 二进制数据处理 |
| **crypto** | 加密、哈希、HMAC |
| **events** | 事件发射器（EventEmitter） |
| **path** | 路径解析和拼接 |
| **os** | 操作系统信息 |

## 2. Stream 处理

Node.js 的 Stream 是处理大数据的核心抽象：

```
Readable → Transform → Writable
```

- **Readable**: 数据来源（文件、网络、生成器）
- **Transform**: 数据转换（压缩、加密、解析）
- **Writable**: 数据目的地（文件、网络、stdout）

背压（Backpressure）处理：当 Writable 消费速度慢于 Readable 生产速度时，自动暂停读取。

## 3. 模块系统

- **CommonJS**: `require()` / `module.exports`，运行时同步加载
- **ESM**: `import` / `export`，静态解析，支持顶级 await
- **互操作**: Node.js 的 ESM/CJS 互操作规则

## 4. 进程管理

- **Cluster**: 主进程 + 工作进程模型，利用多核 CPU
- **Worker Threads**: 真正的多线程，共享内存（SharedArrayBuffer）
- **Child Process**: 子进程.spawn() / .exec()，适合 CPU 密集型任务

## 5. 与相邻模块的关系

- **19-backend-development**: 后端服务开发
- **12-package-management**: npm 包管理
- **50-browser-runtime**: 浏览器运行时对比

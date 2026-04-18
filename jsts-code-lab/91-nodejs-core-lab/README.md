# 91-nodejs-core-lab: Node.js 核心模块实战实验室

## 模块说明

本模块深入 Node.js 核心模块的工程实践，涵盖文件系统、HTTP 服务器、加密、流处理等高频场景。代码基于 Node.js 22+ LTS，优先使用 Promise API 与现代 Web Streams 互操作。

## 学习目标

1. 掌握 fs 模块现代用法：Promise API、FileHandle、文件监听、路径安全
2. 构建高性能 HTTP/HTTPS 服务器，理解 Keep-Alive、代理、压缩
3. 正确使用 crypto 模块完成哈希、HMAC、AES-GCM 加解密、密钥派生
4. 熟练运用 stream 模块的 pipeline、Web Streams 互操作与自定义 Transform

## 文件清单

| 文件 | 说明 |
|---|---|
| `fs-patterns.ts` | fs 模块最佳实践 |
| `http-server-patterns.ts` | http/https 高性能服务器模式 |
| `crypto-patterns.ts` | crypto 加密模式 |
| `stream-pipeline.ts` | stream 管道与 Web Streams 互操作 |
| `nodejs-core-lab.test.ts` | 集成测试 |
| `index.ts` | 模块入口 |

## 运行方式

```bash
# 运行测试
pnpm vitest run 91-nodejs-core-lab

# 运行 demo
pnpm tsx 91-nodejs-core-lab/index.ts
```

## 环境要求

- Node.js ≥ 22.0.0

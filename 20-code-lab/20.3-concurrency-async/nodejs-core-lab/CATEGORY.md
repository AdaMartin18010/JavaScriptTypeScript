---
dimension: 综合
sub-dimension: Nodejs core lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Nodejs core lab 核心概念与工程实践。

## 包含内容

- 本模块聚焦 nodejs core lab 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 crypto-patterns.ts
- 📄 fs-patterns.ts
- 📄 http-server-patterns.ts
- 📄 index.ts
- 📄 nodejs-core-lab.test.ts
- 📄 stream-pipeline.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Stream Pipeline | 可组合、背压感知的数据流处理 | `stream-pipeline.ts` |
| HTTP Server Patterns | 高性能 HTTP 服务端模式（路由、中间件、错误处理） | `http-server-patterns.ts` |
| FS Patterns | 异步/同步文件系统操作、Watch 模式、流式读写 | `fs-patterns.ts` |
| Crypto Patterns | 哈希、HMAC、对称/非对称加密、随机字节生成 | `crypto-patterns.ts` |

## 代码示例：Stream Pipeline

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

async function compressLog(src: string, dest: string): Promise<void> {
  await pipeline(
    createReadStream(src),
    createGzip(),
    createWriteStream(dest)
  );
  console.log('Pipeline succeeded.');
}

// 背压自动处理：当写入端忙时，读取端会暂停，防止内存膨胀
compressLog('./app.log', './app.log.gz').catch(console.error);
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Docs | 官方文档 | [nodejs.org/api](https://nodejs.org/api/) |
| Node.js Stream Handbook | 指南 | [github.com/substack/stream-handbook](https://github.com/substack/stream-handbook) |
| libuv Design | 架构文档 | [docs.libuv.org](https://docs.libuv.org/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*

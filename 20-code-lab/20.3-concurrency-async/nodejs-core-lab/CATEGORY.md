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

## 代码示例：HTTP Server 路由与中间件模式

```typescript
// http-server-patterns.ts — 极简 Express/Koa 风格中间件引擎
import { createServer, IncomingMessage, ServerResponse } from 'http';

type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
type Handler = (req: IncomingMessage, res: ServerResponse) => void;

class HttpServer {
  private middlewares: Middleware[] = [];
  private routes = new Map<string, Handler[]>();

  use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  get(path: string, handler: Handler) {
    const list = this.routes.get(`GET:${path}`) ?? [];
    list.push(handler);
    this.routes.set(`GET:${path}`, list);
  }

  private executeMiddlewares(req: IncomingMessage, res: ServerResponse, index: number): void {
    if (index >= this.middlewares.length) {
      const handlers = this.routes.get(`${req.method}:${req.url}`) ?? [];
      handlers.forEach(h => h(req, res));
      return;
    }
    this.middlewares[index](req, res, () => this.executeMiddlewares(req, res, index + 1));
  }

  listen(port: number) {
    return createServer((req, res) => {
      this.executeMiddlewares(req, res, 0);
    }).listen(port);
  }
}

// 使用示例
const app = new HttpServer();
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});
app.get('/health', (_req, res) => {
  res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
});
app.listen(3000);
```

## 代码示例：FS 模式 — 流式读写与 Watch 模式

```typescript
// fs-patterns.ts — 文件系统高级模式
import { createReadStream, createWriteStream, watch, promises as fs } from 'fs';
import { createInterface } from 'readline';

// 模式 1：大文件流式逐行处理（避免一次性加载到内存）
async function processLines(filePath: string, processor: (line: string) => void): Promise<void> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    processor(line);
  }
}

// 模式 2：目录递归遍历与过滤
async function* walkDir(dir: string, pattern?: RegExp): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      yield* walkDir(fullPath, pattern);
    } else if (!pattern || pattern.test(entry.name)) {
      yield fullPath;
    }
  }
}

// 使用示例：遍历所有 .ts 文件
// for await (const file of walkDir('./src', /\.ts$/)) { console.log(file); }

// 模式 3：文件变更监听（debounce 防抖）
function watchFileWithDebounce(filePath: string, callback: () => void, delay = 300): () => void {
  let timer: NodeJS.Timeout;
  const watcher = watch(filePath, () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  });
  return () => { clearTimeout(timer); watcher.close(); };
}
```

## 代码示例：Crypto 模式 — 哈希、加密与随机生成

```typescript
// crypto-patterns.ts — Node.js crypto 核心模式
import {
  createHash, createHmac, randomBytes, scryptSync,
  createCipheriv, createDecipheriv,
  generateKeyPairSync,
} from 'crypto';

// 模式 1：密码哈希（scrypt，比 pbkdf2 更抗 GPU 破解）
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

// 模式 2：AES-256-GCM 对称加密（带认证标签，防篡改）
function encrypt(text: string, key: Buffer): { iv: string; encrypted: string; tag: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf-8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    tag: tag.toString('hex'),
  };
}

function decrypt(data: { iv: string; encrypted: string; tag: string }, key: Buffer): string {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, 'hex')),
    decipher.final(),
  ]).toString('utf-8');
}

// 模式 3：RSA 密钥对生成（用于 JWT 签名等场景）
function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

import { timingSafeEqual } from 'crypto';
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Docs | 官方文档 | [nodejs.org/api](https://nodejs.org/api/) |
| Node.js Stream Handbook | 指南 | [github.com/substack/stream-handbook](https://github.com/substack/stream-handbook) |
| libuv Design | 架构文档 | [docs.libuv.org](https://docs.libuv.org/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Node.js HTTP Module | 文档 | [nodejs.org/api/http.html](https://nodejs.org/api/http.html) |
| Node.js FS Module | 文档 | [nodejs.org/api/fs.html](https://nodejs.org/api/fs.html) |
| Node.js Crypto Module | 文档 | [nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html) |
| OWASP Password Storage Cheat Sheet | 指南 | [cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) |
| NIST SP 800-132 | 规范 | [nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) |

---

*最后更新: 2026-04-29*

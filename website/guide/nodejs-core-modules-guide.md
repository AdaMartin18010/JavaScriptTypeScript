---
title: Node.js 核心模块完全指南
description: "Awesome JS/TS Ecosystem 指南: Node.js 核心模块完全指南"
---

# Node.js 核心模块完全指南

> 系统梳理 Node.js 内置核心模块（built-in modules），覆盖文件系统、网络、加密、流处理、进程管理等关键能力。本文档基于 Node.js 20 LTS / 22 LTS 特性编写，强调 TypeScript 类型安全最佳实践。

---

## 目录

- [Node.js 核心模块完全指南](#nodejs-核心模块完全指南)
  - [目录](#目录)
  - [1. fs（文件系统）](#1-fs文件系统)
    - [1.1 同步 API](#11-同步-api)
    - [1.2 回调式异步 API](#12-回调式异步-api)
    - [1.3 Promise API（fs/promises）](#13-promise-apifspromises)
    - [1.4 Stream API](#14-stream-api)
    - [1.5 监视文件变更](#15-监视文件变更)
    - [1.6 常见陷阱](#16-常见陷阱)
  - [2. path（路径处理）](#2-path路径处理)
    - [2.1 核心方法](#21-核心方法)
    - [2.2 POSIX vs Windows](#22-posix-vs-windows)
    - [2.3 路径安全](#23-路径安全)
  - [3. http / https（HTTP 服务器与客户端）](#3-http--httpshttp-服务器与客户端)
    - [3.1 创建 HTTP 服务器](#31-创建-http-服务器)
    - [3.2 HTTP 客户端请求](#32-http-客户端请求)
    - [3.3 Keep-Alive 与连接管理](#33-keep-alive-与连接管理)
    - [3.4 常见陷阱](#34-常见陷阱)
  - [4. os（操作系统信息）](#4-os操作系统信息)
  - [5. crypto（加密与安全）](#5-crypto加密与安全)
    - [5.1 哈希与 HMAC](#51-哈希与-hmac)
    - [5.2 对称加密](#52-对称加密)
    - [5.3 非对称加密](#53-非对称加密)
    - [5.4 随机数生成](#54-随机数生成)
    - [5.5 Node 20+ 变化](#55-node-20-变化)
  - [6. stream（流处理）](#6-stream流处理)
    - [6.1 Readable / Writable](#61-readable--writable)
    - [6.2 Duplex / Transform](#62-duplex--transform)
    - [6.3 pipeline 与错误处理](#63-pipeline-与错误处理)
    - [6.4 与 Web Streams 的关系](#64-与-web-streams-的关系)
  - [7. buffer（二进制数据）](#7-buffer二进制数据)
    - [7.1 创建与转换](#71-创建与转换)
    - [7.2 Buffer vs Uint8Array](#72-buffer-vs-uint8array)
  - [8. events（事件系统）](#8-events事件系统)
    - [8.1 EventEmitter 基础](#81-eventemitter-基础)
    - [8.2 错误处理](#82-错误处理)
    - [8.3 内存泄漏防护](#83-内存泄漏防护)
  - [9. util（工具函数）](#9-util工具函数)
    - [9.1 promisify](#91-promisify)
    - [9.2 inspect 与 debug](#92-inspect-与-debug)
    - [9.3 types 类型检测](#93-types-类型检测)
    - [9.4 parseArgs（Node 18+）](#94-parseargsnode-18)
  - [10. child\_process（子进程）](#10-child_process子进程)
    - [10.1 spawn vs exec vs execFile](#101-spawn-vs-exec-vs-execfile)
    - [10.2 fork](#102-fork)
    - [10.3 cluster 模块](#103-cluster-模块)
  - [11. url / querystring（URL 处理）](#11-url--querystringurl-处理)
    - [11.1 URL 类](#111-url-类)
    - [11.2 Legacy URL 对比](#112-legacy-url-对比)
  - [12. worker\_threads（工作线程）](#12-worker_threads工作线程)
    - [12.1 基础用法](#121-基础用法)
    - [12.2 SharedArrayBuffer 与 Atomics](#122-sharedarraybuffer-与-atomics)
    - [12.3 与 Web Workers 的差异](#123-与-web-workers-的差异)
  - [附录：核心模块速查表](#附录核心模块速查表)
  - [参考资源](#参考资源)
  - [相关资源](#相关资源)

---

## 1. fs（文件系统）

`fs` 模块是 Node.js 中访问文件系统的核心接口，提供了同步、回调式异步、基于 Promise 和流式四种风格的 API。

### 1.1 同步 API

```typescript
import * as fs from 'fs';
import * as path from 'path';

// ===== 读取文件 =====
function readFileSyncSafe(filePath: string): string {
  try {
    // 返回 string 需指定 encoding，否则返回 Buffer
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

// ===== 写入文件（自动创建目录）=====
function writeFileSyncSafe(
  filePath: string,
  data: string | Buffer
): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
}

// ===== 目录遍历（同步）=====
function* walkSync(dir: string): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkSync(fullPath);
    } else {
      yield fullPath;
    }
  }
}

// ===== 文件元信息 =====
interface FileMeta {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  modifiedAt: Date;
  createdAt: Date;
}

function getFileMeta(filePath: string): FileMeta {
  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    modifiedAt: stats.mtime,
    createdAt: stats.birthtime,
  };
}
```

---

### 1.2 回调式异步 API

```typescript
import * as fs from 'fs';

// ===== 回调式读取（传统风格）=====
function readFileCallback(
  filePath: string,
  callback: (error: NodeJS.ErrnoException | null, data?: string) => void
): void {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, data);
  });
}

// ===== 使用 util.promisify 转换（旧写法，现推荐 fs/promises）=====
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 现在可 await
async function legacyAsyncExample(): Promise<void> {
  const data = await readFileAsync('./config.json', 'utf-8');
  console.log(data);
}
```

---

### 1.3 Promise API（fs/promises）

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

// ===== 现代 Promise 风格（Node.js 14+ 推荐）=====
class FileManager {
  async readJSON<T>(filePath: string): Promise<T> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  }

  async writeJSON(filePath: string, data: unknown): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async copyDir(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await this.copyDir(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      })
    );
  }

  async removeDir(dirPath: string): Promise<void> {
    await fs.rm(dirPath, { recursive: true, force: true });
  }

  async isAccessible(filePath: string, mode: number = fs.constants.F_OK): Promise<boolean> {
    try {
      await fs.access(filePath, mode);
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  async atomicWrite(filePath: string, data: string | Buffer): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, data);
    await fs.rename(tempPath, filePath); // rename 在 POSIX 上是原子操作
  }
}

// ===== FileHandle：基于句柄的文件操作（大文件优化）=====
async function processLargeFile(filePath: string): Promise<void> {
  const handle = await fs.open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(1024);
    let bytesRead: number;
    let position = 0;

    do {
      const result = await handle.read(buffer, 0, buffer.length, position);
      bytesRead = result.bytesRead;
      position += bytesRead;

      // 处理 buffer.slice(0, bytesRead)
      processChunk(buffer.subarray(0, bytesRead));
    } while (bytesRead === buffer.length);
  } finally {
    await handle.close();
  }
}

function processChunk(chunk: Buffer): void {
  console.log('Processing chunk of size:', chunk.length);
}
```

---

### 1.4 Stream API

```typescript
import * as fs from 'fs';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';

// ===== 流式读写大文件 =====
function copyLargeFile(source: string, dest: string): Promise<void> {
  return pipeline(
    fs.createReadStream(source),
    fs.createWriteStream(dest)
  );
}

// ===== 流式压缩 =====
async function gzipFile(input: string, output: string): Promise<void> {
  await pipeline(
    fs.createReadStream(input),
    zlib.createGzip({ level: 6 }),
    fs.createWriteStream(output)
  );
}

// ===== 逐行读取（基于 readline + stream）=====
import * as readline from 'readline';

async function* readLines(filePath: string): AsyncGenerator<string> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    yield line;
  }
}

// ===== 流式 CSV 解析器示例 =====
async function parseCSVStream(
  filePath: string,
  onRow: (row: Record<string, string>) => void
): Promise<void> {
  const stream = fs.createReadStream(filePath, 'utf-8');
  let buffer = '';
  let headers: string[] | null = null;

  stream.on('data', (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!headers) {
        headers = line.split(',').map((h) => h.trim());
        continue;
      }
      const values = line.split(',');
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() || '']));
      onRow(row);
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}
```

---

### 1.5 监视文件变更

```typescript
import * as fs from 'fs';
import * as path from 'path';

// ===== fs.watch：基于操作系统事件（高效但不稳定）=====
function watchDirectory(dirPath: string, onChange: (filename: string, event: string) => void): fs.FSWatcher {
  const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      onChange(path.join(dirPath, filename), eventType);
    }
  });
  return watcher;
}

// ===== fs.watchFile：基于轮询（可靠但性能差）=====
function watchFilePolling(
  filePath: string,
  onChange: (curr: fs.Stats, prev: fs.Stats) => void
): void {
  fs.watchFile(filePath, { interval: 500 }, onChange);
}

// ===== 生产级文件监视封装 =====
class FileWatcher {
  private watchers = new Map<string, fs.FSWatcher>();

  watch(
    target: string,
    options: { recursive?: boolean; persistent?: boolean } = {},
    onChange: (event: 'rename' | 'change', filePath: string) => void
  ): void {
    if (this.watchers.has(target)) {
      throw new Error(`Already watching: ${target}`);
    }

    const watcher = fs.watch(target, { recursive: options.recursive }, (event, filename) => {
      if (filename) {
        onChange(event as 'rename' | 'change', path.join(target, filename));
      }
    });

    this.watchers.set(target, watcher);
  }

  unwatch(target: string): void {
    const watcher = this.watchers.get(target);
    if (watcher) {
      watcher.close();
      this.watchers.delete(target);
    }
  }

  unwatchAll(): void {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers.clear();
  }
}
```

---

### 1.6 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **同步 API 阻塞事件循环** | `readFileSync` 等会暂停所有并发请求 | 启动时读取配置可用同步，运行时一律用 `fs/promises` |
| **路径遍历攻击** | 用户输入 `../../../etc/passwd` | 使用 `path.resolve` + `startsWith` 校验，或 `fs.realpath` |
| **竞争条件** | `existsSync` 后文件被删除 | 直接尝试操作，`try/catch` 处理 `ENOENT` |
| **默认编码问题** | 不指定 `encoding` 返回 `Buffer` | 明确指定 `'utf-8'` 或处理 `Buffer` |
| **大文件内存溢出** | `readFile` 读取 GB 级文件 | 使用 `createReadStream` |
| **EMFILE 错误** | 同时打开过多文件句柄 | 使用 `graceful-fs` 或限制并发数 |
| **watch 事件重复触发** | 某些编辑器保存触发多次 | 使用防抖或校验文件 hash |

---

## 2. path（路径处理）

`path` 模块提供用于处理文件路径和目录路径的工具，自动适配操作系统路径分隔符。

### 2.1 核心方法

```typescript
import * as path from 'path';

// ===== 路径拼接（最常用）=====
const fullPath = path.join('/foo', 'bar', '../baz', 'file.txt');
// 结果: '/foo/baz/file.txt'

// ===== 路径解析（基于当前工作目录）=====
const absolute = path.resolve('foo', 'bar', 'baz');
// 结果: '/current/working/dir/foo/bar/baz' (类 Unix)

// ===== 路径解析为对象 =====
const parsed = path.parse('/home/user/docs/file.txt');
// {
//   root: '/',
//   dir: '/home/user/docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// ===== 路径格式化 =====
const formatted = path.format({
  dir: '/home/user',
  base: 'app.ts',
});
// 结果: '/home/user/app.ts'

// ===== 获取相对路径 =====
const relativePath = path.relative('/data/orignal', '/data/modified/file.txt');
// 结果: '../modified/file.txt'

// ===== 路径规范化（去除 . 和 ..）=====
const normalized = path.normalize('/foo//bar/../baz/./qux.txt');
// 结果: '/foo/baz/qux.txt'

// ===== 获取文件名与扩展名 =====
path.basename('/foo/bar/baz.txt');     // 'baz.txt'
path.basename('/foo/bar/baz.txt', '.txt'); // 'baz'
path.extname('/foo/bar/baz.txt');      // '.txt'
path.dirname('/foo/bar/baz.txt');      // '/foo/bar'

// ===== 判断是否为绝对路径 =====
path.isAbsolute('/foo/bar');   // true (POSIX)
path.isAbsolute('C:\\foo');    // true (Windows)
path.isAbsolute('foo/bar');    // false

// ===== 路径分隔符常量 =====
path.sep;      // POSIX: '/', Windows: '\\'
path.delimiter; // POSIX: ':', Windows: ';' (用于 PATH 环境变量)
```

---

### 2.2 POSIX vs Windows

```typescript
import * as path from 'path';

// ===== 显式使用 POSIX 或 Windows 路径逻辑 =====
const posixPath = path.posix.join('foo', 'bar');     // 'foo/bar'
const win32Path = path.win32.join('foo', 'bar');     // 'foo\\bar'

// ===== 跨平台路径处理最佳实践 =====
function normalizeForPlatform(inputPath: string): string {
  // 统一将 Windows 反斜杠转为正斜杠（常用于配置/URL 场景）
  return inputPath.replace(/\\/g, '/');
}

function ensureAbsolute(inputPath: string, cwd: string = process.cwd()): string {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);
}

// ===== 安全的路径比较 =====
function pathsEqual(a: string, b: string): boolean {
  return path.normalize(a) === path.normalize(b);
}
```

---

### 2.3 路径安全

```typescript
import * as path from 'path';

// ===== 防止路径遍历攻击 =====
function safeJoin(basePath: string, userInput: string): string {
  const resolved = path.resolve(basePath, userInput);
  const resolvedBase = path.resolve(basePath);

  // 确保解析后的路径仍在 basePath 之下
  if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
    throw new Error('Path traversal detected');
  }

  return resolved;
}

// ===== 生成安全的临时文件名 =====
import * as crypto from 'crypto';

function generateTempFileName(prefix: string = 'tmp'): string {
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}-${random}`;
}
```

---

## 3. http / https（HTTP 服务器与客户端）

### 3.1 创建 HTTP 服务器

```typescript
import * as http from 'http';
import * as url from 'url';

interface RouteHandler {
  (req: http.IncomingMessage, res: http.ServerResponse, params: Record<string, string>): void;
}

class SimpleRouter {
  private routes = new Map<string, Map<string, RouteHandler>>();

  register(method: string, pathPattern: string, handler: RouteHandler): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }
    this.routes.get(method)!.set(pathPattern, handler);
  }

  get(pathPattern: string, handler: RouteHandler): void {
    this.register('GET', pathPattern, handler);
  }

  post(pathPattern: string, handler: RouteHandler): void {
    this.register('POST', pathPattern, handler);
  }

  handle(req: http.IncomingMessage, res: http.ServerResponse): void {
    const method = req.method || 'GET';
    const reqUrl = url.parse(req.url || '/', true);

    const methodRoutes = this.routes.get(method);
    if (!methodRoutes) {
      res.statusCode = 405;
      res.end('Method Not Allowed');
      return;
    }

    for (const [pattern, handler] of methodRoutes) {
      const match = this.matchPath(reqUrl.pathname || '/', pattern);
      if (match) {
        handler(req, res, match.params);
        return;
      }
    }

    res.statusCode = 404;
    res.end('Not Found');
  }

  private matchPath(
    pathname: string,
    pattern: string
  ): { params: Record<string, string> } | null {
    const pathParts = pathname.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);

    if (pathParts.length !== patternParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return { params };
  }
}

// ===== 创建服务器 =====
const router = new SimpleRouter();

router.get('/health', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
});

router.get('/users/:id', (_req, res, params) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ userId: params.id }));
});

router.post('/users', (req, res) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ created: true, data }));
    } catch {
      res.statusCode = 400;
      res.end('Invalid JSON');
    }
  });
});

const server = http.createServer((req, res) => {
  // CORS 基础配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  router.handle(req, res);
});

// server.listen(3000, () => console.log('Server on :3000'));
```

---

### 3.2 HTTP 客户端请求

```typescript
import * as http from 'http';
import * as https from 'https';

// ===== Promise 封装的 HTTP 请求 =====
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

function request<T>(
  requestUrl: string,
  options: RequestOptions = {}
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: T }> {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers,
        timeout: options.timeout || 30000,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const body = data ? (JSON.parse(data) as T) : (undefined as unknown as T);
            resolve({ statusCode: res.statusCode || 0, headers: res.headers, body });
          } catch {
            resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data as unknown as T });
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// ===== 代理请求示例 =====
function createProxyHandler(targetHost: string, targetPort: number) {
  return (clientReq: http.IncomingMessage, clientRes: http.ServerResponse) => {
    const options: http.RequestOptions = {
      hostname: targetHost,
      port: targetPort,
      path: clientReq.url,
      method: clientReq.method,
      headers: clientReq.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(clientRes, { end: true });
    });

    clientReq.pipe(proxyReq, { end: true });
  };
}
```

---

### 3.3 Keep-Alive 与连接管理

```typescript
import * as http from 'http';
import * as https from 'https';

// ===== 复用 TCP 连接的 Agent =====
const keepAliveAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,       // 单个目标最大并发连接
  maxFreeSockets: 10,   // 空闲连接保持数
  timeout: 30000,       // 连接超时
  freeSocketTimeout: 30000, // 空闲连接回收时间
});

// HTTPS 版本
const httpsKeepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true, // 生产环境保持 true
});

// 使用 Agent 发送请求
function requestWithKeepAlive(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const agent = url.startsWith('https') ? httpsKeepAliveAgent : keepAliveAgent;

    const req = client.get(url, { agent }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
  });
}

// ===== 服务端 Keep-Alive 配置 =====
const server = http.createServer((req, res) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  res.end('ok');
});

// server.maxConnections = 1000; // 限制最大连接数
// server.setTimeout(120000);    // 请求超时
```

---

### 3.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **未处理请求体** | POST 请求需手动监听 `data`/`end` 事件 | 使用封装库或中间件（如 `raw-body`） |
| **内存泄漏** | 大量并发连接未设置 `maxSockets` | 使用 Agent 限制连接池大小 |
| **响应未结束** | 未调用 `res.end()` 导致客户端挂起 | 确保所有分支都结束响应 |
| **Header 已发送后设置** | `res.writeHead()` 后无法 `setHeader` | 提前设置 header，或使用 `res.headersSent` 判断 |
| **HTTP vs HTTPS Agent 混用** | 用 http.Agent 请求 https URL 导致错误 | 根据协议使用对应 Agent |

---

## 4. os（操作系统信息）

```typescript
import * as os from 'os';

// ===== 平台与架构 =====
os.platform();   // 'darwin' | 'linux' | 'win32' | ...
os.arch();       // 'x64' | 'arm64' | 'ia32' | ...
os.release();    // 内核版本，如 '20.6.0'（macOS）

// ===== CPU 信息 =====
interface CPUInfo {
  model: string;
  speed: number;      // MHz
  cores: number;
}

function getCPUInfo(): CPUInfo {
  const cpus = os.cpus();
  return {
    model: cpus[0]?.model || 'Unknown',
    speed: cpus[0]?.speed || 0,
    cores: cpus.length,
  };
}

// ===== 内存信息 =====
interface MemoryInfo {
  total: number;      // bytes
  free: number;       // bytes
  used: number;       // bytes
  usedPercent: number;
}

function getMemoryInfo(): MemoryInfo {
  const total = os.totalmem();
  const free = os.freemem();
  return {
    total,
    free,
    used: total - free,
    usedPercent: ((total - free) / total) * 100,
  };
}

// ===== 网络接口 =====
function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const [, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs || []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }

  return ips;
}

// ===== 系统负载（Unix-like）=====
function getSystemLoad(): number[] {
  return os.loadavg(); // 1分钟, 5分钟, 15分钟平均负载
}

// =====  home 目录与临时目录 =====
os.homedir();     // /Users/username
os.tmpdir();      // /tmp
os.hostname();    // 主机名
os.userInfo();    // { uid, gid, username, homedir, shell }

// ===== 线程池大小（UV_THREADPOOL_SIZE）=====
function getThreadpoolSize(): number {
  return process.env.UV_THREADPOOL_SIZE ? parseInt(process.env.UV_THREADPOOL_SIZE, 10) : 4;
}
```

---

## 5. crypto（加密与安全）

`crypto` 模块提供加密功能，包括 OpenSSL 的哈希、HMAC、加密、解密、签名和验证功能。

### 5.1 哈希与 HMAC

```typescript
import * as crypto from 'crypto';

// ===== 哈希计算 =====
function hashString(algorithm: string, data: string): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

function hashFile(algorithm: string, filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// 常用算法：sha256, sha512, md5（已不安全，仅校验文件）
const sha256 = hashString('sha256', 'hello world');

// ===== HMAC（带密钥的哈希）=====
function createHMAC(key: string, data: string, algorithm: string = 'sha256'): string {
  return crypto.createHmac(algorithm, key).update(data).digest('hex');
}

// ===== 派生密钥（PBKDF2）=====
function deriveKey(
  password: string,
  salt: string,
  iterations: number = 100000,
  keylen: number = 64,
  digest: string = 'sha512'
): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
}
```

---

### 5.2 对称加密

```typescript
import * as crypto from 'crypto';

// ===== AES-256-GCM（推荐：认证加密）=====
interface EncryptedData {
  iv: string;         // 初始化向量
  authTag: string;    // 认证标签（GCM 必需）
  encrypted: string;  // 密文
}

class AESGCM {
  private algorithm = 'aes-256-gcm';

  constructor(private key: Buffer) {
    if (key.length !== 32) {
      throw new Error('Key must be 32 bytes for AES-256');
    }
  }

  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
      encrypted,
    };
  }

  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}

// ===== 生成安全密钥 =====
function generateKey(): Buffer {
  return crypto.randomBytes(32); // 256 bits
}
```

---

### 5.3 非对称加密

```typescript
import * as crypto from 'crypto';

// ===== RSA 密钥对生成 =====
function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      },
      (err, publicKey, privateKey) => {
        if (err) reject(err);
        else resolve({ publicKey, privateKey });
      }
    );
  });
}

// ===== RSA 加密/解密 =====
function rsaEncrypt(publicKey: string, data: string): string {
  return crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(data)
  ).toString('base64');
}

function rsaDecrypt(privateKey: string, encrypted: string): string {
  return crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(encrypted, 'base64')
  ).toString('utf-8');
}

// ===== 数字签名 =====
function signData(privateKey: string, data: string): string {
  return crypto.createSign('sha256').update(data).sign(privateKey, 'base64');
}

function verifySignature(publicKey: string, data: string, signature: string): boolean {
  return crypto.createVerify('sha256').update(data).verify(publicKey, signature, 'base64');
}
```

---

### 5.4 随机数生成

```typescript
import * as crypto from 'crypto';

// ===== 密码学安全随机数 =====
crypto.randomBytes(16);           // 生成 16 字节随机 Buffer
crypto.randomInt(1, 101);         // [1, 100] 范围内的安全随机整数
crypto.randomUUID();              // v4 UUID（Node 14.17+）

// ===== 伪随机（非密码学场景，更快）=====
function pseudoRandomFloat(): number {
  return crypto.randomBytes(4).readUInt32LE(0) / 0xFFFFFFFF;
}
```

---

### 5.5 Node 20+ 变化

| 特性 | 变化说明 | 影响 |
|------|----------|------|
| **默认 OpenSSL 3.0** | Node 18+ 使用 OpenSSL 3，部分旧算法被标记为 legacy | 需 `--openssl-legacy-provider` 或使用替代算法 |
| **`crypto.hash()`** | Node 20.12+ / 21.6+ 新增一次性 hash API | 无需 `createHash`，简化代码 |
| **`crypto.getRandomValues()`** | 与 Web Crypto API 对齐 | 同构代码更易编写 |
| **密钥对象改进** | `KeyObject` 可导出为 JWK | 增强互操作性 |

```typescript
// Node 20.12+ 新 API
crypto.hash('sha256', 'hello world', 'hex');
```

---

## 6. stream（流处理）

Node.js 中的 Stream 是处理流数据（如网络通信、文件 I/O）的抽象接口。所有流都是 EventEmitter 的实例。

### 6.1 Readable / Writable

```typescript
import { Readable, Writable } from 'stream';

// ===== 自定义 Readable（数据源）=====
class CounterStream extends Readable {
  private count = 0;
  private max: number;

  constructor(max: number) {
    super({ objectMode: true }); // 对象模式可推送非 Buffer/String 数据
    this.max = max;
  }

  _read(): void {
    if (this.count < this.max) {
      this.push({ index: this.count, timestamp: Date.now() });
      this.count++;
    } else {
      this.push(null); // 结束流
    }
  }
}

// ===== 自定义 Writable（数据汇）=====
class LoggerStream extends Writable {
  private logs: unknown[] = [];

  _write(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.logs.push(chunk);
    if (this.logs.length >= 10) {
      this.flush();
    }
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    this.flush();
    callback();
  }

  private flush(): void {
    console.log('Flushing logs:', this.logs);
    this.logs = [];
  }
}

// 使用
const counter = new CounterStream(5);
const logger = new LoggerStream();
counter.pipe(logger);
```

---

### 6.2 Duplex / Transform

```typescript
import { Transform, Duplex, PassThrough } from 'stream';

// ===== Transform 流（转换数据）=====
class LinePrefixTransform extends Transform {
  private prefix: string;
  private buffer = '';

  constructor(prefix: string) {
    super();
    this.prefix = prefix;
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, data?: Buffer) => void
  ): void {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const output = lines.map((line) => `${this.prefix}${line}\n`).join('');
    callback(null, Buffer.from(output));
  }

  _flush(callback: (error?: Error | null, data?: Buffer) => void): void {
    if (this.buffer) {
      callback(null, Buffer.from(`${this.prefix}${this.buffer}`));
    } else {
      callback();
    }
  }
}

// ===== Duplex 流（可读可写，如 TCP socket）=====
class EchoDuplex extends Duplex {
  private data: Buffer[] = [];

  _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.data.push(chunk);
    callback();
  }

  _read(): void {
    while (this.data.length > 0) {
      const chunk = this.data.shift()!;
      if (!this.push(chunk)) break;
    }
    if (this.data.length === 0) {
      this.push(null);
    }
  }
}
```

---

### 6.3 pipeline 与错误处理

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

// ===== 现代 pipeline（Promise 版本，自动清理）=====
async function safeCompress(input: string, output: string): Promise<void> {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output)
  );
  // pipeline 在出错时自动销毁所有流，不会泄漏
}

// ===== 旧版 pipeline（stream.pipeline，回调风格）=====
import { pipeline as pipelineCallback } from 'stream';

pipelineCallback(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);

// ===== 使用 async generator 处理流数据 =====
async function* streamToLines(source: NodeJS.ReadableStream): AsyncGenerator<string> {
  let buffer = '';
  for await (const chunk of source) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      yield line;
    }
  }
  if (buffer) yield buffer;
}
```

---

### 6.4 与 Web Streams 的关系

```typescript
import { Readable } from 'stream';

// ===== Node Stream → Web ReadableStream =====
function nodeToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

// ===== Web ReadableStream → Node Stream =====
// Node 18+ 内置了 Readable.fromWeb() 和 Writable.fromWeb()
// const nodeReadable = Readable.fromWeb(webReadableStream);
```

---

## 7. buffer（二进制数据）

Buffer 类是 Uint8Array 的子类，用于处理二进制数据。Node.js 中许多 API（如 fs、net、crypto）都以 Buffer 作为数据交换格式。

### 7.1 创建与转换

```typescript
// ===== Buffer 创建 =====
const buf1 = Buffer.alloc(1024);           // 零填充，安全
const buf2 = Buffer.allocUnsafe(1024);     // 快，但可能含旧数据
const buf3 = Buffer.from('hello');         // 从字符串
const buf4 = Buffer.from([0x48, 0x65]);    // 从数组
const buf5 = Buffer.from(buf3);            // 拷贝
const buf6 = Buffer.concat([buf3, buf4]);  // 合并

// ===== 编码转换 =====
const text = 'Hello 世界';
const utf8 = Buffer.from(text, 'utf-8');
const base64 = utf8.toString('base64');
const hex = utf8.toString('hex');

// ===== 切片（共享内存）vs 拷贝 =====
const original = Buffer.from('Hello World');
const slice = original.subarray(0, 5);     // 共享内存（Node 3.0+ 推荐 subarray）
const copy = Buffer.from(original.subarray(0, 5)); // 深拷贝

slice[0] = 0x68; // 修改 'H' -> 'h'
console.log(original.toString()); // 'hello World'（slice 影响了 original）

// ===== 读写多字节数据 =====
const multi = Buffer.alloc(8);
multi.writeUInt32BE(0x12345678, 0);  // 大端序写入
multi.writeUInt32LE(0x12345678, 4);  // 小端序写入

// ===== Buffer 与 TypedArray 转换 =====
const uint8 = new Uint8Array([1, 2, 3]);
const fromUint8 = Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength);
```

---

### 7.2 Buffer vs Uint8Array

| 特性 | Buffer | Uint8Array |
|------|--------|------------|
| 所属规范 | Node.js 特有 | ECMAScript 标准 |
| 编码方法 | `.toString('base64')` 等 | 需 `btoa` / `TextEncoder` |
| 池分配 | `allocUnsafe` 使用预分配池 | 无 |
| 跨平台 | 需 Node.js 环境 | 浏览器 + Node.js 通用 |
| 性能 | 二进制操作优化更好 | 标准数组操作 |

```typescript
// ===== 同构代码建议 =====
function toBase64(data: Buffer | Uint8Array): string {
  if (Buffer.isBuffer(data)) {
    return data.toString('base64');
  }
  // 浏览器环境
  if (typeof btoa === 'function') {
    const binary = Array.from(data).map((b) => String.fromCharCode(b)).join('');
    return btoa(binary);
  }
  // Node 环境用 Uint8Array
  return Buffer.from(data).toString('base64');
}
```

---

## 8. events（事件系统）

Node.js 事件驱动架构的核心，`EventEmitter` 是实现发布-订阅模式的基础类。

### 8.1 EventEmitter 基础

```typescript
import { EventEmitter } from 'events';

// ===== 类型安全的事件封装 =====
type EventMap = {
  'data': (chunk: Buffer) => void;
  'error': (error: Error) => void;
  'end': () => void;
  'custom:event': (payload: { id: string; value: number }) => void;
};

class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  once<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  off<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    return this.emitter.emit(event as string, ...args);
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.emitter.listenerCount(event as string);
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    this.emitter.removeAllListeners(event as string | undefined);
    return this;
  }
}

// 使用示例
const emitter = new TypedEventEmitter<EventMap>();

emitter.on('data', (chunk) => {
  console.log('Received:', chunk.length, 'bytes');
});

emitter.on('custom:event', ({ id, value }) => {
  console.log('Custom event:', id, value);
});

emitter.emit('custom:event', { id: '123', value: 42 });
```

---

### 8.2 错误处理

```typescript
import { EventEmitter } from 'events';

// ===== 未捕获的错误事件 =====
// EventEmitter 的 'error' 事件是特殊的：如果没有监听器，会抛出异常并导致进程崩溃

class SafeEmitter extends EventEmitter {
  constructor() {
    super();
    // 始终至少有一个 error 监听器兜底
    this.on('error', (err) => {
      console.error('Uncaught emitter error:', err);
    });
  }
}

// ===== 异步错误处理 =====
class AsyncTaskEmitter extends EventEmitter {
  async runTask(): Promise<void> {
    try {
      await this.performWork();
      this.emit('complete');
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async performWork(): Promise<void> {
    // 模拟可能失败的工作
    throw new Error('Task failed');
  }
}
```

---

### 8.3 内存泄漏防护

```typescript
import { EventEmitter } from 'events';

// ===== 限制监听器数量 =====
const emitter = new EventEmitter();
emitter.setMaxListeners(20); // 默认 10，超过会警告

// ===== 使用 AbortController 自动清理 =====
function addDisposableListener(
  emitter: EventEmitter,
  event: string,
  listener: (...args: any[]) => void,
  signal: AbortSignal
): void {
  emitter.on(event, listener);

  signal.addEventListener('abort', () => {
    emitter.off(event, listener);
  }, { once: true });
}

// ===== 只执行一次的监听器 =====
emitter.once('init', () => {
  console.log('This fires only once');
});

// ===== 手动清理（类组件模式）=====
class ResourceMonitor {
  private listeners: Array<{ emitter: EventEmitter; event: string; handler: (...args: any[]) => void }> = [];

  subscribe(emitter: EventEmitter, event: string, handler: (...args: any[]) => void): void {
    emitter.on(event, handler);
    this.listeners.push({ emitter, event, handler });
  }

  destroy(): void {
    this.listeners.forEach(({ emitter, event, handler }) => {
      emitter.off(event, handler);
    });
    this.listeners = [];
  }
}
```

---

## 9. util（工具函数）

### 9.1 promisify

```typescript
import { promisify } from 'util';
import * as fs from 'fs';
import * as child_process from 'child_process';

// ===== 将回调式 API 转为 Promise =====
const readFile = promisify(fs.readFile);
const exec = promisify(child_process.exec);

// ===== 自定义函数的 promisify =====
function callbackStyleFunction(
  value: string,
  callback: (err: Error | null, result?: string) => void
): void {
  setTimeout(() => {
    if (value === 'error') {
      callback(new Error('Something went wrong'));
    } else {
      callback(null, `Result: ${value}`);
    }
  }, 100);
}

const promised = promisify(callbackStyleFunction);

// 使用
async function demo(): Promise<void> {
  const result = await promised('hello');
  console.log(result);
}
```

---

### 9.2 inspect 与 debug

```typescript
import { inspect } from 'util';

// ===== 格式化对象（替代 JSON.stringify 用于调试）=====
const obj = { a: 1, b: { c: [1, 2, 3] } };

console.log(inspect(obj, {
  depth: null,        // 无深度限制
  colors: true,       // 终端颜色
  showHidden: false,
  compact: false,     // 多行格式化
  breakLength: 80,
}));

// ===== 自定义 inspect 符号 =====
class CustomClass {
  private secret = 'hidden';
  public visible = 'shown';

  [Symbol.for('nodejs.util.inspect.custom')](
    _depth: number,
    options: InspectOptions,
    inspect: (obj: unknown, options?: InspectOptions) => string
  ): string {
    return `CustomClass { visible: ${inspect(this.visible, options)} }`;
  }
}
```

---

### 9.3 types 类型检测

```typescript
import { types } from 'util';

// ===== 比 typeof 更精确的类型检测 =====
types.isDate(new Date());           // true
types.isRegExp(/abc/);              // true
types.isPromise(Promise.resolve()); // true
types.isAsyncFunction(async () => {}); // true
types.isGeneratorFunction(function* () {}); // true
types.isMap(new Map());             // true
types.isSet(new Set());             // true
types.isTypedArray(new Uint8Array()); // true
types.isNativeError(new Error());   // true

// ===== 与 instanceof 的区别 =====
// instanceof 跨 Realm（如 iframe/vm）会失效
// types.isDate 基于内部 Slot 判断，跨 Realm 也有效
```

---

### 9.4 parseArgs（Node 18+）

```typescript
import { parseArgs } from 'util';

// ===== 原生命令行参数解析 =====
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    port: { type: 'string', short: 'p', default: '3000' },
    verbose: { type: 'boolean', short: 'v', default: false },
    env: { type: 'string', short: 'e', multiple: true },
  },
  strict: true,
  allowPositionals: true,
});

// npx tsx app.ts --port 8080 -v start
// values: { port: '8080', verbose: true }
// positionals: ['start']
```

---

## 10. child_process（子进程）

### 10.1 spawn vs exec vs execFile

```typescript
import { spawn, exec, execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ===== spawn：流式 IO，适合大输出 =====
function spawnExample(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('ls', ['-la', '/usr'], {
      cwd: process.cwd(),
      env: process.env,
      shell: false,     // 不通过 shell 执行，更安全
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => { stdout += chunk; });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Exit code ${code}: ${stderr}`));
      }
    });

    child.on('error', reject);
  });
}

// ===== exec：缓冲区输出，适合小输出和 shell 命令 =====
async function execExample(): Promise<void> {
  const { stdout, stderr } = await execAsync('echo "hello world"', {
    timeout: 5000,
    maxBuffer: 1024 * 1024, // 默认 1MB
  });
  console.log(stdout);
}

// ===== execFile：直接执行文件，不经过 shell（更安全）=====
async function execFileExample(): Promise<void> {
  const { stdout } = await promisify(execFile)('node', ['--version']);
  console.log('Node version:', stdout.trim());
}
```

**选型决策**：

| 方法 | 使用场景 | Shell | 内存安全 |
|------|----------|-------|----------|
| `spawn` | 长时间运行、大数据量流式处理 | 可选 | 高（流式） |
| `exec` | 短命令、需要 shell 特性（管道、重定向） | 是 | 中（有 maxBuffer） |
| `execFile` | 直接执行二进制，无需 shell | 否 | 高 |

---

### 10.2 fork

```typescript
import { fork } from 'child_process';
import * as path from 'path';

// ===== fork：创建 Node.js 子进程（带 IPC 通道）=====
interface WorkerMessage {
  type: 'result' | 'error';
  payload: unknown;
  id: string;
}

class WorkerPool {
  private workers: ReturnType<typeof fork>[] = [];

  constructor(scriptPath: string, poolSize: number = 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = fork(scriptPath, [], {
        silent: false,
        execArgv: ['--max-old-space-size=512'],
      });
      this.workers.push(worker);
    }
  }

  send(task: unknown, targetWorker?: ReturnType<typeof fork>): Promise<unknown> {
    const worker = targetWorker || this.workers[Math.floor(Math.random() * this.workers.length)];

    return new Promise((resolve, reject) => {
      const handler = (msg: WorkerMessage) => {
        worker.off('message', handler);
        if (msg.type === 'error') {
          reject(msg.payload);
        } else {
          resolve(msg.payload);
        }
      };

      worker.on('message', handler);
      worker.send(task);
    });
  }

  terminate(): void {
    this.workers.forEach((w) => w.kill('SIGTERM'));
  }
}

// worker.ts（被 fork 的脚本）
// process.on('message', (task) => {
//   try {
//     const result = performTask(task);
//     process.send!({ type: 'result', payload: result, id: task.id });
//   } catch (error) {
//     process.send!({ type: 'error', payload: error.message, id: task.id });
//   }
// });
```

---

### 10.3 cluster 模块

```typescript
import * as cluster from 'cluster';
import * as http from 'http';
import * as os from 'os';

// ===== 利用多核 CPU（cluster 是 fork 的包装）=====
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  });

  server.listen(3000);
  console.log(`Worker ${process.pid} started`);
}
```

**注意**：Node.js 18+ 推荐使用 `worker_threads` 或外部进程管理器（如 PM2）替代 cluster 模块进行扩展。

---

## 11. url / querystring（URL 处理）

### 11.1 URL 类

```typescript
// ===== 现代 URL API（WHATWG 标准）=====
const url = new URL('https://user:pass@example.com:8080/path?a=1&b=2#hash');

url.protocol;  // 'https:'
url.hostname;  // 'example.com'
url.port;      // '8080'
url.pathname;  // '/path'
url.search;    // '?a=1&b=2'
url.hash;      // '#hash'
url.username;  // 'user'
url.password;  // 'pass'

// searchParams 提供便捷的查询参数操作
url.searchParams.get('a');         // '1'
url.searchParams.getAll('a');      // ['1']
url.searchParams.append('c', '3');
url.searchParams.set('a', '10');
url.searchParams.has('b');         // true
url.searchParams.delete('b');
url.searchParams.sort();

// 修改后的 URL
console.log(url.toString());

// ===== 相对 URL 解析 =====
const base = new URL('https://api.example.com/v1/');
const endpoint = new URL('users', base); // https://api.example.com/v1/users

// ===== URL 编码/解码 =====
encodeURIComponent('hello world!');  // 'hello%20world!'
decodeURIComponent('hello%20world'); // 'hello world'

// ===== 文件 URL =====
const fileURL = new URL('file:///home/user/docs/file.txt');
import { fileURLToPath, pathToFileURL } from 'url';
const filePath = fileURLToPath(fileURL); // /home/user/docs/file.txt
const backToURL = pathToFileURL(filePath); // file:///home/user/docs/file.txt
```

---

### 11.2 Legacy URL 对比

```typescript
import * as url from 'url';

// ===== Legacy url.parse（已废弃，不推荐）=====
const legacy = url.parse('https://example.com/path?a=1', true);
// legacy.query 自动解析为对象，但有原型链污染风险

// ===== 推荐使用 WHATWG URL =====
const modern = new URL('https://example.com/path?a=1');
// modern.searchParams 无原型链污染风险

// ===== querystring 模块（遗留）=====
import * as querystring from 'querystring';

querystring.stringify({ a: '1', b: ['2', '3'] }); // 'a=1&b=2&b=3'
querystring.parse('a=1&b=2&b=3'); // { a: '1', b: ['2', '3'] }

// 现代替代：URLSearchParams
const params = new URLSearchParams({ a: '1', b: '2' });
params.toString(); // 'a=1&b=2'
```

---

## 12. worker_threads（工作线程）

Worker Threads 允许在 Node.js 中并行运行多个 JavaScript 线程，共享内存通过 `SharedArrayBuffer` 实现。

### 12.1 基础用法

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ===== 主线程 =====
interface WorkerInput {
  numbers: number[];
}

interface WorkerOutput {
  sum: number;
  average: number;
}

function runWorkerTask(input: WorkerInput): Promise<WorkerOutput> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), {
      workerData: input,
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// ===== Worker 线程代码 =====
if (!isMainThread) {
  const data = workerData as WorkerInput;
  const sum = data.numbers.reduce((a, b) => a + b, 0);

  parentPort?.postMessage({
    sum,
    average: sum / data.numbers.length,
  } as WorkerOutput);
}

// ===== 专用 worker 脚本模式（推荐）=====
function createDedicatedWorker<TInput, TOutput>(
  scriptPath: string
): { execute: (input: TInput) => Promise<TOutput>; terminate: () => void } {
  const worker = new Worker(scriptPath);

  return {
    execute(input: TInput): Promise<TOutput> {
      return new Promise((resolve, reject) => {
        const handler = (result: TOutput) => {
          worker.off('message', handler);
          resolve(result);
        };
        worker.on('message', handler);
        worker.on('error', reject);
        worker.postMessage(input);
      });
    },
    terminate() {
      worker.terminate();
    },
  };
}
```

---

### 12.2 SharedArrayBuffer 与 Atomics

```typescript
import { Worker } from 'worker_threads';

// ===== 共享内存并行计算 =====
function parallelSum(numbers: number[], numWorkers: number = 4): Promise<number> {
  return new Promise((resolve) => {
    const sharedBuffer = new SharedArrayBuffer(numbers.length * 4); // Float32
    const sharedArray = new Float32Array(sharedBuffer);
    sharedArray.set(numbers);

    const resultsBuffer = new SharedArrayBuffer(numWorkers * 4);
    const resultsArray = new Float32Array(resultsBuffer);

    let completed = 0;
    const chunkSize = Math.ceil(numbers.length / numWorkers);

    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, numbers.length);

      const worker = new Worker(`
        const { parentPort, workerData } = require('worker_threads');
        const { sharedArray, resultsArray, workerIndex, start, end } = workerData;

        let sum = 0;
        for (let i = start; i < end; i++) {
          sum += sharedArray[i];
        }

        resultsArray[workerIndex] = sum;
        parentPort.postMessage('done');
      `, { eval: true });

      worker.postMessage({
        sharedArray,
        resultsArray,
        workerIndex: i,
        start,
        end,
      });

      worker.on('message', () => {
        completed++;
        if (completed === numWorkers) {
          const total = resultsArray.reduce((a, b) => a + b, 0);
          resolve(total);
        }
        worker.terminate();
      });
    }
  });
}

// ===== Atomics 原子操作（无锁并发）=====
const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);

Atomics.store(view, 0, 100);       // 原子写入
Atomics.load(view, 0);             // 原子读取
Atomics.add(view, 0, 5);           // 原子加
Atomics.sub(view, 0, 3);           // 原子减
Atomics.compareExchange(view, 0, 100, 200); // CAS

// 等待/通知（实现锁和信号量）
// Atomics.wait(view, index, expectedValue);
// Atomics.notify(view, index, count);
```

---

### 12.3 与 Web Workers 的差异

| 特性 | Node.js Worker Threads | Web Workers（浏览器） |
|------|------------------------|----------------------|
| 全局对象 | `globalThis` / `require` | `self` / `globalThis` |
| 模块导入 | `require()` / `import` | ES Modules `import` |
| 标准库 | 完整 Node.js API | 受限（无 DOM/fs） |
| 共享内存 | `SharedArrayBuffer` | `SharedArrayBuffer` |
| 调试 | `--inspect` 支持 | DevTools |
| `fs` / `net` | ✅ 可用 | ❌ 不可用 |
| 创建成本 | 较高（V8 Isolate） | 较高 |
| 通信方式 | `MessageChannel` / `MessagePort` | `postMessage` |

---

## 附录：核心模块速查表

| 模块 | 核心用途 | 现代推荐 API | 浏览器等价物 |
|------|----------|-------------|-------------|
| `fs` | 文件系统读写 | `fs/promises` | File System Access API |
| `path` | 路径解析与拼接 | `path.posix` / `path.win32` | — |
| `http`/`https` | HTTP 服务端/客户端 | `http.createServer` | Fetch API |
| `os` | 系统信息查询 | `os.cpus()`, `os.totalmem()` | `navigator.hardwareConcurrency` |
| `crypto` | 加密哈希签名 | `crypto.hash` (Node 20+) | Web Crypto API |
| `stream` | 流式数据处理 | `stream/promises.pipeline` | Web Streams API |
| `buffer` | 二进制数据 | `Buffer.from()`, `Buffer.alloc()` | `Uint8Array` |
| `events` | 发布-订阅事件 | `EventEmitter` | `EventTarget` |
| `util` | 工具函数 | `parseArgs`, `promisify` | — |
| `child_process` | 子进程管理 | `spawn`, `execFile` | — |
| `url` | URL 解析 | `new URL()` | `URL` / `URLSearchParams` |
| `worker_threads` | 多线程并行 | `new Worker()` | `new Worker()` |

---

## 参考资源

- [Node.js 官方文档](https://nodejs.org/docs/latest/api/)
- [Node.js 20 LTS 变更日志](https://nodejs.org/en/blog/release/v20.0.0)
- [Node.js TypeScript 类型定义](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node)
- [libuv 设计文档](http://docs.libuv.org/)

---

## 相关资源

- [后端框架分类](../categories/backend-frameworks) — 基于 Node.js 的后端框架选型
- [ORM 与数据库分类](../categories/orm-database) — 数据库操作层工具
- [部署与托管平台分类](../categories/deployment-hosting) — Node.js 应用部署目标
- [CI/CD 工具对比矩阵](../comparison-matrices/ci-cd-tools-compare.md) — 自动化构建与部署流水线

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Node.js 核心模块保持稳定向后兼容，但新特性持续加入。建议生产环境使用 Active LTS 版本。

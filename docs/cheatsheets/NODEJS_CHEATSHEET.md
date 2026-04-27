---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# Node.js 20+ / 22+ / 24+ 速查表 (Node.js Cheatsheet)

> 💡 本速查表覆盖 Node.js 20 LTS、22、24 的核心模块、ES Modules、内置测试运行器、Watch 模式及 TypeScript 支持等新特性。

---

## 目录

- [Node.js 20+ / 22+ / 24+ 速查表 (Node.js Cheatsheet)](#nodejs-20--22--24-速查表-nodejs-cheatsheet)
  - [目录](#目录)
  - [启动与运行](#启动与运行)
  - [模块系统](#模块系统)
    - [CommonJS (CJS) vs ES Modules (ESM)](#commonjs-cjs-vs-es-modules-esm)
    - [包配置 (`package.json`)](#包配置-packagejson)
  - [核心模块速查](#核心模块速查)
    - [`fs` (File System)](#fs-file-system)
    - [`path`](#path)
    - [`http` / `https`](#http--https)
    - [`crypto`](#crypto)
    - [`stream`](#stream)
    - [`events`](#events)
    - [`os`](#os)
    - [`util`](#util)
    - [`child_process`](#child_process)
    - [`worker_threads`](#worker_threads)
    - [`cluster`](#cluster)
  - [全局对象与工具](#全局对象与工具)
    - [全局对象 (Global Objects)](#全局对象-global-objects)
    - [`process` 常用属性](#process-常用属性)
    - [`Buffer` 常用操作](#buffer-常用操作)
  - [内置测试运行器](#内置测试运行器)
  - [Watch 模式](#watch-模式)
  - [TypeScript 支持](#typescript-支持)
  - [常用代码片段](#常用代码片段)
    - [创建简单 HTTP JSON API](#创建简单-http-json-api)
    - [读取环境变量（带默认值）](#读取环境变量带默认值)
    - [安全地解析 JSON](#安全地解析-json)
    - [延迟函数](#延迟函数)
    - [可取消的请求](#可取消的请求)
  - [版本特性速查](#版本特性速查)

---

## 启动与运行

| 命令 | 说明 |
|------|------|
| `node app.js` | 运行脚本 |
| `node --watch app.js` | Watch 模式（文件变更自动重启） |
| `node --test` | 运行内置测试 |
| `node --test --watch` | 测试 Watch 模式 |
| `node --inspect app.js` | 开启调试器（默认 9229 端口） |
| `node --experimental-strip-types app.ts` | 直接运行 TypeScript（类型剥离） |
| `node --experimental-transform-types app.ts` | 运行 TS 并支持 `import type` 等转换 |
| `node -e "console.log('hi')"` | 执行单行代码 |
| `node --input-type=module -e "..."` | 以 ESM 模式执行单行代码 |

> 💡 Node.js 22+ 起 `--experimental-strip-types` 无需显式开启，可直接运行 `.ts` 文件。

---

## 模块系统

### CommonJS (CJS) vs ES Modules (ESM)

| 特性 | CommonJS (`*.cjs` / 默认) | ES Modules (`*.mjs` / `"type": "module"`) |
|------|--------------------------|------------------------------------------|
| 加载方式 | 同步运行时加载 | 异步静态解析 |
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 顶级 `this` | `module.exports` | `undefined` |
| `__dirname` / `__filename` | 可用 | 不可用，需用 `import.meta.url` 推导 |
| JSON 导入 | `require('./data.json')` | `import data from './data.json' assert { type: 'json' }` |
| 条件加载 | `if (x) require('./a')` | 需用 `await import()` 动态导入 |

```js
// CommonJS
const fs = require('fs');
const { join } = require('path');
module.exports = { foo: 1 };
exports.bar = 2;

// ES Modules
import fs from 'fs';
import { join } from 'path';
export const foo = 1;
export default bar;

// ESM 中获取 __dirname / __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

> ⚠️ 在 ESM 中无法使用 `require()`，除非通过 `createRequire(import.meta.url)` 创建：

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
```

### 包配置 (`package.json`)

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs"
    }
  },
  "imports": {
    "#root/*": "./*"
  }
}
```

> 💡 `"imports"` 字段用于定义包内子路径映射，类似路径别名。

---

## 核心模块速查

### `fs` (File System)

| API | 说明 | 示例 |
|-----|------|------|
| `readFileSync` | 同步读文件 | `fs.readFileSync('a.txt', 'utf-8')` |
| `writeFileSync` | 同步写文件 | `fs.writeFileSync('a.txt', 'data')` |
| `appendFileSync` | 追加内容 | `fs.appendFileSync('log.txt', 'line\n')` |
| `mkdirSync` | 创建目录 | `fs.mkdirSync('dir', { recursive: true })` |
| `rmSync` | 删除文件/目录 | `fs.rmSync('dir', { recursive: true })` |
| `watch` | 监听文件变化 | `fs.watch('.', (e, f) => {})` |
| `createReadStream` | 可读流 | `fs.createReadStream('big.zip')` |
| `createWriteStream` | 可写流 | `fs.createWriteStream('out.zip')` |

```js
import { readFile, writeFile, access } from 'fs/promises';

// Promise 版 (推荐)
const data = await readFile('file.txt', 'utf-8');
await writeFile('file.txt', 'hello', { flag: 'a' });

// 检查文件是否存在
import { constants } from 'fs';
try {
  await access('file.txt', constants.F_OK);
} catch {
  console.log('文件不存在');
}
```

> 💡 优先使用 `fs/promises`，避免回调地狱；大文件用 `createReadStream` / `createWriteStream`。

### `path`

| API | 说明 | 示例 |
|-----|------|------|
| `join` | 拼接路径（平台适配） | `path.join('foo', 'bar')` → `'foo/bar'` 或 `'foo\\bar'` |
| `resolve` | 解析为绝对路径 | `path.resolve('foo')` |
| `basename` | 文件名 | `path.basename('/a/b.js')` → `'b.js'` |
| `dirname` | 目录名 | `path.dirname('/a/b.js')` → `'/a'` |
| `extname` | 扩展名 | `path.extname('b.js')` → `'.js'` |
| `parse` | 解析路径对象 | `path.parse('/a/b.js')` |
| `relative` | 相对路径 | `path.relative('/a', '/a/b/c')` |
| `sep` | 系统路径分隔符 | `path.sep` → `'/'` 或 `'\\'` |

```js
import path from 'path';

const full = path.join(__dirname, 'assets', 'logo.png');
const { name, ext } = path.parse('/tmp/archive.tar.gz');
// name: 'archive.tar', ext: '.gz'
```

### `http` / `https`

```js
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000, () => console.log('listening on 3000'));
```

> 💡 生产环境推荐使用 `express`、`fastify` 或内建的 `node:http` 配合框架。

### `crypto`

| API | 说明 |
|-----|------|
| `createHash` | 哈希（MD5, SHA256 等） |
| `createHmac` | HMAC 签名 |
| `randomBytes` | 生成随机字节 |
| `createCipheriv` | 对称加密 |
| `createPublicKey` | 非对称加密/验证 |
| `subtle` (Web Crypto) | Web Crypto API 实现 |

```js
import crypto from 'crypto';

// 哈希
const hash = crypto.createHash('sha256').update('password').digest('hex');

// 随机 Token
const token = crypto.randomBytes(32).toString('hex');

// UUID (Node.js 22+)
import { randomUUID } from 'crypto';
const id = randomUUID();

// Web Crypto (标准 API)
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);
```

### `stream`

| 类型 | 说明 | 示例 |
|------|------|------|
| `Readable` | 可读流 | `process.stdin` |
| `Writable` | 可写流 | `process.stdout` |
| `Duplex` | 双工流 | `net.Socket` |
| `Transform` | 转换流 | `zlib.createGzip()` |

```js
import { Readable, Transform, pipeline } from 'stream';
import { pipeline as pipelinePromise } from 'stream/promises';

// 使用 pipeline 避免内存泄漏
await pipelinePromise(
  fs.createReadStream('input.txt'),
  new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  }),
  fs.createWriteStream('output.txt')
);
```

> ⚠️ 旧版 `.pipe()` 不会自动处理错误传播，务必改用 `stream/promises` 的 `pipeline()`。

### `events`

```js
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

emitter.on('data', console.log);
emitter.once('ready', () => console.log('ready!'));
emitter.emit('data', 'hello');
emitter.listenerCount('data');
emitter.removeAllListeners('data');
```

> 💡 EventEmitter 默认最大监听器数量为 10，可通过 `setMaxListeners(n)` 调整。

### `os`

| API | 说明 |
|-----|------|
| `platform()` | 操作系统平台 (`win32`, `linux`, `darwin`) |
| `arch()` | CPU 架构 (`x64`, `arm64`) |
| `cpus()` | CPU 信息数组 |
| `totalmem()` | 总内存（字节） |
| `freemem()` | 空闲内存（字节） |
| `homedir()` | 用户主目录 |
| `tmpdir()` | 临时目录 |
| `networkInterfaces()` | 网络接口信息 |

```js
import os from 'os';
console.log(os.platform(), os.arch(), os.cpus().length);
```

### `util`

| API | 说明 |
|-----|------|
| `promisify` | 将 callback 风格函数转为 Promise |
| `callbackify` | 将 async 函数转为 callback 风格 |
| `inspect` | 格式化对象（类似控制台输出） |
| `format` | 格式化字符串 (`%s`, `%d`, `%j`) |
| `parseArgs` | 解析命令行参数 |

```js
import { promisify, parseArgs } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const { stdout } = await execAsync('git status');

// 命令行参数解析 (Node.js 20+)
const { values } = parseArgs({
  options: { port: { type: 'string', short: 'p', default: '3000' } }
});
```

### `child_process`

| API | 说明 |
|-----|------|
| `exec` | 执行命令，缓冲输出（适合小输出） |
| `execFile` | 直接执行文件（不经过 shell） |
| `spawn` | 流式执行（适合大输出/长时间任务） |
| `fork` | 创建新的 Node.js 进程，带 IPC |

```js
import { spawn } from 'child_process';

const ls = spawn('ls', ['-la'], { cwd: '/tmp' });
ls.stdout.on('data', data => console.log(data.toString()));
ls.on('close', code => console.log(`exit ${code}`));
```

> ⚠️ `exec` 有最大缓冲区限制（默认 1MB），大输出务必用 `spawn`。

### `worker_threads`

多线程处理 CPU 密集型任务。

```js
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url), {
    workerData: [1, 2, 3, 4, 5]
  });
  worker.on('message', console.log);
} else {
  const sum = workerData.reduce((a, b) => a + b, 0);
  parentPort.postMessage(sum);
}
```

> 💡 `workerData` 用于初始化数据传递，`parentPort.postMessage` 用于线程间通信。

### `cluster`

多进程利用多核 CPU。

```js
import cluster from 'cluster';
import os from 'os';
import http from 'http';

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  http.createServer((req, res) => res.end('ok')).listen(3000);
}
```

> 💡 Node.js 20+ 推荐使用 `node --watch` + `cluster` 组合替代 `pm2` 等部分场景。

---

## 全局对象与工具

### 全局对象 (Global Objects)

| 对象 | 说明 | 示例 |
|------|------|------|
| `global` / `globalThis` | 全局命名空间 | `globalThis.fetch = ...` |
| `process` | 当前进程信息与控制 | `process.env`, `process.argv`, `process.exit(1)` |
| `Buffer` | 二进制数据操作 | `Buffer.from('hello')`, `Buffer.alloc(10)` |
| `URL` / `URLSearchParams` | URL 解析与构造 | `new URL('https://a.com?x=1')` |
| `TextEncoder` / `TextDecoder` | 文本编解码 | `new TextEncoder().encode('hi')` |
| `AbortController` | 取消异步操作 | `const ctrl = new AbortController()` |
| `performance` | 性能计时 | `performance.now()` |
| `structuredClone` | 深拷贝 | `structuredClone(obj)` |
| `fetch` | HTTP 请求 (Node.js 18+ 内置) | `fetch('https://api.com')` |
| `WebSocket` | (需安装 `ws`) | 非内建，需第三方库 |

### `process` 常用属性

```js
process.env.NODE_ENV;      // 环境变量
process.argv;              // 命令行参数数组
process.pid;               // 进程 ID
process.cwd();             // 当前工作目录
process.exit(1);           // 退出进程
process.on('uncaughtException', handler);
process.on('unhandledRejection', handler);
```

### `Buffer` 常用操作

```js
const buf = Buffer.from('hello');
buf.toString('utf-8');           // 'hello'
buf.toString('base64');          // 'aGVsbG8='
Buffer.from('aGVsbG8=', 'base64').toString(); // 'hello'
Buffer.concat([buf1, buf2]);     // 拼接
buf.length;                      // 字节长度
```

> ⚠️ `Buffer` 是 `Uint8Array` 的子类，但注意 `buf.length` 是字节长度，不是字符长度。

---

## 内置测试运行器

Node.js 20+ 内置测试框架，无需 `jest` / `mocha`。

```js
import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('math', () => {
  it('should add', () => {
    assert.strictEqual(1 + 1, 2);
  });

  test('async test', async () => {
    const result = await Promise.resolve(42);
    assert.equal(result, 42);
  });
});
```

| 功能 | 用法 |
|------|------|
| 跳过测试 | `it.skip('name', fn)` |
| 仅运行某项 | `it.only('name', fn)` |
| 超时设置 | `it('name', { timeout: 1000 }, fn)` |
| 并行执行 | `describe.parallel()` (Node.js 22+) |
| 生命周期 | `before`, `after`, `beforeEach`, `afterEach` |

运行命令：

```bash
node --test                    # 运行所有 *.test.js / *.spec.js
node --test src/**/*.test.js   # 指定模式
node --test --watch            # Watch 模式
```

> 💡 内置测试运行器支持 `tap` 格式输出：`node --test --test-reporter=tap`。

---

## Watch 模式

Node.js 18+ 引入实验性 Watch，20+ 稳定。

```bash
node --watch app.js            # 监听并重启
node --watch-path=src app.js   # 监听指定目录
node --watch --watch-preserve-output app.js  # 保留输出
```

> ⚠️ Watch 模式会忽略 `node_modules` 和隐藏文件，但可通过 `--watch-path` 精确控制。

---

## TypeScript 支持

Node.js 22+ 起支持直接运行 TypeScript（类型剥离 `type stripping`）。

| 功能 | 命令 / 配置 |
|------|------------|
| 类型剥离 | `node --experimental-strip-types app.ts` |
| 内联类型 | 支持 `const x: number = 1` |
| 接口/类型别名 | 支持 `interface` / `type` |
| 枚举 (enum) | **不支持**，需编译器 |
| 装饰器 (decorator) | **不支持**，需编译器 |
| 路径别名 | 可通过 `"imports"` / `tsconfig` + 打包工具解决 |

```ts
// app.ts — 可直接运行（Node.js 22+）
import { readFile } from 'fs/promises';

interface User {
  name: string;
  age: number;
}

async function loadUser(path: string): Promise<User> {
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data) as User;
}

const user = await loadUser('./user.json');
console.log(user.name);
```

> 💡 如需 `enum`、命名空间、`module` 语法、装饰器等，仍需 `tsc` / `tsx` / `ts-node`。

> ⚠️ `.ts` 文件中的类型注解在运行时被直接剥离，不做类型检查；仍需 `tsc --noEmit` 做 CI 检查。

---

## 常用代码片段

### 创建简单 HTTP JSON API

```js
import { createServer } from 'http';

const server = createServer(async (req, res) => {
  if (req.url === '/api/user' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ name: 'Alice' }));
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000);
```

### 读取环境变量（带默认值）

```js
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

### 安全地解析 JSON

```js
function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
```

### 延迟函数

```js
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await delay(1000);
```

### 可取消的请求

```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch('https://api.com', { signal: controller.signal });
  clearTimeout(timeout);
} catch (err) {
  if (err.name === 'AbortError') console.log('请求已取消');
}
```

---

## 版本特性速查

| 版本 | 关键特性 |
|------|----------|
| Node.js 20 LTS | 内置 Watch 模式 (`--watch`)、测试运行器稳定、`fetch` 稳定、`AbortSignal.any` |
| Node.js 22 | 直接运行 TypeScript（类型剥离）、V8 引擎升级、`require(esm)` 支持、测试并行描述 |
| Node.js 24 | 进一步增强 TypeScript 支持、`URLPattern` 稳定、性能优化 |

---

*最后更新：2026-04*

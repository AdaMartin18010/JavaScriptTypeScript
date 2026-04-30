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

---

## Node.js API 速查表

| API / 方法 | 用途 | 示例 |
|-----------|------|------|
| `fs.promises.readFile` | 异步读文件 | `await fs.readFile('file.txt', 'utf8')` |
| `fs.createReadStream` | 流式读文件 | `fs.createReadStream('big.log').pipe(out)` |
| `path.join` | 跨平台路径拼接 | `path.join(__dirname, 'config.json')` |
| `path.parse` | 解析路径组件 | `path.parse('/usr/bin/node').name` |
| `crypto.createHash` | 哈希计算 | `crypto.createHash('sha256').update(data).digest('hex')` |
| `crypto.randomUUID` | 生成 UUID | `crypto.randomUUID()` |
| `events.EventEmitter` | 发布订阅 | `emitter.on('data', cb); emitter.emit('data', val)` |
| `worker_threads.Worker` | 多线程计算 | `new Worker('./calc.js')` |
| `child_process.spawn` | 创建子进程 | `spawn('git', ['log', '--oneline'])` |
| `cluster.fork` | 多进程集群 | `cluster.fork()` 创建工作进程 |
| `stream.Readable` | 自定义可读流 | `new Readable({ read() { this.push(chunk) } })` |
| `stream.Transform` | 转换流 | `new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })` |
| `Buffer.from` | 二进制数据处理 | `Buffer.from('hello', 'utf8')` |
| `URL` / `URLSearchParams` | URL 解析 | `new URL('https://a.com?x=1').searchParams.get('x')` |
| `util.promisify` | Callback 转 Promise | `const readFile = util.promisify(fs.readFile)` |

---

## v24 新特性

| 特性 | 命令/用法 |
|------|----------|
| 原生 TS 执行 | `node --experimental-strip-types` |
| 内置测试 | `node --test` |
| Watch 模式 | `node --watch` |
| 权限模型 | `node --permission` |
| 内置 SQLite | `const db = new sqlite.DatabaseSync(':memory:')` |

---

## 代码示例

### Streams — 高效处理大文件

```javascript
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

// 管道流：读取 → 压缩 → 写入
await pipeline(
  createReadStream('huge.log'),
  createGzip(),
  createWriteStream('huge.log.gz')
);

// Transform 流：逐行处理 CSV
import { Transform } from 'stream';

const parseCsv = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      const [name, age] = line.split(',');
      this.push(JSON.stringify({ name, age: Number(age) }) + '\n');
    }
    callback();
  },
});

createReadStream('data.csv').pipe(parseCsv).pipe(process.stdout);
```

### Events — EventEmitter 与 EventTarget

```javascript
import { EventEmitter } from 'events';

// 经典 EventEmitter
const emitter = new EventEmitter();
emitter.on('user:login', (user) => console.log(`Login: ${user.id}`));
emitter.once('server:ready', () => console.log('Server ready'));
emitter.emit('user:login', { id: 42 });

// 标准 Web EventTarget（Node.js v15+）
const target = new EventTarget();
target.addEventListener('ping', (e) => console.log(e.detail));
target.dispatchEvent(new CustomEvent('ping', { detail: 'pong' }));
```

### Cluster — 多核 CPU 利用

```javascript
import cluster from 'cluster';
import http from 'http';
import { availableParallelism } from 'os';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} spawning ${numCPUs} workers`);
  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  }).listen(3000);
}
```

### 内置 SQLite (v24+)

```javascript
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');

const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
insert.run('Alice');
insert.run('Bob');

const query = db.prepare('SELECT * FROM users');
console.log(query.all()); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

### Worker Threads — CPU 密集型任务

```javascript
// worker.js — 在工作线程中执行
import { parentPort, workerData } from 'worker_threads';

function fibonacci(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData.n);
parentPort.postMessage({ input: workerData.n, result });
```

```javascript
// main.js — 主线程创建 Worker
import { Worker } from 'worker_threads';

function runWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: { n } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

// 并行计算多个斐波那契数
const results = await Promise.all([runWorker(35), runWorker(40), runWorker(38)]);
console.log(results);
```

### Crypto — HMAC / JWT 签名

```javascript
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

// HMAC-SHA256 签名
function signPayload(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

// 简易 JWT 签名（生产环境请使用 jsonwebtoken 库）
function createJWT(header, payload, secret) {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 常量时间比较（防时序攻击）
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// 生成加密安全随机 token
const csrfToken = randomBytes(32).toString('hex');
```

### Path & URL — 跨平台路径处理

```javascript
import { join, resolve, parse, glob } from 'path';
import { fileURLToPath } from 'url';

// ESM 中获取 __dirname 等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// 跨平台路径拼接
const configPath = join(__dirname, 'config', 'default.json');

// 路径解析
const { dir, name, ext } = parse('/home/user/project/src/index.ts');
// dir: '/home/user/project/src', name: 'index', ext: '.ts'

// URL 解析与构造
const apiUrl = new URL('/api/v2/users', 'https://api.example.com');
apiUrl.searchParams.append('page', '1');
apiUrl.searchParams.append('limit', '20');
console.log(apiUrl.toString()); // https://api.example.com/api/v2/users?page=1&limit=20
```

### Readable.from — 将数组/异步迭代器转为流

```javascript
import { Readable, Writable } from 'stream';

// 将数组转为对象流
const dataStream = Readable.from([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
]);

// 异步迭代器来源
async function* generateRows() {
  for (let i = 0; i < 1000; i++) {
    yield { index: i, timestamp: Date.now() };
  }
}

const asyncStream = Readable.from(generateRows());

// 消费流
asyncStream.pipe(
  new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      console.log('Processing:', chunk);
      callback();
    },
  })
);
```

---

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

# 运行单个测试文件
node --test src/**/*.test.js

# 调试模式
node --inspect-brk app.js
```

---

## 参考链接

- [Node.js v24 Documentation](https://nodejs.org/docs/latest/api/)
- [Node.js Streams API](https://nodejs.org/api/stream.html)
- [Node.js Cluster API](https://nodejs.org/api/cluster.html)
- [Node.js SQLite (v24)](https://nodejs.org/api/sqlite.html)
- [Node.js Permission Model](https://nodejs.org/api/permissions.html)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js Crypto API](https://nodejs.org/api/crypto.html)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Node.js --watch Mode](https://nodejs.org/api/cli.html#--watch)
- [Node.js TypeScript Support](https://nodejs.org/api/typescript.html)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
- [Node.js Path API](https://nodejs.org/api/path.html)
- [Node.js URL API](https://nodejs.org/api/url.html)
- [Node.js Events API](https://nodejs.org/api/events.html)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [Node.js File System Promises API](https://nodejs.org/api/fs.html#promises-api)
- [Node.js Best Practices (goldbergyoni)](https://github.com/goldbergyoni/nodebestpractices)
- [Node.js Design Patterns (book)](https://www.nodejsdesignpatterns.com/)

---

*速查表针对 Node.js v24+，涵盖核心 API 与新特性。*

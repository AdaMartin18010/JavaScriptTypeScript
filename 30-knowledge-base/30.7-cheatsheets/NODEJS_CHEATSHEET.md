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

---

*速查表针对 Node.js v24+，涵盖核心 API 与新特性。*

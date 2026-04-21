# 显式资源管理（Explicit Resource Management）

> ES2025 `using` 声明与 `Symbol.dispose` 的自动资源清理机制
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. 背景问题

在 JavaScript 中，资源清理（文件句柄、数据库连接、锁等）通常依赖开发者手动调用清理方法：

```javascript
// ❌ 容易忘记关闭资源
function processFile(filename) {
  const file = openFile(filename);
  const data = file.read(); // 如果这里抛出错误...
  file.close(); // ...这行不会执行，资源泄漏！
  return data;
}
```

### 1.1 传统解决方案

```javascript
// try-finally
try {
  const file = openFile(filename);
  return file.read();
} finally {
  file.close(); // ❌ file 在 finally 作用域外不可见
}

// 需要额外声明
const file = openFile(filename);
try {
  return file.read();
} finally {
  file.close();
}
```

---

## 2. `using` 声明

ES2025 引入 `using` 声明，在块级作用域结束时自动调用资源的 `[Symbol.dispose]()` 方法：

```javascript
{
  using file = openFile("data.txt");
  const data = file.read();
  // 数据操作...
} // <-- 自动调用 file[Symbol.dispose]()
```

### 2.1 核心语义

- `using` 声明的变量在块级作用域结束时自动 dispose
- 即使发生异常，dispose 也会执行（类似 finally）
- 多个 `using` 声明按**逆序** dispose（LIFO）

```javascript
{
  using a = createResource("A");
  using b = createResource("B");
  using c = createResource("C");
} //  dispose 顺序: C → B → A
```

### 2.2 异常处理

```javascript
{
  using file = openFile("data.txt");
  throw new Error("Oops");
} // file[Symbol.dispose]() 仍会执行
```

如果 dispose 过程中也抛出异常，两个异常会被聚合为 `SuppressedError`：

```javascript
{
  using resource = {
    [Symbol.dispose]() {
      throw new Error("Dispose failed");
    }
  };
  throw new Error("Main error");
}
// 抛出 SuppressedError: Main error (suppressed: Dispose failed)
```

---

## 3. `Symbol.dispose` 与 `Disposable` 接口

对象要实现自动清理，需提供 `[Symbol.dispose]()` 方法：

```javascript
class FileHandler {
  constructor(name) {
    this.name = name;
    this.handle = fs.openSync(name, "r");
  }

  read() {
    return fs.readFileSync(this.handle);
  }

  [Symbol.dispose]() {
    console.log(`Closing ${this.name}`);
    fs.closeSync(this.handle);
  }
}

{
  using file = new FileHandler("data.txt");
  console.log(file.read());
}
// 输出文件内容，然后自动输出 "Closing data.txt"
```

### 3.1 TypeScript 类型定义

```typescript
// TypeScript 内置类型（ES2025 lib）
interface Disposable {
  [Symbol.dispose](): void;
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): PromiseLike<void>;
}
```

---

## 4. 异步资源管理：`await using`

对于需要异步清理的资源，使用 `await using`：

```javascript
{
  await using conn = await createDatabaseConnection();
  const result = await conn.query("SELECT * FROM users");
  // 操作...
} // 自动调用 await conn[Symbol.asyncDispose]()
```

### 4.1 异步 dispose 的执行

```javascript
async function processData() {
  await using conn = await createDatabaseConnection();
  await using tx = await conn.beginTransaction();
  
  await tx.execute("UPDATE users SET active = true");
  await tx.commit();
} // tx[Symbol.asyncDispose]() 先执行，然后 conn[Symbol.asyncDispose]()
```

---

## 5. 与现有模式的对比

### 5.1 vs try-finally

```javascript
// 传统 try-finally
const file = openFile("data.txt");
try {
  process(file);
} finally {
  file.close();
}

// 使用 using
{
  using file = openFile("data.txt");
  process(file);
}
```

### 5.2 vs C# using

ES2025 的 `using` 直接受 C# `using` 语句启发，但语义略有不同：

| 特性 | C# using | JS using |
|------|---------|----------|
| 变量可重新赋值 | ❌ readonly | 可重新赋值 |
| 作用域 | 当前块 | 当前块 |
| null 值处理 | 允许 | 允许（跳过 dispose） |
| 异步 | using await | await using |

### 5.3 vs Python with

```python
# Python
with open("data.txt") as f:
    data = f.read()

# JavaScript
{
  using file = openFile("data.txt");
  const data = file.read();
}
```

---

## 6. 实战模式

### 6.1 数据库连接池

```javascript
class ConnectionPool {
  #connections = [];
  #maxSize = 10;

  async acquire() {
    const conn = this.#connections.pop() || await createConnection();
    return {
      connection: conn,
      [Symbol.asyncDispose]: async () => {
        if (this.#connections.length < this.#maxSize) {
          this.#connections.push(conn);
        } else {
          await conn.close();
        }
      }
    };
  }
}

const pool = new ConnectionPool();

async function queryUsers() {
  await using { connection: conn } = await pool.acquire();
  return conn.query("SELECT * FROM users");
}
```

### 6.2 互斥锁（Mutex）

```javascript
class Mutex {
  #locked = false;
  #queue = [];

  async acquire() {
    if (!this.#locked) {
      this.#locked = true;
      return {
        [Symbol.asyncDispose]: () => {
          this.#locked = false;
          const next = this.#queue.shift();
          if (next) next();
        }
      };
    }
    return new Promise(resolve => this.#queue.push(resolve));
  }
}

const mutex = new Mutex();

async function criticalSection() {
  await using lock = await mutex.acquire();
  // 临界区代码
} // 自动释放锁
```

### 6.3 临时文件

```javascript
class TempFile {
  constructor() {
    this.path = `/tmp/${crypto.randomUUID()}`;
    fs.writeFileSync(this.path, "");
  }

  write(data) {
    fs.appendFileSync(this.path, data);
  }

  [Symbol.dispose]() {
    fs.unlinkSync(this.path);
    console.log(`Temp file ${this.path} removed`);
  }
}

{
  using temp = new TempFile();
  temp.write("sensitive data");
  // 处理...
} // 临时文件自动删除
```

---

## 7. 浏览器与运行时支持

| 环境 | 支持状态 |
|------|---------|
| Chrome 134+ | ✅ |
| Firefox 138+ | ✅ |
| Safari 18.4+ | ✅ |
| Node.js 22.12+ | ✅（需 `--experimental-require-module` 关闭） |
| TypeScript 5.2+ | ✅（编译时支持，需运行时支持） |

---

## 8. 常见陷阱

### 8.1 `using` 变量不可提升到外部作用域

```javascript
{
  using file = openFile("data.txt");
}
console.log(file); // ❌ ReferenceError
```

### 8.2 `null` 和 `undefined`

```javascript
{
  using file = null; // ✅ 允许，跳过 dispose
}
```

### 8.3 提前 return

```javascript
function process() {
  using file = openFile("data.txt");
  if (!file.isValid()) {
    return; // ✅ file[Symbol.dispose]() 仍会执行
  }
  // 处理...
}
```

---

**参考规范**：ECMA-262 §14.3 Using Declarations | [Explicit Resource Management Proposal](https://github.com/tc39/proposal-explicit-resource-management)

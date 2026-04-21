# using 显式资源管理

> ES2025/ES2026 的显式资源管理：`using` 声明与 Symbol.dispose
>
> 对齐版本：ECMA-262 提案 Stage 3+ | TypeScript 5.2+

---

## 1. 背景与动机

传统资源管理依赖 `try/finally`：

```javascript
const handle = acquireResource();
try {
  useResource(handle);
} finally {
  handle.release(); // 确保释放
}
```

痛点：

- 样板代码多
- 嵌套资源管理复杂
- 错误处理与资源释放交织

---

## 2. using 声明

### 2.1 基本语法

```javascript
{
  using file = await openFile("data.txt");
  const content = await file.read();
  // 块结束时自动调用 file[Symbol.dispose]()
}
```

### 2.2 块级作用域结束自动 dispose

```javascript
function process() {
  using conn = getConnection();
  using tx = conn.beginTransaction();

  tx.execute("INSERT ...");
  tx.commit();
  // tx 先 dispose，然后 conn dispose（LIFO 顺序）
}
```

### 2.3 与 const 类似的绑定语义

```javascript
using file = openFile("test.txt");
file = anotherFile; // ❌ TypeError: Assignment to constant variable
```

---

## 3. await using

### 3.1 异步 dispose

```javascript
{
  await using file = await openFile("data.txt");
  // 块结束时自动调用 await file[Symbol.asyncDispose]()
}
```

---

## 4. DisposableStack / AsyncDisposableStack

### 4.1 多个资源的管理

```javascript
{
  using stack = new DisposableStack();

  const file = stack.use(openFile("a.txt"));
  const conn = stack.use(getConnection());

  // 所有资源在块结束时按 LIFO 顺序释放
  // 即使中间出错，已添加的资源也会被释放
}
```

### 4.2 错误处理与回退

```javascript
{
  using stack = new DisposableStack();

  const file = openFile("output.txt");
  stack.use(file);

  stack.defer(() => {
    console.log("Cleanup action");
    // 即使 file 没有 dispose 方法，也能执行清理
  });
}
```

---

## 5. Symbol.dispose / Symbol.asyncDispose

### 5.1 协议定义

```javascript
class FileHandle {
  [Symbol.dispose]() {
    console.log("Closing file");
    this.close();
  }
}

class AsyncFileHandle {
  async [Symbol.asyncDispose]() {
    console.log("Closing file asynchronously");
    await this.close();
  }
}
```

### 5.2 自定义资源的实现

```javascript
class DatabaseConnection {
  constructor() {
    this.connected = true;
  }

  query(sql) {
    if (!this.connected) throw new Error("Not connected");
    return execute(sql);
  }

  [Symbol.dispose]() {
    this.connected = false;
    releaseConnection(this);
  }
}

// 使用
{
  using conn = new DatabaseConnection();
  const result = conn.query("SELECT * FROM users");
  // conn 自动释放
}
```

---

## 6. 与类型系统

TypeScript 5.2+ 提供类型支持：

```typescript
interface Disposable {
  [Symbol.dispose](): void;
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
}

function processFile(file: Disposable & { read(): string }) {
  using f = file;
  return f.read();
}
```

---

## 7. 实战模式

### 7.1 文件句柄管理

```javascript
{
  using file = fs.openSync("log.txt", "a");
  fs.writeSync(file, "Log entry\n");
  // 文件自动关闭
}
```

### 7.2 数据库连接池

```javascript
{
  using conn = await pool.acquire();
  await conn.query("UPDATE users SET ...");
  // 连接自动归还到连接池
}
```

### 7.3 锁机制

```javascript
{
  using lock = await mutex.acquire();
  // 临界区代码
  await modifySharedData();
  // 锁自动释放
}
```

---

**参考规范**：ECMA-262 Explicit Resource Management Proposal | TypeScript 5.2 Release Notes

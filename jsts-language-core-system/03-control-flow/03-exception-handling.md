# 异常处理

> Error Cause、AggregateError、显式资源管理与类型安全错误模式
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. Error 构造函数

### 1.1 基础用法

```javascript
const error = new Error("Something went wrong");
console.log(error.message); // "Something went wrong"
console.log(error.stack);   // 调用栈信息
```

### 1.2 Error Cause（ES2022）

ES2022 引入 `cause` 选项，用于记录错误链：

```javascript
try {
  await fetchUser();
} catch (e) {
  throw new Error("Failed to load user", { cause: e });
}

// 错误链
try {
  loadDashboard();
} catch (e) {
  console.log(e.message);      // "Failed to load user"
  console.log(e.cause.message); // 原始错误信息
}
```

**优势**：
- 保留原始错误堆栈
- 构建有意义的错误链
- 便于调试复杂调用链

---

## 2. 错误类型

### 2.1 内置错误类型

| 类型 | 用途 |
|------|------|
| `Error` | 通用错误 |
| `SyntaxError` | 语法错误 |
| `ReferenceError` | 引用不存在的变量 |
| `TypeError` | 类型不匹配 |
| `RangeError` | 值超出有效范围 |
| `URIError` | URI 编码/解码错误 |
| `AggregateError` | 多个错误聚合（ES2021） |

### 2.2 AggregateError

```javascript
const promises = [
  fetch("/api/a"),
  fetch("/api/b"),
  Promise.reject(new Error("C failed"))
];

try {
  await Promise.all(promises);
} catch (e) {
  if (e instanceof AggregateError) {
    console.log("Multiple errors:");
    e.errors.forEach(err => console.log(err.message));
  }
}
```

---

## 3. try/catch/finally

### 3.1 基本结构

```javascript
try {
  riskyOperation();
} catch (error) {
  console.error(error);
} finally {
  cleanup();
}
```

### 3.2 finally 的执行保证

```javascript
function test() {
  try {
    return "try";
  } finally {
    console.log("finally"); // 在 return 之前执行
  }
}

console.log(test()); // 输出：finally → try
```

### 3.3 catch 绑定（ES2019）

```javascript
// ES2019 前：必须绑定变量
try {
  // ...
} catch (e) {
  // e 是错误对象
}

// ES2019+：可选绑定
try {
  // ...
} catch {
  // 不需要错误对象
}
```

---

## 4. ES2025：显式资源管理

ES2025 的 `using` 声明提供自动资源清理，替代 try-finally 模式：

```javascript
// ❌ 传统 try-finally
function processFile(filename) {
  const file = openFile(filename);
  try {
    return file.read();
  } finally {
    file.close();
  }
}

// ✅ ES2025 using
function processFile(filename) {
  using file = openFile(filename);
  return file.read();
} // 自动调用 file[Symbol.dispose]()
```

### 4.1 多个资源

```javascript
{
  using file = openFile("data.txt");
  using conn = createConnection();
  // 使用资源...
} // 按逆序 dispose：conn → file
```

### 4.2 异步资源

```javascript
async function fetchData() {
  await using conn = await createConnection();
  return conn.query("SELECT *");
} // 自动 await conn[Symbol.asyncDispose]()
```

---

## 5. 类型安全的错误模式

### 5.1 Result 类型

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// 使用
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("Division by zero");
  return ok(a / b);
}

const result = divide(10, 0);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### 5.2 neverthrow 库

```typescript
import { ok, err, Result } from "neverthrow";

function fetchUser(id: string): Result<User, Error> {
  try {
    return ok(syncFetch(id));
  } catch (e) {
    return err(e as Error);
  }
}

// 函数式组合
fetchUser("123")
  .map(user => user.name)
  .mapErr(error => new Error(`Fetch failed: ${error.message}`));
```

---

## 6. 全局错误处理

### 6.1 浏览器

```javascript
// 未捕获的 Promise 拒绝
window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault(); // 防止控制台报错
});

// Promise 拒绝被处理后（如果之前未处理）
window.addEventListener("rejectionhandled", event => {
  console.log("Rejection handled:", event.reason);
});

// 全局错误
window.addEventListener("error", event => {
  console.error("Global error:", event.error);
});
```

### 6.2 Node.js

```javascript
// 未捕获的异常
process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
  process.exit(1); // 建议退出进程
});

// 未处理的 Promise 拒绝
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});
```

---

**参考规范**：ECMA-262 §20.5 Error Objects | ECMA-262 §14.15 The try Statement

# 异常处理

> 从 throw/catch 到 Error Cause：JS/TS 错误处理机制全景
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. 异常基础

### 1.1 throw 语句

```javascript
throw "Error message";     // 可抛出任何值
throw new Error("Oops");   // 推荐抛出 Error 对象
throw 42;                  // 可抛出数字（不推荐）
```

### 1.2 try / catch / finally

```javascript
try {
  riskyOperation();
} catch (error) {
  console.error("Caught:", error.message);
} finally {
  console.log("Always runs");
}
```

---

## 2. Error 类型体系

```javascript
// 内置错误类型
new Error("General error");
new SyntaxError("Invalid syntax");
new ReferenceError("Variable not defined");
new TypeError("Wrong type");
new RangeError("Out of range");
new URIError("Invalid URI");
new EvalError("Eval error"); // 历史遗留，现代 JS 中很少使用
```

### 2.1 自定义 Error 类

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

throw new ValidationError("Invalid email", "email");
```

---

## 3. Error Cause（ES2022）

```javascript
try {
  await fetchUserData();
} catch (error) {
  throw new Error("Failed to load user", { cause: error });
}

// 获取原因
try {
  loadData();
} catch (error) {
  console.log(error.message);      // "Failed to load user"
  console.log(error.cause);        // 原始错误
  console.log(error.cause.message); // 原始错误消息
}
```

**错误链构建**：

```javascript
function lowLevel() {
  throw new Error("Database connection failed");
}

function midLevel() {
  try {
    lowLevel();
  } catch (e) {
    throw new Error("Query failed", { cause: e });
  }
}

function highLevel() {
  try {
    midLevel();
  } catch (e) {
    throw new Error("User request failed", { cause: e });
  }
}
```

---

## 4. 异常处理最佳实践

### 4.1 只捕获能处理的异常

```javascript
// ✅ 好：捕获特定错误并处理
try {
  const data = JSON.parse(input);
} catch (e) {
  if (e instanceof SyntaxError) {
    return { error: "Invalid JSON" };
  }
  throw e; // 不认识的错误，继续抛出
}

// ❌ 坏：吞没所有异常
try {
  riskyOperation();
} catch (e) {
  // 什么都不做——错误被隐藏了！
}
```

### 4.2 异步异常处理

```javascript
// ✅ async/await + try/catch
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}

// Promise.catch
fetch("/api/data")
  .then(r => r.json())
  .catch(error => console.error(error));
```

---

## 5. 异常与类型系统

### 5.1 TypeScript 中的异常类型

TypeScript 不追踪函数的异常类型（不像 Java 的 `throws`）。社区有提案但尚未标准化。

### 5.2 never 返回类型

```typescript
function throwError(message: string): never {
  throw new Error(message);
}

function process(value: string | null): string {
  if (value === null) {
    throwError("Value is required"); // never 不会破坏返回类型
  }
  return value; // value 被收窄为 string
}
```

### 5.3 函数式错误处理（Result/Either 模式）

```typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseNumber(input: string): Result<number> {
  const num = Number(input);
  if (isNaN(num)) {
    return { ok: false, error: new Error(`Invalid number: ${input}`) };
  }
  return { ok: true, value: num };
}

const result = parseNumber("42");
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 丢失堆栈信息 | 重新 throw 新 Error 丢失原始堆栈 | 使用 `{ cause: error }` |
| 异步异常的未捕获 | Promise 拒绝未被处理 | 使用 await + try/catch 或 .catch() |
| finally 中的 return/throw | 会覆盖 try/catch 中的 return/throw | 避免在 finally 中 return |
| 捕获 any 类型 | catch (e) 中 e 为 any（TS < 4.0）| 使用 `unknown` 注解：catch (e: unknown) |

---

**参考规范**：ECMA-262 §14.15 The try Statement | ECMA-262 §20.5.5 Native Error Types Used in This Standard

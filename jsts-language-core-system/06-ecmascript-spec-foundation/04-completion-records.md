# Completion Records 与控制流

> 规范内部的控制流抽象与异常处理机制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Completion Record 结构

```
Completion Record = {
  [[Type]]: normal | break | continue | return | throw,
  [[Value]]: value | empty,
  [[Target]]: String | empty
}
```

---

## 2. 各语句的 Completion 类型

### 2.1 正常完成

```javascript
let x = 1; // Completion: { Type: normal, Value: empty, Target: empty }
```

### 2.2 return 语句

```javascript
function foo() {
  return 42; // Completion: { Type: return, Value: 42, Target: empty }
}
```

### 2.3 throw 语句

```javascript
throw new Error("Oops");
// Completion: { Type: throw, Value: Error, Target: empty }
```

### 2.4 break 语句

```javascript
while (true) {
  break; // Completion: { Type: break, Value: empty, Target: empty }
}

label: while (true) {
  break label; // Completion: { Type: break, Value: empty, Target: "label" }
}
```

### 2.5 continue 语句

```javascript
while (true) {
  continue; // Completion: { Type: continue, Value: empty, Target: empty }
}
```

---

## 3. 异常传播

```javascript
function a() { throw new Error("A"); }
function b() { a(); }
function c() {
  try {
    b();
  } catch (e) {
    return "caught";
  }
}
```

Completion 传播链：`a() throw` → `b() throw` → `c() catch return` → `c() return`

---

## 4. try/catch/finally 的执行逻辑

```javascript
try {
  // 执行
  // 如果 throw：转到 catch
} catch (e) {
  // 处理异常
  // 如果正常完成：继续
  // 如果 throw：抛出到外层
} finally {
  // 总是执行
  // 如果正常完成：继承之前的结果
  // 如果 throw：覆盖之前的结果
}
```

---

## 5. 与开发者可见的关系

Completion Records 是规范概念，不直接暴露给 JavaScript 开发者，但影响行为：

```javascript
// finally 中的 return 覆盖之前的结果
function test() {
  try {
    return "try";
  } finally {
    return "finally"; // 覆盖！
  }
}
test(); // "finally"
```

---

## 6. 规范算法中的 Completion 处理

规范使用 `ReturnIfAbrupt` 检查 Completion：

```
1. Let result be Operation()
2. ReturnIfAbrupt(result)  // 如果 result.Type = throw，直接返回
3. Let value be result.[[Value]]
```

## 7. 迭代语句的 Completion

```javascript
for (let i = 0; i < 3; i++) {
  if (i === 1) continue; // { Type: continue, ... }
  console.log(i);        // 0, 2
}
```

`continue` 会跳过当前迭代，但循环继续执行。

## 8. 标签语句与 Completion

```javascript
outer: for (let i = 0; i < 3; i++) {
  inner: for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
  }
}
```

`break outer` 的 Target 是 `"outer"`，引擎从当前作用域向外查找匹配的标签。

## 9. 为什么需要 Completion Records

Completion Records 允许规范以统一方式描述所有控制流：

- 普通语句 → `normal` Completion
- 异常 → `throw` Completion
- return → `return` Completion
- break/continue → 带有 Target 的 Completion

这使得规范可以定义统一的执行规则，而不需要为每种语句写特殊逻辑。

## 10. 规范伪代码示例

ECMA-262 使用 Completion Records 描述语句执行：

```
13.2.13 Block: { StatementList }
  1. Let oldEnv be the running execution context's LexicalEnvironment.
  2. Let blockEnv be NewDeclarativeEnvironment(oldEnv).
  3. Perform BlockDeclarationInstantiation(StatementList, blockEnv).
  4. Set the running execution context's LexicalEnvironment to blockEnv.
  5. Let blockValue be Completion(Evaluation of StatementList).
  6. Set the running execution context's LexicalEnvironment to oldEnv.
  7. Return blockValue.
```

注意步骤 5 返回的是 **Completion**，不是原始值。

## 11. 开发者可见的影响

虽然 Completion Records 是规范概念，但它们解释了 JavaScript 的许多行为：

```javascript
// 为什么 try/finally 中 finally 总是执行？
// 因为规范要求 Evaluate 语句时返回 Completion，
// finally 块必须被评估

// 为什么 for-of 中的 return 会触发 finally？
// 因为迭代器协议使用 Completion Records 传播控制流
```

## 12. for-await-of 与 Completion

```javascript
async function* gen() {
  yield 1;
  yield 2;
}

async function consume() {
  for await (const x of gen()) {
    if (x === 2) break; // 触发 AsyncIteratorClose
  }
}
```

`break` 会创建 `{ Type: break }` Completion，触发迭代器的清理逻辑。

---

**参考规范**：ECMA-262 §6.2.3

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`

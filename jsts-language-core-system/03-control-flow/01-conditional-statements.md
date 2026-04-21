# 条件语句

> 从 if/else 到模式匹配：条件控制流的完整技术栈
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. if / else if / else

```javascript
const score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("F");
}
```

### 1.1 条件表达式的真值判断

ECMAScript 中的 falsy 值：

```javascript
if (false || 0 || -0 || 0n || "" || null || undefined || NaN) {
  // 不会执行
}
```

其他所有值都是 truthy，包括 `[]`、`{}`、`"0"`。

---

## 2. switch 语句

### 2.1 严格相等比较

```javascript
const fruit = "apple";

switch (fruit) {
  case "apple":
    console.log("Red");
    break;
  case "banana":
    console.log("Yellow");
    break;
  default:
    console.log("Unknown");
}
```

**注意**：`switch` 使用**严格相等（===）**比较。

### 2.2 穿透（fall-through）行为

```javascript
const grade = "B";

switch (grade) {
  case "A":
  case "B":
  case "C":
    console.log("Pass"); // A、B、C 都输出 Pass
    break;
  case "D":
  case "F":
    console.log("Fail");
    break;
}
```

### 2.3 最佳实践

- 总是使用 `break`（除非有意 fall-through）
- 添加注释说明 intentional fall-through
- 始终包含 `default` 分支

---

## 3. 三元运算符

```javascript
const age = 20;
const status = age >= 18 ? "adult" : "minor";
```

### 3.1 嵌套三元运算符

```javascript
const category = age < 13 ? "child" : age < 20 ? "teen" : "adult";
```

**可读性警告**：嵌套超过两层时，建议使用 if/else 或查找表。

---

## 4. 逻辑运算符

### 4.1 短路求值

```javascript
// &&：左操作数为 falsy 时返回左操作数
const result1 = false && anything(); // false（anything() 不会求值）

// ||：左操作数为 truthy 时返回左操作数
const result2 = true || anything();  // true（anything() 不会求值）

// ??：左操作数为 nullish 时返回右操作数
const result3 = null ?? "default"; // "default"
```

### 4.2 逻辑赋值运算符（ES2021）

```javascript
let a = 1;
a &&= 2; // a = a && 2 → a = 1

let b = 0;
b ||= 3; // b = b || 3 → b = 3

let c = null;
c ??= 4; // c = c ?? 4 → c = 4
```

---

## 5. 空值合并 ??

```javascript
const value = null ?? "default";        // "default"
const value2 = undefined ?? "default";  // "default"
const value3 = 0 ?? "default";          // 0（0 不是 nullish）
const value4 = "" ?? "default";         // ""（空字符串不是 nullish）
```

**nullish 定义**：只有 `null` 和 `undefined`。

---

## 6. 可选链 ?.

```javascript
const user = { profile: { name: "Alice" } };

const name = user?.profile?.name;     // "Alice"
const bio = user?.profile?.bio;       // undefined（不报错）
const deep = user?.settings?.theme;   // undefined

// 与函数调用结合
const result = someObject?.method?.();

// 与计算属性结合
const key = "name";
const value = user?.profile?.[key];
```

**短路行为**：如果 `?.` 前的值为 nullish，整个表达式短路返回 undefined。

---

## 7. 模式匹配前瞻

TC39 正在审议 Pattern Matching 提案（Stage 1/2）：

```javascript
// 提案语法（尚未标准化）
const result = match (response) {
  when ({ status: 200, data: Array.isArray }) -> processList(data),
  when ({ status: 200, data }) -> processItem(data),
  when ({ status }) if status >= 400 -> handleError(status),
  when (_) -> handleUnknown()
};
```

当前替代方案：

```typescript
// 使用 ts-pattern 库
import { match } from "ts-pattern";

const result = match(response)
  .with({ status: 200, data: P.array() }, (r) => processList(r.data))
  .with({ status: 200, data: P.any }, (r) => processItem(r.data))
  .with({ status: P.number }, (r) => handleError(r.status))
  .otherwise(() => handleUnknown());
```

---

**参考规范**：ECMA-262 §14.6 The if Statement | ECMA-262 §14.12 The switch Statement

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

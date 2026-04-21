# 短路求值与逻辑赋值

> 逻辑运算符的求值策略与复合赋值语法
>
> 对齐版本：ECMAScript 2021 (ES12) 及之后

---

## 1. 短路求值基础

### 1.1 `&&`（逻辑与）

左操作数为 falsy 时，**短路**返回左操作数：

```javascript
false && anything;  // false（anything 不会求值）
0 && anything;      // 0
null && anything;   // null
"" && anything;     // ""

true && "hello";    // "hello"
1 && "hello";       // "hello"
```

### 1.2 `||`（逻辑或）

左操作数为 truthy 时，**短路**返回左操作数：

```javascript
true || anything;   // true（anything 不会求值）
"hello" || anything; // "hello"

false || "default"; // "default"
0 || "default";     // "default"
null || "default";  // "default"
```

### 1.3 `??`（空值合并）

左操作数**非 nullish** 时，短路返回左操作数：

```javascript
"hello" ?? "default";  // "hello"
0 ?? "default";        // 0（0 不是 nullish）
false ?? "default";    // false（false 不是 nullish）

null ?? "default";     // "default"
undefined ?? "default"; // "default"
```

---

## 2. 逻辑运算符的应用模式

### 2.1 默认值模式

```javascript
// || 默认值（falsy 值会被替换）
const port = config.port || 3000; // 如果 port 为 0，也会变成 3000（bug！）

// ?? 默认值（只有 null/undefined 被替换）
const port2 = config.port ?? 3000; // 如果 port 为 0，保持 0（正确）
```

### 2.2 条件执行模式

```javascript
// && 条件执行
isValid && submitForm();

// 等价于
if (isValid) submitForm();
```

### 2.3 链式默认值

```javascript
const value = input ?? default1 ?? default2 ?? "final";
```

---

## 3. 逻辑赋值运算符（ES2021）

```javascript
// &&=：左操作数为 truthy 时赋值
let a = 1;
a &&= 2; // a = a && 2 → a = 1（1 是 truthy，但返回 1）

let b = 0;
b &&= 3; // b = b && 3 → b = 0（0 是 falsy，短路）

// ||=：左操作数为 falsy 时赋值
let c = 0;
c ||= 5; // c = c || 5 → c = 5

let d = 1;
d ||= 5; // d = d || 5 → d = 1

// ??=：左操作数为 nullish 时赋值
let e = null;
e ??= 10; // e = e ?? 10 → e = 10

let f = 0;
f ??= 10; // f = f ?? 10 → f = 0（0 不是 nullish）
```

---

## 4. 与类型系统的交互

TypeScript 的控制流分析利用逻辑运算符进行类型收窄：

```typescript
function process(value: string | null | undefined) {
  if (value !== null && value !== undefined) {
    // value 被收窄为 string
    value.toUpperCase();
  }

  // 等价于使用 ??
  const safe = value ?? "default";
  // safe 被推断为 string
}
```

---

## 5. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| `\|\|` 与 `??` 的语义差异 | `\|\|` 替换所有 falsy 值，`??` 只替换 nullish | 默认值使用 `??` |
| 0 / "" / false 的默认值处理 | `value \|\| default` 会错误替换 0 和 "" | 使用 `value ?? default` |
| 逻辑运算符的优先级 | `&&` > `\|\|` > `??` | 使用括号明确优先级 |
| `??` 与 `&&`/`\|\|` 混用 | `a && b ?? c` 会报错（需要括号）| 明确分组：`a && (b ?? c)` |

---

**参考规范**：ECMA-262 §13.12 Binary Logical Operators | ECMA-262 §13.15.2 Logical Assignment Operators

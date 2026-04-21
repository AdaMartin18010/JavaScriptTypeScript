# 抽象操作

> ECMA-262 规范中定义的核心算法：类型转换、比较与操作
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 抽象操作概述

抽象操作是 ECMA-262 规范中定义的**内部算法**，不直接暴露给 JavaScript 开发者，但描述了所有内置行为：

| 操作类别 | 示例 |
|---------|------|
| 类型转换 | `ToPrimitive`, `ToString`, `ToNumber`, `ToBoolean` |
| 比较操作 | `IsStrictlyEqual`, `SameValue`, `SameValueZero` |
| 对象操作 | `Get`, `Set`, `DeletePropertyOrThrow` |
| 环境操作 | `GetIdentifierReference`, `ResolveBinding` |

---

## 2. ToPrimitive

将对象转换为原始值：

```javascript
// [Symbol.toPrimitive](hint)
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return 42;
    if (hint === "string") return "hello";
    return "default";
  }
};

console.log(+obj);      // 42（hint: number）
console.log(`${obj}`);  // "hello"（hint: string）
console.log(obj + "");  // "default"（hint: default）
```

### 2.1 OrdinaryToPrimitive

如果没有 `Symbol.toPrimitive`，使用 `valueOf` 和 `toString`：

```javascript
const obj = {
  valueOf() { return 42; },
  toString() { return "hello"; }
};

console.log(+obj);     // 42（先 valueOf）
console.log(`${obj}`); // "hello"（先 toString）
```

---

## 3. ToNumber

```javascript
ToNumber("42");     // 42
ToNumber("");       // 0
ToNumber("hello");  // NaN
ToNumber(true);     // 1
ToNumber(false);    // 0
ToNumber(null);     // 0
ToNumber(undefined); // NaN
ToNumber({});        // NaN（先 ToPrimitive）
```

### 3.1 一元 + 运算符

```javascript
+"42";     // 42（调用 ToNumber）
+true;     // 1
+null;     // 0
+undefined; // NaN
```

---

## 4. ToString

```javascript
ToString(42);        // "42"
ToString(true);      // "true"
ToString(null);      // "null"
ToString(undefined); // "undefined"
ToString([1,2,3]);   // "1,2,3"
ToString({});        // "[object Object]"
```

### 4.1 模板字面量

```javascript
const obj = { toString() { return "custom"; } };
console.log(`${obj}`); // "custom"
```

---

## 5. ToBoolean

```javascript
// falsy 值
ToBoolean(undefined); // false
ToBoolean(null);      // false
ToBoolean(false);     // false
ToBoolean(0);         // false
ToBoolean(-0);        // false
ToBoolean("");        // false
ToBoolean(NaN);       // false

// 其他所有值都是 truthy
ToBoolean({});        // true
ToBoolean([]);        // true
ToBoolean("0");       // true
```

---

## 6. 比较操作

### 6.1 IsStrictlyEqual (===)

```javascript
// 类型不同 → false
1 === "1";     // false

// NaN 永不等于任何值
NaN === NaN;   // false

// +0 和 -0 相等
+0 === -0;     // true

// 对象比较引用
{} === {};     // false
```

### 6.2 SameValue (Object.is)

```javascript
Object.is(NaN, NaN);     // true（与 === 不同）
Object.is(+0, -0);       // false（与 === 不同）
Object.is(1, "1");       // false
```

### 6.3 SameValueZero

用于 `Map` 和 `Set`：

```javascript
new Map().set(+0, "a").get(-0); // "a"（SameValueZero 认为 +0 === -0）
```

### 6.4 抽象相等 (==)

```javascript
// 类型相同 → 严格比较
1 == 1;        // true

// null == undefined
null == undefined; // true

// 数字 vs 字符串 → 字符串转数字
1 == "1";      // true

// 布尔 vs 其他 → 布尔转数字
1 == true;     // true
0 == false;    // true

// 对象 vs 原始值 → 对象转原始值
[1,2] == "1,2"; // true
```

---

## 7. 抽象操作调用链

```javascript
"42" + 1
// 1. ToPrimitive("42") → "42"
// 2. ToPrimitive(1) → 1
// 3. 一侧是 String，调用 ToString(1) → "1"
// 4. 字符串拼接："42" + "1" = "421"
```

---

**参考规范**：ECMA-262 §7.1 Type Conversion | ECMA-262 §7.2 Testing and Comparison Operations

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


### 规范伪代码示例

``n1. Let result be ToPrimitive(input).
2. If Type(result) is not String, throw TypeError.
3. Return result.
``n
规范使用伪代码描述算法步骤，开发者可通过阅读规范深入理解引擎行为。

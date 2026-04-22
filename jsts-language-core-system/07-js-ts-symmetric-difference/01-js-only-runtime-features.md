# JS-Only 运行时特性

> 模块编号: 07-js-ts-symmetric-difference/01
> 复杂度: ⭐⭐⭐⭐ (高级)
> 目标读者: 编译器工程师、运行时研究者

---

## 核心命题

TypeScript 的类型系统建立在 JavaScript 运行时之上，但**类型层无法触及、无法建模、无法改变**以下运行时行为。这些行为根植于 ECMA-262 引擎实现，是 JS 动态性的本质体现。

---

## 1. typeof 的怪癖

### `typeof null === "object"`

这是 JavaScript 最著名的历史 bug，源于早期引擎中值类型的位编码：`null` 的标记位与对象相同（全 0）。

```typescript
// TS 类型收窄处理
typeof x === "object" // 收窄为: object | null
```

**为什么 TS 无法修复？** 类型系统不能改变运行时的 `typeof` 运算符行为。如果 TS 将 `typeof null` 编译成 `"null"`，所有现有代码都会断裂。

### 完整 typeof 矩阵

| 值 | typeof 结果 | TS 类型 |
|----|------------|---------|
| `null` | `"object"` | `null` |
| `[]` | `"object"` | `object` |
| `{}` | `"object"` | `object` |
| `NaN` | `"number"` | `number` |
| `() => {}` | `"function"` | `Function` |
| `class {}` | `"function"` | `typeof MyClass` |
| `undefined` | `"undefined"` | `undefined` |

---

## 2. == 抽象相等算法

### 强制转换规则

`==` 运算符执行**抽象相等比较算法**（ECMA-262 §7.2.14），其核心是：

1. 如果类型相同，按 `===` 比较
2. 如果类型不同，尝试转换为数字或原始值再比较

### 陷阱矩阵

| 表达式 | 结果 | 原因 |
|--------|------|------|
| `[] == false` | `true` | `ToPrimitive([])` → `""` → `0` |
| `"" == false` | `true` | `ToNumber("")` → `0` |
| `"0" == false` | `true` | `ToNumber("0")` → `0` |
| `null == undefined` | `true` | 规范特例 |
| `null == 0` | `false` | 规范特例：null 只等于 undefined |
| `[] == ![]` | `true` | `![]` → `false`, `[] == false` → `true` |

**为什么 TS 无法阻止？** `==` 是合法运算符，TS 只能用 lint（如 `eqeqeq` 规则）建议禁用，无法在编译时拦截所有危险情况。

---

## 3. 抽象操作 (Abstract Operations)

ECMA-262 定义了 50+ 抽象操作，这些是引擎内部的"伪函数"，描述类型转换的精确语义。

### ToPrimitive

```
ToPrimitive(input, hint)
  1. 如果 input 是原始值，直接返回
  2. 调用 input[Symbol.toPrimitive](hint)
  3. hint === "string" ? 先 toString() 后 valueOf()
  4. hint === "number" ? 先 valueOf() 后 toString()
```

### ToNumber

| 输入 | 输出 |
|------|------|
| `""` | `0` |
| `" 123 "` | `123` |
| `"0x10"` | `16` |
| `"123abc"` | `NaN` |
| `undefined` | `NaN` |
| `null` | `0` |
| `true` | `1` |
| `false` | `0` |
| `Symbol()` | **TypeError** |

---

## 4. 内部槽 (Internal Slots)

ECMA-262 使用 `[[SlotName]]` 表示对象的内部状态，这些**不是属性**，无法通过 JS 代码直接访问（除了 Proxy 和 Reflect 的间接方式）。

| 内部槽 | 含义 | 可观察行为 |
|--------|------|-----------|
| `[[Prototype]]` | 原型对象 | `Object.getPrototypeOf` / `__proto__` |
| `[[Extensible]]` | 是否可扩展 | `Object.isExtensible` |
| `[[PrivateFieldValues]]` | 私有字段值 | 语法 `#field` |
| `[[Realm]]` | 所属 Realm | 跨 iframe `instanceof` 失效 |
| `[[Environment]]` | 词法环境 | 闭包捕获 |

**为什么 TS 无法建模？** 内部槽是引擎实现细节，不是语言层面的类型系统概念。TS 的类型系统描述的是"值的外观"，而非"引擎内部表示"。

---

## 5. GC 相关特性

### WeakRef

`WeakRef` 持有对象的弱引用，不阻止垃圾回收。但**GC 时机完全不可预测**：

```javascript
let obj = { data: 'sensitive' };
const ref = new WeakRef(obj);
obj = null;
// ref.deref() 可能在任何时候返回 undefined
```

TS 类型 `WeakRef<T>` 暗示引用总是有效，但实际上 `deref()` 可能随时返回 `undefined`。

### FinalizationRegistry

回调函数在对象被 GC 后触发，但：

- 回调可能永远不会执行（如果对象从未被回收）
- 回调执行时机不确定
- 某些引擎可能不支持

---

## 6. 多线程内存模型

### Atomics / SharedArrayBuffer

`Atomics` 提供线程安全的内存操作，但：

- TS 不知道代码运行在哪个线程
- TS 无法检测 data race
- `Atomics.wait` / `notify` 的语义超越类型系统

```javascript
const buffer = new SharedArrayBuffer(1024);
const array = new Int32Array(buffer);
// 以下操作在 TS 看来都是普通的 number 读写
Atomics.store(array, 0, 42); // 线程安全
array[0] = 42;               // data race！但 TS 不报错
```

---

## 7. 动态代码执行

### eval

`eval` 在当前词法作用域执行字符串代码：

```javascript
const x = 1;
eval('console.log(x)'); // 2
```

TS 将 `eval` 的返回值类型定为 `any`，完全放弃检查。

### new Function

`new Function` 在**全局作用域**创建函数，无法访问闭包变量：

```javascript
function outer() {
  const local = 42;
  const fn = new Function('return local');
  return fn(); // ReferenceError: local is not defined
}
```

---

## 8. 跨 Realm 问题

每个 iframe、Worker、VM 上下文都有自己的**全局对象**，即不同的 **Realm**。相同类在不同 Realm 中有不同的构造函数：

```javascript
const iframe = document.createElement('iframe');
const iframeArray = iframe.contentWindow.Array;
const arr = new iframeArray(1, 2, 3);

arr instanceof Array;      // false！
Array.isArray(arr);        // true ✓
```

**TS 的盲区：** `instanceof Array` 的类型守卫在跨 Realm 时失效，但 TS 类型系统仍认为 `arr` 是 `Array` 的实例。

---

## 9. with 语句

`with` 语句使变量解析动态化：

```javascript
with (obj) {
  console.log(a); // 是 obj.a 还是全局 a？运行时决定！
}
```

TS 直接禁止 `with` 语句，因为它使**所有内部标识符的静态解析成为不可能**。

---

## 参考

- ECMA-262 §7.2.14 Abstract Equality Comparison
- ECMA-262 §7.1.1 ToPrimitive
- ECMA-262 §9.1 Ordinary Object Internal Methods
- [V8 博客: Orinoco GC](https://v8.dev/blog/orinoco)

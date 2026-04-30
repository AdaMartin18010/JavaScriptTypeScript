# 抽象操作深度索引

> **定位**：`10-fundamentals/10.6-ecmascript-spec/` — ECMA-262 规范抽象操作速查与示例。

---

## 类型转换抽象操作

### 核心操作表

| 操作 | 规范章节 | 输入 | 输出 | 关键算法步骤 | 常见边界 |
|------|---------|------|------|-------------|---------|
| `ToPrimitive(input, hint)` | [7.1.1](https://262.ecma-international.org/15.0/#sec-toprimitive) | any | 原始值 | 1. 检查 `Symbol.toPrimitive`<br>2. 调用 `valueOf()`<br>3. 调用 `toString()` | 对象无 `valueOf` 时回退 `toString` |
| `ToBoolean(argument)` | [7.1.2](https://262.ecma-international.org/15.0/#sec-toboolean) | any | Boolean | falsy 值表判断 | `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`, `false` |
| `ToNumber(argument)` | [7.1.3](https://262.ecma-international.org/15.0/#sec-tonumber) | any | Number | 字符串解析 → 数字转换 | `""`→`0`, `" "`→`0`, `null`→`0`, `undefined`→`NaN`, `Symbol`→`TypeError` |
| `ToNumeric(argument)` | [7.1.3](https://262.ecma-international.org/15.0/#sec-tonumeric) | any | Number \| BigInt | 优先 BigInt，fallback Number | `123n` 保持 `123n`, `"123"`→`123` |
| `ToString(argument)` | [7.1.18](https://262.ecma-international.org/15.0/#sec-tostring) | any | String | 原始值直接转换，对象走 ToPrimitive | `-0`→`"0"`, `[]`→`""`, `[1,2]`→`"1,2"` |
| `ToObject(argument)` | [7.1.20](https://262.ecma-international.org/15.0/#sec-toobject) | any | Object | 包装原始值 | `null`/`undefined`→`TypeError` |

### 类型转换矩阵 (简化)

| 原始值 | ToBoolean | ToNumber | ToString |
|--------|-----------|----------|----------|
| `undefined` | `false` | `NaN` | `"undefined"` |
| `null` | `false` | `0` | `"null"` |
| `true` | `true` | `1` | `"true"` |
| `false` | `false` | `0` | `"false"` |
| `0` | `false` | `0` | `"0"` |
| `-0` | `false` | `-0` | `"0"` |
| `1` | `true` | `1` | `"1"` |
| `""` | `false` | `0` | `""` |
| `" "` | `true` | `0` | `" "` |
| `"123"` | `true` | `123` | `"123"` |
| `"abc"` | `true` | `NaN` | `"abc"` |
| `Symbol()` | `true` | **TypeError** | **TypeError** |
| `0n` | `false` | `0` | `"0"` |
| `123n` | `true` | `123` | `"123"` |
| `{}` | `true` | `NaN` | `"[object Object]"` |
| `[]` | `true` | `0` | `""` |
| `[1,2]` | `true` | `NaN` | `"1,2"` |

---

## 对象操作抽象操作

| 操作 | 规范章节 | 语义 | 异常条件 |
|------|---------|------|---------|
| `Get(O, P)` | [7.3.2](https://262.ecma-international.org/15.0/#sec-get-o-p) | 获取对象 O 的属性 P 的值 | O 不是 Object → TypeError |
| `Set(O, P, V, Throw)` | [7.3.3](https://262.ecma-international.org/15.0/#sec-set-o-p-v-throw) | 设置对象 O 的属性 P 为 V | Throw=true 且失败时 TypeError |
| `HasProperty(O, P)` | [7.3.5](https://262.ecma-international.org/15.0/#sec-hasproperty-o-p) | 检查对象 O 或其原型链是否有属性 P | — |
| `DeletePropertyOrThrow(O, P)` | [7.3.6](https://262.ecma-international.org/15.0/#sec-deletepropertyorthrow-o-p) | 删除属性，失败时抛出 TypeError | 不可配置属性 → TypeError |
| `DefinePropertyOrThrow(O, P, desc)` | [7.3.7](https://262.ecma-international.org/15.0/#sec-definepropertyorthrow-o-p-desc) | 定义属性，失败时抛出 TypeError | 不可扩展对象 → TypeError |
| `GetMethod(V, P)` | [7.3.9](https://262.ecma-international.org/15.0/#sec-getmethod-v-p) | 获取 V 的方法 P，不存在返回 undefined | 存在但非 callable → TypeError |
| `HasEitherSuperBinding(env)` | [8.1.1.2.1](https://262.ecma-international.org/15.0/#sec-haseithersuperbinding) | 检查环境记录是否有 super 绑定 | — |

---

## 模块相关抽象操作

| 操作 | 规范章节 | 语义 |
|------|---------|------|
| `HostResolveImportedModule(referencingScriptOrModule, specifier)` | [16.2.1.3](https://262.ecma-international.org/15.0/#sec-hostresolveimportedmodule) | 宿主解析导入模块，返回 Module Record |
| `GetExportedNames(exportStarSet)` | [16.2.1.4](https://262.ecma-international.org/15.0/#sec-getexportednames-exportstarset) | 获取模块的导出名称，处理 `export *` |
| `ResolveExport(exportName, resolveSet)` | [16.2.1.5](https://262.ecma-international.org/15.0/#sec-resolveexport-exportname-resolveset) | 解析导出绑定，处理循环导出和星号冲突 |

---

## 代码示例: `Symbol.toPrimitive`

`Symbol.toPrimitive` 允许对象完全自定义其在类型转换时的行为，覆盖默认的 `valueOf` → `toString` 链：

```javascript
// ============================================
// Symbol.toPrimitive 深度示例
// ============================================

const resource = {
  bytes: 1024,
  label: 'ImageAsset',
  
  // 自定义 ToPrimitive 行为
  [Symbol.toPrimitive](hint) {
    console.log(`ToPrimitive called with hint: ${hint}`);
    
    switch (hint) {
      case 'number':
        return this.bytes;        // 返回字节数
      case 'string':
        return `${this.label}(${this.bytes} bytes)`;
      case 'default':
      default:
        return this.bytes;        // 默认行为（如 == 比较）
    }
  }
};

// hint = 'number' （算术运算）
console.log(resource * 2);        // 2048
console.log(+resource);           // 1024
console.log(resource - 0);        // 1024

// hint = 'string' （字符串上下文）
console.log(String(resource));    // "ImageAsset(1024 bytes)"
console.log(`${resource}`);       // "ImageAsset(1024 bytes)"

// hint = 'default' （== 比较, Date 除外）
console.log(resource == 1024);    // true
console.log(resource == '1024');  // true (先 ToPrimitive default, 再 ToNumber)

// ============================================
// 对比：未定义 Symbol.toPrimitive 的对象
// ============================================

const plainObj = { value: 42 };
console.log(Number(plainObj));    // NaN (默认 valueOf 返回对象本身, 回退 toString → "[object Object]" → NaN)
console.log(String(plainObj));    // "[object Object]"

// ============================================
// 实用模式：单位感知数值类型
// ============================================

class Duration {
  constructor(ms) {
    this.ms = ms;
  }
  
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') {
      const seconds = (this.ms / 1000).toFixed(2);
      return `${seconds}s`;
    }
    return this.ms; // number / default
  }
  
  // 支持运算返回新 Duration
  add(other) {
    return new Duration(this.ms + Number(other));
  }
}

const d1 = new Duration(1500);
const d2 = new Duration(2500);

console.log(String(d1));          // "1.50s"
console.log(Number(d1));          // 1500
console.log(d1 + d2);             // 4000 (hint='default', 返回 number)
console.log(`${d1.add(d2)}`);     // "4.00s"
```

### 运算触发 ToPrimitive 的 hint 对照表

| 运算表达式 | Hint | 说明 |
|-----------|------|------|
| `+obj` | `number` | 一元正号 |
| `-obj` | `number` | 一元负号 |
| `obj1 + obj2` | `default` | 二元加号（字符串或数字上下文） |
| `obj1 - obj2` | `number` | 算术减 |
| `obj1 * obj2` | `number` | 算术乘 |
| `obj1 / obj2` | `number` | 算术除 |
| `String(obj)` | `string` | 显式转字符串 |
| `` `${obj}` `` | `string` | 模板字符串 |
| `obj1 == obj2` | `default` | 宽松相等（非 Date 对象） |
| `obj1 < obj2` | `number` | 关系比较 |
| `Number(obj)` | `number` | 显式转数字 |
| `BigInt(obj)` | `number` | 转 BigInt |
| `new Date(obj)` | `string` | **特例**: Date 构造函数传对象时 hint='string' |

---

## 代码示例：`==` 抽象相等比较算法追踪

ECMA-262 §7.2.14 `IsLooselyEqual(x, y)` 定义了 `==` 的完整行为。以下通过代码复现规范中的比较步骤：

```javascript
// ============================================
// 复现规范 IsLooselyEqual 的核心分支
// ============================================

function isLooselyEqual(x, y) {
  // 1. 类型相同 → 严格相等
  if (typeof x === typeof y) return x === y;

  // 2. null == undefined 为 true（规范特例）
  if ((x === null && y === undefined) || (x === undefined && y === null)) return true;

  // 3. Number ↔ String：String 转 Number
  if (typeof x === 'number' && typeof y === 'string') return isLooselyEqual(x, Number(y));
  if (typeof x === 'string' && typeof y === 'number') return isLooselyEqual(Number(x), y);

  // 4. BigInt ↔ String：String 转 BigInt
  if (typeof x === 'bigint' && typeof y === 'string') {
    try { return isLooselyEqual(x, BigInt(y)); } catch { return false; }
  }
  if (typeof x === 'string' && typeof y === 'bigint') {
    try { return isLooselyEqual(BigInt(x), y); } catch { return false; }
  }

  // 5. Boolean → Number 转换
  if (typeof x === 'boolean') return isLooselyEqual(Number(x), y);
  if (typeof y === 'boolean') return isLooselyEqual(x, Number(y));

  // 6. Object vs Primitive：对象转原始值（ToPrimitive）
  if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
    return isLooselyEqual(ToPrimitive(x), y);
  }
  if ((typeof y === 'object' || typeof y === 'function') && y !== null) {
    return isLooselyEqual(x, ToPrimitive(y));
  }

  // 7. BigInt ↔ Number：不可混用（除非安全范围）
  if (typeof x === 'bigint' && typeof y === 'number') return x === BigInt(y);
  if (typeof x === 'number' && typeof y === 'bigint') return BigInt(x) === y;

  return false;
}

function ToPrimitive(input, preferredType = 'default') {
  if (input === null || typeof input !== 'object') return input;
  const sym = input[Symbol.toPrimitive];
  if (sym) {
    const result = sym.call(input, preferredType);
    if (result !== null && typeof result !== 'object') return result;
    throw new TypeError('Cannot convert object to primitive value');
  }
  // 简化版：优先 valueOf，其次 toString
  if (typeof input.valueOf === 'function') {
    const v = input.valueOf();
    if (v !== input) return v;
  }
  if (typeof input.toString === 'function') {
    const s = input.toString();
    if (s !== input) return s;
  }
  return input;
}

// 经典陷阱验证
console.log(isLooselyEqual([], ''));        // true  ([] → ToPrimitive → "")
console.log(isLooselyEqual(true, 1));       // true  (true → 1)
console.log(isLooselyEqual(null, undefined)); // true
console.log(isLooselyEqual('0', false));    // true  (false → 0; '0' → 0)
console.log(isLooselyEqual({}, '[object Object]')); // true
```

---

## 代码示例：SameValue vs SameValueZero vs 严格相等

ECMA-262 定义了三种等价判断抽象操作，它们对边界值的处理不同：

```javascript
// ============================================
// 三种等价操作的边界差异
// ============================================

function SameValue(x, y) {
  // 规范 7.2.11：区分 +0 与 -0；NaN === NaN
  if (typeof x !== typeof y) return false;
  if (Number.isNaN(x) && Number.isNaN(y)) return true;
  // 使用 Object.is 即 SameValue
  return Object.is(x, y);
}

function SameValueZero(x, y) {
  // 规范 7.2.12：不区分 +0 与 -0；NaN === NaN
  // 用于 Map/Set 键比较、Array.prototype.includes
  if (Number.isNaN(x) && Number.isNaN(y)) return true;
  return x === y; // +0 === -0 为 true
}

function IsStrictlyEqual(x, y) {
  // 规范 7.2.15：区分 +0 与 -0（+0 === -0 为 true）；NaN !== NaN
  return x === y;
}

// 对比矩阵
const tests = [
  [0, -0],
  [NaN, NaN],
  [+Infinity, -Infinity],
  ['', ''],
  [null, undefined],
];

console.table(tests.map(([a, b]) => ({
  left: String(a), right: String(b),
  '===': a === b,
  'Object.is': Object.is(a, b),
  'SameValueZero': SameValueZero(a, b)
})));

// Map 使用 SameValueZero：Map 中 +0 与 -0 视为同一键
const m = new Map();
m.set(0, 'zero');
m.set(-0, 'negative zero');
console.log(m.size); // 1
console.log(m.get(0)); // "negative zero"

// Array.prototype.includes 使用 SameValueZero
console.log([NaN].includes(NaN)); // true
console.log([0].includes(-0));    // true

// indexOf 使用严格相等 ===
console.log([NaN].indexOf(NaN));  // -1（找不到）
```

---

## 代码示例：OrdinaryToPrimitive 与自定义对象转换

```javascript
// ============================================
// OrdinaryToPrimitive 的规范级模拟
// ============================================

function OrdinaryToPrimitive(O, hint) {
  // ECMA-262 §7.1.1.1
  const methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
  for (const name of methodNames) {
    const method = O[name];
    if (typeof method === 'function') {
      const result = method.call(O);
      if (result !== null && typeof result !== 'object') return result;
    }
  }
  throw new TypeError('Cannot convert object to primitive value');
}

// 日期对象优先 toString（hint='string'）
const date = new Date(0);
console.log(OrdinaryToPrimitive(date, 'string')); // "1970-01-01T00:00:00.000Z"
console.log(OrdinaryToPrimitive(date, 'number')); // 0（valueOf 返回时间戳）

// 自定义对象控制转换顺序
const obj = {
  valueOf() { return 42; },
  toString() { return 'custom'; }
};
console.log(OrdinaryToPrimitive(obj, 'number')); // 42（优先 valueOf）
console.log(OrdinaryToPrimitive(obj, 'string')); // "custom"（优先 toString）
```

---

## 扩展：抽象操作与日常 JavaScript

```javascript
// ============================================
// 理解隐式类型转换的规范根源
// ============================================

// [] + {}  为什么等于 "[object Object]"?
// 1. [] 被 ToPrimitive default → ""
// 2. {} 被 ToPrimitive default → "[object Object]"
// 3. 二元 + 遇到字符串，执行字符串拼接
console.log([] + {});             // "[object Object]"

// {} + []  为什么等于 0?
// 1. {} 被解析为空的代码块（statement），不是对象字面量
// 2. +[] 被解析为 ToPrimitive number → ""
// 3. ToNumber("") → 0
console.log({} + []);             // 0

// [1,2] + [3,4] → "1,23,4"
// 1. [1,2] → ToPrimitive default → "1,2"
// 2. [3,4] → ToPrimitive default → "3,4"
// 3. 字符串拼接
console.log([1,2] + [3,4]);       // "1,23,4"

// 显式控制转换以避免意外
function safeAdd(a, b) {
  const numA = Number(a);  // 显式 ToNumber
  const numB = Number(b);
  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    throw new TypeError('Operands must be coercible to Number');
  }
  return numA + numB;
}

console.log(safeAdd('42', 8));    // 50
```

---

## 权威链接

- [ECMA-262 第 15 版 — 抽象操作 (Section 7)](https://262.ecma-international.org/15.0/#sec-abstract-operations) — 规范原文。
- [ECMA-262 — ToPrimitive](https://262.ecma-international.org/15.0/#sec-toprimitive) — 规范 §7.1.1。
- [ECMA-262 — Type Conversion](https://262.ecma-international.org/15.0/#sec-type-conversion) — 第 7.1 节完整类型转换算法。
- [ECMA-262 — IsLooselyEqual](https://262.ecma-international.org/15.0/#sec-islooselyequal) — 抽象相等 `==` 的规范算法 §7.2.14。
- [ECMA-262 — IsStrictlyEqual](https://262.ecma-international.org/15.0/#sec-isstrictlyequal) — 严格相等 `===` §7.2.15。
- [ECMA-262 — SameValue](https://262.ecma-international.org/15.0/#sec-samevalue) — `Object.is` 底层操作 §7.2.11。
- [MDN: Symbol.toPrimitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) — Mozilla 文档与示例。
- [MDN: Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) — `==`、`===`、`Object.is` 对比。
- [JavaScript Spec Explorer](https://tc39.es/ecma262/multipage/) — TC39 提供的规范多页面浏览版本。
- [ECMAScript Specification Types](https://262.ecma-international.org/15.0/#sec-ecmascript-language-types) — 规范类型系统的形式化定义。
- [2ality: JavaScript’s == operator](https://2ality.com/2011/06/javascript-equality.html) — Dr. Axel Rauschmayer 深度解析 `==`。
- [V8 Blog: Understanding the ECMAScript spec](https://v8.dev/blog/understanding-ecmascript-part-1) — V8 团队解读规范系列。
- [MDN: Type coercion](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion) — 类型强制转换概览。
- [JavaScript WTF: [] + {} vs {} + []](https://www.youtube.com/watch?v=vtS1npQOv2I) — 视觉化解释抽象操作（Wat 演讲衍生）。

---

*本文件为规范基础专题的抽象操作速查索引。建议结合 `10-fundamentals/10.6-ecmascript-spec/` 下的其他专题文件系统学习。*

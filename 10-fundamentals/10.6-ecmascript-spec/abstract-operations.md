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
- [MDN: Symbol.toPrimitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) — Mozilla 文档与示例。
- [JavaScript Spec Explorer](https://tc39.es/ecma262/multipage/) — TC39 提供的规范多页面浏览版本。
- [ECMAScript Specification Types](https://262.ecma-international.org/15.0/#sec-ecmascript-language-types) — 规范类型系统的形式化定义。

---

*本文件为规范基础专题的抽象操作速查索引。建议结合 `10-fundamentals/10.6-ecmascript-spec/` 下的其他专题文件系统学习。*

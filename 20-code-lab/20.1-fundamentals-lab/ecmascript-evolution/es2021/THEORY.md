# ES2021 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2021`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 ECMAScript 2021 标准新增的 5 项核心特性，解决 JavaScript 在字符串替换、Promise 竞争、逻辑赋值运算符等方面的表达能力不足。

### 1.2 形式化基础

| 特性 | 规范章节 | 状态 |
|------|----------|------|
| `String.prototype.replaceAll` | ECMA-262 §22.1.3.19 | Stage 4 (ES2021) |
| `Promise.any` | ECMA-262 §27.2.4.2 | Stage 4 (ES2021) |
| 逻辑赋值运算符 | ECMA-262 §13.15 | Stage 4 (ES2021) |
| 数字分隔符 | ECMA-262 §12.8.3 | Stage 4 (ES2021) |
| `WeakRef` & `FinalizationRegistry` | ECMA-262 §26.1 / §26.2 | Stage 4 (ES2021) |

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| replaceAll | 全局替换所有匹配子串，无需正则 `/g` | `replace` + 正则 |
| Promise.any | 返回首个 fulfilled 的 Promise，全部 reject 则 AggregateError | `Promise.race` / `Promise.all` |
| 逻辑赋值 | `\|\|=`、`&&=`、`??=` 将逻辑运算与赋值合并 | 逻辑运算符 + 赋值 |
| 数字分隔符 | 使用下划线 `_` 作为数字字面量视觉分隔符 | 可读性增强 |
| WeakRef | 对对象的弱引用，不阻止垃圾回收 | 缓存、元数据关联 |

---

## 二、设计原理

### 2.1 为什么存在

ES2021 延续了"小步快跑"的年度发布策略，聚焦于社区呼声最高的微小但高频痛点：`replaceAll` 填补字符串全局替换的语义空白；`Promise.any` 补充 Promise 组合子的缺失环节；逻辑赋值运算符减少重复代码；数字分隔符提升大数字可读性；`WeakRef` 为高级内存管理提供标准接口。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生新特性 | 语义明确、无需库依赖 | 兼容性需检查 | 现代环境 |
| 传统 polyfill | 全兼容 | 运行时开销、非标准行为 | 遗留环境 |

### 2.3 与相关技术的对比

`Promise.any` vs `Promise.race`：`race` 在首个 settle（fulfilled 或 rejected）时返回；`any` 仅在首个 fulfilled 时返回，全部 rejected 才失败。`replaceAll` vs `replace` + `/g`：`replaceAll` 更直观，且对特殊字符无需转义。

---

## 三、实践映射

### 3.1 String.prototype.replaceAll

```typescript
const str = 'The quick brown fox jumps over the lazy dog. The fox is quick.';

// 全局替换，无需正则
const replaced = str.replaceAll('fox', 'cat');

// 对比传统方式
const replacedLegacy = str.replace(/fox/g, 'cat');

// 特殊字符安全
const code = 'function() { return x + x; }';
const doubled = code.replaceAll('x', 'y'); // 无需转义
```

### 3.2 Promise.any

```typescript
const fastMirror = fetch('https://mirror-a.example.com/data');
const slowMirror = fetch('https://mirror-b.example.com/data');

// 返回首个成功的响应
try {
  const response = await Promise.any([fastMirror, slowMirror]);
  const data = await response.json();
} catch (error) {
  // AggregateError: All promises were rejected
  console.error('All mirrors failed:', error.errors);
}
```

### 3.3 逻辑赋值运算符

```typescript
// 逻辑或赋值 (x ||= y 等价于 x || (x = y))
let config = { timeout: 0 };
config.timeout ||= 3000; // 仅当 timeout 为 falsy 时赋值

// 逻辑与赋值 (x &&= y 等价于 x && (x = y))
let user = getUser();
user &&= normalizeUser(user); // 仅当 user 为 truthy 时赋值

// 空值合并赋值 (x ??= y 等价于 x ?? (x = y))
let port = process.env.PORT ??= '8080'; // 仅当 null/undefined 时赋值

// 对比展开写法
let settings = getSettings();
settings = settings || defaultSettings; // ||=
```

### 3.4 数字分隔符

```typescript
const fileSize = 1_048_576; // 1 MB
const creditCard = 4_111_1111_1111_1111; // 可读性分组
const binaryMask = 0b1111_0000_1111_0000;
const hexColor = 0xFF_FF_00_00;
const big = 1_000_000_000_000n;

// 注意：分隔符不能出现在开头、结尾或小数点前后
// 1_0.0_1 // 合法
// _10 // 非法
// 10_ // 非法
```

### 3.5 WeakRef & FinalizationRegistry

```typescript
class ExpensiveCache {
  private cache = new Map<string, WeakRef<LargeObject>>();
  private registry = new FinalizationRegistry<string>((key) => {
    console.log(`Object for ${key} was garbage collected`);
    this.cache.delete(key);
  });

  set(key: string, value: LargeObject) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  get(key: string): LargeObject | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }
}
```

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| `replaceAll` 支持正则 | 仅接受字符串，正则需使用 `replace` + `/g` |
| `Promise.any` 忽略所有 reject | 全部 reject 时抛出 `AggregateError` |
| `??=` 与 `\|\|=` 等价 | `??=` 仅对 `null/undefined`；`\|\|=` 对所有 falsy 值 |
| `WeakRef.deref()` 永远返回对象 | 对象可能被 GC，返回 `undefined` |

---

## 四、权威参考

- [ECMA-262 — 2021 Language Specification](https://262.ecma-international.org/12.0/) — 官方规范
- [MDN — replaceAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll) — Mozilla 文档
- [MDN — Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) — Mozilla 文档
- [MDN — Logical OR assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment) — Mozilla 文档
- [MDN — WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) — Mozilla 文档
- [V8 Blog — ES2021 Features](https://v8.dev/features/tags/es2021) — V8 引擎实现解析

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

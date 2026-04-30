# ES2025 预览特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2025-preview`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块追踪在 ES2025 标准化周期内进入 Stage 3/4 的 TC39 提案，涵盖集合运算、正则增强与 Promise 辅助，用于评估尚未完全定稿但已进入实现阶段的语言特性。

### 1.2 形式化基础

TC39 五阶段流程中，Stage 3 表示「提案已完成且至少有两个兼容实现通过测试」；Stage 4 表示「已准备纳入下一版 ECMAScript」。Stage 3 特性在生产中使用需评估实现稳定性。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Stage 3 | 已完成规范文本，等待实现反馈 | 可谨慎试生产 |
| Stage 4 | 已确定纳入下一标准 | 可安全使用 |
| Polyfill | 旧引擎上的新特性兼容层 | core-js / es-shims |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 作为活的语言标准，Stage 3/4 提案提供了提前布局技术栈的窗口。掌握预览特性有助于架构师在特性正式发布时平滑升级。

### 2.2 Stage 追踪表（ES2025 周期）

| 提案 | Stage | 核心内容 | 代表实现 |
|------|-------|---------|---------|
| Set Methods | 4 → ES2025 | `intersection`/`union`/`difference` 等 | V8, SpiderMonkey, JSC |
| RegExp `v` flag | 4 → ES2025 | Unicode 集合运算 `/.../v` | V8, JSC |
| `Promise.try` | 4 → ES2025 | 同步异常转 rejected Promise | V8, SpiderMonkey |
| ArrayBuffer.transfer | 4 → ES2025 | 转移底层内存所有权 | V8 |
| Array Grouping | 4 → ES2024 | `Object.groupBy`/`Map.groupBy` | 全引擎 |
| Decorators | 3 | 类/方法/字段的装饰器语法 | TypeScript, Babel |
| Temporal | 3 | 现代日期/时间 API | proposal-temporal polyfill |
| Iterator Helpers | 3 | `map`/`filter`/`take`/`drop`/`flatMap`/`reduce`/`toArray`/`forEach`/`some`/`every`/`find` | V8, SpiderMonkey |
| Import Attributes | 3 | `import ... with { type: 'json' }` | V8 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 使用 Stage 4 特性 | 即将标准化、引擎已支持 | 需转译旧环境 | 现代项目 |
| 使用 Stage 3 特性 | 技术领先 | 规范可能微调 | 原型/内部工具 |
| 等待正式发布 | 零风险 | 错失早期收益 | 金融/安全关键系统 |

---

## 三、实践映射

### 3.1 从理论到代码

```js
// === Stage 4 特性（已在 ES2025 定稿） ===
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.intersection(b); // Set { 2, 3 }
a.union(b);        // Set { 1, 2, 3, 4 }
a.difference(b);   // Set { 1 }
a.symmetricDifference(b); // Set { 1, 4 }
a.isSubsetOf(b);   // false
a.isSupersetOf(new Set([1, 2])); // true
a.isDisjointFrom(new Set([5, 6])); // true

// Promise.try: 将同步异常统一为 rejected Promise
Promise.try(() => riskyOperation()).catch(handleError);

// 对比旧写法：
// Promise.resolve().then(() => riskyOperation()).catch(handleError);
```

### 3.2 RegExp `v` flag 与 Unicode 属性集

```js
// === RegExp `v` flag (Stage 4) ===
// `v` flag 支持 Unicode 属性转义和集合运算

// 匹配所有字母（包括中文、阿拉伯文等）
const letters = /\p{Letter}/gu;
console.log('Hello 你好 مرحبا'.match(letters));
// ['H','e','l','l','o','你','好','م','ر','ح','ب','ا']

// 集合运算：匹配 emoji 但不匹配肤色修饰符
const emoji = /[\p{Emoji}--\p{Emoji_Component}]/gv;
console.log('👨‍👩‍👧‍👦 🏳️‍🌈'.match(emoji));

// 交集：匹配大写希腊字母
const greekUpper = /[\p{Script=Greek}&&\p{Uppercase}]/gv;
console.log('ΑβΓδ'.match(greekUpper)); // ['Α', 'Γ']

// 差集：匹配数字但排除罗马数字
const nonRomanNumerals = /[\p{Decimal_Number}--[\p{Numeric_Type=Numeric}&&\p{Script=Latin}]]/gv;
```

### 3.3 ArrayBuffer.transfer：零拷贝内存转移

```js
// === ArrayBuffer.transfer (Stage 4) ===
const original = new ArrayBuffer(1024);
const view = new Uint8Array(original);
view[0] = 42;

// transfer 将底层内存所有权转移给新 buffer，原 buffer 被 detach
const transferred = ArrayBuffer.transfer(original, 2048); // 新大小 2048

console.log(transferred.byteLength); // 2048
new Uint8Array(transferred)[0];      // 42 (数据保留)

// 原 buffer 被 detach，访问会抛出 TypeError
try {
  view[0];
} catch (e) {
  console.log(e.name); // TypeError
}
```

### 3.4 Object.groupBy / Map.groupBy

```js
// === Array Grouping (ES2024/ES2025) ===
const inventory = [
  { name: 'asparagus', type: 'vegetables', qty: 9 },
  { name: 'bananas', type: 'fruit', qty: 5 },
  { name: 'goat', type: 'meat', qty: 23 },
  { name: 'cherries', type: 'fruit', qty: 12 },
  { name: 'fish', type: 'meat', qty: 22 },
];

// Object.groupBy: 返回普通对象
const byType = Object.groupBy(inventory, ({ type }) => type);
console.log(byType.fruit.length); // 2

// Map.groupBy: 返回 Map，支持任意类型的 key
const byQtyRange = Map.groupBy(inventory, (item) =>
  item.qty > 10 ? 'sufficient' : 'restock'
);
console.log(byQtyRange.get('restock').length); // 2
```

### 3.5 Stage 3: Iterator Helpers

```js
// === Iterator Helpers (Stage 3) ===
// 惰性求值的迭代器工具方法

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 惰性链式操作（不创建中间数组）
const result = numbers
  .values()
  .map(x => x * 2)
  .filter(x => x > 10)
  .take(3)
  .toArray();

console.log(result); // [12, 14, 16]

// 与生成器配合使用
function* fibonacci() {
  let a = 0, b = 1;
  while (true) { yield a; [a, b] = [b, a + b]; }
}

const fib10 = fibonacci()
  .take(10)
  .toArray();
console.log(fib10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// drop + take 实现分页
function* paginate(items, pageSize) {
  let iter = items.values();
  while (true) {
    const page = iter.take(pageSize).toArray();
    if (page.length === 0) break;
    yield page;
    iter = iter.drop(pageSize);
  }
}
```

### 3.6 Stage 3: Import Attributes

```js
// === Import Attributes (Stage 3) ===
// 安全地导入 JSON / CSS / WASM 模块

// 导入 JSON（防止 MIME 类型嗅探攻击）
import config from './config.json' with { type: 'json' };
console.log(config.apiEndpoint);

// 动态导入同样支持
const data = await import('./data.json', { with: { type: 'json' } });

// Node.js 特有：导入 CSS 模块
// import styles from './styles.css' with { type: 'css' };
// document.adoptedStyleSheets = [styles];

// 对比旧语法（Import Assertions — 已废弃）
// import config from './config.json' assert { type: 'json' };
```

### 3.7 Stage 3: Decorators（需 Babel/TS 实验标志）

```typescript
// === Stage 3: TC39 Decorators（与 TS experimentalDecorators 不兼容）===
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)} with ${JSON.stringify(args)}`);
    const result = target.apply(this, args);
    console.log(`Result: ${JSON.stringify(result)}`);
    return result;
  };
}

function memoize<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const cache = new Map<string, Return>();
  return function (this: This, ...args: Args): Return {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = target.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

class MathUtil {
  @logged
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

const math = new MathUtil();
math.fibonacci(10); // 首次计算并缓存
math.fibonacci(10); // 直接命中缓存
```

### 3.8 Stage 3: Temporal（需 polyfill）

```typescript
// npm install @js-temporal/polyfill
import { Temporal } from '@js-temporal/polyfill';

const now = Temporal.Now.plainDateISO();
const meeting = Temporal.PlainDate.from('2025-12-25');
const until = now.until(meeting);
console.log(until.days); // 距圣诞节天数

// 时区安全计算
const nyc = Temporal.ZonedDateTime.from('2025-01-01T00:00:00[America/New_York]');
const tokyo = nyc.withTimeZone('Asia/Tokyo');
console.log(tokyo.toString()); // 自动处理 DST 与偏移

// Duration 运算
const duration = Temporal.Duration.from({ hours: 48 });
const later = nyc.add(duration);
console.log(later.toString()); // 正确处理跨 DST 边界

// 与 Date 的互操作
const legacyDate = new Date();
const instant = Temporal.Instant.from(legacyDate.toISOString());
```

### 3.9 常见误区

| 误区 | 正确理解 |
|------|---------|
| Stage 3 等于可生产使用 | Stage 3 规范仍可能微调，关键系统应等 Stage 4 |
| 所有引擎同时实现 Stage 4 | 各引擎发布节奏不同，需查 compat-table |
| Decorators 旧语法仍可用 | TC39 Decorators 与 TypeScript `experimentalDecorators` 不兼容 |
| `Promise.try` 与 `Promise.resolve` 等价 | `Promise.try` 捕获同步抛出的异常，`resolve` 不会 |
| Set 方法会修改原集合 | 所有新方法均返回新 Set，保持不可变性 |
| Iterator Helpers 会立即执行 | 它们是惰性求值的，只有调用 `toArray()`/`forEach()` 等才会消费 |
| Import Attributes 和 Assertions 相同 | Attributes 已取代 Assertions，语法不同 |

### 3.10 扩展阅读

- [TC39 Proposals Repository](https://github.com/tc39/proposals)
- [ECMAScript Compat Table](https://compat-table.github.io/compat-table/es2016plus/)
- [Can I use: JavaScript](https://caniuse.com/?cats=JS)
- [MDN: JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey News](https://spidermonkey.dev/)
- [Temporal Proposal](https://tc39.es/proposal-temporal/docs/)
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [Set Methods Proposal](https://github.com/tc39/proposal-set-methods)
- [RegExp `v` Flag Explainer](https://v8.dev/features/regexp-v-flag)
- [Promise.try Proposal](https://github.com/tc39/proposal-promise-try)
- [Iterator Helpers Proposal](https://github.com/tc39/proposal-iterator-helpers)
- [Import Attributes Proposal](https://github.com/tc39/proposal-import-attributes)
- [ArrayBuffer.transfer Proposal](https://github.com/tc39/proposal-arraybuffer-transfer)
- [V8: Set Methods](https://v8.dev/features/set-methods)
- [V8: Iterator Helpers](https://v8.dev/features/iterator-helpers)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

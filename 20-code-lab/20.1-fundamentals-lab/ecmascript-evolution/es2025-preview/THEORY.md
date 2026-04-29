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

Promise.try(() => riskyOperation()).catch(handleError);

// === Stage 3: Decorators（需 Babel/TS 实验标志）===
function logged(target, context) {
  return function (...args) {
    console.log(`Calling ${context.name}`);
    return target.apply(this, args);
  };
}

class MathUtil {
  @logged
  add(a, b) {
    return a + b;
  }
}

// === Stage 3: Temporal（需 polyfill）===
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
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Stage 3 等于可生产使用 | Stage 3 规范仍可能微调，关键系统应等 Stage 4 |
| 所有引擎同时实现 Stage 4 | 各引擎发布节奏不同，需查 compat-table |
| Decorators 旧语法仍可用 | TC39 Decorators 与 TypeScript `experimentalDecorators` 不兼容 |

### 3.3 扩展阅读

- [TC39 Proposals Repository](https://github.com/tc39/proposals)
- [ECMAScript Compat Table](https://compat-table.github.io/compat-table/es2016plus/)
- [Can I use: JavaScript](https://caniuse.com/?cats=JS)
- [MDN: JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey News](https://spidermonkey.dev/)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

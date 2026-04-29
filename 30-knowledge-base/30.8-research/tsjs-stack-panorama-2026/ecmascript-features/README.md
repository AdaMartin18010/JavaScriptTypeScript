# ECMAScript Features Research (2024–2026)

> **路径**: `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ecmascript-features/`
> **状态**: 📂 目录索引 + 深度研究
> **生成时间**: 2026-04-28
> **权威来源**: [TC39 Proposals](https://github.com/tc39/proposals) | [ECMA-262 Spec](https://tc39.es/ecma262/) | [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 概述

此目录汇总 ECMAScript 2024–2026 的语言特性演进，涵盖已发布的 ES15 (ES2024)、ES16 (ES2025) 以及 Stage 3 候选特性。重点跟踪对 TypeScript/JavaScript 工程实践影响最大的语法、内置对象与 API 变更。

---

## 特性全景表 (2024–2026)

| 版本 | 年份 | 特性 | Stage | 工程影响 | 类型系统兼容性 |
|------|------|------|-------|----------|----------------|
| ES2024 (ES15) | 2024 | `Array.prototype.toSorted` / `toReversed` / `toSpliced` / `with` | 已发布 | ⭐⭐⭐ 不可变数组操作范式 | TS 5.3+ 完整支持 |
| ES2024 (ES15) | 2024 | `Array.prototype.groupBy` → `Map.groupBy` / `Object.groupBy` | 已发布 | ⭐⭐⭐ 数据聚合标准化 | TS 5.4+ 完整支持 |
| ES2024 (ES15) | 2024 | `Promise.withResolvers()` | 已发布 | ⭐⭐ 简化 Deferred 模式 | TS 5.3+ 完整支持 |
| ES2024 (ES15) | 2024 | `Atomics.waitAsync` | 已发布 | ⭐⭐ SharedArrayBuffer 异步锁 | TS 5.3+ 完整支持 |
| ES2024 (ES15) | 2024 | 正则表达式 `v` flag + 集合运算 | 已发布 | ⭐⭐ 复杂 Unicode 匹配 | TS 5.3+ 完整支持 |
| ES2025 (ES16) | 2025 | `Set.prototype.union` / `intersection` / `difference` / `symmetricDifference` | 已发布 | ⭐⭐⭐ 集合运算原生支持 | TS 5.6+ 完整支持 |
| ES2025 (ES16) | 2025 | `Set.prototype.isSubsetOf` / `isSupersetOf` / `isDisjointFrom` | 已发布 | ⭐⭐⭐ 集合关系判断 | TS 5.6+ 完整支持 |
| ES2025 (ES16) | 2025 | `Iterator.prototype` 助手 (map/filter/take/drop/flatMap/reduce/toArray/forEach/some/every/find/from) | 已发布 | ⭐⭐⭐ 惰性迭代器链式操作 | TS 5.6+ 完整支持 |
| ES2025 (ES16) | 2025 | `Object.prototype.toString` 结构化克隆支持 | 已发布 | ⭐⭐ 深拷贝语义对齐 | TS 5.6+ 完整支持 |
| ES2025 (ES16) | 2025 | 显式资源管理: `using` / `await using` | 已发布 | ⭐⭐⭐⭐ 替代 try-finally 的确定性析构 | TS 5.2+ 实验支持, 5.7+ 稳定 |
| ES2026 (ES17) | 2026 (候选) | `Temporal` API | Stage 3 | ⭐⭐⭐⭐⭐ 替代 Date 的不可变日期时间 | TS 5.7+ `@types/temporal-polyfill` |
| ES2026 (ES17) | 2026 (候选) | 模式匹配 (`match` 表达式) | Stage 2 | ⭐⭐⭐⭐ 声明式结构化解构 | 暂无原生 TS 支持 |
| ES2026 (ES17) | 2026 (候选) | 记录与元组 (`#{ }` / `#[ ]`) | Stage 2 | ⭐⭐⭐⭐ 深度不可变数据结构 | 暂无原生 TS 支持 |
| ES2026 (ES17) | 2026 (候选) | `Array.prototype.zip` / `zipKeyed` | Stage 2 | ⭐⭐ 数组并行组合 | 暂无原生 TS 支持 |
| ES2026 (ES17) | 2026 (候选) | 装饰器元数据 (`Symbol.metadata`) | Stage 3 | ⭐⭐⭐ DI 框架与序列化 | TS 5.2+ 实验支持 |

> 📌 **Stage 定义**: Stage 0 (Strawperson) → Stage 1 (Proposal) → Stage 2 (Draft) → Stage 3 (Candidate) → Stage 4 (Finished)

---

## 代码示例

### 1. Set 方法 (ES2025)

```javascript
const frontend = new Set(['React', 'Vue', 'Angular']);
const backend  = new Set(['Node', 'Deno', 'Bun']);
const fullstack = new Set(['React', 'Node', 'Vue']);

// 并集
frontend.union(backend);
// Set(6) { 'React', 'Vue', 'Angular', 'Node', 'Deno', 'Bun' }

// 交集
fullstack.intersection(frontend);
// Set(2) { 'React', 'Vue' }

// 差集
frontend.difference(fullstack);
// Set(1) { 'Angular' }

// 对称差集
frontend.symmetricDifference(backend);
// Set(6) { 'React', 'Vue', 'Angular', 'Node', 'Deno', 'Bun' }

// 子集/超集判断
fullstack.isSupersetOf(new Set(['React']));
// true

// 惰性迭代器助手 (ES2025 Iterator helpers)
const iter = [1, 2, 3, 4, 5]
  .values()
  .map(x => x * 2)
  .filter(x => x > 4)
  .take(2)
  .toArray();
// [6, 8]
```

### 2. Temporal API (ES2026 Stage 3)

```javascript
// 当前时代: 必须使用 new Date() 或 moment/dayjs 等库
const now = new Date();
now.setMonth(now.getMonth() + 1); // 可变, 易出错, 时区混乱

// Temporal 时代 (polyfill: @js-temporal/polyfill)
import { Temporal } from '@js-temporal/polyfill';

// 纯日期 (无时区)
const date = Temporal.PlainDate.from('2026-04-28');
const nextMonth = date.add({ months: 1 }); // 2026-05-28, 不可变

// 日期时间 (无时区)
const dt = Temporal.PlainDateTime.from('2026-04-28T14:30:00');
const rounded = dt.round({ smallestUnit: 'hour' });

// 带时区的绝对时间
const zdt = Temporal.ZonedDateTime.from('2026-04-28T14:30:00+08:00[Asia/Shanghai]');
const instant = zdt.toInstant(); // 转换为 UTC 绝对时间

// 时长计算
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });
const later = zdt.add(duration);

// 日历敏感操作
const plainDate = Temporal.PlainDate.from({ year: 2026, month: 2, day: 28 });
plainDate.add({ days: 1 }); // 2026-03-01 (自动处理闰年/月份天数)
```

### 3. 显式资源管理 (ES2025 `using`)

```typescript
// 旧方式: 手动释放资源
const file = await openFile('data.txt');
try {
  await process(file);
} finally {
  await file.close();
}

// 新方式: 确定性析构 (ES2025)
{
  await using file = await openFile('data.txt');
  await process(file); // 离开块作用域时自动调用 file[Symbol.dispose]()
}

// async 资源清理
async function handler() {
  await using conn = await dbPool.acquire();
  await using tx = await conn.beginTransaction();
  await tx.execute('UPDATE users SET ...');
  // 自动 commit 或 rollback + 连接释放
}
```

---

## TC39 提案追踪链接

| 特性 | 提案仓库 | 类型定义 |
|------|----------|----------|
| Set 方法 | [tc39/proposal-set-methods](https://github.com/tc39/proposal-set-methods) | [lib.es2025.collection.d.ts](https://github.com/microsoft/TypeScript/blob/main/src/lib/es2025.collection.d.ts) |
| Iterator 助手 | [tc39/proposal-iterator-helpers](https://github.com/tc39/proposal-iterator-helpers) | [lib.es2025.iterable.d.ts](https://github.com/microsoft/TypeScript/blob/main/src/lib/es2025.iterable.d.ts) |
| 显式资源管理 | [tc39/proposal-explicit-resource-management](https://github.com/tc39/proposal-explicit-resource-management) | TS `using` 关键字原生支持 |
| Temporal | [tc39/proposal-temporal](https://github.com/tc39/proposal-temporal) | [`@types/temporal-polyfill`](https://www.npmjs.com/package/@js-temporal/polyfill) |
| 装饰器元数据 | [tc39/proposal-decorator-metadata](https://github.com/tc39/proposal-decorator-metadata) | TS 5.2+ `experimentalDecorators` 弃用, 标准装饰器支持 |
| 模式匹配 | [tc39/proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching) | 暂无 |
| 记录与元组 | [tc39/proposal-record-tuple](https://github.com/tc39/proposal-record-tuple) | 暂无 |
| Promise.withResolvers | [tc39/proposal-promise-with-resolvers](https://github.com/tc39/proposal-promise-with-resolvers) | TS 5.3+ 内置 |
| Array 不可变方法 | [tc39/proposal-change-array-by-copy](https://github.com/tc39/proposal-change-array-by-copy) | TS 5.3+ 内置 |
| groupBy | [tc39/proposal-array-grouping](https://github.com/tc39/proposal-array-grouping) | TS 5.4+ 内置 |

---

## 演进趋势分析

1. **不可变性优先**: `toSorted`, `toReversed`, `Temporal` 均遵循不可变设计哲学，减少副作用型 Bug。
2. **函数式迭代器**: Iterator helpers 引入惰性求值，为大规模数据处理提供内存友好方案。
3. **确定性资源管理**: `using` 填补了 JS/TS 在 RAII 模式上的空白，对数据库连接、文件句柄管理至关重要。
4. **Date 的终结**: `Temporal` 提供纳秒精度、时区安全、日历感知的能力，预计 2026–2027 进入 Stage 4。
5. **集合运算标准化**: Set 方法填补了数学集合论在标准库中的空白，减少 lodash/underscore 依赖。

---

*目录索引 + 深度研究。自动生成于 2026-04-28，人工增强于 2026-04-29。*

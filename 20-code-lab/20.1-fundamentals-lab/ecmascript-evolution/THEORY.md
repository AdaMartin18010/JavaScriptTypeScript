# ECMAScript 演进史 — 理论基础

## 1. ES3 → ES5: 标准化基础（1999-2009）

- 严格模式（"use strict"）
- JSON 原生支持
- Object.defineProperty
- Array.prototype 方法（forEach、map、filter、reduce）

## 2. ES2015 (ES6): 语言革命（2015）

最大规模的单次更新：

- `let` / `const`: 块级作用域
- 箭头函数: 词法 this
- 类（class）: 语法糖包装原型继承
- 模块（import/export）: 标准化模块系统
- Promise: 异步编程基础
- 解构、展开运算符、模板字符串、默认参数
- Proxy / Reflect: 元编程能力

## 3. ES2017: 异步里程碑

- `async` / `await`: Promise 的语法糖，线性化异步代码
- Object.entries / Object.values / Object.keys
- String padding（padStart / padEnd）

## 4. ES2020-2022: 实用增强

- **ES2020**: BigInt、动态 import、空值合并（??）、可选链（?.）
- **ES2021**: Promise.any、逻辑赋值（||=、&&=、??=）
- **ES2022**: 类私有字段（#private）、类静态块、at() 方法

## 5. ES2024-2026: 前沿特性

- **ES2024**: GroupBy、Promise.withResolvers、Array.prototype.toSorted
- **ES2025**: Set 方法（union/intersection/difference）、正则表达式增强
- **ES2026 (Stage 4)**: Temporal API（现代日期时间）、Math.sumPrecise、Error.isError

## 6. 版本特性矩阵

| 版本 | 年份 | 核心特性 | 影响力 |
|------|------|----------|--------|
| ES3 | 1999 | 基础语法 | 历史基准 |
| ES5 | 2009 | 严格模式、JSON、Object.defineProperty | ★★★☆☆ |
| ES2015 | 2015 | let/const、类、模块、Promise、Proxy | ★★★★★ |
| ES2017 | 2017 | async/await、Object.entries | ★★★★☆ |
| ES2020 | 2020 | 可选链、空值合并、BigInt | ★★★★☆ |
| ES2024 | 2024 | GroupBy、Promise.withResolvers | ★★★☆☆ |
| ES2025 | 2025 | Set 集合方法 | ★★★☆☆ |

## 7. 代码示例：Temporal API（ES2026）

```javascript
// 使用 Temporal 替代有缺陷的 Date API
const now = Temporal.Now.instant();
const date = Temporal.PlainDate.from('2026-04-28');
const time = Temporal.PlainTime.from('14:30:00');

// 时区感知运算
const zoned = now.toZonedDateTimeISO('Asia/Shanghai');
console.log(zoned.toString()); // 2026-04-28T14:30:00+08:00[Asia/Shanghai]

// 持续时间计算
const duration = Temporal.Duration.from({ days: 5, hours: 3 });
const future = date.add(duration);
```

## 8. 提案阶段流程

```
Stage 0（Strawperson）→ Stage 1（Proposal）→ Stage 2（Draft）→ Stage 3（Candidate）→ Stage 4（Finished）
```

## 9. 权威参考

- [ECMA-262 Specification](https://tc39.es/ecma262/) — 官方语言规范
- [MDN — JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Mozilla 开发者网络
- [TC39 Proposals](https://github.com/tc39/proposals) — 官方提案追踪仓库
- [JavaScript Weekly](https://javascriptweekly.com/) — 社区动态周报

## 10. 与相邻模块的关系

- **00-language-core**: JavaScript 核心机制
- **10-fundamentals/10.1-language-semantics**: 语言语义基础
- **56-code-generation**: 新特性的编译与降级

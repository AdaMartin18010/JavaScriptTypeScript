# 03 控制流（Control Flow）

> 条件、循环、异常与异步控制流的完整指南
>
> 文件数：9 | 对齐版本：ECMAScript 2025 (ES16)

---

## 学习路径

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-conditional-statements.md](./01-conditional-statements.md) | if/else、switch、三元运算符 |
| 2 | [02-loop-iterations.md](./02-loop-iterations.md) | 循环与迭代器协议 |
| 3 | [03-exception-handling.md](./03-exception-handling.md) | Error Cause、AggregateError、Result 模式 |
| 4 | [04-short-circuit-logical.md](./04-short-circuit-logical.md) | 短路逻辑运算 |
| 5 | [05-nullish-optional-chaining.md](./05-nullish-optional-chaining.md) | 空值合并与可选链 |
| 6 | [06-generator-iterator-control.md](./06-generator-iterator-control.md) | 生成器与迭代器控制流 |
| 7 | [07-async-control-flow.md](./07-async-control-flow.md) | async/await 编译原理 |
| 8 | [08-using-explicit-resource.md](./08-using-explicit-resource.md) | 显式资源管理 |
| 9 | [09-pattern-matching-future.md](./09-pattern-matching-future.md) | 模式匹配前瞻 |

---

## 核心概念速查

```javascript
// 可迭代协议
const range = {
  from: 1, to: 5,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  }
};

// async 并行
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
```

---

**相关链接**：

- [JSTS全景综述/04_concurrency.md](../JSTS全景综述/04_concurrency.md) — 并发综述

---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 01-ecmascript-evolution

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 ECMAScript 语言规范的版本演进，涵盖从 ES3 到 ES2026 的语言特性变迁。所有内容均围绕 TC39 提案与 ECMA-262 规范展开，不涉及具体框架或运行时的实现差异（除非用于说明语义）。

**非本模块内容**：框架特性、构建工具演进、非标准扩展。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core            → 语法基础
  ├── 01-ecmascript-evolution（本模块）→ 规范演进史
  └── 10-fundamentals/10.1-language-semantics → 语义基础
```

## 子模块目录结构

| 子模块 | 说明 | 关键特性 |
|--------|------|----------|
| `es2015/` | ES6 核心特性实验（let/const、箭头函数、类、模块） | 块级作用域、Promise、模板字符串 |
| `es2016/` | Array.prototype.includes 与指数运算符 | `**`、`.includes()` |
| `es2017/` | 异步函数与 Object 扩展 | `async/await`、Object entries/values |
| `es2018/` | 异步迭代、Rest/Spread、正则增强 | `for-await-of`、命名捕获组 |
| `es2019/` | Array.flat、Object.fromEntries、trimStart/End | 数组扁平化、描述符简化 |
| `es2020/` | 空值合并、可选链、BigInt、动态 import | `??`、`?.`、BigInt、`import()` |
| `es2021/` | Promise.any、逻辑赋值、数字分隔符 | `||=`、`&&=`、`??=`、`|x|n` |
| `es2022/` | 类私有字段、顶层 await、.at() | `#field`、`await` at top-level、`.at()` |
| `es2023/` | Array.findLast、Hashbang 注释 | `.findLast()`、`.findLastIndex()`、shebang |
| `es2024/` | Array.groupBy、Promise.withResolvers | `Map.groupBy`、Atomics.waitAsync |
| `es2025/` | Set 方法、正则表达式修饰符 | `Set.prototype.intersection`、`/v` flag |

## 代码示例

### ES2022 类私有字段与静态块

```typescript
// private-fields.ts — 真正的封装
class SecureCounter {
  #count = 0;              // 私有字段，外部不可访问
  static #instances = 0;    // 私有静态字段

  static {
    // 静态初始化块
    this.#instances = 0;
  }

  increment() {
    this.#count++;
    SecureCounter.#instances++;
    return this;
  }

  get count() {
    return this.#count;
  }

  static get instances() {
    return this.#instances;
  }
}

const c = new SecureCounter();
c.increment();
console.log(c.count);        // 1
// console.log(c.#count);    // ❌ SyntaxError: Private field must be declared
```

### ES2020 可选链与空值合并

```typescript
// nullish-coalescing.ts — 安全访问深层属性
interface User {
  profile?: {
    settings?: {
      theme?: 'light' | 'dark';
    };
  };
}

function getTheme(user: User | null): 'light' | 'dark' {
  // 可选链 (?.) + 空值合并 (??)
  return user?.profile?.settings?.theme ?? 'light';
}

// 与逻辑或 (||) 的区别：仅对 null/undefined 回退，而非所有 falsy 值
const count = response.data.count ?? 0; // 0 不会被覆盖
```

### ES2021 逻辑赋值运算符

```typescript
// logical-assignment.ts — 简洁的条件更新
const config: { timeout?: number; retries?: number } = {};

// 仅当左侧为 falsy 时才赋值
config.timeout ||= 5000;   // 等价于: config.timeout || (config.timeout = 5000)
config.retries ??= 3;      // 等价于: config.retries ?? (config.retries = 3)

// 与 &&= 结合用于条件清空
let cache: Map<string, any> | null = new Map();
cache &&= null; // 仅当 cache 存在时才置空
```

### ES2023 Array.findLast

```typescript
// find-last.ts — 从尾部搜索
const logs = [
  { level: 'info', msg: 'start' },
  { level: 'error', msg: 'db down' },
  { level: 'warn', msg: 'retry' },
  { level: 'error', msg: 'timeout' },
];

// 查找最后一个 error，无需 reverse()
const lastError = logs.findLast(l => l.level === 'error');
console.log(lastError?.msg); // 'timeout'

const lastErrorIndex = logs.findLastIndex(l => l.level === 'error');
console.log(lastErrorIndex); // 3
```

### ES2024 Promise.withResolvers

```typescript
// deferred.ts — 更优雅的手动 resolve
function createDeferred<T>() {
  // 无需外部 let 声明
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  return { promise, resolve, reject };
}

// 用例：将回调 API 包装为 Promise
function readFileAsync(path: string): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  fs.readFile(path, 'utf8', (err, data) => {
    err ? reject(err) : resolve(data);
  });
  return promise;
}
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — JavaScript Guide | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| TC39 Proposals | 仓库 | [github.com/tc39/proposals](https://github.com/tc39/proposals) — 所有阶段提案 |
| ECMA-262 规范 | 规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) — 官方语言规范 |
| ES6 In Depth | 博客 | [hacks.mozilla.org/category/es6-in-depth](https://hacks.mozilla.org/category/es6-in-depth/) — Mozilla 深度系列 |
| Can I use... | 兼容性 | [caniuse.com](https://caniuse.com) — 浏览器特性兼容性矩阵 |
| V8 Blog | 引擎实现 | [v8.dev/blog](https://v8.dev/blog) — Google V8 新特性实现细节 |
| 2ality – JavaScript & more | 博客 | [2ality.com](https://2ality.com/) — Dr. Axel Rauschmayer 的 ECMAScript 深度解析 |
| TC39 Notes | 会议记录 | [github.com/tc39/notes](https://github.com/tc39/notes) — 标准委员会会议记录 |
| State of JS | 调研 | [stateofjs.com](https://stateofjs.com) — 开发者特性采用率调研 |
| Web Platform Tests | 测试套件 | [github.com/web-platform-tests/wpt](https://github.com/web-platform-tests/wpt) — 浏览器一致性测试 |

---

*最后更新: 2026-04-29*

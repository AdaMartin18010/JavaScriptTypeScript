# JS 引擎实现差异

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/js-implementations`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块分析三大主流 JavaScript 引擎——V8（Chrome/Node.js/Edge）、SpiderMonkey（Firefox）、JavaScriptCore（Safari）——在解析、JIT 编译、内存管理与并发模型上的实现差异，以及这些差异对跨平台代码行为的影响。

### 1.2 形式化基础

ECMA-262 规范存在「实现定义行为」（implementation-defined）与「未指定行为」（unspecified）两类自由度。引擎差异主要出现在：
- 正则表达式回溯策略（unspecified）
- 对象属性枚举顺序（ES2020 后已标准化，但历史差异存在）
- `Array.prototype.sort` 算法（实现定义，ES2019 后规定稳定排序）

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| JIT 编译 | 热点字节码动态编译为机器码 | TurboFan (V8), IonMonkey (SM) |
| 隐藏类（Hidden Class） | V8 基于对象形状的内联缓存机制 | 属性访问优化 |
| 分代 GC | 按对象存活周期分区回收 | 新生代/老生代 |
| JITless 模式 | 纯解释执行，用于 iOS 等受限环境 | JSC Interpreter |

---

## 二、设计原理

### 2.1 为什么存在

不同引擎面向不同约束优化：V8 追求峰值吞吐与启动速度平衡；SpiderMonkey 强调标准合规与基线性能；JSC 针对 Apple 生态的功耗与内存做深度优化。理解差异是编写高性能跨平台代码的前提。

### 2.2 引擎对比表

| 维度 | V8 | SpiderMonkey | JavaScriptCore |
|------|-----|-------------|----------------|
| 所属组织 | Google | Mozilla | Apple |
| 主要产品 | Chrome, Node.js, Edge | Firefox | Safari |
| 解析器 | Ignition (字节码) | BinAST / JS 前端 | LLInt / Parser |
| JIT 编译器 | TurboFan | WarpMonkey / IonMonkey | DFG / FTL (B3) |
| 隐藏类/形状 | ✅ Map transitions | ✅ Shape trees | ✅ Structure IDs |
| GC 策略 | 并发标记、并行清理 | 增量 GC | Riptide (并发) |
| 尾调用优化 | 实现中 | ✅ | ✅ |
| BigInt 实现 | 自定义库 | 自定义库 | LibTomMath |
| 启动模式 | 编译为主 | 解释+编译 | LLInt → DFG → FTL |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 特性检测 (`in`/`typeof`) | 精准适配 | 运行时开销极小 | 功能渐进增强 |
| 用户代理嗅探 | 简单 | 不可靠、易过时 | 仅用于遥测 |
| 基准测试驱动优化 | 针对真实瓶颈 | 需多引擎验证 | 性能敏感算法 |

---

## 三、实践映射

### 3.1 引擎差异检测与兼容

```js
// === 特性检测优于 UA 嗅探 ===
function hasStableSort() {
  // ES2019 后所有主流引擎已实现稳定排序
  // 但仍可通过特征检测确认
  const arr = [
    { k: 'a', v: 1 },
    { k: 'b', v: 1 },
    { k: 'c', v: 1 },
  ];
  arr.sort((x, y) => x.v - y.v);
  return arr.map(x => x.k).join('') === 'abc';
}

// === 正则性能差异处理 ===
// 不同引擎对复杂正则的回溯策略不同
function safeTest(pattern, input, timeoutMs = 100) {
  // 使用 Worker 或 Atomics 避免主线程 ReDoS
  if (typeof Worker !== 'undefined') {
    return new Promise((resolve) => {
      const blob = new Blob([
        `self.onmessage = e => {
          const re = new RegExp(e.data.pattern, e.data.flags);
          const start = performance.now();
          try {
            const result = re.test(e.data.input);
            self.postMessage({ result, time: performance.now() - start });
          } catch (err) {
            self.postMessage({ error: err.message });
          }
        };`
      ], { type: 'text/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      const timer = setTimeout(() => {
        worker.terminate();
        resolve({ error: 'Regex timeout' });
      }, timeoutMs);
      worker.onmessage = (e) => {
        clearTimeout(timer);
        resolve(e.data);
      };
      worker.postMessage({ pattern: pattern.source, flags: pattern.flags, input });
    });
  }
  return Promise.resolve({ result: pattern.test(input) });
}
```

### 3.2 引擎优化友好代码

```js
// === V8 / JSC / SpiderMonkey 通用优化：单态性 ===
// 避免在热路径中改变对象形状
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // 不要在这里动态添加/删除属性
  }
}

function distance(a, b) {
  // 所有引擎都能为固定形状的对象做内联缓存
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 预热后多引擎均能快速执行
const p1 = new Point(0, 0);
const p2 = new Point(3, 4);
for (let i = 0; i < 1e6; i++) distance(p1, p2);
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 所有引擎对同一代码产生相同结果 | 边界条件（如 Date.parse 格式、正则回溯）存在差异 |
| 性能优化只需关注 V8 | Safari 移动端份额巨大，JSC 性能模型与 V8 不同 |
| `typeof null === 'object'` 是引擎 Bug | 这是语言规范定义的行为，所有引擎一致实现 |

### 3.4 扩展阅读

- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey Documentation](https://spidermonkey.dev/)
- [JavaScriptCore Wiki](https://trac.webkit.org/wiki/JavaScriptCore)
- [ECMA-262 Specification](https://tc39.es/ecma262/)
- [JS Engine Comparisons (Mathias Bynens)](https://mathiasbynens.be/notes/shapes-ics)
- [ECMAScript Compat Table](https://compat-table.github.io/compat-table/es2016plus/)
- `30-knowledge-base/30.2-runtimes`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

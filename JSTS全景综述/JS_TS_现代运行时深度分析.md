# JS/TS 现代运行时深度分析

> 面向研究者与高级开发者的实现原理与性能剖析

---

## 引言：为什么需要理解运行时？

JavaScript（以及 TypeScript）作为一门动态语言，其“源码 → 机器行为”的路径比静态语言更加曲折。
代码在运行前几乎没有任何编译时保证，属性可以在运行时随意增删，类型可以在不同调用间剧烈变化。
现代 JS 引擎必须在**极短的启动时间内**完成解析、优化并生成高质量机器码，同时还要处理垃圾回收、模块加载、安全沙箱等复杂任务。

本文从 V8 引擎的编译管线、对象模型、内存管理出发，延伸至模块解析策略与新兴运行时格局，力图呈现一幅 JS/TS 代码如何在现代硬件上高效执行的完整图景。
所有关键论断均标注了权威来源，供读者进一步追溯。

---

## 1. V8 编译管线：从源码到机器码

### 1.1 四层架构概览

Google Chrome 的 V8 引擎采用**分层编译（tiered compilation）**策略，在“编译速度”与“执行速度”之间做动态权衡。
自 2023 年起，V8 的稳定架构包含四个层级 [V8 Blog: Maglev]：

| 层级 | 角色 | 编译速度 | 执行速度 | 典型触发阈值 |
|------|------|----------|----------|--------------|
| **Ignition** | 字节码解释器 | 即时 | ~100× 原生 | 总是最先执行 |
| **Sparkplug** | 非优化基线 JIT | ~10 μs/函数 | 中等 | ~8 次调用 |
| **Maglev** | 快速优化编译器 | ~100 μs/函数 | 较快 | ~500 次调用 |
| **TurboFan** | 激进优化编译器 | ~1 ms/函数 | 接近原生 | ~6000 次调用 |

**Ignition** 将源码编译为平台无关的字节码并直接执行；
它的核心优势是**启动极快、内存占用极低**，同时在解释过程中收集类型反馈（type feedback）与调用频次 [The NodeBook: V8 Engine Intro]。

**Sparkplug** 于 2021 年引入，充当解释器与优化编译器之间的“平滑层”。
它不做任何优化，仅将字节码直译为等价的机器码，从而消除解释器分派开销 [V8 Engine Architecture]。

**Maglev** 于 Chrome 117（2023 年底）上线，是 V8 最新的中层优化编译器；
它填补了 Sparkplug 与 TurboFan 之间巨大的性能鸿沟 [Kaspersky: CVE-2024-4947]。

**TurboFan** 负责为真正“炙热”的代码生成高度特化的机器码，通过激进假设（speculative optimization）实现接近 C++ 的执行效率。

### 1.2 为什么引入 Maglev？

在 Maglev 出现之前，V8 只有 Ignition → TurboFan 两级。
TurboFan 虽然能产出顶尖代码，但编译耗时约 **1 ms/函数**。
对于只运行几百次、几千次的函数，TurboFan 的编译成本往往超过其带来的加速收益，导致这些“温热”代码长期停留在解释器或 Sparkplug 层级，形成明显的性能断崖 [Digital Thrive: V8 Compiler Efficiency]。

Maglev 的设计哲学是 **“足够好的代码，足够快的编译”**：

- 编译速度约为 TurboFan 的 **10 倍**（约 100 μs/函数）
- 生成代码质量约为 Sparkplug 的 **2 倍**
- 执行阈值约为 **500 次调用**，远低于 TurboFan 的 ~6000 次 [V8 Engine Architecture]

V8 团队公布的基准测试数据显示，Maglev 上线后：

- JetStream 2 整体提升 **+8.2%**
- Speedometer 2 提升 **+6%**
- 能耗下降 **-10%** [V8 Engine Architecture]

### 1.3 Maglev 与 TurboFan 的技术取舍

| 维度 | Maglev | TurboFan |
|------|--------|----------|
| **IR 形式** | 传统 SSA + CFG（控制流图） | Sea of Nodes（图调度） |
| **编译速度** | 极快（~100 μs） | 较慢（~1 ms） |
| **峰值性能** | 高，但非极限 | 接近原生 |
| **优化深度** | 常量折叠、死码消除、类型特化、有限内联 | 循环展开、逃逸分析、高级负载消除、全局值编号 |
| **去优化安全** | 有（基于 Frame State） | 有（基于更复杂的 bailout 图） |

V8 团队在选择 Maglev 的 IR 时做了一个值得注意的**逆向决策**：放弃 TurboFan 引以为傲的 Sea of Nodes，回归传统的 Control-Flow Graph。
他们发现，对于 JavaScript 这种副作用极其密集的语言，Sea of Nodes 的理论优势并未在实践中兑现——大多数节点最终仍然被效果链串在一起，图调度的复杂度反而拖慢了编译速度 [V8 Engine Architecture]。

这一决策带来了多重收益：

- 更快的编译（无需复杂图调度）
- 更易调试的线性控制流
- 可直接应用教科书级编译器技术

### 1.4 Turboshaft 与未来演进

TurboFan 的 Sea of Nodes 后端正逐步被 **Turboshaft** 取代。
Turboshaft 同样采用 CFG-based IR，实验数据显示其编译速度比 Sea of Nodes 快 **2 倍**，L1 缓存未命中减少 **3–7 倍** [OpZero: Chrome Exploitation]。

更远期的 **Turbolev** 项目（截至 2025 年仍在开发）计划将 Maglev 的 CFG IR 直接输入 Turboshaft 后端，
从而**用同一套 pipeline 取代现有的 Maglev + TurboFan 分立架构**，进一步简化编译器并提升维护性 [V8 Engine Architecture]。

### 1.5 Turbolev 与编译器栈未来

**Turbolev** 是 V8 团队正在开发的下一代顶层编译器，其设计目标是在不远的未来**彻底取代 TurboFan** [V8 Blog: Turbolev][V8 Security Analysis 2026]。
从架构上看，Turbolev 并非从零开始的新编译器，而是**Maglev 前端（CFG-based SSA）与 Turboshaft 后端的深度整合**：它直接复用 Maglev 生成的传统控制流图（Control-Flow Graph, CFG）作为中间表示，并输入到 Turboshaft 的机器代码生成后端中。

这意味着 V8 的顶层编译器将彻底告别 TurboFan 引以为傲的 **Sea of Nodes** 架构，全面回归传统的 **CFG + SSA** 范式。
Sea of Nodes 虽然理论上允许更激进的全局调度与优化，但在 JavaScript 这种副作用密集、去优化频繁的语言中，其图调度的复杂度和内存开销并未带来预期的收益，反而成为了安全审计与编译器维护的沉重负担 [V8 Security Analysis 2026]。
Turbolev 的决策与 Maglev 当初放弃 Sea of Nodes 的动因一脉相承：通过更线性、更可预测的控制流结构，换取更快的编译速度、更低的内存占用以及更易于形式化验证的编译器栈。

在 V8 的实验性 flag 定义与 pipeline 描述中，Turbolev 被定位为一个统一的顶层优化编译器。
它既承担当前 TurboFan 的激进优化职责，又与 Maglev 共享同一套 IR，从而消除了 Maglev → TurboFan 升级路径中因 IR 转换带来的信息丢失与编译延迟。
一旦 Turbolev 成熟，V8 的编译管线有望简化为 **Ignition → Sparkplug →（统一优化编译器）** 的三层甚至两层架构，进一步缩短温热代码到达峰值性能的路径。

---

## 2. 对象模型：Hidden Classes、Shapes 与 Inline Caching

### 2.1 从动态对象到固定偏移

JavaScript 对象在语言层面是高度动态的：属性可以运行时增删、顺序可以任意变化。
如果引擎真的每次都做哈希查找，属性访问将无法与静态语言竞争。

V8 的核心洞察是：**虽然单个对象很灵活，但程序实际创建的对象种类（形状）非常有限**。
基于此，V8 引入了 **Hidden Classes**（内部称为 **Maps**）来描述对象的“形状”（Shape）——即有哪些属性、属性的可配置性/可写性、以及每个属性在对象内存中的偏移量 [V8 Dev: Hidden Classes]。

> **术语澄清**：学术文献常称 Hidden Classes；V8 内部源码称 Maps；SpiderMonkey 称 Shapes；JavaScriptCore 称 Structures。
> 本文在讨论 V8 实现时用 **Map**，在讨论通用概念时用 **Shape** [Mathias Bynens: Shapes and ICs]。

### 2.2 Shape 转换链

当对象按固定顺序添加属性时，V8 会构建一条**转换链（transition chain）**。考虑以下代码：

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
```

执行过程产生的 Map 转换如下 [Richard Artoul: Hidden Classes]：

1. `C0`：空 Map（`this` 尚未赋值任何属性）
2. `C1`：添加属性 `x`，偏移量为 `+0`。V8 在 `C0` 上记录转换边：`+x → C1`
3. `C2`：在已有 `x` 的基础上添加 `y`，偏移量为 `+1`。V8 在 `C1` 上记录转换边：`+y → C2`

由于 `p1` 和 `p2` 都遵循 **相同的属性添加顺序**，它们最终共享同一个 Hidden Class `C2`。这意味着：

- `{x: 1}` 与 `{x: 2}` 共享同一个 Shape（属性结构相同，只是值不同）
- `{x: 1}` 与 `{x: 1, y: 2}` **不共享** Shape，后者需要沿转换链前进到 `C2`

**关键推论**：

- `{x: 1}` 和 `{y: 1}` 也**不共享** Shape，因为属性名和顺序不同，V8 会创建完全不同的转换分支 [Dev.to: Hidden Classes Performance Secret]。

### 2.3 为什么 `{x:1}` 与 `{x:2}` 可以共享 Shape？

Shape/Map 只描述**元数据**（属性名、属性描述符、偏移量），不存储具体的属性值。
对象本身的内存布局像是一个“值数组”，而 Shape 像是一张“模式表”：

```
p1 的内存: [ MapPointer=C2 ][ 1 (x) ][ 2 (y) ]
p2 的内存: [ MapPointer=C2 ][ 3 (x) ][ 4 (y) ]
```

只要 `MapPointer` 相同，引擎就知道 `x` 在偏移 `+0`、`y` 在偏移 `+1`，从而把动态属性访问转化为**固定偏移的内存加载**。

### 2.4 Inline Caching（IC）：将 Shape 知识固化到代码中

Inline Cache 是连接 Hidden Classes 与实际执行速度的关键机制。
它的核心思想是：**在某一个具体的属性访问“调用点”（call site），对象形状往往非常稳定** [The NodeBook: Inline Caching]。

考虑：

```js
function getX(obj) {
  return obj.x; // 这是一个唯一的 call site
}
```

第一次执行时，引擎必须做完整查找：获取 Hidden Class → 扫描 DescriptorArray → 找到 `x` 的偏移 → 读取值。
做完这些后，V8 会在该 call site 处重写一段微型机器码（即 Inline Cache），记录：

- 观察到的 Map 地址
- 属性偏移量

下次再执行到这一行时，IC 只做一件事：**比较对象的 Map 指针是否与缓存的一致**。
如果一致，直接按偏移量读取；
如果不一致，则进入降级路径 [Frontend Almanac: Inline Caches]。

### 2.5 IC 的四种状态

| 状态 | 含义 | 优化可行性 |
|------|------|------------|
| **Uninitialized** | 尚未执行过 | 无 |
| **Monomorphic** | 只见过 **1 种** Shape | **最优**，生成单条 Map Check + 直接读取 |
| **Polymorphic** | 见过 **2–4 种** Shape | 尚可，生成线性链式检查 |
| **Megamorphic** | 见过 **>4 种** Shape | **放弃优化**，回退到慢速字典查找 |

Monomorphic 是 JIT 编译器的“黄金状态”。
TurboFan 遇到 monomorphic feedback 时，会生成高度特化的机器码：一条 `cmp` 指令检查 Map， followed by 一条固定偏移的 `mov`。
Polymorphic 仍可优化，但分支预测成本上升。
Megamorphic 则意味着该 call site 对优化编译器基本“不可见”，性能会断崖式下跌 [V8 Engine Architecture]。

### 2.6 性能悬崖：Shape 爆炸

开发者在热路径上容易无意识地制造 Shape 爆炸：

```js
// Bad: 条件性添加属性 → 两种可能 Shape
const user = { name: "Alice" };
if (isAdmin) {
  user.permissions = ["..."];
}

// Good: 始终初始化所有属性 → 单一稳定 Shape
const user = {
  name: "Alice",
  permissions: null,
};
if (isAdmin) {
  user.permissions = ["..."];
}
```

另一个常见陷阱是 **`delete`** 操作。
删除属性会迫使对象从 Fast Properties 降级为 **Dictionary Mode（Slow Properties）**，此时 Hidden Class 被替换为一个固定空 DescriptorArray 的 Map，所有属性都存储在自包含字典中，IC 完全失效 [Xia0.sh: Map Exploitation in V8]。

> **Fast in-object properties**：直接内嵌在对象内存中的快速属性，数量有限。
> **Fast properties**：存于独立属性数组，仍可通过索引快速访问。
> **Slow properties**：字典模式，IC 失效，访问显著变慢 [Xia0.sh: Map Exploitation]。

---

## 3. 内存管理：Orinoco GC 的分代策略与并发标记

### 3.1 Orinoco 的设计目标

V8 的垃圾回收器代号为 **Orinoco**，其设计目标是在保持高吞吐的同时，将主线程的**停顿时间（pause time）压到亚毫秒级**，从而不阻塞用户交互与动画渲染 [V8 Blog: Trash Talk]。Orinoco 综合运用了三项核心技术：

- **Parallel GC**：多线程并行执行同一 GC 任务
- **Concurrent GC**：辅助线程与主线程并发执行标记/清理
- **Incremental GC**：将长 GC 周期切分为小段，穿插在 JS 执行间隙

### 3.2 分代假设与堆布局

Orinoco 基于经典的**分代假说（Generational Hypothesis）**：绝大多数对象生命周期极短，只有少量对象能长期存活 [Hannes Payer: V8 GC PLDI 2019]。

V8 的堆分为两大区域：

- **Young Generation（新生代）**：容量上限约 16 MB，采用 **semi-space（半空间）** 设计 [Hannes Payer: V8 GC PLDI 2019]
- **Old Generation（老生代）**：采用 **Mark-Compact** 算法

### 3.3 新生代：Scavenger（半空间复制）

新生代由两个半空间组成：

- **From-Space**：当前活跃的对象分配区
- **To-Space**：GC 期间为空，用于接收存活对象

**Scavenger** 的工作流程如下 [V8 Blog: Trash Talk]：

1. **标记并复制（Mark & Evacuate）**：从根（调用栈、全局对象、Old-to-New 引用）出发，找到所有可达的年轻对象，将其复制到 To-Space。复制过程本身就是**压缩**，彻底消除了碎片。
2. **晋升（Promotion）**：若对象已经历过一轮 Scavenge（即“中间代”对象），则直接晋升到老生代，而非 To-Space。
3. **指针更新（Pointer Updating）**：所有指向被移动对象的引用都需要更新为新的地址。V8 在旧地址留下一个**转发地址（forwarding address）**。
4. **空间交换**：GC 完成后，To-Space 变为新的 From-Space，原 From-Space 清空待命。

现代的 V8 使用 **Parallel Scavenger**：将扫描、复制、指针更新工作分派到多个辅助线程与主线程并行执行。根据 V8 官方数据，这已将新生代 GC 的主线程总时间减少了 **20%–50%** [V8 Blog: Trash Talk]。

### 3.4 老生代：Major GC（Mark-Compact）

当老生代接近动态计算的上限时，Major GC 启动。它分为三个阶段：

#### 3.4.1 标记（Marking）

从根对象出发，遍历整个堆图，标记所有存活对象。Orinoco 采用**三色标记法（Tri-color Marking）** [Juejin: V8 GC Deep Dive]：

- **White**：尚未访问，GC 结束时仍为 White 的对象即为垃圾
- **Gray**：已访问，但其引用的子对象尚未完全扫描
- **Black**：已访问，且所有子对象均已扫描完毕，确定为存活

为了最小化主线程停顿，Orinoco 的标记阶段以**并发标记（Concurrent Marking）**为主：

- 当堆接近阈值时，启动多个后台辅助线程
- 辅助线程在 JavaScript 主线程**继续执行的同时**，独立进行图遍历和标记
- 主线程仅需在标记开始和结束时做极短的同步工作 [V8 Blog: Trash Talk]

#### 3.4.2 并发标记的正确性：写屏障（Write Barrier）

并发标记的最大挑战是：**JS 主线程可能在辅助线程标记期间修改对象引用**，从而引入“漏标”或“误标”。

V8 通过**写屏障（Write Barrier）**解决此问题。当主线程写入对象引用时，写屏障会检查：

- 若写入操作创建了一个从 **Black 对象 → White 对象** 的新引用，则将该 Black 对象重新标记为 Gray，或将被引用的 White 对象加入辅助线程的待处理队列。这确保了三色不变性（tri-color invariant）不会被破坏 [Juejin: V8 GC Deep Dive]。

#### 3.4.3 清除与压缩（Sweeping & Compaction）

标记完成后，未被标记的对象即为垃圾。清除操作可以由辅助线程**并发执行**，将空闲内存块挂入空闲链表（free list），不阻塞主线程 [Leapcell: V8 Memory Management]。

压缩（Compaction）则相对复杂：它将存活对象移动到连续的内存区域，进一步消除碎片。由于需要更新所有指向移动后对象的指针，压缩阶段采用**并行压缩（Parallel Compaction）**：主线程与多个辅助线程共同参与对象迁移和指针更新 [V8 Blog: Trash Talk]。

并非所有老生代页都适合压缩，那些不适合的页会退化为并发清除。

### 3.5 空闲时间 GC（Idle-Time GC）

V8 还会利用浏览器的空闲时段主动执行 GC 工作。以 Gmail 为例，Idle-Time GC 在页面空闲时可将 JavaScript 堆内存减少 **45%** [V8 Blog: Trash Talk]。

---


## 4. 模块系统解析：从 `require()` 到 ESM 再到 TS 的模块解析策略

### 4.1 CommonJS（CJS）：同步运行时解析

Node.js 早期的模块系统 **CommonJS（CJS）** 采用完全同步的运行时模型：

```js
const fs = require('fs');
module.exports = { readFile };
```

CJS 的解析与执行是**原子化**的：当 `require('xxx')` 被调用时，Node.js 会：

1. 根据模块标识符进行路径解析（`node_modules` 查找、`.js`/`.json`/`.node` 扩展名补全）
2. 读取文件内容
3. 用函数包裹模块代码并立即执行
4. 将 `module.exports` 的结果缓存并返回

这意味着 CJS 的依赖图是在**运行时动态构建**的，模块加载顺序由执行流决定，允许条件加载和循环依赖（通过部分执行的 `module.exports` 解决）[TypeScript Handbook: ESM-CJS Interop]。

### 4.2 ES Modules（ESM）：静态解析与实例化的两阶段模型

ESM 的设计哲学与 CJS 截然不同。ECMAScript 规范将模块加载划分为三个严格阶段 [Node.js Docs: ESM]：

1. **构造（Construction）/ 解析（Parsing）**：
   - 从入口模块出发，递归解析所有 `import` 语句
   - 构建静态依赖图（module graph），但不执行任何模块代码
   - 下载/读取模块源码

2. **实例化（Instantiation）**：
   - 为每个模块创建模块环境记录（Module Environment Record）
   - 分配内存空间给所有 `export` 声明的绑定（bindings），但尚未赋值
   - 将 `import` 与对应的 `export` 绑定**链接**起来，建立 Live Binding（活绑定）

3. **求值（Evaluation）**：
   - 按后序遍历（post-order）顺序执行模块代码
   - 由于 `import` 是活绑定，对 `export` 变量的修改会实时反映到导入方

ESM 的关键约束在于**静态性**：

- `import`/`export` 必须出现在顶层作用域
- 模块路径必须是字符串字面量（不能动态计算）
- 这允许引擎在运行前完成树摇（tree-shaking）和作用域分析

### 4.3 CJS 与 ESM 的互操作鸿沟

由于两套模型根本不同，互操作长期以来是 Node.js 生态的痛点：

- **ESM 导入 CJS**：Node.js 会将 CJS 的 `module.exports` 整体作为 ESM 的 **default export**。对于命名导出，Node.js 会尝试通过**句法分析（syntactic analysis）**在代码执行前合成命名导出，但如果导出是动态计算的（如 `exports["worl" + "d"] = ...`），则命名导出将缺失 [TypeScript Handbook: ESM-CJS Interop]。

- **CJS 导入 ESM**：在 Node.js 22.12.0 之前，`require()` 遇到真正的 ESM 模块会直接抛出 `ERR_REQUIRE_ESM`。因为 ESM 的 `top-level await` 本质上是异步的，而 `require()` 是同步 API [Appsignal Blog: CJS and ESM in Node.js]。

### 4.4 Node.js 22+ 的 `require(ESM)` 突破

Node.js 22.12.0（LTS 版本）起，**`require()` 可以同步加载不含 top-level await 的 ESM 模块**，且无需实验性标志 [Vercel Changelog: Node.js 22 LTS]。这是 Node.js 模块系统演进中最具标志性的修复之一。

```js
// math-utils.mjs
export function square(x) { return x ** 2; }

// main.js (CommonJS)
const math = require('./math-utils.mjs'); // ✅ Node 22.12+
console.log(math.square(3)); // 9
```

**限制条件** [PkgPulse: Node.js 22 vs 20]：

- ESM 模块必须**完全同步**（无 top-level `await`）
- 模块必须显式标记为 ESM（`"type": "module"` 或 `.mjs` 扩展名）
- 若使用 default export，需通过 `require(...).default` 访问

如果尝试 `require()` 一个包含 top-level await 的 ESM，Node.js 会抛出 `ERR_REQUIRE_ASYNC_MODULE` 并提示改用 `await import()` [WebDeveloper Beehiiv: Native CJS/ESM Interop]。

### 4.5 TypeScript 的 `moduleResolution` 策略

TypeScript 编译器在解析模块时，必须预判**输出后的 JavaScript 在目标运行时中如何被解析**。因此，`moduleResolution` 选项并非描述 TypeScript 自身的行为，而是描述“从输出文件的角度”应遵循的解析规则 [TypeScript Docs: moduleResolution]。

#### 4.5.1 五种策略概览

| 策略 | 适用场景 | 核心特征 |
|------|----------|----------|
| `node10`（旧称 `node`） | Node.js < v10 | 仅支持 CJS `require()`，无 ESM 意识 |
| `node16` | Node.js 12+ | 同时支持 ESM `import` 与 CJS `require`，根据语法选择不同解析算法 |
| `nodenext` | Node.js 最新版 | 目前行为等同于 `node16`，但总是映射到 Node 的最新解析规则 [Juejin: TS moduleResolution 精讲] |
| `bundler` | 打包工具（Vite、Webpack、esbuild） | 支持 `package.json` 的 `imports`/`exports`，但不要求相对路径显式扩展名 [TypeScript Docs: moduleResolution] |
| `classic` | TS < 1.6 遗留 | 已废弃，TypeScript 6.0 起移除 [Microsoft DevBlog: Announcing TS 6.0] |

#### 4.5.2 `node10` 与 `node16`/`nodenext` 的本质差异

`node10` 模拟的是旧版 Node.js 的解析逻辑：

- 只理解 `require()` 的解析规则
- 不支持 `package.json` 的 `"exports"` 字段
- 无法区分 ESM 与 CJS 的不同加载语义

`node16`/`nodenext` 则引入了**双轨解析**：

- 如果 TypeScript 源代码中使用的是 `import ... from ...`，编译器会模拟 Node.js ESM 的解析算法
- 如果使用的是 `import mod = require("...")` 或代码位于 CJS 输出上下文中，编译器会模拟 Node.js CJS 的解析算法 [Zenn: moduleResolution 详解]

这意味着同一段 TypeScript 代码在 `node16` 下，其对 `"foo"` 的解析结果可能因 `import` 还是 `require` 而不同。

#### 4.5.3 `bundler` 模式的语义与陷阱

`bundler` 是 TypeScript 4.7 引入、5.0 后广泛使用的模式，专为前端打包工具设计。它与 `node16`/`nodenext` 的主要区别在于：

1. **相对路径扩展名**：`bundler` **不要求** `import { foo } from "./foo"` 必须写成 `"./foo.js"`。打包工具会在构建时自动补全扩展名，而 Node.js 原生 ESM 则严格要求显式扩展名 [TypeScript Docs: moduleResolution]。

2. **不支持 `require`**：`bundler` 禁止 `import mod = require("foo")` 语法；在 JS 文件中，`require()` 调用只会被解析为 `any` [GitHub: webhintio/hint]。

3. **条件导出（Conditional Exports）差异**：`bundler` 使用 `"import"` 和 `"default"` 条件读取 `package.json` 的 `exports`；而 `nodenext` 可能根据 CJS/ESM 上下文选择 `"require"` 或 `"import"` [Andrew Branch: Is nodenext right for libraries]。

**重要陷阱**：如果一个库用 `moduleResolution: bundler` 开发，但消费者用 `moduleResolution: nodenext` 消费，那么库中无扩展名的相对导入在声明文件（`.d.ts`）中会原样保留，导致 Node.js 消费者运行时找不到模块 [TypeScript Handbook: Choosing Compiler Options]。因此，官方建议**库作者优先使用 `nodenext`**，以确保输出在 Node.js 原生环境中可用。

### 4.6 Node.js 24 与原生 TypeScript 支持

Node.js 24 于 2026 年 3 月发布，预计同年 10 月进入 LTS，在 TypeScript 支持与模块互操作上迈出了决定性的一步 [Node.js 24 Release Notes]。

#### 4.6.1 `--experimental-strip-types` 默认启用与 Type Stripping 语义

Node.js 24 已将 `--experimental-strip-types` 标志**默认启用**。这意味着开发者可以直接运行 `.ts` 文件，而无需安装 `ts-node`、`tsx` 或任何外部转译器：

```bash
node app.ts
```

然而，必须明确理解其底层机制：**类型剥离（Type Stripping，即 annotation removal）不是 transpilation（转译），而是 annotation removal（注解移除）**。运行时在加载源码时，仅将 TypeScript 类型注解（如 `: string`、`: Promise<T>`）以及仅类型声明（如 `type`、`interface`）从 AST 中删除，其余 JavaScript 语法原封不动地保留。

因此，它**不执行任何语法转换**。任何需要代码生成的 TypeScript 特性都不被支持，包括但不限于：

- `enum`（需要生成反向映射对象）
- `namespace` / `module`（需要生成运行时对象）
- 参数属性（`constructor(public x: string)`，需要生成赋值语句）
- JSX（需要转换为 `React.createElement`）
- 装饰器（需要生成元数据或代理代码）

这一语义与 TypeScript 的 `--erasableSyntaxOnly` 编译选项的理念完全一致：如果一段 TypeScript 代码在 `--erasableSyntaxOnly` 下无法通过编译，那么它也无法在 Node.js 的原生 TypeScript 模式下直接运行 [Node.js 24 Release Notes]。

#### 4.6.2 `--experimental-require-module` 默认启用与 `import.meta.main`

与 `--experimental-strip-types` 一同默认启用的还有 `--experimental-require-module`。这意味着在 Node.js 24 中，CommonJS 的 `require()` 可以直接加载**同步 ESM 图**（即不含 top-level await 的 ESM 模块），无需任何实验性标志 [Node.js 24 Release Notes]。

此外，Node.js 24 还引入了 **`import.meta.main`**，用于检测当前模块是否为主入口点。它与 Deno 的同名属性对齐，为编写可复用的 CLI 模块提供了统一的方式：

```js
if (import.meta.main) {
  main();
}
```

---

## 5. 新运行时格局：Deno、Bun 与 WinterCG 的语义承诺

### 5.1 WinterCG / WinterTC：跨运行时的一致性愿景

#### 5.1.1 从社区组到 Ecma 技术委员会

**WinterCG**（Web-interoperable Runtimes Community Group）成立于 2022 年，是一个 W3C 社区组，旨在为**非浏览器 JavaScript 运行时**（Node.js、Deno、Cloudflare Workers、Bun 等）定义一组统一的 Web API 子集 [W3C Blog: WinterTC]。

2024 年底至 2025 年初，WinterCG 的孵化工作成熟，参与者决定将其升级为 **Ecma International 的 TC55 技术委员会**，正式命名为 **WinterTC** [Ecma International: WinterTC Announcement]。这是 W3C 与 Ecma 在 JavaScript 生态上的又一次深度合作——类似于 TC39 负责 ECMAScript 标准，WinterTC 将负责**服务器端 JavaScript 运行时的 Web 对齐 API 标准** [Igalia: WinterCG becomes WinterTC]。

#### 5.1.2 Minimum Common Web Platform API

WinterCG 最著名的成果是 **Minimum Common Web Platform API**——一份所有宣称“Web-interoperable”的运行时应当实现的最低 API 清单 [Cloudflare Blog: Standards-Compliant Workers API]。该清单包含但不限于：

- `fetch`、`Request`、`Response`、`Headers`
- `URL`、`URLPattern`、`URLSearchParams`
- `ReadableStream`、`WritableStream`、`TransformStream`
- `TextEncoder`、`TextDecoder`、`structuredClone`
- `crypto`、`CryptoKey`、`SubtleCrypto`
- `AbortController`、`AbortSignal`、`EventTarget`
- `setTimeout`/`clearTimeout`、`setInterval`/`clearInterval`、`queueMicrotask`
- `atob`、`btoa`、`console`

WinterTC 的长期目标不仅是列出 API，还包括规范精确的 WebIDL 实现、ESM Host Hooks，以及服务器端特有的扩展（如 Sockets API、CLI API）[Igalia TPAC 2024: WinterCG]。

#### 5.1.3 对开发者的意义

WinterCG/WinterTC 的核心理念是：**让同一段 JavaScript 代码在浏览器、边缘函数、服务器之间尽可能无缝迁移**。例如，如果一个运行时实现了 WinterCG 规范，开发者可以安全地假设 `fetch`、`URL`、`ReadableStream` 的行为与浏览器一致，从而：

- 减少运行时特定的 shim/polyfill
- 降低全栈开发者的认知负担
- 让 SSR、Server Actions、Edge Functions 的代码共享成为可能 [Ecma International: WinterTC Announcement]

### 5.2 Deno：安全优先、Web 标准优先的 V8 运行时

#### 5.2.1 架构与技术栈

Deno 由 Node.js 创始人 Ryan Dahl 发起，核心架构为：

- **JS 引擎**：V8（与 Chrome/Node.js 相同）
- **系统层**：Rust（内存安全、并发模型清晰）
- **异步 IO**：Tokio（Rust 的高性能异步运行时）
- **标准库**：Deno 官方维护的 `https://deno.land/std`，无外部依赖 [Makers' Den: Node to Deno/Bun]

#### 5.2.2 权限模型

Deno 最显著的设计差异是 **“Secure by Default”**。默认情况下，脚本没有任何文件、网络或环境变量访问权限；所有权限必须通过命令行标志显式授予：

```bash
deno run --allow-net --allow-read --allow-env app.ts
```

这一模型使 Deno 特别适合运行**不可信代码**、边缘计算和多租户平台。权限可以被精确到具体路径或域名，并且可以被编码进 CI/CD 流水线进行审计 [Deno vs Bun 2025: Pullflow]。

#### 5.2.3 模块系统与原生 TypeScript

Deno 是**原生 TypeScript** 运行时：`.ts` 文件无需 `tsc` 或任何构建步骤即可直接执行。它采用 **ESM-first** 设计，并支持 **URL imports**：

```ts
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
```

URL imports 消除了 `node_modules` 目录，实现了去中心化的依赖管理。Deno 2.0 后 also 引入了对 npm 包的兼容层，允许直接从 `npm:` 前缀导入包，降低了迁移成本 [GitHub Discussions: Deno team on Bun]。

### 5.3 Bun：Zig 编写、性能优先的 JavaScriptCore 运行时

#### 5.3.1 架构与技术栈

Bun 由 Jarred Sumner 开发，其技术栈与 Node.js/Deno 形成鲜明对比：

- **JS 引擎**：**JavaScriptCore（JSC）**——Apple Safari 的引擎，而非 V8
- **实现语言**：**Zig**——一门强调显式内存管理、零成本抽象的系统级语言
- **一体化工具链**：运行时、包管理器、打包器（bundler）、测试运行器、转译器全部集成在单个二进制文件中 [Bun Official Site]

#### 5.3.2 为什么选择 JavaScriptCore？

Bun 选择 JSC 而非 V8，是基于**使用场景的根本差异** [Juejin: Bun vs Node.js Deep Dive]：

- **启动速度**：V8 为 Chrome 的长期运行场景优化，JIT 预热复杂；JSC 为 Safari 的移动端优化，冷启动极快，特别适合 Serverless/CLI 场景。
- **内存占用**：JSC 的内存分配策略比 V8 更加节俭，容器化部署成本更低。
- **API 可塑性**：JSC 的 C API 相对干净，Bun 团队可以用 Zig 编写极低开销的桥接代码，让 JS 值与 Zig 内存之间的交换接近零拷贝 [CodingMall: Bun Zig JSC Performance]。

#### 5.3.3 一体化工具链与 CJS/ESM 无缝兼容

Bun 的定位是**“drop-in Node.js replacement”**，在兼容 npm 生态的同时提供统一体验：

- **包管理**：`bun install` 声称比 npm 快 10×–100×，得益于全局二进制缓存和优化的系统调用 [BolderApps: Node vs Bun vs Deno]。
- **原生 TS/JSX**：`.ts`、`.tsx`、`.jsx` 均可直接运行，无需额外配置 [Mintlify: Bun Runtime Docs]。
- **CJS/ESM 混用**：Bun 允许在同一个文件中同时使用 `import` 和 `require()`，且原生支持 `.cjs` 和 `.mjs`，解决了 Node.js 中长期存在的模块互操作痛点 [Undb Blog: Why Choose Bun]。
- **内置数据库驱动**：`bun:sqlite` 提供高性能 SQLite 绑定；另有原生 PostgreSQL、MySQL、Redis、S3 驱动 [Bun Official Site]。

### 5.4 三者对比：Node.js、Deno、Bun

| 维度 | Node.js | Deno | Bun |
|------|---------|------|-----|
| **引擎** | V8 | V8 | JavaScriptCore |
| **核心语言** | C++ | Rust | Zig |
| **安全模型** | 无默认沙箱 | 权限优先（`--allow-*`） | 无默认沙箱 |
| **TypeScript** | 需外部转译（或 Node 24+ strip-types） | 原生支持 | 原生支持 |
| **模块系统** | CJS + ESM（历史包袱重） | ESM-first，支持 URL imports | CJS/ESM 无缝混用 |
| **包管理** | npm（外部） | 内置 + URL imports + npm 兼容 | 内置（超高速） |
| **启动速度** | ~150–200 ms | ~100 ms | **< 50 ms** |
| **HTTP 吞吐**（简单服务） | ~25,000 RPS | ~40,000 RPS | **~70,000+ RPS** [Dev.to: Node vs Bun vs Deno 2025] |
| **适用场景** | 成熟生态、 legacy 系统 | 安全关键、边缘计算、Web 标准优先 | 性能关键、一体化工具链、Serverless |

### 5.5 运行时的未来：WinterTC 下的收敛与分化

WinterTC 的成立标志着 JavaScript 运行时生态进入**“规范驱动”**的新阶段：

- **收敛**：所有主要运行时（Node.js、Deno、Bun、Cloudflare Workers）都承诺实现统一的 Web API 子集，全栈代码的可移植性将大幅提升。
- **分化**：在统一 API 之下，各运行时仍将在引擎选择（V8 vs JSC）、安全模型、工具链整合、性能优化路径上持续竞争。

对于开发者而言，这意味着：

- 编写**WinterTC-compliant**的代码可以最大化跨运行时兼容性；
- 在性能敏感场景选择 Bun，在安全敏感场景选择 Deno，在生态兼容场景继续深耕 Node.js；
- TypeScript 的 `moduleResolution: nodenext` 是面向原生 Node.js 与 WinterTC 兼容运行时的最稳健选择。

### 5.6 WebAssembly 前沿：WasmGC

WebAssembly 长期以来被定位为“沙箱化的底层虚拟机”，其类型系统仅支持数值类型（`i32`、`i64`、`f32`、`f64`）与线性内存引用。**WasmGC** 扩展为 WebAssembly 引入了原生的 struct 与 array 类型，并允许这些对象由宿主运行时（如 V8）的垃圾回收器直接管理，从而彻底改变了高级语言编译到 Wasm 的内存模型 [WebAssembly GC Spec]。

#### 5.6.1 GC 类型与 V8 托管

在 WasmGC 之前，将 Java、C#、Kotlin 等托管语言编译到 Wasm 时，必须将自身的 GC 堆**仿真（emulate）**在线性内存中，并通过复杂的导出/导入逻辑与宿主 JS 交互。WasmGC 引入的 `struct` 和 `array` 类型使得 Wasm 模块可以直接分配由 V8 Orinoco GC 托管的对象。这不仅消除了双重 GC 的开销，还允许 Wasm 对象与 JavaScript 对象在相同的堆上共存，大大简化了跨语言对象的生命周期管理。

#### 5.6.2 Canonical Type Index 与 Module Type Index

WasmGC 对类型系统做出的另一项根本性改进是**类型的全局规范化（canonicalization）**。在 WasmGC 中，类型索引分为两个层次 [WebAssembly GC Spec]：

- **Module Type Index**：模块内部的局部类型索引，仅在该模块的上下文中有效。
- **Canonical Type Index**：经过全局规范化后的唯一类型标识符，用于跨模块边界识别和比较类型。

当多个 Wasm 模块共享相同的结构体或函数类型签名时，引擎会将这些类型映射到一个统一的 Canonical Type Index。这确保了跨模块的类型一致性（type equivalence）与类型安全性，是 Wasm 组件模型（Component Model）和跨模块互操作的基础。通过全局 canonicalization，WasmGC 能够在保持模块化隔离的同时，支持安全的子类型化（subtyping）、协变（variance）和递归类型。

#### 5.6.3 对 JS/Wasm 互操作的影响

GC 类型的引入显著提升了 JavaScript 与 WebAssembly 之间的互操作安全性与便利性。在 WasmGC 之前，Wasm 模块暴露给 JS 的只能是线性内存中的裸指针或数值索引；JS 侧必须手动管理内存布局，极易引发悬空指针或内存泄漏。而有了 WasmGC 后，Wasm 模块可以**直接导出结构化的 GC 对象**给 JavaScript，这些对象在 JS 侧表现为普通的对象或数组，其内存由 V8 GC 统一回收。这标志着 WebAssembly 从“沙箱化的汇编”向“可托管语言的通用编译目标”迈出了关键一步。

---

## 结语：从源码到机器行为的认知地图

理解 JS/TS 的运行时，本质上是在回答一个问题：**一门几乎没有任何静态约束的动态语言，如何在高性能硬件上持续进化？**

V8 的答案是：**分层投机（tiered speculation）**——用 Ignition 快速启动，用 Maglev 覆盖温热代码，用 TurboFan 榨干热点代码的每一滴性能；用 Hidden Classes 将动态属性访问转化为固定偏移；用 Inline Caches 把运行时的统计规律固化为机器码；用 Orinoco 将垃圾回收的停顿隐藏到后台线程中。

模块系统与运行时格局的演进则告诉我们：**技术债务（如 CJS/ESM 分裂）可以通过渐进式标准与互操作层逐步弥合**。Node.js 24 的原生 TypeScript 支持、`require(ESM)`、TypeScript 的 `nodenext`、WinterTC 的标准化努力，都是这一弥合过程的体现。

而 Deno 与 Bun 的崛起提醒我们：**运行时竞争远未结束**。不同的设计哲学——安全优先 vs 速度优先、Web 标准对齐 vs 一体化工具链——正在为开发者提供越来越丰富的选择空间。

希望本文能为你在浏览器控制台、Node.js 服务端、Deno 边缘函数或 Bun Serverless 中编写的每一行代码，提供一副清晰的“底层认知地图”。

---

## 参考来源索引

- [V8 Blog: Maglev] V8 官方博客关于 Maglev 编译器的介绍与性能数据。
- [V8 Engine Architecture] sujeet.pro 对 V8 四层编译管线的深度分析。
- [The NodeBook: V8 Engine Intro] thenodebook.com 对 Ignition、Sparkplug、Maglev、TurboFan 的综述。
- [Kaspersky: CVE-2024-4947] 对 Maglev 编译器架构及引入背景的详细阐述。
- [Digital Thrive: V8 Compiler Efficiency] 关于 Maglev 填补编译速度鸿沟的分析。
- [OpZero: Chrome Exploitation] 对 Turboshaft 替代 Sea of Nodes 的技术细节与性能数据。
- [V8 Dev: Hidden Classes] V8 官方文档对 Maps、DescriptorArray、TransitionArray 的解释。
- [Mathias Bynens: Shapes and ICs] Benedikt Meurer 与 Mathias Bynens 关于 Shapes 和 Inline Caches 的经典文章。
- [Richard Artoul: Hidden Classes] 对 Hidden Class 转换链的图解说明。
- [Frontend Almanac: Inline Caches] 对 IC 四种状态及 GetNamedProperty 指令的解析。
- [The NodeBook: Inline Caching] 对 Monomorphic/Polymorphic/Megamorphic 的详细阐述。
- [Dev.to: Hidden Classes Performance Secret] 通过 benchmark 展示 Shape 稳定性对性能的影响。
- [Xia0.sh: Map Exploitation in V8] 对 Fast/Slow Properties 及 Dictionary Mode 的深入讲解。
- [V8 Blog: Trash Talk] V8 官方博客对 Orinoco GC、Parallel Scavenger、Concurrent Marking 的详解。
- [Hannes Payer: V8 GC PLDI 2019] Google V8 团队关于 Orinoco 设计与分代策略的 PLDI 教程幻灯片。
- [Juejin: V8 GC Deep Dive] 对三色标记法、并发标记、写屏障的中文深度解析。
- [Leapcell: V8 Memory Management] 对 Orinoco Idle-Time GC 与并发清除的综合介绍。
- [TypeScript Handbook: ESM-CJS Interop] TypeScript 官方文档对 CJS/ESM 互操作及 Node.js 句法分析的说明。
- [Node.js Docs: ESM] Node.js 官方文档对 ESM 三阶段加载模型的说明。
- [Appsignal Blog: CJS and ESM in Node.js] 对 Node.js 22 `require(ESM)` 实验性特性的解释。
- [Vercel Changelog: Node.js 22 LTS] Vercel 对 Node.js 22 LTS 特性（含 `require(ESM)`）的发布说明。
- [PkgPulse: Node.js 22 vs 20] 对 Node.js 22 `require(esm)` 迁移路径与限制的详细对比。
- [WebDeveloper Beehiiv: Native CJS/ESM Interop] 对 `ERR_REQUIRE_ASYNC_MODULE` 与 top-level await 限制的说明。
- [TypeScript Docs: moduleResolution] TypeScript 官方文档对 `node10`/`node16`/`nodenext`/`bundler` 的定义与差异。
- [Zenn: moduleResolution 详解] 对 `node16`/`nodenext` 双轨解析算法的日语技术解析。
- [Juejin: TS moduleResolution 精讲] 中文社区对 TypeScript 模块解析策略的历史演进分析。
- [Microsoft DevBlog: Announcing TS 6.0] TypeScript 6.0 发布说明，含 `classic` 移除信息。
- [Andrew Branch: Is nodenext right for libraries?] 对 `bundler` 与 `nodenext` 在库开发中的差异与陷阱的分析。
- [GitHub: webhintio/hint] 关于 `moduleResolution: bundler` 与 `require` 不兼容的社区讨论。
- [TypeScript Handbook: Choosing Compiler Options] TypeScript 官方对库作者选择 `nodenext` 的建议。
- [W3C Blog: WinterTC] W3C 与 Ecma 合作成立 WinterTC（TC55）的官方公告。
- [Ecma International: WinterTC Announcement] Ecma 宣布成立 TC55 的新闻稿。
- [Igalia: WinterCG becomes WinterTC] Igalia 对 WinterCG 升级为 WinterTC 的历史背景与意义的解读。
- [Cloudflare Blog: Standards-Compliant Workers API] Cloudflare 对 WinterCG Minimum Common Web Platform API 的列表与说明。
- [Igalia TPAC 2024: WinterCG] Andreu Botella 在 TPAC 2024 上关于 WinterCG 未来方向的演讲材料。
- [Makers' Den: Node to Deno/Bun] 对 Node.js、Deno、Bun 架构差异与安全模型的系统对比。
- [Deno vs Bun 2025: Pullflow] 基于 PR 数据分析的 Deno 与 Bun 开发哲学与协作模式对比。
- [GitHub Discussions: Deno team on Bun] Deno 团队对 Bun 技术选择的公开讨论。
- [Bun Official Site] bun.com 官方文档对 Bun 特性、架构、内置 API 的说明。
- [Juejin: Bun vs Node.js Deep Dive] 中文社区对 Bun 选择 JavaScriptCore 与 Zig 的底层原因分析。
- [CodingMall: Bun Zig JSC Performance] 对 Zig 手动内存管理与 JavaScriptCore 启动速度优势的总结。
- [Mintlify: Bun Runtime Docs] Bun 运行时文档对 Transpiler、Module Loader、Lazy Transpilation 的描述。
- [Undb Blog: Why Choose Bun] 对 Bun CJS/ESM 统一模块解析及内置 SQLite 的案例分析。
- [BolderApps: Node vs Bun vs Deno] 2026 年对三大运行时性能基准测试与实际使用场景的综合对比。
- [Dev.to: Node vs Bun vs Deno 2025] 对三大运行时 HTTP 吞吐量、启动速度、内存占用的实测数据。
- [V8 Blog: Turbolev] V8 官方博客关于 Turbolev 下一代顶层编译器的架构设计与 pipeline 描述。
- [V8 Security Analysis 2026] V8 安全分析文档中关于 Turbolev 取代 TurboFan 的动因、CFG 回归及编译器栈简化策略的论述。
- [Node.js 24 Release Notes] Node.js 24 官方发布说明，涵盖 `--experimental-strip-types` 默认启用、`--experimental-require-module` 默认启用及 `import.meta.main` 等特性。
- [WebAssembly GC Spec] WebAssembly GC 扩展规范，涵盖 struct/array 类型、Canonical Type Index 与跨模块类型安全机制。

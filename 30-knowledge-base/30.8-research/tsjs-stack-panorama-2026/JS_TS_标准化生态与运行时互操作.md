---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JS/TS 标准化生态与运行时互操作：2025–2026 瞭望

> 短篇瞭望文档，面向研究者与高级开发者，快速建立对 2025–2026 年 JavaScript 标准化生态的概念框架。本文聚焦 WinterTC（Ecma TC55）的成立背景、Minimum Common Web API 的技术细节，以及开发者如何在实际工程中利用这些标准提升代码的可移植性。

---

## 1. 从 WinterCG 到 WinterTC：标准化组织的升格

2022 年，Deno、Cloudflare、Igalia、Node.js 等核心参与者共同创立了 W3C Community Group **WinterCG**（Web-interoperable Runtimes Community Group）[W3C Blog: Goodbye WinterCG, welcome WinterTC]。
其初衷非常明确：浏览器之外的 JavaScript 运行时（Node.js、Deno、Bun、Cloudflare Workers 等）需要一套共同遵循的 API 规范，以结束长期以来各运行时各自为政、开发者被迫编写重复适配代码的局面。

然而，W3C Community Group 存在一个根本性的制度限制：它无法发布具有正式效力的技术报告（Technical Report）或标准。
Community Group 的产出只能停留在"提案"或"备忘录"阶段，不具备被产业界广泛引用和强制遵循的权威性。
随着 web-interoperable 运行时生态的快速扩张，这种制度天花板变得越来越不可忽视。

2025 年 1 月，WinterCG 正式关闭，取而代之的是一个全新的 Ecma Technical Committee——**Ecma TC55，昵称 WinterTC**（Web-interoperable Runtimes Technical Committee）[Ecma Press Release: TC55 Formation]。
这一升格具有深远的制度意义：Ecma TC 拥有发布正式国际标准（Ecma Standards）乃至提交 ISO/IEC 快速通道的完整权力。
WinterTC 的首任主席为 Luca Casonato，他此前正是 WinterCG 的联合主席，这一人事安排也保证了组织过渡的连续性 [Deno Blog: WinterTC]。与此同时，Google、Microsoft、Cloudflare 和 Igalia 等核心厂商均已派出代表参与 TC55 的工作组，确保了标准制定与产业实践之间的紧密耦合。

从 Community Group 到 Technical Committee，不仅仅是名称和隶属关系的变更，更标志着服务器端 JavaScript 运行时的互操作问题从"社区共识阶段"迈入了"正式标准化阶段"。
与 TC39 负责语言核心（ECMAScript）不同，WinterTC 关注的是"语言之外、平台之上"的 API 共识。它的成功将直接决定未来五年全栈 JavaScript 开发者能否真正摆脱"为每个运行时写一份适配代码"的困境。

---

## 2. Minimum Common Web API 2025 Snapshot

2025 年 12 月，WinterTC 发布了其成立以来的首个规范性成果——**Minimum Common Web API 2025 Snapshot** [min-common-api.proposal.wintertc.org]。
这份文档的核心目标是回答一个看似简单却长期模糊的问题：如果你编写了一段代码，希望它能在 Node.js、Deno、Bun、Cloudflare Workers、Fastly Compute 等环境中无差别运行，那么你可以安全地依赖哪些 API？

"Minimum Common"（最小公约数）这一命名本身就意味着它不是浏览器的完整 Web API 复制，而是一个经过精心裁剪的子集。
其筛选逻辑是：只包含那些对所有 web-interoperable 运行时在语义和性能上都可行、且无重大实现分歧的 API。以下是该 Snapshot 涵盖的核心 API 类别：

| 类别 | 核心 API | 说明 |
|------|---------|------|
| **Global Interfaces** | `URL`、`URLSearchParams`、`URLPattern`、`AbortController`、`AbortSignal` | URL 解析与路由匹配、请求取消机制的基础 |
| **Streams** | `ReadableStream`、`WritableStream`、`TransformStream`、`ByteLengthQueuingStrategy` | 现代 I/O 与数据管道的标准抽象 |
| **Fetch** | `fetch`、`Headers`、`Request`、`Response`、`FormData`、`Blob` | 网络请求的统一入口 |
| **Crypto** | `crypto`、`Crypto`、`SubtleCrypto` | Web Cryptography API 的标准子集 |
| **Encoding** | `TextEncoder`、`TextDecoder` | 字符串与二进制数据之间的编解码 |
| **Structured Clone** | `structuredClone` | 复杂对象的深度复制机制 |
| **WebAssembly** | `WebAssembly` 全局对象（若运行时支持 workers 场景） | WASM 模块的加载与实例化接口 |

除了上述核心接口，Minimum Common Web API 还对错误处理、全局对象的可枚举性以及 `console` 方法的输出格式等细节做出了规定。这些看似琐碎的约定，实际上对测试框架和日志库的跨运行时可移植性至关重要。

需要特别强调的是，Minimum Common Web API 明确**不是**浏览器 Web API 的服务器端镜像。
例如，`DOM`、`localStorage`、`window`、CSS 相关的 API 被有意排除在外，因为这些概念在服务器端或边缘运行时没有统一的宿主环境语义 [min-common-api.proposal.wintertc.org]。
同样，一些浏览器中存在的 Fetch 扩展（如 `keepalive` 选项）如果无法在边缘运行时得到一致支持，也会被暂时搁置。

此外，Minimum Common Web API 不仅规定了"有哪些 API"，还对**ESM Host Hooks**、**Event Loop 集成**以及**结构化克隆算法（Structured Clone Algorithm）**的精确语义做出了约束。这意味着，即使两个运行时都实现了 `fetch` 和 `ReadableStream`，如果它们在流背压（backpressure）的触发时机或 `AbortSignal` 的传播顺序上存在差异，也可能导致代码行为不一致。WinterTC 通过引用 WPT（Web Platform Tests）的子集来消除这种"实现漂移"，确保跨运行时的一致性不仅仅停留在 API 表面 [Deno Blog: WinterTC]。

对于 TypeScript 开发者而言，Minimum Common Web API 的标准化还带来了一个额外的好处：类型定义的收敛。目前，`lib.dom.d.ts` 与 `@types/node` 之间长期存在同名接口但属性不一致的问题（例如 `fetch` 的返回类型、`AbortSignal` 的事件监听签名）。WinterTC 成立后，正在推动将这些公共 API 的类型定义收敛到一套与规范严格对齐的公共类型包中，未来可能直接由 TypeScript 核心团队维护，从而减少开发者因类型不兼容而被迫使用 `as any` 的痛点。

这一 Snapshot 的发布，使得"跨运行时兼容"从一个模糊的工程学口号，首次变成了可以逐项对照检查的规范清单。

---

## 3. 未来的 Conformance Levels

单一的标准集很难同时满足资源受限的边缘运行时和功能丰富的服务器端运行时的需求。
为此，WinterTC 正在规划一套**分层一致性级别（Conformance Levels）**，这一方向在 TPAC 2025 的 WinterTC 分享中得到了系统阐述 [TPAC 2025 WinterTC Slides]。

目前的草案将一致性级别划分为以下几个层次：

- **Minimum（最小级别）**：所有声称 WinterTC 兼容的运行时**必须**实现。这对应于 Minimum Common Web API 的内容，是跨运行时可移植性的基线。
- **Graphics（图形级别）**：面向需要 headless 图形能力的运行时，包括但不限于 `WebGPU` 和 `OffscreenCanvas`。这一级别主要服务于边缘 AI 推理、服务端渲染（SSR）图片生成等新兴场景。
- **CLI / File System（CLI 与文件系统级别）**：涵盖环境变量访问、命令行参数解析、标准输入输出、以及文件系统操作。显然，边缘无服务器运行时（如某些 strictly sandboxed 的 Workers 平台）可能永远无法支持这一级别，但 Deno、Bun 和 Node.js 等本地运行时是这一级别的目标受众。
- **Servers（服务器级别）**：包含 TCP/TLS/UDP/QUIC socket、HTTP server API 等底层网络能力。这一级别将允许编写真正的跨运行时网络服务框架，而不再被锁定在某一特定运行时的 `net` 或 `http` 模块中。

这种分层架构的最大好处在于**避免了"一刀切"的合规陷阱**。开发者可以根据目标部署环境，明确声明"我的库需要 WinterTC Minimum + Servers 级别"，而不是在 README 里含糊地写"支持 Node.js 和 Deno"。对于运行时厂商而言，它们也可以选择性地宣称支持特定级别，而不必为了通过全部测试套件去模拟那些在架构上无法提供的 API。

从验证机制上看，WinterTC 计划为每个 Conformance Level 发布对应的**测试套件（Test Suite）**和**合规声明模板（Conformance Statement Template）**。运行时厂商可以通过公开运行测试套件并发布结果来证明其兼容性；库作者则可以在 `package.json` 中通过自定义字段（如 `"wintertc": { "level": "minimum+servers" }`）向消费者明确传达兼容性承诺。这种双向透明机制将大幅降低生态系统的碎片化成本。

---

## 4. 正在制定的新标准

除了 Minimum Common Web API 的维护与迭代，WinterTC 还肩负着两项具有更高雄心的新标准制定工作：CLI API 与 Sockets API。
它们将分别填补当前 JavaScript 运行时在"进程级交互"与"底层网络"两个维度上的标准化空白。

### CLI API

今天，如果你需要编写一段同时运行在 Node.js、Deno 和 Bun 上的脚本，并访问环境变量或命令行参数，你几乎不可避免地要引入条件分支：Node.js 使用 `process.env` 和 `process.argv`，Deno 使用 `Deno.env` 和 `Deno.args`，Bun 虽然兼容 Node 的 `process` 对象，但情况并不总是如此。
WinterTC 正在制定的 **CLI API** 旨在提供一套统一的跨运行时接口，标准化的对象可能包括但不限于：

- 环境变量访问（`env.get(name)` 或类似语义）
- 命令行参数列表（`args`）
- 当前工作目录查询（`cwd()`）
- 进程退出（`exit(code)`）

其核心设计原则是：这些 API 应该与 Node.js 的 `process` 对象解耦，成为独立的、可在任何运行时中以相同方式调用的全局或模块接口 [TPAC 2025 WinterTC Slides]。

值得注意的是，CLI API 的设计还在讨论是否引入**权限提示（permission prompt）**机制。借鉴 Deno 的 `--allow-*` 模型，未来的 WinterTC CLI API 可能要求运行时在使用敏感能力（如文件系统或环境变量）前，向用户显式请求授权。这种设计将使得原本只在 Deno 中存在的安全默认策略，有可能成为整个 JavaScript 服务器端生态的通用规范。

### Sockets API

在底层网络编程领域，Node.js 的 `net` / `tls` / `dgram` 模块长期以来是事实标准，但它们是 Node 专用的。
Deno 提供了基于 Web 风格的 `Deno.connect` 和 `Deno.listen`，而 Cloudflare Workers 则有自己的 `connect()` 方法用于 TCP socket。
WinterTC 的 **Sockets API** 工作组正在尝试将这些差异收敛为一个统一的跨运行时标准，预计涵盖：

- TCP client socket（连接、读写、关闭）
- TLS upgrade（在现有 TCP 连接上启动 TLS 握手）
- UDP socket（发送与接收数据报）
- 未来可能扩展到 QUIC

与 Node.js 现有的 `net` 模块不同，WinterTC 的 Sockets API 强调**流式抽象（streaming abstraction）**的统一性：所有 socket 连接都暴露为 `ReadableStream` 和 `WritableStream`，而不是基于 `EventEmitter` 的数据事件。这意味着开发者可以用同一套背压控制逻辑来处理 HTTP body、文件流和原始 TCP 数据，显著降低了心智负担。此外，该 API 还将内置对 `AbortSignal` 的原生支持，使得超时和取消操作在任何运行时中都有完全一致的行为。

Sockets API 的意义尤为重大，因为它是构建数据库驱动、消息队列客户端、自定义协议服务器等基础设施的前提条件。
一旦标准化完成，像 Redis、PostgreSQL、MQTT 这样的客户端库将有望真正做到"Write Once, Run on Any Runtime"。

这两项新标准的制定并非孤立进行。WinterTC 与 TC39、W3C 以及 WebAssembly 社区组保持着紧密的协同关系。例如，CLI API 的设计需要避免与 ECMAScript 的 import.meta 扩展冲突；Sockets API 则需要考虑与 WebTransport 和 QUIC 标准化的对齐。这种跨组织的协作确保了 WinterTC 的产出不会成为另一套"孤岛 API"，而是整个 Web 平台技术栈的自然延伸。

---

## 5. 对开发者的实际意义

WinterTC 及其标准体系的存在，最终要落实到开发者的日常决策中。以下是当前阶段最值得关注的几个实际要点。

### "Write Once, Run on Node/Deno/Bun/Edge" 的愿景与边界

Minimum Common Web API 2025 Snapshot 的发布，确实让"一次编写，到处运行"的愿景在 I/O 密集型的通用逻辑层面变得比以往任何时候都更加可行。
如果你编写的库主要涉及 HTTP 请求、流处理、URL 操作和加密，那么依赖 Minimum Common API 可以最大程度地减少运行时适配代码。

然而，这一愿景仍有明确的边界。
任何涉及文件系统、原生 CLI、底层 socket、或者平台特定扩展（如 Node.js 的 `fs`、Deno 的权限模型、Cloudflare 的 KV/Durable Objects）的代码，目前仍然无法完全摆脱运行时的锁定的。
开发者需要清醒地认识到：WinterTC 解决的是**可移植性的基线**，而不是**所有平台特性的统一化**。

### 兼容性策略建议

对于希望提高代码跨运行时兼容性的项目，建议遵循以下策略：

1. **优先使用 Minimum Common API**：例如用 `fetch` 替代 `http.get`，用 `ReadableStream` 替代 Node.js 的 `stream.Readable`，用 `crypto.subtle` 替代 `crypto` 模块的遗留算法。
2. **将运行时特定逻辑隔离到适配层**：如果确实需要使用文件系统或 socket，将它们封装在一个小的适配模块中，而不是散落在业务代码各处。
3. **关注 WinterTC 的 Conformance Levels**：当分层标准正式发布后，你可以明确声明自己的包所需的 conformance level，帮助下游使用者快速判断兼容性。

以下是一个简单的 WinterTC 兼容代码示例，展示了如何通过特征探测（feature detection）实现优雅降级：

```js
// runtime-adapter.js
export async function fetchData(url) {
  // 所有 WinterTC Minimum 运行时都支持 fetch
  const res = await fetch(url);
  return res.json();
}

export function createHash(algorithm) {
  // 优先使用 Web Crypto
  if (globalThis.crypto?.subtle) {
    return { async digest(data) { /* ... */ } };
  }
  // Node.js 旧版本或特殊环境下的降级
  const { createHash } = await import('node:crypto');
  return { digest: (data) => createHash(algorithm).update(data).digest() };
}
```

通过将 `node:` 前缀的模块调用限制在适配层内部，业务代码可以保持对 WinterTC Minimum 的纯粹依赖，仅在必要时加载平台特定能力。

### 运行时特性探测与优雅降级

WinterTC 兼容代码的核心挑战在于：如何在无法访问特定运行时 API 时，既不抛出硬错误，也不牺牲类型安全性。推荐的策略是**渐进增强（progressive enhancement）**：

- **能力检测优先于环境嗅探**：不要通过 `typeof process !== 'undefined'` 来判断是否在 Node.js 中运行，因为这无法覆盖未来的新运行时。相反，检测具体 API 是否存在（如 `typeof globalThis.crypto?.subtle?.digest === 'function'`）更为可靠。
- **使用 `import()` 动态导入平台模块**：ESM 的动态 `import()` 允许在运行时根据条件加载平台特定代码，而不会影响静态分析。TypeScript 的 `moduleResolution: nodenext` 能够正确解析这些动态导入的类型。
- **为适配层编写统一类型接口**：无论底层运行时如何变化，适配层对外暴露的 TypeScript 接口应保持一致。这不仅能获得类型安全，还能在将来新运行时出现时，通过替换适配实现来快速扩展支持。

### 边缘运行时的特殊考量

边缘计算平台（如 Cloudflare Workers、Vercel Edge Functions、Fastly Compute）是 WinterTC 最早的一批践行者，但它们也是最受约束的运行时。这些平台通常不允许直接访问文件系统、不允许创建任意 TCP socket，并且对每个请求的 CPU 时间有严格限制。因此，在编写面向边缘环境的代码时，开发者应严格限制自己只使用 WinterTC Minimum 级别的 API，并避免引入依赖 `node:fs` 或 `node:net` 的第三方库。WinterTC 的 Conformance Levels 为此提供了清晰的指南：如果一段代码只需要 Minimum 级别，那么它在理论上可以在任何 WinterTC 兼容运行时中运行，包括资源最受限的边缘节点。

### 如何验证兼容性

WinterTC 正在积极构建基于 **WPT（Web Platform Tests）** 子集的官方测试套件 [Deno Blog: WinterTC]。
WPT 是浏览器厂商长期使用的跨引擎兼容性测试基础设施，其测试用例具有极高的质量和权威性。
WinterTC 计划从 WPT 中提取与 Minimum Common API 相关的用例，并针对服务器端运行时的环境差异进行必要的调整。
这意味着未来运行时厂商和库作者都可以运行同一套测试，来客观地证明"我符合 WinterTC Minimum 标准"。
对于 CI/CD 流程而言，这种标准化的验证手段尤其重要：你可以在发布前自动运行 WinterTC 测试套件，确保代码变更不会意外引入平台特定依赖。此外，WinterTC 还计划与 npm、jsr 等包管理平台合作，在包信息页面直接展示兼容性徽章（badge），让消费者在安装依赖前就能直观了解其运行时支持范围。

---

## 6. 代码示例

### 跨运行时 CLI 适配层（WinterTC Minimum + CLI Level）

```typescript
// cli-adapter.ts
export interface CLIRuntime {
  env(name: string): string | undefined;
  args: string[];
  cwd(): string;
  exit(code?: number): never;
}

function detectRuntime(): CLIRuntime {
  // Deno
  if (typeof (globalThis as any).Deno !== 'undefined') {
    const Deno = (globalThis as any).Deno;
    return {
      env: (name: string) => Deno.env.get(name),
      args: Deno.args,
      cwd: () => Deno.cwd(),
      exit: (code = 0) => Deno.exit(code),
    };
  }
  // Bun (兼容 Node 但优先检测)
  if (typeof (globalThis as any).Bun !== 'undefined') {
    return {
      env: (name: string) => process.env[name],
      args: process.argv.slice(2),
      cwd: () => process.cwd(),
      exit: (code = 0) => process.exit(code),
    };
  }
  // Node.js
  return {
    env: (name: string) => process.env[name],
    args: process.argv.slice(2),
    cwd: () => process.cwd(),
    exit: (code = 0) => process.exit(code),
  };
}

export const cli = detectRuntime();
```

### 跨运行时 HTTP Server 启动器（WinterTC Minimum + Servers Level）

```typescript
// http-server.ts
async function startServer(port: number, handler: (req: Request) => Response | Promise<Response>) {
  // Node.js 20+
  if (typeof (globalThis as any).process !== 'undefined') {
    const { createServer } = await import('node:http');
    return new Promise<void>((resolve) => {
      createServer(async (req, res) => {
        const url = new URL(req.url ?? '/', `http://localhost:${port}`);
        const request = new Request(url, {
          method: req.method,
          headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
        });
        const response = await handler(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      }).listen(port, resolve);
    });
  }
  // Deno
  if (typeof (globalThis as any).Deno !== 'undefined') {
    const Deno = (globalThis as any).Deno;
    const server = Deno.serve({ port }, handler);
    return server.finished;
  }
  // Bun
  if (typeof (globalThis as any).Bun !== 'undefined') {
    const Bun = (globalThis as any).Bun;
    Bun.serve({ port, fetch: handler });
    return;
  }
  throw new Error('Unsupported runtime for HTTP server');
}
```

### 带 AbortSignal 的统一 Fetch 封装

```typescript
// safe-fetch.ts
export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number }
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = init?.timeout ? setTimeout(() => controller.abort(), init.timeout) : null;

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal
        ? AbortSignal.any([init.signal, controller.signal]) // ES2024+
        : controller.signal,
    });
    return response;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// 使用示例：任何 WinterTC Minimum 运行时均可
const data = await safeFetch('https://api.example.com/data', { timeout: 5000 });
```

### package.json WinterTC 兼容性声明

```json
{
  "name": "my-universal-lib",
  "version": "1.0.0",
  "wintertc": {
    "level": "minimum+servers",
    "runtimes": ["node>=20", "deno>=2", "bun>=1", "cloudflare-workers"]
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./adapter": {
      "import": "./dist/adapter.mjs"
    }
  }
}
```

---

## 关联文档

- **运行时互操作的技术基础**（V8 编译器栈、Node.js 模块解析、Deno/Bun 差异），请参阅 《JS/TS 现代运行时深度分析》 [TODO: 链接待修复] §4、§5。
- **模块系统的规范演进**（`import defer`、ESM/CJS 互操作、Node.js 24 原生 TS 支持），请参阅 [《JavaScript/TypeScript 语言核心特性全览》](01_language_core.md) §8.8。
- **TypeScript 类型系统与标准化语义** 的深层分析，请参阅 [《JavaScript / TypeScript 语言语义模型全面分析》](JS_TS_语言语义模型全面分析.md)。

---

## 结语

从 2022 年的 WinterCG 到 2025 年的 WinterTC，JavaScript 标准化生态经历了一次关键的组织升格。
Minimum Common Web API 2025 Snapshot 的发布，为跨运行时兼容提供了第一个正式的规范基线；而正在规划中的 Conformance Levels、CLI API 和 Sockets API，则预示着未来数年这一领域将持续深化。
对于高级开发者而言，理解 WinterTC 的架构逻辑与边界，将是制定长期技术栈决策的重要前提。
在"浏览器-边缘-服务器"连续体日益融合的技术背景下，WinterTC 不仅是一个标准组织，更是 JavaScript 生态从碎片化走向成熟的制度基石。对于已经在使用 Deno、Bun 或 Node.js 24 的开发者来说，WinterTC 的理念并非遥远的未来，而是可以通过今天的代码选择逐步践行的现实。每一次优先选择 `fetch` 而非 `http.get`、每一次将平台逻辑封装进适配层，都是在为更可移植的 JavaScript 生态添砖加瓦。

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| WinterTC 官方网站 | <https://wintertc.org/> | Ecma TC55 官方主页 |
| Minimum Common Web API 规范 | <https://min-common-api.proposal.wintertc.org/> | 最小公共 Web API 规范草案 |
| W3C Blog: WinterCG to WinterTC | <https://www.w3.org/blog/2025/01/goodbye-wintercg-welcome-wintertc/> | WinterCG 关闭与 WinterTC 成立公告 |
| Ecma TC55 Press Release | <https://ecma-international.org/news/ecma-tc55-formed/> | Ecma TC55 成立新闻稿 |
| Deno Blog: WinterTC | <https://deno.com/blog/wintertc> | Deno 视角的 WinterTC 解读 |
| TPAC 2025 WinterTC Slides | <https://www.w3.org/2025/09/TPAC/wintertc.html> | W3C TPAC 2025 WinterTC 分享 |
| Web Platform Tests (WPT) | <https://web-platform-tests.org/> | 跨浏览器/运行时兼容性测试基础设施 |
| TC39 Proposals | <https://github.com/tc39/proposals> | ECMAScript 提案跟踪仓库 |
| Node.js 文档 — ESM | <https://nodejs.org/api/esm.html> | Node.js ESM 模块系统文档 |
| Deno 文档 — 兼容性 | <https://docs.deno.com/runtime/manual/node/compatibility/> | Deno Node.js 兼容性说明 |
| Bun 文档 — 运行时 | <https://bun.sh/docs/runtime/nodejs-apis> | Bun Node.js API 兼容性 |
| Cloudflare Workers Runtime APIs | <https://developers.cloudflare.com/workers/runtime-apis/> | Workers 运行时 API 文档 |
| JSR (JavaScript Registry) | <https://jsr.io/docs/> | 跨运行时包注册表 |

---

## 来源索引

- [W3C Blog: Goodbye WinterCG, welcome WinterTC]
- [Ecma Press Release: TC55 Formation]
- [min-common-api.proposal.wintertc.org]
- [TPAC 2025 WinterTC Slides]
- [Deno Blog: WinterTC]

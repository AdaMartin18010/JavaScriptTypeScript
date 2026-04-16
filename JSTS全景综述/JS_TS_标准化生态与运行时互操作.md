# JS/TS 标准化生态与运行时互操作：2025–2026 瞭望

> 短篇瞭望文档，面向研究者与高级开发者，快速建立对 2025–2026 年 JavaScript 标准化生态的概念框架。

---

## 1. 从 WinterCG 到 WinterTC：标准化组织的升格

2022 年，Deno、Cloudflare、Igalia、Node.js 等核心参与者共同创立了 W3C Community Group **WinterCG**（Web-interoperable Runtimes Community Group）[W3C Blog: Goodbye WinterCG, welcome WinterTC]。
其初衷非常明确：浏览器之外的 JavaScript 运行时（Node.js、Deno、Bun、Cloudflare Workers 等）需要一套共同遵循的 API 规范，以结束长期以来各运行时各自为政、开发者被迫编写重复适配代码的局面。

然而，W3C Community Group 存在一个根本性的制度限制：它无法发布具有正式效力的技术报告（Technical Report）或标准。
Community Group 的产出只能停留在"提案"或"备忘录"阶段，不具备被产业界广泛引用和强制遵循的权威性。
随着 web-interoperable 运行时生态的快速扩张，这种制度天花板变得越来越不可忽视。

2025 年 1 月，WinterCG 正式关闭，取而代之的是一个全新的 Ecma Technical Committee——**Ecma TC55，昵称 WinterTC**（Web-interoperable Runtimes Technical Committee）[Ecma Press Release: TC55 Formation]。
这一升格具有深远的制度意义：Ecma TC 拥有发布正式国际标准（Ecma Standards）乃至提交 ISO/IEC 快速通道的完整权力。
WinterTC 的首任主席为 Luca Casonato，他此前正是 WinterCG 的联合主席，这一人事安排也保证了组织过渡的连续性 [Deno Blog: WinterTC]。

从 Community Group 到 Technical Committee，不仅仅是名称和隶属关系的变更，更标志着服务器端 JavaScript 运行时的互操作问题从"社区共识阶段"迈入了"正式标准化阶段"。

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

需要特别强调的是，Minimum Common Web API 明确**不是**浏览器 Web API 的服务器端镜像。
例如，`DOM`、`localStorage`、`window`、CSS 相关的 API 被有意排除在外，因为这些概念在服务器端或边缘运行时没有统一的宿主环境语义 [min-common-api.proposal.wintertc.org]。
同样，一些浏览器中存在的 Fetch 扩展（如 `keepalive` 选项）如果无法在边缘运行时得到一致支持，也会被暂时搁置。

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

### Sockets API

在底层网络编程领域，Node.js 的 `net` / `tls` / `dgram` 模块长期以来是事实标准，但它们是 Node 专用的。
Deno 提供了基于 Web 风格的 `Deno.connect` 和 `Deno.listen`，而 Cloudflare Workers 则有自己的 `connect()` 方法用于 TCP socket。
WinterTC 的 **Sockets API** 工作组正在尝试将这些差异收敛为一个统一的跨运行时标准，预计涵盖：

- TCP client socket（连接、读写、关闭）
- TLS upgrade（在现有 TCP 连接上启动 TLS 握手）
- UDP socket（发送与接收数据报）
- 未来可能扩展到 QUIC

Sockets API 的意义尤为重大，因为它是构建数据库驱动、消息队列客户端、自定义协议服务器等基础设施的前提条件。
一旦标准化完成，像 Redis、PostgreSQL、MQTT 这样的客户端库将有望真正做到"Write Once, Run on Any Runtime"。

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

### 如何验证兼容性

WinterTC 正在积极构建基于 **WPT（Web Platform Tests）** 子集的官方测试套件 [Deno Blog: WinterTC]。
WPT 是浏览器厂商长期使用的跨引擎兼容性测试基础设施，其测试用例具有极高的质量和权威性。
WinterTC 计划从 WPT 中提取与 Minimum Common API 相关的用例，并针对服务器端运行时的环境差异进行必要的调整。
这意味着未来运行时厂商和库作者都可以运行同一套测试，来客观地证明"我符合 WinterTC Minimum 标准"。

---

## 关联文档

- **运行时互操作的技术基础**（V8 编译器栈、Node.js 模块解析、Deno/Bun 差异），请参阅 [《JS/TS 现代运行时深度分析》](JS_TS_现代运行时深度分析.md)。
- **模块系统的规范演进**（`import defer`、ESM/CJS 互操作、Node.js 24 原生 TS 支持），请参阅 [《JavaScript/TypeScript 语言核心特性全览》](01_language_core.md) 第 8.7–8.8 节。
- **TypeScript 类型系统与标准化语义** 的深层分析，请参阅 [《JavaScript / TypeScript 语言语义模型全面分析》](JS_TS_语言语义模型全面分析.md)。

---

## 结语

从 2022 年的 WinterCG 到 2025 年的 WinterTC，JavaScript 标准化生态经历了一次关键的组织升格。
Minimum Common Web API 2025 Snapshot 的发布，为跨运行时兼容提供了第一个正式的规范基线；而正在规划中的 Conformance Levels、CLI API 和 Sockets API，则预示着未来数年这一领域将持续深化。
对于高级开发者而言，理解 WinterTC 的架构逻辑与边界，将是制定长期技术栈决策的重要前提。

---

## 来源索引

- [W3C Blog: Goodbye WinterCG, welcome WinterTC]
- [Ecma Press Release: TC55 Formation]
- [min-common-api.proposal.wintertc.org]
- [TPAC 2025 WinterTC Slides]
- [Deno Blog: WinterTC]

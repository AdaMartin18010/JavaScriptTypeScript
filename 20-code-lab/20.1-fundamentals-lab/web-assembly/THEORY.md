# WebAssembly — 理论基础

> **对齐版本**：WebAssembly 3.0 W3C Standard (2025-09) | WASI 0.2 (2024-01 Stable) | WASI 0.3 RC (2025-11)
> **权威来源**：W3C Wasm WG、Bytecode Alliance、Chrome Platform Status、JavaCodeGeeks 2026-04
> **最后更新**：2026-04

---

## 1. Wasm 设计目标与核心语义

WebAssembly 是一种**二进制指令格式**，为基于栈的虚拟机设计。关键理解：它不是编程语言，而是**编译目标**——C/C++、Rust、Go、Java、Kotlin、TypeScript (AssemblyScript) 等 40+ 语言均可编译为 `.wasm`。

| 特性 | 语义 | 安全 implication |
|------|------|-----------------|
| **沙箱执行** | 默认无文件系统、网络、环境变量访问 | 能力安全模型 (capability-based security) |
| **线性内存** | 连续可调整大小的字节数组 (ArrayBuffer) | 内存隔离 + 边界检查 |
| **栈机模型** | 基于操作数栈的指令执行（非寄存器机） | 可验证、可预测的执行流 |
| **确定性能** | 解码和编译时间有明确上界 | 适合实时/交互式场景 |

> *"WebAssembly is not a JVM replacement and is not trying to be. It occupies a different niche: portable, sandboxed, near-native execution with no assumptions about a host OS."* — JavaCodeGeeks, 2026-04

---

## 2. JS 互操作模型

```javascript
// 流式实例化（推荐）
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('app.wasm'),
  { env: { memory: new WebAssembly.Memory({ initial: 256 }) } }
)
const { add, processImage } = wasmModule.instance.exports

// 共享内存：JS TypedArray 直接读写 Wasm 线性内存
const mem = new Uint8Array(wasmModule.instance.exports.memory.buffer)
mem.set([0xFF, 0xD8, 0xFF], 0) // 直接写入 JPEG header
```

**互操作边界成本**：

- 简单数值传递：~0（直接映射）
- 字符串/二进制数据：需通过线性内存拷贝（WebAssembly Memory64 和 JSPI 正在降低此成本）
- 对象图传递：需序列化（JSON、FlatBuffers、MessagePack）

---

## 3. WASI 演进：从浏览器到服务器端

WASI (WebAssembly System Interface) 是 Wasm 的标准化系统接口，使 Wasm 模块能在浏览器外安全运行。

### WASI 版本对比

| 特性 | WASI 0.1 (2019) | WASI 0.2 (2024-01) | WASI 0.3 (RC 2025-11) |
|------|-----------------|--------------------|-----------------------|
| **接口系统** | C-like ABI，仅数值类型 | **WIT + Component Model**（丰富类型） | WIT + 原生异步 |
| **文件系统** | ✅ | ✅ (via WIT) | ✅ |
| **网络** | ❌ | ✅ **TCP/UDP + HTTP** | ✅ + 原生 async |
| **原生异步 I/O** | ❌ | 仅 workaround | ✅ **first-class future/stream** |
| **模块组合** | 不支持 | **完整 Component Model** | 完整 + async components |
| **运行时支持** | 通用 | Wasmtime, Spin, wasmCloud | Spin v3.5 RC, Wasmtime 实验性 |

### Component Model 与 WIT

WASI 0.2 的核心突破是 **Component Model**——使 Wasm 模块具备自描述的强类型接口：

```wit
// greeting.wit — 跨语言接口定义
package example:greeting;

interface greet {
    greet: func(name: string) -> string;
}

world greeter {
    export greet;
}
```

- **WIT (Wasm Interface Types)**：IDL 语言，定义跨组件函数签名（字符串、记录、列表、变体、枚举）
- **Components**：自包含的 Wasm 模块，声明 imports（宿主依赖）和 exports（提供服务）
- **组合性**：Rust 组件和 Python 组件实现同一 WIT 接口后，在二进制层面可互换——无需网络调用或 FFI

> *"A Rust component and a Python component that implement the same WIT interface become interchangeable at the binary level."* — Shahzad Bhatti, 2026

### WASI 0.3：原生异步 I/O

2025-11，Fermyon Spin v3.5 发布首个 WASI 0.3 RC， headline 特性：

- **first-class `future` 和 `stream` 类型**：允许宿主运行时挂起等待 I/O 的组件，调度其他工作
- **取消令牌**：支持超时和中断
- **意义**：移除回调 workaround，使网络 I/O 阻塞式编写但异步执行——主流 Web 框架（Axum、Flask 风格）可原生移植到 WASI

---

## 4. Wasm 3.0 与 WasmGC

2025-09，**WebAssembly 3.0 成为 W3C 标准**，是自 MVP 以来最大的规范更新：

| 特性 | 状态 | 影响 |
|------|------|------|
| **WasmGC** | ✅ 所有主流浏览器支持（Safari 2024-12） | GC 语言（Go、Python、Java、Kotlin）无需在 Wasm 内嵌 GC 运行时 |
| **Exception Handling (exnref)** | ✅ Safari 补齐（2024-12） | 结构化 try/catch 替代昂贵的 setjmp/longjmp |
| **Tail Calls** | ✅ | 函数式编程模式无栈溢出风险 |
| **SIMD (128-bit)** | ✅ | 向量运算：ML 推理、科学计算、图像处理 |
| **Multi-memory** | ✅ | 多线性内存段，安全隔离不同数据域 |
| **64-bit 寻址 (Memory64)** | ✅ | 突破 4GB 内存限制 |

**WasmGC 的关键意义**：

- 之前：Java/Kotlin/Go 编译到 Wasm 需打包完整 GC 运行时，二进制臃肿
- 现在：浏览器/运行时的原生 GC 直接管理 Wasm 对象，二进制缩小 30-70%
- Kotlin/Wasm Beta (2025-09)：Compose for Web 性能比 Kotlin/JS **快 3x**
- TeaVM：Java 字节码 → WasmGC，浏览器目标已生产就绪

---

## 5. JSPI：JavaScript Promise Integration

**JSPI** 是 Phase 4（最终阶段）提案，2026 年 Chrome 137+ 和 Firefox 139+ 已支持：

- 允许 Wasm 模块**同步调用异步 JS API**（fetch、IndexedDB、Web Crypto）
- 运行时自动挂起 Wasm 执行，等待 Promise resolve，然后恢复——无需手动 async/await 桥接
- Safari 支持仍在推进中

```javascript
// JSPI 使 Wasm 能直接 await JS 异步 API
// 此前需要复杂的回调桥接；JSPI 后同步写法即可
const response = fetch_data(url)  // Wasm 内同步调用，底层自动挂起/恢复
```

---

## 6. 2026 生产级用例

Wasm 已从"浏览器新奇技术"演变为**特定领域的生产级运行时**：

| 场景 | 部署案例 | 关键数据 |
|------|---------|---------|
| **边缘函数** | Cloudflare Workers | **~40 亿次 Wasm 调用/天**（较 2024 增长 3x）；冷启动 <1ms |
| **FaaS 平台** | American Express 内部平台 | 基于 wasmCloud 构建，替代部分容器化工作负载 |
| **插件系统** | Shopify、Figma、Grafana、Envoy | 安全的第三方代码执行，替代"允许任意代码"的安全噩梦 |
| **边缘计算** | Fermyon Spin | 处理 **7500 万 req/s** |
| **浏览器端重计算** | Figma 渲染引擎、DaVinci Resolve 预览、Squoosh 图像处理 | Figma 迁移后 3x 性能提升，20x 解析速度 |
| **服务网格** | Istio + Envoy WASM filters | WASM 插件已成为标准部署模式 |

**Chrome Platform Status 数据**：

- 2025 年底，Chrome 用户访问的网站中 **~5.5%** 使用 Wasm（稳步增长）
- 行业调查：**41% 开发者**已在生产环境使用 Wasm，28% 正在试点

---

## 7. 运行时生态

| 运行时 | 维护方 | WASI 支持 | 关键特性 |
|--------|--------|-----------|---------|
| **Wasmtime** | Bytecode Alliance | 0.2 ✅ / 0.3 实验性 | 参考实现，JIT/AOT 性能基准领先，2 年 LTS 支持 |
| **Wasmer** | Wasmer Inc | 0.2 ✅ | 多后端（LLVM、Cranelift、Singlepass）|
| **Spin** | Fermyon | 0.2 ✅ / 0.3 RC | 边缘/Web 应用框架，SpinKube → CNCF Sandbox |
| **wasmCloud** | wasmCloud | 0.2 ✅ | 分布式 Actor 模型，WebAssembly 组件编排 |
| **Node.js** | OpenJS | 实验性 | `node --experimental-wasi-unstable-preview1` |

**SpinKube → CNCF**：Spin 加入 CNCF Sandbox，使 Wasm 工作负载可通过 Kubernetes 直接调度（containerd shim），使用相同的 kubectl 和 Helm——这是云原生集成的实质性里程碑。

---

## 8. 限制与 2026 年现实检查

| 期望 | 现实（2026） | 展望 |
|------|-------------|------|
| "替代 Docker" | 边缘/FaaS/插件可行；通用后端微服务**尚不现实** | WASI 1.0 (2026-2027) + Threading 支持后可能突破 |
| "替代 JavaScript" | 不是替代，是**性能协处理器** | JSPI + Component Model 使协作更紧密 |
| "所有语言编译到 Wasm" | 40+ 语言支持，但 GC 语言刚成熟 | WasmGC 普及后，JVM 语言生态将快速增长 |
| "调试体验" | 已改善：DWARF + LLDB + VS Code 集成 | 持续向原生体验靠拢 |

> *"Solomon Hykes' famous tweet — 'If WASM+WASI existed in 2008, we wouldn't have needed to create Docker' — lit up every tech forum. Seven years on, it still has not fully come true. However, the gap has narrowed considerably."* — JavaCodeGeeks, 2026-04

---

## 9. 与相邻模块的关系

- **82-edge-ai**: Wasm 在边缘 AI 推理中的应用（ONNX Runtime Web、TensorFlow.js Wasm backend）
- **79-compiler-design**: 编译到 Wasm 的编译器设计（wasm32-wasip2 target、cargo-component）
- **34-blockchain-web3**: 区块链智能合约的 Wasm 运行时（EOS、Polkadot、NEAR）
- **20.8-edge-serverless**: Cloudflare Workers、Deno Deploy 的 Wasm 集成模式

---

## 参考来源

1. **W3C WebAssembly WG** — [WebAssembly 3.0 Specification](https://www.w3.org/TR/wasm-core-3/)
2. **Bytecode Alliance** — [Wasmtime LTS Policy](https://bytecodealliance.org/articles/wasmtime-lts), [Component Model](https://component-model.bytecodealliance.org/)
3. **JavaCodeGeeks** — [WebAssembly in 2026](https://www.javacodegeeks.com/2026/04/webassembly-in-2026.html), [Three Years of Almost Ready](https://www.javacodegeeks.com/2026/04/webassembly-in-2026-three-years-of-almost-ready.html)
4. **iBuidl** — [WebAssembly Production Use Cases 2026](https://ibuidl.org/blog/webassembly-production-use-cases-2026-20260310)
5. **DevNewsletter** — [State of WebAssembly 2026](https://devnewsletter.com/p/state-of-webassembly-2026/)
6. **Shahzad Bhatti** — [Building Polyglot Applications with WASM](https://weblog.plexobject.com/archives/7394)
7. **Cristhian.dev** — [WebAssembly Component Model Guide](https://blog.iamcristhian.dev/2026/04/webassembly-component-model-wasm-beyond-browser-2026)

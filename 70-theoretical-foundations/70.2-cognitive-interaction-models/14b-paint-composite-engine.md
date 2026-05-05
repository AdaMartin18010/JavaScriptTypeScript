---
title: "浏览器绘制与合成引擎原理"
description: "Browser Paint and Composite Engine Principles: Display Lists, Property Trees, Layer Squashing, Viz, RenderingNG, and GPU Compositing"
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
actual-length: "~18000 words"
english-abstract: "A deep technical analysis of browser paint and compositing engines, covering Chromium's RenderingNG architecture including Display Lists and Paint Chunks, the four Property Trees (Transform/Clip/Effect/Scroll), Layer Squashing heuristics, the Viz Display Compositor with Surface Aggregation, Out-of-Process Rasterization (OOP-R), Skia Ganesh vs Graphite, and the Three-tree architecture (Main/Pending/Active). Includes formal categorical models and TypeScript simulations."
references:
  - Chromium, "RenderingNG Architecture" (2021)
  - Chromium, "Compositor Thread Architecture" (2020)
  - Chromium, "Chromium Graphics / GPU Accelerated Compositing"
  - Google, "Inside look at modern web browser — Part 3 & 4" (2018)
---

# 浏览器绘制与合成引擎原理

> **理论深度**: 高级
> **前置阅读**: [14a-parsing-and-layout-engine.md](14a-parsing-and-layout-engine.md)
> **目标读者**: 浏览器引擎开发者、GPU 图形工程师、前端性能专家
> **核心问题**: 浏览器如何将布局结果转化为屏幕像素？Property Trees 如何革命性地改变了合成架构？

---

## 目录

- [浏览器绘制与合成引擎原理](#浏览器绘制与合成引擎原理)
  - [目录](#目录)
  - [1. 历史脉络：从软件渲染到 GPU 合成](#1-历史脉络从软件渲染到-gpu-合成)
  - [2. Paint：从布局到绘制指令](#2-paint从布局到绘制指令)
    - [2.1 Display List 与 Paint Chunk 的数据结构](#21-display-list-与-paint-chunk-的数据结构)
    - [2.2 Paint 的代数结构：绘制指令的组合语义](#22-paint-的代数结构绘制指令的组合语义)
    - [2.3 Skia 图形库：Ganesh vs Graphite](#23-skia-图形库ganesh-vs-graphite)
    - [2.4 CompositeAfterPaint (CAP)：绘制后的合成决策](#24-compositeafterpaint-cap绘制后的合成决策)
  - [3. Property Trees：RenderingNG 的核心架构变革](#3-property-treesrenderingng-的核心架构变革)
    - [3.1 为什么需要 Property Trees](#31-为什么需要-property-trees)
    - [3.2 Transform Tree：累积 4×4 变换矩阵](#32-transform-tree累积-44-变换矩阵)
    - [3.3 Clip Tree：祖先裁剪区域的交集](#33-clip-tree祖先裁剪区域的交集)
    - [3.4 Effect Tree：透明度、滤镜与混合模式](#34-effect-tree透明度滤镜与混合模式)
    - [3.5 Scroll Tree：嵌套滚动容器](#35-scroll-tree嵌套滚动容器)
    - [3.6 PropertyTreeState：4 元组与 O(1) 查找](#36-propertytreestate4-元组与-o1-查找)
  - [4. Layer 与合成](#4-layer-与合成)
    - [4.1 Layer 的创建条件与 PaintLayer](#41-layer-的创建条件与-paintlayer)
    - [4.2 Layer Squashing：避免层爆炸的启发式规则](#42-layer-squashing避免层爆炸的启发式规则)
    - [4.3 GraphicsLayer 与 PlatformLayer](#43-graphicslayer-与-platformlayer)
    - [4.4 Overlap Testing：强制合成的相交检测](#44-overlap-testing强制合成的相交检测)
  - [5. Three-tree Architecture：主线程与合成线程的解耦](#5-three-tree-architecture主线程与合成线程的解耦)
    - [5.1 Main Thread Tree vs Impl Tree](#51-main-thread-tree-vs-impl-tree)
    - [5.2 Commit：同步握手机制](#52-commit同步握手机制)
    - [5.3 Pending Tree → Active Tree](#53-pending-tree--active-tree)
    - [5.4 CCProxy 与 CCScheduler](#54-ccproxy-与-ccscheduler)
  - [6. Rasterization：光栅化](#6-rasterization光栅化)
    - [6.1 CPU vs GPU Rasterization](#61-cpu-vs-gpu-rasterization)
    - [6.2 Out-of-Process Rasterization (OOP-R)](#62-out-of-process-rasterization-oop-r)
    - [6.3 Tile Priority 与 Checkerboarding](#63-tile-priority-与-checkerboarding)
    - [6.4 Raster Cache 与预光栅化策略](#64-raster-cache-与预光栅化策略)
  - [7. Viz：Display Compositor](#7-vizdisplay-compositor)
    - [7.1 Viz 进程双线程架构](#71-viz-进程双线程架构)
    - [7.2 CompositorFrame 与 DrawQuad](#72-compositorframe-与-drawquad)
    - [7.3 Surface Aggregation](#73-surface-aggregation)
    - [7.4 Trees in Viz (TiV) / JellyMander](#74-trees-in-viz-tiv--jellymander)
  - [8. 范畴论语义：合成的形式化模型](#8-范畴论语义合成的形式化模型)
  - [9. 对称差分析：Pre-RenderingNG vs RenderingNG](#9-对称差分析pre-renderingng-vs-renderingng)
  - [10. 工程决策矩阵](#10-工程决策矩阵)
  - [11. 反例与局限性](#11-反例与局限性)
  - [第 8 章提出的范畴论语义是一种理想化的数学模型，它假设绘制操作是纯粹的状态转换，且满足结合律与恒等律。然而，实际 GPU 绘制并非纯函数：浮点精度差异、混合模式的非结合性、以及纹理采样的滤波误差，都可能导致数学上等价的操作序列产生视觉上略有差异的结果。这意味着，虽然范畴论为架构设计提供了直觉与指导，但最终的优化决策仍需依赖像素级比较测试与 GPU 驱动的兼容性验证。范畴论模型是设计之锚，而非实现之 Guarantee](#第-8-章提出的范畴论语义是一种理想化的数学模型它假设绘制操作是纯粹的状态转换且满足结合律与恒等律然而实际-gpu-绘制并非纯函数浮点精度差异混合模式的非结合性以及纹理采样的滤波误差都可能导致数学上等价的操作序列产生视觉上略有差异的结果这意味着虽然范畴论为架构设计提供了直觉与指导但最终的优化决策仍需依赖像素级比较测试与-gpu-驱动的兼容性验证范畴论模型是设计之锚而非实现之-guarantee)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Property Tree 状态模拟器](#示例-1property-tree-状态模拟器)
    - [示例 2：Display List 组合代数验证器](#示例-2display-list-组合代数验证器)
    - [示例 3：Layer Squashing 启发式模拟器](#示例-3layer-squashing-启发式模拟器)
    - [示例 4：Commit/Activate 双缓冲时序模拟](#示例-4commitactivate-双缓冲时序模拟)
    - [示例 5：Tile Priority 调度器](#示例-5tile-priority-调度器)
    - [示例 6：Viz Surface Aggregation 可视化](#示例-6viz-surface-aggregation-可视化)
  - [参考文献](#参考文献)

---

## 1. 历史脉络：从软件渲染到 GPU 合成

浏览器渲染引擎的演进史，本质上是一部从 CPU 软件光栅化向 GPU 驱动的合成流水线迁移的历史。在 2000 年代初期，所有主流浏览器均采用纯软件渲染模式：布局完成后，渲染后端直接在 CPU 上执行像素级操作，将 RenderObject 树遍历的结果逐行写入共享内存位图，再由操作系统窗口管理器将位图输出到屏幕。这种架构的优势在于实现简单、跨平台一致性强，且对硬件无依赖；然而其根本缺陷在于时间复杂度与屏幕像素数量成线性关系——每一次重绘都需要遍历完整的绘制对象列表，并重新计算每个像素的颜色值。当页面复杂度上升，例如多层半透明覆盖、固定背景、CSS 阴影同时存在时，CPU 光栅化很容易成为性能瓶颈，导致滚动帧率下降至不可接受的水平。

2008 年前后，随着 WebKit 项目引入 Accelerated Compositing，浏览器开始尝试利用 GPU 的并行能力。最初的思路非常朴素：将页面中某些特殊元素如 video、canvas、插件提升为独立的 GPU 纹理，其余内容仍由 CPU 渲染成一张大位图，最后由 GPU 将这些纹理合成到帧缓冲区。这一阶段的 GPU 利用率极低，合成器本质上只是一个纹理混合器。然而，它验证了关键假设：只要将静态内容缓存为 GPU 纹理，动画尤其是变换与透明度动画就可以绕过昂贵的主线程重绘，直接在 GPU 上通过修改纹理坐标或混合参数完成。

2011 年至 2014 年间，Chrome 团队推动了 Layer-based Compositing 的全面落地。Blink 渲染引擎在布局树之上构建了 PaintLayer 与 GraphicsLayer 两层抽象：前者决定哪些元素需要合成层，后者将合成层映射到平台相关的硬件层。这一时期的核心优化是引入了脏矩形与重绘区域追踪，但根本性的数据结构问题仍未解决——所有变换、裁剪、透明度和滚动偏移都直接存储在 Layer Tree 的节点上，导致任何局部属性的变化都可能触发整条链路的递归更新。此外，Layer 的数量直接受限于 GPU 显存与合成器的调度能力，早期版本的层爆炸问题频发，一个具有大量 will-change: transform 元素的页面可能在瞬间创建数百个 GPU 纹理，导致内存崩溃。

2018 年至 2021 年，Chromium 启动了代号为 RenderingNG 的重构项目，其核心目标是将绘制、光栅化与合成彻底解耦。RenderingNG 引入了四大 Property Trees，将原本嵌入 Layer Tree 的属性抽取为独立的数据结构，使得合成层可以共享同一组属性节点，从而将属性更新的复杂度从 O(depth) 降至 O(1)。与此同时，Display List 以 PaintOpBuffer 为核心，取代了立即模式绘制，绘制指令被序列化为可重放、可传输、可缓存的中间表示。Skia 图形库也从纯 CPU 后端演进为 GPU-first 的 Ganesh 后端，并正在向基于 Dawn/WebGPU 的 Graphite 后端迁移。Viz 作为独立的 Display Compositor 进程，负责跨 iframe、跨进程的帧聚合，将渲染器进程从复杂的合成计算中解放出来。

2024 年以后，Chromium 进一步推进 Trees in Viz 与 JellyMander 项目，将原本运行在 Renderer 中的帧合成核心计算迁移至 Viz 进程。这一架构调整不仅提升了站点隔离下的合成效率，也为跨文档视图过渡和高级混合效果提供了统一的合成上下文。至此，现代浏览器的绘制与合成引擎已经演变为一个高度并行化、分布式、形式化属性管理的复杂系统，其设计哲学深刻影响了 Web 平台的能力边界。

---

## 2. Paint：从布局到绘制指令

### 2.1 Display List 与 Paint Chunk 的数据结构

在 Chromium 的 RenderingNG 架构中，Paint 阶段的核心输出不再是立即渲染到屏幕的像素，而是一个名为 Display List 的结构化指令序列。Display List 的物理载体是 cc::PaintOpBuffer，这是一个在内存中连续存储的 PaintOp 数组。每个 PaintOp 都是一个经过精心设计的 POD 结构体，其类型标签 PaintOpType 决定了后续载荷的解析方式。常见的 PaintOp 类型包括：DrawRectOp、DrawRRectOp、DrawPathOp、DrawTextBlobOp、DrawImageOp、SaveOp、RestoreOp、ConcatOp、SetMatrixOp、ClipRectOp、ClipRRectOp、DrawRecordOp 以及 PaintShaderOp 等。

PaintOpBuffer 的设计遵循零拷贝与缓存友好原则。所有 PaintOp 实例都通过 placement new 在一块连续的 base::AlignedStorage 内存上构造，避免了频繁的堆分配与指针跳转。每个 PaintOp 的大小被限制在 64 字节以内，确保单个缓存行可以容纳至少一个完整指令，从而最大化 CPU 预取效率。对于变长数据，如文本的 glyph 数组、图像的 SkImage 引用、路径的 SkPath 数据，PaintOp 本身只存储一个指向共享不可变数据的句柄，而实际的数据则存放在一块与之伴生的 PaintOpBuffer side-data 区域中。这种分离策略使得 PaintOpBuffer 的主体部分可以被廉价地序列化、哈希与比较，而无需深拷贝大型资源。

Paint Chunk 是 Display List 之上的更高层抽象。一个 Chunk 对应于一个具有相同 PropertyTreeState 的连续 PaintOp 子序列。换言之，当遍历布局树并生成 PaintOp 时，如果当前元素的变换、裁剪、效果与滚动属性相对于前一个元素发生了变化，引擎就会关闭当前 Chunk 并开启一个新的 Chunk。每个 Paint Chunk 包含以下元数据：

- bounds: 该 Chunk 在局部坐标系下的包围矩形，用于快速剔除。
- drawable_bounds: 实际需要绘制的有效区域，考虑了裁剪后的结果。
- properties: 一个 PropertyTreeState 实例，记录了该 Chunk 对应的 Transform Tree 节点、Clip Tree 节点、Effect Tree 节点与 Scroll Tree 节点的索引。
- begin_index / end_index: 在所属 PaintOpBuffer 中的起止偏移量。

Paint Chunk 的划分是后续合成决策 CompositeAfterPaint 的基础。CAP 算法会分析 Chunk 序列，决定哪些 Chunk 需要被提升为合成层，哪些 Chunk 可以合并到同一个 backing surface 上光栅化。由于 Chunk 的边界天然地与属性变化点对齐，CAP 无需在绘制阶段就做出精确的合成判断——它可以在绘制完成后，基于完整的 Chunk 属性信息进行全局优化。这一延迟决策机制是 RenderingNG 相比 Pre-RenderingNG 的关键优势之一。

绘制指令的序列化和反序列化发生在 GPU 光栅化路径中。当 Renderer 进程决定采用 Out-of-Process Rasterization 时，PaintOpBuffer 需要被序列化为 IPC 消息传输到 GPU 进程。序列化过程并非简单的内存 memcpy，而是一个语义感知的扁平化过程：

1. 句柄解析：所有 sk_sp<SkImage>、SkTextBlob、SkPath 等资源句柄被替换为跨进程共享的 GpuMemoryBuffer ID 或 TransferableResource 标识符。
2. Shader 内联：Skia 的 SkShader 对象如线性渐变、径向渐变、图案填充被编译为 SkSL 源码字符串，并随 PaintOp 一起传输。
3. 矩阵压缩：4×4 变换矩阵被量化为 32 位浮点数组，并利用矩阵间的相似性进行增量编码。
4. 版本标记：序列化流头部包含 PaintOpSerializer 版本号与校验和，确保 GPU 进程端的反序列化器可以安全地解析。

反序列化在 GPU 进程的 PaintOpDeserializer 中完成。它从共享内存映射中读取字节流，重建 PaintOpBuffer，并将资源句柄重新绑定到 GPU 纹理对象。值得注意的是，序列化与反序列化对是零分配的：GPU 进程直接在新分配的 PaintOpBuffer 内存上做 placement new，无需临时堆容器。这一设计将大型页面的 OOP-R 启动延迟控制在毫秒级别。

### 2.2 Paint 的代数结构：绘制指令的组合语义

Display List 不仅仅是一个指令列表，它在数学上构成一个组合代数，使得绘制操作的合并、拆分与等价变换具有形式化基础。将 PaintOp 的集合记为 P，Display List 的集合记为 D，我们可以定义以下代数结构：

单位元与连接运算：设空 Display List 为 e，二元连接运算为 op: D × D -> D。显然 (D, op, e) 构成一个自由幺半群，其中 e op D = D op e = D，且满足结合律 (D1 op D2) op D3 = D1 op (D2 op D3)。这一性质是 PaintOpBuffer 支持高效追加与拼接的理论基础。

PaintOp 叠加的半格结构：考虑两个 PaintOp p1, p2 在相同像素区域上的叠加效果。定义偏序关系为视觉不可区分性，即 p1 偏序于 p2 当且仅当对于所有背景像素 c_bg，有 Blend(p1, c_bg) = Blend(p2, c_bg)。则该结构构成一个交半格，其交运算对应于两个 PaintOp 的最小公共上近似。这一结构在渲染优化中具有实际意义：当两个连续的 PaintOp 作用于不相交的像素区域时，它们的顺序可以交换；当它们作用于相交区域时，引擎可以通过半格的交运算判断是否可以合并为一个等价的单一 PaintOp。例如，两个相邻的纯色矩形填充若颜色与混合模式相同，即可合并为一个更大的矩形。

Display List 的组合代数：更高阶地，Display List 本身可以被视为一个 Kleisli 范畴中的箭头，其中对象类型为画布状态，箭头为 D: State -> State。画布状态 S 包括当前变换矩阵、裁剪栈、混合模式、透明度与抗锯齿标志。每个 PaintOp 对应一个状态转换函数，而 SaveOp 与 RestoreOp 则提供了局部状态的作用域机制。这种范畴论语义使得 Display List 的记录-重放模式获得了严格的数学解释：记录阶段是构建一个从初始状态到最终状态的 Kleisli 箭头，重放阶段则是将该箭头应用于一个具体的 SkCanvas 实例。

Chromium 的 cc::PaintFilter 与 cc::PaintFlags 进一步扩展了代数结构。PaintFlags encapsulates 了颜色、混合模式、过滤器和着色器，而 PaintFilter 如 BlurPaintFilter、ColorFilterPaintFilter 则构成了图像处理流水线。这些滤镜的级联满足结合律但不满足交换律，因此它们构成一个非交换幺半群。在 GPU 光栅化路径中，Skia 的后端会将这一滤镜幺半群编译为单一的 GPU 片段着色器，从而将多次图像处理遍历合并为一次单通道绘制。这种代数驱动的编译优化是 Skia 高性能的关键。

### 2.3 Skia 图形库：Ganesh vs Graphite

Skia 是 Chromium 的底层 2D 图形库，其架构呈现清晰的三层分层：

1. SkCanvas：面向应用层的高阶 API，提供 drawRect、drawPath、drawText、drawImage 等绘制原语。SkCanvas 本身不直接操作 GPU，而是将绘制调用转换为内部的 SkRecord。
2. SkPicture：SkCanvas 的记录结果是一个不可变的 SkPicture 对象，它包含了按绘制顺序排列的 SkDrawOp 列表以及对应的画布状态快照。SkPicture 支持多次重放到不同的后端 Canvas 上，是实现光栅缓存的基础。
3. Skia GPU Backend：SkPicture 最终需要被光栅化为像素。Skia 的 GPU 后端负责将高层绘制指令翻译为 GPU 命令。目前存在两代 GPU 后端：Ganesh 与 Graphite。

Skia Ganesh 是当前默认后端，它是一个即时模式渲染器。在 Ganesh 中，每个 SkCanvas 绘制调用都会被立即转换为 GPU 命令，提交到命令缓冲区。Ganesh 维护了一个复杂的状态追踪系统，试图在 CPU 侧合并相邻的绘制调用以减少 GPU 状态切换。例如，多个颜色相同的矩形填充会被批处理为一次 instanced draw call。然而，Ganesh 的架构根植于早期的 OpenGL 时代，其状态追踪逻辑极为复杂，且对多线程的支持受限——大多数 Ganesh 操作必须在持有 GrDirectContext 锁的线程上执行。这成为 Chromium 在多核 CPU 上并行光栅化的瓶颈。

Skia Graphite 是下一代基于 Dawn/WebGPU 的 GPU 后端，采用显式的资源管理与任务图调度。Graphite 的核心设计哲学是预录制与提交分离：

- Recording Phase：SkCanvas 的绘制调用被记录到 skgpu::graphite::CommandBuffer 中，这一步骤完全无锁，可在多个线程上并行执行。
- Sorting Phase：CommandBuffer 中的绘制命令按照资源依赖关系与渲染通道边界进行拓扑排序，构建一个有向无环图。
- Submission Phase：排序后的命令被序列化为 Dawn 的 wgpu::CommandEncoder 指令，并一次性提交到 GPU 队列。

Graphite 的显式同步机制消除了 Ganesh 中隐式状态追踪的线程锁竞争，使得 Chromium 的 OOP-R 与多线程光栅化能够充分利用现代 CPU 的多核并行能力。此外，Graphite 原生支持显式纹理格式、Buffer 上传队列与 Render Pass 合并，这些特性对于实现高效的后处理滤镜与 MSAA 渲染到纹理至关重要。

Skia 的着色器编译缓存机制是连接 SkSL 与底层 GPU 着色器的关键。每当 Skia 遇到一个自定义的 SkShader，它会生成对应的 SkSL 源码，并通过 GrShaderCaps 将其转译为后端特定的着色器语言。编译后的着色器二进制码被缓存在一个基于 LRU 的 GrProgramCache 中，其键由着色器源码的哈希、GPU 驱动的版本标识与渲染目标格式共同决定。在 Chromium 中，这一缓存被持久化到磁盘，使得浏览器重启后仍能快速恢复常用着色器，避免首次绘制时的 JIT 编译卡顿。

### 2.4 CompositeAfterPaint (CAP)：绘制后的合成决策

在 Pre-RenderingNG 架构中，合成层 GraphicsLayer 的创建决策是在绘制之前做出的。
Blink 的 CompositingLayerAssigner 在布局完成后、绘制开始前就遍历 Layer Tree，根据元素的 CSS 属性决定哪些节点需要独立的合成层。
这种 Paint Before Composite 策略的问题是：合成决策缺乏对实际绘制内容的可见性。
例如，一个设置了 will-change: transform 的元素，如果其绘制内容极其简单如纯色背景，为其分配独立的 GPU 纹理反而是内存浪费；
反之，一个未设置任何合成提示的元素，如果其内容极其复杂，可能本应受益于合成缓存。

CompositeAfterPaint 将合成决策从绘制前移至绘制后。其工作流程如下：

  1. Paint 阶段：Blink 遍历布局树，生成包含所有 Paint Chunk 的 PaintOpBuffer。此时完全不考虑合成，所有元素都按文档顺序生成绘制指令。
  2. Chunk 分析阶段：CAP 算法读取 Paint Chunk 序列，分析每个 Chunk 的 PropertyTreeState、bounds 与绘制复杂度。
  3. Layer 生成阶段：基于启发式规则，CAP 将 Paint Chunk 分组，每组对应一个合成层 cc::Layer。分组的目标是最大化 GPU 纹理的复用率，同时最小化不必要的重绘。
  4. Property Tree 构建：CAP 为每个合成层分配 Property Tree 节点引用，确保共享相同变换、裁剪或效果的层可以指向同一属性节点。


CAP 的优势在于全局最优性。
由于它掌握了完整的绘制指令信息，可以进行跨元素的优化决策。
例如，CAP 可以识别出两个相邻的 Chunk 虽然属于不同的 DOM 元素，但它们的属性状态与空间位置高度一致，因此可以将它们合并到同一个 backing surface 上，从而避免层爆炸。
此外，CAP 使得合成层的粒度可以动态调整：在内存紧张的设备上，CAP 可以采用更激进的合并策略；
在 GPU 性能充裕的设备上，CAP 可以保留更多的独立层以提升动画响应速度。CAP 的延迟决策特性还使得 View Transitions API 的实现成为可能——浏览器可以在绘制完成后，基于最后一帧的 Display List 自动生成进入与退出动画的合成层，而无需开发者预先声明任何合成提示

---

## 3. Property Trees：RenderingNG 的核心架构变革

### 3.1 为什么需要 Property Trees

在传统的 Layer Tree 合成架构中，每个合成层节点 cc::Layer 都内嵌了完整的变换、裁剪、效果与滚动状态。这意味着，如果要计算某个层在屏幕上的最终位置，合成器必须从根节点开始，沿 Layer Tree 的父链一路向下，累积每个祖先节点的变换矩阵、裁剪区域与透明度。这一遍历的时间复杂度为 O(depth)，其中 depth 是 Layer Tree 的深度。对于现代 Web 应用中常见的深层嵌套 DOM 结构，Layer Tree 的深度可能达到数十甚至上百层。更糟糕的是，当动画驱动某个深层子节点的变换时，合成器仍然需要遍历其所有祖先以计算最终矩阵，即使这些祖先的变换在动画期间完全静态。

此外，Layer Tree 的节点数量与 DOM 元素数量之间没有明确的分界。在 Pre-RenderingNG 时代，Blink 的 PaintLayer 树与 GraphicsLayer 树几乎是一一映射的，导致合成层的数量直接受 DOM 规模驱动。一个拥有 1000 个 will-change: transform 元素的页面将创建 1000 个 GPU 纹理，这在移动设备上是灾难性的。Property Trees 的引入正是为了解决这两个根本性问题：

1. 属性与层的解耦：将变换、裁剪、效果、滚动从 Layer 节点中抽离出来，存储在独立的树形结构中。Layer 节点不再存储具体属性值，而是保存对 Property Tree 节点的引用。当属性变化时，只需更新 Property Tree 中的对应节点，所有引用该节点的 Layer 自动获得新属性，无需遍历 Layer Tree。
2. O(1) 属性查找：通过 PropertyTreeState 四元组，任何绘制或合成操作都可以直接定位到当前生效的属性节点，无需沿树回溯。
3. 属性共享与复用：多个 Layer 或 Paint Chunk 可以共享同一个 Transform 节点，从而大幅减少冗余存储。

Property Trees 的设计使得 RenderingNG 能够将绘制、光栅化与合成彻底解耦。绘制阶段只需生成带有 PropertyTreeState 的 Paint Chunk，无需关心这些 Chunk 最终会被分配到哪些合成层；合成阶段只需读取 Property Trees 的最新状态，无需关心绘制细节。这种解耦是现代浏览器支持 60fps 甚至 120fps 复杂动画的基石。

### 3.2 Transform Tree：累积 4×4 变换矩阵

Transform Tree 是 Property Trees 中最关键的一棵，它负责管理所有与空间变换相关的属性，包括 CSS transform 如 translate、rotate、scale、skew、matrix、matrix3d、perspective，transform-style: preserve-3d 以及滚动偏移。虽然滚动有独立的 Scroll Tree，但其最终效果通过 Transform Tree 的矩阵乘法体现。

每个 Transform Tree 节点存储以下核心字段：

- local_transform: 该节点自身对应的 4×4 变换矩阵。对于 2D 变换，该矩阵的第三行与第三列保持单位向量；对于 3D 变换如 rotateX、perspective，矩阵是满秩的 4×4 齐次坐标矩阵。
- parent_id: 父 Transform 节点的索引。根节点的 parent_id 为无效值。
- to_parent: 从当前节点坐标系到父节点坐标系的变换矩阵，即 local_transform。
- from_parent: to_parent 的逆矩阵（如果可逆）。对于包含投影或不可逆缩放的节点，from_parent 可能不存在，此时引擎会回退到数值求逆或标记为不可交互。
- compositor_element_id: 一个全局唯一的标识符，用于将 CC 动画直接绑定到该节点。当 CSS 动画或滚动偏移变化时，Compositor Thread 通过该 ID 找到对应节点并更新其 local_transform，无需访问 Layer Tree。

Transform Tree 的累积计算发生在合成线程的 UpdateTransforms 阶段。该阶段从根节点开始做一次广度优先遍历，对每个节点计算：to_screen = parent.to_screen × local_transform。其中 to_screen 表示从当前节点局部坐标系到屏幕坐标系的完整变换矩阵。由于现代 Web 页面中 Transform Tree 的深度通常远小于 Layer Tree，这一累积遍历的代价极低。更重要的是，当动画仅修改单个 Transform 节点时，引擎只需重新计算该节点及其子节点的 to_screen，而无需触碰树的其他分支。在 Layer Tree 架构中，同样的动画会触发从根到该节点整条路径的更新。

Transform Tree 还支持 sorting_context_id，用于处理 3D 变换的 Z 轴排序。当多个重叠元素都设置了 transform-style: preserve-3d 时，引擎需要依据它们在 3D 空间中的深度值决定绘制顺序，而非简单的文档顺序。这一功能在构建复杂的 3D CSS 场景如立方体、翻转卡片时至关重要。

### 3.3 Clip Tree：祖先裁剪区域的交集

Clip Tree 管理所有与可见区域裁剪相关的属性，包括 overflow: hidden、overflow: scroll、clip-path、border-radius 以及 SVG 的 clipPath。在传统的软件渲染中，裁剪通常通过 SkCanvas 的 clipRect/clipPath 操作实现，即 CPU 在绘制每个像素前检查其是否位于裁剪区域内。这种逐像素检查在 GPU 光栅化中效率极低，因为 GPU 的片段着色器无法轻易访问复杂的裁剪路径尤其是非凸的 clip-path。

Clip Tree 的核心思想是将裁剪区域也建模为树节点，使得 GPU 侧可以在顶点着色器或几何着色器阶段完成裁剪，或者在合成阶段通过 scissor rect 实现。每个 Clip Tree 节点存储：

- local_clip: 当前节点定义的局部裁剪区域，通常为 gfx::RectF 或 SkRRect。对于复杂的 clip-path，引擎会先将其光栅化为一个遮罩纹理，然后以 SkShader 的形式应用到后续绘制中。
- parent_id: 父 Clip 节点索引。
- combined_clip: 当前节点的局部裁剪区域与其所有祖先裁剪区域的交集。这是一个冗余缓存字段，在 Clip Tree 更新阶段计算一次，后续绘制阶段直接读取，避免运行时重复求交。
- applies_local_clip: 布尔标志，指示该节点是否真正贡献了新的裁剪。

Clip Tree 的革命性意义在于它将裁剪从绘制时的逐像素测试转变为合成时的区域管理。当一个滚动容器内部的内容发生滚动时，传统架构需要重绘被滚动移入视口的区域，因为裁剪区域发生了变化；而在 RenderingNG 中，滚动偏移通过 Transform Tree 处理，Clip Tree 的 combined_clip 保持不变，因此光栅化后的纹理无需任何修改，合成器只需调整纹理采样的 UV 坐标即可。这意味着滚动操作完全不需要主线程参与，也无需任何重光栅化，实现了真正的 Compositor-Only 滚动。

对于跨合成层的裁剪，例如一个设置了 overflow: hidden 的父元素与一个被提升为合成层的子元素，Clip Tree 节点可以被多个 Layer 共享。合成器在生成 CompositorFrame 时，会将 Clip Tree 节点翻译为 RenderPass 的 output_rect 或 scissor_rect，确保 GPU 在合成阶段自动执行裁剪，而无需在光栅化阶段考虑祖先裁剪。

### 3.4 Effect Tree：透明度、滤镜与混合模式

Effect Tree 管理所有与像素外观后处理相关的属性，包括 opacity、filter 如 blur、brightness、contrast、drop-shadow、hue-rotate，mix-blend-mode 如 multiply、screen、overlay，以及 backdrop-filter。这些效果在传统架构中通常作为 Layer 的属性内嵌，但它们的组合语义远比变换和裁剪复杂，因为许多效果尤其是混合模式与 backdrop-filter 需要访问当前像素背后的内容。

Effect Tree 的节点设计反映了这种复杂性。每个 Effect Tree 节点包含：

- opacity: 一个不透明度值 [0, 1]。当 opacity 动画时，Compositor Thread 可以直接插值该值，无需重光栅化。
- filter: 一个有序的 cc::FilterOperations 列表，每个操作对应一个图像处理步骤。滤镜在 GPU 上通常通过离屏渲染实现：先将 Layer 的内容渲染到临时纹理 FBO，然后对该纹理应用片段着色器滤镜，最后将结果纹理合成到父层。
- blend_mode: 一个 SkBlendMode 枚举值。混合模式定义了当前层像素与背后像素的颜色合成公式。标准混合模式如 src-over 可以在单次 GPU 绘制中完成；复杂混合模式如 color-dodge、difference 需要读取目标缓冲区的当前值，可能触发额外的 Render Pass。
- backdrop_filter: 这是最难处理的效果之一。backdrop-filter 要求在应用滤镜之前，先捕获当前元素背后的所有已绘制内容的快照。在 RenderingNG 中，这一捕获通过 Render Surface 实现：被 backdrop-filter 影响的区域会强制创建一个独立的 Render Surface，合成器先将父级内容绘制到该 Surface，然后以该 Surface 为输入纹理应用滤镜。
- render_surface_reason: 一个枚举值，解释为什么该 Effect 节点需要创建独立的 Render Surface。Render Surface 是 Effect Tree 与合成阶段的关键接口：每个需要后处理的 Effect 节点都对应一个 RenderPass，而 RenderPass 的输出就是 Render Surface 的纹理。

Effect Tree 的层级关系决定了后处理操作的嵌套顺序。例如，如果一个父元素设置了 opacity: 0.5，其内部子元素设置了 filter: blur(10px)，那么 Effect Tree 的父子关系确保了子元素先被模糊，然后整个子树包括模糊后的结果再被应用 0.5 的不透明度。这一顺序与 CSS 规范完全一致，但通过树结构的显式表达，避免了传统 Layer Tree 中因状态内嵌导致的顺序歧义。

### 3.5 Scroll Tree：嵌套滚动容器

Scroll Tree 是 Property Trees 中最晚引入但不可或缺的一棵。它的核心职责是管理滚动偏移，并将滚动行为与主线程解耦。在现代 Web 页面中，嵌套滚动容器极为常见：根视口滚动、侧边栏独立滚动、代码块横向滚动、模态框内部滚动等。每个滚动容器在 Scroll Tree 中对应一个节点。

Scroll Tree 节点的关键字段包括：

- scroll_offset: 当前的滚动偏移量，通常为一个 gfx::Vector2dF，支持分数像素以实现平滑滚动时的子像素定位。
- scrollable_bounds: 可滚动内容的总边界。
- container_bounds: 滚动容器本身的可见尺寸。
- scroll_chain: 指向父滚动容器的节点索引。当当前容器滚动到边界时，输入事件如滚轮、触摸滑动会沿 scroll chain 冒泡到父容器，这一行为称为 scroll chaining。
- compositor_element_id: 与 Transform Tree 类似，用于将输入事件处理器与 Compositor-driven 动画绑定到该节点。

Scroll Tree 与 Transform Tree 之间存在紧密的联动关系。Scroll Tree 节点的偏移量会被转换为一个平移矩阵，并作为对应 Transform Tree 节点的 local_transform 的一部分。具体而言，每个滚动容器在布局树中都有一个对应的滚动偏移变换节点，该节点在 Transform Tree 中的位置紧邻其内容子树的根节点。当用户滚动时，Compositor Thread 直接更新 Scroll Tree 节点的 scroll_offset，然后触发 Transform Tree 中对应节点的矩阵重算，最终影响所有引用该 Transform 节点的 Layer 的屏幕位置。

Compositor-driven 滚动也称为 Threaded Scrolling 或 Fast Scrolling，是 Scroll Tree 最核心的应用场景。当用户通过触摸或滚轮触发滚动时，输入事件首先被操作系统派发给浏览器的 UI 线程，然后快速转发给 Compositor Thread。Compositor Thread 查阅 Scroll Tree，确定哪个滚动容器应该响应，并直接更新其 scroll_offset。由于滚动偏移的更新完全在 Compositor Thread 上完成，且无需重布局或重光栅化，页面可以保持 60fps 或 120fps 的流畅滚动，即使主线程正忙于执行复杂的 JavaScript 计算。

对于非合成滚动，即滚动容器未被提升为合成层的情况，Scroll Tree 仍然记录其滚动状态，但滚动更新必须等待主线程处理。RenderingNG 的设计目标是最小化非合成滚动的场景，通过积极的层提升与 Paint Chunk 分析，确保绝大多数滚动容器都能享受 Compositor-driven 的流畅体验。

### 3.6 PropertyTreeState：4 元组与 O(1) 查找

PropertyTreeState 是连接 Paint、Layer 与 Compositing 三个阶段的统一状态标识符。它是一个轻量度的 4 元组：PropertyTreeState = (T, C, E, S)。其中 T 是 Transform Tree 节点索引，C 是 Clip Tree 节点索引，E 是 Effect Tree 节点索引，S 是 Scroll Tree 节点索引。

在 Pre-Property Trees 架构中，要确定一个元素当前的变换矩阵，引擎需要从该元素的 Layer 节点出发，沿父链一路回溯到根，逐层累积变换。这一过程的时间复杂度为 O(d)，其中 d 是 Layer Tree 深度。PropertyTreeState 通过将属性节点的引用扁平化为一个整数元组，将任何属性查找的复杂度降为 O(1)：给定一个 PropertyTreeState，引擎可以直接通过数组索引访问 Transform Tree、Clip Tree、Effect Tree 与 Scroll Tree 的对应节点，读取预计算的 to_screen、combined_clip、filter 与 scroll_offset。

PropertyTreeState 的不可变性是其高效性的另一关键。在 Paint 阶段，Blink 为每个布局对象计算其 PropertyTreeState。由于 Property Trees 的节点在单次 Paint 周期内是只读的，PropertyTreeState 可以被安全地复制、哈希与比较，而无需深拷贝任何矩阵或区域数据。Paint Chunk 的边界正是由 PropertyTreeState 的变化触发的：当遍历布局树时，如果当前元素的 PropertyTreeState 与上一个元素不同，就必须开启新的 Paint Chunk。

PropertyTreeState 的比较操作是渲染流水线中的热点路径之一。Chromium 对其进行了高度优化：四个节点索引被打包成一个 128 位整数，使得一次寄存器比较即可判定两个状态是否相同。在 Layer Squashing 与 CompositeAfterPaint 算法中，大量使用了 PropertyTreeState 的比较来决定哪些 Paint Chunk 可以合并到同一个合成层上。

此外，PropertyTreeState 还支持状态压栈语义。当进入一个新的 CSS 容器时，引擎会基于当前状态计算新的状态，并将新状态压入一个栈中；当离开该容器时，状态栈弹出，恢复到之前的 PropertyTreeState。这一机制确保了嵌套容器的属性隔离，同时保持了 O(1) 的访问效率。

---

## 4. Layer 与合成

### 4.1 Layer 的创建条件与 PaintLayer

在 Chromium 的合成架构中，并非所有渲染对象都需要独立的 GPU 层。合成层 Compositor Layer 的创建是一项需要权衡内存占用、合成开销与绘制性能的工程决策。Blink 引擎在布局与绘制阶段通过一套明确的规则决定哪些元素应当被提升为独立的合成层。

PaintLayer 的构建：在布局树之上，Blink 首先构建 PaintLayer 树。PaintLayer 的节点与布局对象一一对应。PaintLayer 树的作用是追踪哪些元素构成了独立的绘制上下文 Stacking Context。每个 PaintLayer 节点存储了自身的层叠级别 Z-Index、定位方案以及合成提示。然而，PaintLayer 树本身并不直接对应 GPU 纹理；它是合成决策的输入，而非输出。

Layer 提升的硬性条件：以下情况几乎总是导致元素被提升为 cc::Layer：

1. Video 元素：video 标签的内容由独立的媒体解码管道提供，其帧数据通过硬件视频解码器直接输出到 GPU 纹理，因此必须作为独立的合成层。
2. Canvas 元素：canvas 的 2D 或 WebGL 上下文可以直接渲染到 GPU 纹理，提升为合成层可避免每次更新都触发周围 DOM 的重光栅化。
3. 插件与 iframe（跨站点）：插件与跨站 iframe 运行在独立的渲染器进程或 GPU 纹理中，必须通过独立的 Layer 进行合成。
4. will-change: transform / opacity：CSS 的 will-change 属性是开发者向引擎发出的显式提示，表明该元素即将发生变换或透明度动画。引擎会预先将该元素提升为合成层，以避免动画开始时的层提升延迟。
5. 3D 变换：设置了 translate3d、rotateX、perspective 等 3D 属性的元素，通常需要独立的 Render Surface 以确保正确的深度排序与投影计算。
6. backface-visibility 与 transform-style: preserve-3d 与 backface-visibility: hidden 暗示了复杂的 3D 场景，通常触发层提升。
7. Reflection 与 Mask: CSS -webkit-box-reflect 与 mask-image 需要离屏渲染，因此创建独立的 Render Surface 与 Layer。
8. Fixed / Sticky 定位：固定定位元素相对于视口移动，在滚动时若与非合成层混合会导致频繁的脏矩形计算，因此通常被提升为合成层。

Layer 提升的启发式条件：除了上述硬性规则，引擎还会基于运行时性能数据做出启发式决策。例如，一个非常大的元素如占据整个视口的背景图，如果频繁发生局部重绘，引擎可能选择将其提升为层，以隔离重绘区域；反之，一个非常小的元素即使设置了 will-change，如果其内容极其简单如纯色矩形，引擎也可能选择不提升，以避免合成开销超过绘制节省。

CompositeAfterPaint 机制使得 Layer 提升决策可以在绘制完成后做出。CAP 分析 Paint Chunk 的复杂度，结合元素的 bounds 大小与动画概率，动态决定是否提升。这种后绘制决策显著减少了不必要的层数量，尤其是在大量使用 will-change 但动画从未触发的防御性编码场景中。

### 4.2 Layer Squashing：避免层爆炸的启发式规则

Layer Squashing 是 Chromium 合成器中防止层爆炸的关键机制。层爆炸指的是由于大量元素满足独立的层提升条件，导致合成层数量急剧增长，超出 GPU 显存或合成器调度能力的现象。例如，一个包含 100 个并列表项的网格布局，如果每个列表项都因为 will-change: transform 而被提升为独立层，将创建 100 个 GPU 纹理。即使每个纹理只有 100×100 像素，其总内存占用也可能达到数十 MB，加上合成时的 Draw Call 开销，性能反而下降。

Layer Squashing 的核心思想是：在满足特定条件的情况下，将多个相邻的合成层压缩到同一个 backing surface 上。压缩后的层在逻辑上仍然是独立的 cc::Layer 节点，但在物理上共享同一块像素存储。合成器在生成 CompositorFrame 时，会为这些被压缩的层生成独立的 DrawQuad，但它们的 resource_id 指向同一个共享纹理，只是 UV 坐标不同。

Squashing 的启发式规则包括：

1. 空间相邻性：只有当两个层在屏幕空间上的投影矩形相邻或重叠较小时，才考虑压缩。如果两个层相距甚远，共享同一纹理会导致大量空白像素浪费。
2. 属性兼容性：被压缩的层必须具有兼容的 PropertyTreeState，尤其是 Clip 与 Effect 节点。如果两个层处于不同的裁剪容器内，或一个层应用了 backdrop-filter 而另一个没有，它们不能被压缩。
3. 绘制顺序：Squashing 仅考虑在绘制顺序上连续的层。如果中间隔着一个必须独立合成的层如 video，则两端的层无法跨越该层进行压缩。
4. 内容复杂度阈值：引擎会估算每个层的绘制复杂度。如果两个层的内容复杂度之和低于某个阈值，压缩它们不会显著增加单次重绘的代价；反之，如果其中一个层极其复杂，压缩可能导致局部更新时必须重绘整个共享纹理，得不偿失。
5. 动画状态：正在执行 Compositor-driven 动画的层通常不被压缩，因为动画要求该层能够独立更新其变换或透明度而不影响相邻层。

在 CAP 架构下，Layer Squashing 的决策被集成到 CompositeAfterPaint 算法中。CAP 在分析 Paint Chunk 序列时，会构建一个合成层候选列表，然后迭代地尝试将候选层合并。合并过程是一个贪心算法：从第一个 Chunk 开始，依次向后检查下一个 Chunk 是否满足 Squashing 条件，直到遇到不满足条件的 Chunk，此时将之前累积的所有 Chunk 合并为一个合成层，然后开启新的合并窗口。贪心算法虽然不一定达到全局最优，但其 O(n) 的线性复杂度确保了即使对于包含数千个 Chunk 的页面，合成决策也能在毫秒级完成。

### 4.3 GraphicsLayer 与 PlatformLayer

GraphicsLayer 是 Blink 渲染引擎中的平台无关抽象，代表了浏览器逻辑中的一个合成层。每个 GraphicsLayer 实例包含以下关键信息：

- contents_opaque: 布尔值，指示该层的内容是否完全不透明。如果为 true，合成器可以跳过该层背后内容的绘制，从而节省 GPU 填充率。
- draws_content: 布尔值，指示该层是否实际包含可绘制内容。某些层仅作为容器存在。
- background_color: 层的背景色，用于在内容未覆盖整个层边界时填充空白区域。
- paint_invalidation_rect: 脏矩形区域，指示自上一帧以来哪些区域需要重绘。
- cc_layer_id: 对应 cc::Layer 的标识符，用于与 Chromium Compositor 模块通信。

PlatformLayer 是 GraphicsLayer 在特定操作系统或渲染后端上的具体实现。在 macOS 上，PlatformLayer 对应 CALayer；在 Android 上，对应 SurfaceFlinger 的 Layer 或 HwuiLayer；在 Windows 上，对应通过 DirectComposition 创建的 IDCompositionVisual。GraphicsLayer 到 PlatformLayer 的映射由 cc::LayerTreeHost 通过平台适配层完成。

这一分层抽象的优势在于：Blink 只需关心逻辑层的属性与内容生成，无需处理不同平台 GPU API 的差异。例如，当 Blink 要求将一个 GraphicsLayer 的内容更新为新的位图时，它只需将 PaintOpBuffer 提交给 CC；CC 根据当前平台选择使用 Skia Ganesh 或 Graphite 进行光栅化，然后将生成的纹理句柄传递给 PlatformLayer。在 Android WebView 或 Electron 等嵌入场景中，PlatformLayer 可以被替换为自定义实现，而 Blink 的上层逻辑完全无需修改。

### 4.4 Overlap Testing：强制合成的相交检测

Overlap Testing 是合成器中一项关键的自校正机制，用于处理隐式合成需求。即使一个元素不满足任何显式的层提升条件，如果它在屏幕空间上与某个已提升的合成层相交，且其绘制顺序位于该合成层之后，引擎也可能被迫将该元素提升为合成层。原因很直观：如果非合成层的内容直接绘制在合成层的 backing texture 上，那么当合成层发生动画时，其原本被非合成层覆盖的区域会暴露出来，暴露出错误的背景内容。

Overlap Testing 的工作流程如下：

1. Rect 收集：在 Paint 阶段完成后，引擎收集所有已确定提升的合成层的屏幕空间包围矩形，存储为一个 gfx::Rect 列表。
2. 候选遍历：引擎再次遍历所有未被提升的 PaintLayer，计算其在屏幕空间上的投影矩形。
3. 相交检测：对于每个候选层，使用轴对齐包围盒 AABB 相交测试，检查其投影矩形是否与任何已合成层的矩形相交。相交检测通常采用扫描线算法或空间哈希加速，将复杂度从 O(n^2) 降至接近 O(n log n)。
4. 强制提升：如果候选层与某个已合成层相交，且根据 Paint Order 该候选层绘制在该合成层之上，则引擎强制将该候选层提升为合成层。这一强制提升会递归触发新的 Overlap Testing。

强制合成的连锁反应是层爆炸的主要成因之一。例如，一个页面底部有一个固定定位的页脚被提升为合成层，页脚上方有一个普通的段落文本。如果段落文本的投影矩形与页脚重叠，引擎将被迫将段落文本提升为合成层。如果段落上方还有一个图片，图片的矩形又与段落文本层重叠，图片也会被提升。如此连锁，可能导致整个页面的大部分内容都被提升为独立层。CAP 与 Layer Squashing 的引入部分缓解了这一问题：CAP 允许引擎在绘制后更精确地判断哪些重叠是真正需要强制合成的；Squashing 则可以将被强制提升的相邻层压缩到同一 backing surface，减少实际的 GPU 纹理数量。

---

## 5. Three-tree Architecture：主线程与合成线程的解耦

### 5.1 Main Thread Tree vs Impl Tree

Chromium 的合成器采用了一种独特的三棵树架构来实现主线程与合成线程的解耦。这三棵树分别是：

1. Main Thread Tree：由 cc::LayerTreeHost 管理，运行在 Blink 主线程上。它反映了当前文档的最新布局与绘制状态，是 Paint 与 CAP 算法的输出载体。Main Thread Tree 的节点是 cc::Layer 实例，包含了完整的 Layer 属性、PaintOpBuffer 引用以及 Property Trees 的副本。
2. Pending Tree：由 cc::LayerTreeHostImpl 管理的一个中间树，运行在合成线程上。当主线程完成一帧的绘制与合成决策后，它通过 Commit 将数据推送到 Pending Tree。Pending Tree 是一个待激活的状态，它包含了主线程传来的最新 Layer 数据与 Property Trees，但尚未被用于生成实际的屏幕帧。
3. Active Tree：同样由 cc::LayerTreeHostImpl 管理，是合成线程上真正用于生成帧的树。Compositor Thread 从 Active Tree 读取 Layer 与 Property Tree 状态，执行光栅化（如果需要）、生成 CompositorFrame 并提交给 Viz。

Pending Tree 与 Active Tree 的存在构成了双缓冲机制。当主线程推送新一帧的数据到 Pending Tree 时，合成线程可以继续从 Active Tree 生成帧，确保显示不中断。只有在 Pending Tree 的数据完全准备就绪后，Pending Tree 才会被激活为新的 Active Tree，旧的数据则被丢弃。

Main Thread Tree 与 Impl Tree 之间的关键差异在于数据的可变性。Main Thread Tree 的节点可以在任何时候被 Blink 修改；而 Impl Tree 的节点在 Activate 之前是只读的，Compositor Thread 只能通过动画系统修改 Property Tree 中的特定字段，而不能改变树的拓扑结构。如果动画需要改变树的拓扑，则必须等待主线程的下一次 Commit。

### 5.2 Commit：同步握手机制

Commit 是主线程向合成线程推送数据的同步点。它是一个阻塞握手过程，具体流程如下：

1. BeginFrame：由 Viz 的 DisplayScheduler 触发，通过 Mojo IPC 向 Renderer 进程的 cc::LayerTreeHost 发送 BeginFrame 信号，携带目标帧的时间戳。
2. Main Thread 更新：Blink 主线程在收到 BeginFrame 后，执行 JavaScript、样式计算、布局、绘制与 CAP。最终生成更新后的 Layer Tree、Property Trees 与 PaintOpBuffer。
3. Commit 请求：cc::LayerTreeHost 调用 LayoutAndPaintAsync，准备将数据序列化并传输到合成线程。
4. 阻塞等待：主线程调用 CommitToPendingTree，这一操作会获取一个跨线程锁 CommitLock，并将序列化后的 Layer Tree 数据写入共享内存或 Mojo 消息管道。在数据传输期间，主线程可能会被短暂阻塞，以确保合成线程获得一致的数据快照。
5. 合成线程接收：合成线程的 cc::LayerTreeHostImpl 在收到 Commit 数据后，反序列化并构建 Pending Tree。
6. Ack 返回：合成线程向主线程发送 CommitComplete 确认，主线程释放 CommitLock，继续处理下一事件循环周期。

Commit 的阻塞性质是一个经过深思熟虑的工程权衡。虽然非阻塞 Commit 可以减少主线程的停顿，但它会引入数据竞争与状态不一致的风险。Chromium 通过将 Commit 设计为原子快照操作，确保了合成线程看到的数据始终是一个完整的、一致的帧状态。为了减少阻塞时间，Commit 采用了增量传输策略：只有自上次 Commit 以来发生变化的 Layer 属性与 Paint Chunk 才会被序列化，未变化的 Layer 只传输一个未变化标记。

### 5.3 Pending Tree → Active Tree

Pending Tree 到 Active Tree 的激活是三棵树架构中的核心状态转换。这一转换发生在合成线程上，无需主线程参与，因此可以在主线程繁忙时依然完成帧的更新。

激活的触发条件取决于当前的光栅化策略：

- 同步光栅化：如果所有需要更新的 Tile 在 Commit 完成后立即被光栅化，Pending Tree 可以在 Commit 完成后立即激活。
- 异步光栅化：更常见的情况是，Tile 的光栅化由一组 Worker Thread 异步完成。Pending Tree 会维护一个未就绪 Tile 计数器，每当一个 Worker 完成某个 Tile 的光栅化并向 Pending Tree 提交结果时，计数器递减。只有当计数器归零时，Pending Tree 才会被激活。
- 强制激活：如果自 Commit 以来已经过了多个 VSync 周期，而某些高优先级 Tile 仍未完成光栅化，合成器可能会选择强制激活 Pending Tree，即使部分低优先级 Tile 尚未就绪。未就绪的 Tile 会在屏幕上显示为空白或低分辨率占位图，直到后续光栅化完成后再替换为高清内容。

激活操作本身是一个轻量的指针交换：LayerTreeHostImpl 将内部的 active_tree_ 指针指向 pending_tree_，并将旧的 Active Tree 移入回收池。由于 Layer Tree 与 Property Trees 的数据结构采用了不可变设计，指针交换不会导致数据竞争。激活完成后，Compositor Thread 开始基于新的 Active Tree 生成 CompositorFrame。

双缓冲机制的优势在滚动场景中体现得最为明显。当用户快速滚动时，主线程可能来不及为每一帧都提交新的 Layer Tree。然而，Compositor Thread 可以独立地更新 Active Tree 中的 Scroll Tree 节点与 Transform Tree 节点，持续生成新的帧。只有当滚动触发了非合成滚动时，才需要等待主线程的 Commit。

### 5.4 CCProxy 与 CCScheduler

CCProxy 是 Chromium Compositor 的代理抽象层，用于隔离单线程模式与多线程模式的差异。在单线程模式下，cc::SingleThreadProxy 将 LayerTreeHost 与 LayerTreeHostImpl 运行在同一个线程上，Commit 与 Activation 都变为同步调用，无需 IPC 或线程锁。在多线程模式下，cc::ThreadedChannel 与 cc::SchedulerProxy 负责跨线程通信。

CCScheduler 是合成线程上的中央调度器，它协调 Commit、Paint、Rasterization 与 Frame Submission 的时序，以确保帧率稳定并最小化延迟。CCScheduler 的核心状态机包括以下状态：

- Idle：没有待处理的 BeginFrame，合成器处于空闲状态。
- BeginFrame：收到 Viz 的 BeginFrame 信号，开始准备新一帧。
- Commit：主线程正在执行布局、绘制与 Commit。
- Pending：Commit 完成，Pending Tree 已更新，等待光栅化完成。
- Activating：所有 Tile 就绪，正在执行 Pending 到 Active 的激活操作。
- Drawing：基于 Active Tree 生成 CompositorFrame 并提交给 Viz。

CCScheduler 的调度策略考虑了多种因素：

- VSync 对齐：所有操作都尽量对齐到显示器的 VSync 信号，以避免画面撕裂。
- 主线程回压：如果主线程的 Commit 耗时过长，CCScheduler 可以向 Viz 请求跳过下一个 BeginFrame，从而避免合成线程生成过于陈旧的帧。
- Tile 优先级动态调整：在 Pending 阶段，CCScheduler 根据当前的视口位置与滚动方向，动态调整 Worker Thread 的 Tile 光栅化队列，确保高优先级 Tile 优先完成。
- 动画插值：对于 Compositor-driven 动画，CCScheduler 在每次 BeginFrame 时计算当前时间戳对应的插值状态，并将其写入 Active Tree 的 Property Tree 节点，无需等待主线程 Commit。

---

## 6. Rasterization：光栅化

### 6.1 CPU vs GPU Rasterization

光栅化是将矢量化的绘制指令转换为位图像素的过程。Chromium 支持两种主要的光栅化路径：CPU 光栅化与 GPU 光栅化。

CPU 光栅化由 Skia 的 CPU 后端执行。在这种模式下，SkCanvas 将 PaintOp 逐条解释并写入一块主内存中的位图缓冲区。CPU 光栅化的优势在于：

- 精确性：CPU 浮点运算的精度高于某些低端 GPU 的片段着色器，尤其是在处理复杂路径填充与次像素字体渲染时。
- 兼容性：不依赖 GPU 驱动，可在没有 GPU 或 GPU 驱动有缺陷的设备上可靠工作。
- 低开销：对于极小的绘制区域如 16×16 的图标，CPU 光栅化的启动开销低于 GPU。

然而，CPU 光栅化的缺点同样明显：它是单线程的，且受限于内存带宽。对于高分辨率屏幕上的大面积内容，CPU 光栅化无法达到实时性能。

GPU 光栅化由 Skia Ganesh 或 Graphite 后端执行。PaintOp 被翻译为 GPU 命令，由 GPU 的并行执行单元同时处理大量像素。GPU 光栅化的核心优势是吞吐量：现代 GPU 可以在一个时钟周期内处理成百上千个像素，远超 CPU 的串行能力。此外，GPU 光栅化天然支持 MSAA，可以在渲染到纹理时以更高的采样率生成平滑边缘，然后解析为最终纹理。

Chromium 采用混合策略：对于小 Tile，如果内容复杂度低，优先使用 CPU 光栅化；对于大 Tile 或包含复杂滤镜、3D 变换的内容，使用 GPU 光栅化。引擎还会根据设备的 GPU 能力与驱动稳定性动态切换光栅化后端。

MSAA 渲染到纹理：在 GPU 光栅化中，Chromium 经常使用 MSAA 渲染到纹理以提升抗锯齿质量。具体而言，Tile 的光栅化目标不是普通的 RGBA 纹理，而是一个多采样纹理。片段着色器在每个像素的多重采样点上执行，然后在 Render Pass 结束时解析为单采样纹理。MSAA 的代价是显存占用增加，但对于文本与小尺寸矢量图形的清晰度提升显著。

### 6.2 Out-of-Process Rasterization (OOP-R)

Out-of-Process Rasterization 是 Chromium 的一项关键安全与性能优化，它将光栅化操作从 Renderer 进程移至独立的 GPU 进程。

动机：在传统的 In-Process GPU 模式下，Renderer 进程直接通过 OpenGL/Direct3D/Vulkan 上下文调用 GPU 驱动。这一模式存在两个严重问题：

1. 安全性：GPU 驱动是操作系统内核级代码的扩展，历史上充满了内存安全漏洞。如果 Renderer 进程可以直接调用 GPU 驱动，恶意网页可能利用驱动的漏洞实现沙箱逃逸。
2. 稳定性：GPU 驱动崩溃会导致整个 Renderer 进程崩溃，用户体验极差。

OOP-R 通过将 GPU 调用隔离到独立的 GPU 进程来解决这些问题。Renderer 进程不再直接调用 GPU API，而是将 PaintOpBuffer 序列化为命令缓冲区，通过 IPC 发送给 GPU 进程。GPU 进程是唯一拥有实际 GPU 上下文的进程，它反序列化命令缓冲区，执行 Skia 光栅化，并将结果纹理的句柄返回给 Renderer 进程。

OOP-R 的架构细节：

- Command Buffer Service：GPU 进程中运行的服务，接收来自多个 Renderer 进程的命令缓冲区流。每个 Renderer 进程有一个独立的命令缓冲区通道，确保不同站点的命令不会交错。
- Skia DDL：为了最大化 OOP-R 的吞吐量，Skia 支持 DDL 模式。Renderer 进程在生成 PaintOpBuffer 时，可以预先将绘制指令记录为 DDL，DDL 是一个完全序列化的、自包含的指令包，可以被 GPU 进程直接反序列化并执行。
- 共享内存与同步：对于大型纹理资源，Renderer 进程通过 GpuMemoryBuffer 与 GPU 进程共享内存。这种方式避免了通过 IPC 复制大型位图数据。同步通过 GPU 围栏与信号量实现。

OOP-R 的代价是 IPC 开销与序列化反序列化延迟。然而，由于 Tile 光栅化通常是粗粒度的，单次 IPC 的固定开销被摊薄到大量绘制操作上。此外，Chromium 的 OOP-R 路径高度优化，序列化后的 PaintOpBuffer 可以直接映射到 GPU 进程的地址空间，实现零拷贝传输。

### 6.3 Tile Priority 与 Checkerboarding

在合成架构中，Layer 的内容不是以整张纹理存储的，而是被划分为固定大小的 Tile，通常为 256×256 或 512×512 像素。这种分块策略的优势在于：

1. 局部更新：当只有 Layer 的局部区域发生变化时，只需重光栅化受影响的 Tile。
2. 内存管理：视口外的 Tile 可以被卸载以节省显存。
3. 渐进加载：页面首次加载时，引擎优先光栅化视口内的 Tile，视口外的 Tile 可以延迟处理。

Tile Priority 是光栅化调度器决定哪个 Tile 应该先被处理的核心机制。每个 Tile 被赋予一个优先级分数，分数越低表示越优先。优先级的计算考虑了以下因素：

- 视口距离：Tile 的中心点到当前视口中心的欧几里得距离。距离越近，优先级越高。对于快速滚动场景，调度器还会预测未来的视口位置，并预先提升预测视口内 Tile 的优先级。
- 屏幕可见性：完全位于视口内的 Tile 优先级最高；部分可见的 Tile 次之；完全不可见的 Tile 优先级最低。
- Layer 优先级：属于活跃动画层或主内容层的 Tile 优先级高于背景层。
- 分辨率缩放：对于高 DPI 屏幕，Tile 以设备像素分辨率光栅化，其优先级计算也会考虑缩放因子。

Tile Priority 队列通常是一个多级优先级队列，由合成线程的 RasterTilePriorityQueue 管理。Worker Threads 从队列头部取出高优先级 Tile 进行光栅化，并将结果提交回 Pending Tree。

Checkerboarding 是 Tile 光栅化跟不上用户交互速度时的视觉瑕疵。当用户快速滚动页面时，如果新进入视口的 Tile 尚未完成光栅化，合成器无法显示其内容。此时，引擎在未就绪 Tile 上绘制一个棋盘格图案，向用户暗示内容正在加载。Checkerboard 是 Chromium 的默认行为，其图案通过一个简单的 GPU Shader 生成。

Checkerboarding 的发生频率是衡量光栅化性能的重要指标。Chromium 通过多种策略减少 Checkerboarding：

- 预光栅化：在空闲时段预先光栅化视口外一定范围内的 Tile。
- 渐进分辨率：对于高优先级 Tile，先以低分辨率快速光栅化并显示，然后在后台以全分辨率重新光栅化并替换。
- 放大旧 Tile：如果某个 Tile 的内容与上一帧相同只是位置因滚动而变化，合成器可以暂时将上一帧的 Tile 纹理拉伸到新位置，避免 Checkerboard。

### 6.4 Raster Cache 与预光栅化策略

Raster Cache 是合成器中用于缓存已光栅化 Tile 的内存池。其目标是避免对静态内容的重复光栅化，从而节省计算资源与能耗。

Raster Cache 的键由以下因素共同决定：

- Layer ID 与 Tile 坐标。
- Paint Generation ID：标识该 Tile 对应的 PaintOpBuffer 的版本。
- Scale Factor：光栅化时的分辨率缩放因子。
- Property Tree State 哈希。

Raster Cache 的值通常是一个 GPU 纹理或 CPU 位图。缓存采用 LRU 淘汰策略，并受限于总内存预算。当内存压力增大时，合成器会优先淘汰视口外的、低分辨率的或长时间未使用的缓存条目。

预光栅化策略是 Raster Cache 的主动扩展。除了按需光栅化外，合成器还会在以下场景主动填充缓存：

1. 空闲光栅化：当主线程与合成线程都处于空闲状态时，Scheduler 会触发 Idle Rasterization Task，预先光栅化当前视口周围一定范围内的 Tile。
2. 滚动预测：基于当前的滚动速度与加速度，预测未来几帧内可能进入视口的区域，并提前光栅化这些区域的 Tile。
3. 离屏图层：对于设置了 will-change: transform 但当前不在视口内的层，引擎可能选择预光栅化其内容。

预光栅化是一把双刃剑。过度激进的预光栅化会消耗大量内存与电池电量，尤其是在移动设备上。Chromium 通过启发式算法动态调整预光栅化的激进程度：在插电设备上，预光栅化范围更大；在电池供电且低电量模式下，预光栅化被大幅限制。此外，引擎还会监测历史 Checkerboarding 频率：如果某个页面频繁出现 Checkerboard，引擎会提升其预光栅化优先级；反之，如果页面静态且很少滚动，预光栅化会被抑制。

---

## 7. Viz：Display Compositor

### 7.1 Viz 进程双线程架构

Viz 是 Chromium 中负责最终帧合成的独立进程。在早期的 Chromium 架构中，CompositorFrame 的合成发生在 Renderer 进程内部，由 cc::LayerTreeHostImpl 直接调用平台相关的 GPU API 将纹理绘制到屏幕。然而，随着站点隔离与 OOPIF 的推进，一个浏览器窗口可能包含来自多个 Renderer 进程的帧。如果这些帧的合成仍然由各自的 Renderer 进程独立完成，浏览器将无法正确地跨进程混合 iframe 的内容。

Viz 的引入将帧合成从 Renderer 进程上移到了一个可信的、高优先级的独立进程中。Viz 进程内部采用双线程架构：

1. GPU Main Thread：负责与 GPU 驱动交互，包括创建销毁 GPU 上下文、管理纹理生命周期、执行 Skia 后端操作以及处理来自 Renderer 进程的 TransferableResource。GPU Main Thread 是 Viz 中唯一可以直接调用 GPU API 的线程。
2. Display Compositor Thread：负责接收来自多个 Renderer 进程的 CompositorFrame，执行帧聚合、Render Pass 排序、DrawQuad 分发，并生成最终的 CompositorFrame 提交给 Display。Display Compositor Thread 不直接调用 GPU API，而是将合成命令写入一个内部的命令列表，最终由 GPU Main Thread 消费。

双线程架构的优势在于解耦了策略与机制。Display Compositor Thread 可以专注于复杂的跨进程帧管理，而 GPU Main Thread 专注于高效的 GPU 命令提交。这种解耦还使得 Viz 可以在不阻塞 GPU 的情况下处理复杂的输入事件路由与帧调度。

### 7.2 CompositorFrame 与 DrawQuad

CompositorFrame 是 Viz 与 Renderer 之间交换帧数据的基本单元。它是一个轻量级的、可序列化的数据结构，包含了生成一帧画面所需的所有信息。一个 CompositorFrame 由以下核心部分组成：

- Render Pass List：一个有序的 RenderPass 数组。每个 Render Pass 代表一个离屏渲染步骤，其输出是一个纹理。Render Pass 之间可能存在依赖关系。
- DrawQuad List：在每个 Render Pass 内部，包含一个 DrawQuad 数组。DrawQuad 是合成的原子绘制原语，代表了在某个矩形区域内以某种方式绘制某个内容。常见的 DrawQuad 类型包括：
  - SolidColorDrawQuad：纯色填充。
  - TileDrawQuad：绘制一个已光栅化的 Tile 纹理。
  - StreamVideoDrawQuad：绘制视频帧。
  - SurfaceDrawQuad：绘制另一个 Surface 的内容，用于 iframe 嵌套。
  - TextureDrawQuad：绘制一个通用的 GPU 纹理。
  - RenderPassDrawQuad：绘制一个先前 Render Pass 的输出纹理，用于后处理链。
- Resource List：CompositorFrame 引用的所有外部资源的列表。每个资源通过一个全局唯一的 TransferableResource 标识。
- Metadata：包含帧的视口矩形、设备缩放因子、颜色空间与 HDR 元数据。

DrawQuad 的设计体现了合成的声明式哲学。Renderer 进程不直接命令 GPU 如何绘制，而是声明希望在屏幕的这块区域上看到这块内容，Viz 的 Display Compositor 负责将这些声明转换为实际的 GPU 命令。这种声明式架构使得 Viz 可以进行全局优化，例如合并相邻的 SolidColorDrawQuad 为一次 clear 操作，或将多个 TileDrawQuad 合并为一次 instanced draw call。

### 7.3 Surface Aggregation

Surface Aggregation 是 Viz 处理跨进程跨站点帧合成的核心机制。在 Chromium 中，每个可嵌入的渲染表面如主页面、跨站 iframe、portal 元素、OffscreenCanvas 都对应一个 viz::Surface。每个 Surface 拥有独立的 SurfaceId，并由一个独立的 Renderer 进程或同一个进程内的不同 LayerTreeHost 提交 CompositorFrame。

Surface Aggregation 的任务是将多个子 Surface 的 CompositorFrame 聚合成一个统一的、用于最终显示的 CompositorFrame。这一过程在 Viz 的 SurfaceAggregator 类中完成，其工作流程如下：

1. Surface 收集：Viz 维护一个 SurfaceManager，记录了当前所有活跃的 Surface 及其父子关系。当收到某个 Surface 的新 CompositorFrame 时，SurfaceAggregator 从根 Surface 开始，递归地遍历所有被引用的子 Surface。
2. Render Pass 合并：每个子 Surface 的 CompositorFrame 可能包含多个 Render Pass。SurfaceAggregator 将这些 Render Pass 按照依赖关系合并到一个全局的 Render Pass 列表中。如果子 Surface 的 Render Pass 与父 Surface 的 Render Pass 之间没有复杂的混合依赖，SurfaceAggregator 可以将子 Surface 的 DrawQuad 直接内联到父 Surface 的 Render Pass 中，避免创建额外的中间纹理。
3. 裁剪与遮挡剔除：在合并过程中，SurfaceAggregator 会计算每个 DrawQuad 的最终屏幕空间矩形，并与视口及祖先裁剪区域求交。完全被遮挡的 DrawQuad 会被直接剔除。
4. 资源去重：如果多个 Surface 引用了相同的资源，SurfaceAggregator 会确保该资源在最终的 CompositorFrame 中只出现一次。

Surface Aggregation 对于站点隔离的安全模型至关重要。由于跨站 iframe 运行在不同的 Renderer 进程中，主页面进程无法直接访问 iframe 的像素数据。Viz 作为可信的中介，是唯一能够同时访问所有 Surface 帧数据的实体。它确保了跨站内容可以被正确地合成，同时防止了侧信道攻击。

### 7.4 Trees in Viz (TiV) / JellyMander

Trees in Viz 与 JellyMander 是 Chromium 在 2024 年以后推进的下一代合成架构项目，其核心目标是将帧合成的核心计算从 Renderer 进程进一步迁移到 Viz 进程。

在 Pre-TiV 架构中，Renderer 进程的 cc::LayerTreeHostImpl 负责大量的合成前计算，包括 Property Tree 的累积与动画插值、Layer 的屏幕空间包围盒计算、Render Pass 的生成与排序、DrawQuad 的创建与资源绑定。这些计算虽然发生在合成线程上，但仍然消耗了 Renderer 进程的 CPU 资源，且对于跨站 iframe 场景，每个 Renderer 进程都需要独立执行类似的计算，导致重复的 CPU 开销。

TiV 的设计思想是：既然 Viz 已经接收了所有 Surface 的 CompositorFrame，并且拥有全局的视图信息，那么合成前的许多计算可以由 Viz 统一完成。具体而言，TiV 在 Viz 进程中引入了合成树：

- Viz Property Trees：Viz 维护一份轻量级的 Property Trees，这些树是从各个 Renderer 提交的 CompositorFrame 的元数据中重建的。Viz 使用这些树来计算跨 Surface 的变换、裁剪与效果。
- Viz Layer Tree：Viz 不再将每个 Surface 视为黑盒，而是解析其内部的 Layer 结构与 DrawQuad 分布，构建一个跨进程的全局 Layer Tree。这使得 Viz 可以进行更精细的全局优化。

JellyMander 是 TiV 的进一步演进，专注于将复杂的后处理效果从 Renderer 迁移到 Viz。在 JellyMander 架构中，Renderer 提交的 CompositorFrame 更加原始——它只包含未经后处理的 Paint Chunk 与基础 Property Tree 状态。Viz 的 Display Compositor 负责根据全局效果树决定如何组合这些原始帧，并生成最终的 GPU 命令序列。

TiV 与 JellyMander 的优势包括：

1. 跨进程优化：全局视野使得 Viz 可以执行 Renderer 无法做的优化。
2. 统一的动画系统：CSS 动画与 View Transitions 动画可以在 Viz 层面统一调度。
3. 降低 Renderer 负载：Renderer 进程可以更专注于 JavaScript 执行与布局。

然而，TiV 也引入了新的挑战：Viz 需要处理来自多个 Renderer 的大量元数据，其内存占用与计算复杂度上升；此外，跨进程的 Property Tree 同步需要更高效的 IPC 机制。Chromium 团队正在通过增量更新与共享内存环形缓冲区来缓解这些问题。

---

## 8. 范畴论语义：合成的形式化模型

Property Trees 与 Display List 的设计不仅是工程上的优化，它们还蕴含着深刻的范畴论结构。将绘制与合成系统建模为范畴，可以帮助我们形式化地证明某些优化的正确性，并为未来的架构演进提供数学指导。

范畴的基本定义：设浏览器渲染系统为一个范畴 C，其对象为像素状态，即屏幕或纹理上所有像素颜色的集合；其态射为绘制操作，即从一种像素状态到另一种像素状态的变换。每个 PaintOp 对应一个态射 f: A -> B，其中 A 是操作前的画布状态，B 是操作后的画布状态。态射的组合 g ∘ f 对应于连续执行两个 PaintOp。

Display List 作为自由范畴：所有可能的 PaintOp 序列构成了一个自由范畴 F(P)，其中生成集为 PaintOp 的集合 P。Display List D 是 F(P) 中的一个路径。连接运算对应于路径的拼接，空列表对应于单位路径。这一视角解释了为什么 PaintOpBuffer 的追加操作是结合律的，以及为什么空 Display List 是连接运算的单位元。

Property Trees 的积结构：四棵 Property Tree 可以被视为四个独立的范畴：

- T：变换范畴，对象为坐标系，态射为变换矩阵。
- L：裁剪范畴，对象为区域，态射为区域交集。
- E：效果范畴，对象为像素外观，态射为后处理函数。
- S：滚动范畴，对象为滚动偏移，态射为偏移更新。

PropertyTreeState 作为四元组 (T, C, E, S)，正是这四个范畴的积对象。积范畴的投射态射分别对应于从 PropertyTreeState 中提取 Transform、Clip、Effect 与 Scroll 节点的操作。积范畴的通用性质保证了：对于任何需要同时访问四种属性的绘制操作，存在唯一的态射从积对象到目标对象，这一唯一性正是 PropertyTreeState 能够一致地描述绘制上下文的数学基础。

Effect Tree 的余积结构：Effect Tree 的某些方面更适合用余积建模。考虑两个独立的视觉效果如一个元素的 opacity 与另一个元素的 blur，它们在合成时通常是并行应用的，即最终像素是两种效果独立作用后的某种聚合。在范畴论语义中，这对应于余积对象 E1 + E2，其内射将单个效果嵌入到联合效果空间中。Effect Tree 节点的 render_surface_reason 字段可以被视为一种余积选择器，它决定了从联合效果空间中应提取哪个分支进行处理。

Layer Tree 到 Render Surface 的函子：设 Layer Tree 构成的范畴为 Layer，其对象为 Layer 节点，态射为父子包含关系；设 Render Surface 构成的范畴为 Surface，其对象为 GPU 纹理，态射为纹理到纹理的绘制操作。则合成过程可以建模为一个函子 F: Layer -> Surface。函子 F 保持了结构：Layer Tree 中的父子关系被映射为 Render Surface 上的依赖关系。CompositeAfterPaint 与 Layer Squashing 可以被视为函子 F 的不同实现：CAP 选择了一个更优的函子映射，使得生成的 Render Surface 数量最小化，同时保持视觉等价性。

自然变换与动画：当动画改变 Property Tree 的状态时，可以将其建模为范畴 C 上的自函子 A: C -> C。动画的插值过程则是自函子之间的自然变换 α: A_t => A_{t+Δt}，其中 A_t 与 A_{t+Δt} 分别表示时间 t 与 t+Δt 时的绘制状态。自然变换的交换图保证了：无论我们先应用绘制操作再插值，还是先插值再应用绘制操作，最终的像素状态是一致的。这一性质正是 Compositor Thread 可以在不与主线程同步的情况下安全地插值 Transform 与 Scroll 属性的数学保证。

---

## 9. 对称差分析：Pre-RenderingNG vs RenderingNG

对称差是集合论中用于比较两个集合差异的操作。将其应用于浏览器渲染架构，可以精确地刻画 Pre-RenderingNG 与 RenderingNG 之间的结构性差异。

设 Pre-RenderingNG 的架构特征集合为 P，RenderingNG 的架构特征集合为 R。则对称差 P Δ R = (P \ R) ∪ (R \ P) 揭示了两种架构的根本差异点。

属于 P \ R 的特征（Pre-RenderingNG 有，RenderingNG 移除或弱化的）：

1. Layer-embedded Properties：在 Pre-RenderingNG 中，变换、裁剪、透明度与滚动偏移直接内嵌在 Layer Tree 节点中。RenderingNG 将这些属性抽取到独立的 Property Trees 中。
2. Paint Before Composite：Pre-RenderingNG 在绘制前就确定合成层。RenderingNG 采用 CAP，合成决策延迟到绘制完成后。
3. Immediate Mode Painting：Pre-RenderingNG 的绘制阶段直接调用 SkCanvas 的立即模式 API。RenderingNG 采用 Display List。
4. Layer Tree Depth-dependent Lookup：属性查找需要沿 Layer Tree 父链回溯，复杂度为 O(depth)。RenderingNG 通过 PropertyTreeState 实现 O(1) 查找。
5. Software Rasterization First：Pre-RenderingNG 以 CPU 软件光栅化为默认路径。RenderingNG 以 GPU 光栅化为默认路径。

属于 R \ P 的特征（RenderingNG 新增或强化的）：

1. Property Trees (T/C/E/S)：四棵独立的属性树是 RenderingNG 最核心的新增结构。
2. PaintOpBuffer & Display List：结构化的绘制指令列表。
3. CompositeAfterPaint (CAP)：绘制后的全局合成决策。
4. Layer Squashing in CAP：在绘制后基于完整信息进行层压缩。
5. OOP-R：将 GPU 光栅化隔离到独立进程。
6. Viz Display Compositor：独立的帧合成进程。
7. Skia Graphite Support：下一代显式 GPU 后端。
8. Threaded Scrolling by Default：通过 Scroll Tree 实现默认的 Compositor-driven 滚动。
9. Render Pass-based Compositing：合成阶段使用显式的 Render Pass 与 DrawQuad 原语。
10. Trees in Viz (TiV)：将合成计算从 Renderer 进一步迁移到 Viz 进程。

交集 P ∩ R（两种架构共有的核心特征）：

- GPU Texture Backing for Composited Layers。
- VSync-aligned Frame Submission。
- Dirty Rect Tracking。
- Tile-based Memory Management。

对称差分析揭示了 RenderingNG 并非对 Pre-RenderingNG 的修修补补，而是一次根本性的架构范式转移。Pre-RenderingNG 的设计假设是 Layer 是渲染的核心抽象，所有属性都依附于 Layer；RenderingNG 的设计假设是属性是独立的一等公民，Layer 只是属性的消费者之一。这一范式转移使得浏览器能够处理更复杂的 Web 内容，同时保持稳定的帧率与较低的内存占用。

---

## 10. 工程决策矩阵

浏览器绘制与合成引擎的设计充满了工程权衡。以下决策矩阵总结了关键设计选择及其 trade-offs：

| 决策维度 | 选项 A | 选项 B | 权衡分析 |
|---------|--------|--------|---------|
| 合成决策时机 | Pre-Paint | CAP | Pre-Paint 决策简单、开销低，但缺乏绘制内容信息，容易导致过度合成；CAP 拥有全局信息，可做出更优决策，但增加了 Paint 到 Composite 的延迟与内存占用。RenderingNG 选择 CAP，以延迟换取全局最优。 |
| 属性存储位置 | Layer-embedded | Property Trees | Layer-embedded 减少了指针跳转，但导致 O(depth) 遍历与属性冗余；Property Trees 实现了 O(1) 查找与属性共享，但引入了额外的树维护开销。RenderingNG 选择 Property Trees，以空间换时间。 |
| 光栅化后端 | CPU Rasterization | GPU Rasterization | CPU 精度高、兼容性好，但吞吐量低；GPU 吞吐量高、支持 MSAA 与并行，但存在驱动兼容性与功耗问题。Chromium 采用混合策略。 |
| 光栅化进程 | In-Process | OOP-R | In-Process 延迟低，但安全性差；OOP-R 隔离了安全风险，但引入了序列化开销。Chromium 默认启用 OOP-R。 |
| 合成执行位置 | Renderer Process | Viz Process | Renderer 内合成延迟低，但无法处理跨站 iframe；Viz 支持跨进程聚合，但增加了 IPC 复杂度。Chromium 在 Site Isolation 场景强制使用 Viz。 |
| Tile 大小 | 小 Tile (128) | 大 Tile (1024) | 小 Tile 局部更新粒度细，但管理开销大；大 Tile 管理简单，但局部更新代价高。Chromium 通常采用 256 或 512 作为折中。 |
| 预光栅化策略 | 保守 | 激进 | 保守策略内存与功耗低，但 Checkerboarding 严重；激进策略体验流畅，但内存压力大。Chromium 采用动态自适应策略。 |
| 滚动实现 | Main Thread Scroll | Compositor Scroll | 主线程滚动可以精确同步 JS 事件，但帧率受影响；合成线程滚动流畅度高，但存在事件延迟。RenderingNG 优先合成线程滚动。 |
| Skia 后端 | Ganesh | Graphite | Ganesh 成熟稳定，但多线程支持弱；Graphite 显式调度、多线程友好，但仍在演进中。Chromium 目前以 Ganesh 为默认，逐步推进 Graphite。 |
| 后处理效果实现 | Per-Layer FBO | Global Render Pass | Per-Layer FBO 实现简单，但纹理内存占用大；Global Render Pass 可以跨层合并后处理，但调度复杂度高。RenderingNG 采用 Render Pass 模型。 |

上述矩阵并非静态的。随着硬件能力与 Web 平台需求的演进，Chromium 团队会持续重新评估这些权衡。例如，随着 Apple Silicon 与 Intel Meteor Lake 等 SoC 的 GPU 性能大幅提升，GPU 光栅化的占比正在逐渐增加；而随着 Graphite 后端的成熟，多线程录制能力将使得更大尺寸的 Tile 成为可能。

---

## 11. 反例与局限性

尽管 RenderingNG 架构在大多数情况下表现出色，但在特定场景下，其设计假设会被打破，导致性能退化或行为异常。

反例 1：极端深层嵌套与 Property Tree 膨胀

Property Trees 将属性查找从 O(depth) 降至 O(1)，但这一优化的前提是 Property Tree 的节点数量远小于 Layer Tree 的节点数量。在极端情况下，如果页面中的每个元素都拥有唯一的变换、裁剪、效果与滚动属性，Property Tree 的节点数量将与 DOM 节点数量同阶。此时，Property Tree 的内存占用与更新开销将急剧增长，其优势被消解。虽然这种编码模式在实践中罕见，但某些数据可视化库可能接近这一边界。

反例 2：强制合成的连锁反应（Overlap Testing 失控）

Layer Squashing 与 CAP 旨在控制层数量，但 Overlap Testing 的强制合成规则可能在特定布局下触发级联层爆炸。例如，一个页面包含大量交错定位的元素，其中少数元素因为 will-change 被提升为合成层。由于这些层在屏幕空间上与大量相邻元素重叠，Overlap Testing 会强制将几乎所有相邻元素都提升为合成层，即使 CAP 与 Squashing 也无法有效压缩。最终结果是合成层数量远超预期，GPU 内存耗尽。开发者可以通过谨慎使用 will-change 与 transform 来避免触发这种级联。

反例 3：OOP-R 的 IPC 延迟与微绘制

OOP-R 的 IPC 开销在粗粒度绘制下可以被有效摊薄，但在微绘制场景下可能成为瓶颈。例如，一个使用 requestAnimationFrame 逐帧绘制大量微小路径的 Canvas 2D 应用，每一帧都可能生成大量小而独立的 PaintOp。在 OOP-R 模式下，这些 PaintOp 需要频繁地序列化并发送到 GPU 进程，IPC 的固定开销可能超过实际绘制计算的时间。在这种情况下，回退到 In-Process GPU 或使用 WebGL 可能是更好的选择。

反例 4：Checkerboarding 与内存压力的两难

预光栅化策略试图在 Checkerboarding 与内存占用之间取得平衡，但在内存极度受限的设备上，这一平衡很难维持。如果预光栅化过于保守，快速滚动会导致严重的 Checkerboarding；如果过于激进，系统可能因内存不足而杀死浏览器进程。Chromium 的 MemoryPressureListener 可以在系统内存紧张时触发缓存清空，但清空操作本身可能导致后续滚动时的 Checkerboarding。目前尚无完美的解决方案，这是资源受限环境下的固有矛盾。

反例 5：backdrop-filter 的性能悬崖

backdrop-filter 是 CSS 中最昂贵的效果之一，因为它要求引擎在应用滤镜之前捕获元素背后的所有内容。在 RenderingNG 中，这一捕获通过 Render Surface 实现。然而，如果设置了 backdrop-filter 的元素非常大，或者其背后有大量独立的合成层，捕获操作需要读取并合成巨大的纹理区域，导致 GPU 带宽与填充率激增。在某些 GPU 上，这可能导致帧率从 60fps 瞬间跌落至 10fps 以下。前端开发者应谨慎使用大面积的 backdrop-filter，尤其是在移动端。

反例 6：TiV 的跨进程同步延迟

Trees in Viz 将合成计算迁移到 Viz 进程，但在高频率更新的场景中，跨进程同步 Property Tree 状态的 IPC 延迟可能成为瓶颈。虽然增量更新与共享内存优化减少了数据传输量，但进程上下文切换的固定开销仍然存在。在单核或双核 CPU 上，TiV 的额外进程开销可能导致整体帧时间增加。Chromium 团队正在探索将 TiV 的计算进一步线程化，或使用零拷贝的环形缓冲区来消除上下文切换。

局限性：范畴论模型的抽象泄漏

第 8 章提出的范畴论语义是一种理想化的数学模型，它假设绘制操作是纯粹的状态转换，且满足结合律与恒等律。然而，实际 GPU 绘制并非纯函数：浮点精度差异、混合模式的非结合性、以及纹理采样的滤波误差，都可能导致数学上等价的操作序列产生视觉上略有差异的结果。这意味着，虽然范畴论为架构设计提供了直觉与指导，但最终的优化决策仍需依赖像素级比较测试与 GPU 驱动的兼容性验证。范畴论模型是设计之锚，而非实现之 Guarantee
---

## TypeScript 代码示例

以下 TypeScript 示例以教学与模拟为目的，展示了 Chromium 合成架构中核心数据结构与算法的简化实现。这些代码并非生产级代码，但捕获了关键的设计模式与状态转换逻辑。

### 示例 1：Property Tree 状态模拟器

```typescript
/**
 * Property Tree 状态模拟器
 * 演示 Transform / Clip / Effect / Scroll 四棵树的节点管理与 O(1) 状态查找。
 */

type NodeId = number;

interface TransformNode {
  id: NodeId;
  parentId: NodeId | null;
  localMatrix: Float32Array; // 4x4 column-major
  toScreenMatrix?: Float32Array;
}

interface ClipNode {
  id: NodeId;
  parentId: NodeId | null;
  localRect: { x: number; y: number; width: number; height: number };
  combinedRect?: { x: number; y: number; width: number; height: number };
}

interface EffectNode {
  id: NodeId;
  parentId: NodeId | null;
  opacity: number;
  blendMode: string;
  filters: string[];
}

interface ScrollNode {
  id: NodeId;
  parentId: NodeId | null;
  offsetX: number;
  offsetY: number;
  scrollableWidth: number;
  scrollableHeight: number;
}

class PropertyTrees {
  transforms: TransformNode[] = [{
    id: 0, parentId: null,
    localMatrix: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
  }];
  clips: ClipNode[] = [{
    id: 0, parentId: null,
    localRect: { x: -Infinity, y: -Infinity, width: Infinity, height: Infinity }
  }];
  effects: EffectNode[] = [{ id: 0, parentId: null, opacity: 1, blendMode: 'src-over', filters: [] }];
  scrolls: ScrollNode[] = [{ id: 0, parentId: null, offsetX: 0, offsetY: 0, scrollableWidth: 0, scrollableHeight: 0 }];

  addTransform(parentId: NodeId, localMatrix: Float32Array): NodeId {
    const id = this.transforms.length;
    this.transforms.push({ id, parentId, localMatrix });
    return id;
  }

  addClip(parentId: NodeId, localRect: ClipNode['localRect']): NodeId {
    const id = this.clips.length;
    this.clips.push({ id, parentId, localRect });
    return id;
  }

  // O(depth) update, but amortized O(1) per lookup after caching
  updateTransformAccumulation(): void {
    const mul = (a: Float32Array, b: Float32Array) => {
      const out = new Float32Array(16);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
          for (let k = 0; k < 4; k++)
            out[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
      return out;
    };
    for (const node of this.transforms) {
      if (node.parentId === null) {
        node.toScreenMatrix = node.localMatrix;
      } else {
        const parent = this.transforms[node.parentId];
        node.toScreenMatrix = mul(parent.toScreenMatrix!, node.localMatrix);
      }
    }
  }

  updateClipIntersection(): void {
    const intersect = (a: ClipNode['localRect'], b: ClipNode['localRect']) => ({
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)),
      height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)),
    });
    for (const node of this.clips) {
      if (node.parentId === null) {
        node.combinedRect = node.localRect;
      } else {
        const parent = this.clips[node.parentId];
        node.combinedRect = intersect(node.localRect, parent.combinedRect!);
      }
    }
  }
}

class PropertyTreeState {
  constructor(
    public transformId: NodeId,
    public clipId: NodeId,
    public effectId: NodeId,
    public scrollId: NodeId
  ) {}

  // O(1) lookup using flat array index
  lookup(trees: PropertyTrees) {
    return {
      transform: trees.transforms[this.transformId],
      clip: trees.clips[this.clipId],
      effect: trees.effects[this.effectId],
      scroll: trees.scrolls[this.scrollId],
    };
  }

  equals(other: PropertyTreeState): boolean {
    return this.transformId === other.transformId
      && this.clipId === other.clipId
      && this.effectId === other.effectId
      && this.scrollId === other.scrollId;
  }
}

// Demo
const trees = new PropertyTrees();
const t1 = trees.addTransform(0, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 10,20,0,1]));
const c1 = trees.addClip(0, { x: 0, y: 0, width: 800, height: 600 });
trees.updateTransformAccumulation();
trees.updateClipIntersection();

const state = new PropertyTreeState(t1, c1, 0, 0);
console.log('O(1) Lookup:', state.lookup(trees));
```

### 示例 2：Display List 组合代数验证器

```typescript
/**
 * Display List 组合代数验证器
 * 验证 PaintOpBuffer 的连接运算满足幺半群定律（结合律、单位元）。
 */

enum PaintOpType {
  DrawRect = 'DrawRect',
  DrawText = 'DrawText',
  SetColor = 'SetColor',
  Save = 'Save',
  Restore = 'Restore',
}

interface PaintOp {
  type: PaintOpType;
  payload?: Record<string, unknown>;
}

class PaintOpBuffer {
  constructor(public ops: PaintOp[] = []) {}

  // 连接运算 (append)
  append(other: PaintOpBuffer): PaintOpBuffer {
    return new PaintOpBuffer([...this.ops, ...other.ops]);
  }

  static empty(): PaintOpBuffer {
    return new PaintOpBuffer([]);
  }

  // 视觉哈希：用于判定两个 Display List 是否视觉等价（简化版）
  visualHash(): string {
    return this.ops.map(o => o.type + JSON.stringify(o.payload)).join('|');
  }

  equals(other: PaintOpBuffer): boolean {
    return this.visualHash() === other.visualHash();
  }
}

// 代数性质验证器
class DisplayListAlgebraVerifier {
  static verifyAssociativity(a: PaintOpBuffer, b: PaintOpBuffer, c: PaintOpBuffer): boolean {
    const left = a.append(b).append(c);
    const right = a.append(b.append(c));
    return left.equals(right);
  }

  static verifyIdentity(buffer: PaintOpBuffer): boolean {
    const empty = PaintOpBuffer.empty();
    return buffer.append(empty).equals(buffer) && empty.append(buffer).equals(buffer);
  }
}

// Demo
const op1 = new PaintOpBuffer([{ type: PaintOpType.SetColor, payload: { color: '#f00' } }]);
const op2 = new PaintOpBuffer([{ type: PaintOpType.DrawRect, payload: { x: 0, y: 0, w: 100, h: 100 } }]);
const op3 = new PaintOpBuffer([{ type: PaintOpType.DrawText, payload: { text: 'Hello' } }]);

console.log('Associativity:', DisplayListAlgebraVerifier.verifyAssociativity(op1, op2, op3));
console.log('Identity:', DisplayListAlgebraVerifier.verifyIdentity(op1));
```

### 示例 3：Layer Squashing 启发式模拟器

```typescript
/**
 * Layer Squashing 启发式模拟器
 * 模拟 CompositeAfterPaint 后，基于属性兼容性与空间相邻性的层压缩决策。
 */

interface PaintChunk {
  id: number;
  bounds: { x: number; y: number; w: number; h: number };
  transformId: number;
  clipId: number;
  effectId: number;
  estimatedCost: number; // PaintOp 数量估算
}

interface CompositedLayer {
  chunks: PaintChunk[];
  sharedBounds: { x: number; y: number; w: number; h: number };
  totalCost: number;
}

class LayerSquashingSimulator {
  private layers: CompositedLayer[] = [];

  constructor(private maxCostPerLayer: number = 5000) {}

  canSquash(a: CompositedLayer, b: PaintChunk): boolean {
    if (a.totalCost + b.estimatedCost > this.maxCostPerLayer) return false;
    // 属性兼容性：Transform/Clip/Effect 必须相同（简化假设）
    const base = a.chunks[0];
    if (base.transformId !== b.transformId) return false;
    if (base.clipId !== b.clipId) return false;
    if (base.effectId !== b.effectId) return false;
    // 空间相邻性：简化判断为 bounds 相交或相邻（间距 < 10px）
    const ab = a.sharedBounds;
    const intersects = !(b.bounds.x > ab.x + ab.w + 10 ||
                         b.bounds.x + b.bounds.w < ab.x - 10 ||
                         b.bounds.y > ab.y + ab.h + 10 ||
                         b.bounds.y + b.bounds.h < ab.y - 10);
    return intersects;
  }

  processChunks(chunks: PaintChunk[]): CompositedLayer[] {
    for (const chunk of chunks) {
      let squashed = false;
      for (const layer of this.layers) {
        if (this.canSquash(layer, chunk)) {
          layer.chunks.push(chunk);
          layer.totalCost += chunk.estimatedCost;
          // 更新 sharedBounds
          const minX = Math.min(layer.sharedBounds.x, chunk.bounds.x);
          const minY = Math.min(layer.sharedBounds.y, chunk.bounds.y);
          const maxX = Math.max(layer.sharedBounds.x + layer.sharedBounds.w, chunk.bounds.x + chunk.bounds.w);
          const maxY = Math.max(layer.sharedBounds.y + layer.sharedBounds.h, chunk.bounds.y + chunk.bounds.h);
          layer.sharedBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
          squashed = true;
          break;
        }
      }
      if (!squashed) {
        this.layers.push({
          chunks: [chunk],
          sharedBounds: { ...chunk.bounds },
          totalCost: chunk.estimatedCost,
        });
      }
    }
    return this.layers;
  }
}

// Demo
const chunks: PaintChunk[] = [
  { id: 1, bounds: { x: 0, y: 0, w: 100, h: 100 }, transformId: 1, clipId: 1, effectId: 1, estimatedCost: 200 },
  { id: 2, bounds: { x: 100, y: 0, w: 100, h: 100 }, transformId: 1, clipId: 1, effectId: 1, estimatedCost: 250 },
  { id: 3, bounds: { x: 0, y: 200, w: 100, h: 100 }, transformId: 2, clipId: 1, effectId: 1, estimatedCost: 300 },
];
const squasher = new LayerSquashingSimulator();
const layers = squasher.processChunks(chunks);
console.log('Squashed Layers:', layers.map(l => l.chunks.map(c => c.id)));
```

### 示例 4：Commit/Activate 双缓冲时序模拟

```typescript
/**
 * Commit/Activate 双缓冲时序模拟
 * 模拟 Main Thread -> Pending Tree -> Active Tree 的状态流转与 VSync 对齐。
 */

type FrameData = { frameId: number; layerTree: string; propertyTrees: string };

class LayerTreeHost {
  pendingFrame: FrameData | null = null;
  constructor(private hostImpl: LayerTreeHostImpl) {}

  commit(frame: FrameData): void {
    // 模拟阻塞式 Commit：主线程将数据推送到 Pending Tree
    console.log(`[Main] Committing frame ${frame.frameId}`);
    this.hostImpl.receiveCommit(frame);
  }
}

class LayerTreeHostImpl {
  pendingTree: FrameData | null = null;
  activeTree: FrameData | null = null;
  rasterizedFrames = new Set<number>();

  receiveCommit(frame: FrameData): void {
    this.pendingTree = frame;
    console.log(`[Impl] Pending Tree updated to frame ${frame.frameId}`);
  }

  // Worker Thread 完成 Tile 光栅化后调用
  onTileRasterized(frameId: number): void {
    this.rasterizedFrames.add(frameId);
    console.log(`[Impl] Frame ${frameId} tiles rasterized`);
    this.tryActivate();
  }

  tryActivate(): void {
    if (this.pendingTree && this.rasterizedFrames.has(this.pendingTree.frameId)) {
      this.activeTree = this.pendingTree;
      this.pendingTree = null;
      console.log(`[Impl] Activated frame ${this.activeTree.frameId}`);
    }
  }

  drawFrame(): void {
    if (this.activeTree) {
      console.log(`[Impl] Drawing frame ${this.activeTree.frameId}`);
    } else {
      console.log('[Impl] No active tree, skipping draw');
    }
  }
}

class CCScheduler {
  constructor(private hostImpl: LayerTreeHostImpl) {}

  onVSync(timestamp: number): void {
    console.log(`
[Scheduler] VSync at ${timestamp}`);
    // 合成线程在 VSync 时尝试绘制 Active Tree
    this.hostImpl.drawFrame();
  }
}

// Demo 时序
const hostImpl = new LayerTreeHostImpl();
const host = new LayerTreeHost(hostImpl);
const scheduler = new CCScheduler(hostImpl);

// 时序模拟
host.commit({ frameId: 1, layerTree: 'tree-v1', propertyTrees: 'props-v1' });
setTimeout(() => hostImpl.onTileRasterized(1), 5);
setTimeout(() => scheduler.onVSync(16), 16);
setTimeout(() => host.commit({ frameId: 2, layerTree: 'tree-v2', propertyTrees: 'props-v2' }), 20);
setTimeout(() => scheduler.onVSync(32), 32);
setTimeout(() => hostImpl.onTileRasterized(2), 35);
setTimeout(() => scheduler.onVSync(48), 48);
```

### 示例 5：Tile Priority 调度器

```typescript
/**
 * Tile Priority 调度器
 * 模拟基于视口距离、可见性与预测滚动的 Tile 优先级队列。
 */

interface Tile {
  id: string;
  layerId: number;
  x: number; // Tile 左上角世界坐标
  y: number;
  size: number;
  lastUsed: number;
}

interface Viewport {
  cx: number; // 视口中心
  cy: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

class TilePriorityScheduler {
  private queue: { tile: Tile; priority: number }[] = [];

  constructor(private tiles: Tile[]) {}

  computePriority(tile: Tile, viewport: Viewport, now: number): number {
    // 预测视口中心（基于速度）
    const predictedCx = viewport.cx + viewport.velocityX * 16; // 16ms ahead
    const predictedCy = viewport.cy + viewport.velocityY * 16;

    // Tile 中心
    const tileCx = tile.x + tile.size / 2;
    const tileCy = tile.y + tile.size / 2;

    // 距离分数（越小越优先）
    const dist = Math.hypot(tileCx - predictedCx, tileCy - predictedCy);

    // 可见性分数：完全可见为 0，部分可见为 1，不可见为 2
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const inViewport = (
      tile.x + tile.size > viewport.cx - halfW &&
      tile.x < viewport.cx + halfW &&
      tile.y + tile.size > viewport.cy - halfH &&
      tile.y < viewport.cy + halfH
    );
    const visibilityScore = inViewport ? 0 : 2;

    // 时间局部性（LRU 惩罚）
    const age = now - tile.lastUsed;
    const lruPenalty = Math.min(age / 1000, 10);

    return dist + visibilityScore * 500 + lruPenalty;
  }

  schedule(viewport: Viewport, now: number, maxTiles: number): Tile[] {
    this.queue = this.tiles.map(tile => ({
      tile,
      priority: this.computePriority(tile, viewport, now),
    }));
    this.queue.sort((a, b) => a.priority - b.priority);
    return this.queue.slice(0, maxTiles).map(entry => entry.tile);
  }
}

// Demo
const tiles: Tile[] = [
  { id: '0,0', layerId: 1, x: 0, y: 0, size: 256, lastUsed: 0 },
  { id: '256,0', layerId: 1, x: 256, y: 0, size: 256, lastUsed: 0 },
  { id: '512,0', layerId: 1, x: 512, y: 0, size: 256, lastUsed: 0 },
  { id: '0,1024', layerId: 1, x: 0, y: 1024, size: 256, lastUsed: 1000 },
];

const scheduler = new TilePriorityScheduler(tiles);
const viewport: Viewport = { cx: 300, cy: 100, width: 800, height: 600, velocityX: 20, velocityY: 0 };
const scheduled = scheduler.schedule(viewport, 2000, 3);
console.log('Scheduled tiles:', scheduled.map(t => t.id));
```

### 示例 6：Viz Surface Aggregation 可视化

```typescript
/**
 * Viz Surface Aggregation 可视化
 * 模拟多个 Renderer Surface 的层级关系与聚合过程。
 */

type SurfaceId = string;

interface CompositorFrame {
  surfaceId: SurfaceId;
  drawQuads: DrawQuad[];
  renderPasses: RenderPass[];
  resources: string[];
}

interface DrawQuad {
  type: 'Surface' | 'Tile' | 'SolidColor';
  rect: { x: number; y: number; w: number; h: number };
  surfaceId?: SurfaceId;
  color?: string;
}

interface RenderPass {
  id: number;
  outputRect: { x: number; y: number; w: number; h: number };
  quads: DrawQuad[];
}

class SurfaceNode {
  children: SurfaceNode[] = [];
  constructor(public id: SurfaceId, public frame: CompositorFrame) {}
}

class VizSurfaceAggregator {
  private surfaces = new Map<SurfaceId, SurfaceNode>();

  registerSurface(frame: CompositorFrame): void {
    let node = this.surfaces.get(frame.surfaceId);
    if (!node) {
      node = new SurfaceNode(frame.surfaceId, frame);
      this.surfaces.set(frame.surfaceId, node);
    } else {
      node.frame = frame; // update
    }
    // Rebuild child links based on SurfaceDrawQuads
    node.children = [];
    for (const quad of frame.drawQuads) {
      if (quad.type === 'Surface' && quad.surfaceId) {
        const child = this.surfaces.get(quad.surfaceId);
        if (child) node.children.push(child);
      }
    }
  }

  // 深度优先聚合，将子 Surface 的 DrawQuad 内联到父 RenderPass
  aggregate(rootId: SurfaceId): RenderPass[] {
    const root = this.surfaces.get(rootId);
    if (!root) return [];
    const passes: RenderPass[] = [];
    this.aggregateRecursive(root, passes);
    return passes;
  }

  private aggregateRecursive(node: SurfaceNode, outPasses: RenderPass[]): void {
    // 先处理子 Surface（后处理依赖）
    for (const child of node.children) {
      this.aggregateRecursive(child, outPasses);
    }
    // 将当前 Surface 的 RenderPass 加入列表
    for (const pass of node.frame.renderPasses) {
      // 内联子 Surface 的 quads（简化：直接将子 Surface 的 Tile 合并）
      const mergedQuads = [...pass.quads];
      for (const child of node.children) {
        for (const childPass of child.frame.renderPasses) {
          mergedQuads.push(...childPass.quads.map(q => ({
            ...q,
            rect: { ...q.rect, x: q.rect.x + pass.outputRect.x, y: q.rect.y + pass.outputRect.y }
          })));
        }
      }
      outPasses.push({ ...pass, quads: mergedQuads });
    }
  }

  visualizeTree(rootId: SurfaceId): string {
    const root = this.surfaces.get(rootId);
    if (!root) return '';
    const build = (node: SurfaceNode, depth: number): string => {
      const indent = '  '.repeat(depth);
      let s = `${indent}Surface(${node.id}): ${node.frame.drawQuads.length} quads
`;
      for (const child of node.children) {
        s += build(child, depth + 1);
      }
      return s;
    };
    return build(root, 0);
  }
}

// Demo: 主页面包含一个跨站 iframe
const mainFrame: CompositorFrame = {
  surfaceId: 'main',
  drawQuads: [
    { type: 'SolidColor', rect: { x: 0, y: 0, w: 800, h: 600 }, color: 'white' },
    { type: 'Surface', rect: { x: 50, y: 50, w: 300, h: 200 }, surfaceId: 'iframe-x' },
  ],
  renderPasses: [{ id: 1, outputRect: { x: 0, y: 0, w: 800, h: 600 }, quads: [
    { type: 'SolidColor', rect: { x: 0, y: 0, w: 800, h: 600 }, color: 'white' },
  ]}],
  resources: [],
};

const iframeFrame: CompositorFrame = {
  surfaceId: 'iframe-x',
  drawQuads: [
    { type: 'SolidColor', rect: { x: 0, y: 0, w: 300, h: 200 }, color: 'lightblue' },
  ],
  renderPasses: [{ id: 1, outputRect: { x: 0, y: 0, w: 300, h: 200 }, quads: [
    { type: 'SolidColor', rect: { x: 0, y: 0, w: 300, h: 200 }, color: 'lightblue' },
  ]}],
  resources: [],
};

const viz = new VizSurfaceAggregator();
viz.registerSurface(mainFrame);
viz.registerSurface(iframeFrame);
console.log('Surface Tree:
' + viz.visualizeTree('main'));
console.log('Aggregated Passes:', viz.aggregate('main').length);
```

---

## 参考文献

1. Chromium, "RenderingNG: An Overview" (2021). 官方文档，系统介绍了 RenderingNG 的架构目标、Property Trees、Display List、CAP 与 Viz 的设计原理。
2. Chromium, "Compositor Thread Architecture" (2020). 详细描述了三棵树架构（Main/Pending/Active）、Commit/Activate 机制与 CCScheduler 的状态机。
3. Chromium, "Paint and Composite After Paint (CAP)". 技术文档，解释 CAP 如何将合成决策从绘制前移至绘制后，以及 Paint Chunk 的生成与 Squashing 算法。
4. Chromium, "The Property Trees Design Doc". Property Trees 的早期设计文档，涵盖 Transform/Clip/Effect/Scroll 四棵树的节点定义、累积计算与 PropertyTreeState 的 O(1) 查找机制。
5. Chromium, "Viz and the Display Compositor". 描述 Viz 进程的职责、CompositorFrame 的数据结构、Surface Aggregation 与跨进程合成。
6. Chromium, "Out-of-Process Rasterization (OOP-R)". 阐述 OOP-R 的安全动机、Command Buffer 机制、Skia DDL 与共享内存同步。
7. Chromium, "Trees in Viz (TiV) and JellyMander" (2024). 最新架构演进文档，介绍将合成核心计算从 Renderer 迁移到 Viz 的动机与实现路径。
8. Skia, "Skia Graphics Engine / Ganesh Backend". Skia 官方文档，描述 Ganesh 的即时模式渲染、批处理机制与着色器编译缓存。
9. Skia, "Graphite: A New GPU Backend" (2023). Skia Graphite 的设计文档，涵盖显式资源管理、任务图调度与多线程录制。
10. Google, "Inside look at modern web browser (Part 3 & 4)" (2018). Mariko Kosaka 的经典系列文章，从高层视角解释了浏览器渲染流水线、合成与 GPU 加速。
11. Chromium, "Tile Manager and Raster Cache". 描述 Tile 的分块策略、优先级队列、Checkerboarding 处理与 Raster Cache 的 LRU 淘汰机制。
12. W3C, "CSS Will Change Module Level 1". 规范文档，定义 will-change 属性及其对浏览器合成提示的语义。
13. W3C, "CSS Filters Module Level 1" & "CSS Backdrop Filters". 定义滤镜与 backdrop-filter 的视觉效果与合成行为。
14. Chromium, "Layer Squashing and Overlap Testing". 内部文档，详述层压缩的启发式规则与强制合成的相交检测算法。
15. F. Lawvere, S. Schanuel, "Conceptual Mathematics: A First Introduction to Categories" (2009). 范畴论入门教材，为第 8 章的形式化模型提供数学基础。

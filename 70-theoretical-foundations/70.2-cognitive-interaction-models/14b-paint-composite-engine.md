---
title: '浏览器绘制与合成引擎原理'
description: 'Browser Paint and Composite Engine Principles: Display Lists, Property Trees, Layer Squashing, Viz, RenderingNG, and GPU Compositing'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
actual-length: '~18000 words'
english-abstract: 'A deep technical analysis of browser paint and compositing engines, covering Chromium RenderingNG architecture including Display Lists and Paint Chunks, the four Property Trees (Transform/Clip/Effect/Scroll), Layer Squashing heuristics, the Viz Display Compositor with Surface Aggregation, Out-of-Process Rasterization (OOP-R), Skia Ganesh vs Graphite, and the Three-tree architecture (Main/Pending/Active). Includes formal categorical models and TypeScript simulations.'
references:
  - 'Chromium, RenderingNG Architecture (2021)'
  - 'Chromium, Compositor Thread Architecture (2020)'
  - 'Chromium, Chromium Graphics / GPU Accelerated Compositing'
  - 'Google, Inside look at modern web browser — Part 3 & 4 (2018)'
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
    - [11.1 Layer 爆炸的反例](#111-layer-爆炸的反例)
    - [11.2 Property Trees 无法解决的根本限制](#112-property-trees-无法解决的根本限制)
    - [11.3 OOP-R 的延迟惩罚](#113-oop-r-的延迟惩罚)
    - [11.4 TiV 的不完备性](#114-tiv-的不完备性)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Property Tree O(1) 查找模拟](#示例-1property-tree-o1-查找模拟)
    - [示例 2：Display List PaintOp 组合验证器](#示例-2display-list-paintop-组合验证器)
    - [示例 3：Layer Squashing 条件判断器](#示例-3layer-squashing-条件判断器)
    - [示例 4：Commit/Activate 双缓冲状态机](#示例-4commitactivate-双缓冲状态机)
    - [示例 5：Tile Priority 队列调度器](#示例-5tile-priority-队列调度器)
    - [示例 6：DrawQuad 类型分发器](#示例-6drawquad-类型分发器)
  - [参考文献](#参考文献)

---

## 1. 历史脉络：从软件渲染到 GPU 合成

浏览器渲染引擎的演进史，本质上是一部从通用 CPU 向专用 GPU 不断移交工作负载的历史。在 2000 年代初期，所有浏览器均依赖纯软件光栅化：渲染引擎将 DOM 与 CSS 计算为绘制指令后，由 Skia 等 2D 图形库的 CPU 后端逐像素填充到内存位图（Bitmap），再通过操作系统窗口系统（Windows GDI、macOS Quartz、X11）上屏。这一路径的优势是兼容性好、确定性高，但致命缺陷在于主线程承担了全部绘制负载；面对复杂页面或滚动动画时，CPU 单线程性能迅速成为瓶颈。

具体而言，Skia 的 CPU 后端在当时采用了一条经典的立即模式渲染管线：`SkCanvas` 作为绘制 API 的入口，接收 `drawRect`、`drawPath`、`drawText` 等调用；这些调用被转发给 `SkDraw`，后者根据当前设备和变换矩阵，将几何图元光栅化为像素；最终通过 `SkBitmapDevice` 将像素写入内存中的位图缓冲区。整个过程中，抗锯齿、子像素定位、Gamma 校正等效果完全由 CPU 上的 SIMD 指令（如 SSE2、NEON）完成。对于早期 Web 页面（以文字和简单矩形为主），这一架构足够高效；但随着 CSS3 引入圆角、阴影、渐变和 2D/3D 变换，CPU 光栅化的复杂度呈指数级上升。一个带有 `box-shadow` 和 `border-radius` 的 `<div>` 可能需要执行数十次高斯模糊和路径填充操作，单次重绘即可消耗数毫秒的 CPU 时间。

Chrome 早期版本（2008–2015）延续了软件渲染为主的路径，Skia 的 CPU 后端负责将矢量指令光栅化为像素。随着 Web 内容日益丰富（CSS3 变换、透明度动画、`<video>`、WebGL），软件渲染的帧率逐渐无法维持流畅体验。2010 年前后，移动设备的 GPU 能力快速提升，浏览器厂商开始探索 GPU 合成（GPU Compositing）。其核心思想是：将页面分解为若干「层」（Layer），每个层独立光栅化为纹理（Texture）并上传至 GPU；随后由 GPU 在合成阶段（Composite）将这些纹理按正确顺序、变换和透明度叠加到屏幕帧缓冲。这样，滚动或 CSS 动画只需更新层的变换矩阵或透明度，无需重新光栅化内容，极大减轻了 CPU 负担。

Chromium 69（2018 年）是一个重要分水岭。在此之前，Chromium 的合成决策发生在绘制之前（PrePaint），即在布局完成后、Paint 之前，就根据元素的 CSS 属性（`will-change`、`transform`、`opacity` 等）决定是否提升为合成层。这种架构虽然简单直接，但引发了严重的「层爆炸」问题：开发者为了获得 GPU 加速，滥用 `will-change: transform`，导致单个页面产生数百甚至上千个 GPU 纹理，低端设备的显存被迅速耗尽。同时，PrePaint 的合成决策缺乏绘制阶段的实际信息，经常出现「该合层的没合、不该合的却合了」的资源错配。Chromium 69 开始引入更激进的 GPU 合成策略，例如默认将 `overflow: scroll` 的容器提升为合成层，并实验性地将合成决策延迟到绘制之后。

RenderingNG 架构从 Chrome 94（2021 年）开始全面落地，标志着浏览器合成引擎进入现代阶段。RenderingNG 并非单一补丁，而是一个跨越多年的重构计划：Property Trees 于 2019 年在 Canary 频道实验，2020 年成为默认；CompositeAfterPaint（CAP）于 2020 年在部分平台上启用，2021 年全面推广；Out-of-Process Rasterization（OOP-R）于 2019 年在 Android 上实验，2020 年扩展至 Desktop；Viz Display Compositor 于 2018 年作为独立进程分离，2020 年承担所有平台的帧聚合任务。这一系列变革的核心是将绘制、光栅化与合成彻底解耦：Paint 阶段输出与合成决策无关的 Display List；合成阶段基于 Paint Chunk 和 Property Trees 动态决定分层策略；光栅化可以在独立的 GPU 进程甚至 Viz 进程内完成；最终由 Viz 将多进程、多 iframe 的帧聚合为屏幕输出。这一演进路径不仅提升了性能天花板，也为 120Hz 高刷、复杂视差滚动、大规模 Web 应用奠定了工程基础。

---

## 2. Paint：从布局到绘制指令

布局（Layout）完成后，渲染引擎需要将盒模型的几何信息转化为实际的绘制指令。在 Chromium 中，这一阶段的直接产物不是像素，而是一种结构化的中间表示——Display List。Display List 将绘制操作（PaintOp）按顺序记录为命令流，既可用于后续的软件光栅化，也可直接序列化传输给 GPU 进程进行硬件光栅化。

### 2.1 Display List 与 Paint Chunk 的数据结构

Chromium 的 Display List 具体实现为 `cc::PaintOpBuffer`，其底层是一个 `PaintOp` 的连续向量（`std::vector<std::unique_ptr<PaintOp>>`）。每个 `PaintOp` 是一个虚基类，派生类覆盖了所有基本绘制原语，包括但不限于：`DrawRectOp`（填充矩形）、`DrawTextBlobOp`（文字字形绘制）、`DrawImageOp`（位图/纹理绘制）、`DrawPathOp`（任意路径）、`DrawRecordOp`（嵌套 Display List）以及状态操作 `SaveOp`、`RestoreOp`、`ConcatOp`、`ClipRectOp`、`SetMatrixOp` 等。

`PaintOpBuffer` 的序列化能力是其跨进程设计的核心。每个 `PaintOp` 子类实现了 `Serialize` 和 `Deserialize` 方法，将指令扁平化为字节流。例如，`DrawRectOp` 序列化后包含操作类型标识符（1 字节）、裁剪与抗锯齿标志（1 字节）、颜色（4 字节 RGBA）、以及矩形坐标（4×4 字节浮点）。`DrawTextBlobOp` 则更为复杂，需要序列化字形索引、字体描述符、以及 `SkTextBlob` 的位图数据。序列化后的 PaintOpBuffer 可通过共享内存或 Mojo IPC 通道传输，在 GPU 进程或 Viz 进程中重建为等价的指令列表，从而实现「绘制一次、多处执行」。

从内存布局角度看，`cc::PaintOpBuffer` 由三部分组成：固定大小的 `PaintOpBuffer::Header`（记录操作数量、总字节数、版本号）、紧接其后的 `PaintOp` 数组（每个元素是类型标签 + 变长载荷），以及可选的 `SideData` 区域（存储大型变长对象如图像像素、路径点序列、文本字形索引）。这种三段式布局使得序列化时只需复制 Header 和 Op 数组，SideData 中的大型资源可以通过共享内存句柄直接引用，避免了数十兆字节图像数据的内存拷贝。

在 `PaintOpBuffer` 之上，Chromium 引入了 **Paint Chunk** 的概念。Paint Chunk 是 PaintOpBuffer 中一段连续的、具有相同 `PropertyTreeState` 的绘制指令组。`PropertyTreeState` 是一个四元组 `(transform_node_id, clip_node_id, effect_node_id, scroll_node_id)`，表示这段指令共享同一套变换、裁剪、效果和滚动状态。Paint Chunk 的切分算法在 Chromium 中称为 `PaintChunker`：它顺序遍历 PaintOpBuffer，维护当前 `PropertyTreeState`；当遇到某个 PaintOp 的 `PropertyTreeState` 与当前状态不同时，即在前一个操作处关闭当前 Chunk，并以新状态开启下一个 Chunk。这一线性扫描过程的时间复杂度为 O(n)，其中 n 为 PaintOp 数量。

将 PaintOpBuffer 切分为 Paint Chunk 的关键价值在于：它为后续的合成决策提供了原子单元。CompositeAfterPaint（CAP）阶段不再以单个 DOM 元素为单位，而是以 Paint Chunk 为单位决定是否提升为合成层。这种设计天然支持「跨元素的批量合成决策」，例如，三个相邻的 `<div>` 如果共享相同的 `transform` 和 `opacity`，它们的 Paint Chunk 可以被合并到同一个合成层，避免不必要的层分裂。

### 2.2 Paint 的代数结构：绘制指令的组合语义

从形式化视角审视，Display List 与 PaintOp 的组合关系构成一个**幺半群（Monoid）**。设 `ℳ` 为所有合法 PaintOp 有限序列的集合，则二元运算 `∘` 定义为序列拼接（concatenation），单位元 `ε` 为空序列。对于任意 `A, B, C ∈ ℳ`，结合律 `(A ∘ B) ∘ C = A ∘ (B ∘ C)` 显然成立；空序列满足 `ε ∘ A = A ∘ ε = A`。需要注意的是，PaintOp 序列不满足交换律：先绘制背景再绘制前景与顺序相反时，像素覆盖结果截然不同。

幺半群结构在 Chromium 的工程实现中直接对应 `PaintOpBuffer::Concat` 操作。当渲染引擎需要合并两个相邻 DOM 子树的 Display List 时，它只需将两个 `PaintOpBuffer` 的底层向量拼接，无需解析或重写任何 PaintOp。这一操作的均摊时间复杂度为 O(1)（如果预留了足够容量）或 O(n)（如果需要重新分配内存），无论哪种情况都远低于重新绘制整个区域的代价。

在更细粒度的语义层面，某些 PaintOp 子集呈现出**半格（Semilattice）**结构。考虑覆盖绘制（Overpaint）场景：若两个 `DrawRectOp` 作用于同一像素区域，且后一个矩形完全不透明，则这两个操作的「合成效果」等价于仅执行后一个操作。形式上，定义偏序关系 `a ≤ b` 为「操作 a 的绘制结果被操作 b 完全覆盖」，则 `max(a, b)` 表示视觉上占优的操作。对于不透明全屏矩形这类「吸收元」，有 `max(a, absorb) = absorb`。然而，这一半格性质仅对极特殊子集成立；一旦引入透明度、混合模式或裁剪，吸收律即被破坏。

代数视角的真正工程价值在于**组合验证**。由于 `PaintOpBuffer` 支持嵌套（通过 `DrawRecordOp` 引用子 Buffer），我们可以将大型页面的 Display List 视为多个子列表的拼接。渲染引擎在增量更新时，只需替换发生变化的子 Buffer，而不必重建整个列表。这等价于在幺半群上做「局部重写（Local Rewriting）」，保证了大规模页面更新时的计算局部性。此外，幺半群结构还支持并行化：如果两个 PaintOpBuffer 作用于不相交的屏幕区域，它们可以在不同线程上独立光栅化，最终结果通过拼接合并。

### 2.3 Skia 图形库：Ganesh vs Graphite

Skia 是 Chromium 的底层 2D 图形引擎，负责将 Display List 中的绘制指令转化为 GPU 命令或 CPU 像素。Skia 的架构呈三级流水线：`SkCanvas`（绘制接口层）→ `SkPicture`（录制与重放层）→ `Skia Backend`（平台适配层）。在 Chromium 中，PaintOpBuffer 的概念与 `SkPicture` 类似，但针对浏览器场景做了深度定制（如 Property Tree 集成、序列化优化）。

Skia 的当前默认 GPU 后端称为 **Ganesh**。Ganesh 基于传统的即时模式（Immediate Mode）渲染，直接映射到 OpenGL、Vulkan、Metal 或 Direct3D。其核心是 `GrDirectContext`（或 `GrRecordingContext`），负责管理 GPU 资源（纹理、缓冲区、渲染状态）。`GrDirectContext` 用于实际提交命令到 GPU，而 `GrRecordingContext` 用于离线录制命令（如 OOP-R 中 Renderer 进程预先构建 Display List）。Ganesh 在收到绘制指令时，会即时生成对应 Graphics API 的命令流，提交至 GPU 命令缓冲。Ganesh 的优势在于成熟度高、平台支持广泛，且对 MSAA（多重采样抗锯齿）和复杂路径的 Fallback 处理完善。然而，Ganesh 的即时模式特性导致 CPU 侧需要频繁同步 GPU 状态，多线程扩展性受限；其资源生命周期与绘制命令紧耦合，难以实现跨帧的异步优化。

**Skia Graphite** 是 Google 于 2022 公开发布的下一代 GPU 后端，其设计目标是彻底重构 Skia 的 GPU 抽象层。Graphite 基于 Dawn（WebGPU 的 C++ 实现）和显式的异步任务图（Task Graph）模型。与 Ganesh 的即时模式不同，Graphite 引入了三个核心概念：`skgpu::graphite::Context`（全局上下文）、`Recorder`（每线程录制器）和 `CommandBuffer`（提交单元）。当一帧开始时，每个线程创建独立的 `Recorder`，将 PaintOpBuffer 转换为平台无关的 `DrawPass` 列表；所有 `Recorder` 完成后，`Context` 将 `DrawPass` 合并为一棵渲染图（Render Graph），然后批量提交给 GPU。这种设计带来了几个关键优势：第一，CPU 侧无需在每次绘制时触碰 GPU 状态，显著降低了驱动开销；第二，任务图天然支持多线程录制，多个 PaintOpBuffer 可在不同 CPU 核心上并行构建 GPU 命令；第三，统一的跨平台 API 大幅减少了 backend-specific 代码，降低了维护成本。截至 2024 年，Graphite 仍在逐步成熟中，尚未完全替代 Ganesh 成为 Chromium 默认后端，但已在部分实验性渠道和 Android 特定场景中落地。

### 2.4 CompositeAfterPaint (CAP)：绘制后的合成决策

在 RenderingNG 之前，Chromium 的合成决策发生在绘制之前（PrePaint）。具体而言，在布局完成后，渲染引擎立即遍历 Layer Tree，根据 CSS 属性决定哪些元素需要独立的合成层。这种「先决策、后绘制」的模式的根本缺陷在于：合成器在决策时并不知道绘制阶段的实际开销和空间分布。例如，一个带有 `will-change: transform` 的小图标可能被提升为独立层，占据一整块 256×256 的 Tile；而其相邻的、实际绘制开销巨大的复杂 DOM 子树，却因为缺少 `will-change` 提示而留在基础层，导致每次滚动都需要重绘大量内容。

**CompositeAfterPaint（CAP）** 彻底扭转了这一时序。在 CAP 架构下，Paint 阶段首先无差别地输出 Display List 和 Paint Chunk，完全不考虑后续如何分层。绘制完成后，`PaintArtifactCompositor` 模块介入，分析所有 Paint Chunk 的 `PropertyTreeState`、空间重叠关系、以及绘制复杂度，动态决定合成层的划分。CAP 的决策因子包括：是否存在独立动画（transform/opacity 动画）、是否覆盖视频/画布等固有合成内容、Overlap Testing 是否强制分离、以及 Layer Squashing 是否允许合并。

CAP 的算法流程可以概括为以下步骤：

1. 输入：PaintOpBuffer + PaintChunk 列表 + Property Trees。
2. 遍历 PaintChunk，按 `PropertyTreeState` 分组；具有相同状态且空间连续的 Chunk 被归入同一候选组。
3. 对每个候选组执行 Overlap Testing：如果组的屏幕矩形与任何已强制合成的层相交，则该组必须拆分。
4. 对通过 Overlap Testing 的组，检查其内容复杂度：如果组内包含大量绘制指令（如复杂 SVG 或文字段落），即使状态统一，也可能被拆分为多个层以平衡光栅化负载。
5. 输出：最终的 Layer 列表，每个 Layer 对应一个 backing surface 和一组 Paint Chunk。

CAP 的工程收益是显著的。首先，它消除了对 `will-change` 的过度依赖，开发者无需手动提示浏览器即可获得合理的合成策略。其次，CAP 将合成决策与实际绘制数据对齐，避免了 PrePaint 时代常见的「空层」和「漏层」问题。最后，CAP 与 Property Trees 天然协同：由于变换、裁剪、效果等属性已经以树形结构独立存储，合成器可以纯粹基于属性节点 ID 的相等性判断两个 Paint Chunk 是否共享同一套状态，从而快速做出合并或分离决策。根据 Chromium 团队的内部基准测试，CAP 在典型 Web 页面上将合成层数量减少了 30%–50%，同时提升了 5%–10% 的滚动帧率。

---

## 3. Property Trees：RenderingNG 的核心架构变革

### 3.1 为什么需要 Property Trees

在 Pre-RenderingNG 时代，Chromium 的合成属性直接内联在 Layer 对象中。每个 `cc::Layer` 携带自己的 `transform_`、`clip_rect_`、`opacity_`、`filter_` 等字段，子 Layer 的几何有效性依赖于父 Layer 的对应属性。这种架构在逻辑上简单直观，但在性能上存在致命缺陷：当动画改变某个 Layer 的变换时，所有依赖于该 Layer 的子孙 Layer 都需要重新计算累积变换，时间复杂度为 **O(depth)**。在深度嵌套的现代 Web 应用中（如 React/Vue 生成的深层组件树），单次动画帧可能触发数百次祖先遍历，主线程时间被迅速耗尽。

更严重的是，传统 Layer Tree 将「绘制内容」与「绘制属性」紧耦合。一个 Layer 既是内容容器（持有 Display List），又是属性容器（持有变换/裁剪）。这导致即使内容未变，仅属性变化时，整个 Layer 对象仍需参与遍历；反之，内容更新时，属性计算也无法复用。Property Trees 的核心思想正是将这两类职责彻底解耦：DOM 的绘制内容以 PaintOpBuffer / Paint Chunk 形式存在，而变换、裁剪、效果、滚动四类属性被抽象为四棵独立的树。任何属性变更只需更新树中的单个节点，通过节点 ID 直接索引，复杂度降至 **O(1)**。

为了量化这一改进，考虑一个深度为 50 的 DOM 树，其中第 50 层的一个元素正在进行 CSS Transform 动画。在传统 Layer Tree 中，每一帧都需要从第 50 层向上遍历到根节点，计算累积矩阵；如果页面有 100 个这样的动画元素，每帧将执行 5000 次祖先访问。在 Property Trees 架构下，动画只需修改 Transform Tree 中的一个节点，100 个元素的 `transform_node_id` 可能都指向同一节点（如果它们共享同一变换上下文），或者最多修改 100 个独立节点；无论哪种情况，总计算量都远低于 5000 次树遍历。此外，Property Trees 的扁平数组结构具有极佳的 CPU 缓存局部性，实测表明在大型页面上，合成阶段的属性查询延迟降低了 60% 以上。

### 3.2 Transform Tree：累积 4×4 变换矩阵

Transform Tree 是 Property Trees 中最基础也是最重要的一棵。每个节点代表一个局部坐标系变换，数据结构核心是 **4×4 齐次矩阵**，同时支持 2D 和 3D 变换。节点包含以下关键字段：`local_transform`（局部变换矩阵，如 translate、rotate、scale、skew、perspective）、`origin`（变换原点，用于实现 `transform-origin` 的语义）、`parent_id`（父节点索引）、`sorting_context_id`（3D 排序上下文，用于处理 `preserve-3d` 场景下的 Z 轴穿插）。

子节点的**世界变换矩阵（World Transform）**通过矩阵乘法累积得到：`world = parent_world × local`。由于矩阵乘法满足结合律但不满足交换律，Transform Tree 严格保持了 DOM 的层级顺序。在动画场景下，Property Trees 的优势最为凸显：当 CSS `transform` 动画运行时，渲染引擎只需更新对应 Transform Tree 节点的 `local_transform` 字段。因为所有 Paint Chunk 通过 `transform_node_id` 引用该节点，它们会自动「看到」新的世界矩阵，而无需任何重光栅化。这与旧架构形成鲜明对比——旧架构中，动画一个 Layer 的 transform 需要递归更新所有子孙 Layer 的累积矩阵，并可能触发重新绘制。

从数学表示上看，2D 变换（如 `translate(10px, 20px) rotate(45deg)`）被统一编码为 4×4 齐次矩阵的左上角 3×3 子矩阵，而 3D 变换（如 `rotateX(30deg) perspective(500px)`）则利用完整的 4×4 矩阵。这种统一表示的优势在于：合成器无需区分 2D 和 3D 代码路径，所有变换都通过同一套 GPU Shader 代码处理。Chromium 的 Transform Tree 节点还存储了矩阵的行列式（determinant）和是否仅包含平移/缩放的标志位，用于快速判断某些优化是否适用（例如，仅包含平移的变换可以直接通过修改纹理坐标实现，无需修改顶点着色器中的变换矩阵）。

Transform Tree 还支持**滚动偏移的预变换（Pre-transform）**。Scroll Tree 中的滚动偏移并不直接修改 Transform Tree，而是在合成阶段通过 `scroll_translation` 与 Transform 节点关联。这种设计保证了滚动动画（由 Compositor Thread 驱动）与 CSS Transform 动画（可能由主线程计算）在数学上的正交性。具体实现中，每个 Scroll Tree 节点引用的 Transform 节点会额外叠加一个 `scroll_offset` 矩阵：`world = parent_world × scroll_translation × local`。当用户滚动时，只有 `scroll_translation` 改变，而 `local` 保持不变。

### 3.3 Clip Tree：祖先裁剪区域的交集

Clip Tree 负责管理绘制内容的可见区域。每个节点对应一个裁剪矩形（`clip_rect`）或复杂裁剪路径（如 `border-radius` 产生的圆角矩形、CSS `clip-path` 产生的任意路径）。子节点的**有效裁剪区域**定义为父节点裁剪与本地裁剪的交集：`effective_clip = parent_clip ∩ local_clip`。这一交集操作在 GPU 合成阶段执行，意味着即使滚动或动画导致内容移动，裁剪边界也能在 GPU 上实时更新，无需重新光栅化内容。

Clip Tree 节点的关键字段包括：`clip_rect`（本地裁剪矩形，以像素为单位）、`parent_id`、以及 `applies_local_clip`（布尔值，标识该节点是否真正参与裁剪，用于处理 `overflow: visible` 的穿透语义）。在旧架构中，裁剪通常作为 Layer 的属性内联存储；当祖先裁剪变化时（例如，一个可伸缩的侧边栏宽度改变），所有子孙 Layer 都需要重新计算复合裁剪。Property Trees 下，这一计算被推迟到合成阶段：Viz 或 Compositor Thread 在生成 DrawQuad 时，直接读取每个 Chunk 引用的 Clip Tree 节点，通过 GPU Scissor Test 或 Fragment Shader 中的坐标比较实现裁剪。

在 GPU 实现层面，Clip Tree 的裁剪有两种主要技术路径：

- **Scissor Test**：对于轴对齐矩形裁剪（绝大多数 CSS 裁剪属于此类），合成器直接设置 GPU 的 Scissor Rect。这是一种极低开销的逐片段测试，在光栅化阶段由硬件自动执行，无需修改 Shader。
- **Stencil Buffer / Alpha Mask**：对于复杂路径裁剪（如 `clip-path: polygon()` 或 `border-radius` 产生的非矩形区域），Skia 可能将路径转换为模板缓冲操作（先绘制路径到 Stencil Buffer，再仅在 Stencil 值匹配的像素上绘制内容），或生成一张 Alpha Mask 纹理，在 Fragment Shader 中采样以决定像素可见性。

无论哪种方式，裁剪的几何定义与绘制内容完全解耦，Content Layer 只需按全尺寸光栅化，Clip Tree 在合成阶段决定哪些像素最终可见。这种解耦显著提升了动画性能：当一个带有 `overflow: hidden` 的容器执行 `transform` 动画时，其内容的裁剪边界会随容器一起移动，而内容本身无需重光栅化。

### 3.4 Effect Tree：透明度、滤镜与混合模式

Effect Tree 管理所有需要在后处理阶段应用的视觉效果。每个节点代表一个视觉属性组，主要包括：`opacity`（不透明度，0.0–1.0）、`filter`（CSS 滤镜链，如 `blur()`、`drop-shadow()`、`brightness()`）、`blend_mode`（混合模式，如 `multiply`、`screen`、`overlay`）、以及 `surface_id`（指向独立渲染表面的标识）。

Effect Tree 直接决定了 **RenderPass** 的边界。在合成阶段，如果一个 Effect Tree 节点具有非 1.0 的 opacity、非 none 的 filter、或非 normal 的 blend_mode，则其对应的 Paint Chunk 必须被渲染到一个独立的离屏纹理（Render Surface / FBO）上，完成效果应用后再作为纹理采样到父级 RenderPass。例如，一个 `opacity: 0.5` 的 `<div>` 包含若干子元素：在旧架构中，整个 `<div>` 子树可能被提升为一个 Layer，其 backing texture 在合成时通过 GPU alpha blending 实现半透明；在 Property Trees 架构下，Effect Tree 的 opacity 节点与 Layer 解耦，多个 Paint Chunk 可以共享同一个 Effect 节点，由合成器统一决定是否需要额外的 RenderPass。

Filter 效果（尤其是高斯模糊 `blur()`）对性能影响极大，因为它需要读取周围像素的卷积核。在 GPU 上，高斯模糊通常通过双通道 separable convolution 实现：先在水平方向对图像执行一维卷积，再在垂直方向对中间结果执行一维卷积。这种分解将计算复杂度从 O(n²) 降低到 O(2n)，其中 n 为卷积核半径。Effect Tree 允许合成器在 GPU 上通过这一技术高效实现 blur，而无需重新光栅化原始内容。然而，blur 仍然需要额外的 RenderPass 和纹理内存：一个 `blur(10px)` 的 500×500 区域需要约 1MB 的临时纹理（RGBA8888），对于大量同时应用 blur 的页面，GPU 内存压力不可忽视。

Mix-blend-mode 则更为复杂：它需要读取底层已绘制内容（Backdrop）作为混合输入，因此通常强制创建一个独立的 Render Surface，并可能触发额外的全屏 quad 读取。某些混合模式（如 `multiply` 和 `screen`）在数学上可以简化为单次 pass 的混合操作，但 `overlay`、`hard-light` 等模式需要同时读取源像素和目标像素，计算开销更高。Effect Tree 通过 `blend_mode` 字段标识这些模式，合成器据此决定是否需要分配额外的 FBO 和带宽。

### 3.5 Scroll Tree：嵌套滚动容器

Scroll Tree 是 RenderingNG 实现流畅滚动的基石。每个节点代表一个滚动容器（Scroll Container），关键字段包括：`scroll_offset`（当前滚动偏移，以浮点像素为单位）、`scroll_container_bounds`（内容尺寸与视口尺寸的差值，即最大滚动范围）、`parent_id`（父滚动容器），以及 `scrolls_inner_viewport` / `scrolls_outer_viewport` 标志（用于区分视口级滚动与元素级滚动）。

Scroll Tree 的核心设计原则是 **Compositor-driven 滚动**。在传统架构中，滚动事件由主线程接收，主线程更新布局偏移后重新绘制，这一路径的端到端延迟通常在 50–100ms。RenderingNG 将滚动偏移从主线程剥离：滚动事件直接路由到 Compositor Thread，Compositor Thread 更新 Scroll Tree 对应节点的 `scroll_offset`，然后在下一帧的合成阶段应用新的偏移。主线程在此过程中完全不被阻塞，因此即使页面正在执行繁重的 JavaScript，滚动依然保持 60fps 甚至 120fps。

嵌套滚动是 Scroll Tree 的典型应用场景。现代 Web 页面经常出现「视口滚动 + 内部侧边栏滚动 + 弹窗滚动」的多层嵌套结构。Scroll Tree 的层级关系天然映射了这种嵌套：每个滚动容器的偏移独立计算，Transform Tree 通过 `scroll_translation` 将滚动偏移转换为内容的平移变换。当内层滚动容器滚动时，只有其对应 Scroll Tree 节点的 `scroll_offset` 改变，外层视口和内层弹窗的滚动状态互不影响。

从输入事件的角度看，滚动事件的路由流程如下：操作系统生成触摸/鼠标滚轮事件 → Browser Process 的输入调度器将事件转发给对应的 Renderer Process → Renderer Process 的 Compositor Thread 直接消费事件，更新 Scroll Tree 节点 → 如果滚动触发了 `scroll` 事件监听器（JavaScript），主线程在下一空闲周期异步处理该回调。这一路径的关键在于：Compositor Thread 对滚动事件的响应优先级高于主线程的 JavaScript 执行，从而保证了视觉反馈的即时性。对于惯性滚动（momentum scrolling），Compositor Thread 还内置了物理模拟器（基于摩擦系数和速度衰减公式），在无需主线程参与的情况下计算滚动动画的每一帧偏移。

### 3.6 PropertyTreeState：4 元组与 O(1) 查找

PropertyTreeState 是连接 Paint Chunk 与四棵 Property Tree 的桥梁。其定义为：

```
PropertyTreeState = (transform_node_id, clip_node_id, effect_node_id, scroll_node_id)
```

每个 Paint Chunk 在生成时被标记一个 `PropertyTreeState`，表示该 Chunk 内所有绘制指令共享同一套变换、裁剪、效果和滚动上下文。

传统 Layer Tree 的查询模式是**祖先链遍历**：为了确定一个元素的最终变换，需要从该元素开始向上遍历父链，依次应用每个祖先的变换、裁剪和效果。对于深度为 d 的 DOM 树，每次查询的时间复杂度为 O(d)。在大型单页应用（SPA）中，d 很容易达到 50–100，这意味着单次合成帧可能需要执行数千次祖先遍历。

Property Trees 将这一模式颠覆为**直接索引**。四棵树的节点均存储在扁平数组（`std::vector`）中，节点 ID 即为数组下标。给定一个 `PropertyTreeState`，获取对应属性的操作变为四次数组随机访问：`transform_tree[state.transform_id]`、`clip_tree[state.clip_id]` 等，时间复杂度严格为 **O(1)**。这一改进不仅体现在合成阶段，也深刻影响了动画系统：当动画更新 Transform Tree 节点时，所有引用该节点的 Paint Chunk 无需任何指针更新或树遍历，即自动继承新状态。

从空间复杂度看，Property Trees 的扁平数组结构具有极佳的缓存局部性。祖先链遍历需要随机访问散落在内存中的 Layer 对象（通常通过指针链接），而 Property Tree 数组是连续内存，CPU 预取器可以高效工作。在极端情况下，Property Trees 的缓存友好性带来的性能提升甚至超过了算法复杂度从 O(d) 到 O(1) 的理论收益。

此外，`PropertyTreeState` 还支持高效的相等性比较和哈希：由于它是四个整数 ID 的元组，比较操作只需四次整数比较，哈希操作只需将四个 ID 混合（如使用 FNV-1a 或 MurmurHash）。这在 Paint Chunk 切分和 Layer Squashing 中至关重要——合成器需要频繁判断两个 Chunk 是否共享同一套状态，而 `PropertyTreeState` 的相等性判断可以在常数时间内完成。相比之下，旧架构中判断两个 Layer 是否状态等价需要递归比较祖先链上的所有属性，时间复杂度为 O(d²)。

---

## 4. Layer 与合成

### 4.1 Layer 的创建条件与 PaintLayer

在 Blink 渲染引擎中，并非每个 DOM 元素都对应一个合成层。合成层的创建遵循一系列明确的条件，这些条件由 `CompositingReason` 枚举精确记录。当元素满足以下任一条件时，会触发 `PaintLayer` 的创建，并进一步考虑提升为 `GraphicsLayer`（即真正的合成层）：

1. **根元素**：视口（Viewport）自身始终是一个合成层。
2. **定位属性**：`position` 为 `relative`、`absolute`、`fixed` 或 `sticky`。`fixed` 和 `sticky` 尤为特殊，因为它们需要相对于视口或滚动容器定位，合成层可以避免滚动时的重绘。
3. **透明度**：`opacity < 1`。非 1.0 的透明度需要后处理混合，通常需要独立的 Render Surface。
4. **变换**：`transform` 不为 `none`。2D/3D 变换是 GPU 合成最典型的应用场景。
5. **溢出裁剪/滚动**：`overflow` 不为 `visible`（即 `hidden`、`scroll`、`auto`）。滚动容器天然需要合成层以实现 Compositor-driven 滚动。
6. **Will-Change 提示**：`will-change: transform` 或 `will-change: opacity`。尽管 CAP 减少了对 `will-change` 的依赖，但它仍然是合成的积极提示。
7. **固有合成元素**：`<video>`、`<canvas>`、`<iframe>`、插件（Plugin）。这些元素的内容由外部系统（如媒体解码器、GPU 上下文、其他进程）产生，必须作为独立层引入合成器。
8. **高级视觉效果**：CSS Filters（`filter`）、Mask（`mask` / `mask-image`）、Reflection（`-webkit-box-reflect`）、混合模式（`mix-blend-mode`）、以及 3D 变换上下文（`transform-style: preserve-3d`）。

在 Blink 内部，`PaintLayer` 是布局对象（`LayoutObject`）到合成系统之间的适配层。每个满足条件的 `LayoutBoxModelObject` 会创建一个 `PaintLayer`，而 `PaintLayer` 通过 `GraphicsLayer` 与 Chromium 的合成器（`cc::LayerTreeHost`）交互。值得注意的是，CAP 机制下，`PaintLayer` 的存在并不直接等价于独立的合成层；多个 `PaintLayer` 的 Paint Chunk 可能被合并（Squash）到同一个 `GraphicsLayer` 中。

`CompositingReason` 枚举在 Chromium 源码中定义了超过 40 种具体的提升原因，涵盖了从常见的 3D 变换到极为罕见的打印媒体支持。主要类别包括：

- **几何原因**：`k3DTransform`、`kVideo`、`kCanvas`、`kPlugin`、`kIFrame`、`kSVGRoot`、`kBackfaceVisibilityHidden`。
- **叠加原因**：`kComboAll`（元素同时满足多个独立条件）、`kScrollDependentPosition`（滚动相关的定位，如 `position: sticky`）。
- **动画原因**：`kActiveTransformAnimation`、`kActiveOpacityAnimation`、`kActiveFilterAnimation`。
- **提示原因**：`kWillChangeTransform`、`kWillChangeOpacity`、`kWillChangeFilter`。
- **重叠原因**：`kOverlap`（由 Overlap Testing 强制提升）。

这些原因在开发者工具（Chrome DevTools 的 Layers 面板）中可见，帮助前端工程师诊断不必要的层提升。

### 4.2 Layer Squashing：避免层爆炸的启发式规则

Layer Squashing 是 RenderingNG 中抑制「层爆炸」的关键启发式算法。其核心思想是：如果多个相邻的 Paint Chunk 在合成属性上无显著差异（即共享相同的 PropertyTreeState 关键字段），且它们在屏幕空间上不存在 Z 轴交错或复杂的重叠关系，则这些 Chunk 可以共享同一个 backing surface（GPU 纹理），从而合并为一个逻辑合成层。

Squashing 的判断条件包括但不限于：

- **Transform 一致性**：候选 Chunk 与当前 Squashing Container 引用同一个 Transform Tree 节点，或二者的变换矩阵在视觉上等价（如相同的 translate）。
- **Opacity 与 Effect 一致性**：候选 Chunk 的 Effect Tree 节点必须与 Container 相同，或二者的 opacity/filter 可合并处理。
- **无 Overlap 强制分离**：候选 Chunk 的屏幕矩形不能与任何已独立合成的层发生重叠（Overlap Testing），否则必须独立成层以避免渲染顺序错误。
- **绘制顺序连续性**：候选 Chunk 必须在 Paint Order 中连续出现；如果中间插入了一个必须独立合成的层（如 `<video>`），则 Squashing 在此中断。

Squashing 的算法流程近似如下：合成器按 Paint Order 遍历 Paint Chunk，维护一个当前 Squashing Container。对每个新 Chunk，检查其 PropertyTreeState 与 Container 的兼容性；若兼容且 Overlap Test 通过，则将该 Chunk 的绘制矩形追加到 Container 的合并矩形中；若不兼容，则关闭当前 Container，为其分配 backing surface，然后以新 Chunk 开启下一个 Container。这一启发式策略在绝大多数页面上将合成层数量控制在 20–50 个，即使面对数千个 DOM 节点也能维持合理的 GPU 内存占用。

Squashing 的复杂度取决于 Overlap Testing 的实现。在最坏情况下，如果页面包含大量交错重叠的元素（如绝对定位的弹窗覆盖在滚动内容上），Squashing 可能被迫将内容切割为大量小层，导致 backing surface 的内存碎片。Chromium 通过限制单个 Squashing Container 的最大尺寸（通常为 4096×4096 像素）来防止极端情况下的内存爆炸：当合并后的矩形超过此阈值时，即使状态兼容，也会强制分割为多个 Container。

### 4.3 GraphicsLayer 与 PlatformLayer

`GraphicsLayer` 是 Chromium 跨平台合成架构中的核心抽象，位于 Blink 与 `cc`（Chromium Compositor）模块之间。每个 `GraphicsLayer` 实例对应一个 `cc::Layer`（或一个 Squashed Layer Group），代表了合成器视角下的一幅独立图像。`GraphicsLayer` 的职责包括：管理 Display List 或已光栅化的纹理引用、跟踪自身的几何边界（`bounds`、`position`、`offset`）、以及向 `cc::LayerTreeHost` 注册属性变化。

在 `GraphicsLayer` 之下，平台特定实现通过 `PlatformLayer` 接口注入。例如，在 macOS 上，`PlatformLayer` 可能映射到 `CALayer`；在 Android 上，视频层可能映射到 `SurfaceTexture` 或 `AHardwareBuffer`；在 Windows 上，可能通过 DirectComposition 的 `Visual` 对象实现。这种分层抽象使得 Chromium 的核心合成逻辑保持平台无关，而底层 Surface 分配、纹理上传、SwapChain 管理等细节由平台层处理。

`GraphicsLayer` 分为几种语义类型：

- **Content Layer**：持有 PaintOpBuffer，需要经过光栅化生成纹理。
- **Surface Layer**：引用另一个 Surface（通过 `SurfaceId`），用于跨进程 iframe 或跨站点文档的合成。
- **Solid Color Layer**：优化手段，对于纯色背景直接生成 `SolidColorDrawQuad`，无需光栅化。
- **Texture Layer**：直接持有外部生成的纹理（如 WebGL `canvas` 的内容），跳过 Display List 和光栅化阶段。

在 Chromium 的 `cc` 模块内部，`cc::Layer` 是合成器的核心数据节点。每个 `cc::Layer` 包含一个 `cc::LayerImpl` 的镜像，后者运行在 Compositor Thread 上。`cc::Layer` 与 `GraphicsLayer` 的映射通常是 1:1，但在 Squashing 后，一个 `cc::Layer` 可能对应多个 `GraphicsLayer`（或相反）。这种映射关系在 CAP 阶段由 `PaintArtifactCompositor` 动态构建，并随页面状态变化而增量更新。

### 4.4 Overlap Testing：强制合成的相交检测

Overlap Testing 是 Layer Squashing 的「安全阀」。其根本问题是：当一个 Paint Chunk A 被提升为独立合成层后，如果另一个 Paint Chunk B 在屏幕空间上与 A 的矩形相交，且 B 在 Paint Order 中位于 A 之后（即 B 可能覆盖 A 的一部分），那么 B 不能被合并到 A 之前的 Squashing Container 中。否则，B 的内容会被先绘制到共享纹理上，当 A 层随后被合成到屏幕上时，A 会错误地覆盖 B 的内容（因为 A 是独立层，在合成阶段后绘制）。

Overlap Testing 算法维护一个**已合成层的轴对齐包围盒（AABB）列表**。对每个候选 Paint Chunk，计算其在屏幕空间中的矩形（通过 Transform Tree 将本地矩形转换到屏幕坐标），然后与列表中的每个已合成层矩形进行相交测试。若存在任何相交，该候选 Chunk 必须被强制提升为独立合成层，并将其矩形加入已合成层列表。若不存在相交，则允许继续 Squashing。

朴素实现的复杂度为 O(n²)，其中 n 为 Paint Chunk 数量。对于复杂页面，Chromium 使用空间索引（如均匀网格或四叉树）将复杂度优化到接近 O(n log n) 或 O(n)。具体而言，屏幕空间被划分为固定大小的网格单元（如 128×128 像素），每个已合成层的矩形被插入到其覆盖的所有网格单元中。当测试新 Chunk 时，只需检查其矩形覆盖的网格单元中的已合成层，而非全部列表。这一优化在典型页面上将 Overlap Testing 的开销降低了 80% 以上。

Overlap Testing 与 Z-Index 共同决定了最终的层划分：即使两个元素在屏幕上不相交，如果它们在 Paint Order 中跨越了一个必须独立合成的层，Squashing 仍可能被迫中断。Overlap Testing 也解释了为什么某些看似简单的页面会产生大量合成层：一个固定定位（`position: fixed`）的小按钮，其屏幕矩形可能与页面主内容的多个段落相交，导致主内容被切割为多个 Squashing Group，层数量激增。开发者可通过 `contain: paint` 或 `overflow: hidden` 创建新的裁剪容器，限制 Overlap Testing 的传播范围。

---

## 5. Three-tree Architecture：主线程与合成线程的解耦

### 5.1 Main Thread Tree vs Impl Tree

Chromium 的合成系统采用经典的生产者-消费者双线程模型，并通过「三棵树（Three-tree）」机制实现状态隔离。第一棵树是 **Main Thread Tree**，由 `CCLayerTreeHost` 维护，运行在浏览器的主线程（Renderer Process 的主线程）上。它接收来自 Blink 的 Paint Artifact（包含 PaintOpBuffer、Paint Chunk 和 Property Trees），构建完整的 Layer Tree 和合成属性。主线程负责处理 JavaScript 执行、DOM 操作、样式计算、布局以及 Paint，因此可能被长时间阻塞。

第二棵树是 **Impl Tree**，由 `CCLayerTreeHostImpl` 维护，运行在专门的 Compositor Thread 上。Impl Tree 是 Main Thread Tree 的镜像：它拥有相同拓扑结构的 Layer Tree、Property Trees 和 Display List 引用，但 Impl Tree 的数据由主线程通过 Commit 推送而来。Compositor Thread 独立运行，不执行 JavaScript 或布局，只负责合成（Composite）、动画插值和滚动偏移更新。这种隔离保证了即使主线程被阻塞，用户仍然可以流畅滚动页面或播放合成器驱动的动画。

从数据结构角度看，`CCLayerTreeHost` 管理的 Layer Tree 包含完整的 DOM 映射和绘制内容，而 `CCLayerTreeHostImpl` 管理的 Impl Tree 只包含合成所需的最小子集：Layer 的边界、变换、裁剪、效果、以及指向 Display List 的句柄。Impl Tree 不持有实际的 PaintOpBuffer（这些内容存储在共享内存中，供 GPU 进程光栅化），因此其内存占用远低于 Main Thread Tree。这种数据结构的差异使得 Impl Tree 可以快速克隆和切换，而无需深拷贝大量绘制指令。

第三棵树是 **Pending Tree / Active Tree**（位于 Impl Thread 内部的双缓冲）。当 Compositor Thread 收到主线程的新数据时，不会立即替换正在显示的树，而是先构建一棵 Pending Tree；待其完全准备就绪后，通过原子操作切换为 Active Tree。这种设计形成了事实上的「第三棵树」状态。

### 5.2 Commit：同步握手机制

Commit 是主线程与合成线程之间的关键同步点。当主线程完成一帧的 Paint 和 Layer 构建后，会触发 Commit 流程。Commit 的本质是将 Main Thread Tree 的增量状态复制到 Impl Thread。具体传输的数据包括：

- **Property Trees 的增量节点**：仅传输自上次 Commit 以来发生变化的 Transform、Clip、Effect、Scroll 节点。
- **Display List / PaintOpBuffer**：对于内容发生变化的 Layer，序列化其 PaintOpBuffer 并通过共享内存传输。
- **Layer Tree 的拓扑变更**：新增、删除或重排序的 Layer 元数据。

Commit 可以是**阻塞式**的：主线程等待 Compositor Thread 确认收到并应用数据后，才继续执行后续任务（如下一帧的 JavaScript）。这保证了视觉状态的严格一致性，但可能引入主线程卡顿。现代 Chromium 也支持**非阻塞 Commit** 的变体：主线程将数据推送到 Compositor Thread 的队列后立即返回，Compositor Thread 在下一帧调度时异步消费。这种方式提升了主线程响应性，但可能引入一帧的视觉延迟。

在跨进程场景下（如 Android WebView 或站点隔离的 iframe），Commit 的数据通过 Mojo IPC 传输。Property Trees 的扁平数组结构非常适合 IPC：只需传输变更节点的索引和字段值，数据包体积极小。Display List 的序列化则利用共享内存（Shared Memory）避免大内存拷贝。具体而言，Chromium 使用 `base::MappedFile` 或 `mojo::SharedBuffer` 创建环形缓冲区：Renderer 将序列化的 PaintOpBuffer 写入共享内存，然后向 Compositor Thread 发送一个仅包含偏移量和大小的小消息；Compositor Thread 读取后直接引用该共享内存，无需拷贝。

### 5.3 Pending Tree → Active Tree

双缓冲是渲染系统避免画面撕裂（Tearing）的通用技术，Chromium 将其内建于 Impl Tree 的生命周期中。当 Compositor Thread 收到 Commit 数据后，它首先在 **Pending Tree** 上应用这些变更：更新 Property Tree 节点、替换 Display List、重建 Layer 拓扑。Pending Tree 是一个完全独立的状态副本，用户当前看到的仍然是 **Active Tree** 的输出。

当 Pending Tree 的所有准备工作完成（包括 Tile 光栅化、动画状态插值、DrawQuad 生成）后，Compositor Thread 执行 **Activation**：将 Pending Tree 的指针原子地赋给 Active Tree，旧 Active Tree 降级为待回收状态。这一切换操作是原子的（通过原子指针交换或互斥锁保护），确保在 VSync 到来时，Display Compositor 看到的永远是完整一致的树状态。

Pending → Active 的流水线设计允许光栅化与显示并行进行。例如，用户快速滚动页面时，Compositor Thread 可以在 Pending Tree 上光栅化新进入视口的 Tile，同时 Active Tree 继续显示当前视口内容。一旦新 Tile 就绪，Activation 立即发生，用户看到无缝更新的内容。如果光栅化速度跟不上滚动速度（例如低端 GPU），用户可能先看到 Checkerboarding（空白 Tile），但 Active Tree 的稳定性保证了不会出现半帧旧内容、半帧新内容的撕裂画面。

Activation 的原子性通过 `std::atomic` 指针交换实现：Compositor Thread 维护两个指针 `pending_tree_ptr` 和 `active_tree_ptr`。当 Activation 触发时，执行 `active_tree_ptr.store(pending_tree_ptr.exchange(nullptr), std::memory_order_release)`。这一操作确保：

1. 新 Active Tree 的可见性在所有线程间同步。
2. 旧的 Active Tree 不会被立即销毁，而是标记为「待回收」，在下一帧的安全点由垃圾回收器释放。
3. 如果 Pending Tree 在 Activation 前又被新的 Commit 更新，旧的 Pending Tree 同样被安全地替换和延迟释放。

### 5.4 CCProxy 与 CCScheduler

为了适配不同的运行环境（桌面浏览器、headless 测试、Android WebView、嵌入式设备），Chromium 的合成器通过 **CCProxy** 抽象线程模型。`CCProxy` 是一个纯虚接口，定义了 Commit、Draw、Animation 的调度契约。其两大主要实现是：

- **CCSingleThreadProxy**：单线程模式，主线程与合成线程合一。用于 headless 测试、某些嵌入式场景或 GPU 不可用的软件渲染模式。此模式下不存在真正的线程并发，Commit 是本地函数调用。
- **CCThreadProxy**：多线程生产模式，主线程与 Compositor Thread 分离，通过任务队列和信号量同步。这是桌面 Chrome 和 Android Chrome 的默认配置。

在 `CCThreadProxy` 之上，**CCScheduler** 负责精细的帧调度。CCScheduler 的核心是状态机，响应以下事件：

- **BeginFrame**：由 VSync 信号或操作系统显示回调触发，标志着新一帧合成的开始。CCScheduler 评估当前是否有 Pending Commit、是否有待处理的用户输入、以及动画是否需要在合成线程插值。
- **Commit Decision**：如果主线程有新内容且距离上次 Commit 已超过一帧，Scheduler 允许执行 Commit。
- **Draw Decision**：如果 Active Tree 准备好且未延迟（如等待 GPU 回读），Scheduler 触发 Draw 阶段，生成 CompositorFrame 并提交给 Viz。
- **Animate**：在 Draw 之前，Scheduler 在 Compositor Thread 上执行合成器驱动的动画（如 CSS `transform` 动画、滚动惯性衰减）。

CCScheduler 的优先级策略遵循「交互第一」原则：用户输入（如滚动、缩放）会立即触发 BeginFrame，中断低优先级的光栅化任务；动画更新优先于新的 Commit，因为保持动画流畅比显示最新内容更重要（内容延迟一帧通常比动画掉帧更不显眼）。

CCScheduler 的状态机包含以下主要状态：`IDLE`、`BEGIN_FRAME_SENT`、`BEGIN_FRAME_RECEIVED`、`COMMIT`、`ACTIVATE`、`DRAW`。状态转换由外部事件（VSync、用户输入、Commit 完成）驱动。例如，当 VSync 到来时，Scheduler 从 `IDLE` 转换到 `BEGIN_FRAME_SENT`，向主线程请求内容；主线程完成 Paint 后回复 `BEGIN_FRAME_RECEIVED`，Scheduler 评估是否需要 `COMMIT`；Commit 完成后进入 `ACTIVATE`；最后进入 `DRAW`，生成 CompositorFrame。整个周期通常在 16.6ms（60Hz）或 8.3ms（120Hz）内完成，任何阶段的超时都会触发帧率下降的报告。

---

## 6. Rasterization：光栅化

光栅化是将矢量化的 Display List 转化为像素纹理的过程。Chromium 支持多种光栅化路径，根据硬件能力、内容特征和性能目标动态选择。

### 6.1 CPU vs GPU Rasterization

**CPU Rasterization** 由 Skia 的软件后端执行。Skia 使用高度优化的 SIMD 路径（SSE、NEON）将 DrawRect、DrawTextBlob、DrawPath 等指令直接写入内存中的 `SkBitmap` 或共享内存缓冲区。CPU 光栅化的优势在于极致的兼容性：复杂贝塞尔曲线、子像素字体渲染（LCD anti-aliasing）、以及某些特殊的 Skia 效果（如 `SkDashPathEffect`）在 CPU 上的实现最为完善，几乎不会回退。此外，CPU 光栅化不占用 GPU 内存，对于低端设备或极简单的页面（如纯文本文档），CPU 路径反而更快。

然而，CPU 光栅化的瓶颈在于内存带宽和单线程性能。一个 1920×1080 的页面若全屏重绘，需要写入约 8MB 的像素数据（RGBA8888）；在滚动动画中，这种全屏重绘每帧都会发生，迅速耗尽内存带宽。

**GPU Rasterization** 将 Display List 提交给 Skia Ganesh（或未来的 Graphite），通过 OpenGL、Vulkan 等 Graphics API 渲染到 GPU 纹理。GPU 光栅化利用并行像素管线，对大量简单几何（如矩形、图片）的吞吐率远高于 CPU。Chromium 的 GPU Raster 通常启用 4x MSAA（多重采样抗锯齿），在纹理上获得平滑的边缘。GPU Raster 的劣势在于复杂路径和文字的渲染质量可能略逊于 CPU，且需要维护 GPU 纹理池，低端 GPU 容易因显存不足而触发频繁回收。

在渲染质量方面，CPU 与 GPU Raster 存在细微但重要的差异。CPU 光栅化可以精确控制子像素布局（Subpixel Layout），实现高质量的 LCD 字体渲染（ClearType 风格）；而 GPU 上的文字渲染通常依赖预先缓存的字形纹理（Glyph Atlas），在极小字号或非标准 DPI 下可能出现轻微模糊。此外，CPU 路径对 Gamma 校正和颜色混合的处理更为精确，而 GPU 的线性颜色空间混合可能在某些边缘情况下产生色差。Chromium 通过 `cc::RasterSource` 的 `Canary` 测试持续监控两种路径的像素差异，确保在可接受的阈值内。

Chromium 的默认策略是启发式选择：对于包含大量 CSS 变换、透明度动画、或大面积图片的页面，优先使用 GPU Raster；对于以文字和复杂矢量为主的页面，可能回退到 CPU Raster。

### 6.2 Out-of-Process Rasterization (OOP-R)

Out-of-Process Rasterization（OOP-R）是 RenderingNG 在架构安全与性能之间的关键平衡。在 OOP-R 之前，Renderer 进程直接通过命令缓冲区（Command Buffer）向 GPU 发送绘制命令。这不仅要求 Renderer 拥有 GPU 访问权限（削弱沙箱隔离性），还导致多个 Renderer 进程（如多个标签页）竞争同一 GPU 上下文，产生资源管理冲突。

OOP-R 将光栅化彻底迁移到 **GPU 进程**（或 Viz 进程）。Renderer 进程在 Paint 阶段完成后，将 PaintOpBuffer 序列化为字节流，通过 IPC 发送给 GPU 进程。GPU 进程拥有唯一的 GPU 上下文访问权，它接收来自所有 Renderer 的 Display List，调度 Skia 进行光栅化，并将结果纹理存储在共享 GPU 内存中。Renderer 进程本身不再直接触碰 GPU。

OOP-R 的 IPC 路径经过精心优化：序列化的 PaintOpBuffer 通过共享内存环形缓冲区（Ring Buffer）传输，避免了频繁的内核态拷贝。环形缓冲区的设计允许多个 Producer（Renderer）和单个 Consumer（GPU 进程）高效协作：Renderer 将序列化数据写入环形缓冲区的空闲槽位，更新写指针；GPU 进程轮询读指针，发现新数据后读取并处理；处理完成后，GPU 进程将槽位标记为空闲，Renderer 可以覆写。这种设计将 IPC 开销控制在微秒级别，即使在高频动画场景下也不会成为瓶颈。

对于大型图片（如 JPEG/PNG 解码后的位图），OOP-R 利用 GPU 的 `EGLImage` / `VK_EXTERNAL_MEMORY` 扩展实现零拷贝纹理上传。OOP-R 还带来了崩溃隔离的额外收益：即使某个 Renderer 的 Display List 触发了 GPU 驱动 bug，崩溃也局限于 GPU 进程，可通过 Viz 的崩溃恢复机制自动重启，而不会导致标签页白屏。

### 6.3 Tile Priority 与 Checkerboarding

光栅化不是以整个页面为单位进行的，而是将页面划分为固定尺寸的 **Tile**（通常为 256×256 或 512×512 像素）。每个 Tile 独立光栅化为纹理，由 `TileManager` 统一管理生命周期。Tile 化的优势是局部更新：当页面某一小块内容变化时，只需重光栅化覆盖该区域的 Tile，而非整个页面。

**Tile Priority** 决定了光栅化的调度顺序。`TileManager` 根据 Tile 中心点到视口（Viewport）的距离计算优先级。优先级分级通常包括：

- **NOW**：位于当前视口内，必须立即光栅化，否则用户将看到空白。
- **SOON**：位于视口边缘外一个屏幕范围内，预计在接下来几帧可能进入视口。
- **EVENTUALLY**：距离视口较远，可在空闲时间光栅化。
- **NEVER**：距离极远（如页面底部），在当前会话中可能永远不会进入视口，暂不光栅化。

距离计算不仅考虑欧几里得距离，还考虑滚动方向：如果用户正在向下滚动，则下方 Tile 的优先级会被加权提升。具体的优先级分数公式可以表示为：`priority_score = distance + direction_penalty - content_change_bonus`，其中 `direction_penalty` 在滚动方向上为负值（提升优先级），`content_change_bonus` 对于最近更新过的内容为正值（提升优先级）。`TileManager` 维护一个优先队列（通常是最小堆），光栅化线程池从队列中持续取出高优先级 Tile 执行。

当滚动速度超过光栅化速度时，新进入视口的 Tile 可能尚未就绪。此时，Compositor 会绘制一个空白或低分辨率的占位纹理，呈现出规则的网格状空白，这一现象称为 **Checkerboarding**。Checkerboarding 是性能瓶颈的直接视觉反馈。缓解策略包括：预光栅化视口外 1–2 屏的内容、使用低分辨率占位图渐进显示、以及启用 GPU 内存中的 Tile Cache 以减少重光栅化。

### 6.4 Raster Cache 与预光栅化策略

Raster Cache 是 Tile Manager 内部的纹理缓存层。已光栅化的 Tile 纹理并非立即释放，而是根据 LRU（Least Recently Used）策略保留在 GPU 内存中。当用户回滚页面时，这些缓存 Tile 可以直接复用，无需重新光栅化。Raster Cache 的大小受限于 GPU 内存预算：当总纹理内存超过阈值时，优先级最低（距离最远、最久未访问）的 Tile 被逐出。

LRU 的实现通常基于一个双向链表（`std::list`）配合哈希表（`std::unordered_map`）：每次访问 Tile 时，将其移动到链表头部；当需要逐出时，从链表尾部移除。这种数据结构保证 O(1) 的访问和逐出复杂度。在 Chromium 中，Raster Cache 还考虑了 Tile 的「距离热度」：不仅根据最近访问时间排序，还根据 Tile 到当前视口的距离加权。一个很久未访问但距离极近的 Tile，其保留优先级可能高于一个最近访问但距离极远的 Tile。

**预光栅化（Pre-rasterization）** 是进一步提升滚动流畅度的策略。`cc::RasterDarkLord`（内部代号）或现代 Chromium 的 `Prepaint` 模块会分析用户的滚动模式和页面结构，预测接下来可能进入视口的区域，并提前调度这些 Tile 的光栅化。预光栅化是一个资源与收益的权衡：过度预光栅化会浪费 GPU 内存和电池，预光栅化不足则导致 Checkerboarding。Chromium 采用动态预算模型，根据设备 GPU 内存、当前帧率、以及滚动速度实时调整预光栅化的距离阈值。

对于动态内容（如 CSS 动画、JavaScript 修改样式），Raster Cache 的条目会失效。Property Trees 架构下，仅 Transform / Scroll / Effect / Opacity 变化的动画不会导致 Tile 失效（因为光栅化内容未变），这极大提升了缓存命中率。只有 PaintOpBuffer 内容真正改变时（如文字内容更新），对应 Tile 才会被标记为 dirty 并重光栅化。这一「属性变化不invalidate内容」的特性是 RenderingNG 相比旧架构的重大优势：在旧架构中，即使仅透明度变化，整个 Layer 的 backing surface 也可能被标记为 dirty，导致不必要的重光栅化。

---

## 7. Viz：Display Compositor

### 7.1 Viz 进程双线程架构

**Viz**（Visuals）是 Chromium 的整体显示合成服务，负责将多个 Renderer Process、Browser Process 和 GPU Process 的输出聚合为最终的屏幕图像。Viz 运行在独立的 **GPU Process** 中，内部包含两个关键线程：

**GPU Main Thread**：

- 接收来自各个 Renderer 的 Display List 和 CompositorFrame
- 执行 Tile 的光栅化（在 OOP-R 模式下）
- 管理 GPU 纹理、着色器程序和帧缓冲对象
- 处理 GPU 命令缓冲区的提交

**Display Compositor Thread**：

- 聚合来自所有 Surface 的 CompositorFrame
- 执行最终的屏幕合成（将多个 Quad 合成为单一输出帧）
- 与操作系统的显示子系统交互（如 Windows 的 Direct Composition、macOS 的 CoreAnimation、Android 的 SurfaceFlinger）

### 7.2 CompositorFrame 与 DrawQuad

**CompositorFrame** 是 Renderer Process 向 Viz 提交的一帧数据的封装。它不是一个位图，而是**结构化的绘制描述**，包含：

- **Render Passes**：渲染通道列表，每个 Render Pass 定义了一个绘制目标（屏幕或中间纹理）
- **Draw Quads**：每个 Render Pass 内的原子绘制原语列表
- **Resource List**：该帧引用的 GPU 纹理资源列表

**DrawQuad 的类型**：

- **SolidColorQuad**：纯色填充（用于背景色、简单矩形）
- **TileQuad**：引用已光栅化的 Tile 纹理
- **TextureQuad**：引用外部纹理（如 `<video>` 的解码帧、`<canvas>` 的内容）
- **SurfaceQuad**：引用另一个 Renderer Process 的 Surface（用于跨进程 iframe）
- **YUVVideoQuad**：YUV 格式的视频帧（GPU 直接做 YUV→RGB 转换）

这种结构化表示的优势在于：Viz 可以在不重新光栅化的情况下，仅通过调整 Quads 的位置、变换和效果来响应合成需求。

### 7.3 Surface Aggregation

**Surface** 是 Viz 中的核心抽象，代表一个独立的合成上下文。每个 Renderer Process 的每一帧都输出到一个 Surface。Surface 之间可以相互引用：例如，主页面的 CompositorFrame 可以包含一个 SurfaceQuad，引用 iframe 的 Surface。

**Surface Aggregation** 是 Viz 将多个嵌套 Surface 合成为单一输出帧的过程：

1. **递归解析**：从根 Surface（通常是 Browser Process 的 UI Surface）开始，递归解析所有引用的子 Surface
2. **Quad 展开**：将 SurfaceQuad 替换为被引用 Surface 的实际 Quad 列表
3. **依赖排序**：根据 Quad 的 `z-index` 和 Render Pass 顺序排序
4. **统一合成**：将所有 Quad 合成为最终的屏幕帧

**跨站点隔离**：来自不同站点的 iframe 运行在不同的 Renderer Process 中，它们的 Surface 由 Viz 隔离管理。Surface Aggregation 确保了即使 iframe 崩溃，主页面仍然可以正常显示。

### 7.4 Trees in Viz (TiV) / JellyMander

**Trees in Viz（TiV）**，代号 **JellyMander**，是 Chromium 2024-2025 年的重大架构演进。

**传统架构的问题**：Renderer Process 负责生成 CompositorFrame（包含完整的 Quad 列表和渲染指令），Viz 只负责"执行"这些指令。这意味着 Renderer 需要知道大量的合成细节（如 Tile 边界、Render Pass 划分）。

**TiV 的变革**：

- Renderer Process 只输出**原始视觉数据**（Layer Tree + Property Trees + Display List 的序列化）
- Viz 在 GPU Process 中**直接构建合成树**，负责所有合成决策（Layer Squashing、Tile 划分、Render Pass 生成）
- Renderer 不再生成 CompositorFrame，而是生成更轻量的 **VisualEffectsSubmission**

**优势**：

- **减少 IPC 数据量**：VisualEffectsSubmission 比 CompositorFrame 小得多
- **集中优化**：所有合成优化（如全局的 Layer Squashing、跨 iframe 的 Tile 共享）都在 Viz 中统一执行
- **更快的演进**：合成算法的更新不再需要修改 Renderer，只需更新 Viz

**状态（2025-2026）**：TiV 正在逐步推广中，尚未完全替代传统 CompositorFrame 路径。Chromium 团队计划在 2026-2027 年完成全面迁移。

---

## 8. 范畴论语义：合成的形式化模型

从范畴论视角，我们可以将 Chromium 的合成管道形式化为一系列**函子变换**：

**Display List → CompositorFrame 函子** `F: DL → CF`

- **对象**：Display List（PaintOp 的自由幺半群）→ CompositorFrame（RenderPass + DrawQuad 的有序集合）
- **态射**：Paint Chunk 的切分与合并 → RenderPass 的创建与 Quad 的分配
- **保持的结构**：绘制指令的相对顺序（半格结构）、PropertyTreeState 的等价类划分

**Property Trees 的积范畴模型**：
四棵 Property Tree 可以形式化为范畴中的**积对象**：

```
PropertyTrees = TransformTree × ClipTree × EffectTree × ScrollTree
```

每个元素的 `PropertyTreeState` 是从该积范畴到具体属性值的**投影函子**。

**Layer Squashing 的商范畴模型**：
Layer Squashing 定义了 Layer 上的一个**等价关系** ∼：L₁ ∼ L₂ 当且仅当它们可以共享同一 Backing Surface 而不影响渲染结果。商范畴 **Layer / ∼** 的对象是 Squashed Layer，态射是层间的遮挡关系。

**Commit / Activation 的伴随函子**：
Pending Tree → Active Tree 的激活操作可以建模为一个**伴随对**（Adjunction）：

- 左伴随 `L: MainTree → ActiveTree`（Commit + Activation）
- 右伴随 `R: ActiveTree → MainTree`（只读观察）
- 单位 η: Id → R ∘ L 表示主线程可以观察激活后的树状态
- 余单位 ε: L ∘ R → Id 表示激活操作是幂等的

这种形式化不是"为了数学而数学"——它精确地捕捉了合成管道的**不变性**：无论 Commit 和 Activation 如何交错执行，Active Tree 始终表示一个完整的、可显示的帧。

---

## 9. 对称差分析：Pre-RenderingNG vs RenderingNG

设 M_legacy 为 Pre-RenderingNG 模型（~2017 年 Chromium），M_modern 为 RenderingNG 模型（2021+）。

| 维度 | M_legacy 独有 | M_modern 独有 | 交集 |
|------|-------------|-------------|------|
| 合成决策时机 | Paint 前决定 Layer（PrePaint Compositing） | Paint 后决定 Layer（CompositeAfterPaint） | 最终合成层集合 |
| 属性存储 | Layer Tree 节点内联存储 transform/clip/opacity | Property Trees 独立存储，O(1) 索引 | 属性值本身 |
| 滚动性能 | 主线程更新 scroll offset，延迟 50-100ms | Compositor Thread 直接更新 Scroll Tree，<16ms | 滚动事件源 |
| 动画性能 | 主线程执行 JS 动画，可能掉帧 | Compositor Thread 执行 transform/opacity 动画，60-120fps | CSS 动画规范 |
| 内存模型 | 可变 Layer Tree，就地更新 | 不可变 Fragment Tree + Property Trees，副本切换 | DOM 到 Layer 的映射 |
| 跨进程合成 | Renderer 生成完整 CompositorFrame | Viz 集中合成（TiV 趋势） | Surface / iframe 隔离 |
| 可靠性 | Legacy Layout 可变对象导致大量 bug | LayoutNG 不可变片段树 + 缓存验证 | CSS 规范语义 |

---

## 10. 工程决策矩阵

| 场景 | 推荐策略 | 理由 |
|------|---------|------|
| 流畅滚动 | 使用 `transform` / `opacity` 动画，避免 `top`/`left` | Compositor-only 动画，不阻塞主线程 |
| 大量卡片列表 | 使用 `content-visibility: auto` | 跳过视口外内容的 Display List 生成和光栅化 |
| 复杂滤镜效果 | 谨慎使用 `backdrop-filter`，限制作用区域 | Backdrop-filter 需要全屏读取，带宽开销极高 |
|  iframe 嵌入 | 确保跨域 iframe 启用 Site Isolation | 利用 Surface Aggregation 的安全隔离 |
| 低端移动设备 | 限制合成层数量（<50），避免 `will-change` 滥用 | 防止 GPU 内存耗尽和 Thermal Throttling |
| 120Hz 高刷显示 | 监控 Commit 时间（<2ms），使用 `scheduler.yield()` | 8.33ms 帧预算紧张，Commit 过大会侵占 JS 执行时间 |

---

## 11. 反例与局限性

### 11.1 Layer 爆炸的反例

某开发者为了"优化性能"，给页面中所有按钮添加了 `will-change: transform`。结果 Layer Squashing 完全失效，合成层数量从 20 暴增至 500+。在 iPhone 12 上测试时，GPU 内存占用超过 400MB，触发系统的内存警告，浏览器被迫杀掉后台标签页。

**教训**：`will-change` 是"预言"而非"魔法"，滥用会导致比不优化更糟糕的结果。

### 11.2 Property Trees 无法解决的根本限制

Property Trees 将 transform/clip/effect/scroll 从 Layer Tree 解耦，但**无法解耦布局**。如果动画改变了元素的尺寸（如 `width` / `height`），仍然需要主线程执行 Layout，无法由 Compositor Thread 独立完成。

### 11.3 OOP-R 的延迟惩罚

在 OOP-R 模式下，Display List 需要通过 IPC 发送到 GPU Process 再光栅化。对于极小的 Tile（如 32×32 的图标），IPC 开销可能超过光栅化本身的计算时间，导致整体性能反而下降。

### 11.4 TiV 的不完备性

TiV（Trees in Viz）虽然减少了 Renderer 的 IPC 数据量，但将合成决策集中到了 Viz。如果 Viz 崩溃，所有依赖它的 Renderer 都会失去显示能力。这种单点故障风险在浏览器稳定性设计中需要仔细权衡。

---

## TypeScript 代码示例

### 示例 1：Property Tree O(1) 查找模拟

```typescript
interface PropertyTreeState {
  transformId: number;
  clipId: number;
  effectId: number;
  scrollId: number;
}

class PropertyTree {
  private transforms: Float32Array[] = [];
  private clips: DOMRect[] = [];
  private effects: { opacity: number; filter: string }[] = [];
  private scrolls: { offsetX: number; offsetY: number }[] = [];

  setTransform(id: number, matrix: Float32Array) {
    this.transforms[id] = matrix;
  }

  setClip(id: number, rect: DOMRect) {
    this.clips[id] = rect;
  }

  // O(1) 查找：直接数组索引
  lookup(state: PropertyTreeState) {
    return {
      transform: this.transforms[state.transformId],
      clip: this.clips[state.clipId],
      effect: this.effects[state.effectId],
      scroll: this.scrolls[state.scrollId],
    };
  }

  // 对比：传统 Layer Tree 的 O(depth) 遍历
  lookupLegacy(layer: any, depth: number = 0): any {
    const parent = layer.parent;
    if (!parent) return { transform: layer.transform, clip: layer.clip };
    const parentProps = this.lookupLegacy(parent, depth + 1);
    return {
      transform: this.multiplyMatrix(parentProps.transform, layer.transform),
      clip: this.intersectRect(parentProps.clip, layer.clip),
    };
  }

  private multiplyMatrix(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    return result;
  }

  private intersectRect(a: DOMRect, b: DOMRect): DOMRect {
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    return new DOMRect(x, y, Math.max(0, right - x), Math.max(0, bottom - y));
  }
}
```

### 示例 2：Display List PaintOp 组合验证器

```typescript
type PaintOp =
  | { type: 'DrawRect'; rect: DOMRect; color: string }
  | { type: 'DrawText'; text: string; x: number; y: number }
  | { type: 'Save' }
  | { type: 'Restore' }
  | { type: 'ClipRect'; rect: DOMRect };

class DisplayList {
  private ops: PaintOp[] = [];

  push(op: PaintOp) {
    this.ops.push(op);
  }

  // 验证 Save/Restore 平衡性（半格结构的基础）
  validateBalance(): boolean {
    let depth = 0;
    for (const op of this.ops) {
      if (op.type === 'Save') depth++;
      if (op.type === 'Restore') depth--;
      if (depth < 0) return false; // Restore 多于 Save
    }
    return depth === 0;
  }

  // 计算 Paint Chunk：相同 PropertyTreeState 的连续指令组
  chunkByState(states: number[]): Array<{ start: number; end: number; state: number }> {
    const chunks: Array<{ start: number; end: number; state: number }> = [];
    let currentState = states[0];
    let start = 0;

    for (let i = 1; i <= states.length; i++) {
      if (i === states.length || states[i] !== currentState) {
        chunks.push({ start, end: i, state: currentState });
        if (i < states.length) {
          currentState = states[i];
          start = i;
        }
      }
    }
    return chunks;
  }
}
```

### 示例 3：Layer Squashing 条件判断器

```typescript
interface LayerState {
  hasTransformAnimation: boolean;
  hasOpacityAnimation: boolean;
  hasScroll: boolean;
  hasFilter: boolean;
  hasBlendMode: boolean;
  propertyTreeState: number; // 简化为单一状态 ID
}

function canSquash(a: LayerState, b: LayerState): { canSquash: boolean; reason?: string } {
  if (a.hasTransformAnimation || b.hasTransformAnimation) {
    return { canSquash: false, reason: 'Animation conflict' };
  }
  if (a.hasOpacityAnimation || b.hasOpacityAnimation) {
    return { canSquash: false, reason: 'Opacity animation conflict' };
  }
  if (a.hasScroll || b.hasScroll) {
    return { canSquash: false, reason: 'Scroll container isolation' };
  }
  if (a.hasFilter || b.hasFilter) {
    return { canSquash: false, reason: 'Filter requires offscreen surface' };
  }
  if (a.hasBlendMode || b.hasBlendMode) {
    return { canSquash: false, reason: 'Blend mode needs isolated group' };
  }
  if (a.propertyTreeState !== b.propertyTreeState) {
    return { canSquash: false, reason: 'Different PropertyTreeState' };
  }
  return { canSquash: true };
}
```

### 示例 4：Commit/Activate 双缓冲状态机

```typescript
type TreeState = 'main' | 'pending' | 'active';

class ThreeTreeStateMachine {
  private mainTree: string = 'v1';
  private pendingTree: string | null = null;
  private activeTree: string = 'v0';
  private pendingRasterized = false;

  // 主线程完成 Paint 后调用
  commit(newVersion: string) {
    if (this.pendingTree !== null) {
      throw new Error('Pending tree already exists, commit blocked');
    }
    this.pendingTree = newVersion;
    this.pendingRasterized = false;
    console.log(`Commit: ${this.mainTree} → Pending(${newVersion})`);
  }

  // Compositor Thread 完成光栅化后调用
  finishRasterization() {
    this.pendingRasterized = true;
    console.log('Rasterization complete for Pending tree');
  }

  // 激活 Pending Tree 为 Active Tree
  activate() {
    if (!this.pendingTree || !this.pendingRasterized) {
      throw new Error('Cannot activate: pending tree not ready');
    }
    this.activeTree = this.pendingTree;
    this.pendingTree = null;
    this.pendingRasterized = false;
    console.log(`Activate: Pending → Active(${this.activeTree})`);
  }

  getCurrentDisplayVersion(): string {
    return this.activeTree;
  }
}
```

### 示例 5：Tile Priority 队列调度器

```typescript
interface Tile {
  id: string;
  x: number;
  y: number;
  distanceToViewport: number;
  scrollVelocity: number;
}

class TilePriorityQueue {
  private tiles: Tile[] = [];

  add(tile: Tile) {
    this.tiles.push(tile);
  }

  // 优先级 = 距离视口中心 - 滚动方向预测偏移
  computePriority(tile: Tile): number {
    const predictiveOffset = tile.scrollVelocity * 16.67; // 预测 1 帧后的位置
    return tile.distanceToViewport - predictiveOffset;
  }

  getNextBatch(batchSize: number): Tile[] {
    return this.tiles
      .sort((a, b) => this.computePriority(a) - this.computePriority(b))
      .slice(0, batchSize);
  }

  markRasterized(tileId: string) {
    this.tiles = this.tiles.filter(t => t.id !== tileId);
  }
}
```

### 示例 6：DrawQuad 类型分发器

```typescript
type DrawQuad =
  | { type: 'SolidColor'; color: string; rect: DOMRect }
  | { type: 'Tile'; tileId: string; rect: DOMRect }
  | { type: 'Texture'; textureId: string; rect: DOMRect; uvRect: DOMRect }
  | { type: 'Surface'; surfaceId: string; rect: DOMRect }
  | { type: 'YUVVideo'; yTexture: string; uTexture: string; vTexture: string; rect: DOMRect };

class QuadRenderer {
  render(quad: DrawQuad, ctx: CanvasRenderingContext2D) {
    switch (quad.type) {
      case 'SolidColor':
        ctx.fillStyle = quad.color;
        ctx.fillRect(quad.rect.x, quad.rect.y, quad.rect.width, quad.rect.height);
        break;
      case 'Tile':
        // 实际实现中从 GPU 纹理采样
        console.log(`Rendering tile ${quad.tileId} at (${quad.rect.x}, ${quad.rect.y})`);
        break;
      case 'Texture':
        // 外部纹理（如 canvas/video）
        console.log(`Rendering texture ${quad.textureId} with UV ${quad.uvRect}`);
        break;
      case 'Surface':
        // 跨进程 iframe 的 Surface
        console.log(`Compositing surface ${quad.surfaceId}`);
        break;
      case 'YUVVideo':
        // GPU 执行 YUV→RGB 转换
        console.log(`Rendering YUV video frame Y:${quad.yTexture} U:${quad.uTexture} V:${quad.vTexture}`);
        break;
    }
  }
}
```

---


## 参考文献

1. Chromium Project. *RenderingNG: An Overview.* Chromium Graphics Documentation, 2021. <https://developer.chrome.com/docs/chromium/renderingng/>
2. Chromium Project. *Property Trees Design Doc.* Chromium Compositor Wiki, 2020.
3. Chromium Project. *CompositeAfterPaint (CAP).* Blink Rendering Dev, 2019.
4. Chromium Project. *Viz and the Display Compositor.* Chromium GPU Team, 2020.
5. Google. *Inside look at modern web browser (Part 3 & 4).* Web.dev, 2018. <https://developer.chrome.com/blog/inside-browser-part3/>
6. Skia Team. *Skia Graphite: A New GPU Backend.* Skia Documentation, 2022. <https://skia.org/docs/dev/design/graphite/>
7. Stanford, S. et al. *Trees in Viz (TiV): Centralizing Compositing.* Chromium Design Doc, 2024.
8. W3C. *CSS Transforms Module Level 2.* W3C Working Draft, 2023. <https://www.w3.org/TR/css-transforms-2/>
9. W3C. *CSS Compositing and Blending Level 2.* W3C Working Draft. <https://www.w3.org/TR/compositing-2/>
10. Kosaka, Mariko. *Inside look at modern web browser.* Google Web Developers, 2018.

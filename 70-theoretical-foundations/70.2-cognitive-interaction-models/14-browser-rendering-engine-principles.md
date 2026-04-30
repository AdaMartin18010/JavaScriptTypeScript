# 浏览器渲染引擎原理

> **核心命题**：浏览器渲染不是"黑魔法"，而是一个有明确阶段、可形式化描述的计算管道。理解这个管道，可以解释为什么某些代码快、某些代码慢，以及如何写出高性能的前端代码。

---

## 目录

- [浏览器渲染引擎原理](#浏览器渲染引擎原理)
  - [目录](#目录)
  - [1. 历史脉络：从 Mosaic 到 Chromium](#1-历史脉络从-mosaic-到-chromium)
  - [2. 渲染管道的整体架构](#2-渲染管道的整体架构)
    - [2.1 关键渲染路径（Critical Rendering Path）](#21-关键渲染路径critical-rendering-path)
  - [3. HTML 解析与 DOM 树构建](#3-html-解析与-dom-树构建)
    - [3.1 HTML 解析的形式化模型](#31-html-解析的形式化模型)
    - [3.2 DOM 树的范畴论视角](#32-dom-树的范畴论视角)
  - [4. CSS 解析与 CSSOM 构建](#4-css-解析与-cssom-构建)
    - [4.1 CSS 解析的复杂性](#41-css-解析的复杂性)
    - [4.2 CSS 的层叠与继承](#42-css-的层叠与继承)
  - [5. Render Tree 的构造](#5-render-tree-的构造)
    - [5.1 Render Tree 的构建算法](#51-render-tree-的构建算法)
    - [5.2 Render Tree 与 DOM Tree 的差异](#52-render-tree-与-dom-tree-的差异)
  - [6. Layout（布局）计算](#6-layout布局计算)
    - [6.1 Layout 的形式化模型](#61-layout-的形式化模型)
    - [6.2 Layout 的算法复杂度](#62-layout-的算法复杂度)
  - [7. Paint（绘制）与分层](#7-paint绘制与分层)
    - [7.1 Paint 的形式化模型](#71-paint-的形式化模型)
    - [7.2 分层（Layering）策略](#72-分层layering策略)
  - [8. Composite（合成）与 GPU 加速](#8-composite合成与-gpu-加速)
    - [8.1 合成的形式化模型](#81-合成的形式化模型)
    - [8.2 合成器线程与主线程](#82-合成器线程与主线程)
  - [9. V8 引擎与渲染引擎的交互](#9-v8-引擎与渲染引擎的交互)
    - [9.1 V8 的执行管道](#91-v8-的执行管道)
    - [9.2 JavaScript 执行与渲染的同步](#92-javascript-执行与渲染的同步)
  - [10. 渲染性能优化策略](#10-渲染性能优化策略)
    - [10.1 避免 Reflow 和 Repaint](#101-避免-reflow-和-repaint)
    - [10.2 虚拟列表与懒加载](#102-虚拟列表与懒加载)
  - [11. 精确直觉类比与边界](#11-精确直觉类比与边界)
    - [11.1 渲染管道像印刷厂](#111-渲染管道像印刷厂)
    - [11.2 GPU 合成像 Photoshop 图层](#112-gpu-合成像-photoshop-图层)
  - [12. 反例与局限性](#12-反例与局限性)
    - [12.1 渲染引擎不是确定性的](#121-渲染引擎不是确定性的)
    - [12.2 渲染优化不是普适的](#122-渲染优化不是普适的)
    - [12.3 理解渲染管道的价值](#123-理解渲染管道的价值)
  - [参考文献](#参考文献)
    - [13. 渲染引擎与前端框架的交互](#13-渲染引擎与前端框架的交互)
    - [14. 渲染性能指标与测量](#14-渲染性能指标与测量)
    - [15. 渲染引擎的未来趋势](#15-渲染引擎的未来趋势)
  - [参考文献](#参考文献-1)

---

## 1. 历史脉络：从 Mosaic 到 Chromium

浏览器渲染引擎的演化是一部"性能与兼容性"的斗争史。

```
1993: Mosaic（第一个图形界面浏览器）
  → 渲染：简单的文本 + 图片
  → 布局：流式布局（从上到下）

1995: Netscape Navigator
  → 引入 JavaScript（LiveScript）
  → 渲染引擎开始需要处理动态内容

1997: Internet Explorer 4（Trident 引擎）
  → 引入 DOM 概念
  → CSS 开始被支持

2003: Safari（WebKit 引擎）
  → KHTML 分支
  → 更标准的 CSS 支持

2008: Chrome（V8 + WebKit/Blink）
  → 多进程架构
  → V8 JavaScript 引擎
  → 每标签页独立进程

2013: Blink 引擎从 WebKit 分叉
  → Google 主导
  → 更激进的性能优化

2020+: 现代浏览器引擎
  → GPU 加速渲染
  → 并行 CSS/JS 解析
  → 更精细的渲染流水线
```

**核心洞察**：每一次渲染引擎的革新，都是对"如何在有限时间内将网页内容呈现给用户"这一问题的重新解答。

---

## 2. 渲染管道的整体架构

### 2.1 关键渲染路径（Critical Rendering Path）

浏览器将 HTML/CSS/JS 转换为像素的过程，称为**关键渲染路径**。

```
关键渲染路径的 6 个阶段：

1. DOM 构建
   HTML → Tokenizer → Parser → DOM Tree

2. CSSOM 构建
   CSS → Parser → CSSOM Tree

3. Render Tree 构建
   DOM + CSSOM → Render Tree（只包含可见元素）

4. Layout（布局）
   Render Tree → Layout Tree（计算每个节点的几何信息）

5. Paint（绘制）
   Layout Tree → Paint Records（绘制指令列表）

6. Composite（合成）
   Paint Layers → GPU Textures → Screen

总时间 = T_DOM + T_CSSOM + T_Render + T_Layout + T_Paint + T_Composite
```

**TypeScript 模拟渲染管道**：

```typescript
// 渲染管道的简化模型
interface RenderPipeline {
  // 阶段 1: DOM 构建
  buildDOM(html: string): DOMNode;

  // 阶段 2: CSSOM 构建
  buildCSSOM(css: string): CSSOMNode;

  // 阶段 3: Render Tree
  buildRenderTree(dom: DOMNode, cssom: CSSOMNode): RenderNode;

  // 阶段 4: Layout
  calculateLayout(renderTree: RenderNode): LayoutNode;

  // 阶段 5: Paint
  generatePaintRecords(layoutTree: LayoutNode): PaintRecord[];

  // 阶段 6: Composite
  compositeLayers(records: PaintRecord[]): Frame;
}
```

---

## 3. HTML 解析与 DOM 树构建

### 3.1 HTML 解析的形式化模型

HTML 解析器可以看作一个**下推自动机**（Pushdown Automaton）。

```
HTML 解析器 = 下推自动机

状态 = 解析器当前模式（initial, before html, in head, in body, ...）
输入 = HTML 字符流
栈 = 开放元素栈（处理嵌套标签）
输出 = DOM 树

状态转移 = 根据当前状态和输入字符，
           转移到新状态并可能修改栈
```

**Tokenization 过程**：

```
HTML 字符流 → Tokenizer → Token 序列

Token 类型：
- DOCTYPE
- StartTag（如 <div>）
- EndTag（如 </div>）
- Comment
- Character（文本内容）
- EOF
```

**树构建算法**：

```
树构建 = 将 Token 序列转换为 DOM 树

算法（简化版）：
1. 创建 Document 对象作为根
2. 维护一个"开放元素栈"
3. 对于每个 StartTag Token：
   a. 创建新元素
   b. 添加到当前父元素
   c. 压入开放元素栈
4. 对于每个 EndTag Token：
   a. 从开放元素栈弹出元素
5. 对于每个 Character Token：
   a. 创建文本节点
   b. 添加到当前父元素

HTML 的容错性：
- 未闭合标签 → 自动闭合
- 错误嵌套 → 自动重排
- 这对应于下推自动机的"错误恢复"机制
```

### 3.2 DOM 树的范畴论视角

```
DOM 树 = 有向树（范畴论中的"树范畴"）

对象 = DOM 节点
态射 = 父子关系（parent → child）

DOM 操作 = 树范畴中的态射：
- createElement = 创建新对象
- appendChild = 添加态射
- removeChild = 删除态射
- replaceChild = 组合态射

范畴论视角告诉我们：
DOM 操作应该保持树的结构（不破坏树的性质）
```

---

## 4. CSS 解析与 CSSOM 构建

### 4.1 CSS 解析的复杂性

CSS 解析器比 HTML 解析器更复杂，因为 CSS 具有**上下文无关语法**。

```
CSS 解析器 = LR(1) 解析器

输入：CSS 字符流
输出：CSSOM 树

CSSOM 结构：
- StyleSheet
  - CSSRule
    - CSSStyleRule（选择器 + 声明块）
    - CSSMediaRule（@media）
    - CSSKeyframesRule（@keyframes）
    - ...
```

**选择器匹配的复杂度**：

```
选择器匹配 = 在 DOM 树中查找符合条件的节点

时间复杂度：
- 简单选择器（如 div）：O(1) 每节点
- 后代选择器（如 div p）：O(d) 每节点（d = 深度）
- 通用选择器（如 *）：O(n) 每节点（n = 节点数）

优化：浏览器维护"规则索引"，加速匹配
```

### 4.2 CSS 的层叠与继承

```
层叠（Cascade）= 冲突解决算法

当多个规则匹配同一个元素时：
1. 比较来源（用户代理 < 用户 < 作者 < !important）
2. 比较特异性（Specificity）
3. 比较源代码顺序

特异性计算：
  (a, b, c) 其中：
  a = ID 选择器数量
  b = 类/属性/伪类选择器数量
  c = 类型/伪元素选择器数量

继承 = 某些属性自动从父元素继承
  如 color, font-family
  不继承的如 margin, padding
```

---

## 5. Render Tree 的构造

### 5.1 Render Tree 的构建算法

Render Tree 只包含**可见元素**。

```
Render Tree 构建算法：

1. 遍历 DOM 树的每个节点
2. 对于每个节点：
   a. 查找匹配的所有 CSS 规则
   b. 计算最终样式（层叠 + 继承 + 默认值）
   c. 如果 display: none，跳过（不加入 Render Tree）
   d. 如果 visibility: hidden，加入但标记为不可见
   e. 创建 RenderObject
3. 建立 RenderObject 之间的父子关系

注意：
- head 元素不加入 Render Tree
- display: none 的元素及其子元素都不加入
- 伪元素（::before, ::after）会创建额外的 RenderObject
```

### 5.2 Render Tree 与 DOM Tree 的差异

```
DOM Tree ≠ Render Tree

差异原因：
1. 不可见元素（display: none）只在 DOM Tree 中
2. 伪元素在 Render Tree 中有独立节点
3. 表单控件可能有额外的 RenderObject（如 input 的边框）
4. 匿名块（Anonymous Blocks）可能自动创建

这对应于范畴论中的"遗忘函子"：
  DOM → Render Tree 的映射是"有损的"
  某些信息在转换过程中被丢弃
```

---

## 6. Layout（布局）计算

### 6.1 Layout 的形式化模型

Layout 计算每个 RenderObject 的**几何信息**（位置、大小）。

```
Layout 计算 = 递归的约束求解

对于每个节点：
  width = f(parent.width, margin, padding, border, content)
  height = f(children, content, min-height, max-height)
  x = f(parent.x, margin-left)
  y = f(previousSibling.y, previousSibling.height, margin-top)

布局模式：
- Block Flow：块级元素，垂直排列
- Inline Flow：行内元素，水平排列
- Flex：弹性布局
- Grid：网格布局
- Table：表格布局
- Positioned：绝对/固定/粘性定位
```

**Reflow（重排）的触发条件**：

```
当以下属性改变时，会触发 Reflow：
- 尺寸：width, height, margin, padding, border
- 位置：top, left, right, bottom
- 内容：text, child 元素变化
- 显示：display, visibility

Reflow 是递归的：
  一个元素的布局变化 → 可能影响其父元素、子元素、兄弟元素
  最坏情况：触发整个文档的 Reflow
```

### 6.2 Layout 的算法复杂度

```
Layout 算法的时间复杂度：

简单情况（流式布局）：O(n)
  每个元素只依赖前一个兄弟元素

复杂情况（Flex/Grid）：O(n) 或 O(n × m)
  Flex 需要多轮计算（measure → layout）
  Grid 需要求解二维约束

最坏情况（绝对定位 + 百分比）：O(n²)
  百分比依赖父元素尺寸
  父元素尺寸可能依赖子元素
  需要迭代直到收敛
```

---

## 7. Paint（绘制）与分层

### 7.1 Paint 的形式化模型

Paint 将 Layout 结果转换为**绘制指令**。

```
Paint 阶段 = 生成绘制指令列表

绘制指令类型：
- DrawRect：绘制矩形（背景、边框）
- DrawText：绘制文本
- DrawImage：绘制图片
- DrawPath：绘制路径（SVG、Canvas）
- DrawPicture：嵌套的绘制指令

绘制顺序（Paint Order）：
1. 背景色/背景图
2. 边框
3. 子元素的背景/边框
4. 子元素的内容
5. 轮廓（outline）
6. 其他（如 ::before/::after）

这遵循 CSS 的"层叠"概念——后绘制的覆盖先绘制的。
```

### 7.2 分层（Layering）策略

浏览器将页面分为多个**层**（Layers），以优化合成性能。

```
分层策略：

自动分层（浏览器决定）：
- 3D 变换（transform: translateZ()）
- 透明度动画（opacity）
- 固定/粘性定位（position: fixed/sticky）
- will-change 属性
- video/canvas/iframe 元素
- 重叠元素（z-index）

手动分层（开发者控制）：
- will-change: transform
- transform: translateZ(0)（强制分层）
```

**层的内存开销**：

```
每个层 = 一个 GPU 纹理（位图）

内存占用 = width × height × 4 bytes (RGBA)

例如：一个 1920 × 1080 的层：
  内存 = 1920 × 1080 × 4 ≈ 8 MB

层数过多 = 内存压力 + 合成开销

权衡：
  分层减少 Repaint 范围
  但增加内存和合成成本
```

---

## 8. Composite（合成）与 GPU 加速

### 8.1 合成的形式化模型

合成阶段将多个层合并为最终的屏幕图像。

```
合成 = 层的组合

合成器（Compositor）的工作：
1. 收集所有可见层
2. 按 z-index 排序
3. 对每个层：
   a. 应用变换（transform）
   b. 应用裁剪（clip）
   c. 应用透明度（opacity）
4. 将所有层混合为最终图像

GPU 加速：
  合成在 GPU 上执行（通过 OpenGL/Vulkan/DirectX）
  这意味着：transform 和 opacity 动画非常高效
  因为不需要 CPU 重新计算 Layout 或 Paint
```

### 8.2 合成器线程与主线程

```
现代浏览器使用多线程架构：

主线程（Main Thread）：
  - JavaScript 执行
  - DOM/CSSOM 构建
  - Layout 计算
  - Paint 记录生成

合成器线程（Compositor Thread）：
  - 层合成
  - 滚动处理
  - 输入事件（部分）

GPU 进程：
  - 纹理上传
  - 着色器执行
  - 最终渲染

优势：
  合成器线程可以独立于主线程运行
  因此：滚动和某些动画不阻塞 JS 执行
```

---

## 9. V8 引擎与渲染引擎的交互

### 9.1 V8 的执行管道

V8 是 Chrome 的 JavaScript 引擎，它与渲染引擎紧密协作。

```
V8 执行管道：

JavaScript 源码 → Parser → AST
  AST → Ignition（解释器）→ 字节码
    字节码 → TurboFan（JIT 编译器）→ 机器码
      热点代码 → 优化编译 → 更高效的机器码
      去优化（Deoptimization）→ 如果假设不成立

与渲染引擎的交互：
  V8 通过 Blink 的 V8 API 访问 DOM
  DOM 操作触发渲染引擎的更新
```

### 9.2 JavaScript 执行与渲染的同步

```
JavaScript 执行和渲染是互斥的：

主线程：
  [JS 执行] → [微任务] → [渲染] → [JS 执行] → ...

这意味着：
- 长时间 JS 执行会阻塞渲染
- 导致卡顿（Jank）

requestAnimationFrame：
  告诉浏览器："请在下次渲染前执行这段代码"
  这允许 JS 与渲染同步

requestIdleCallback：
  告诉浏览器："请在空闲时执行这段代码"
  这允许低优先级的任务不阻塞渲染
```

---

## 10. 渲染性能优化策略

### 10.1 避免 Reflow 和 Repaint

```
Reflow 和 Repaint 是性能杀手。

触发 Reflow 的属性（最昂贵）：
  width, height, top, left, margin, padding, border
  display, position, font-size

仅触发 Repaint 的属性（较便宜）：
  color, background-color, border-color, visibility

触发 Composite 的属性（最便宜）：
  transform, opacity

优化策略：
1. 使用 transform 代替 top/left 做动画
2. 使用 opacity 代替 visibility/display 做淡入淡出
3. 批量修改样式（使用 class 切换）
4. 使用 requestAnimationFrame 同步动画
5. 使用 will-change 提示浏览器优化
```

### 10.2 虚拟列表与懒加载

```
虚拟列表（Virtual List）：
  只渲染视口内的元素
  滚动时动态更新渲染的元素

时间复杂度：
  全量渲染：O(n)
  虚拟列表：O(v)（v = 视口内元素数，v << n）

懒加载（Lazy Loading）：
  图片/组件只在需要时加载
  IntersectionObserver 检测元素是否进入视口
```

---

## 11. 精确直觉类比与边界

### 11.1 渲染管道像印刷厂

| 渲染阶段 | 印刷厂 | 浏览器 |
|---------|--------|--------|
| HTML 解析 | 接收文稿 | 解析标签 |
| CSS 解析 | 排版设计 | 计算样式 |
| DOM + CSSOM | 内容 + 设计稿 | 内容 + 样式 |
| Render Tree | 最终排版方案 | 可见元素树 |
| Layout | 计算每页尺寸 | 计算元素位置 |
| Paint | 印刷到纸张 | 绘制为像素 |
| Composite | 装订成册 | 合成到屏幕 |

**哪里像**：

- ✅ 像印刷厂一样，渲染是"流水线"——每个阶段有明确输入输出
- ✅ 像印刷厂一样，前一阶段的错误会影响后续所有阶段

**哪里不像**：

- ❌ 不像印刷厂，浏览器渲染是"动态"的——内容随时变化
- ❌ 不像印刷厂，浏览器可以"撤销"和"重印"（重新渲染）

### 11.2 GPU 合成像 Photoshop 图层

| 概念 | Photoshop | 浏览器合成 |
|------|-----------|-----------|
| 图层 | Layer | Render Layer |
| 混合模式 | Blend Mode | CSS mix-blend-mode |
| 变换 | 自由变换 | CSS transform |
| 透明度 | Opacity 滑块 | CSS opacity |
| 滤镜 | 滤镜效果 | CSS filter |
| 合成 | 合并图层 | Composite |

**哪里像**：

- ✅ 像 Photoshop 一样，分层允许独立编辑（更新）某些元素
- ✅ 像 Photoshop 一样，某些变换（transform）不影响其他图层

**哪里不像**：

- ❌ 不像 Photoshop，浏览器图层由算法自动决定（部分可控制）
- ❌ 不像 Photoshop，浏览器图层的数量受内存限制

---

## 12. 反例与局限性

### 12.1 渲染引擎不是确定性的

```
不同浏览器的渲染结果可能不同：

- Chrome/Safari/Firefox 的默认样式不同
- CSS 特性的支持程度不同
- 性能特征不同（如合成策略）

这意味着：
"形式化"的渲染模型只是近似
实际渲染行为需要在真实浏览器中验证
```

### 12.2 渲染优化不是普适的

```
渲染优化策略高度依赖具体场景：

- will-change 可以加速动画，但增加内存
- 分层减少 Repaint，但增加合成成本
- requestAnimationFrame 同步动画，但不适合所有情况

没有"银弹"——只有"权衡"。
```

### 12.3 理解渲染管道的价值

```
理解渲染管道的目的：

✅ 解释性能问题的根因
✅ 指导代码优化决策
✅ 设计高性能的 UI 架构

❌ 不是让你手动管理渲染
❌ 不是替代浏览器的优化
❌ 不是预测精确的渲染时间

类比：理解发动机原理可以帮助你更好地开车，
     但不意味着你要自己造发动机。
```

---

## 参考文献

1. Google Chrome Team. "Chrome University: Life of a Pixel." (2019)
2. Hathi, S. "How Browsers Work: Behind the Scenes of Modern Web Browsers." *HTML5 Rocks*.
3. Agrawal, R. "Rendering Performance." *web.dev*.
4. Apple WebKit Team. "WebKit Documentation." webkit.org.
5. Mozilla MDN. "Critical Rendering Path." developer.mozilla.org.
6. Irish, P. "Accelerated Rendering in Chrome." *HTML5 Rocks*.
7. W3C. "HTML Specification." html.spec.whatwg.org.
8. W3C. "CSS Specification." w3.org/Style/CSS.
9. Google V8 Team. "V8 Documentation." v8.dev.
10. Blink Team. "Blink Rendering Engine." chromium.org/blink.


### 13. 渲染引擎与前端框架的交互

前端框架与渲染引擎的交互是影响性能的关键。

**React 与渲染引擎**：

```
React 的更新流程：

1. setState() 触发重新渲染
2. React 构建新的 VDOM 树
3. Diff 算法计算最小更新
4. 生成 DOM 操作队列
5. 在浏览器的事件循环中执行 DOM 操作

与渲染引擎的交互点：
- 批量更新（Batching）：多个 setState 合并为一次渲染
- 时间切片（Time Slicing）：长任务拆分为小块，避免阻塞主线程
- Suspense：异步数据获取与渲染的协调
```

**Vue 与渲染引擎**：

```
Vue 的更新流程：

1. 响应式数据变化触发 setter
2. 依赖追踪系统收集受影响的组件
3. 将更新任务放入异步队列（nextTick）
4. 在下一个事件循环中批量执行更新
5. 直接修改真实 DOM（无 VDOM diff 在某些情况下）

与渲染引擎的交互点：
- nextTick：利用微任务队列实现批量更新
- 异步组件：代码分割 + 懒加载
- KeepAlive：缓存组件实例，避免重复渲染
```

**框架对渲染引擎的优化策略**：

```typescript
// 1. 避免强制同步布局（Forced Synchronous Layout）
// 坏：读取 layout 后立即修改，再读取
function bad() {
  const height = element.offsetHeight;  // 读取 layout
  element.style.height = (height + 10) + 'px';  // 修改
  const newHeight = element.offsetHeight;  // 再次读取（强制 reflow！）
}

// 好：批量读取，批量修改
function good() {
  const height = element.offsetHeight;
  const width = element.offsetWidth;
  // ... 所有读取完成

  element.style.height = (height + 10) + 'px';
  element.style.width = (width + 10) + 'px';
  // ... 所有修改完成
}

// 2. 使用 requestAnimationFrame 同步动画
function animate() {
  requestAnimationFrame(() => {
    element.style.transform = `translateX(${x}px)`;
    x += 1;
    if (x < 100) animate();
  });
}

// 3. 使用 CSS  containment 限制渲染范围
// .contained { contain: layout paint; }
// 告诉浏览器：这个元素的布局/绘制不影响外部
```

### 14. 渲染性能指标与测量

```
核心性能指标：

1. First Contentful Paint (FCP)
   → 首次内容绘制时间
   → 目标：< 1.8s

2. Largest Contentful Paint (LCP)
   → 最大内容绘制时间
   → 目标：< 2.5s

3. First Input Delay (FID) / Interaction to Next Paint (INP)
   → 首次输入延迟 / 交互到下次绘制
   → 目标：FID < 100ms, INP < 200ms

4. Cumulative Layout Shift (CLS)
   → 累积布局偏移
   → 目标：< 0.1

5. Time to First Byte (TTFB)
   → 首字节时间
   → 目标：< 600ms

测量工具：
- Lighthouse（自动化审计）
- Chrome DevTools Performance 面板
- Web Vitals 扩展
- PageSpeed Insights
```

### 15. 渲染引擎的未来趋势

```
趋势 1：WebGPU
  → 下一代 Web 图形 API
  → 取代 WebGL
  → 更低的开销，更高的性能
  → 适用于：3D 渲染、机器学习、视频处理

趋势 2：CSS Houdini
  → 暴露渲染引擎的内部 API
  → 开发者可以自定义 CSS 解析、布局、绘制
  → 例如：自定义布局引擎（如瀑布流）

趋势 3：OffscreenCanvas
  → 在 Worker 线程中渲染 Canvas
  → 不阻塞主线程
  → 适用于：游戏、数据可视化

趋势 4：Portals
  → 无缝的页面过渡
  → 预渲染下一页
  → 类似原生应用的体验

趋势 5：RenderingNG
  → Chromium 的新一代渲染架构
  → 更好的性能隔离
  → 更可靠的渲染流水线
```

---

## 参考文献

1. Google Chrome Team. "Chrome University: Life of a Pixel." (2019)
2. Hathi, S. "How Browsers Work: Behind the Scenes of Modern Web Browsers." *HTML5 Rocks*.
3. Agrawal, R. "Rendering Performance." *web.dev*.
4. Apple WebKit Team. "WebKit Documentation." webkit.org.
5. Mozilla MDN. "Critical Rendering Path." developer.mozilla.org.
6. Irish, P. "Accelerated Rendering in Chrome." *HTML5 Rocks*.
7. W3C. "HTML Specification." html.spec.whatwg.org.
8. W3C. "CSS Specification." w3.org/Style/CSS.
9. Google V8 Team. "V8 Documentation." v8.dev.
10. Blink Team. "Blink Rendering Engine." chromium.org/blink.
11. Google Web Vitals Team. "Web Vitals." web.dev/vitals.
12. W3C. "WebGPU Specification." gpuweb.github.io/gpuweb.
13. CSS Houdini Task Force. "CSS Houdini." houdini.how.
14. Chromium Blog. "RenderingNG." blog.chromium.org.

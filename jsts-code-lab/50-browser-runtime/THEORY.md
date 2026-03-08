# 浏览器运行时深度解析

## 1. 渲染管线的计算机图形学基础

### 1.1 渲染流水线概览

浏览器渲染本质上是将 DOM/CSS 转换为像素的过程，涉及计算机图形学的核心概念：

```
DOM + CSSOM → Render Tree → Layout → Paint → Composite → Pixels
```

**每一阶段的形式化定义**：

#### Render Tree 构建

```
RenderObject = f(DOMNode, ComputedStyle)

其中：
- 可见性判定：display ≠ none ∧ visibility ≠ hidden
- 样式继承：Cascading 算法计算最终样式
- 盒模型：content + padding + border + margin
```

#### Layout（Reflow）

```
几何属性 = { width, height, x, y, position, ... }

布局算法的复杂度：
- 块级布局：O(n) - 线性遍历
- 表格布局：O(n²) - 单元格相互依赖
- Flexbox：O(n) - 两遍扫描
- Grid：O(n²) - 二维约束求解
```

**布局抖动（Layout Thrashing）原理**：

```javascript
// 强制同步布局的读写循环
for (let i = 0; i < elements.length; i++) {
    const height = elements[i].offsetHeight;  // 读 → 触发布局计算
    elements[i].style.height = height * 2 + 'px';  // 写 → 标记脏布局
}
// 复杂度：O(n²) - 每次读写都触发完整布局
```

**解决方案 - FastDOM**：

```javascript
// 读写分离
const heights = elements.map(e => e.offsetHeight);  // 批量读
heights.forEach((h, i) => {
    elements[i].style.height = h * 2 + 'px';  // 批量写
});
// 复杂度：O(n) - 只触发两次布局
```

### 1.2 渲染优化理论

#### 渲染层（Layer）管理

```
渲染层的创建条件：
1. 3D 变换：transform: translate3d()
2. 视频元素
3. Canvas
4. opacity/animation
5. will-change 提示

层合并的成本模型：
- 每层的内存成本 = width × height × 4 bytes (RGBA)
- 层切换的 GPU 成本
- 最优层数：根据 GPU 内存动态调整
```

#### 合成器线程（Compositor Thread）

```
主线程                    合成器线程
--------                  ------------
JS 执行                    接收绘制四元树
样式计算                   栅格化图块
布局                      生成 GPU 命令
绘制记录 → IPC →         提交到 GPU

并行化收益：
- 滚动平滑度提升
- 主线程阻塞不影响视觉更新
```

## 2. 事件循环的并发模型

### 2.1 并发与并行的区别

```
并发 (Concurrency):
- 逻辑上的同时处理
- 单核 CPU 通过时间片轮转实现
- 关注任务的组织方式

并行 (Parallelism):
- 物理上的同时执行
- 需要多核 CPU
- 关注任务的执行方式

JavaScript:
- 单线程并发（Event Loop）
- Web Workers 提供并行能力
```

### 2.2 事件循环的形式化模型

**形式化定义**：

```
EventLoop = (TaskQueues, MicrotaskQueue, EventSource)

TaskQueues = {
    'user-blocking': Queue<Task>,
    'user-visible': Queue<Task>,
    'background': Queue<Task>
}

执行周期：
1. 从最高优先级非空队列取一个任务执行
2. 执行完成后，清空 MicrotaskQueue
3. 执行渲染（如果需要）
4. 重复
```

**优先级调度理论**：

```
基于优先级的事件调度避免了：
- 饿死（Starvation）：高优先级任务不断抢占
- 优先级反转：低优先级任务持有高优先级任务需要的资源

浏览器解决方案：
- 时间片限制（Long Task 检测）
- 优先级老化（Priority Aging）
```

### 2.3 微任务（Microtask）的语义

```
微任务队列的设计哲学：
- Promise 的 then/catch/finally
- async/await 的底层实现
- MutationObserver

关键保证：
在当前任务完成后、下一个任务开始前，
微任务队列必须被清空。

这确保了：
- Promise 的链式调用的原子性
- 状态变更的同步观察
```

## 3. 内存管理理论

### 3.1 垃圾回收算法

**分代假说（Generational Hypothesis）**：

```
弱分代假说：大多数对象朝生夕死
强分代假说：熬过多次收集的对象难以消亡

V8 的分代策略：
- 新生代（Young Generation）：存活时间短
  - 容量小，回收频繁
  - Scavenge 算法（复制算法）

- 老生代（Old Generation）：存活时间长
  - 容量大，回收不频繁
  - Mark-Sweep + Mark-Compact
```

**垃圾回收的三色标记法**：

```
白色：未被访问，可回收
灰色：已访问，但引用的对象未全部访问
黑色：已访问，引用的对象已全部访问

算法流程：
1. 根对象标记为灰色
2. 取出灰色对象，标记为黑色，引用对象标记为灰色
3. 重复直到没有灰色对象
4. 白色对象回收

增量标记：
将标记过程拆分为小步，与 JS 执行交替
避免长时间停顿（Stop-The-World）
```

### 3.2 内存泄漏模式

```javascript
// 1. 意外的全局变量
function leak() {
    globalVar = 'I am global';  // 没有声明
}

// 2. 闭包陷阱
function outer() {
    const hugeData = new Array(1000000);
    return function inner() {
        console.log('using hugeData');
    };
}
const fn = outer();  // hugeData 被闭包持有，无法释放

// 3. 事件监听器
class Component {
    constructor() {
        window.addEventListener('resize', this.handleResize);
    }
    // 忘记 removeEventListener 导致组件销毁后仍然被引用
}

// 4. 定时器/回调
const data = fetchData();
setInterval(() => {
    console.log(data);  // data 被闭包持有
}, 1000);
```

## 4. 性能指标的科学测量

### 4.1 Core Web Vitals 的统计学基础

**LCP (Largest Contentful Paint)**：

```
测量方法：
- 观察所有块级元素的绘制时间
- 取视口内最大元素的时间

百分位数统计：
- 报告 75th percentile
- 理由：对异常值不敏感，反映大多数用户体验

优化目标：
LCP < 2.5s (Good)
2.5s ≤ LCP < 4s (Needs Improvement)
LCP ≥ 4s (Poor)
```

**INP (Interaction to Next Paint)**：

```
交互延迟的完整链条：
用户输入 → 事件处理 → 样式计算 → 布局 → 绘制 → 合成

INP = max(交互延迟) for all interactions

优化策略：
1. 减少主线程阻塞（Long Tasks）
2. 使用 requestIdleCallback 处理非紧急任务
3. 虚拟滚动减少 DOM 节点数
```

### 4.2 性能预算（Performance Budget）

```
基于竞争分析的预算设定：

设竞争对手的加载时间为 T_competitor
我们的目标：T_target ≤ 0.8 × T_competitor

资源预算计算：
- JS 预算：总大小 / 压缩后大小 / 缓存命中率
- 图片预算：视口大小 × 设备像素比 × 格式效率
- 字体预算：字重数量 × 子集化程度
```

## 5. 现代浏览器架构演进

### 5.1 多进程架构

```
Chrome 的多进程模型：

Browser Process (主进程)
    │
    ├── GPU Process (图形加速)
    │
    ├── Renderer Process x N (标签页)
    │       ├── Blink (渲染引擎)
    │       └── V8 (JS 引擎)
    │
    ├── Network Process (网络请求)
    │
    └── Plugin Process (插件隔离)

进程隔离的收益：
1. 稳定性：一个标签页崩溃不影响其他
2. 安全性：利用 OS 进程隔离机制
3. 性能：多核并行

成本：
- 内存开销：每个进程有基础开销
- 进程间通信：IPC 延迟
```

### 5.2 站点隔离（Site Isolation）

```
Spectre 漏洞后的安全架构：

原则：不同站点的页面运行在不同进程

例外处理：
- 同源的 iframe 可以共享进程
- 资源受限时，相同 eTLD+1 的站点可能共享

实现机制：
- 跨站点的数据访问需要 IPC
- 渲染进程无法直接访问其他站点的内存
```

## 参考资源

### 规范文档

1. [HTML Standard - Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
2. [W3C Performance Timeline](https://www.w3.org/TR/performance-timeline/)

### 技术文章

1. [Inside look at modern web browser](https://developers.google.com/web/updates/2018/09/inside-browser-part1) (Google)
2. [The Anatomy of a Frame](https://aerotwist.com/blog/the-anatomy-of-a-frame/) (Paul Lewis)

### 学术研究

1. Meyerovich, L. A., & Bodik, R. (2010). "Fast and Parallel Webpage Layout"
2. Hackett, B., & Guo, S. (2012). "Fast and Precise Hybrid Type Inference for JavaScript"

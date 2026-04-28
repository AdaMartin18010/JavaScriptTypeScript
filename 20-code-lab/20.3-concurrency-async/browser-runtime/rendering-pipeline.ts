/**
 * @file 浏览器渲染管线模型
 * @category Browser Runtime → Rendering Pipeline
 * @difficulty hard
 * @tags rendering, critical-rendering-path, performance, browser-internals
 * 
 * @model_overview
 * 浏览器将HTML/CSS/JS转换为屏幕像素的完整流程
 * 
 * 核心抽象: 像素管道 (Pixel Pipeline)
 * JS/样式 → 计算样式 → 布局 → 绘制 → 合成 → 屏幕
 * 
 * 关键性能指标:
 * - FP (First Paint): 首次绘制时间
 * - FCP (First Contentful Paint): 首次内容绘制
 * - LCP (Largest Contentful Paint): 最大内容绘制 < 2.5s
 * - TTI (Time to Interactive): 可交互时间 < 3.8s
 * - CLS (Cumulative Layout Shift): 累积布局偏移 < 0.1
 * 
 * @architecture_components
 * 
 * ## 1. JavaScript执行引擎 (V8)
 * 
 * ### 执行模型
 * ```
 * 源码 → Parser → AST → Ignition(字节码) → TurboFan(优化机器码)
 * ```
 * 
 * ### Hidden Class机制
 * 对象 shapes的演变过程:
 * ```javascript
 * const obj = {};      // Shape: {} (空)
 * obj.x = 1;           // Shape: {x} (添加属性x)
 * obj.y = 2;           // Shape: {x,y} (添加属性y)
 * ```
 * 属性访问通过Shape偏移量直接定位，类似C结构体
 * 
 * ### Inline Caching (IC)
 * 多态调用点的缓存策略:
 * - monomorphic: 1个类型，直接调用
 * - polymorphic: 2-4个类型，switch分发
 * - megamorphic: >4个类型，哈希表查找
 * 
 * ## 2. 样式计算引擎 (Style Engine)
 * 
 * ### 选择器匹配算法
 * 复杂度: O(n × m)，n=元素数，m=选择器数
 * 
 * 优化策略:
 * - 右侧优先匹配 (从最具体的开始)
 * - Bloom Filter快速排除
 * - 共享选择器缓存
 * 
 * ### Computed Style计算
 * 层叠顺序 (Specificity):
 * 1. !important (最高优先级)
 * 2. 内联样式 (1000)
 * 3. ID选择器 (100)
 * 4. 类/属性/伪类 (10)
 * 5. 元素/伪元素 (1)
 * 6. 继承/默认值
 * 
 * ## 3. 布局引擎 (Layout Engine)
 * 
 * ### 布局算法
 * 
 * **常规流 (Normal Flow)**
 * - 块级格式化上下文 (BFC)
 * - 行内格式化上下文 (IFC)
 * - 边距折叠规则
 * 
 * **Flexbox布局**
 * 算法步骤:
 * 1. 确定主轴/交叉轴
 * 2. 计算可用空间
 * 3. 分配flex-grow/flex-shrink
 * 4. 处理alignment
 * 时间复杂度: O(n)
 * 
 * **Grid布局**
 * 算法步骤:
 * 1. 解析grid-template
 * 2. 放置显式grid items
 * 3. 自动放置隐式items
 * 4. 计算轨道尺寸
 * 时间复杂度: O(n²) 最坏情况
 * 
 * ### 布局缓存
 * 使用LayoutTree缓存计算结果
 * 条件: 仅当相关属性变化时重新计算
 * 
 * ## 4. 绘制引擎 (Paint Engine)
 * 
 * ### 绘制记录 (Paint Record)
 * 将元素绘制成绘制指令列表:
 * ```
 * drawRect(x, y, w, h, color)
 * drawText(x, y, text, font)
 * drawImage(x, y, img)
 * ```
 * 
 * ### 绘制优化
 * - 分层绘制: 将页面分割为多个层
 * - 脏矩形: 只重绘变化区域
 * - 绘制合并: 合并相邻的相同绘制操作
 * 
 * ## 5. 合成引擎 (Compositor)
 * 
 * ### 层 (Layer)模型
 * 触发创建新层的CSS属性:
 * - transform3d
 * - opacity (动画时)
 * - will-change
 * - video/canvas
 * 
 * ### 合成流程
 * ```
 * 多个Layer → 光栅化 → 纹理 → GPU合成 → 屏幕
 * ```
 * 
 * GPU合成优势:
 * - 不阻塞主线程
 * - 硬件加速
 * - 仅合成属性动画60fps
 * 
 * @interaction_flow
 * 
 * ## 完整渲染流程
 * 
 * ### 场景1: 修改元素几何属性
 * ```
 * el.style.width = '100px'
 *     ↓
 * [JavaScript] 执行
 *     ↓
 * [Style] 重新计算样式 (如果影响其他元素)
 *     ↓
 * [Layout] 重新计算布局 (Reflow)
 *     ↓  可能触发布局抖动!
 * [Paint] 重新绘制
 *     ↓
 * [Composite] 重新合成
 *     ↓
 * 屏幕更新
 * ```
 * 成本: 高 (完整流程)
 * 
 * ### 场景2: 修改颜色
 * ```
 * el.style.backgroundColor = 'red'
 *     ↓
 * [Style] 样式计算
 *     ↓
 * [Paint] 重绘 (Repaint)
 *     ↓
 * [Composite] 合成
 *     ↓
 * 屏幕更新
 * ```
 * 成本: 中 (跳过Layout)
 * 
 * ### 场景3: 修改transform
 * ```
 * el.style.transform = 'translateX(100px)'
 *     ↓
 * [Composite] 仅合成!
 *     ↓
 * 屏幕更新
 * ```
 * 成本: 低 (GPU处理，不阻塞主线程)
 * 
 * @performance_characteristics
 * 
 * ## 各阶段性能特征
 * 
 * | 阶段 | 时间复杂度 | 阻塞主线程 | GPU参与 | 典型耗时 |
 * |------|-----------|-----------|---------|----------|
 * | JS Parse | O(n) | 是 | 否 | 10-100ms |
 * | JS Compile | O(n) | 是 | 否 | 5-50ms |
 * | JS Execute | 取决于代码 | 是 | 否 | 变量 |
 * | Style | O(n×m) | 是 | 否 | 5-20ms |
 * | Layout | O(n) 最坏O(n²) | 是 | 否 | 10-50ms |
 * | Paint | O(n) | 是 | 部分 | 5-20ms |
 * | Composite | O(n) | 否 | 是 | 2-5ms |
 * 
 * ## 帧预算分析 (60fps)
 * 
 * 每帧可用时间: 1000ms / 60 = 16.67ms
 * 
 * 分配:
 * - JavaScript执行: ≤ 10ms (60%)
 * - Style + Layout + Paint: ≤ 5ms (30%)
 * - Composite + 浏览器开销: ≤ 1.67ms (10%)
 * 
 * @optimization_strategies
 * 
 * ## 策略1: 避免强制同步布局 (Forced Synchronous Layout)
 * 
 * 问题模式 (Layout Thrashing):
 * ```javascript
 * // ❌ 读写交错，强制同步布局
 * for (let i = 0; i < elements.length; i++) {
 *   const height = elements[i].offsetHeight; // 读取 (触发Layout)
 *   elements[i].style.height = height * 2 + 'px'; // 写入 (使Layout缓存失效)
 * }
 * // 循环N次，触发N次Layout!
 * ```
 * 
 * 解决方案 (Fast DOM Pattern):
 * ```javascript
 * // ✅ 批量读取
 * const heights = elements.map(el => el.offsetHeight);
 * 
 * // ✅ 批量写入 (使用requestAnimationFrame进一步批处理)
 * requestAnimationFrame(() => {
 *   elements.forEach((el, i) => {
 *     el.style.height = heights[i] * 2 + 'px';
 *   });
 * });
 * ```
 * 
 * ## 策略2: CSS Containment限制影响范围
 * 
 * ```css
 * .isolated-component {
 *   contain: layout style paint;
 *   // 变更不会传播到外部
 * }
 *
 * contain值:
 * - `layout`: 内部布局不影响外部
 * - `style`: 样式不传播到外部
 * - `paint`: 绘制不溢出边界
 * - `size`: 尺寸不依赖内容
 * - `strict`: 全部开启
 * 
 * ## 策略3: 使用GPU加速属性
 * 
 * 仅触发Composite的属性 (60fps友好):
 * ```css
 * .animated {
 *   transform: translateX(100px);
 *   opacity: 0.5;
 *   will-change: transform;
 * ```
 * 
 * 避免动画触发布局的属性:
 * - ❌ width, height, top, left, margin, padding
 * - ✅ transform, opacity
 * 
 * ## 策略4: 虚拟化长列表
 * 
 * 问题: 10000个DOM元素 → 巨大Layout开销
 * 
 * 解决方案: 只渲染可视区域
 * ```javascript
 * // 视窗内渲染，滚动时动态替换
 * visibleItems = allItems.slice(startIndex, endIndex);
 * ```
 * 
 * ## 策略5: 骨架屏与渐进式渲染
 * 
 * 骨架屏占位 → 关键内容优先 → 非关键内容延迟
 * 
 * @debugging_profiling
 * 
 * ## Chrome DevTools技巧
 * 
 * ### Performance面板
 * 1. 记录性能分析
 * 2. 查看火焰图: 识别长任务
 * 3. 分析各阶段耗时: JS/Style/Layout/Paint/Composite
 * 
 * ### Rendering面板
 * - Paint flashing: 高亮重绘区域
 * - Layout Shift Regions: 显示布局偏移
 * - Layer borders: 显示合成层边界
 * - Frame rendering stats: FPS和GPU内存
 * 
 * ### Layers面板
 * - 查看所有合成层
 * - 分析内存占用
 * - 理解层创建原因
 * 
 * ### Lighthouse
 * - 生成性能报告
 * - 识别优化机会
 * 
 * @real_world_cases
 * 
 * ## 案例1: React Fiber架构 (解决递归渲染阻塞)
 * 
 * 问题: React 15递归渲染，无法中断，长任务阻塞主线程
 * 
 * 解决方案: React Fiber
 * - 将渲染工作拆分为小单元
 * - 使用requestIdleCallback调度
 * - 可暂停/恢复/放弃渲染
 * 
 * 效果: 支持Time Slicing，保持响应性
 * 
 * ## 案例2: Intersection Observer (替代scroll监听)
 * 
 * 问题: scroll事件触发频率高，强制Layout
 * 
 * 解决方案:
 * ```javascript
 * const observer = new IntersectionObserver(callback);
 * observer.observe(target); // 异步通知，不阻塞
 * ```
 * 
 * 效果: 滚动性能提升10倍+
 * 
 * ## 案例3: CSS Grid替代绝对定位
 * 
 * 问题: 绝对定位元素多，布局计算复杂
 * 
 * 解决方案: Grid布局
 * ```css
 * .container {
 *   display: grid;
 *   grid-template-columns: repeat(3, 1fr);
 * }
 * ```
 * 
 * 效果: 布局代码减少50%，性能更稳定
 * 
 * @implementation
 */

// ============================================================================
// 渲染管线性能监控器
// ============================================================================

export interface RenderMetrics {
  timestamp: number;
  phase: 'js' | 'style' | 'layout' | 'paint' | 'composite';
  duration: number;
  elementCount?: number;
}

export class RenderingPipelineMonitor {
  private metrics: RenderMetrics[] = [];
  private isRecording = false;

  startRecording(): void {
    this.isRecording = true;
    this.metrics = [];
  }

  recordMetric(metric: RenderMetrics): void {
    if (this.isRecording) {
      this.metrics.push(metric);
    }
  }

  stopRecording(): RenderMetrics[] {
    this.isRecording = false;
    return [...this.metrics];
  }

  // 分析性能瓶颈
  analyzeBottlenecks(): string[] {
    const phaseDurations = new Map<string, number[]>();
    
    for (const m of this.metrics) {
      const arr = phaseDurations.get(m.phase) || [];
      arr.push(m.duration);
      phaseDurations.set(m.phase, arr);
    }

    const issues: string[] = [];
    
    phaseDurations.forEach((durations, phase) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      
      if (phase === 'layout' && avg > 16) {
        issues.push(`Layout阶段平均${avg.toFixed(2)}ms，可能存在布局抖动`);
      }
      if (phase === 'paint' && max > 50) {
        issues.push(`Paint阶段最大${max.toFixed(2)}ms，考虑使用will-change优化`);
      }
      if (phase === 'js' && avg > 10) {
        issues.push(`JavaScript执行平均${avg.toFixed(2)}ms，考虑任务拆分`);
      }
    });

    return issues;
  }
}

// ============================================================================
// 布局抖动检测器
// ============================================================================

export class LayoutThrashingDetector {
  private readProperties = new Set(['offsetWidth', 'offsetHeight', 'clientWidth', 
    'clientHeight', 'scrollWidth', 'scrollHeight', 'getBoundingClientRect']);
  private writeProperties = new Set(['width', 'height', 'top', 'left', 'margin', 'padding']);

  private lastOperation: 'read' | 'write' | null = null;
  private thrashingCount = 0;

  checkOperation(type: 'read' | 'write', property: string): void {
    if (this.lastOperation === 'read' && type === 'write') {
      // 正常: 读 -> 写
    } else if (this.lastOperation === 'write' && type === 'read') {
      // 问题: 写 -> 读 (强制同步布局)
      this.thrashingCount++;
      console.warn(`[Layout Thrashing] 写入后立即读取: ${property}`);
    }
    
    this.lastOperation = type;
  }

  getThrashingCount(): number {
    return this.thrashingCount;
  }

  reset(): void {
    this.lastOperation = null;
    this.thrashingCount = 0;
  }
}

// ============================================================================
// Fast DOM 批处理工具
// ============================================================================

export class FastDOM {
  private reads: (() => void)[] = [];
  private writes: (() => void)[] = [];
  private scheduled = false;

  // 批量读取布局属性
  measure(fn: () => void): void {
    this.reads.push(fn);
    this.schedule();
  }

  // 批量写入样式
  mutate(fn: () => void): void {
    this.writes.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        this.execute();
      });
    } else {
      // Node.js fallback
      setImmediate(() => {
        this.execute();
      });
    }
  }

  private execute(): void {
    // 先执行所有读操作
    let read;
    while ((read = this.reads.shift())) {
      read();
    }

    // 再执行所有写操作
    let write;
    while ((write = this.writes.shift())) {
      write();
    }

    this.scheduled = false;

    // 如果还有未处理的，继续调度
    if (this.reads.length || this.writes.length) {
      this.schedule();
    }
  }
}

// ============================================================================
// 虚拟滚动计算器
// ============================================================================

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export class VirtualScrollCalculator {
  private config: VirtualScrollConfig;

  constructor(config: VirtualScrollConfig) {
    this.config = {
      overscan: 3,
      ...config
    };
  }

  // 计算可视范围
  calculateRange(scrollTop: number): { start: number; end: number; visible: number } {
    const { itemHeight, containerHeight, totalItems, overscan } = this.config;
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const start = Math.max(0, startIndex - overscan!);
    const end = Math.min(totalItems, startIndex + visibleCount + overscan!);
    
    return { start, end, visible: visibleCount };
  }

  // 计算总高度
  getTotalHeight(): number {
    return this.config.totalItems * this.config.itemHeight;
  }

  // 计算偏移量
  getOffset(index: number): number {
    return index * this.config.itemHeight;
  }
}

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== 浏览器渲染管线模型 ===\n');

  console.log('1. 渲染阶段成本对比');
  console.log('   JS Execute:     阻塞主线程, 可变耗时');
  console.log('   Style:          O(n×m), 阻塞主线程');
  console.log('   Layout:         O(n), 阻塞主线程, 成本最高');
  console.log('   Paint:          O(n), 阻塞主线程');
  console.log('   Composite:      O(n), 不阻塞, GPU加速');

  console.log('\n2. 布局抖动检测');
  const detector = new LayoutThrashingDetector();
  
  // 模拟问题代码
  detector.checkOperation('write', 'width');
  detector.checkOperation('read', 'offsetHeight'); // 触发警告
  detector.checkOperation('write', 'height');
  detector.checkOperation('read', 'offsetWidth');  // 触发警告
  
  console.log(`   检测到 ${detector.getThrashingCount()} 次布局抖动`);

  console.log('\n3. Fast DOM批处理');
  const fastdom = new FastDOM();
  
  // 批量读取
  fastdom.measure(() => {
    console.log('   批量读取布局属性...');
  });
  
  // 批量写入
  fastdom.mutate(() => {
    console.log('   批量写入样式...');
  });

  console.log('\n4. 虚拟滚动计算');
  const virtual = new VirtualScrollCalculator({
    itemHeight: 50,
    containerHeight: 400,
    totalItems: 10000,
    overscan: 3
  });
  
  const range = virtual.calculateRange(1000);
  console.log(`   总项目: 10000, 可视: ${range.visible}个`);
  console.log(`   滚动到1000px: 渲染索引 ${range.start}-${range.end}`);
  console.log(`   总高度: ${virtual.getTotalHeight()}px`);

  console.log('\n5. 性能监控');
  const monitor = new RenderingPipelineMonitor();
  monitor.startRecording();
  
  monitor.recordMetric({ timestamp: Date.now(), phase: 'js', duration: 5 });
  monitor.recordMetric({ timestamp: Date.now(), phase: 'layout', duration: 25 });
  monitor.recordMetric({ timestamp: Date.now(), phase: 'paint', duration: 8 });
  
  const issues = monitor.analyzeBottlenecks();
  console.log('   性能问题:', issues);

  console.log('\n渲染优化要点:');
  console.log('- 读写分离: 批量读取后批量写入');
  console.log('- 使用transform/opacity触发GPU加速');
  console.log('- CSS Containment限制影响范围');
  console.log('- 虚拟化长列表减少DOM数量');
  console.log('- 使用requestAnimationFrame调度动画');
}

// ============================================================================
// 导出 (类已在上面使用 export class 导出)
// ============================================================================

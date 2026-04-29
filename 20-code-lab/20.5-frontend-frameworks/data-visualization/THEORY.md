# 数据可视化理论：从图表到叙事

> **目标读者**：前端工程师、数据分析师、关注用户理解的设计者
> **关联文档**：``30-knowledge-base/30.2-categories/DATA_VISUALIZATION.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. 可视化的核心价值

### 1.1 为什么可视化

人类大脑处理视觉信息的速度比文本快 **60,000 倍**。

| 数据量 | 文本表格 | 可视化 |
|--------|---------|--------|
| 10 行 | 可读 | 可选 |
| 100 行 | 困难 | 推荐 |
| 10,000 行 | 不可能 | 必需 |

### 1.2 可视化层次

```
L1: 原始数据 -> 清洗整理
L2: 统计数据 -> 聚合摘要
L3: 视觉编码 -> 位置、颜色、大小
L4: 交互探索 -> 筛选、缩放、关联
L5: 叙事设计 -> 故事线、洞察传达
```

---

## 2. 视觉编码原理

### 2.1 视觉通道优先级

| 通道 | 准确性 | 适用 |
|------|--------|------|
| **位置** | 最高 | 散点图、柱状图 |
| **长度** | 高 | 柱状图、条形图 |
| **角度** | 中 | 饼图（慎用） |
| **面积** | 中 | 气泡图 |
| **颜色亮度** | 中 | 热力图 |
| **颜色色相** | 低 | 分类区分 |

**原则**：最重要的数据映射到最准确的视觉通道。

### 2.2 颜色设计

```
分类数据 -> 色相区分（最多 8-10 色）
顺序数据 -> 亮度渐变（单色调）
发散数据 -> 双色渐变（红-蓝）
```

**工具**：

- [ColorBrewer](https://colorbrewer2.org/) -- 科学配色
- [Coolors](https://coolors.co/) -- 快速生成

---

## 3. 图表选型决策树

```
你想展示什么?
├── 比较
│   ├── 分类对比 -> 柱状图 / 条形图
│   └── 时间趋势 -> 折线图 / 面积图
├── 分布
│   ├── 单变量 -> 直方图 / 箱线图
│   └── 多变量 -> 散点图矩阵
├── 构成
│   ├── 静态比例 -> 饼图（<=5项）/ 堆叠柱状图
│   └── 动态变化 -> 堆叠面积图 / 桑基图
├── 关系
│   ├── 两变量 -> 散点图 + 回归线
│   └── 网络 -> 力导向图 / 弦图
└── 地理
    └── 地图 -> 等值线图 / 气泡地图
```

---

## 4. 前端可视化库选型

| 库 | 抽象层级 | 学习曲线 | 最佳场景 |
|---|---------|---------|---------|
| **D3.js** | 底层 | 高 | 自定义复杂交互 |
| **ECharts** | 中层 | 中 | 企业级仪表盘 |
| **Chart.js** | 高层 | 低 | 快速简单图表 |
| **Observable Plot** | 声明式 | 中 | 探索性分析 |
| **Three.js** | 3D | 高 | 3D 可视化 |
| **Unovis** | 现代 | 中 | React/Vue 集成 |

---

## 5. 性能优化

### 5.1 大数据集渲染

| 数据量 | 策略 |
|--------|------|
| < 1K | SVG，直接渲染 |
| 1K-10K | Canvas，减少 DOM |
| 10K-100K | WebGL / GPU 加速 |
| > 100K | 数据聚合 + 分层采样 |

### 5.2 响应式设计

```typescript
// 监听容器尺寸变化
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    chart.resize(entry.contentRect.width, entry.contentRect.height);
  }
});
resizeObserver.observe(container);
```

---

## 6. 反模式

### 反模式 1：3D 饼图

x 3D 效果扭曲数据感知。
v 使用柱状图或水平条形图。

### 反模式 2：过度装饰

x 阴影、渐变、动画干扰数据阅读。
v 遵循"数据墨水比"原则：最大化数据墨水，最小化装饰。

### 反模式 3：双 Y 轴

x 两个 Y 轴容易误导比较。
v 使用分面图或标准化数据。

---

## 7. 代码示例：D3.js 比例尺与坐标映射

```typescript
// scales.ts -- D3 比例尺将数据域映射到视觉域
import { scaleLinear, scaleBand, scaleTime, extent } from 'd3';

interface DataPoint {
  date: Date;
  value: number;
  category: string;
}

function createScales(data: DataPoint[], width: number, height: number) {
  // 线性比例尺：数值 -> 像素高度
  const yScale = scaleLinear()
    .domain([0, Math.max(...data.map(d => d.value))])
    .range([height, 0]) // SVG 坐标系 Y 轴向下
    .nice();

  // 带状比例尺：分类 -> 像素宽度
  const xScale = scaleBand<string>()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);

  // 时间比例尺：日期 -> 像素宽度
  const timeScale = scaleTime()
    .domain(extent(data, d => d.date) as [Date, Date])
    .range([0, width]);

  return { xScale, yScale, timeScale };
}
```

## 代码示例：WebGL 点云渲染（大数据集）

```typescript
// canvas-renderer.ts -- 用 WebGL 渲染 100K+ 散点
function createScatterPlotGL(
  canvas: HTMLCanvasElement,
  points: Array<{ x: number; y: number; color: [number, number, number] }>
) {
  const gl = canvas.getContext('webgl')!;
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 顶点着色器：将数据坐标映射到裁剪空间
  const vsSource = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      gl_PointSize = 2.0;
      v_color = a_color;
    }
  `;

  // 片元着色器
  const fsSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
      gl_FragColor = vec4(v_color, 1.0);
    }
  `;

  // 编译、链接、绑定数据...（简化）
  // 实际生产建议使用 regl 或 Three.js Points 简化 WebGL 操作
}
```

## 代码示例：无障碍图表模式

```typescript
// chart-accessibility.ts -- 为屏幕阅读器提供语义化数据表
function createAccessibleChart(container: HTMLElement, data: Array<{ label: string; value: number }>) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', 'chart-title chart-desc');

  // 图表标题与描述
  const title = document.createElement('title');
  title.id = 'chart-title';
  title.textContent = '月度销售额';
  svg.appendChild(title);

  const desc = document.createElement('desc');
  desc.id = 'chart-desc';
  desc.textContent = `柱状图显示 ${data.length} 个月的销售数据，最高值为 ${Math.max(...data.map(d => d.value))}`;
  svg.appendChild(desc);

  // 每个柱附加 ARIA 标签
  data.forEach((d, i) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('tabindex', '0');
    rect.setAttribute('role', 'graphics-symbol');
    rect.setAttribute('aria-label', `${d.label}: ${d.value} 元`);
    svg.appendChild(rect);
  });

  // 同步生成屏幕阅读器专用的数据表格
  const table = document.createElement('table');
  table.style.position = 'absolute';
  table.style.left = '-9999px';
  table.innerHTML = `
    <caption>月度销售额数据表</caption>
    <thead><tr><th>月份</th><th>销售额</th></tr></thead>
    <tbody>
      ${data.map(d => `<tr><td>${d.label}</td><td>${d.value}</td></tr>`).join('')}
    </tbody>
  `;
  container.appendChild(svg);
  container.appendChild(table);
}
```

## 代码示例：数据分箱（Data Binning）聚合

```typescript
// data-binning.ts -- 将大数据集降采样为可渲染的柱状分布
function binData<T>(
  data: T[],
  accessor: (d: T) => number,
  binCount: number
): Array<{ x0: number; x1: number; count: number; items: T[] }> {
  const values = data.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    x0: min + i * step,
    x1: min + (i + 1) * step,
    count: 0,
    items: [] as T[],
  }));

  for (const item of data) {
    const v = accessor(item);
    const index = Math.min(Math.floor((v - min) / step), binCount - 1);
    bins[index].count++;
    bins[index].items.push(item);
  }

  return bins;
}

// 使用示例：将 500K 条交易记录分箱为 50 个区间
const bins = binData(transactions, t => t.amount, 50);
renderHistogram(bins); // 只渲染 50 个柱子
```

---

## 7. 总结

数据可视化的目标是**洞察，不是装饰**。

**核心原则**：

1. 了解你的受众，选择合适的抽象层级
2. 减少认知负荷，让数据自己说话
3. 交互是探索的工具，不是炫技的手段

---

## 参考资源

- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [The Visual Display of Quantitative Information](https://www.edwardtufte.com/tufte/books_vdqi) -- Tufte 经典
- [Data Visualization Society](https://www.datavisualizationsociety.com/)
- [D3.js API Reference](https://d3js.org/d3-shape) -- D3 官方 API 参考
- [ECharts Documentation](https://echarts.apache.org/en/option.html) -- ECharts 配置项手册
- [Observable Plot](https://observablehq.com/plot/) -- 声明式数据可视化
- [Vega-Lite](https://vega.github.io/vega-lite/) -- 基于 JSON 的可视化语法
- [WCAG 2.2 -- Non-Text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content) -- 无障碍图表规范
- [Canvas API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) -- 2D 画布渲染权威文档
- [WebGL Fundamentals](https://webglfundamentals.org/) -- WebGL 基础教程
- [ColorBrewer 2.0](https://colorbrewer2.org/) -- 科学配色工具
- [Data-Ink Ratio (Tufte)](https://www.edwardtufte.com/tufte/books_vdqi) -- 数据墨水比经典理论

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `bar-chart-svg.ts`
- `canvas-renderer.ts`
- `chart-animation.ts`
- `chart-architecture.ts`
- `data-binning.ts`
- `index.ts`
- `line-chart-path.ts`
- `pie-chart-angles.ts`
- `scales.ts`

> **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 理论深化更新：2026-04-29

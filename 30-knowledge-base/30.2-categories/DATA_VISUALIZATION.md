# 数据可视化 (Data Visualization)

> JavaScript 数据可视化库选型矩阵：从 D3 到低代码图表方案的决策框架。

---

## 核心概念

数据可视化库按**抽象层级**分类：

| 层级 | 特点 | 代表库 |
|------|------|--------|
| **底层渲染** | 直接操作 SVG/Canvas/WebGL | D3.js, Three.js, PixiJS |
| **中级封装** | 声明式配置，灵活度高 | ECharts, Vega-Lite, Observable Plot |
| **高层组件** | 预置图表类型，快速集成 | Chart.js, Recharts, Tremor |
| **BI/低代码** | 拖拽配置，非开发导向 | Apache Superset, Metabase, Grafana |

---

## 主流方案对比矩阵

| 维度 | D3.js | ECharts | Observable Plot | Chart.js | Recharts |
|------|-------|---------|-----------------|----------|----------|
| **包体积** | ~80KB（核心） | ~180KB | ~40KB | ~60KB | ~70KB |
| **渲染引擎** | SVG / Canvas / WebGL | Canvas / SVG | SVG | Canvas | SVG |
| **学习曲线** | 高 | 中 | 低 | 低 | 低 |
| **交互能力** | 无限（底层控制） | 丰富（内置） | 中等 | 基础 | 基础 |
| **动画** | 手动实现 | 内置丰富 | 内置 | 内置 | 内置 |
| **React 集成** | 需封装 | 需封装 | 需封装 | 需封装 | ✅ 原生 |
| **地图/3D** | ✅ D3-geo / Three.js | ✅ 内置地图 | ❌ | ❌ | ❌ |
| **移动端** | 需优化 | ✅ 响应式 | ✅ | ✅ | ✅ |
| **维护状态** | ✅ 活跃 | ✅ 活跃（Apache） | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |

---

## 选型决策树

```
可视化需求？
├── 自定义交互/复杂数据图 → D3.js（或 D3 + React 封装）
├── 企业级 Dashboard → ECharts（性能 + 功能平衡）
├── 统计图表/探索性分析 → Observable Plot（语法简洁）
├── 简单嵌入式图表 → Chart.js（轻量，快速集成）
├── React 项目 + 标准图表 → Recharts（声明式，React 原生）
└── 实时数据流 → ECharts / Grafana（WebSocket 驱动）
```

---

## 2026 生态动态

### Observable Plot 崛起

由 D3 作者 Mike Bostock 主导，语法极简：

```javascript
import * as Plot from '@observablehq/plot'

Plot.plot({
  marks: [
    Plot.barY(data, { x: 'category', y: 'value', fill: 'steelblue' })
  ]
})
```

- **优势**：学习成本远低于 D3，输出质量高
- **局限**：高度定制化仍需 D3

**进阶示例：带回归线的散点图**

```javascript
import * as Plot from '@observablehq/plot';

Plot.plot({
  marginLeft: 50,
  grid: true,
  x: { label: 'GDP per capita (log)' },
  y: { label: 'Life expectancy' },
  color: { legend: true },
  marks: [
    Plot.linearRegressionY(data, { x: 'gdp', y: 'lifeExpectancy', stroke: 'continent' }),
    Plot.dot(data, { x: 'gdp', y: 'lifeExpectancy', fill: 'continent', r: 'population' }),
    Plot.text(data, { x: 'gdp', y: 'lifeExpectancy', text: 'country', dx: 6 }),
  ],
});
```

### Tremor（React + Tailwind）

- **定位**：Dashboard 组件库，基于 Tailwind CSS
- **特点**：预置 KPI Card、AreaChart、DonutChart 等组件
- **适用**：内部数据面板，快速搭建

**Tremor 快速示例**：

```tsx
import { Card, AreaChart, Title } from '@tremor/react';

const chartdata = [
  { date: 'Jan 23', value: 2890 },
  { date: 'Feb 23', value: 2756 },
  { date: 'Mar 23', value: 3322 },
];

export default function DashboardCard() {
  return (
    <Card>
      <Title>月度营收趋势</Title>
      <AreaChart
        className="h-72 mt-4"
        data={chartdata}
        index="date"
        categories={['value']}
        colors={['indigo']}
        valueFormatter={(number) => `$${ Intl.NumberFormat('us').format(number).toString() }`}
      />
    </Card>
  );
}
```

### WebGPU 可视化

- **Three.js WebGPU 渲染器**：2026 年进入稳定版
- **适用场景**：百万级数据点渲染、3D 科学可视化

**Three.js WebGPU 示例**：

```javascript
import * as THREE from 'three/webgpu';
import { wgslFn, vec3, float } from 'three/tsl';

const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();

// TSL (Three Shading Language) 节点材质
const material = new THREE.MeshBasicNodeMaterial({
  colorNode: wgslFn(`
    fn main(@location(0) uv: vec2<f32>) -> vec4<f32> {
      return vec4<f32>(uv.x, uv.y, 0.5, 1.0);
    }
  `)(),
});
```

---

## 性能考量

| 数据量级 | 推荐方案 | 说明 |
|---------|---------|------|
| < 1,000 点 | 任意库 | 无性能压力 |
| 1K – 100K | ECharts Canvas / Observable Plot | Canvas 渲染优势 |
| 100K – 1M | ECharts Large Mode / WebGL | 数据降采样、分层渲染 |
| > 1M | WebGL（Three.js / deck.gl） | GPU 并行渲染 |

**大数据集 ECharts 优化配置**：

```javascript
const option = {
  series: [{
    type: 'scatter',
    data: largeDataset, // 100K+ 点
    large: true,        // 启用大规模散点模式
    largeThreshold: 2000,
    progressive: 5000,  // 渐进式渲染
    progressiveThreshold: 10000,
    itemStyle: { opacity: 0.4 },
  }],
};
```

---

## 最佳实践

1. **响应式设计**：监听容器尺寸变化，自动重绘
2. **懒加载**：图表不在视口内时不初始化
3. **数据转换**：在服务端完成聚合，减少客户端计算
4. **无障碍**：为图表添加 `aria-label`，提供表格替代数据
5. **主题一致**：使用设计系统颜色令牌，避免硬编码色值

**响应式图表 Hook（React）**：

```typescript
import { useEffect, useRef, useState } from 'react';

export function useChartResize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
```

---

## 参考资源

- [D3.js Documentation](https://d3js.org/)
- [ECharts Documentation](https://echarts.apache.org/)
- [Observable Plot](https://observablehq.com/plot/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Recharts Documentation](https://recharts.org/)
- [Three.js WebGPU Guide](https://threejs.org/docs/index.html#manual/en/introduction/WebGPU)
- [Tremor Components](https://www.tremor.so/)
- [Vega-Lite Documentation](https://vega.github.io/vega-lite/)
- [deck.gl Documentation](https://deck.gl/)
- [Mike Bostock — D3 作者博客](https://observablehq.com/@mbostock)

## 权威外部链接

| 资源 | 链接 | 说明 |
|------|------|------|
| D3 官方 API 参考 | [d3js.org/d3-selection](https://d3js.org/d3-selection) | 底层 SVG/Canvas 操作权威文档 |
| ECharts 示例库 | [echarts.apache.org/examples](https://echarts.apache.org/examples/) | 企业级图表配置参考 |
| Observable Plot API | [observablehq.com/plot/features](https://observablehq.com/plot/features/) | 声明式统计图形 |
| WebGPU 规范 | [gpuweb.github.io/gpuweb](https://gpuweb.github.io/gpuweb/) | W3C GPU for the Web 标准 |
| Accessible Dataviz (W3C) | [w3.org/WAI/tutorials/images/complex](https://www.w3.org/WAI/tutorials/images/complex/) | 复杂图表无障碍指南 |
| Pantos 研究 — 感知与认知 | [research.tableau.com/sites/default/files](https://research.tableau.com/sites/default/files/pantos-2020-perception.pdf) | 可视化感知研究论文 |
| Google Material Design 数据可视化 | [m3.material.io/styles/illustration/data-visualization](https://m3.material.io/styles/illustration/data-visualization/overview) | 设计系统配色与规范 |
| Deck.gl 性能优化 | [deck.gl/docs/developer-guide/performance](https://deck.gl/docs/developer-guide/performance) | 大规模地理数据渲染 |

---

## 关联文档

- `30-knowledge-base/30.2-categories/18-performance.md`
- `20-code-lab/20.5-frontend-frameworks/data-visualization/`

---

*最后更新: 2026-04-29*

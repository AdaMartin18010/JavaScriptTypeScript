---
dimension: 应用领域
application-domain: 游戏与沉浸式图形 / 数据可视化
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 数据可视化 — SVG/Canvas 渲染、图表架构与交互式图形
- **模块编号**: 58-data-visualization

## 边界说明

本模块聚焦数据可视化的应用开发模式，包括：

- SVG/Canvas 图表渲染与动画
- 数据分箱、比例尺与交互
- 响应式图表与性能优化

底层 3D 渲染引擎（Three.js/Babylon.js）的分类选型不属于本模块范围（请参见 `30-knowledge-base/30.2-categories/04-data-visualization.md`）。

## 子模块目录

| 子模块 | 说明 | 关键文件 |
|---|---|---|
| canvas | 2D Canvas API、离屏渲染、像素操作与性能优化 | `canvas/README.md` |
| svg | SVG 元素、路径、滤镜、响应式缩放与可访问性 | `svg/README.md` |
| d3 | D3.js 数据绑定、比例尺、选择集与过渡动画 | `d3/README.md` |
| chart-libraries | 高层图表库：Chart.js、ECharts、Observable Plot 集成 | `chart-libraries/README.md` |
| webgl | WebGL 基础、着色器、纹理与高性能渲染管线 | `webgl/README.md` |

## 核心代码示例

### Canvas 绘制动态柱状图

```js
const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');
const data = [120, 250, 60, 300, 180];
const barWidth = 40;
const gap = 20;

ctx.clearRect(0, 0, canvas.width, canvas.height);
data.forEach((value, i) => {
  const x = i * (barWidth + gap) + gap;
  const height = value;
  const y = canvas.height - height;
  ctx.fillStyle = 'steelblue';
  ctx.fillRect(x, y, barWidth, height);
  ctx.fillStyle = '#333';
  ctx.fillText(value, x + 10, y - 5);
});
```

### D3.js 比例尺与坐标轴

```js
import * as d3 from 'd3';

const data = [120, 250, 60, 300, 180];
const width = 500, height = 300;

const x = d3.scaleBand()
  .domain(data.map((_, i) => i))
  .range([0, width])
  .padding(0.2);

const y = d3.scaleLinear()
  .domain([0, d3.max(data)])
  .nice()
  .range([height, 0]);

const svg = d3.select('svg');
svg.selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', (_, i) => x(i))
  .attr('y', d => y(d))
  .attr('width', x.bandwidth())
  .attr('height', d => height - y(d))
  .attr('fill', 'steelblue');

svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
svg.append('g').call(d3.axisLeft(y));
```

### Chart.js 快速配置

```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 3000, 5000, 2000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.3,
    }],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  },
});
```

### ECharts 响应式仪表盘

```typescript
import * as echarts from 'echarts';

const chart = echarts.init(document.getElementById('gauge')!);
chart.setOption({
  series: [{
    type: 'gauge',
    progress: { show: true, width: 18 },
    detail: { valueAnimation: true, formatter: '{value}%' },
    data: [{ value: 78, name: 'CPU' }],
  }],
});

window.addEventListener('resize', () => chart.resize());
```

### WebGL 离屏渲染

```typescript
const offscreen = new OffscreenCanvas(256, 256);
const gl = offscreen.getContext('webgl')!;

// 编译着色器
function compileShader(type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader error');
  }
  return shader;
}

const vs = compileShader(gl.VERTEX_SHADER, `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`);
const fs = compileShader(gl.FRAGMENT_SHADER, `
  precision mediump float;
  void main() { gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0); }
`);

const program = gl.createProgram()!;
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);
```

## 代码示例：Canvas 离屏渲染与性能优化

```typescript
// offscreen-canvas-performance.ts — 大批量粒子动画

const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 使用离屏 Canvas 缓存静态背景
const offscreen = document.createElement('canvas');
offscreen.width = canvas.width;
offscreen.height = canvas.height;
const offCtx = offscreen.getContext('2d')!;

// 预渲染网格背景
offCtx.strokeStyle = '#e0e0e0';
for (let x = 0; x < offscreen.width; x += 20) {
  offCtx.beginPath();
  offCtx.moveTo(x, 0);
  offCtx.lineTo(x, offscreen.height);
  offCtx.stroke();
}
for (let y = 0; y < offscreen.height; y += 20) {
  offCtx.beginPath();
  offCtx.moveTo(0, y);
  offCtx.lineTo(offscreen.width, y);
  offCtx.stroke();
}

interface Particle { x: number; y: number; vx: number; vy: number; radius: number; }
const particles: Particle[] = Array.from({ length: 500 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  radius: Math.random() * 3 + 1,
}));

function animate() {
  // 直接 blit 预渲染背景，而非每帧重绘
  ctx.drawImage(offscreen, 0, 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'steelblue';
    ctx.fill();
  }
  requestAnimationFrame(animate);
}
animate();
```

## 代码示例：SVG 动态路径与数据驱动动画

```typescript
// svg-path-animation.ts — 使用 D3 过渡绘制实时折线

import * as d3 from 'd3';

interface DataPoint { time: Date; value: number; }

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const line = d3.line<DataPoint>()
  .x(d => x(d.time))
  .y(d => y(d.value))
  .curve(d3.curveMonotoneX);

const path = svg.append('path')
  .attr('fill', 'none')
  .attr('stroke', 'steelblue')
  .attr('stroke-width', 2);

function update(data: DataPoint[]) {
  x.domain(d3.extent(data, d => d.time) as [Date, Date]);
  y.domain([0, d3.max(data, d => d.value)! * 1.1]);

  path.datum(data)
    .transition()
    .duration(500)
    .attr('d', line);
}

// 模拟实时数据流
let data: DataPoint[] = [];
setInterval(() => {
  data.push({ time: new Date(), value: Math.random() * 100 });
  if (data.length > 50) data.shift();
  update(data);
}, 1000);
```

## 代码示例：Observable Plot 声明式图表

```typescript
// observable-plot-declarative.ts — 极简声明式 API

import * as Plot from '@observablehq/plot';

const data = [
  { month: 'Jan', revenue: 120, cost: 80 },
  { month: 'Feb', revenue: 200, cost: 120 },
  { month: 'Mar', revenue: 150, cost: 90 },
  { month: 'Apr', revenue: 300, cost: 180 },
];

const plot = Plot.plot({
  width: 600,
  height: 400,
  color: { legend: true },
  marks: [
    Plot.barY(data, { x: 'month', y: 'revenue', fill: 'revenue', tip: true }),
    Plot.line(data, { x: 'month', y: 'cost', stroke: 'red', strokeWidth: 2 }),
    Plot.dot(data, { x: 'month', y: 'cost', fill: 'red', r: 4 }),
  ],
});

document.getElementById('plot-container')!.appendChild(plot);
```

## 权威外部链接

- [MDN — Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN — SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [MDN — WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [D3.js 官方文档](https://d3js.org/)
- [Chart.js 文档](https://www.chartjs.org/docs/latest/)
- [Apache ECharts 文档](https://echarts.apache.org/en/option.html)
- [Three.js 文档](https://threejs.org/docs/)
- [Observable Plot 文档](https://observablehq.com/plot/)
- [SVG Path Reference — MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [W3C — SVG 2 Specification](https://www.w3.org/TR/SVG2/)
- [Khronos Group — WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/2.0/)
- [MDN — OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [MDN — CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [D3.js Selections Guide](https://d3js.org/d3-selection)
- [D3.js Scales Guide](https://d3js.org/d3-scale)
- [Observable Plot API Reference](https://observablehq.com/plot/features/plots)
- [ECharts Examples Gallery](https://echarts.apache.org/examples/en/index.html)
- [Web.dev — Canvas Performance](https://web.dev/articles/canvas-performance)

## 关联模块

- `84-webxr` — WebXR 沉浸式体验
- `37-pwa` — PWA（可视化仪表盘常作为 PWA）
- `30-knowledge-base/30.2-categories/04-data-visualization.md` — 可视化库分类
- `30-knowledge-base/platforms/DATA_VISUALIZATION.md` — 可视化完整指南
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

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

## 关联模块

- `84-webxr` — WebXR 沉浸式体验
- `37-pwa` — PWA（可视化仪表盘常作为 PWA）
- `30-knowledge-base/30.2-categories/04-data-visualization.md` — 可视化库分类
- `30-knowledge-base/platforms/DATA_VISUALIZATION.md` — 可视化完整指南
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

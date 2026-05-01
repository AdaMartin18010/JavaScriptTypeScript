# D3.js TypeScript 可视化示例

一个完整的 D3.js TypeScript 示例集合，展示了如何使用现代 TypeScript 开发交互式数据可视化。

## 特性

- **完整的类型支持** - 基于 TypeScript 和 @types/d3 的类型安全代码
- **模块化设计** - 每个图表类型独立封装，易于复用和扩展
- **丰富的交互** - 支持悬停、点击、缩放、拖拽等交互
- **响应式设计** - SVG 自适应容器大小
- **动画效果** - 流畅的入场和更新动画
- **详细注释** - 代码中包含完整的中文注释

## 图表类型

| 图表 | 文件 | 特性 |
|------|------|------|
| 柱状图 | `bar-chart.ts` | 渐变填充、提示框、交错动画、旋转标签 |
| 折线图 | `line-chart.ts` | 平滑曲线、区域填充、追踪线、时间轴 |
| 饼图/环形图 | `pie-chart.ts` | 扇形分离、百分比标签、中心文字、图例交互 |
| 力导向图 | `force-graph.ts` | 物理模拟、节点拖拽、缩放平移、连接高亮 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 编译 TypeScript

```bash
npm run build
```

### 启动开发服务器

```bash
npm start
```

然后访问 http://localhost:8080 查看示例。

## 使用示例

### 柱状图

```typescript
import { createBarChart, type BarChartData } from './src/index';

const data: BarChartData[] = [
  { label: '一月', value: 65, color: '#3498db' },
  { label: '二月', value: 80, color: '#e74c3c' },
  { label: '三月', value: 45 },
  { label: '四月', value: 90 },
  { label: '五月', value: 55 },
];

createBarChart('#bar-chart-container', data, {
  width: 600,
  height: 400,
  showLabels: true,
  showGrid: true,
  animationDuration: 750,
});
```

### 折线图

```typescript
import { createLineChart, type LineChartSeries } from './src/index';

const data: LineChartSeries[] = [
  {
    name: '销售额',
    data: [
      { x: new Date('2024-01'), y: 120 },
      { x: new Date('2024-02'), y: 150 },
      { x: new Date('2024-03'), y: 180 },
      { x: new Date('2024-04'), y: 140 },
    ],
    color: '#e74c3c',
  },
  {
    name: '利润',
    data: [
      { x: new Date('2024-01'), y: 40 },
      { x: new Date('2024-02'), y: 55 },
      { x: new Date('2024-03'), y: 65 },
      { x: new Date('2024-04'), y: 50 },
    ],
    color: '#27ae60',
  },
];

createLineChart('#line-chart-container', data, {
  width: 800,
  height: 400,
  curve: true,        // 平滑曲线
  showArea: true,     // 区域填充
  showDots: true,     // 显示数据点
  enableZoom: true,   // 启用缩放
});
```

### 饼图/环形图

```typescript
import { createPieChart, type PieChartData } from './src/index';

const data: PieChartData[] = [
  { label: '产品A', value: 30 },
  { label: '产品B', value: 50 },
  { label: '产品C', value: 20 },
  { label: '产品D', value: 40 },
];

// 饼图
createPieChart('#pie-chart-container', data, {
  donut: false,
  showLegend: true,
  showPercentages: true,
});

// 环形图
createPieChart('#donut-chart-container', data, {
  donut: true,
  innerRadiusRatio: 0.6,
  showLegend: true,
});
```

### 力导向图

```typescript
import { createForceGraph, generateSampleData, type ForceGraphData } from './src/index';

// 使用示例数据
const data: ForceGraphData = generateSampleData();

// 或自定义数据
const customData: ForceGraphData = {
  nodes: [
    { id: '1', name: '节点1', group: 1, size: 25 },
    { id: '2', name: '节点2', group: 2, size: 20 },
    { id: '3', name: '节点3', group: 1, size: 20 },
  ],
  links: [
    { source: '1', target: '2', value: 2 },
    { source: '2', target: '3', value: 1 },
  ],
};

const { svg, simulation } = createForceGraph('#force-graph-container', data, {
  width: 800,
  height: 600,
  enableZoom: true,
  enableSimulation: true,
  showLabels: true,
  onNodeClick: (node) => console.log('点击节点:', node),
});

// 控制模拟
simulation.stop();      // 暂停
simulation.restart();   // 继续
```

## 项目结构

```
01-d3-visualization/
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── README.md             # 说明文档
├── index.html            # 演示页面（可选）
└── src/
    ├── index.ts          # 统一导出
    ├── bar-chart.ts      # 柱状图实现
    ├── line-chart.ts     # 折线图实现
    ├── pie-chart.ts      # 饼图实现
    └── force-graph.ts    # 力导向图实现
```

## API 参考

### 柱状图 (Bar Chart)

#### `createBarChart(container, data, options)`

创建柱状图。

**参数:**
- `container: string` - CSS 选择器
- `data: BarChartData[]` - 数据数组
- `options: BarChartOptions` - 配置选项

**配置选项:**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 600 | 图表宽度 |
| height | number | 400 | 图表高度 |
| margin | object | {top:40,right:30,bottom:60,left:60} | 边距 |
| showLabels | boolean | true | 显示数值标签 |
| showGrid | boolean | true | 显示网格线 |
| animationDuration | number | 750 | 动画持续时间(ms) |

### 折线图 (Line Chart)

#### `createLineChart(container, data, options)`

创建折线图。

**配置选项:**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| curve | boolean | true | 平滑曲线 |
| showArea | boolean | false | 区域填充 |
| showDots | boolean | true | 显示数据点 |
| enableZoom | boolean | false | 启用缩放 |

### 饼图 (Pie Chart)

#### `createPieChart(container, data, options)`

创建饼图或环形图。

**配置选项:**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| donut | boolean | false | 是否为环形图 |
| innerRadiusRatio | number | 0.5 | 环形图内半径比例 |
| showLegend | boolean | true | 显示图例 |
| showPercentages | boolean | true | 显示百分比 |

### 力导向图 (Force Graph)

#### `createForceGraph(container, data, options)`

创建力导向图。

**配置选项:**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableZoom | boolean | true | 启用缩放 |
| enableSimulation | boolean | true | 启用物理模拟 |
| linkDistance | number | 100 | 连接距离 |
| chargeStrength | number | -300 | 电荷力强度 |

## 工具函数

```typescript
import { utils, COLOR_THEMES } from './src/index';

// 格式化数字
utils.formatNumber(1234567);  // "1,234,567"

// 格式化百分比
utils.formatPercent(30, 100);  // "30.0%"

// 生成随机颜色
utils.randomColor();  // "#a3f7c2"

// 生成随机数据
utils.generateRandomData(5, 0, 100);

// 使用主题配色
const warmColors = COLOR_THEMES.warm;
```

## 最佳实践

### 1. 类型安全

始终使用 TypeScript 类型：

```typescript
import type { BarChartData, BarChartOptions } from './src/index';

const data: BarChartData[] = [...];
const options: BarChartOptions = { ... };
```

### 2. 响应式容器

确保容器有明确的尺寸：

```html
<div id="chart" style="width: 100%; height: 400px;"></div>
```

### 3. 销毁图表

在组件卸载时清理：

```typescript
import { destroyBarChart } from './src/index';

// React 示例
useEffect(() => {
  createBarChart('#chart', data);
  return () => destroyBarChart('#chart');
}, []);
```

### 4. 更新数据

```typescript
import { updateBarChart } from './src/index';

// 使用 update 函数更新数据
updateBarChart('#chart', newData, options);
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

需要支持 SVG 和 ES6+ 的现代浏览器。

## 许可证

MIT

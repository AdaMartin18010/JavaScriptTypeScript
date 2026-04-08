# 数据可视化完整指南

> 本文档涵盖从理论基础到高级实践的完整数据可视化知识体系，涵盖 D3.js、Chart.js、地图可视化、3D 可视化等多个技术栈。

---

## 目录

- [数据可视化完整指南](#数据可视化完整指南)
  - [目录](#目录)
  - [1. 数据可视化理论基础](#1-数据可视化理论基础)
    - [1.1 概念解释](#11-概念解释)
      - [视觉编码通道](#视觉编码通道)
      - [图表类型选择决策树](#图表类型选择决策树)
    - [1.2 代码示例：基础 SVG 可视化](#12-代码示例基础-svg-可视化)
    - [1.3 性能考虑](#13-性能考虑)
    - [1.4 最佳实践](#14-最佳实践)
  - [2. D3.js 原理和模式](#2-d3js-原理和模式)
    - [2.1 概念解释](#21-概念解释)
      - [数据绑定模式](#数据绑定模式)
      - [核心模块](#核心模块)
    - [2.2 代码示例](#22-代码示例)
    - [2.3 性能考虑](#23-性能考虑)
    - [2.4 最佳实践](#24-最佳实践)
  - [3. Chart.js 使用指南](#3-chartjs-使用指南)
    - [3.1 概念解释](#31-概念解释)
      - [架构图](#架构图)
    - [3.2 代码示例](#32-代码示例)
    - [3.3 性能考虑](#33-性能考虑)
    - [3.4 最佳实践](#34-最佳实践)
  - [4. 响应式图表设计](#4-响应式图表设计)
    - [4.1 概念解释](#41-概念解释)
      - [断点策略](#断点策略)
    - [4.2 代码示例](#42-代码示例)
    - [4.3 性能考虑](#43-性能考虑)
    - [4.4 最佳实践](#44-最佳实践)
  - [5. 大数据量可视化优化](#5-大数据量可视化优化)
    - [5.1 概念解释](#51-概念解释)
      - [优化策略层级](#优化策略层级)
    - [5.2 代码示例](#52-代码示例)
    - [5.3 性能考虑](#53-性能考虑)
    - [5.4 最佳实践](#54-最佳实践)
  - [6. 交互式可视化](#6-交互式可视化)
    - [6.1 概念解释](#61-概念解释)
      - [交互类型](#交互类型)
    - [6.2 代码示例](#62-代码示例)
    - [6.3 性能考虑](#63-性能考虑)
    - [6.4 最佳实践](#64-最佳实践)
  - [7. 地图可视化（Leaflet/Mapbox）](#7-地图可视化leafletmapbox)
    - [7.1 概念解释](#71-概念解释)
      - [地图投影类型](#地图投影类型)
      - [地图可视化类型](#地图可视化类型)
    - [7.2 代码示例](#72-代码示例)
    - [7.3 性能考虑](#73-性能考虑)
    - [7.4 最佳实践](#74-最佳实践)
  - [8. 3D可视化（Three.js基础）](#8-3d可视化threejs基础)
    - [8.1 概念解释](#81-概念解释)
      - [核心概念](#核心概念)
    - [8.2 代码示例](#82-代码示例)
    - [8.3 性能考虑](#83-性能考虑)
    - [8.4 最佳实践](#84-最佳实践)
  - [9. 实时数据可视化](#9-实时数据可视化)
    - [9.1 概念解释](#91-概念解释)
      - [架构模式](#架构模式)
    - [9.2 代码示例](#92-代码示例)
    - [9.3 性能考虑](#93-性能考虑)
    - [9.4 最佳实践](#94-最佳实践)
  - [10. 可访问性（A11y）在可视化中](#10-可访问性a11y在可视化中)
    - [10.1 概念解释](#101-概念解释)
      - [障碍类型与解决方案](#障碍类型与解决方案)
    - [10.2 代码示例](#102-代码示例)
    - [10.3 CSS 辅助类](#103-css-辅助类)
    - [10.4 性能考虑](#104-性能考虑)
    - [10.5 最佳实践](#105-最佳实践)
  - [附录](#附录)
    - [推荐工具库](#推荐工具库)
    - [学习资源](#学习资源)
    - [浏览器兼容性](#浏览器兼容性)

---

## 1. 数据可视化理论基础

### 1.1 概念解释

数据可视化是将抽象数据转换为视觉元素的过程，核心目标是：

- **传达信息**：清晰准确地展示数据洞察
- **发现模式**：识别数据中的趋势、异常和关联
- **支持决策**：为业务分析提供视觉依据

#### 视觉编码通道

| 通道 | 适合类型 | 感知精度 | 示例 |
|------|----------|----------|------|
| 位置 | 定量 | ⭐⭐⭐⭐⭐ | 散点图坐标 |
| 长度 | 定量 | ⭐⭐⭐⭐⭐ | 柱状图高度 |
| 角度 | 定量 | ⭐⭐⭐ | 饼图扇区 |
| 面积 | 定量 | ⭐⭐⭐ | 气泡图大小 |
| 颜色亮度 | 定量/序数 | ⭐⭐⭐ | 热力图 |
| 颜色色调 | 分类 | ⭐⭐ | 类别区分 |

#### 图表类型选择决策树

```
数据关系类型
├── 比较 → 柱状图、条形图、雷达图
├── 趋势 → 折线图、面积图
├── 分布 → 直方图、箱线图、小提琴图
├── 占比 → 饼图、环形图、堆叠图
├── 关联 → 散点图、气泡图、热力图
└── 地理 → 地图、 choropleth
```

### 1.2 代码示例：基础 SVG 可视化

```javascript
// 原生 SVG 数据可视化示例
class BasicChart {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.margin = { top: 20, right: 20, bottom: 40, left: 50 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
  }

  // 比例尺实现
  createScales() {
    const maxValue = Math.max(...this.data.map(d => d.value));

    // X轴：序数比例尺
    this.xScale = (index) =>
      (index * this.width) / this.data.length + this.margin.left;

    // Y轴：线性比例尺
    this.yScale = (value) =>
      this.height + this.margin.top - (value / maxValue) * this.height;

    this.barWidth = (this.width / this.data.length) * 0.8;
  }

  // 渲染柱状图
  render() {
    this.createScales();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 800 400`);
    svg.setAttribute('class', 'basic-chart');

    // 绘制坐标轴
    this.drawAxes(svg);

    // 绘制柱子
    this.data.forEach((d, i) => {
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const x = this.xScale(i) + (this.width / this.data.length - this.barWidth) / 2;
      const y = this.yScale(d.value);
      const height = this.height + this.margin.top - y;

      bar.setAttribute('x', x);
      bar.setAttribute('y', y);
      bar.setAttribute('width', this.barWidth);
      bar.setAttribute('height', height);
      bar.setAttribute('fill', '#4CAF50');
      bar.setAttribute('class', 'chart-bar');

      // 交互效果
      bar.addEventListener('mouseenter', () => {
        bar.setAttribute('fill', '#45a049');
        this.showTooltip(d, x, y);
      });

      bar.addEventListener('mouseleave', () => {
        bar.setAttribute('fill', '#4CAF50');
        this.hideTooltip();
      });

      svg.appendChild(bar);
    });

    this.container.appendChild(svg);
  }

  drawAxes(svg) {
    // X轴
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', this.margin.left);
    xAxis.setAttribute('y1', this.height + this.margin.top);
    xAxis.setAttribute('x2', this.width + this.margin.left);
    xAxis.setAttribute('y2', this.height + this.margin.top);
    xAxis.setAttribute('stroke', '#333');
    svg.appendChild(xAxis);

    // Y轴
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', this.margin.left);
    yAxis.setAttribute('y1', this.margin.top);
    yAxis.setAttribute('x2', this.margin.left);
    yAxis.setAttribute('y2', this.height + this.margin.top);
    yAxis.setAttribute('stroke', '#333');
    svg.appendChild(yAxis);
  }
}

// 使用示例
const data = [
  { label: '一月', value: 65 },
  { label: '二月', value: 78 },
  { label: '三月', value: 90 },
  { label: '四月', value: 81 },
  { label: '五月', value: 95 }
];

const chart = new BasicChart(document.getElementById('chart'), data);
chart.render();
```

### 1.3 性能考虑

- **DOM 节点限制**：单个 SVG 元素数量建议不超过 5000 个
- **渐进渲染**：大数据集采用分页或虚拟滚动
- **计算优化**：使用 Web Worker 进行数据预处理

### 1.4 最佳实践

1. **数据完整性优先**：确保可视化不扭曲数据本意
2. **选择合适的图表类型**：避免用饼图展示过多类别（建议 ≤6 个）
3. **保持一致性**：相同类型的数据使用相同的视觉编码
4. **提供上下文**：坐标轴标签、单位、数据来源必不可少
5. **色盲友好**：避免仅依赖红绿区分（约 8% 男性为红绿色盲）

---

## 2. D3.js 原理和模式

### 2.1 概念解释

D3.js (Data-Driven Documents) 是基于数据操作文档的 JavaScript 库，核心原理：

#### 数据绑定模式

```
数据 → 加入 (Join) → 元素
           ↓
    ┌─────┼─────┐
   Enter Update Exit
  (新增) (更新) (移除)
```

#### 核心模块

| 模块 | 功能 |
|------|------|
| d3-selection | DOM 操作和数据绑定 |
| d3-scale | 比例尺（线性、序数、时间等）|
| d3-shape | 图形生成器（线、面积、弧等）|
| d3-transition | 动画过渡 |
| d3-axis | 坐标轴 |
| d3-zoom/d3-drag | 交互行为 |

### 2.2 代码示例

```javascript
// D3.js v7 完整示例
import * as d3 from 'd3';

class D3BarChart {
  constructor(selector, data) {
    this.container = d3.select(selector);
    this.data = data;
    this.init();
  }

  init() {
    // 设置尺寸
    this.margin = { top: 30, right: 30, bottom: 50, left: 60 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    // 创建 SVG
    this.svg = this.container
      .append('svg')
      .attr('viewBox', `0 0 800 400`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // 初始化比例尺
    this.x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.2);

    this.y = d3.scaleLinear()
      .range([this.height, 0]);

    // 颜色比例尺
    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    // 添加分组
    this.barsGroup = this.svg.append('g').attr('class', 'bars');
    this.xAxisGroup = this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);
    this.yAxisGroup = this.svg.append('g').attr('class', 'y-axis');

    // 添加标题
    this.title = this.svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold');
  }

  update(newData, options = {}) {
    const { animate = true, title = '' } = options;
    this.data = newData;

    // 更新比例尺域
    this.x.domain(this.data.map(d => d.name));
    this.y.domain([0, d3.max(this.data, d => d.value) * 1.1]);

    // 更新坐标轴
    this.xAxisGroup
      .transition().duration(animate ? 750 : 0)
      .call(d3.axisBottom(this.x).tickSizeOuter(0));

    this.yAxisGroup
      .transition().duration(animate ? 750 : 0)
      .call(d3.axisLeft(this.y).ticks(5).tickFormat(d => `${d}%`));

    // 数据绑定 - 关键模式
    const bars = this.barsGroup
      .selectAll('.bar')
      .data(this.data, d => d.name);

    // Exit: 移除旧元素
    bars.exit()
      .transition().duration(animate ? 500 : 0)
      .attr('y', this.height)
      .attr('height', 0)
      .remove();

    // Enter: 添加新元素
    const barsEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.x(d.name))
      .attr('width', this.x.bandwidth())
      .attr('y', this.height)
      .attr('height', 0)
      .attr('fill', d => this.color(d.category || d.name));

    // Update + Enter: 更新所有元素
    bars.merge(barsEnter)
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip())
      .transition().duration(animate ? 750 : 0)
      .attr('x', d => this.x(d.name))
      .attr('width', this.x.bandwidth())
      .attr('y', d => this.y(d.value))
      .attr('height', d => this.height - this.y(d.value))
      .attr('fill', d => this.color(d.category || d.name));

    // 更新标题
    if (title) {
      this.title.text(title);
    }

    return this;
  }

  // 添加数值标签
  addLabels() {
    const labels = this.barsGroup
      .selectAll('.label')
      .data(this.data, d => d.name);

    labels.exit().remove();

    labels.enter()
      .append('text')
      .attr('class', 'label')
      .merge(labels)
      .transition().duration(750)
      .attr('x', d => this.x(d.name) + this.x.bandwidth() / 2)
      .attr('y', d => this.y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.value);

    return this;
  }

  showTooltip(event, d) {
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    tooltip.transition().duration(200).style('opacity', 1);
    tooltip.html(`<strong>${d.name}</strong><br/>值: ${d.value}`)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`);
  }

  hideTooltip() {
    d3.selectAll('.d3-tooltip').remove();
  }
}

// 折线图生成器示例
class D3LineChart {
  constructor(selector, data) {
    this.container = d3.select(selector);
    this.data = data;
    this.init();
  }

  init() {
    this.margin = { top: 20, right: 30, bottom: 30, left: 50 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.svg = this.container
      .append('svg')
      .attr('viewBox', `0 0 800 400`)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // 时间比例尺
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    // 线生成器
    this.line = d3.line()
      .x(d => this.x(d.date))
      .y(d => this.y(d.value))
      .curve(d3.curveMonotoneX); // 平滑曲线

    // 面积生成器
    this.area = d3.area()
      .x(d => this.x(d.date))
      .y0(this.height)
      .y1(d => this.y(d.value))
      .curve(d3.curveMonotoneX);

    this.svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: 'rgba(76, 175, 80, 0.4)' },
        { offset: '100%', color: 'rgba(76, 175, 80, 0.0)' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);
  }

  update(data) {
    this.data = data;

    this.x.domain(d3.extent(data, d => d.date));
    this.y.domain([0, d3.max(data, d => d.value) * 1.1]);

    // 绘制面积
    const areaPath = this.svg.selectAll('.area')
      .data([data]);

    areaPath.enter()
      .append('path')
      .attr('class', 'area')
      .merge(areaPath)
      .transition().duration(750)
      .attr('d', this.area)
      .attr('fill', 'url(#area-gradient)');

    // 绘制线条
    const linePath = this.svg.selectAll('.line')
      .data([data]);

    linePath.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#4CAF50')
      .attr('stroke-width', 2)
      .merge(linePath)
      .transition().duration(750)
      .attr('d', this.line);

    // 添加坐标轴
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x).tickFormat(d3.timeFormat('%m/%d')));

    this.svg.append('g')
      .call(d3.axisLeft(this.y));
  }
}

// 使用示例
const sampleData = [
  { name: 'A', value: 30, category: 'group1' },
  { name: 'B', value: 85, category: 'group2' },
  { name: 'C', value: 55, category: 'group1' },
  { name: 'D', value: 70, category: 'group2' },
];

const chart = new D3BarChart('#chart-container', sampleData);
chart.update(sampleData, { title: '销售数据分析' }).addLabels();
```

### 2.3 性能考虑

```javascript
// D3 性能优化技巧

// 1. 使用 requestAnimationFrame 批量更新
class OptimizedD3Chart {
  batchUpdate(data) {
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.render(data);
    });
  }

  // 2. 虚拟滚动处理大数据
  virtualize(data, containerHeight, itemHeight) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const scrollTop = this.scrollContainer.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, data.length);

    return {
      visibleData: data.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight,
      totalHeight: data.length * itemHeight
    };
  }

  // 3. Canvas 降级渲染（超大数据集）
  renderToCanvas(data) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 使用 canvas 绘制替代 SVG
    data.forEach(d => {
      ctx.fillStyle = this.colorScale(d.value);
      ctx.fillRect(this.x(d.x), this.y(d.y), 2, 2);
    });
  }
}
```

### 2.4 最佳实践

1. **使用数据键值函数**：始终提供 key 函数确保正确元素对应

   ```javascript
   .data(data, d => d.id)  // 而非 .data(data)
   ```

2. **链式调用换行**：提高可读性

   ```javascript
   d3.selectAll('rect')
     .attr('x', d => x(d.name))
     .attr('y', d => y(d.value))
     .attr('width', x.bandwidth());
   ```

3. **模块化组织**：将比例尺、渲染、交互逻辑分离

4. **内存管理**：退出时清理事件监听器和计时器

   ```javascript
   selection.exit()
     .on('click', null)  // 移除监听器
     .remove();
   ```

---

## 3. Chart.js 使用指南

### 3.1 概念解释

Chart.js 是基于 Canvas 的开源图表库，特点：

- **声明式配置**：通过选项对象定义图表
- **响应式默认**：自动适应容器大小
- **动画内置**：丰富的动画效果开箱即用
- **插件生态**：可扩展的插件系统

#### 架构图

```
Chart.js
├── Core (核心)
│   ├── Controller (图表控制器)
│   ├── DatasetController (数据集控制)
│   └── Scale (比例尺系统)
├── Elements (图形元素)
│   ├── Arc, Line, Point, Bar, Rectangle
├── Plugins (插件)
│   ├── Legend, Tooltip, Title
└── Adapters (适配器)
    └── Date Adapter (时间处理)
```

### 3.2 代码示例

```javascript
// Chart.js v4 完整示例
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// 基础柱状图
const barCtx = document.getElementById('barChart').getContext('2d');
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [{
      label: '销售额',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: '月度销售统计',
        font: { size: 18, weight: 'bold' },
        padding: 20
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            return `销售额: ¥${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          callback: (value) => `¥${value / 1000}k`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }
});

// 混合图表（折线 + 柱状）
const mixedCtx = document.getElementById('mixedChart').getContext('2d');
const mixedChart = new Chart(mixedCtx, {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '收入',
        data: [150000, 230000, 180000, 320000],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        order: 2
      },
      {
        label: '利润率',
        data: [15, 22, 18, 28],
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
        tension: 0.4,
        order: 1
      }
    ]
  },
  options: {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: '收入 (元)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: '利润率 (%)' },
        ticks: { callback: (v) => `${v}%` }
      }
    }
  }
});

// 雷达图
const radarCtx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(radarCtx, {
  type: 'radar',
  data: {
    labels: ['技术能力', '沟通能力', '领导力', '创新思维', '团队协作', '问题解决'],
    datasets: [{
      label: '张三',
      data: [85, 90, 75, 88, 92, 80],
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(54, 162, 235)'
    }, {
      label: '李四',
      data: [78, 85, 92, 75, 85, 88],
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
  },
  options: {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20 }
      }
    }
  }
});

// 自定义插件示例
const dataLabelPlugin = {
  id: 'dataLabelPlugin',
  afterDatasetsDraw(chart, args, options) {
    const { ctx, data } = chart;
    ctx.save();

    data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((element, index) => {
        const value = dataset.data[index];
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, element.x, element.y - 5);
      });
    });

    ctx.restore();
  }
};

// 注册并使用插件
Chart.register(dataLabelPlugin);

// 动态更新数据
function updateChartData(chart, newData) {
  chart.data.datasets.forEach((dataset, i) => {
    dataset.data = newData[i];
  });
  chart.update('none'); // 'none' 模式禁用动画，提高性能
}

// 图表管理器类
class ChartManager {
  constructor() {
    this.charts = new Map();
  }

  create(id, config) {
    const ctx = document.getElementById(id).getContext('2d');
    const chart = new Chart(ctx, config);
    this.charts.set(id, chart);
    return chart;
  }

  destroy(id) {
    const chart = this.charts.get(id);
    if (chart) {
      chart.destroy();
      this.charts.delete(id);
    }
  }

  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  // 批量更新所有图表
  updateAll(dataMap) {
    this.charts.forEach((chart, id) => {
      if (dataMap.has(id)) {
        chart.data = dataMap.get(id);
        chart.update();
      }
    });
  }
}
```

### 3.3 性能考虑

```javascript
// Chart.js 性能优化

// 1. 数据降采样
function lttbDecimation(data, threshold = 1000) {
  // Largest Triangle Three Buckets 算法
  const sampled = [];
  const bucketSize = Math.floor((data.length - 2) / (threshold - 2));

  sampled.push(data[0]);

  for (let i = 0; i < threshold - 2; i++) {
    const bucketStart = (i * bucketSize) + 1;
    const bucketEnd = Math.min((i + 1) * bucketSize + 1, data.length - 1);

    // 计算最大三角形面积点
    let maxArea = -1;
    let maxIndex = bucketStart;

    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (data[sampled.length - 1].x - data[j].x) *
        (data[bucketEnd].y - data[sampled.length - 1].y) -
        (data[sampled.length - 1].x - data[bucketEnd].x) *
        (data[j].y - data[sampled.length - 1].y)
      );

      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(data[maxIndex]);
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}

// 2. 使用内置降采样插件
const chartWithDecimation = new Chart(ctx, {
  type: 'line',
  data: largeDataset,
  options: {
    parsing: false, // 禁用解析，直接访问原始数据
    normalized: true,
    scales: {
      x: { type: 'time' }
    },
    datasets: {
      line: {
        pointRadius: 0, // 大数据集隐藏点
        borderWidth: 1
      }
    },
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 500,
        threshold: 1000
      }
    }
  }
});

// 3. 延迟渲染
function lazyRender(chart, delay = 100) {
  clearTimeout(chart.renderTimeout);
  chart.renderTimeout = setTimeout(() => {
    chart.update('none');
  }, delay);
}
```

### 3.4 最佳实践

1. **及时销毁**：组件卸载时调用 `chart.destroy()` 释放内存
2. **避免重创建**：更新数据时用 `chart.data` + `chart.update()` 而非重新实例化
3. **合理设置 aspect ratio**：`maintAspectRatio: false` 配合容器高度
4. **响应式处理**：监听容器尺寸变化，必要时调用 `chart.resize()`
5. **颜色一致性**：使用一致的配色方案建立品牌认知

---

## 4. 响应式图表设计

### 4.1 概念解释

响应式图表需要适应不同屏幕尺寸，核心挑战：

- **尺寸适配**：容器大小变化时的重绘
- **密度调整**：小屏幕减少数据密度
- **交互转换**：移动端手势替代悬停
- **字体缩放**：可读性与空间的平衡

#### 断点策略

```
Mobile:    < 576px   → 简化图表，垂直布局
Tablet:    576-992px → 标准布局，适度密度
Desktop:   > 992px   → 完整功能，高密度数据
```

### 4.2 代码示例

```javascript
// 响应式图表组件
import { ResizeObserver } from '@juggle/resize-observer';

class ResponsiveChart {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.breakpoints = {
      mobile: 576,
      tablet: 992
    };
    this.currentBreakpoint = null;

    this.init();
  }

  init() {
    this.detectBreakpoint();
    this.setupResizeObserver();
    this.render();
  }

  detectBreakpoint() {
    const width = this.container.clientWidth;

    if (width < this.breakpoints.mobile) {
      this.currentBreakpoint = 'mobile';
    } else if (width < this.breakpoints.tablet) {
      this.currentBreakpoint = 'tablet';
    } else {
      this.currentBreakpoint = 'desktop';
    }
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const prevBreakpoint = this.currentBreakpoint;
        this.detectBreakpoint();

        // 断点变化时重新渲染
        if (prevBreakpoint !== this.currentBreakpoint) {
          this.handleBreakpointChange();
        } else {
          this.handleResize(entry.contentRect);
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  handleBreakpointChange() {
    // 根据断点调整配置
    const config = this.getResponsiveConfig();
    this.updateChart(config);
  }

  handleResize(rect) {
    // 同断点内的尺寸调整
    if (this.chart) {
      this.chart.resize(rect.width, rect.height);
    }
  }

  getResponsiveConfig() {
    const baseConfig = {
      data: this.options.data,
      colors: this.options.colors
    };

    switch (this.currentBreakpoint) {
      case 'mobile':
        return {
          ...baseConfig,
          showLegend: false,
          showGrid: false,
          fontSize: 10,
          tickCount: 4,
          rotateLabels: true,
          chartType: 'bar' // 移动端简化为柱状图
        };

      case 'tablet':
        return {
          ...baseConfig,
          showLegend: true,
          showGrid: true,
          fontSize: 12,
          tickCount: 6,
          rotateLabels: false,
          chartType: 'line'
        };

      case 'desktop':
        return {
          ...baseConfig,
          showLegend: true,
          showGrid: true,
          fontSize: 14,
          tickCount: 10,
          rotateLabels: false,
          chartType: 'line',
          showTooltip: true
        };
    }
  }

  render() {
    const config = this.getResponsiveConfig();
    this.container.innerHTML = '';

    // 使用 D3 渲染响应式图表
    this.chart = new ResponsiveD3Chart(this.container, config);
  }

  updateChart(config) {
    this.chart.update(config);
  }

  destroy() {
    this.resizeObserver?.disconnect();
    this.chart?.destroy();
  }
}

// 响应式 D3 图表实现
class ResponsiveD3Chart {
  constructor(container, config) {
    this.container = d3.select(container);
    this.config = config;
    this.init();
  }

  init() {
    this.margin = { top: 20, right: 30, bottom: 60, left: 50 };
    this.containerWidth = this.container.node().clientWidth;
    this.containerHeight = this.container.node().clientHeight || 300;

    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;

    // 创建 SVG
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.containerWidth} ${this.containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.draw();
  }

  draw() {
    const { data, tickCount, fontSize, rotateLabels } = this.config;

    // 比例尺
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, this.width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .nice(tickCount)
      .range([this.height, 0]);

    // X 轴
    const xAxis = this.g.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

    if (rotateLabels) {
      xAxis.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', `${fontSize}px`);
    } else {
      xAxis.selectAll('text')
        .style('font-size', `${fontSize}px`);
    }

    // Y 轴
    this.g.append('g')
      .call(d3.axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .style('font-size', `${fontSize}px`);

    // 柱子
    this.g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => this.height - y(d.value))
      .attr('fill', (d, i) => this.config.colors[i % this.config.colors.length]);
  }

  resize(width, height) {
    this.containerWidth = width;
    this.containerHeight = height || 300;
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;

    this.svg
      .attr('viewBox', `0 0 ${this.containerWidth} ${this.containerHeight}`);

    this.g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // 清除并重绘
    this.g.selectAll('*').remove();
    this.draw();
  }

  update(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.g.selectAll('*').remove();
    this.draw();
  }

  destroy() {
    this.svg.remove();
  }
}

// Chart.js 响应式配置
const responsiveChartJsConfig = {
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // 响应式调整
    onResize: (chart, size) => {
      const width = size.width;

      // 根据宽度调整选项
      if (width < 400) {
        chart.options.plugins.legend.display = false;
        chart.options.scales.x.ticks.maxRotation = 90;
        chart.options.scales.x.ticks.font.size = 10;
      } else if (width < 700) {
        chart.options.plugins.legend.display = true;
        chart.options.plugins.legend.position = 'bottom';
        chart.options.scales.x.ticks.maxRotation = 45;
        chart.options.scales.x.ticks.font.size = 11;
      } else {
        chart.options.plugins.legend.display = true;
        chart.options.plugins.legend.position = 'top';
        chart.options.scales.x.ticks.maxRotation = 0;
        chart.options.scales.x.ticks.font.size = 12;
      }
    }
  }
};

// React Hook 示例
function useResponsiveChart(data) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;

      if (width < 576) setBreakpoint('mobile');
      else if (width < 992) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    });

    observer.observe(containerRef.current);

    // 初始化 Chart.js
    const ctx = containerRef.current.querySelector('canvas').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: getDataForBreakpoint(data, breakpoint),
      options: responsiveChartJsConfig.options
    });

    return () => {
      observer.disconnect();
      chartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = getDataForBreakpoint(data, breakpoint);
      chartRef.current.update();
    }
  }, [breakpoint, data]);

  return { containerRef, breakpoint };
}
```

### 4.3 性能考虑

- **防抖处理**：resize 事件防抖（200ms）避免频繁重绘
- **渐进增强**：移动端先渲染简化版本，再加载完整功能
- **CSS 优先**：使用 CSS transform/scale 做快速响应

### 4.4 最佳实践

1. **容器查询优先**：使用 `ResizeObserver` 而非 `window.resize`
2. **字体使用相对单位**：`rem` 或 `em` 而非固定 `px`
3. **触摸目标最小 44px**：移动端可点击元素尺寸
4. **测试真实设备**：模拟器无法完全替代真实触摸交互

---

## 5. 大数据量可视化优化

### 5.1 概念解释

大数据可视化（>10,000 点）的核心挑战：

- **渲染瓶颈**：DOM/Canvas 绘制开销
- **内存占用**：数据存储和传输
- **交互延迟**：筛选和缩放响应

#### 优化策略层级

```
数据层 → 聚合采样、数据分片
传输层 → 数据压缩、增量加载
渲染层 → Canvas/WebGL、虚拟滚动
交互层 → 防抖节流、渐进渲染
```

### 5.2 代码示例


```javascript
// 大数据可视化优化方案

// 1. 数据聚合 - 时间序列降采样
class DataAggregator {
  // 简单平均聚合
  static simpleAggregation(data, bucketSize) {
    const aggregated = [];
    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, i + bucketSize);
      const avg = bucket.reduce((sum, d) => sum + d.value, 0) / bucket.length;
      aggregated.push({
        x: bucket[Math.floor(bucket.length / 2)].x,
        y: avg,
        count: bucket.length
      });
    }
    return aggregated;
  }

  // 峰值保留聚合（保留极值点）
  static peakPreservingAggregation(data, targetCount) {
    if (data.length <= targetCount) return data;

    const bucketSize = Math.ceil(data.length / targetCount);
    const aggregated = [];

    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, Math.min(i + bucketSize, data.length));

      // 找最大、最小、平均值
      const max = bucket.reduce((m, d) => d.y > m.y ? d : m);
      const min = bucket.reduce((m, d) => d.y < m.y ? d : m);
      const avg = bucket.reduce((s, d) => s + d.y, 0) / bucket.length;

      // 保留极值和中间点
      aggregated.push(min);
      if (Math.abs(max.y - min.y) > 0.01) {
        aggregated.push(max);
      }
    }

    return aggregated.sort((a, b) => a.x - b.x);
  }

  // LTTB (Largest Triangle Three Buckets) 算法
  static lttb(data, threshold) {
    if (data.length <= threshold) return data;

    const sampled = [data[0]];
    const bucketSize = (data.length - 2) / (threshold - 2);

    let pointIndex = 0;
    let maxAreaIndex = 0;

    for (let i = 0; i < threshold - 2; i++) {
      const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
      const bucketEnd = Math.floor((i + 2) * bucketSize) + 1;

      const bucket = data.slice(bucketStart, bucketEnd);
      const pointA = sampled[sampled.length - 1];
      const pointC = data[Math.floor((i + 2) * bucketSize) + 1];

      let maxArea = -1;

      bucket.forEach((point, idx) => {
        const area = Math.abs(
          (pointA.x - point.x) * (pointC.y - pointA.y) -
          (pointA.x - pointC.x) * (point.y - pointA.y)
        );

        if (area > maxArea) {
          maxArea = area;
          maxAreaIndex = idx;
        }
      });

      sampled.push(bucket[maxAreaIndex]);
    }

    sampled.push(data[data.length - 1]);
    return sampled;
  }
}

// 2. 大数据集 D3 渲染优化
class OptimizedD3Chart {
  constructor(container, data) {
    this.container = container;
    this.rawData = data;
    this.maxPoints = 2000;
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupScales();
    this.setupZoom();
    this.render();
  }

  setupCanvas() {
    // 使用 Canvas 替代 SVG 渲染大数据
    this.canvas = this.container.append('canvas')
      .attr('width', 800)
      .attr('height', 400)
      .node();

    this.ctx = this.canvas.getContext('2d');
    this.pixelRatio = window.devicePixelRatio || 1;

    // 高清屏适配
    this.canvas.width = 800 * this.pixelRatio;
    this.canvas.height = 400 * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.canvas.style.width = '800px';
    this.canvas.style.height = '400px';
  }

  setupScales() {
    this.x = d3.scaleLinear()
      .domain(d3.extent(this.rawData, d => d.x));

    this.y = d3.scaleLinear()
      .domain([0, d3.max(this.rawData, d => d.y) * 1.1]);
  }

  setupZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([1, 100])
      .extent([[0, 0], [800, 400]])
      .on('zoom', (event) => this.handleZoom(event));

    d3.select(this.canvas)
      .call(this.zoom)
      .on('dblclick.zoom', null);
  }

  handleZoom(event) {
    const newX = event.transform.rescaleX(this.x);
    const [x0, x1] = newX.domain();

    // 获取可视区域内的数据
    const visibleData = this.rawData.filter(
      d => d.x >= x0 && d.x <= x1
    );

    // 动态降采样
    this.currentData = visibleData.length > this.maxPoints
      ? DataAggregator.lttb(visibleData, this.maxPoints)
      : visibleData;

    this.renderCanvas();
  }

  renderCanvas() {
    const ctx = this.ctx;
    const width = 800;
    const height = 400;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // 绘制数据线
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1.5;

    const data = this.currentData || this.rawData.slice(0, this.maxPoints);

    data.forEach((d, i) => {
      const x = this.x(d.x);
      const y = this.y(d.y);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 只在点数较少时绘制点
    if (data.length < 500) {
      ctx.fillStyle = '#4CAF50';
      data.forEach(d => {
        ctx.beginPath();
        ctx.arc(this.x(d.x), this.y(d.y), 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }

  render() {
    // 初始降采样
    this.currentData = this.rawData.length > this.maxPoints
      ? DataAggregator.lttb(this.rawData, this.maxPoints)
      : this.rawData;

    this.renderCanvas();
  }
}

// 3. WebGL 加速渲染（使用 regl 或 three.js）
class WebGLRenderer {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.data = data;
    this.init();
  }

  init() {
    // 初始化 WebGL 上下文
    this.gl = this.canvas.getContext('webgl') ||
              this.canvas.getContext('experimental-webgl');

    // 顶点着色器
    const vsSource = `
      attribute vec2 a_position;
      uniform vec2 u_scale;
      uniform vec2 u_offset;

      void main() {
        gl_Position = vec4(
          (a_position.x + u_offset.x) * u_scale.x,
          (a_position.y + u_offset.y) * u_scale.y,
          0.0, 1.0
        );
        gl_PointSize = 2.0;
      }
    `;

    // 片段着色器
    const fsSource = `
      precision mediump float;
      uniform vec4 u_color;

      void main() {
        gl_FragColor = u_color;
      }
    `;

    this.program = this.createProgram(vsSource, fsSource);
    this.setupBuffers();
  }

  createProgram(vsSource, fsSource) {
    const vs = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);

    return program;
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  setupBuffers() {
    // 将数据转换为 Float32Array
    const positions = new Float32Array(this.data.length * 2);
    this.data.forEach((d, i) => {
      positions[i * 2] = d.x;
      positions[i * 2 + 1] = d.y;
    });

    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
  }

  render() {
    const gl = this.gl;

    gl.useProgram(this.program);

    // 绑定数据
    const positionLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // 设置 uniform
    const scaleLoc = gl.getUniformLocation(this.program, 'u_scale');
    gl.uniform2f(scaleLoc, 2 / (maxX - minX), -2 / (maxY - minY));

    const colorLoc = gl.getUniformLocation(this.program, 'u_color');
    gl.uniform4f(colorLoc, 0.29, 0.68, 0.31, 1.0);

    // 绘制
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, this.data.length);
  }
}

// 4. 虚拟滚动表格
class VirtualizedTable {
  constructor(container, data, rowHeight = 40) {
    this.container = container;
    this.data = data;
    this.rowHeight = rowHeight;
    this.visibleCount = 20;
    this.buffer = 5;

    this.init();
  }

  init() {
    this.scrollTop = 0;
    this.setupContainer();
    this.setupScrollHandler();
    this.render();
  }

  setupContainer() {
    this.container.style.overflow = 'auto';
    this.container.style.height = `${this.visibleCount * this.rowHeight}px`;

    // 占位元素
    this.spacer = document.createElement('div');
    this.spacer.style.height = `${this.data.length * this.rowHeight}px`;
    this.container.appendChild(this.spacer);

    // 实际内容容器
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    this.spacer.appendChild(this.content);
  }

  setupScrollHandler() {
    let ticking = false;

    this.container.addEventListener('scroll', (e) => {
      this.scrollTop = e.target.scrollTop;

      if (!ticking) {
        requestAnimationFrame(() => {
          this.render();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + this.buffer,
      this.data.length
    );

    const visibleData = this.data.slice(
      Math.max(0, startIndex - this.buffer),
      endIndex
    );

    const offsetY = Math.max(0, startIndex - this.buffer) * this.rowHeight;

    // 渲染可见行
    this.content.innerHTML = '';
    this.content.style.transform = `translateY(${offsetY}px)`;

    visibleData.forEach((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.style.height = `${this.rowHeight}px`;
      rowEl.style.display = 'flex';
      rowEl.style.alignItems = 'center';
      rowEl.style.borderBottom = '1px solid #eee';
      rowEl.style.padding = '0 10px';
      rowEl.textContent = JSON.stringify(row);
      this.content.appendChild(rowEl);
    });
  }
}

// 5. 分层数据加载
class ProgressiveDataLoader {
  constructor(apiEndpoint) {
    this.endpoint = apiEndpoint;
    this.cache = new Map();
    this.loadingRanges = new Set();
  }

  async loadRange(start, end, resolution = 'auto') {
    const cacheKey = `${start}-${end}-${resolution}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingRanges.has(cacheKey)) {
      return null; // 正在加载中
    }

    this.loadingRanges.add(cacheKey);

    try {
      const response = await fetch(
        `${this.endpoint}?start=${start}&end=${end}&resolution=${resolution}`
      );
      const data = await response.json();

      this.cache.set(cacheKey, data);
      this.loadingRanges.delete(cacheKey);

      return data;
    } catch (error) {
      this.loadingRanges.delete(cacheKey);
      throw error;
    }
  }

  // 根据缩放级别自动选择分辨率
  getResolutionForZoom(zoom) {
    if (zoom < 0.1) return 'year';
    if (zoom < 0.5) return 'month';
    if (zoom < 2) return 'day';
    if (zoom < 10) return 'hour';
    return 'minute';
  }
}
```

### 5.3 性能考虑

| 数据量 | 推荐技术 | 渲染时间 |
|--------|----------|----------|
| < 1,000 | SVG/D3 | < 16ms |
| 1,000 - 10,000 | Canvas | 16-50ms |
| 10,000 - 100,000 | Canvas + 降采样 | 16-33ms |
| > 100,000 | WebGL | < 16ms |

### 5.4 最佳实践

1. **数据预处理先行**：服务器端聚合优于客户端
2. **分层加载策略**：概览 → 缩放 → 细节
3. **缓存可见区域**：避免重复计算
4. **使用 requestAnimationFrame**：渲染与刷新率同步
5. **监控帧率**：保持 60fps，低于 30fps 时自动降级

---

## 6. 交互式可视化

### 6.1 概念解释

交互式可视化通过用户操作增强数据探索能力：

#### 交互类型

| 类型 | 描述 | 示例 |
|------|------|------|
| 选择 | 高亮特定数据项 | 点击图例、框选 |
| 缩放/平移 | 改变视图范围 | 滚轮缩放、拖拽 |
| 过滤 | 隐藏不符合条件的数据 | 滑块范围选择 |
| 排序 | 改变数据排列顺序 | 点击表头排序 |
| 下钻 | 查看更详细数据 | 点击柱状图下钻 |
| 链接 | 多视图联动 | 散点图与表格联动 |

### 6.2 代码示例

```javascript
// D3.js 交互式可视化
class InteractiveChart {
  constructor(container, data) {
    this.container = d3.select(container);
    this.data = data;
    this.selectedItems = new Set();
    this.brushMode = false;

    this.init();
  }

  init() {
    this.setupSVG();
    this.setupScales();
    this.setupAxes();
    this.setupZoom();
    this.setupBrush();
    this.setupTooltip();
    this.render();
    this.setupControls();
  }

  setupSVG() {
    this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 900 500`);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // 裁剪路径（防止元素超出边界）
    this.g.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  setupScales() {
    this.x = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.x))
      .range([0, this.width]);

    this.y = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.y))
      .range([this.height, 0]);

    this.color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(this.data.map(d => d.category))]);
  }

  setupZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', (e) => this.handleZoom(e));

    // 缩放矩形
    this.zoomRect = this.g.append('rect')
      .attr('class', 'zoom-rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(this.zoom);
  }

  handleZoom(event) {
    const newX = event.transform.rescaleX(this.x);
    const newY = event.transform.rescaleY(this.y);

    // 更新坐标轴
    this.xAxis.call(d3.axisBottom(newX));
    this.yAxis.call(d3.axisLeft(newY));

    // 更新数据点位置
    this.dots
      .attr('cx', d => newX(d.x))
      .attr('cy', d => newY(d.y));

    // 更新刷选区域
    if (this.brush) {
      this.brush.move(this.brushGroup, null);
    }
  }

  setupBrush() {
    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on('start brush end', (e) => this.handleBrush(e));

    this.brushGroup = this.g.append('g')
      .attr('class', 'brush')
      .style('display', 'none')
      .call(this.brush);
  }

  handleBrush(event) {
    if (!event.selection) {
      this.selectedItems.clear();
      this.updateSelection();
      return;
    }

    const [[x0, y0], [x1, y1]] = event.selection;
    const currentTransform = d3.zoomTransform(this.zoomRect.node());
    const newX = currentTransform.rescaleX(this.x);
    const newY = currentTransform.rescaleY(this.y);

    this.selectedItems.clear();

    this.data.forEach(d => {
      const cx = newX(d.x);
      const cy = newY(d.y);
      if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
        this.selectedItems.add(d.id);
      }
    });

    this.updateSelection();
    this.emit('selectionChange', Array.from(this.selectedItems));
  }

  updateSelection() {
    this.dots
      .transition().duration(200)
      .attr('r', d => this.selectedItems.has(d.id) ? 8 : 5)
      .style('opacity', d => {
        if (this.selectedItems.size === 0) return 0.7;
        return this.selectedItems.has(d.id) ? 1 : 0.2;
      })
      .style('stroke', d => this.selectedItems.has(d.id) ? '#333' : 'none')
      .style('stroke-width', d => this.selectedItems.has(d.id) ? 2 : 0);
  }

  setupTooltip() {
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');
  }

  render() {
    // 绘制网格
    this.g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat(''));

    this.g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(this.y)
        .tickSize(-this.width)
        .tickFormat(''));

    // 绘制坐标轴
    this.xAxis = this.g.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    this.yAxis = this.g.append('g')
      .call(d3.axisLeft(this.y));

    // 绘制数据点
    this.dots = this.g.append('g')
      .attr('clip-path', 'url(#clip)')
      .selectAll('.dot')
      .data(this.data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => this.x(d.x))
      .attr('cy', d => this.y(d.y))
      .attr('r', 5)
      .style('fill', d => this.color(d.category))
      .style('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip())
      .on('click', (event, d) => this.toggleSelection(d));

    // 添加图例
    this.renderLegend();
  }

  renderLegend() {
    const categories = [...new Set(this.data.map(d => d.category))];
    const legend = this.svg.append('g')
      .attr('transform', `translate(${this.width - 100}, 20)`);

    categories.forEach((cat, i) => {
      const item = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`)
        .style('cursor', 'pointer')
        .on('click', () => this.filterByCategory(cat));

      item.append('circle')
        .attr('r', 6)
        .style('fill', this.color(cat));

      item.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .style('font-size', '12px')
        .text(cat);
    });
  }

  showTooltip(event, d) {
    this.tooltip
      .style('visibility', 'visible')
      .html(`
        <strong>${d.name}</strong><br/>
        X: ${d.x.toFixed(2)}<br/>
        Y: ${d.y.toFixed(2)}<br/>
        类别: ${d.category}
      `)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`);
  }

  hideTooltip() {
    this.tooltip.style('visibility', 'hidden');
  }

  toggleSelection(d) {
    if (this.selectedItems.has(d.id)) {
      this.selectedItems.delete(d.id);
    } else {
      this.selectedItems.add(d.id);
    }
    this.updateSelection();
  }

  filterByCategory(category) {
    const isFiltered = this.filteredCategory === category;
    this.filteredCategory = isFiltered ? null : category;

    this.dots
      .transition().duration(300)
      .style('opacity', d => {
        if (isFiltered) return 0.7;
        return d.category === category ? 0.7 : 0.1;
      });
  }

  setupControls() {
    // 模式切换按钮
    const controls = this.container.insert('div', ':first-child')
      .attr('class', 'chart-controls')
      .style('margin-bottom', '10px');

    controls.append('button')
      .text('缩放模式')
      .on('click', () => this.setMode('zoom'));

    controls.append('button')
      .text('框选模式')
      .on('click', () => this.setMode('brush'));

    controls.append('button')
      .text('重置视图')
      .on('click', () => this.resetView());

    controls.append('button')
      .text('清除选择')
      .on('click', () => {
        this.selectedItems.clear();
        this.updateSelection();
      });
  }

  setMode(mode) {
    if (mode === 'zoom') {
      this.brushGroup.style('display', 'none');
      this.zoomRect.style('pointer-events', 'all');
    } else {
      this.brushGroup.style('display', 'block');
      this.zoomRect.style('pointer-events', 'none');
    }
  }

  resetView() {
    this.zoomRect.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
  }

  emit(eventName, data) {
    // 触发自定义事件
    this.container.node().dispatchEvent(
      new CustomEvent(eventName, { detail: data, bubbles: true })
    );
  }
}

// Chart.js 交互配置
const interactiveChartConfig = {
  type: 'line',
  options: {
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true,
        position: 'nearest',
        external: function(context) {
          // 自定义外部 tooltip
          const { chart, tooltip } = context;
          // 自定义渲染逻辑
        }
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy',
          onZoom: ({ chart }) => {
            console.log('Zoom level:', chart.getZoomLevel());
          }
        },
        pan: {
          enabled: true,
          mode: 'xy'
        }
      }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const datasetIndex = elements[0].datasetIndex;
        const data = chart.data.datasets[datasetIndex].data[index];

        // 触发自定义事件
        chart.canvas.dispatchEvent(
          new CustomEvent('pointClick', { detail: data })
        );
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }
  }
};

// 联动多图表示例
class LinkedCharts {
  constructor(containers) {
    this.charts = [];
    this.sharedState = {
      selectedTimeRange: null,
      highlightedCategory: null
    };

    this.init(containers);
  }

  init(containers) {
    containers.forEach((container, i) => {
      const chart = this.createChart(container, i);
      this.charts.push(chart);
    });

    this.setupSync();
  }

  createChart(container, index) {
    const ctx = document.getElementById(container).getContext('2d');

    return new Chart(ctx, {
      type: index === 0 ? 'line' : 'bar',
      data: this.getDataForChart(index),
      options: {
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const dataIndex = elements[0].index;
            this.syncSelection(dataIndex);
          }
        }
      }
    });
  }

  syncSelection(index) {
    this.charts.forEach(chart => {
      // 高亮选中的数据点
      const colors = chart.data.datasets[0].data.map((_, i) =>
        i === index ? 'rgba(255, 99, 132, 1)' : 'rgba(200, 200, 200, 0.5)'
      );

      chart.data.datasets[0].backgroundColor = colors;
      chart.update('none');
    });
  }

  setupSync() {
    // 监听共享状态变化
    Object.defineProperty(this.sharedState, 'selectedTimeRange', {
      set: (value) => {
        this._selectedTimeRange = value;
        this.charts.forEach(chart => {
          // 更新所有图表的时间范围
          chart.options.scales.x.min = value[0];
          chart.options.scales.x.max = value[1];
          chart.update();
        });
      },
      get: () => this._selectedTimeRange
    });
  }
}
```

### 6.3 性能考虑

- **事件委托**：使用事件委托而非每个元素绑定
- **防抖处理**：缩放、拖拽事件防抖 16ms
- **被动事件监听**：`{ passive: true }` 提升滚动性能
- **使用 CSS 变换**：硬件加速的 transform 优于布局属性

### 6.4 最佳实践

1. **即时反馈**：交互响应时间 < 100ms
2. **撤销支持**：复杂操作提供撤销功能
3. **状态持久化**：保存用户交互状态到 URL 或 localStorage
4. **触摸友好**：移动端手势支持（捏合缩放、双指平移）
5. **键盘可访问**：所有交互支持键盘操作

---

## 7. 地图可视化（Leaflet/Mapbox）

### 7.1 概念解释

地图可视化将地理数据转换为空间表示：

#### 地图投影类型

| 投影 | 特点 | 适用场景 |
|------|------|----------|
| Web Mercator | 正方形、保角 | Web 地图通用 |
| Albers | 等面积 | 统计地图 |
| Orthographic | 球面视角 | 全球数据展示 |

#### 地图可视化类型

- **Choropleth**：区域填充色表示数值
- **Dot Map**：点密度表示分布
- **Heatmap**：连续密度表面
- **Flow Map**：流向、连接关系

### 7.2 代码示例

```javascript
// Leaflet 基础地图
class LeafletMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.markers = [];
    this.heatLayer = null;

    this.init();
  }

  init() {
    // 初始化地图
    this.map = L.map(this.containerId, {
      center: this.options.center || [39.9042, 116.4074],
      zoom: this.options.zoom || 10,
      zoomControl: false,
      attributionControl: false
    });

    // 添加底图
    this.addBaseLayer();

    // 添加控件
    this.addControls();

    // 初始化图层组
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.geoJsonLayer = L.layerGroup().addTo(this.map);
  }

  addBaseLayer() {
    // OpenStreetMap 底图
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // 或使用 Mapbox
    // L.mapboxGL({
    //   accessToken: 'your_token',
    //   style: 'mapbox://styles/mapbox/light-v10'
    // }).addTo(this.map);
  }

  addControls() {
    // 缩放控件
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // 比例尺
    L.control.scale({ imperial: false }).addTo(this.map);

    // 搜索控件（需要插件）
    // L.Control.geocoder().addTo(this.map);
  }

  // 添加标记点
  addMarkers(data, options = {}) {
    const {
      latField = 'lat',
      lngField = 'lng',
      popupContent = (d) => `<b>${d.name}</b><br/>${d.description}`,
      iconOptions = {}
    } = options;

    data.forEach(item => {
      const marker = L.marker([item[latField], item[lngField]], {
        icon: this.createCustomIcon(item, iconOptions)
      });

      // 添加弹窗
      if (popupContent) {
        marker.bindPopup(popupContent(item), {
          maxWidth: 300,
          className: 'custom-popup'
        });
      }

      // 添加事件
      marker.on('click', () => {
        this.handleMarkerClick(item);
      });

      marker.on('mouseover', function() {
        this.openPopup();
      });

      marker.on('mouseout', function() {
        this.closePopup();
      });

      this.markerLayer.addLayer(marker);
      this.markers.push({ marker, data: item });
    });

    // 自适应边界
    if (data.length > 0) {
      const group = new L.featureGroup(this.markerLayer.getLayers());
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  createCustomIcon(data, options) {
    const { color = '#4CAF50', size = 25 } = options;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${data.value || ''}</div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  // 添加 GeoJSON 图层（Choropleth）
  addGeoJson(geoJsonData, valueField, options = {}) {
    const { colorScale = d3.scaleSequential(d3.interpolateBlues) } = options;

    // 计算值域
    const values = geoJsonData.features.map(f => f.properties[valueField]);
    const maxValue = Math.max(...values);
    colorScale.domain([0, maxValue]);

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature) => ({
        fillColor: colorScale(feature.properties[valueField]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 5,
              color: '#666',
              dashArray: '',
              fillOpacity: 0.9
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          },
          click: (e) => {
            this.map.fitBounds(e.target.getBounds());
            this.emit('regionClick', feature.properties);
          }
        });

        // 添加 tooltip
        const value = feature.properties[valueField];
        const name = feature.properties.name || '未知区域';
        layer.bindTooltip(`${name}: ${value}`, {
          permanent: false,
          direction: 'center'
        });
      }
    });

    this.geoJsonLayer.addLayer(geoJsonLayer);
    return geoJsonLayer;
  }

  // 添加热力图
  addHeatmap(data, options = {}) {
    const {
      latField = 'lat',
      lngField = 'lng',
      intensityField = 'intensity',
      radius = 25,
      blur = 15,
      maxZoom = 10
    } = options;

    // 需要引入 leaflet.heat 插件
    const heatData = data.map(item => [
      item[latField],
      item[lngField],
      item[intensityField] || 1
    ]);

    this.heatLayer = L.heatLayer(heatData, {
      radius,
      blur,
      maxZoom,
      max: 1.0,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(this.map);
  }

  // 添加流向线
  addFlowLines(flows, options = {}) {
    const {
      originLat = 'originLat',
      originLng = 'originLng',
      destLat = 'destLat',
      destLng = 'destLng',
      weightField = 'volume'
    } = options;

    const maxWeight = Math.max(...flows.map(f => f[weightField]));

    flows.forEach(flow => {
      const start = [flow[originLat], flow[originLng]];
      const end = [flow[destLat], flow[destLng]];
      const weight = flow[weightField];

      // 创建曲线
      const latlngs = this.createCurve(start, end);

      const polyline = L.polyline(latlngs, {
        color: '#FF5722',
        weight: (weight / maxWeight) * 10,
        opacity: 0.6,
        lineCap: 'round'
      }).addTo(this.map);

      // 添加箭头（使用插件）
      // L.polylineDecorator(polyline).addTo(this.map);
    });
  }

  createCurve(start, end) {
    // 简单的二次贝塞尔曲线
    const latlngs = [];
    const offsetX = (end[1] - start[1]) * 0.3;
    const control = [(start[0] + end[0]) / 2 + offsetX, (start[1] + end[1]) / 2];

    for (let t = 0; t <= 1; t += 0.05) {
      const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * control[0] + t * t * end[0];
      const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * control[1] + t * t * end[1];
      latlngs.push([lat, lng]);
    }

    return latlngs;
  }

  // 聚类标记
  addClusterMarkers(data) {
    // 需要引入 leaflet.markercluster 插件
    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-icon">${count}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(40, 40)
        });
      }
    });

    data.forEach(item => {
      const marker = L.marker([item.lat, item.lng]);
      marker.bindPopup(item.name);
      markers.addLayer(marker);
    });

    this.map.addLayer(markers);
  }

  clearLayers() {
    this.markerLayer.clearLayers();
    this.geoJsonLayer.clearLayers();
    this.markers = [];
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }
  }

  handleMarkerClick(data) {
    console.log('Marker clicked:', data);
    // 触发自定义事件
  }

  emit(eventName, data) {
    document.getElementById(this.containerId).dispatchEvent(
      new CustomEvent(eventName, { detail: data })
    );
  }

  destroy() {
    this.map.remove();
  }
}

// Mapbox GL JS 示例
class MapboxMap {
  constructor(containerId, accessToken) {
    mapboxgl.accessToken = accessToken;

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [116.4074, 39.9042],
      zoom: 10,
      pitch: 45,
      bearing: 0
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());
  }

  // 添加 3D 建筑
  add3DBuildings() {
    this.map.on('load', () => {
      this.map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      });
    });
  }

  // 添加数据层
  addDataLayer(geoJson, options = {}) {
    const sourceId = `source-${Date.now()}`;
    const layerId = `layer-${Date.now()}`;

    this.map.on('load', () => {
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geoJson
      });

      this.map.addLayer({
        id: layerId,
        type: options.type || 'circle',
        source: sourceId,
        paint: options.paint || {
          'circle-radius': 8,
          'circle-color': '#4CAF50',
          'circle-opacity': 0.7
        }
      });
    });
  }
}
```

### 7.3 性能考虑

- **瓦片缓存**：设置合理的 maxZoom 和缓存策略
- **标记聚类**：>500 个标记时使用聚类
- **按需加载**：视口外数据延迟加载
- **WebGL 加速**：Mapbox GL 比 Leaflet Canvas 性能更好

### 7.4 最佳实践

1. **选择合适的底图**：浅色底图更适合数据叠加
2. **颜色对比度**：确保数据层与底图有足够对比
3. **移动端优化**：触摸友好的控件尺寸
4. **离线支持**：关键瓦片预缓存
5. **坐标系一致**：所有数据使用 WGS84 (EPSG:4326)

---

## 8. 3D可视化（Three.js基础）

### 8.1 概念解释

3D 可视化增加深度维度展示复杂数据关系：

#### 核心概念

| 概念 | 说明 |
|------|------|
| Scene | 场景，所有 3D 对象的容器 |
| Camera | 相机，观察视角（Perspective/Orthographic）|
| Renderer | 渲染器，WebGL 渲染场景 |
| Geometry | 几何体，形状定义 |
| Material | 材质，表面外观 |
| Light | 光源，照明效果 |

### 8.2 代码示例

```javascript
// Three.js 基础 3D 可视化
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class DataVisualization3D {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];

    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.createVisualization();
    this.setupInteraction();
    this.animate();

    // 响应式处理
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // 添加雾效果（深度感）
    this.scene.fog = new THREE.Fog(0xf0f0f0, 200, 1000);
  }

  setupCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      width / height, // Aspect ratio
      0.1, // Near
      2000 // Far
    );

    this.camera.position.set(100, 100, 200);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 方向光（主光源）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // 点光源（补光）
    const pointLight = new THREE.PointLight(0x4CAF50, 0.5);
    pointLight.position.set(-100, 100, -100);
    this.scene.add(pointLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 500;

    // 限制垂直角度
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  createVisualization() {
    // 3D 柱状图（数据可视化）
    this.create3DBarChart();

    // 添加网格辅助
    this.createGrid();

    // 添加坐标轴
    this.createAxes();
  }

  create3DBarChart() {
    const maxValue = Math.max(...this.data.map(d => d.value));
    const barSize = 10;
    const gap = 5;

    this.data.forEach((item, index) => {
      const height = (item.value / maxValue) * 100;

      // 创建柱子几何体
      const geometry = new THREE.BoxGeometry(barSize, height, barSize);

      // 创建材质
      const color = new THREE.Color().setHSL(
        item.value / maxValue * 0.3, // Hue
        0.8, // Saturation
        0.5  // Lightness
      );

      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        specular: 0x111111
      });

      // 创建网格
      const bar = new THREE.Mesh(geometry, material);

      // 定位（底部对齐）
      const x = (index % 5) * (barSize + gap) - 50;
      const z = Math.floor(index / 5) * (barSize + gap) - 50;
      bar.position.set(x, height / 2, z);

      bar.castShadow = true;
      bar.receiveShadow = true;

      // 添加数据到对象
      bar.userData = item;

      this.scene.add(bar);
      this.objects.push(bar);

      // 添加数值标签（使用 Sprite）
      this.createLabel(item.value, x, height + 10, z);
    });
  }

  createLabel(text, x, y, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    context.font = 'Bold 24px Arial';
    context.fillStyle = '#333';
    context.textAlign = 'center';
    context.fillText(text.toString(), 64, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.set(x, y, z);
    sprite.scale.set(20, 10, 1);

    this.scene.add(sprite);
  }

  createGrid() {
    const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0xdddddd);
    this.scene.add(gridHelper);
  }

  createAxes() {
    const axesHelper = new THREE.AxesHelper(50);
    this.scene.add(axesHelper);
  }

  setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.objects);

      // 恢复之前悬停的对象
      if (hoveredObject && hoveredObject !== intersects[0]?.object) {
        hoveredObject.material.emissive.setHex(0x000000);
        hoveredObject.scale.set(1, 1, 1);
        hoveredObject = null;
        this.container.style.cursor = 'default';
      }

      // 处理新的悬停
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object !== hoveredObject) {
          hoveredObject = object;
          object.material.emissive.setHex(0x333333);
          object.scale.set(1.1, 1.1, 1.1);
          this.container.style.cursor = 'pointer';

          // 显示 tooltip
          this.showTooltip(event, object.userData);
        }
      }
    });

    this.renderer.domElement.addEventListener('click', (event) => {
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.objects);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        this.handleObjectClick(object.userData);
      }
    });
  }

  showTooltip(event, data) {
    // 实现 tooltip 显示逻辑
    console.log('Hover:', data);
  }

  handleObjectClick(data) {
    console.log('Click:', data);
    // 可以在这里添加动画效果
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    // 可选：添加旋转动画
    // this.scene.rotation.y += 0.001;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  // 添加粒子系统（用于散点可视化）
  addParticleSystem(points) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);

    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z || 0;

      const color = new THREE.Color();
      color.setHSL(0.6, 1.0, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = point.size || 5;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
  }

  destroy() {
    // 清理资源
    this.objects.forEach(obj => {
      obj.geometry.dispose();
      obj.material.dispose();
    });
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// 使用示例
const data3D = [
  { name: 'A', value: 80, category: 'group1' },
  { name: 'B', value: 45, category: 'group1' },
  { name: 'C', value: 65, category: 'group2' },
  { name: 'D', value: 90, category: 'group2' },
  { name: 'E', value: 30, category: 'group1' },
  { name: 'F', value: 55, category: 'group2' }
];

// const viz3D = new DataVisualization3D(
//   document.getElementById('container'),
//   data3D
// );
```

### 8.3 性能考虑

```javascript
// Three.js 性能优化

class Optimized3DChart {
  optimize() {
    // 1. 使用 InstancedMesh 批量渲染相同几何体
    this.createInstancedMesh();

    // 2. 启用 frustum culling（自动）
    this.scene.traverse(obj => {
      if (obj.isMesh) {
        obj.frustumCulled = true;
      }
    });

    // 3. 使用 LOD (Level of Detail)
    this.setupLOD();

    // 4. 限制像素比
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 5. 使用 requestAnimationFrame 节流
    this.throttledAnimate();
  }

  createInstancedMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });

    // 创建 1000 个实例
    const count = 1000;
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    this.scene.add(mesh);
  }

  setupLOD() {
    // 根据距离使用不同详细程度的模型
    const lod = new THREE.LOD();

    const geometryHigh = new THREE.BoxGeometry(10, 10, 10);
    const geometryLow = new THREE.BoxGeometry(5, 5, 5);

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    lod.addLevel(new THREE.Mesh(geometryHigh, material), 0);
    lod.addLevel(new THREE.Mesh(geometryLow, material), 100);

    this.scene.add(lod);
  }

  throttledAnimate() {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      requestAnimationFrame(animate);

      const delta = currentTime - lastTime;

      if (delta >= frameInterval) {
        lastTime = currentTime - (delta % frameInterval);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      }
    };

    requestAnimationFrame(animate);
  }
}
```

### 8.4 最佳实践

1. **合理设置近远平面**：避免深度精度问题
2. **纹理压缩**：使用 KTX2/Basis 压缩纹理
3. **阴影优化**：使用阴影贴图而非实时光影
4. **移动端降级**：检测性能并简化效果
5. **内存管理**：及时释放不再使用的几何体和材质

---

## 9. 实时数据可视化

### 9.1 概念解释

实时可视化展示持续更新的数据流，关键指标：

- **延迟**：从数据产生到展示的时间
- **吞吐量**：单位时间处理的数据点数
- **平滑性**：更新时的视觉连贯性

#### 架构模式

```
数据源 → 消息队列 → 处理引擎 → 前端 → 渲染
  ↓         ↓           ↓         ↓
 传感器   Kafka    聚合计算   WebSocket
  API     Redis    异常检测   Server-Sent Events
```

### 9.2 代码示例

```javascript
// 实时数据可视化
import { Chart } from 'chart.js';

class RealtimeChart {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId;
    this.maxPoints = options.maxPoints || 100;
    this.updateInterval = options.updateInterval || 1000;
    this.buffer = [];

    this.init();
  }

  init() {
    this.setupChart();
    this.setupWebSocket();
    this.startUpdateLoop();
  }

  setupChart() {
    const ctx = document.getElementById(this.canvasId).getContext('2d');

    // 渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.5)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '实时数据',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0, // 隐藏点以提高性能
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // 禁用动画以提高性能
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            type: 'category',
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              maxRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          }
        }
      }
    });
  }

  setupWebSocket() {
    // 模拟 WebSocket 连接
    this.ws = {
      onmessage: null,
      send: () => {},
      close: () => {}
    };

    // 模拟数据流
    this.simulateDataStream();

    // 真实 WebSocket 实现
    // this.ws = new WebSocket('wss://your-server.com/data');
    // this.ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   this.addDataPoint(data);
    // };
  }

  simulateDataStream() {
    let value = 50;

    setInterval(() => {
      // 生成随机游走数据
      value += (Math.random() - 0.5) * 10;
      value = Math.max(0, Math.min(100, value));

      const dataPoint = {
        timestamp: new Date(),
        value: value
      };

      this.buffer.push(dataPoint);
    }, this.updateInterval / 2);
  }

  startUpdateLoop() {
    // 使用 requestAnimationFrame 批量更新
    let lastUpdate = 0;
    const updateDelay = 100; // 100ms 更新一次

    const loop = (timestamp) => {
      if (timestamp - lastUpdate >= updateDelay) {
        this.flushBuffer();
        lastUpdate = timestamp;
      }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  flushBuffer() {
    if (this.buffer.length === 0) return;

    // 批量处理缓冲数据
    this.buffer.forEach(point => this.processDataPoint(point));
    this.buffer = [];

    // 限制数据点数量
    const data = this.chart.data;
    while (data.labels.length > this.maxPoints) {
      data.labels.shift();
      data.datasets[0].data.shift();
    }

    // 批量更新图表
    this.chart.update('none');
  }

  processDataPoint(point) {
    const timeLabel = point.timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.chart.data.labels.push(timeLabel);
    this.chart.data.datasets[0].data.push(point.value);
  }

  addDataPoint(value, label) {
    this.buffer.push({ value, timestamp: new Date() });
  }

  // 暂停/恢复
  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  // 清空数据
  clear() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.update();
  }

  destroy() {
    this.ws.close();
    this.chart.destroy();
  }
}

// D3.js 实时流图
class RealtimeStreamGraph {
  constructor(container, options) {
    this.container = d3.select(container);
    this.options = options;
    this.data = [];
    this.maxLength = options.maxLength || 50;

    this.init();
  }

  init() {
    this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.svg = this.container.append('svg')
      .attr('viewBox', `0 0 800 400`);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    this.line = d3.line()
      .x((d, i) => this.x(i))
      .y(d => this.y(d))
      .curve(d3.curveMonotoneX);

    this.path = this.g.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);

    this.xAxis = this.g.append('g')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.g.append('g');
  }

  push(value) {
    this.data.push(value);

    if (this.data.length > this.maxLength) {
      this.data.shift();
    }

    this.update();
  }

  update() {
    this.x.domain([0, this.data.length - 1]);
    this.y.domain(d3.extent(this.data));

    // 平滑过渡
    this.path.datum(this.data)
      .transition()
      .duration(100)
      .ease(d3.easeLinear)
      .attr('d', this.line);

    this.xAxis.call(d3.axisBottom(this.x).ticks(5));
    this.yAxis.call(d3.axisLeft(this.y));
  }
}

// 性能监控仪表板
class PerformanceDashboard {
  constructor(containers) {
    this.metrics = {
      cpu: new RealtimeChart(containers.cpu, { maxPoints: 60, updateInterval: 1000 }),
      memory: new RealtimeChart(containers.memory, { maxPoints: 60, updateInterval: 1000 }),
      network: new RealtimeChart(containers.network, { maxPoints: 60, updateInterval: 1000 })
    };

    this.startMonitoring();
  }

  startMonitoring() {
    // 模拟系统监控
    setInterval(() => {
      // CPU 使用率
      this.metrics.cpu.addDataPoint(Math.random() * 100);

      // 内存使用
      this.metrics.memory.addDataPoint(Math.random() * 16);

      // 网络流量
      this.metrics.network.addDataPoint(Math.random() * 1000);
    }, 1000);
  }
}

// 服务器推送事件 (SSE) 实现
class SSEDataSource {
  constructor(url, onData) {
    this.url = url;
    this.onData = onData;
    this.connect();
  }

  connect() {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onData(data);
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // 自动重连
      setTimeout(() => this.connect(), 5000);
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

### 9.3 性能考虑

- **批量更新**：合并多次数据更新为一次渲染
- **数据降采样**：高频数据智能降采样
- **Web Workers**：数据处理移至后台线程
- **连接池管理**：WebSocket 连接复用

### 9.4 最佳实践

1. **防抖更新**：渲染频率限制在 30fps
2. **数据归档**：历史数据自动归档，保持活跃数据集小巧
3. **连接降级**：WebSocket 不可用时降级到轮询
4. **错误恢复**：断线自动重连，数据补全机制
5. **内存监控**：设置数据点上限，防止内存泄漏

---

## 10. 可访问性（A11y）在可视化中

### 10.1 概念解释

数据可视化可访问性确保所有用户（包括使用辅助技术的用户）都能获取信息：

#### 障碍类型与解决方案

| 障碍类型 | 影响 | 解决方案 |
|----------|------|----------|
| 视觉（低视力） | 无法看清图表 | 高对比度、放大支持 |
| 视觉（色盲） | 颜色信息丢失 | 纹理、形状、标签 |
| 视觉（全盲） | 无法看到图表 | 屏幕阅读器、数据表 |
| 运动 | 无法精确操作 | 键盘导航、语音控制 |
| 认知 | 复杂图表难理解 | 简化、说明文字 |

### 10.2 代码示例

```javascript
// 可访问性增强的图表组件
class AccessibleChart {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;

    this.init();
  }

  init() {
    this.setupContainer();
    this.createChart();
    this.addAccessibilityFeatures();
  }

  setupContainer() {
    // 创建带有 ARIA 属性的容器
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'accessible-chart';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', this.config.title || '数据图表');

    // 添加描述
    if (this.config.description) {
      const desc = document.createElement('p');
      desc.id = `${this.chartId}-desc`;
      desc.className = 'sr-only'; // 仅屏幕阅读器可见
      desc.textContent = this.config.description;
      this.wrapper.appendChild(desc);

      this.wrapper.setAttribute('aria-describedby', `${this.chartId}-desc`);
    }
  }

  createChart() {
    const canvas = document.createElement('canvas');
    canvas.id = this.chartId;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', this.generateAltText());

    this.wrapper.appendChild(canvas);
    this.container.appendChild(this.wrapper);

    // Chart.js 配置
    this.chart = new Chart(canvas.getContext('2d'), {
      type: this.config.type || 'bar',
      data: this.config.data,
      options: {
        responsive: true,
        ...this.config.options,
        plugins: {
          ...this.config.options?.plugins,
          // 确保图例可访问
          legend: {
            display: true,
            onClick: (e, legendItem, legend) => {
              // 添加键盘支持
              this.handleLegendClick(e, legendItem, legend);
            },
            labels: {
              generateLabels: (chart) => {
                return chart.data.datasets.map((dataset, i) => ({
                  text: dataset.label,
                  fillStyle: dataset.backgroundColor,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i
                }));
              }
            }
          }
        }
      },
      plugins: [this.accessibilityPlugin()]
    });
  }

  accessibilityPlugin() {
    return {
      id: 'accessibility',
      afterRender: (chart) => {
        this.addKeyboardNavigation(chart);
        this.addScreenReaderTable(chart);
      }
    };
  }

  addKeyboardNavigation(chart) {
    const canvas = chart.canvas;
    canvas.setAttribute('tabindex', '0');

    let focusedIndex = -1;
    const dataLength = chart.data.labels.length;

    canvas.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          focusedIndex = Math.min(focusedIndex + 1, dataLength - 1);
          this.focusDataPoint(chart, focusedIndex);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          focusedIndex = Math.max(focusedIndex - 1, 0);
          this.focusDataPoint(chart, focusedIndex);
          break;
        case 'Home':
          e.preventDefault();
          focusedIndex = 0;
          this.focusDataPoint(chart, focusedIndex);
          break;
        case 'End':
          e.preventDefault();
          focusedIndex = dataLength - 1;
          this.focusDataPoint(chart, focusedIndex);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            this.activateDataPoint(chart, focusedIndex);
          }
          break;
      }
    });
  }

  focusDataPoint(chart, index) {
    // 高亮当前数据点
    chart.setActiveElements([
      { datasetIndex: 0, index: index }
    ]);
    chart.update('none');

    // 更新 ARIA 描述
    const label = chart.data.labels[index];
    const value = chart.data.datasets[0].data[index];
    chart.canvas.setAttribute('aria-label',
      `${label}: ${value}. 使用方向键浏览数据。`
    );
  }

  activateDataPoint(chart, index) {
    // 触发点击事件
    const meta = chart.getDatasetMeta(0);
    const rect = chart.canvas.getBoundingClientRect();
    const point = meta.data[index];

    // 触发自定义事件
    chart.canvas.dispatchEvent(new CustomEvent('chartClick', {
      detail: {
        index: index,
        label: chart.data.labels[index],
        value: chart.data.datasets[0].data[index]
      }
    }));
  }

  addScreenReaderTable(chart) {
    // 创建数据表格供屏幕阅读器访问
    const table = document.createElement('table');
    table.className = 'sr-only';
    table.setAttribute('aria-label', `${this.config.title} - 数据表`);

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const labelHeader = document.createElement('th');
    labelHeader.textContent = '类别';
    const valueHeader = document.createElement('th');
    valueHeader.textContent = '数值';
    headerRow.appendChild(labelHeader);
    headerRow.appendChild(valueHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    chart.data.labels.forEach((label, i) => {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = label;
      const valueCell = document.createElement('td');
      valueCell.textContent = chart.data.datasets[0].data[i];
      row.appendChild(labelCell);
      row.appendChild(valueCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    this.wrapper.appendChild(table);
  }

  generateAltText() {
    const data = this.config.data;
    const labels = data.labels.slice(0, 5); // 前5个数据点
    const values = data.datasets[0].data.slice(0, 5);

    let altText = `${this.config.title || '图表'}显示：`;
    labels.forEach((label, i) => {
      altText += `${label}为${values[i]}${i < labels.length - 1 ? '，' : ''}`;
    });

    if (data.labels.length > 5) {
      altText += `等共${data.labels.length}个数据点。`;
    }

    return altText;
  }

  // 高对比度模式支持
  setHighContrast(enabled) {
    const colors = enabled ? {
      background: '#000000',
      text: '#FFFFFF',
      grid: '#FFFFFF',
      dataset1: '#FFFF00',
      dataset2: '#00FFFF'
    } : {
      background: '#FFFFFF',
      text: '#333333',
      grid: '#CCCCCC',
      dataset1: '#4CAF50',
      dataset2: '#2196F3'
    };

    this.chart.options.scales.x.grid.color = colors.grid;
    this.chart.options.scales.y.grid.color = colors.grid;
    this.chart.options.color = colors.text;

    this.chart.data.datasets.forEach((dataset, i) => {
      dataset.backgroundColor = i === 0 ? colors.dataset1 : colors.dataset2;
      dataset.borderColor = i === 0 ? colors.dataset1 : colors.dataset2;
    });

    this.chart.update();
  }
}

// D3.js 可访问性增强
class AccessibleD3Chart {
  addAccessibility(svg, data, config) {
    // 添加标题
    svg.append('title')
      .text(config.title);

    // 添加描述
    svg.append('desc')
      .text(config.description);

    // 添加 ARIA 角色
    svg.attr('role', 'img')
       .attr('aria-labelledby', 'chart-title chart-desc');

    // 为每个元素添加焦点支持
    svg.selectAll('.bar')
      .attr('tabindex', 0)
      .attr('role', 'graphics-symbol')
      .attr('aria-label', d => `${d.label}: ${d.value}`)
      .on('keydown', function(event, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // 处理点击
        }
      });

    // 添加视觉焦点指示器
    svg.selectAll('.bar')
      .on('focus', function() {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);
      })
      .on('blur', function() {
        d3.select(this)
          .attr('stroke', 'none');
      });
  }
}

// 色盲友好配色方案
const colorBlindSafePalettes = {
  // 适用于色盲用户的配色
  categorical: [
    '#1f77b4', // 蓝色
    '#ff7f0e', // 橙色
    '#2ca02c', // 绿色
    '#d62728', // 红色
    '#9467bd', // 紫色
    '#8c564b', // 棕色
    '#e377c2', // 粉色
    '#7f7f7f'  // 灰色
  ],
  // 同时使用颜色和图案
  patterns: [
    { color: '#1f77b4', pattern: 'solid' },
    { color: '#ff7f0e', pattern: 'striped' },
    { color: '#2ca02c', pattern: 'dotted' },
    { color: '#d62728', pattern: 'crosshatch' }
  ]
};
```

### 10.3 CSS 辅助类

```css
/* 仅屏幕阅读器可见 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 焦点可见 */
.chart-canvas:focus {
  outline: 3px solid #4CAF50;
  outline-offset: 2px;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .chart-bar {
    stroke: currentColor;
    stroke-width: 2px;
  }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .chart-transition {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .chart-container {
    page-break-inside: avoid;
  }
}
```

### 10.4 性能考虑

- **延迟加载辅助元素**：表格数据按需生成
- **避免重复属性**：使用 ID 引用减少冗余
- **CSS 隐藏优于 display:none**：某些辅助技术会忽略 display:none 内容

### 10.5 最佳实践

1. **提供替代文本**：每个图表都有有意义的 `aria-label`
2. **键盘完全可访问**：所有交互可通过键盘完成
3. **颜色不是唯一线索**：结合形状、纹理、标签
4. **测试屏幕阅读器**：使用 NVDA、JAWS、VoiceOver 测试
5. **WCAG 2.1 AA 合规**：对比度 4.5:1，支持 200% 缩放

---

## 附录

### 推荐工具库

| 用途 | 推荐库 |
|------|--------|
| 通用图表 | Chart.js, ECharts |
| 自定义可视化 | D3.js |
| 地图 | Leaflet, Mapbox GL |
| 3D 可视化 | Three.js, deck.gl |
| 实时数据 | WebSocket, Server-Sent Events |
| 数据表格 | AG-Grid, DataTables |

### 学习资源

- [D3.js 官方文档](https://d3js.org/)
- [Chart.js 文档](https://www.chartjs.org/)
- [Three.js 教程](https://threejs.org/manual/)
- [Leaflet 教程](https://leafletjs.com/examples.html)
- [数据可视化目录](https://datavizcatalogue.com/)

### 浏览器兼容性

| 技术 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| SVG | ✅ | ✅ | ✅ | ✅ |
| Canvas 2D | ✅ | ✅ | ✅ | ✅ |
| WebGL | ✅ | ✅ | ✅ | ✅ |
| ResizeObserver | ✅ | ✅ | ✅ | ✅ |

---

*本文档持续更新，欢迎贡献改进建议。*

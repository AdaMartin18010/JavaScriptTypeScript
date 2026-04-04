# 数据可视化 (Data Visualization)

> 数据可视化是 JavaScript 生态中最成熟、最丰富的领域之一。从底层图形引擎到高层图表库，从2D到3D，从通用到专业领域，都有优秀解决方案。

---

## 📊 分类概览

| 类别 | 代表库 | 适用场景 |
|------|--------|----------|
| 底层可视化引擎 | D3.js, Observable Plot, Vega | 高度自定义、复杂交互 |
| 图表库 | ECharts, Chart.js, Recharts | 快速开发、常见图表 |
| 3D 可视化 | Three.js, Babylon.js, Cesium | 3D图形、游戏、地理空间 |
| 地图可视化 | Leaflet, Mapbox, Deck.gl | GIS、位置数据 |
| 特定领域 | visx, react-flow, Mermaid | 专业场景、流程图 |

---

## 1. 底层可视化引擎

> 提供最大灵活性，适合构建高度自定义的可视化组件

### D3.js ⭐108k

**数据驱动文档 (Data-Driven Documents)** - 灵活性最高的可视化库

| 属性 | 详情 |
|------|------|
| **Stars** | 108k+ |
| **TypeScript** | ✅ @types/d3 完善 |
| **维护状态** | 活跃 (v7.x) |
| **GitHub** | [d3/d3](https://github.com/d3/d3) |
| **官网** | [d3js.org](https://d3js.org/) |

**核心模块体系**

```
d3
├── d3-selection      # DOM 选择与数据绑定 ⭐核心
├── d3-scale          # 数据到视觉属性的映射 (线性/序数/时间等)
├── d3-shape          # 图形生成器 (线、面积、弧、饼等)
├── d3-transition     # 动画过渡
├── d3-axis           # 坐标轴
├── d3-zoom           # 缩放与平移
├── d3-drag           # 拖拽交互
├── d3-geo            # 地理投影
├── d3-hierarchy      # 层级布局 (树、打包、分区等)
├── d3-force          # 物理仿真 (力导向图)
├── d3-time/d3-time-format  # 时间处理
├── d3-fetch          # 数据加载 (CSV, JSON等)
└── d3-array          # 数组工具 (统计、分箱等)
```

**D3 v7 重要特性**

- **原生 ES Modules**: 更好的 Tree-shaking 支持
- **Promise 化**: `d3.csv()` 等返回 Promise，支持 async/await
- **改进的 d3-selection**: 性能优化
- **d3.group/d3.rollup**: 更强大的数据聚合
- **现代 JS 语法**: 内部使用更现代的 JavaScript

**与 React/Vue 集成方案**

| 方案 | 说明 | 推荐度 |
|------|------|--------|
| **useD3 hook** | 在 useEffect 中使用 D3 操作 DOM | ⭐⭐⭐ |
| **react-d3-library** | 包装 D3 组件 | ⭐⭐ |
| **D3 计算 + React 渲染** | D3 负责 scale/ shape，React 负责 DOM | ⭐⭐⭐⭐⭐ |
| **visx** | Airbnb 的 D3 + React 封装 | ⭐⭐⭐⭐⭐ |

```tsx
// 推荐：D3 计算 + React 渲染
import { scaleLinear, line } from 'd3';

function LineChart({ data }) {
  const xScale = scaleLinear().domain([0, 100]).range([0, 500]);
  const yScale = scaleLinear().domain([0, 100]).range([300, 0]);
  const lineGenerator = line().x(d => xScale(d.x)).y(d => yScale(d.y));
  
  return <path d={lineGenerator(data)} fill="none" stroke="steelblue" />;
}
```

**最佳适用场景**
- 高度自定义的数据可视化
- 复杂交互需求（缩放、拖拽、刷选）
- 实时数据流可视化
- 创新的可视化形式

**学习曲线**: 🔴🔴🔴🔴🔴 (陡峭，但回报巨大)

---

### Observable Plot ⭐5k

**D3 团队官方高层 API** - 声明式、约定优于配置

| 属性 | 详情 |
|------|------|
| **Stars** | 5k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (D3 团队官方) |
| **GitHub** | [observablehq/plot](https://github.com/observablehq/plot) |
| **官网** | [observablehq.com/plot](https://observablehq.com/plot/) |

**核心特性**
- 基于 D3，但隐藏复杂性
- 自动推断 scale、axes、legends
- 内置统计变换 (bin, group, regression等)
- 与 Observable Notebook 原生集成

```js
import * as Plot from "@observablehq/plot";

Plot.plot({
  marks: [
    Plot.dot(data, {x: "weight", y: "height", fill: "sex"})
  ]
});
```

**最佳适用场景**
- 快速探索性数据分析
- 标准统计图表
- Observable Notebook 用户

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### Vega / Vega-Lite ⭐12k

**声明式可视化语法** - JSON 定义可视化

| 属性 | 详情 |
|------|------|
| **Stars** | 12k+ (vega/vega-lite) |
| **TypeScript** | ✅ vega-typings |
| **维护状态** | 活跃 (UW 数据实验室) |
| **GitHub** | [vega/vega](https://github.com/vega/vega) |
| **官网** | [vega.github.io](https://vega.github.io/) |

**架构层次**

```
Vega-Lite (高层)     → 简洁 JSON，快速开发
    ↓ 编译
Vega (完整语法)      → 复杂交互，完全控制
    ↓ 渲染
D3 + Canvas/SVG      → 最终输出
```

**Vega-Lite 示例**

```json
{
  "data": {"url": "data/cars.json"},
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
    "color": {"field": "Origin", "type": "nominal"}
  }
}
```

**生态系统**
- **Vega-Embed**: 在网页中嵌入 Vega/Vega-Lite
- **Altair**: Python 绑定（极流行）
- **Voyager**: 可视化推荐工具

**最佳适用场景**
- 跨语言可视化（JSON 规范）
- 需要序列化/存储图表定义
- 数据 journalists
- 统计可视化

**学习曲线**: 🟡🟡🟡⚪⚪ (中高)

---

## 2. 图表库 (高易用性)

> 开箱即用，适合常见图表场景

### Apache ECharts ⭐62k

**百度开源** - 中文生态最完善的企业级图表库

| 属性 | 详情 |
|------|------|
| **Stars** | 62k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (Apache 基金会) |
| **GitHub** | [apache/echarts](https://github.com/apache/echarts) |
| **官网** | [echarts.apache.org](https://echarts.apache.org/zh/index.html) |

**核心特性**

| 特性 | 说明 |
|------|------|
| **渲染模式** | Canvas (默认) / SVG 可切换 |
| **图表类型** | 30+ 种内置图表 |
| **性能** | 千万级数据渲染 (借助 DataZoom) |
| **坐标系** | 笛卡尔、极坐标、地理、雷达等 |
| **扩展** | GL 扩展 (WebGL 3D)、词云、水球图 |

**常用图表类型**

```javascript
// 基础图表
bar, line, pie, scatter, radar, funnel, gauge

// 高级图表
tree, treemap, sunburst, sankey, graph (关系图)
heatmap, candlestick (K线), map (地图)

// 3D 图表 (GL 扩展)
bar3D, line3D, surface, scatter3D
```

**ECharts 5 新特性**
- 状态动画 (Universal Transition)
- 标签布局优化
- 性能大幅提升
- TypeScript 重写

**React/Vue 集成**
- **echarts-for-react** ⭐5k
- **vue-echarts** ⭐9k

```tsx
import ReactECharts from 'echarts-for-react';

const option = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'bar' }]
};

<ReactECharts option={option} style={{ height: 400 }} />
```

**最佳适用场景**
- 企业级后台管理系统
- 大屏数据可视化
- 需要丰富中文文档支持
- 复杂交互图表（数据缩放、刷选）

**学习曲线**: 🟡🟡⚪⚪⚪ (中等，文档友好)

---

### Chart.js ⭐65k

**简单易用** - Canvas 渲染的开源图表库

| 属性 | 详情 |
|------|------|
| **Stars** | 65k+ |
| **TypeScript** | ✅ @types/chart.js / chartjs-typescript |
| **维护状态** | 活跃 (v4.x) |
| **GitHub** | [chartjs/Chart.js](https://github.com/chartjs/Chart.js) |
| **官网** | [chartjs.org](https://www.chartjs.org/) |

**核心特性**
- 简洁的 API 设计
- 响应式，自动调整大小
- 8种内置图表类型
- 插件生态系统

**图表类型**

```javascript
bar, line, area, pie, doughnut, radar, polarArea, bubble, scatter
```

```javascript
const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3],
      backgroundColor: ['red', 'blue', 'yellow']
    }]
  }
});
```

**最佳适用场景**
- 简单图表需求
- 快速原型开发
- 移动端优先项目
- 对包大小敏感

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

### Recharts ⭐23k

**React 专属** - 声明式图表组件

| 属性 | 详情 |
|------|------|
| **Stars** | 23k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [recharts/recharts](https://github.com/recharts/recharts) |
| **官网** | [recharts.org](https://recharts.org/) |

**核心特性**
- 纯 React 组件，声明式 API
- 基于 D3 计算，React 渲染
- SVG 支持
- 可组合性强

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const data = [{name: 'A', value: 400}, {name: 'B', value: 300}];

<LineChart width={600} height={300} data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

**最佳适用场景**
- React 项目
- 需要与 React 生命周期深度集成
- 自定义组件样式

**学习曲线**: 🟡⚪⚪⚪⚪ (简单到中等)

---

### Victory ⭐11k

**React 专属** - 动画丰富的图表库

| 属性 | 详情 |
|------|------|
| **Stars** | 11k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 (Formidable Labs) |
| **GitHub** | [FormidableLabs/victory](https://github.com/FormidableLabs/victory) |
| **官网** | [formidable.com/open-source/victory](https://formidable.com/open-source/victory/) |

**核心特性**
- 跨平台 (Web + React Native)
- 强大的动画系统
- 声明式风格

**最佳适用场景**
- React Native 图表需求
- 需要丰富动画效果

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### Nivo ⭐14k

**React + D3** - 基于 D3 的现代 React 组件库

| 属性 | 详情 |
|------|------|
| **Stars** | 14k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [plouc/nivo](https://github.com/plouc/nivo) |
| **官网** | [nivo.rocks](https://nivo.rocks/) |

**核心特性**
- 60+ 种图表组件
- 服务端渲染支持
- 主题系统
- 响应式设计

**图表分类**
```
Bar, Line, Area, Pie
Tree, Sankey, Sunburst, Treemap
Calendar, Radar, Scatter
Network, Heatmap, Bullet
```

```tsx
import { ResponsivePie } from '@nivo/pie';

<ResponsivePie
  data={[{ id: 'lisp', value: 500 }, { id: 'js', value: 900 }]}
  margin={{ top: 40, right: 80 }}
  innerRadius={0.5}
  padAngle={0.7}
/>
```

**最佳适用场景**
- React + D3 结合需求
- 现代化设计需求
- 服务端渲染

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### React-Vis ⭐9k

**Uber 开源** - 企业级 React 图表库

| 属性 | 详情 |
|------|------|
| **Stars** | 9k+ |
| **TypeScript** | ⚠️ 社区类型定义 |
| **维护状态** | 维护模式 (更新较少) |
| **GitHub** | [uber/react-vis](https://github.com/uber/react-vis) |
| **官网** | [uber.github.io/react-vis](https://uber.github.io/react-vis/) |

**核心特性**
- 简单统一的 API
- 支持 Canvas 和 SVG

**⚠️ 注意**: 项目更新频率降低，新项目建议考虑 Recharts 或 Nivo

---

## 3. 3D 可视化

> WebGL 驱动的三维图形渲染

### Three.js ⭐105k

**WebGL 3D 图形之王** - 最广泛使用的 3D 库

| 属性 | 详情 |
|------|------|
| **Stars** | 105k+ |
| **TypeScript** | ✅ @types/three 完善 |
| **维护状态** | 活跃 |
| **GitHub** | [mrdoob/three.js](https://github.com/mrdoob/three.js) |
| **官网** | [threejs.org](https://threejs.org/) |

**核心模块**

```javascript
three
├── Core (Scene, Camera, Renderer)
├── Geometries (Box, Sphere, Plane, Custom)
├── Materials (MeshBasic, MeshPhong, ShaderMaterial)
├── Lights (Ambient, Directional, Point, Spot)
├── Loaders (GLTF, OBJ, FBX, Texture)
├── Controls (OrbitControls, FlyControls)
└── Post-Processing (Bloom, DOF, FXAA)
```

**渲染器对比**

| 渲染器 | 用途 | 性能 |
|--------|------|------|
| WebGLRenderer | 标准 3D 渲染 | 高 |
| WebGL1Renderer | 兼容旧设备 | 中 |
| CSS3DRenderer | DOM 元素的 3D 变换 | 视内容而定 |
| SVGRenderer | 矢量 3D 输出 | 低 |

**现代工作流 (Three.js Journey 推荐)**

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// 几何体 + 材质 = 网格
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 光照
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  renderer.render(scene, camera);
}
animate();
```

**React/Vue 集成**

| 方案 | 说明 | GitHub |
|------|------|--------|
| **React Three Fiber** ⭐30k | React 的 Three.js 渲染器 | pmndrs/react-three-fiber |
| **Vue Three** | Vue 3 + Three.js 组合式 API | - |
| **TresJS** ⭐4k | Vue 的 Three.js 解决方案 | tresjs/tres |

```tsx
// React Three Fiber
import { Canvas } from '@react-three/fiber';

<Canvas>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
  <ambientLight intensity={0.5} />
</Canvas>
```

**最佳适用场景**
- 3D 数据可视化
- 产品展示/配置器
- 游戏开发
- 艺术与创意编程
- 建筑可视化

**学习曲线**: 🔴🔴🔴🔴⚪ (较陡峭)

---

### Babylon.js ⭐23k

**游戏引擎级 3D** - 功能最完整的 WebGL 引擎

| 属性 | 详情 |
|------|------|
| **Stars** | 23k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) |
| **官网** | [babylonjs.com](https://www.babylonjs.com/) |

**核心特性**
- 完整的游戏引擎功能
- 物理引擎集成 (Cannon.js, Ammo.js)
- 粒子系统
- GUI 系统
- WebXR 支持
- Playground 在线编辑器

**vs Three.js**

| 特性 | Babylon.js | Three.js |
|------|------------|----------|
| 定位 | 游戏引擎 | 3D 图形库 |
| 上手难度 | 较高 | 中等 |
| 内置功能 | 丰富 | 精简 |
| 社区资源 | 活跃 | 更大 |
| 包体积 | 较大 | 较小 |

**最佳适用场景**
- 3D 游戏开发
- 复杂交互 3D 应用
- 需要内置物理引擎
- WebXR/VR 应用

**学习曲线**: 🔴🔴🔴🔴⚪ (较陡峭)

---

### Cesium ⭐13k

**地理空间 3D** - 全球 3D 地图引擎

| 属性 | 详情 |
|------|------|
| **Stars** | 13k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [CesiumGS/cesium](https://github.com/CesiumGS/cesium) |
| **官网** | [cesium.com](https://cesium.com/) |

**核心特性**
- 全球地形和影像
- 3D Tiles 标准
- 时间动态可视化
- KML/GeoJSON/CZML 支持

**最佳适用场景**
- 数字孪生城市
- 航空航天可视化
- 地理空间分析
- 卫星数据可视化

**学习曲线**: 🔴🔴🔴🔴⚪ (较陡峭)

---

### LumaGL

**WebGL2 框架** - Uber 开源的底层 WebGL 封装

| 属性 | 详情 |
|------|------|
| **GitHub** | [visgl/luma.gl](https://github.com/visgl/luma.gl) |
| **TypeScript** | ✅ 原生支持 |

**定位**
- deck.gl 的底层依赖
- 高性能 GPU 计算
- 现代 WebGL2 特性

---

## 4. 地图可视化

> 地理位置数据的可视化表达

### Leaflet ⭐41k

**轻量地图库** - 最流行的开源交互式地图

| 属性 | 详情 |
|------|------|
| **Stars** | 41k+ |
| **TypeScript** | ✅ @types/leaflet |
| **维护状态** | 活跃 (v1.9+) |
| **GitHub** | [Leaflet/Leaflet](https://github.com/Leaflet/Leaflet) |
| **官网** | [leafletjs.com](https://leafletjs.com/) |

**核心特性**
- 极简 API 设计
- 38KB 完整包
- 丰富的插件生态
- 移动端友好

```javascript
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
  .bindPopup('A pretty CSS popup.')
  .openPopup();
```

**常用插件**

| 插件 | 用途 |
|------|------|
| Leaflet.markercluster | 标记聚合 |
| Leaflet.draw | 绘制工具 |
| Leaflet.heat | 热力图 |
| Leaflet-routing-machine | 路线规划 |

**最佳适用场景**
- 简单地图展示
- 标记点/区域展示
- 移动优先的地图应用
- 快速原型开发

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

### Mapbox GL JS ⭐11k

**矢量地图** - 高性能矢量切片地图

| 属性 | 详情 |
|------|------|
| **Stars** | 11k+ |
| **TypeScript** | ✅ mapbox-gl-types |
| **维护状态** | 活跃 (Mapbox 公司) |
| **GitHub** | [mapbox/mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) |
| **官网** | [docs.mapbox.com](https://docs.mapbox.com/mapbox-gl-js/) |

**核心特性**
- 矢量切片渲染
- 流畅的缩放/旋转
- 自定义地图样式 (Mapbox Studio)
- WebGL 加速

**⚠️ 许可变更**: v2.0+ 需要 Mapbox 账号和 token

**开源替代**: **MapLibre GL JS** (Mapbox v1.x 分支)

**最佳适用场景**
- 自定义地图样式
- 高性能矢量地图
- 3D 地形可视化

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### Deck.gl ⭐12k

**大规模数据可视化** - Uber 开源的 WebGL 图层框架

| 属性 | 详情 |
|------|------|
| **Stars** | 12k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [visgl/deck.gl](https://github.com/visgl/deck.gl) |
| **官网** | [deck.gl](https://deck.gl/) |

**核心特性**
- 百万级数据点渲染
- 多层叠加架构
- 与 Mapbox/Google Maps 集成
- GPU 驱动的可视化

**图层类型**

```javascript
// 核心图层
ScatterplotLayer, LineLayer, PolygonLayer
ArcLayer, HeatmapLayer, HexagonLayer, GridLayer

// 高级图层
GeoJsonLayer, TextLayer, IconLayer
TerrainLayer, Tile3DLayer
```

```javascript
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

new Deck({
  initialViewState: { longitude: -122.4, latitude: 37.8, zoom: 10 },
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [{ position: [-122.4, 37.8], color: [255, 0, 0], radius: 100 }],
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius
    })
  ]
});
```

**React 集成**

```tsx
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';

<DeckGL
  initialViewState={{ longitude: -122.4, latitude: 37.8, zoom: 10 }}
  controller={true}
  layers={[new ScatterplotLayer({ data, getPosition: d => d.position })]}
/>
```

**最佳适用场景**
- 大规模地理数据可视化
- 时空数据分析
- 与 React 深度集成
- 需要高性能 GPU 渲染

**学习曲线**: 🔴🔴🔴⚪⚪ (中高)

---

### kepler.gl ⭐10k

**地理空间分析工具** - Uber 开源的地理数据可视化平台

| 属性 | 详情 |
|------|------|
| **Stars** | 10k+ |
| **TypeScript** | ⚠️ 部分支持 |
| **维护状态** | 活跃 |
| **GitHub** | [keplergl/kepler.gl](https://github.com/keplergl/kepler.gl) |
| **官网** | [kepler.gl](https://kepler.gl/) |

**核心特性**
- 零代码可视化配置
- 支持 CSV/JSON/GeoJSON
- 时间轴动画
- 多层可视化
- 可导出为 React 组件

**最佳适用场景**
- 地理数据探索
- 数据分析师
- 快速生成可视化原型

**学习曲线**: 🟢⚪⚪⚪⚪ (简单，主要为 UI 操作)

---

## 5. 特定领域可视化

> 针对特定场景的专用可视化方案

### visx ⭐17k

**Airbnb 可视化** - 低层可视化组件集合

| 属性 | 详情 |
|------|------|
| **Stars** | 17k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [airbnb/visx](https://github.com/airbnb/visx) |
| **官网** | [airbnb.io/visx](https://airbnb.io/visx/) |

**设计理念**
- "Un-opinionated" - 不强制样式
- D3 计算 + React 渲染
- 可组合的底层组件
- 类似构建块，自由组合

**包结构**

```
@visx/xychart      # 高级图表组件
@visx/shape        # 图形 (Bar, Line, Area, Pie)
@visx/scale        # D3 scale 封装
@visx/axis         # 坐标轴
@visx/tooltip      # 提示框
@visx/legend       # 图例
@visx/annotation   # 注释
@visx/grid         # 网格
@visx/responsive   # 响应式
```

```tsx
import { scaleLinear, scaleBand } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

// visx 提供基础组件，样式完全自定义
<Group>
  {data.map(d => (
    <Bar
      key={d.label}
      x={xScale(d.label)}
      y={yScale(d.value)}
      width={xScale.bandwidth()}
      height={height - yScale(d.value)}
      fill="#fc2e1c"
    />
  ))}
</Group>
```

**最佳适用场景**
- 需要完全控制样式的项目
- 设计系统团队
- 企业级图表组件库建设

**学习曲线**: 🟡🟡🟡⚪⚪ (中高)

---

### react-flow ⭐24k

**节点图/流程图** - 交互式节点编辑器

| 属性 | 详情 |
|------|------|
| **Stars** | 24k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [xyflow/xyflow](https://github.com/xyflow/xyflow) |
| **官网** | [reactflow.dev](https://reactflow.dev/) |

**核心特性**
- 拖拽节点
- 连接边
- 缩放/平移
- 小地图
- 背景网格
- 可自定义节点样式

```tsx
import ReactFlow, { Controls, Background } from 'reactflow';

const nodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '开始' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: '处理' } }
];

const edges = [{ id: 'e1-2', source: '1', target: '2' }];

<ReactFlow nodes={nodes} edges={edges}>
  <Controls />
  <Background />
</ReactFlow>
```

**最佳适用场景**
- 工作流编辑器
- 流程图设计器
- 低代码平台
- 数据管道可视化
- 机器学习工作流

**学习曲线**: 🟡🟡⚪⚪⚪ (中等)

---

### GoJS

**商业流程图** - 企业级图表库

| 属性 | 详情 |
|------|------|
| **许可** | 商业软件 (免费试用) |
| **TypeScript** | ✅ 支持 |
| **官网** | [gojs.net](https://gojs.net/) |

**核心特性**
- 丰富的内置功能
- 商业支持
- 成熟稳定

**vs 开源替代**

| 特性 | GoJS | react-flow |
|------|------|------------|
| 成本 | 付费 | 免费 |
| 功能丰富度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 社区 | 小 | 大 |
| 定制灵活性 | 高 | 高 |

**最佳适用场景**
- 企业预算充足
- 需要高级功能和专业支持
- BPM/工作流系统

---

### Mermaid ⭐76k

**文本生成图表** - 类似 Markdown 的图表语法

| 属性 | 详情 |
|------|------|
| **Stars** | 76k+ |
| **TypeScript** | ✅ 原生支持 |
| **维护状态** | 活跃 |
| **GitHub** | [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) |
| **官网** | [mermaid.js.org](https://mermaid.js.org/) |

**图表类型**

```markdown
```mermaid
flowchart TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
```
```

```markdown
```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 请求数据
    B->>A: 返回结果
```
```

**支持图表**
- Flowchart (流程图)
- Sequence Diagram (时序图)
- Class Diagram (类图)
- State Diagram (状态图)
- Entity Relationship (ER图)
- User Journey (用户旅程)
- Gantt (甘特图)
- Pie Chart (饼图)
- Git Graph (Git 图)

**集成**
- GitHub/GitLab 原生支持
- Notion、Obsidian 等工具内置
- Markdown 渲染器插件

**最佳适用场景**
- 文档中的图表
- 版本控制友好的图表
- 技术文档写作
- 快速原型沟通

**学习曲线**: 🟢⚪⚪⚪⚪ (简单)

---

## 📈 选型决策树

```
需要 3D 效果？
├── 是 → 地理/地图场景？
│       ├── 是 → Cesium (全球3D) / Deck.gl (大规模数据)
│       └── 否 → Three.js (通用) / Babylon.js (游戏)
│
└── 否 → 需要高度自定义？
        ├── 是 → React 项目？
        │       ├── 是 → visx / 自定义 D3 + React
        │       └── 否 → D3.js
        │
        └── 否 → 图表类型？
                ├── 流程图/节点图 → react-flow / Mermaid
                ├── 地图 → Leaflet (简单) / Mapbox (矢量)
                ├── React 项目 → Recharts / Nivo
                ├── 中文文档优先 → ECharts
                └── 简单快速 → Chart.js
```

---

## 📊 综合对比表

| 库 | Stars | TS | 包大小 | 学习曲线 | 最佳场景 |
|---|-------|----|--------|----------|----------|
| **D3.js** | 108k | ✅ | 300KB+ | 🔴🔴🔴🔴🔴 | 高度自定义 |
| **ECharts** | 62k | ✅ | 300KB+ | 🟡🟡⚪⚪⚪ | 企业级图表 |
| **Chart.js** | 65k | ✅ | 60KB | 🟢⚪⚪⚪⚪ | 简单快速 |
| **Recharts** | 23k | ✅ | 400KB | 🟡⚪⚪⚪⚪ | React 项目 |
| **Three.js** | 105k | ✅ | 600KB+ | 🔴🔴🔴🔴⚪ | 3D 可视化 |
| **Leaflet** | 41k | ✅ | 38KB | 🟢⚪⚪⚪⚪ | 简单地图 |
| **Mermaid** | 76k | ✅ | 100KB+ | 🟢⚪⚪⚪⚪ | 文档图表 |
| **react-flow** | 24k | ✅ | 200KB | 🟡🟡⚪⚪⚪ | 流程编辑器 |
| **Nivo** | 14k | ✅ | 500KB+ | 🟡🟡⚪⚪⚪ | React + D3 |
| **visx** | 17k | ✅ | 按需加载 | 🟡🟡🟡⚪⚪ | 自定义组件库 |

---

## 📚 推荐学习资源

### D3.js
- **官方**: [d3js.org](https://d3js.org/) + [Observable](https://observablehq.com/@d3)
- **书籍**: 《D3.js 数据可视化实战手册》
- **课程**: D3.js 大师课 (Frontend Masters)
- **社区**: D3 Slack, Observable 社区

### Three.js
- **官方**: [threejs-journey.com](https://threejs-journey.com/) (Bruno Simon)
- **文档**: [threejs.org/docs](https://threejs.org/docs/)
- **示例**: [threejs.org/examples](https://threejs.org/examples/)

### ECharts
- **官方文档**: [echarts.apache.org/zh/option.html](https://echarts.apache.org/zh/option.html)
- **示例库**: [echarts.apache.org/examples/zh/index.html](https://echarts.apache.org/examples/zh/index.html)

### React Three Fiber
- **官方**: [docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber)
- **示例**: [r3f.docs.pmnd.rs](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)

---

## 🔮 趋势与展望

1. **WebGPU 革命**: Three.js、Babylon.js 已支持 WebGPU，性能将大幅提升
2. **AI 辅助可视化**: GPT 生成 D3/Mermaid 代码成为常态
3. **数据故事化**: Observable 引领的交互式叙事
4. **XR 可视化**: VR/AR 中的数据展示需求增长
5. **流数据处理**: 实时数据可视化框架需求

---

*最后更新: 2026-04-04*

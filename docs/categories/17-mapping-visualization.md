# 地图可视化 (Mapping & Visualization)

用于创建交互式地图、地理空间数据可视化和3D地球展示的JavaScript/TypeScript库。

---

## 基础地图库

### Leaflet

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 44.8k+ |
| 📦 体积 | ~40kB (gzipped) |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [Leaflet/Leaflet](https://github.com/Leaflet/Leaflet) |
| 📚 文档 | [leafletjs.com](https://leafletjs.com) |
| 📥 下载量 | 267k+/周 (NPM) |

轻量级、开源的JavaScript库，用于创建交互式地图。以其简洁性、性能和可用性著称，支持所有主流桌面和移动端平台。

**特点：**
- 极小的体积，仅40kB+ gzipped
- 丰富的插件生态系统
- 移动设备友好，触摸手势支持
- 支持OpenStreetMap、Mapbox、Google Maps等数据源
- 使用纯HTML/CSS渲染

**代码示例：**

```typescript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 创建地图
const map = L.map('map').setView([51.505, -0.09], 13);

// 添加图层
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 添加标记
L.marker([51.5, -0.09])
  .addTo(map)
  .bindPopup('Hello Leaflet!')
  .openPopup();
```

---

### Mapbox GL JS

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 11k+ |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [mapbox/mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) |
| 📚 文档 | [docs.mapbox.com](https://docs.mapbox.com/mapbox-gl-js/) |
| 📥 下载量 | 300k+/周 (NPM) |

基于WebGL的现代化矢量地图库，提供高性能的交互式地图渲染，支持3D地形和自定义样式。

**特点：**
- WebGL硬件加速渲染
- 矢量瓦片技术，缩放流畅
- 强大的样式自定义系统
- 支持3D地形和建筑
- 跨平台SDK生态（iOS/Android/React Native）

**代码示例：**

```typescript
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.5, 40],
  zoom: 9,
  pitch: 45, // 3D倾斜角度
  bearing: -17.6
});

// 添加3D建筑
map.on('load', () => {
  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height']
    }
  });
});
```

---

### OpenLayers

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 11.8k+ |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [openlayers/openlayers](https://github.com/openlayers/openlayers) |
| 📚 文档 | [openlayers.org](https://openlayers.org) |

高性能、功能丰富的开源GIS库，支持多种数据格式和投影系统，适合企业级地理信息应用。

**特点：**
- 支持多种数据格式（GeoJSON、KML、GPX等）
- 丰富的投影系统支持
- 矢量瓦片和栅格瓦片
- 高级GIS功能（缓冲区、叠加分析等）
- 成熟稳定，广泛应用于企业级GIS

**代码示例：**

```typescript
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import 'ol/ol.css';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new VectorLayer({
      source: new VectorSource({
        url: 'data.geojson',
        format: new GeoJSON()
      })
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
```

---

### Turf.js

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 9k+ |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [Turfjs/turf](https://github.com/Turfjs/turf) |
| 📚 文档 | [turfjs.org](https://turfjs.org) |

模块化的地理空间分析引擎，提供空间计算、数据处理和统计分析功能。

**特点：**
- 纯JavaScript实现，无外部依赖
- 丰富的空间分析函数
- 支持GeoJSON数据格式
- 可在浏览器和Node.js运行
- 高精度几何计算

**代码示例：**

```typescript
import { buffer, point, distance, booleanContains } from '@turf/turf';

// 创建点
const pt = point([-77.03, 38.89]);

// 创建缓冲区（500米）
const buffered = buffer(pt, 0.5, { units: 'kilometers' });

// 计算距离
const from = point([-75.34, 39.12]);
const to = point([-75.53, 39.18]);
const dist = distance(from, to, { units: 'kilometers' });

// 判断包含关系
const searchArea = buffer(pt, 1, { units: 'kilometers' });
const target = point([-77.02, 38.90]);
const isInside = booleanContains(searchArea, target);
```

---

## React地图组件

### React Leaflet

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 4.9k+ |
| 🔷 TypeScript | ✅ 支持 |
| 🔗 GitHub | [PaulLeCam/react-leaflet](https://github.com/PaulLeCam/react-leaflet) |
| 📚 文档 | [react-leaflet.js.org](https://react-leaflet.js.org) |
| 📥 下载量 | 350k+/周 (NPM) |

Leaflet的React封装，提供声明式的React组件接口。

**特点：**
- 完全利用React生命周期
- 声明式组件API
- 支持React hooks
- 与Leaflet插件兼容
- 热更新支持

**代码示例：**

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={13} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
```

---

### React Map GL

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 6k+ |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [visgl/react-map-gl](https://github.com/visgl/react-map-gl) |
| 📚 文档 | [visgl.github.io/react-map-gl](https://visgl.github.io/react-map-gl/) |
| 📥 下载量 | 300k+/周 (NPM) |

Uber开发的React地图组件库，支持Mapbox和MapLibre。

**特点：**
- 完全受控的React组件
- 支持Mapbox和MapLibre双引擎
- 与deck.gl无缝集成
- 丰富的hooks API
- 响应式设计支持

**代码示例：**

```typescript
import * as React from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const [viewState, setViewState] = React.useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 14
  });

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapboxAccessToken="YOUR_TOKEN"
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    />
  );
}
```

---

### Pigeon Maps

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 5k+ |
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [mariusandra/pigeon-maps](https://github.com/mariusandra/pigeon-maps) |
| 📚 文档 | [pigeon-maps.js.org](https://pigeon-maps.js.org) |

零外部依赖的React地图组件，轻量且高性能。

**特点：**
- 无任何外部依赖
- 原生React实现
- 支持OpenStreetMap、MapTiler等
- 可自定义标记和覆盖层
- 服务端渲染友好

**代码示例：**

```typescript
import { Map, Marker, ZoomControl } from 'pigeon-maps';

function MyMap() {
  return (
    <Map 
      height={400} 
      defaultCenter={[50.879, 4.6997]} 
      defaultZoom={11}
    >
      <Marker width={50} anchor={[50.879, 4.6997]} />
      <ZoomControl />
    </Map>
  );
}
```

---

## 地理可视化

### deck.gl

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 12k+ |
| 🔷 TypeScript | ✅ 原生支持（v9+） |
| 🔗 GitHub | [visgl/deck.gl](https://github.com/visgl/deck.gl) |
| 📚 文档 | [deck.gl/docs](https://deck.gl/docs) |

Uber开源的WebGL2/WebGPU大规模数据可视化框架。

**特点：**
- 支持百万级数据点渲染
- GPU加速计算
- 64位高精度坐标
- 丰富的图层类型
- 与Mapbox、Google Maps集成
- WebGPU支持（v9+）

**代码示例：**

```typescript
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

const deck = new Deck({
  container: 'container',
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 11
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'scatterplot-layer',
      data: [
        { position: [-122.45, 37.78], size: 100 }
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 140, 0]
    })
  ]
});
```

---

### kepler.gl

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 11k+ |
| 🔷 TypeScript | ✅ 支持 |
| 🔗 GitHub | [keplergl/kepler.gl](https://github.com/keplergl/kepler.gl) |
| 📚 文档 | [docs.kepler.gl](https://docs.kepler.gl) |
| 🌐 演示 | [kepler.gl/demo](https://kepler.gl/demo) |

Uber开源的地理空间分析工具，基于deck.gl构建。

**特点：**
- 无需编程即可可视化地理数据
- 支持CSV、GeoJSON数据
- 时间序列动画
- 3D六边形聚合
- 可作为React组件嵌入
- GPU加速渲染

**代码示例：**

```typescript
import KeplerGl from 'kepler.gl';
import { addDataToMap } from 'kepler.gl/actions';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      addDataToMap({
        datasets: {
          info: { label: 'My Data', id: 'my_data' },
          data: {
            fields: [
              { name: 'lat', type: 'real' },
              { name: 'lng', type: 'real' }
            ],
            rows: [[37.78, -122.45], [37.79, -122.46]]
          }
        },
        option: {
          centerMap: true,
          readOnly: false
        },
        config: {} // 地图配置
      })
    );
  }, []);

  return (
    <KeplerGl
      id="map"
      width={800}
      height={600}
      mapboxApiAccessToken="YOUR_TOKEN"
    />
  );
}
```

---

### vis.gl

| 属性 | 详情 |
|------|------|
| 🔗 官网 | [vis.gl](https://vis.gl) |
| 🔷 TypeScript | ✅ 支持 |
| 🏛️ 治理 | OpenJS Foundation |

Uber可视化框架套件，包含多个地理空间可视化库。

**包含项目：**
- **deck.gl** - 大规模数据可视化
- **luma.gl** - WebGL/WebGPU引擎
- **react-map-gl** - React地图组件
- **loaders.gl** - 数据加载器
- **math.gl** - 数学计算库

---

## 3D地球

### CesiumJS

| 属性 | 详情 |
|------|------|
| ⭐ Stars | 13k+ |
| 🔷 TypeScript | ✅ 支持 |
| 🔗 GitHub | [CesiumGS/cesium](https://github.com/CesiumGS/cesium) |
| 📚 文档 | [cesium.com/learn](https://cesium.com/learn/cesiumjs-learn/) |
| 🌐 演示 | [sandcastle.cesium.com](https://sandcastle.cesium.com) |

开源的3D地球和地图JavaScript库，专注于高精度地理空间数据可视化。

**特点：**
- 真实3D地球渲染
- 支持3D Tiles标准
- 时间动态数据
- 地形和影像图层
- 无人机/卫星轨迹模拟
- VR/AR支持

**代码示例：**

```typescript
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Cesium.Ion.defaultAccessToken = 'YOUR_TOKEN';

const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain()
});

// 添加3D建筑
viewer.scene.primitives.add(
  Cesium.createOsmBuildings()
);

// 飞行到位置
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
  orientation: {
    heading: Cesium.Math.toRadians(0.0),
    pitch: Cesium.Math.toRadians(-15.0)
  }
});

// 添加实体
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 0),
  model: {
    uri: 'model.glb'
  }
});
```

---

### Three.js 地理扩展

使用Three.js创建3D地球和地理可视化的扩展方案。

**相关库：**
- **Globe.gl** - 基于Three.js的3D地球可视化
- **Three-geo** - Three.js的地理数据扩展
- **react-globe.gl** - Globe.gl的React封装

**代码示例：**

```typescript
import Globe from 'globe.gl';

const world = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  (document.getElementById('globeViz'));

// 添加点标记
const gData = [...Array(500).keys()].map(() => ({
  lat: (Math.random() - 0.5) * 160,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
}));

world.pointsData(gData)
  .pointAltitude('size')
  .pointColor('color');
```

---

## 地理编码/服务

### Mapbox SDK

| 属性 | 详情 |
|------|------|
| 🔷 TypeScript | ✅ 原生支持 |
| 📚 文档 | [docs.mapbox.com/api](https://docs.mapbox.com/api/) |

Mapbox官方SDK，提供地图服务、地理编码、导航等功能。

**特点：**
- 地理编码API（地址转坐标）
- 路线规划和导航
- 静态地图生成
- 上传和管理数据
- 优化和矩阵API

**代码示例：**

```typescript
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

const geocodingClient = mbxGeocoding({ accessToken: 'YOUR_TOKEN' });
const directionsClient = mbxDirections({ accessToken: 'YOUR_TOKEN' });

// 地理编码
const response = await geocodingClient
  .forwardGeocode({
    query: 'Paris, France',
    limit: 1
  })
  .send();

const coordinates = response.body.features[0].center;

// 路线规划
const route = await directionsClient
  .getDirections({
    waypoints: [
      { coordinates: [-122.42, 37.78] },
      { coordinates: [-122.48, 37.83] }
    ],
    profile: 'driving'
  })
  .send();
```

---

### @vis.gl/react-google-maps

| 属性 | 详情 |
|------|------|
| 🔷 TypeScript | ✅ 原生支持 |
| 🔗 GitHub | [visgl/react-google-maps](https://github.com/visgl/react-google-maps) |
| 📥 下载量 | 40k+/周 (NPM) |

Google Maps官方推荐的React组件库，现代且类型安全。

**特点：**
- 类型安全的API
- 现代React hooks
- 支持高级功能（Autocomplete、Street View等）
- 性能优化

**代码示例：**

```typescript
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

function App() {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{ lat: 37.78, lng: -122.45 }}
        defaultZoom={12}
        mapId="YOUR_MAP_ID"
      >
        <AdvancedMarker position={{ lat: 37.78, lng: -122.45 }}>
          <div style={{ color: 'red' }}>📍</div>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}
```

---

## 选型建议

| 场景 | 推荐方案 |
|------|----------|
| 简单交互地图 | Leaflet + React Leaflet |
| 高性能矢量地图 | Mapbox GL JS / MapLibre GL |
| 企业级GIS应用 | OpenLayers |
| 大规模数据可视化 | deck.gl |
| 地理数据分析 | kepler.gl |
| 3D地球/卫星数据 | CesiumJS |
| 地理空间计算 | Turf.js |
| 零依赖React地图 | Pigeon Maps |

---

## 许可证说明

- **Leaflet**: BSD-2-Clause
- **Mapbox GL JS**: Mapbox Terms of Service（v2后部分闭源）
- **MapLibre GL**: BSD-3-Clause（Mapbox GL开源分支）
- **OpenLayers**: BSD-2-Clause
- **Turf.js**: MIT
- **deck.gl**: MIT
- **kepler.gl**: MIT
- **CesiumJS**: Apache-2.0

> 注意：Mapbox v2.0+ 使用非开源许可证，如需完全开源可考虑 [MapLibre GL](https://maplibre.org/)。

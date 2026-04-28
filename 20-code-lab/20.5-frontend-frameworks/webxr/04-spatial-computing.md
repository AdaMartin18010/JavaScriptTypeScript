# 空间计算基础

> 文件: `04-spatial-computing.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 空间计算核心概念

### 空间计算技术栈

```
感知层        → 平面检测 (Plane Detection)
              → 网格重建 (Mesh Reconstruction)
              → 深度感知 (Depth Sensing)
              → 场景理解 (Scene Understanding)

空间层        → 参考空间 (Reference Space)
              → 空间锚点 (Spatial Anchors)
              → 命中测试 (Hit Testing)
              → 几何查询 (Geometry Queries)

应用层        → 物体放置 (Object Placement)
              → 遮挡处理 (Occlusion)
              → 碰撞检测 (Collision)
              → 空间 UI (Spatial UI)
```

### WebXR 空间特性启用

```typescript
const session = await navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test', 'local-floor'],
  optionalFeatures: [
    'anchors',           // 空间锚点
    'plane-detection',   // 平面检测
    'mesh-detection',    // 网格检测
    'depth-sensing',     // 深度感知
  ],
});
```

---

## 空间锚点 (Anchors)

### 为什么需要锚点？

设备追踪会随时间漂移（SLAM 累积误差），锚点允许系统在后台持续优化虚拟内容的真实世界位置。

```
时间 t0: 锚点创建于 (1, 0, 2)
时间 t1: 系统优化地图 → 锚点自动更新为 (1.02, -0.01, 1.98)
时间 t2: 再次优化 → 锚点更新为 (1.01, 0, 1.99)

→ 虚拟对象始终与真实世界位置对齐
```

### 云锚点 (Cloud Anchors)

| 平台 | 服务 | 特性 |
|------|------|------|
| Google | ARCore Cloud Anchors | 跨设备共享，24h 持久 |
| Apple | ARKit Collaborative Sessions | 多用户实时同步 |
| Meta | Spatial Anchors API | Quest 系列原生支持 |

---

## 命中测试 (Hit Test)

### 命中测试模式

```typescript
// 1. 从屏幕坐标发射射线（移动端 AR）
const source = session.inputSources[0];
const hitTestSource = await session.requestHitTestSource({
  space: viewerSpace,
  offsetRay: new XRRay(),
});

// 2. 从控制器发射射线（VR）
const controllerHitSource = await session.requestHitTestSourceForTransientInput({
  profile: 'generic-hand',
});
```

### 命中结果解读

```typescript
frame.getHitTestResults(hitTestSource).forEach((result) => {
  const pose = result.getPose(referenceSpace);
  const hitMatrix = pose.transform.matrix;

  // hitMatrix 包含：
  // - 命中点的 3D 位置
  // - 表面的法线方向（Y轴）
  // - 表面的切线方向（X轴/Z轴）
});
```

---

## 平面检测策略

### 平面类型

| 类型 | 特征 | 用途 |
|------|------|------|
| `horizontal-upward` | 面朝上的水平面 | 地面、桌面、台面 |
| `horizontal-downward` | 面朝下的水平面 | 天花板 |
| `vertical` | 垂直面 | 墙壁、门窗 |

### 平面语义分类（高级平台）

```
检测到的平面
├── 水平面
│   ├── 地面 (floor)     → 角色行走、家具放置
│   └── 桌面 (table)     → 小型物体放置
└── 垂直面
    ├── 墙壁 (wall)      → 挂画、窗户
    └── 门窗 (opening)   → 导航、遮挡
```

---

## 空间 UI 设计原则

### 舒适区域

```
        用户头部位置
              │
    ┌─────────┼─────────┐
    │  舒适区  │  舒适区  │   ← 0.5m - 2m 距离
    │  (近)   │  (远)   │
    └─────────┼─────────┘
              │
        地面 (y=0)
```

### UI 放置约束

| 约束 | 推荐值 | 原因 |
|------|--------|------|
| 最小距离 | 0.5m | 避免眼睛疲劳 |
| 最大距离 | 3.0m | 保持可读性 |
| 最佳高度 | 1.2-1.5m | 人体工程学 |
| 俯仰角 | -10° ~ 20° | 自然视线范围 |

---

## 参考资源

- [WebXR Anchors 模块](https://immersive-web.github.io/anchors/)
- [WebXR Hit Test 模块](https://immersive-web.github.io/hit-test/)
- [WebXR Plane Detection](https://immersive-web.github.io/real-world-geometry/plane-detection.html)
- [Apple VisionOS 空间设计指南](https://developer.apple.com/visionos/design/)
- [Spatial Computing 设计模式](https://www.visionos.design/)

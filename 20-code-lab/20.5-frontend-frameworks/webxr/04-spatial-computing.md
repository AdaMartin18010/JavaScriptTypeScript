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

### 锚点创建与恢复示例

```typescript
// anchor-manager.ts — WebXR 锚点持久化管理
class AnchorManager {
  private anchors = new Map<string, XRAnchor>();

  async createAnchor(frame: XRFrame, pose: XRRigidTransform): Promise<string> {
    const refSpace = await this.session.requestReferenceSpace('local-floor');
    const anchor = await frame.createAnchor(pose, refSpace);
    const id = crypto.randomUUID();
    this.anchors.set(id, anchor);
    return id;
  }

  getAnchorPose(anchorId: string, frame: XRFrame, refSpace: XRReferenceSpace): XRPose | null {
    const anchor = this.anchors.get(anchorId);
    if (!anchor) return null;
    return frame.getPose(anchor.anchorSpace, refSpace);
  }

  // 序列化锚点 UUID 用于云端同步
  serialize(): string[] {
    return Array.from(this.anchors.keys());
  }
}
```

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

### 带放置预览的命中测试

```typescript
// placement-preview.ts
function updatePlacementPreview(
  frame: XRFrame,
  hitTestSource: XRHitTestSource,
  previewMesh: THREE.Mesh,
  refSpace: XRReferenceSpace
): void {
  const hits = frame.getHitTestResults(hitTestSource);
  if (hits.length === 0) {
    previewMesh.visible = false;
    return;
  }

  const pose = hits[0].getPose(refSpace);
  if (!pose) return;

  previewMesh.visible = true;
  previewMesh.position.setFromMatrixPosition(new THREE.Matrix4().fromArray(pose.transform.matrix));

  // 让预览物体与命中表面对齐（法线朝上）
  const normal = new THREE.Vector3(0, 1, 0).applyMatrix4(
    new THREE.Matrix4().fromArray(pose.transform.matrix)
  );
  previewMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
}
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

### 平面几何提取与网格生成

```typescript
// plane-mesh.ts — 从检测到的平面生成渲染网格
function createPlaneMesh(plane: XRPlane): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // 平面顶点动态更新
  const polygon = plane.polygon; // DOMPointReadOnly[]
  if (polygon.length >= 3) {
    const shape = new THREE.Shape();
    shape.moveTo(polygon[0].x, polygon[0].z);
    for (let i = 1; i < polygon.length; i++) {
      shape.lineTo(polygon[i].x, polygon[i].z);
    }
    mesh.geometry = new THREE.ShapeGeometry(shape);
  }

  return mesh;
}
```

---

## 深度感知与遮挡

### 深度纹理集成

```typescript
// depth-occlusion.ts — 基于深度图的真实遮挡
class DepthOcclusionManager {
  private depthTexture: THREE.DepthTexture | null = null;

  async init(session: XRSession, renderer: THREE.WebGLRenderer): Promise<void> {
    if (!session.enabledFeatures?.includes('depth-sensing')) return;

    const gl = renderer.getContext() as WebGL2RenderingContext;
    // WebXR 深度感知提供深度图纹理
    // 通过 frame.getDepthInformation(view) 获取
  }

  update(frame: XRFrame, view: XRView): void {
    const depthInfo = (frame as any).getDepthInformation?.(view);
    if (!depthInfo) return;

    // 将真实世界深度图用于自定义深度测试材质
    // 使虚拟物体被真实物体遮挡
  }
}
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

### 空间 UI  billboard 组件

```typescript
// spatial-ui.ts — 始终面向用户的 UI 面板
class SpatialUI {
  private mesh: THREE.Mesh;

  constructor(canvas: HTMLCanvasElement) {
    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(0.5, 0.3);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
  }

  update(camera: THREE.Camera): void {
    // Billboard 效果：UI 面板始终面向相机
    this.mesh.lookAt(camera.position);
  }

  setPositionFromHeadset(headsetPose: XRPose, distance = 1.5, heightOffset = 0): void {
    const m = headsetPose.transform.matrix;
    const forward = new THREE.Vector3(-m[8], -m[9], -m[10]).normalize();
    const pos = new THREE.Vector3(m[12], m[13], m[14]);
    pos.add(forward.multiplyScalar(distance));
    pos.y += heightOffset;
    this.mesh.position.copy(pos);
  }
}
```

---

## 手部追踪与输入

### 手势识别基础

```typescript
// hand-tracking.ts
function getHandJoints(frame: XRFrame, referenceSpace: XRReferenceSpace) {
  for (const inputSource of frame.session.inputSources) {
    if (inputSource.hand) {
      const joints = inputSource.hand;
      const indexTip = frame.getJointPose(joints.get('index-finger-tip'), referenceSpace);
      if (indexTip) {
        console.log('Index tip position:', indexTip.transform.position);
      }
    }
  }
}
```

### 捏合手势检测

```typescript
// pinch-detection.ts
function isPinching(hand: XRHand, frame: XRFrame, refSpace: XRReferenceSpace): boolean {
  const thumbTip = frame.getJointPose(hand.get('thumb-tip'), refSpace);
  const indexTip = frame.getJointPose(hand.get('index-finger-tip'), refSpace);
  if (!thumbTip || !indexTip) return false;
  const dx = thumbTip.transform.position.x - indexTip.transform.position.x;
  const dy = thumbTip.transform.position.y - indexTip.transform.position.y;
  const dz = thumbTip.transform.position.z - indexTip.transform.position.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.02;
}
```

## DOM Overlay 集成

在 AR 会话中叠加 HTML UI：

```typescript
// dom-overlay.ts
const session = await navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test', 'local-floor'],
  optionalFeatures: ['dom-overlay'],
  domOverlay: { root: document.getElementById('ar-overlay')! },
});
```

```css
#ar-overlay { display: none; }
.xr-overlay #ar-overlay { display: block; }
```

## 网格检测与动态碰撞

```typescript
// mesh-detection.ts
function processMeshUpdates(frame: XRFrame, refSpace: XRReferenceSpace) {
  const meshes = (frame as any).detectedMeshes || [];
  for (const mesh of meshes) {
    const pose = frame.getPose(mesh.meshSpace, refSpace);
    if (!pose) continue;
    const vertices = mesh.vertices;
    const indices = mesh.indices;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }
}
```

## 参考资源

#### WebXR 规范

- [WebXR Device API — W3C Editor's Draft](https://immersive-web.github.io/webxr/)
- [WebXR Hand Input Module — W3C](https://immersive-web.github.io/webxr-hand-input/)
- [WebXR DOM Overlays Module](https://immersive-web.github.io/dom-overlays/)
- [WebXR Anchors 模块](https://immersive-web.github.io/anchors/)
- [WebXR Hit Test 模块](https://immersive-web.github.io/hit-test/)
- [WebXR Plane Detection](https://immersive-web.github.io/real-world-geometry/plane-detection.html)
- [WebXR Mesh Detection](https://immersive-web.github.io/real-world-meshing/)
- [WebXR Depth Sensing](https://immersive-web.github.io/depth-sensing/)

#### 引擎与开发

- [Three.js WebXR Documentation](https://threejs.org/docs/#manual/en/introduction/WebXR-Device-Integration)
- [Three.js XR Examples](https://threejs.org/examples/?q=webxr)
- [Babylon.js WebXR Guide](https://doc.babylonjs.com/features/featuresDeepDive/webXR/)
- [Babylon.js WebXR Demos](https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRDemos)

#### 平台设计指南

- [Apple VisionOS 空间设计指南](https://developer.apple.com/visionos/design/)
- [Meta Spatial Design Guidelines](https://developer.oculus.com/design/)
- [Meta Spatial SDK](https://developer.oculus.com/documentation/unity/unity-spatial-sdk-overview/)
- [Spatial Computing 设计模式](https://www.visionos.design/)
- [Google ARCore Geospatial API](https://developers.google.com/ar/develop/geospatial)
- [Google AR Foundation — Cross-platform AR](https://developers.google.com/ar)
- [8th Wall WebAR Platform](https://www.8thwall.com/docs/)

#### MDN 与工作组

- [WebXR Device API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Immersive Web Working Group](https://www.w3.org/groups/ig/immersive-web)

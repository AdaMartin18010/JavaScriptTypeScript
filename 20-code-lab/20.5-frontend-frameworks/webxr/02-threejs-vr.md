# Three.js VR 场景搭建

> 文件: `02-threejs-vr.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 核心架构

### Three.js + WebXR 渲染管线

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Scene     │────▶│   Camera    │────▶│  Renderer   │
│  (Object3D) │     │(Perspective)│     │ (WebGL)     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌────────────┐       ┌────────────┐       ┌────────────┐
                   │ Left Eye   │       │ Right Eye  │       │  WebXR     │
                   │ Framebuffer│       │ Framebuffer│       │  Compositor│
                   └────────────┘       └────────────┘       └────────────┘
```

### VR 立体渲染原理

VR 需要为每只眼睛渲染独立的图像：

1. **瞳距 (IPD)**: 左右眼相机相距约 64mm
2. **视差**: 产生深度感知的关键
3. **投影矩阵**: 每只眼睛独立的透视投影

```typescript
const stereoCamera = new VRStereoCamera();
stereoCamera.update(fov, aspect, near, far, headPosition);

// 渲染左眼
renderer.setViewport(0, 0, halfWidth, height);
renderer.render(scene, stereoCamera.left);

// 渲染右眼
renderer.setViewport(halfWidth, 0, halfWidth, height);
renderer.render(scene, stereoCamera.right);
```

---

## Three.js WebXR 集成要点

### 1. 启用 WebXR 渲染器

```typescript
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true; // 关键：启用 WebXR

document.body.appendChild(VRButton.createButton(renderer));
```

### 2. 参考空间配置

```typescript
renderer.xr.addEventListener('sessionstart', () => {
  const session = renderer.xr.getSession();
  // 请求 local-floor 以获得正确的高度
  session.requestReferenceSpace('local-floor').then((refSpace) => {
    // 使用 refSpace 进行渲染
  });
});
```

### 3. 动画循环适配

```typescript
// 传统动画循环
// renderer.setAnimationLoop(render); // ✅ WebXR 兼容

function render() {
  // Three.js 自动处理双眼渲染
  renderer.render(scene, camera);
}
```

---

## 完整最小示例 (TypeScript)

以下是一个可直接运行的最小 VR 场景，包含一个随控制器交互改变颜色的立方体：

```typescript
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// 立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.5, -2);
scene.add(cube);

// 灯光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 控制器交互
const controller = renderer.xr.getController(0);
controller.addEventListener('selectstart', () => {
  material.color.setHex(Math.random() * 0xffffff);
});
scene.add(controller);

function animate() {
  renderer.setAnimationLoop(() => {
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}
animate();
```

---

## VR 控制器输入处理

WebXR 输入配置文件支持多种控制器（Meta Quest、HTC Vive、Index 等）。Three.js 通过 `XRInputSource` 提供统一抽象：

```typescript
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const controllerModelFactory = new XRControllerModelFactory();

// 左手控制器 (index 0)
const controllerGrip0 = renderer.xr.getControllerGrip(0);
controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0));
scene.add(controllerGrip0);

// 右手控制器 (index 1)
const controllerGrip1 = renderer.xr.getControllerGrip(1);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

// 监听选择事件（扳机键按下）
controllerGrip0.addEventListener('selectstart', () => {
  console.log('Left trigger pressed');
});

// 每帧读取控制器位姿
function render() {
  const session = renderer.xr.getSession();
  if (session) {
    for (const inputSource of session.inputSources) {
      if (inputSource.gamepad) {
        const [squeeze, trigger] = inputSource.gamepad.buttons;
        const { x, y } = inputSource.gamepad.axes; // 摇杆/触控板
        // 根据输入更新交互逻辑
      }
    }
  }
  renderer.render(scene, camera);
}
```

---

## 传送与移动 (Locomotion)

VR 中常见的移动方式是**抛物线传送**（Teleportion）。下面展示基于控制器指向的简易传送逻辑：

```typescript
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshBasicMaterial({ visible: false })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

function handleTeleport(controller: THREE.XRTargetRaySpace) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const intersects = raycaster.intersectObject(floor);
  if (intersects.length > 0) {
    const target = intersects[0].point;
    // 将玩家 rig（相机父节点）移动到目标点
    cameraRig.position.set(target.x, 0, target.z);
  }
}

// 在 selectstart 时触发传送
controller.addEventListener('selectstart', () => handleTeleport(controller));
```

---

## WebXR Hit Test 与空间锚点

将虚拟对象放置在真实世界表面是 AR/VR 交互的核心：

```typescript
let hitTestSource: XRHitTestSource | null = null;

// 在 sessionstart 中请求 hit test
session.requestReferenceSpace('viewer').then((viewerSpace) => {
  session.requestHitTestSource?.({ space: viewerSpace }).then((source) => {
    hitTestSource = source;
  });
});

// 在渲染循环中获取命中结果
function render(timestamp: number, frame: XRFrame) {
  const referenceSpace = renderer.xr.getReferenceSpace();
  if (hitTestSource && referenceSpace) {
    const hitTestResults = frame.getHitTestResults(hitTestSource);
    if (hitTestResults.length > 0) {
      const hitPose = hitTestResults[0].getPose(referenceSpace);
      if (hitPose) {
        reticle.visible = true;
        reticle.matrix.fromArray(hitPose.transform.matrix);
      }
    }
  }
  renderer.render(scene, camera);
}
```

---

## 性能优化

| 技术 | 说明 | 效果 |
|------|------|------|
| **注视点渲染** | 根据视线方向降低边缘分辨率 | 提升 30-50% 性能 |
| **遮挡剔除** | 不渲染被遮挡的对象 | 减少 draw call |
| **LOD** | 远处使用低模 | 降低顶点数 |
| **纹理压缩** | 使用 ASTC/ETC2 | 降低显存带宽 |
| **MSAA** | 多重采样抗锯齿 | 减少锯齿，保持性能 |

### 推荐的 VR 场景预算

```
目标帧率: 90fps (11.1ms / 帧)
├── 渲染: 8ms
│   ├── 场景提交: 2ms
│   ├── GPU 渲染: 4ms
│   └── 合成: 2ms
├── 逻辑: 2ms
│   ├── 物理: 1ms
│   └── 交互: 1ms
└── 缓冲: 1.1ms
```

---

## 常见陷阱

1. **不要使用 `requestAnimationFrame`** — 使用 `renderer.setAnimationLoop()`
2. **避免在 render 中创建对象** — 会产生 GC 卡顿
3. **确保 90fps** — 低于此值会导致晕动症
4. **正确设置近裁剪面** — 太近会导致视觉不适

---

## 参考资源

- [Three.js WebXR 示例](https://threejs.org/examples/?q=webxr)
- [WebXR 设备 API — Three.js 文档](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
- [VR 最佳实践指南](https://developers.meta.com/horizon/documentation/web/webxr-best-practices)
- [WebXR Device API Specification — W3C](https://www.w3.org/TR/webxr/) — WebXR 官方标准规范
- [Immersive Web Working Group](https://www.w3.org/immersive-web/) — W3C 沉浸式 Web 工作组
- [WebXR Input Profiles](https://github.com/immersive-web/webxr-input-profiles) — 控制器输入配置规范
- [Meta WebXR Best Practices](https://developers.meta.com/horizon/documentation/web/webxr-performance) — Meta 官方 VR 性能优化指南
- [Three.js WebXRManager Source](https://github.com/mrdoob/three.js/blob/dev/src/renderers/webxr/WebXRManager.js) — Three.js WebXR 集成源码参考
- [MDN WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API) — Mozilla 开发者网络权威文档
- [Khronos WebGL](https://www.khronos.org/webgl/) — WebGL 标准与生态系统
- [Immersive Web Samples](https://immersive-web.github.io/webxr-samples/) — W3C 官方 WebXR 示例仓库
- [Meta WebXR Getting Started](https://developers.meta.com/horizon/documentation/web/webxr-getting-started) — Meta Quest 官方入门指南

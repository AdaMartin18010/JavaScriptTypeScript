---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# WebXR / AR / VR 与游戏（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦沉浸式应用与游戏开发技术，底层 3D 渲染引擎和图形库的分类请参见 `docs/categories/04-data-visualization.md`（3D 可视化章节）和 `docs/categories/17-animation.md`。
> **权威参考**: [WebXR Device API Spec](https://immersive-web.github.io/webxr/) | [Three.js Docs](https://threejs.org/docs/) | [Babylon.js Docs](https://doc.babylonjs.com/) | [MDN WebXR](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| WebXR API | 原生 WebXR Device API | VR/AR 沉浸式体验 |
| 3D 引擎 | Three.js, Babylon.js | 3D 场景、游戏、可视化 |
| 2D 游戏 | PixiJS, Phaser, Kaboom.js | 2D 游戏、交互应用 |
| AR 库 | 8th Wall, Zappar, MindAR | 图像识别 AR、WebAR |
| 物理引擎 | Cannon-es, Matter.js, Rapier | 刚体物理、碰撞检测 |

---

## WebXR 平台对比表

| 平台/引擎 | 渲染后端 | XR 支持 | 学习曲线 | 包体积(gzip) | 生态规模 | 适用场景 |
|-----------|----------|---------|----------|-------------|----------|----------|
| **Three.js** | WebGL / WebGPU (r160+) | WebXR 原生 | 中 | ~150KB | 最大 | 通用 3D、VR、AR |
| **Babylon.js** | WebGL / WebGPU | WebXR 原生 | 中 | ~250KB | 大 | 游戏、企业 3D |
| **A-Frame** | Three.js 封装 | WebXR 原生 | 低 | ~80KB | 中 | 快速原型、360° 内容 |
| **PlayCanvas** | WebGL | WebXR 原生 | 低 | ~100KB | 中 | 游戏、商业化应用 |
| **Wonderland Engine** | WebGL / WebGPU | WebXR 原生 | 中 | ~50KB | 小 | 高性能 VR |
| **8th Wall** | WebGL + 专有追踪 | 图像追踪 AR | 低 | SDK 托管 | 商业 | 商业 WebAR |
| **原生 WebXR** | WebGL | WebXR API | 高 | 0 (仅 API) | 标准 | 底层引擎开发 |

> 📖 参考：[caniuse.com/webxr](https://caniuse.com/webxr) | [Three.js WebXR Examples](https://threejs.org/examples/?q=webxr)

---

## 核心模块

### WebXR 引擎 (`jsts-code-lab/84-webxr/`)

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `xr-engine.ts` | XR 引擎核心 | 3D 数学、XR 会话、视图渲染、场景图、手势追踪、空间锚点、命中测试 |
| `01-webxr-basics.ts` | WebXR 基础与设备检测 | 设备能力检测、会话生命周期、参考空间管理、渲染循环适配 |
| `02-threejs-vr.ts` | Three.js VR 场景搭建 | 3D 数学工具、场景对象系统、VR 双眼相机、立体渲染管线 |
| `03-hand-tracking.ts` | 手势追踪与交互 | 25 关节骨骼模型、手势识别引擎、手部射线交互、事件状态机 |
| `04-spatial-computing.ts` | 空间计算基础 | 空间锚点、命中测试、网格检测、智能放置约束 |

---

## 代码示例：Three.js XR Session

```typescript
import * as THREE from 'three';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// 1. 场景初始化
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0); // 站立高度

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // 启用 WebXR
document.body.appendChild(renderer.domElement);

// 2. 添加 XR 进入按钮
document.body.appendChild(XRButton.createButton(renderer, {
  requiredFeatures: ['local-floor'], // 要求地板参考空间
  optionalFeatures: ['hand-tracking', 'hit-test']
}));

// 3. 构建简单场景
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.5, -1);
scene.add(cube);

// 光照
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 4. 控制器设置
const controllerModelFactory = new XRControllerModelFactory();
for (let i = 0; i < 2; i++) {
  const controller = renderer.xr.getController(i);
  scene.add(controller);

  const grip = renderer.xr.getControllerGrip(i);
  grip.add(controllerModelFactory.createControllerModel(grip));
  scene.add(grip);

  // 选择事件（扳机按下）
  controller.addEventListener('select', () => {
    cube.material.color.setHex(Math.random() * 0xffffff);
    // 命中测试：将立方体放置到射线命中点
    console.log('Controller selected');
  });
}

// 5. 动画循环
renderer.setAnimationLoop((time: number, frame?: XRFrame) => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // 每帧获取 XR 参考空间进行空间计算
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();
    // 可在此处执行 hit-test、锚点更新等空间计算
  }

  renderer.render(scene, camera);
});

// 6. 窗口自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### 运行方式

```bash
# Vite 项目
npm install three @types/three
# 使用 HTTPS 启动（WebXR 要求安全上下文）
npx vite --host --https
```

> 📖 参考：[Three.js WebXR Guide](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content) | [WebXR Device API MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

---

## WebXR 会话生命周期

```
用户点击 XRButton
       │
       ▼
navigator.xr.requestSession('immersive-vr', {
  requiredFeatures: ['local-floor']
})
       │
       ▼
renderer.xr.setSession(session)
       │
       ▼
渲染循环启动 (setAnimationLoop)
       │
       ├── 获取 XRFrame
       ├── 获取 viewer pose (头部追踪)
       ├── 获取 input sources (控制器/手部)
       ├── 更新场景图
       └── 双目渲染 (左右眼各一次)
       │
       ▼
session.end() ← 用户退出
```

> 📖 参考：[WebXR Session Model](https://immersive-web.github.io/webxr/#xrsession-interface)

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ VR/AR 应用                          ├─ WebGL / WebGPU API
├─ 浏览器游戏                          ├─ 着色器语言 (GLSL/WGSL)
├─ 沉浸式数据可视化                    ├─ 3D 模型格式 (GLTF/OBJ/USDZ)
└─ 空间计算应用                        └─ 图形驱动 / GPU 架构
```

---

## 关联资源

- `jsts-code-lab/84-webxr/` — WebXR 引擎、空间追踪、手势识别
- `jsts-code-lab/58-data-visualization/` — Canvas/SVG 渲染、图表
- `docs/categories/04-data-visualization.md` — 3D 可视化库分类
- `docs/application-domains-index.md` — 应用领域总索引

---

> 📅 最后更新: 2026-04-27

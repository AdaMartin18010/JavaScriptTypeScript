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

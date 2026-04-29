# WebXR — 理论基础

> **定位**：`20-code-lab/20.5-frontend-frameworks/webxr`
> **关联**：`50-browser-runtime` | `36-web-assembly`

---

## 1. WebXR 定义

WebXR 是 Web 上的虚拟现实（VR）和增强现实（AR）API：

- **WebXR Device API**: 访问 VR/AR 设备（头戴显示器、手柄）
- **WebXR Hit Test API**: AR 中的射线检测（平面识别）
- **WebXR Lighting Estimation**: AR 环境光照估计
- **WebXR Depth Sensing**: AR 深度感知
- **WebXR Hand Input**: 手部追踪输入

---

## 2. 坐标系与空间

| 参考空间 | 用途 | 适用场景 |
|----------|------|----------|
| `local` | 设备初始位置的参考系 |  seated VR |
| `local-floor` | 用户站立的地面参考系 | 站立 VR |
| `bounded-floor` | VR 中的安全边界区域 | Room-scale VR |
| `unbounded` | AR 中的无限制空间追踪 | 移动 AR |
| `viewer` | 以 viewer 为中心的射线检测 | Hit Test |

---

## 3. 完整 AR 会话示例

### 3.1 启动 AR 会话与平面检测

```typescript
// ar-session.ts

async function startARSession(canvas: HTMLCanvasElement) {
  if (!navigator.xr) {
    throw new Error('WebXR not supported on this browser');
  }

  // 检查是否支持 immersive-ar
  const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
  if (!isSupported) {
    throw new Error('immersive-ar not supported');
  }

  // 请求 AR 会话
  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.getElementById('overlay')! },
    optionalFeatures: ['light-estimation', 'depth-sensing'],
  });

  // 创建 WebGL 上下文
  const gl = canvas.getContext('webgl2', { xrCompatible: true })!;
  const renderer = new THREE.WebGLRenderer({ context: gl, canvas });
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();

  // 创建 XR 参考空间
  const referenceSpace = await session.requestReferenceSpace('local-floor');
  const viewerSpace = await session.requestReferenceSpace('viewer');

  // 配置 Hit Test：从屏幕中心发射射线检测真实平面
  const hitTestSource = await session.requestHitTestSource?.({
    space: viewerSpace,
    offsetRay: new XRRay(),
  });

  // 光照估计
  const lightProbe = await session.requestLightProbe?.();

  const xrLayer = new XRWebGLLayer(session, gl);
  session.updateRenderState({ baseLayer: xrLayer });

  // 渲染循环
  const onXRFrame = (time: DOMHighResTimeStamp, frame: XRFrame) => {
    const pose = frame.getViewerPose(referenceSpace);
    if (!pose) {
      session.requestAnimationFrame(onXRFrame);
      return;
    }

    const glLayer = session.renderState.baseLayer!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    renderer.clear();

    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view)!;
      renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);

      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);

      renderer.render(scene, camera);
    }

    // 执行 Hit Test
    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        if (hitPose) {
          // 在检测到的平面上放置虚拟对象
          placeObjectAtHit(scene, hitPose.transform);
        }
      }
    }

    // 更新环境光照
    if (lightProbe) {
      const lightEstimate = frame.getLightEstimate?.(lightProbe);
      if (lightEstimate) {
        updateSceneLighting(scene, lightEstimate);
      }
    }

    session.requestAnimationFrame(onXRFrame);
  };

  session.requestAnimationFrame(onXRFrame);
  return session;
}

function placeObjectAtHit(scene: THREE.Scene, transform: XRPose['transform']) {
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  const matrix = new THREE.Matrix4();
  matrix.fromArray(transform.matrix);
  cube.applyMatrix4(matrix);

  scene.add(cube);
}

function updateSceneLighting(scene: THREE.Scene, estimate: XRLightEstimate) {
  const intensity = estimate.primaryLightIntensity?.w ?? 1.0;
  const direction = estimate.primaryLightDirection;
  const color = estimate.primaryLightIntensity;

  const light = scene.getObjectByName('primary-light') as THREE.DirectionalLight;
  if (light) {
    light.intensity = intensity;
    light.position.set(direction.x, direction.y, direction.z);
    if (color) {
      light.color.setRGB(color.x, color.y, color.z);
    }
  }
}
```

### 3.2 VR 沉浸式会话与手柄输入

```typescript
// vr-session.ts

interface VRInputState {
  grip: THREE.Group;
  targetRay: THREE.Line;
  gamepad: Gamepad | null;
}

async function startVRSession(canvas: HTMLCanvasElement) {
  const session = await navigator.xr!.requestSession('immersive-vr', {
    requiredFeatures: ['local-floor'],
  });

  const gl = canvas.getContext('webgl2', { xrCompatible: true })!;
  const renderer = new THREE.WebGLRenderer({ context: gl, canvas });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();

  const referenceSpace = await session.requestReferenceSpace('local-floor');
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

  // 控制器追踪
  const controllerModels = new Map<XRInputSource, VRInputState>();

  session.addEventListener('inputsourceschange', (evt) => {
    for (const input of evt.added) {
      if (input.targetRayMode === 'tracked-pointer') {
        const grip = new THREE.Group();
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1),
        ]);
        const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        grip.add(line);
        scene.add(grip);

        controllerModels.set(input, {
          grip,
          targetRay: line,
          gamepad: input.gamepad || null,
        });
      }
    }

    for (const input of evt.removed) {
      const state = controllerModels.get(input);
      if (state) {
        scene.remove(state.grip);
        controllerModels.delete(input);
      }
    }
  });

  const onXRFrame = (time: DOMHighResTimeStamp, frame: XRFrame) => {
    const pose = frame.getViewerPose(referenceSpace);
    if (!pose) {
      session.requestAnimationFrame(onXRFrame);
      return;
    }

    // 更新控制器姿态
    for (const input of session.inputSources) {
      const state = controllerModels.get(input);
      if (!state) continue;

      const gripPose = frame.getPose(input.gripSpace!, referenceSpace);
      if (gripPose) {
        state.grip.matrix.fromArray(gripPose.transform.matrix);
        state.grip.updateMatrixWorld(true);
      }

      // 读取手柄按钮状态
      if (state.gamepad) {
        const trigger = state.gamepad.buttons[0];
        if (trigger?.pressed) {
          // 触发选择动作
          performSelection(state.grip.position, state.grip.quaternion);
        }
      }
    }

    // 渲染双眼视图
    const glLayer = session.renderState.baseLayer!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    renderer.clear();

    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view)!;
      renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);
      renderer.render(scene, camera);
    }

    session.requestAnimationFrame(onXRFrame);
  };

  session.requestAnimationFrame(onXRFrame);
}

function performSelection(position: THREE.Vector3, quaternion: THREE.Quaternion) {
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
  raycaster.set(position, direction);
  // 与场景对象进行交互...
}
```

---

## 4. 性能优化要点

```typescript
// 单眼渲染优化（foveated rendering 准备）
function optimizeForXR(renderer: THREE.WebGLRenderer, session: XRSession) {
  // 禁用不必要的后处理
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  // 使用 instanced mesh 减少 draw call
  const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 1000; i++) {
    dummy.position.set(Math.random() * 10 - 5, Math.random() * 10, Math.random() * 10 - 5);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }
  scene.add(instancedMesh);

  // 固定时间步长物理更新
  const FIXED_TIME_STEP = 1 / 90; // 90Hz 刷新率
  let accumulator = 0;

  return (deltaTime: number) => {
    accumulator += deltaTime;
    while (accumulator >= FIXED_TIME_STEP) {
      updatePhysics(FIXED_TIME_STEP);
      accumulator -= FIXED_TIME_STEP;
    }
  };
}
```

---

## 5. 与相邻模块的关系

- **50-browser-runtime**: 浏览器设备 API
- **36-web-assembly**: WebXR 中的高性能计算（物理模拟、音频处理）
- **51-ui-components**: XR 环境中的 UI 设计（如 3D 悬浮面板）

---

## 6. 参考资源

### 官方规范
- [WebXR Device API — W3C Working Draft](https://immersive-web.github.io/webxr/) — WebXR 核心规范
- [WebXR Hit Test Module](https://immersive-web.github.io/hit-test/) — AR 射线检测规范
- [WebXR Lighting Estimation](https://immersive-web.github.io/lighting-estimation/) — 环境光照估计
- [WebXR Hand Input](https://immersive-web.github.io/webxr-hand-input/) — 手部追踪规范

### 开发框架与工具
- [Three.js — WebXR 支持](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content) — 最流行的 Web 3D 库
- [Babylon.js WebXR](https://doc.babylonjs.com/features/featuresDeepDive/webXR) — 功能完整的 Web 3D 引擎
- [A-Frame](https://aframe.io/) — 声明式 WebVR/WebXR 框架
- [Wonderland Engine](https://wonderlandengine.com/) — 面向 WebXR 的 WebAssembly 3D 引擎

### 平台与浏览器支持
- [Chrome WebXR 支持状态](https://chromestatus.com/feature/5680168605812736) — Chrome 实现进度
- [Meta Quest Browser 开发](https://developer.oculus.com/documentation/web/) — Quest 设备 WebXR 开发指南
- [8th Wall](https://www.8thwall.com/) — 跨平台 WebAR 商业解决方案

### 示例与学习
- [WebXR Samples — Immersive Web Working Group](https://immersive-web.github.io/webxr-samples/) — 官方示例集合
- [Three.js Journey — WebXR 章节](https://threejs-journey.com/) — 系统化的 Three.js 课程

---

*最后更新: 2026-04-29*

# WebXR 基础与设备检测

> 文件: `01-webxr-basics.ts` | 难度: ⭐⭐⭐ (中级)

---

## 核心概念

### WebXR Device API 架构

```
┌─────────────────────────────────────────┐
│           应用层 (Application)            │
├─────────────────────────────────────────┤
│         WebXR Device API                │
│  ├─ XRSystem (设备管理)                 │
│  ├─ XRSession (会话管理)                │
│  ├─ XRFrame (帧数据)                    │
│  ├─ XRReferenceSpace (坐标空间)         │
│  └─ XRView / XRPose (视图与姿态)        │
├─────────────────────────────────────────┤
│      底层运行时 (OpenXR / 平台 SDK)      │
└─────────────────────────────────────────┘
```

### 会话模式

| 模式 | 描述 | 典型设备 |
|------|------|----------|
| `inline` | 在普通页面内渲染，无沉浸式 | 所有设备 |
| `immersive-vr` | 完全沉浸式 VR | Meta Quest, PS VR2, Apple Vision Pro |
| `immersive-ar` | 透传式 AR | HoloLens, Magic Leap, 手机 AR |

### 参考空间选择策略

```typescript
// VR 游戏（站立体验）
const vrConfig: XRSessionConfig = {
  mode: 'immersive-vr',
  requiredFeatures: ['local-floor'],
};

// AR 应用（平面检测）
const arConfig: XRSessionConfig = {
  mode: 'immersive-ar',
  requiredFeatures: ['hit-test', 'dom-overlay'],
  optionalFeatures: ['anchors'],
};
```

---

## 设备检测最佳实践

### 渐进式增强

```typescript
async function initXR() {
  const support = await detectXRSupport();

  if (!support.supported) {
    // 降级到 WebGL 预览模式
    return initFallbackPreview();
  }

  if (support.immersiveAR) {
    return initAR();
  }

  if (support.immersiveVR) {
    return initVR();
  }

  // 最低降级：inline 模式
  return initInline();
}
```

### 用户手势要求

WebXR 会话必须由用户手势触发（点击、触摸）：

```typescript
button.addEventListener('click', async () => {
  // ✅ 正确：在用户手势中请求会话
  await manager.requestSession({ mode: 'immersive-vr' });
});

// ❌ 错误：自动启动会被浏览器拦截
setTimeout(() => manager.requestSession(...), 1000);
```

---

## 会话生命周期

```
 idle → requesting → active → visible → ending → ended
              ↑_________________↓
```

| 状态 | 说明 |
|------|------|
| `idle` | 未启动 |
| `requesting` | 正在请求硬件访问 |
| `active` | 会话已建立，渲染循环运行中 |
| `visible` | 页面可见性变化（如用户摘下头显） |
| `ending` | 正在结束会话 |
| `ended` | 已结束，可重新请求 |

---

## 渲染循环与参考空间

### 核心 requestAnimationFrame 渲染循环

```typescript
// webxr-render-loop.ts
let xrSession: XRSession | null = null;
let xrRefSpace: XRReferenceSpace | null = null;
let gl: WebGL2RenderingContext;

async function onSessionStarted(session: XRSession) {
  xrSession = session;
  const canvas = document.createElement('canvas');
  gl = canvas.getContext('webgl2', { xrCompatible: true })!;
  await gl.makeXRCompatible();

  // 请求 'local-floor' 参考空间（以地面为原点的站立空间）
  xrRefSpace = await session.requestReferenceSpace('local-floor');

  // 创建 WebGL 层并绑定到会话
  const baseLayer = new XRWebGLLayer(session, gl);
  session.updateRenderState({ baseLayer });

  // 启动渲染循环
  session.requestAnimationFrame(onXRFrame);
}

function onXRFrame(time: DOMHighResTimeStamp, frame: XRFrame) {
  if (!xrSession || !xrRefSpace) return;

  // 请求下一帧
  xrSession.requestAnimationFrame(onXRFrame);

  const pose = frame.getViewerPose(xrRefSpace);
  if (!pose) return;

  const glLayer = xrSession.renderState.baseLayer!;

  // 为每只眼睛渲染
  for (const view of pose.views) {
    const viewport = glLayer.getViewport(view)!;
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    // 获取视图矩阵与投影矩阵
    const viewMatrix = view.transform.inverse.matrix;
    const projMatrix = view.projectionMatrix;

    renderScene(gl, viewMatrix, projMatrix);
  }
}

function renderScene(
  gl: WebGL2RenderingContext,
  viewMatrix: Float32Array,
  projMatrix: Float32Array
) {
  // 清屏
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 使用 viewMatrix + projMatrix 渲染立体场景
  // ... (WebGL 绘制逻辑)
}
```

### Hit-Test（AR 平面检测与射线投射）

```typescript
// webxr-hit-test.ts
let hitTestSource: XRHitTestSource | null = null;

async function startARWithHitTest(session: XRSession) {
  const viewerSpace = await session.requestReferenceSpace('viewer');
  const localFloorSpace = await session.requestReferenceSpace('local-floor');

  // 创建 hit-test 源：从 viewer 空间向下发射射线
  hitTestSource = await session.requestHitTestSource({
    space: viewerSpace,
  });

  function onARFrame(time: DOMHighResTimeStamp, frame: XRFrame) {
    session.requestAnimationFrame(onARFrame);

    const pose = frame.getViewerPose(localFloorSpace);
    if (!pose) return;

    const hitTestResults = frame.getHitTestResults(hitTestSource!);
    if (hitTestResults.length > 0) {
      const hitPose = hitTestResults[0].getPose(localFloorSpace);
      if (hitPose) {
        // hitPose.transform.position 为射线与平面的交点
        placeObjectAt(hitPose.transform.position);
      }
    }

    renderARScene(frame, pose);
  }

  session.requestAnimationFrame(onARFrame);
}

function placeObjectAt(position: DOMPointReadOnly) {
  console.log(`Placing object at (${position.x}, ${position.y}, ${position.z})`);
}
```

### 手部追踪输入处理

```typescript
// webxr-hand-tracking.ts
async function startHandTracking(session: XRSession) {
  // 请求 'hand-tracking' optional feature
  if (!session.enabledFeatures?.has('hand-tracking')) {
    console.warn('Hand tracking not supported');
    return;
  }

  const refSpace = await session.requestReferenceSpace('local-floor');

  function onHandFrame(time: DOMHighResTimeStamp, frame: XRFrame) {
    session.requestAnimationFrame(onHandFrame);

    for (const inputSource of session.inputSources) {
      if (inputSource.hand) {
        // 获取关节数据
        const wrist = inputSource.hand.get('wrist');
        const indexTip = inputSource.hand.get('index-finger-tip');

        if (wrist && indexTip) {
          const wristPose = frame.getJointPose(wrist, refSpace);
          const tipPose = frame.getJointPose(indexTip, refSpace);

          if (wristPose && tipPose) {
            const distance = Math.hypot(
              tipPose.transform.position.x - wristPose.transform.position.x,
              tipPose.transform.position.y - wristPose.transform.position.y,
              tipPose.transform.position.z - wristPose.transform.position.z
            );
            console.log(`Index tip distance from wrist: ${distance.toFixed(3)}m`);
          }
        }
      }
    }
  }

  session.requestAnimationFrame(onHandFrame);
}
```

---

## 参考资源

- [WebXR Device API 规范](https://immersive-web.github.io/webxr/)
- [MDN WebXR 指南](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [WebXR 功能检测](https://github.com/immersive-web/webxr-feature-detect)
- [Immersive Web Working Group — W3C](https://www.w3.org/immersive-web/)
- [Three.js WebXR Documentation](https://threejs.org/docs/#manual/en/introduction/WebXR)
- [Babylon.js WebXR](https://doc.babylonjs.com/features/featuresDeepDive/webXR)
- [WebGL 2.0 Specification — Khronos](https://registry.khronos.org/webgl/specs/latest/2.0/)
- [OpenXR Specification — Khronos](https://www.khronos.org/openxr/)
- [Meta Quest WebXR Best Practices](https://developer.oculus.com/documentation/web/webxr-overview/)
- [web.dev — Building WebXR Experiences](https://web.dev/articles/tags/webxr)
- [Can I Use — WebXR Device API](https://caniuse.com/webxr)
- [Model-Viewer — WebXR Drop-in Component](https://modelviewer.dev/)

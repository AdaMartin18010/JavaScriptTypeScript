---
dimension: 应用领域
application-domain: 游戏与沉浸式图形
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: WebXR / AR / VR — 沉浸式会话管理、空间追踪与手势识别
- **模块编号**: 84-webxr

## 边界说明

本模块聚焦 WebXR 应用开发的核心抽象，包括：
- XR 会话管理与视图渲染
- 空间锚点与命中测试
- 手势追踪与场景图管理

底层 3D 渲染引擎（Three.js/Babylon.js）的详细分类选型不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `01-webxr-basics.ts` | XR 会话初始化、参考空间与渲染循环 | `01-webxr-basics.md` |
| `02-threejs-vr.ts` | Three.js 与 WebXR 集成示例 | `02-threejs-vr.md` |
| `03-hand-tracking.ts` | 手部关节追踪与手势映射 | `03-hand-tracking.md` |
| `04-spatial-computing.ts` | 空间锚点、平面检测与命中测试 | `04-spatial-computing.md` |
| `xr-engine.ts` | 通用 XR 引擎封装（会话 / 输入 / 渲染调度） | `xr-engine.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### WebXR 会话启动与参考空间

```typescript
// 01-webxr-basics.ts
export async function startXRSession(
  mode: 'immersive-vr' | 'immersive-ar'
): Promise<XRSession> {
  if (!navigator.xr) throw new Error('WebXR not supported');

  const isSupported = await navigator.xr.isSessionSupported(mode);
  if (!isSupported) throw new Error(`${mode} not supported`);

  const session = await navigator.xr.requestSession(mode, {
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['hand-tracking'],
  });

  return session;
}
```

### Three.js WebXR 渲染循环

```typescript
// 02-threejs-vr.ts
import * as THREE from 'three';

export function createXRRenderer(session: XRSession): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setSession(session);
  return renderer;
}
```

### 命中测试与空间锚点放置

```typescript
// 04-spatial-computing.ts
export async function placeAnchorAtHit(
  session: XRSession,
  frame: XRFrame,
  refSpace: XRReferenceSpace,
  x: number,
  y: number
): Promise<XRAnchor | null> {
  const viewerPose = frame.getViewerPose(refSpace);
  if (!viewerPose) return null;

  const hits = await (session as any).requestHitTestSource?.({
    space: viewerPose.transform,
  });

  // 简化的命中测试演示
  if ('requestHitTestSourceForTransientInput' in session) {
    // WebXR Hit Test Module
    const hitTestResults = frame.getHitTestResults(hits);
    if (hitTestResults.length > 0) {
      const pose = hitTestResults[0].getPose(refSpace);
      if (pose) {
        const anchor = await (session as any).createAnchor(pose.transform, refSpace);
        return anchor;
      }
    }
  }
  return null;
}
```

## 关联模块

- `58-data-visualization` — 数据可视化（Canvas/SVG 渲染）
- `30-knowledge-base/30.2-categories/34-webxr-ar-vr.md` — WebXR 分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — WebXR Device API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API) |
| Immersive Web Working Group | 规范 | [immersive-web.github.io](https://immersive-web.github.io) |
| Three.js Docs | 文档 | [threejs.org/docs](https://threejs.org/docs) |
| WebXR Samples | 示例 | [immersive-web.github.io/webxr-samples](https://immersive-web.github.io/webxr-samples) |
| Babylon.js Docs | 文档 | [doc.babylonjs.com](https://doc.babylonjs.com) |
| Google AR & VR | 指南 | [developers.google.com/ar/develop/webxr](https://developers.google.com/ar/develop/webxr) |

---

*最后更新: 2026-04-29*

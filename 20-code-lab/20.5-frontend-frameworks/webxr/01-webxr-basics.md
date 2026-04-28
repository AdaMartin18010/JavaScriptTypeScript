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

## 参考资源

- [WebXR Device API 规范](https://immersive-web.github.io/webxr/)
- [MDN WebXR 指南](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [WebXR 功能检测](https://github.com/immersive-web/webxr-feature-detect)

# WebXR — 理论基础

## 1. WebXR 定义

WebXR 是 Web 上的虚拟现实（VR）和增强现实（AR）API：

- **WebXR Device API**: 访问 VR/AR 设备（头戴显示器、手柄）
- **WebXR Hit Test API**: AR 中的射线检测（平面识别）
- **WebXR Lighting Estimation**: AR 环境光照估计

## 2. 坐标系与空间

- **Local Floor**: 用户站立的地面参考系
- **Local**: 设备初始位置的参考系
- **Bounded Floor**: VR 中的安全边界区域
- **Unbounded**: AR 中的无限制空间追踪

## 3. 渲染循环

```javascript
const onXRFrame = (time, frame) => {
  const session = frame.session
  const pose = frame.getViewerPose(referenceSpace)
  if (pose) {
    for (const view of pose.views) {
      // 为每只眼睛渲染视图
    }
  }
  session.requestAnimationFrame(onXRFrame)
}
```

## 4. 与相邻模块的关系

- **50-browser-runtime**: 浏览器设备 API
- **36-web-assembly**: WebXR 中的高性能计算
- **51-ui-components**: XR 环境中的 UI 设计

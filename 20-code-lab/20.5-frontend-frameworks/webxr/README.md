# WebXR 模块

> 模块编号: 84-webxr
> 复杂度: ⭐⭐⭐⭐⭐ (专家级)
> 目标读者: WebXR 开发者、3D 图形工程师

---

## 模块概述

本模块实现 WebXR 设备 API 的核心抽象层，覆盖沉浸式会话管理、空间追踪、手势识别和场景图渲染。

## 核心内容

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `xr-engine.ts` | XR 引擎核心 | 3D 数学、XR 会话、视图渲染、场景图、手势追踪、空间锚点、命中测试 |

## 技术栈

```
3D 数学基础      → Vector3, Quaternion, Matrix4
XR 运行时        → XRSession, XRFrame, XRView
场景管理         → SceneObject（层级变换）
交互输入         → HandTracking（捏合手势检测）
空间持久化       → XRAnchorManager
物理射线         → XRHitTest（射线-平面相交）
```

## 关键概念

- **Reference Space**: 定义 XR 内容的坐标系（viewer / local / local-floor / bounded-floor / unbounded）
- **View**: 单眼渲染参数，包含投影矩阵和视图矩阵
- **Anchor**: 真实世界中的持久化空间锚点
- **Hit Test**: 将屏幕坐标或射线投射到真实世界平面

## 关联模块

- `21-webassembly.md` (docs/categories) — WebAssembly 加速的 3D 渲染
- `20-audio-video.md` (docs/categories) — 沉浸式音视频

## 参考资源

- [WebXR Device API 规范](https://immersive-web.github.io/webxr/)
- [MDN WebXR 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

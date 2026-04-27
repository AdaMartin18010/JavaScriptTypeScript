---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# WebXR / AR / VR 与游戏（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦沉浸式应用与游戏开发技术，底层 3D 渲染引擎和图形库的分类请参见 `docs/categories/04-data-visualization.md`（3D 可视化章节）和 `docs/categories/17-animation.md`。

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| WebXR API | 原生 WebXR Device API | VR/AR 沉浸式体验 |
| 3D 引擎 | Three.js, Babylon.js | 3D 场景、游戏、可视化 |
| 2D 游戏 | PixiJS, Phaser, Kaboom.js | 2D 游戏、交互应用 |
| AR 库 | 8th Wall, Zappar, MindAR | 图像识别 AR、WebAR |
| 物理引擎 | Cannon-es, Matter.js | 刚体物理、碰撞检测 |

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

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ VR/AR 应用                          ├─ WebGL / WebGPU API
├─ 浏览器游戏                          ├─ 着色器语言 (GLSL/WGSL)
├─ 沉浸式数据可视化                    ├─ 3D 模型格式 (GLTF/OBJ)
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

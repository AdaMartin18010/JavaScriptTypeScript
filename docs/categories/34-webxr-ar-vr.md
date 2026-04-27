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

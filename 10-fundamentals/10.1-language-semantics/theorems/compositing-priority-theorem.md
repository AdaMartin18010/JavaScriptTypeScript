# 定理 4：合成优先定理

> **定位**：`10-fundamentals/10.1-language-semantics/theorems/`
> **关联**：`30-knowledge-base/30.6-patterns/RENDERING_PERFORMANCE.md`

---

## 定理陈述

**合成优先定理**：`transform: translate()` 与 `top`/`left` 动画在视觉上等价，但前者跳过 Layout 与 Paint 阶段，由 Compositor Thread 独立处理，因此即使主线程被 JS 阻塞，动画仍保持流畅。

---

## 推理树

```
                    [公理1: 渲染管道五阶段公理]
                    JS → Style → Layout → Paint → Composite
                           │
                    [公理2: 帧预算公理]
                    60fps = 16.6ms/帧，实际可用 ≈ 10ms
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    [引理: 属性变更触发阶段不同]      [引理: Compositor Thread 独立]
    不同 CSS 属性影响不同渲染阶段       合成线程独立于主线程运行
              │                         │
              └────────────┬────────────┘
                           ▼
              [三种渲染路径]
                           │
              变更什么属性？
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         几何属性      视觉属性      合成属性
         width        color         transform
         height       background    opacity
         top          box-shadow
         left         visibility
              │            │            │
              ▼            ▼            ▼
         [完整管道]    [绘制+合成]    [仅合成]
         5阶段全走     跳过 Layout    跳过 Layout+Paint
         成本最高      成本中等       成本最低
              │            │            │
              │            │            ▼
              │            │       GPU 直接处理
              │            │       主线程阻塞无关
              │            │            │
              └────────────┴────────────┘
                           ▼
              [合成优先策略]
              所有位移动画使用 transform
              所有淡入淡出使用 opacity
              避免触发 Layout（Reflow）
```

---

## 性能数据对比

| 动画类型 | 触发阶段 | GPU参与 | 主线程依赖 | 帧率稳定性 |
|---------|---------|---------|-----------|-----------|
| `top: 0 → 100px` | JS→Style→Layout→Paint→Composite | 仅Composite | 高 | ❌ 易掉帧 |
| `transform: translateY(100px)` | JS→Style→Composite | 全程 | 无 | ✅ 稳定60fps |

---

## 场景树：交互场景渲染策略

```
交互场景
├── 高频动画（滚动/拖拽）
│   └── 策略：仅 transform/opacity
│   └── 原理：Compositor Thread 独立处理
│
├── 内容变更（文本/图片更新）
│   └── 策略：content-visibility: auto
│   └── 原理：延迟视口外元素 Layout/Paint
│
├── 复杂列表（虚拟滚动）
│   └── 策略：虚拟化 + requestIdleCallback
│   └── 原理：减少 DOM 节点数，利用空闲时间预渲染
│
└── 用户输入（表单/按钮）
    └── 策略：防抖/节流 + CSS 过渡
    └── 原理：控制 JS 执行频率，避免阻塞输入响应
```

---

*本定理为 TS/JS 软件堆栈全景分析论证的五大核心定理之四。*

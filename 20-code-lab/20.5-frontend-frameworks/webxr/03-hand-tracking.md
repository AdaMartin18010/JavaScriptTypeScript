# 手势追踪与交互

> 文件: `03-hand-tracking.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## WebXR Hand Tracking API

### 25 关节骨骼模型

```
                    ┌─ thumb-tip
              thumb─┼─ thumb-phalanx-distal
                    ├─ thumb-phalanx-proximal
                    └─ thumb-metacarpal

                    ┌─ index-finger-tip
          index ────┼─ index-finger-phalanx-distal
                    ├─ index-finger-phalanx-intermediate
                    ├─ index-finger-phalanx-proximal
                    └─ index-finger-metacarpal

                    ┌─ middle-finger-tip
         middle ────┼─ middle-finger-phalanx-distal
                    ├─ middle-finger-phalanx-intermediate
                    ├─ middle-finger-phalanx-proximal
                    └─ middle-finger-metacarpal

                    ┌─ ring-finger-tip
           ring ────┼─ ring-finger-phalanx-distal
                    ├─ ring-finger-phalanx-intermediate
                    ├─ ring-finger-phalanx-proximal
                    └─ ring-finger-metacarpal

                    ┌─ pinky-finger-tip
          pinky ────┼─ pinky-finger-phalanx-distal
                    ├─ pinky-finger-phalanx-intermediate
                    ├─ pinky-finger-phalanx-proximal
                    └─ pinky-finger-metacarpal

                        wrist
```

### 启用 Hand Tracking

```typescript
const session = await navigator.xr.requestSession('immersive-vr', {
  requiredFeatures: ['hand-tracking'],
});

// 获取手部输入源
const inputSources = session.inputSources;
for (const input of inputSources) {
  if (input.hand) {
    // 追踪到一只手
    const skeleton = input.hand; // XRHand 实例
  }
}
```

---

## 手势识别策略

### 基于几何特征的方法

| 手势 | 特征条件 |
|------|----------|
| **Open Palm** | 所有指尖到腕部距离 > 阈值 |
| **Fist** | 所有指尖到对应掌指关节距离 < 阈值 |
| **Point** | 仅食指伸直，其余弯曲 |
| **Pinch** | 拇指尖与食指尖距离 < 15mm |
| **Thumbs Up** | 拇指伸直朝上，其余四指握拳 |

### 基于机器学习的识别（生产环境推荐）

```typescript
// 使用 MediaPipe Hands 或自定义模型
const gestureModel = await tf.loadLayersModel('/models/gesture-model.json');

function recognizeWithML(joints: Float32Array): GestureType {
  const input = tf.tensor2d([joints], [1, 75]); // 25 joints × 3 coords
  const prediction = gestureModel.predict(input) as tf.Tensor;
  const probabilities = prediction.dataSync();
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  return GESTURE_LABELS[maxIndex];
}
```

---

## 交互设计原则

### 手势交互的 UX 准则

1. **即时视觉反馈** — 手势被识别后应立即有视觉确认
2. **防误触** — 需要持续 300-500ms 才触发操作
3. **舒适区域** — 交互对象应位于用户手臂自然活动范围内
4. **替代方案** — 提供手势之外的备用交互方式

### 射线交互 vs 直接操作

```
射线交互 (Ray Casting)          直接操作 (Direct Manipulation)
├─ 远距离选择                    ├─ 近距离抓取
├─ 类似激光笔的指向              ├─ 手指触碰虚拟物体
├─ 适合 UI 菜单                  ├─ 适合物理模拟
└─ 食指伸直作为指针              └─ 捏合手势抓取
```

---

## 性能考量

- **关节数据更新率**: 通常与显示刷新率同步（72-90Hz）
- **手势识别延迟**: 目标 < 50ms
- **平滑处理**: 对关节位置进行低通滤波以减少抖动

```typescript
// 一阶低通滤波
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// t 取值 0.1-0.3，越小越平滑但延迟越大
const smoothedX = lerp(prevX, rawX, 0.2);
```

---

## 参考资源

- [WebXR Hand Input 规范](https://immersive-web.github.io/webxr-hand-input/)
- [Meta Hand Tracking 文档](https://developer.oculus.com/documentation/web/webxr-hand-tracking/)
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)

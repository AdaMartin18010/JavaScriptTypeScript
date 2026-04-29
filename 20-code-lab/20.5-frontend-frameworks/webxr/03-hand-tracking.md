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

## 代码示例：射线交互与碰撞检测

```typescript
// 03-hand-tracking.ts — 射线交互实现
interface JointPose {
  transform: XRPose['transform']; // 包含 position 和 orientation
}

function getRayFromIndexFinger(hand: XRHand): { origin: DOMPointReadOnly; direction: DOMPointReadOnly } {
  const indexTip = hand.get('index-finger-tip');
  const indexProximal = hand.get('index-finger-phalanx-proximal');
  
  if (!indexTip || !indexProximal) {
    throw new Error('Index finger joints not available');
  }

  const origin = indexTip.transform.position;
  const direction = new DOMPointReadOnly(
    indexTip.transform.position.x - indexProximal.transform.position.x,
    indexTip.transform.position.y - indexProximal.transform.position.y,
    indexTip.transform.position.z - indexProximal.transform.position.z,
    0
  );

  return { origin, direction };
}

// 简单的射线与平面碰撞检测
function rayPlaneIntersect(
  rayOrigin: DOMPointReadOnly,
  rayDir: DOMPointReadOnly,
  planePoint: DOMPointReadOnly,
  planeNormal: DOMPointReadOnly
): DOMPointReadOnly | null {
  const denom = rayDir.x * planeNormal.x + rayDir.y * planeNormal.y + rayDir.z * planeNormal.z;
  if (Math.abs(denom) < 1e-6) return null; // 射线与平面平行

  const diffX = planePoint.x - rayOrigin.x;
  const diffY = planePoint.y - rayOrigin.y;
  const diffZ = planePoint.z - rayOrigin.z;
  const t = (diffX * planeNormal.x + diffY * planeNormal.y + diffZ * planeNormal.z) / denom;
  
  if (t < 0) return null; // 交点在射线反方向

  return new DOMPointReadOnly(
    rayOrigin.x + rayDir.x * t,
    rayOrigin.y + rayDir.y * t,
    rayOrigin.z + rayDir.z * t,
    1
  );
}

// 在 XR 渲染循环中使用
function onXRFrame(time: DOMHighResTimeStamp, frame: XRFrame) {
  const session = frame.session;
  const referenceSpace = renderer.xr.getReferenceSpace()!;

  for (const inputSource of session.inputSources) {
    if (!inputSource.hand) continue;

    const hand = inputSource.hand;
    const { origin, direction } = getRayFromIndexFinger(hand);

    // 检测是否与 UI 平面相交
    const hit = rayPlaneIntersect(
      origin,
      direction,
      new DOMPointReadOnly(0, 1.2, -0.5, 1), // UI 平面中心
      new DOMPointReadOnly(0, 0, 1, 0)       // UI 平面法向量
    );

    if (hit) {
      // 更新光标位置，触发 hover 效果
      cursorMesh.position.set(hit.x, hit.y, hit.z);
    }
  }

  renderer.render(scene, camera);
}
```

## 代码示例：捏合手势（Pinch）抓取物体

```typescript
// 03-hand-tracking.ts — 捏合手势识别与物体抓取
class PinchGrabController {
  private isGrabbing = false;
  private grabbedObject: THREE.Object3D | null = null;
  private pinchThreshold = 0.025; // 25mm
  private releaseThreshold = 0.035; // 35mm（施密特触发，防止抖动）

  private getJointDistance(hand: XRHand, jointA: string, jointB: string): number {
    const poseA = hand.get(jointA as XRHandJoint);
    const poseB = hand.get(jointB as XRHandJoint);
    if (!poseA || !poseB) return Infinity;

    const dx = poseA.transform.position.x - poseB.transform.position.x;
    const dy = poseA.transform.position.y - poseB.transform.position.y;
    const dz = poseA.transform.position.z - poseB.transform.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  update(hand: XRHand, sceneObjects: THREE.Object3D[]) {
    const pinchDistance = this.getJointDistance(hand, 'thumb-tip', 'index-finger-tip');

    if (!this.isGrabbing && pinchDistance < this.pinchThreshold) {
      // 开始抓取
      this.isGrabbing = true;
      const thumbPos = hand.get('thumb-tip')!.transform.position;
      
      // 查找最近的物体
      let closest: THREE.Object3D | null = null;
      let closestDist = Infinity;
      for (const obj of sceneObjects) {
        const dist = obj.position.distanceTo(new THREE.Vector3(thumbPos.x, thumbPos.y, thumbPos.z));
        if (dist < closestDist && dist < 0.1) { // 10cm 抓取范围
          closest = obj;
          closestDist = dist;
        }
      }
      this.grabbedObject = closest;
    } else if (this.isGrabbing && pinchDistance > this.releaseThreshold) {
      // 释放
      this.isGrabbing = false;
      this.grabbedObject = null;
    }

    // 跟随手部移动
    if (this.isGrabbing && this.grabbedObject) {
      const indexTip = hand.get('index-finger-tip')!.transform.position;
      this.grabbedObject.position.set(indexTip.x, indexTip.y, indexTip.z);
    }
  }
}
```

---

## 参考资源

- [WebXR Hand Input 规范](https://immersive-web.github.io/webxr-hand-input/)
- [Meta Hand Tracking 文档](https://developer.oculus.com/documentation/web/webxr-hand-tracking/)
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [MDN WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API) — WebXR 核心 API 权威文档
- [W3C WebXR Specification](https://www.w3.org/TR/webxr/) — WebXR 正式规范
- [Immersive Web Working Group](https://www.w3.org/immersive-web/) — WebXR 标准制定组织
- [Three.js WebXR Examples](https://threejs.org/examples/?q=webxr) — Three.js WebXR 官方示例
- [A-Frame Hand Tracking](https://aframe.io/docs/master/components/hand-tracking.html) — A-Frame 手势追踪组件
- [Google AR Core Hand Tracking](https://developers.google.com/ar/develop/java/hand-tracking) — ARCore 手势追踪
- [Apple VisionOS Hand Tracking](https://developer.apple.com/documentation/visionos/hand-tracking) — visionOS 手势交互指南

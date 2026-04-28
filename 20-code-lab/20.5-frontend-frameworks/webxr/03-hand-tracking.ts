/**
 * @file 手势追踪与交互
 * @category WebXR → Hand Tracking
 * @difficulty hard
 * @tags webxr, hand-tracking, gesture, interaction, spatial-input
 *
 * @description
 * WebXR Hand Tracking API 允许应用追踪用户双手的 25 个关节点，
 * 实现自然、无控制器的手势交互。
 */

// ============================================================================
// 1. 手部骨骼数据模型
// ============================================================================

/** 单关节 */
export interface HandJoint {
  name: HandJointName;
  position: { x: number; y: number; z: number };
  radius: number; // 关节球半径（近似）
}

/** 25 个标准关节名称（符合 WebXR 规范） */
export type HandJointName =
  | 'wrist'
  | 'thumb-metacarpal' | 'thumb-phalanx-proximal' | 'thumb-phalanx-distal' | 'thumb-tip'
  | 'index-finger-metacarpal' | 'index-finger-phalanx-proximal' | 'index-finger-phalanx-intermediate' | 'index-finger-phalanx-distal' | 'index-finger-tip'
  | 'middle-finger-metacarpal' | 'middle-finger-phalanx-proximal' | 'middle-finger-phalanx-intermediate' | 'middle-finger-phalanx-distal' | 'middle-finger-tip'
  | 'ring-finger-metacarpal' | 'ring-finger-phalanx-proximal' | 'ring-finger-phalanx-intermediate' | 'ring-finger-phalanx-distal' | 'ring-finger-tip'
  | 'pinky-finger-metacarpal' | 'pinky-finger-phalanx-proximal' | 'pinky-finger-phalanx-intermediate' | 'pinky-finger-phalanx-distal' | 'pinky-finger-tip';

/** 单手完整数据 */
export interface HandData {
  handedness: 'left' | 'right';
  joints: Map<HandJointName, HandJoint>;
  skeleton?: Float32Array; // 4x4 矩阵数组，用于蒙皮
}

// ============================================================================
// 2. 手势识别引擎
// ============================================================================

export type GestureType =
  | 'open-palm'
  | 'fist'
  | 'point'
  | 'pinch'
  | 'grab'
  | 'thumbs-up'
  | 'peace'
  | 'ok'
  | 'unknown';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export class GestureRecognizer {
  private previousGesture: GestureType = 'unknown';
  private gestureStartTime = 0;
  private holdThreshold = 500; // ms

  recognize(hand: HandData): GestureResult {
    const joints = hand.joints;

    // 获取关键关节
    const wrist = joints.get('wrist')!;
    const thumbTip = joints.get('thumb-tip')!;
    const indexTip = joints.get('index-finger-tip')!;
    const middleTip = joints.get('middle-finger-tip')!;
    const ringTip = joints.get('ring-finger-tip')!;
    const pinkyTip = joints.get('pinky-finger-tip')!;

    const indexBase = joints.get('index-finger-phalanx-proximal')!;
    const middleBase = joints.get('middle-finger-phalanx-proximal')!;
    const ringBase = joints.get('ring-finger-phalanx-proximal')!;
    const pinkyBase = joints.get('pinky-finger-phalanx-proximal')!;

    // 计算各指尖到腕部的距离
    const dIndex = this.distance(indexTip.position, wrist.position);
    const dMiddle = this.distance(middleTip.position, wrist.position);
    const dRing = this.distance(ringTip.position, wrist.position);
    const dPinky = this.distance(pinkyTip.position, wrist.position);
    const dThumb = this.distance(thumbTip.position, wrist.position);

    // 计算指尖到对应掌指关节的距离（判断是否弯曲）
    const foldIndex = this.distance(indexTip.position, indexBase.position);
    const foldMiddle = this.distance(middleTip.position, middleBase.position);
    const foldRing = this.distance(ringTip.position, ringBase.position);
    const foldPinky = this.distance(pinkyTip.position, pinkyBase.position);

    // 拇指与食指距离（捏合检测）
    const thumbIndexDist = this.distance(thumbTip.position, indexTip.position);

    const avgFold = (foldIndex + foldMiddle + foldRing + foldPinky) / 4;
    const isCurled = avgFold < 0.05;
    const isExtended = avgFold > 0.08;

    // 手势判断逻辑
    let gesture: GestureType = 'unknown';
    let confidence = 0.5;

    if (thumbIndexDist < 0.015) {
      gesture = 'pinch';
      confidence = 1 - thumbIndexDist / 0.015;
    } else if (isCurled && dThumb < 0.06) {
      gesture = 'fist';
      confidence = 0.9;
    } else if (isExtended && foldIndex > 0.08 && foldMiddle < 0.05 && foldRing < 0.05 && foldPinky < 0.05) {
      gesture = 'point';
      confidence = 0.85;
    } else if (isExtended) {
      gesture = 'open-palm';
      confidence = 0.8;
    }

    // 持续手势计时
    if (gesture !== this.previousGesture) {
      this.gestureStartTime = performance.now();
      this.previousGesture = gesture;
    }

    const duration = performance.now() - this.gestureStartTime;

    return {
      type: gesture,
      confidence,
      metadata: {
        duration,
        isHeld: duration > this.holdThreshold,
        thumbIndexDist,
      },
    };
  }

  private distance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }
}

// ============================================================================
// 3. 手部射线交互
// ============================================================================

export interface RayIntersection {
  objectId: string;
  point: { x: number; y: number; z: number };
  distance: number;
  normal?: { x: number; y: number; z: number };
}

export class HandRayInteractor {
  private rayOrigin = { x: 0, y: 0, z: 0 };
  private rayDirection = { x: 0, y: 0, z: -1 };
  private maxDistance = 10;

  /** 从食指指尖发射射线 */
  updateFromIndexFinger(hand: HandData): void {
    const wrist = hand.joints.get('wrist')!;
    const indexTip = hand.joints.get('index-finger-tip')!;
    const indexProximal = hand.joints.get('index-finger-phalanx-proximal')!;

    this.rayOrigin = { ...indexTip.position };

    // 方向：从掌指关节指向指尖（更稳定）
    const dx = indexTip.position.x - indexProximal.position.x;
    const dy = indexTip.position.y - indexProximal.position.y;
    const dz = indexTip.position.z - indexProximal.position.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    this.rayDirection = {
      x: dx / len,
      y: dy / len,
      z: dz / len,
    };
  }

  /** 射线与球体相交测试 */
  intersectSphere(
    center: { x: number; y: number; z: number },
    radius: number
  ): { hit: boolean; distance: number; point: { x: number; y: number; z: number } } | null {
    const oc = {
      x: this.rayOrigin.x - center.x,
      y: this.rayOrigin.y - center.y,
      z: this.rayOrigin.z - center.z,
    };

    const a = this.rayDirection.x ** 2 + this.rayDirection.y ** 2 + this.rayDirection.z ** 2;
    const b = 2 * (oc.x * this.rayDirection.x + oc.y * this.rayDirection.y + oc.z * this.rayDirection.z);
    const c = oc.x ** 2 + oc.y ** 2 + oc.z ** 2 - radius ** 2;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return null;

    const distance = (-b - Math.sqrt(discriminant)) / (2 * a);

    if (distance < 0 || distance > this.maxDistance) return null;

    return {
      hit: true,
      distance,
      point: {
        x: this.rayOrigin.x + this.rayDirection.x * distance,
        y: this.rayOrigin.y + this.rayDirection.y * distance,
        z: this.rayOrigin.z + this.rayDirection.z * distance,
      },
    };
  }

  getRay(): { origin: typeof this.rayOrigin; direction: typeof this.rayDirection } {
    return { origin: this.rayOrigin, direction: this.rayDirection };
  }
}

// ============================================================================
// 4. 手势状态机与事件系统
// ============================================================================

export type HandEventType = 'gesturestart' | 'gesturehold' | 'gestureend' | 'pinchstart' | 'pinchend' | 'hover' | 'select';

export interface HandEvent {
  type: HandEventType;
  hand: 'left' | 'right';
  gesture: GestureType;
  position: { x: number; y: number; z: number };
  timestamp: number;
}

export class HandInteractionManager {
  private recognizer = new GestureRecognizer();
  private rayInteractor = new HandRayInteractor();
  private listeners: Map<HandEventType, Set<(event: HandEvent) => void>> = new Map();
  private activeGestures = new Map<'left' | 'right', { gesture: GestureType; startTime: number }>();

  on(event: HandEventType, handler: (event: HandEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)!.delete(handler);
  }

  private emit(event: HandEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  /** 处理一帧手部数据 */
  processFrame(hand: HandData): void {
    const result = this.recognizer.recognize(hand);
    const wrist = hand.joints.get('wrist')!;
    const active = this.activeGestures.get(hand.handedness);

    // 手势开始
    if (!active || active.gesture !== result.type) {
      if (active) {
        this.emit({
          type: 'gestureend',
          hand: hand.handedness,
          gesture: active.gesture,
          position: wrist.position,
          timestamp: performance.now(),
        });
      }

      this.activeGestures.set(hand.handedness, {
        gesture: result.type,
        startTime: performance.now(),
      });

      this.emit({
        type: 'gesturestart',
        hand: hand.handedness,
        gesture: result.type,
        position: wrist.position,
        timestamp: performance.now(),
      });

      // 特定手势的即时事件
      if (result.type === 'pinch') {
        this.emit({
          type: 'pinchstart',
          hand: hand.handedness,
          gesture: 'pinch',
          position: wrist.position,
          timestamp: performance.now(),
        });
      }
    }

    // 持续手势
    if (active && result.metadata?.isHeld) {
      this.emit({
        type: 'gesturehold',
        hand: hand.handedness,
        gesture: result.type,
        position: wrist.position,
        timestamp: performance.now(),
      });
    }

    // 更新射线交互器
    if (result.type === 'point') {
      this.rayInteractor.updateFromIndexFinger(hand);
    }
  }

  getRayInteractor(): HandRayInteractor {
    return this.rayInteractor;
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 手势追踪与交互 ===\n');

  // 模拟手部数据
  const createHand = (handedness: 'left' | 'right'): HandData => {
    const joints = new Map<HandJointName, HandJoint>();
    const baseX = handedness === 'left' ? -0.1 : 0.1;

    joints.set('wrist', { name: 'wrist', position: { x: baseX, y: 1.0, z: 0 }, radius: 0.02 });
    joints.set('thumb-tip', { name: 'thumb-tip', position: { x: baseX + 0.02, y: 1.05, z: -0.01 }, radius: 0.008 });
    joints.set('index-finger-tip', { name: 'index-finger-tip', position: { x: baseX + 0.01, y: 1.12, z: -0.03 }, radius: 0.007 });
    joints.set('index-finger-phalanx-proximal', { name: 'index-finger-phalanx-proximal', position: { x: baseX + 0.01, y: 1.05, z: 0 }, radius: 0.009 });
    joints.set('middle-finger-tip', { name: 'middle-finger-tip', position: { x: baseX, y: 1.11, z: -0.03 }, radius: 0.007 });
    joints.set('ring-finger-tip', { name: 'ring-finger-tip', position: { x: baseX - 0.01, y: 1.10, z: -0.02 }, radius: 0.007 });
    joints.set('pinky-finger-tip', { name: 'pinky-finger-tip', position: { x: baseX - 0.02, y: 1.08, z: -0.01 }, radius: 0.006 });

    return { handedness, joints };
  };

  const hand = createHand('right');

  // 手势识别
  console.log('--- 手势识别 ---');
  const recognizer = new GestureRecognizer();
  const result = recognizer.recognize(hand);
  console.log('检测到的手势:', result.type, '置信度:', result.confidence.toFixed(2));

  // 射线交互
  console.log('\n--- 手部射线 ---');
  const interactor = new HandRayInteractor();
  interactor.updateFromIndexFinger(hand);
  const ray = interactor.getRay();
  console.log('射线起点:', ray.origin);
  console.log('射线方向:', ray.direction);

  const hit = interactor.intersectSphere({ x: 0, y: 1.1, z: -0.5 }, 0.1);
  console.log('球体相交:', hit ? `命中，距离 ${hit.distance.toFixed(3)}m` : '未命中');

  // 事件系统
  console.log('\n--- 交互事件 ---');
  const manager = new HandInteractionManager();
  manager.on('gesturestart', (e) => {
    console.log(`[${e.hand}] 手势开始: ${e.gesture}`);
  });
  manager.on('pinchstart', (e) => {
    console.log(`[${e.hand}] 捏合开始`);
  });

  manager.processFrame(hand);
}

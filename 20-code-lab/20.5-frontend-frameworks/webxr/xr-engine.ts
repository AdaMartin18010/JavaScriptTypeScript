/**
 * @file XR引擎
 * @category WebXR → Engine
 * @difficulty hard
 * @tags webxr, vr, ar, spatial-tracking, hand-tracking
 */

// 3D向量
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// 变换矩阵
export class Matrix4 {
  private data: Float32Array = new Float32Array(16);
  
  static identity(): Matrix4 {
    const m = new Matrix4();
    m.data[0] = 1; m.data[5] = 1; m.data[10] = 1; m.data[15] = 1;
    return m;
  }
  
  static fromTranslation(x: number, y: number, z: number): Matrix4 {
    const m = Matrix4.identity();
    m.data[12] = x;
    m.data[13] = y;
    m.data[14] = z;
    return m;
  }
  
  static fromRotationY(angle: number): Matrix4 {
    const m = Matrix4.identity();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.data[0] = c; m.data[2] = s;
    m.data[8] = -s; m.data[10] = c;
    return m;
  }
  
  multiply(other: Matrix4): Matrix4 {
    const result = new Matrix4();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.data[i * 4 + k] * other.data[k * 4 + j];
        }
        result.data[i * 4 + j] = sum;
      }
    }
    return result;
  }
  
  transformPoint(v: Vector3): Vector3 {
    const x = this.data[0] * v.x + this.data[4] * v.y + this.data[8] * v.z + this.data[12];
    const y = this.data[1] * v.x + this.data[5] * v.y + this.data[9] * v.z + this.data[13];
    const z = this.data[2] * v.x + this.data[6] * v.y + this.data[10] * v.z + this.data[14];
    const w = this.data[3] * v.x + this.data[7] * v.y + this.data[11] * v.z + this.data[15];
    return { x: x / w, y: y / w, z: z / w };
  }
  
  getData(): Float32Array {
    return this.data;
  }
}

// XR空间
export class XRSpace {
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private orientation: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
  private transform = Matrix4.identity();
  
  setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
    this.updateTransform();
  }
  
  setOrientation(x: number, y: number, z: number, w: number): void {
    this.orientation = { x, y, z, w };
    this.updateTransform();
  }
  
  private updateTransform(): void {
    this.transform = Matrix4.fromTranslation(this.position.x, this.position.y, this.position.z);
  }
  
  getTransform(): Matrix4 {
    return this.transform;
  }
  
  getPosition(): Vector3 {
    return { ...this.position };
  }
}

// XR参考空间类型
export type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

// XR会话
export interface XRSession {
  mode: 'immersive-vr' | 'immersive-ar' | 'inline';
  referenceSpace: XRReferenceSpaceType;
  renderState: {
    baseLayer: { framebuffer: unknown; framebufferWidth: number; framebufferHeight: number } | null;
    depthNear: number;
    depthFar: number;
  };
}

// XR视图
export class XRView {
  private projectionMatrix = Matrix4.identity();
  private viewMatrix = Matrix4.identity();
  
  constructor(
    public eye: 'left' | 'right' | 'none',
    public viewport: { x: number; y: number; width: number; height: number }
  ) {}
  
  setProjection(fov: number, aspect: number, near: number, far: number): void {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    
    const data = this.projectionMatrix.getData();
    data[0] = f / aspect;
    data[5] = f;
    data[10] = (far + near) * nf;
    data[11] = -1;
    data[14] = 2 * far * near * nf;
    data[15] = 0;
  }
  
  setViewMatrix(matrix: Matrix4): void {
    this.viewMatrix = matrix;
  }
  
  getProjectionMatrix(): Matrix4 {
    return this.projectionMatrix;
  }
  
  getViewMatrix(): Matrix4 {
    return this.viewMatrix;
  }
}

// XR帧
export class XRFrame {
  public timestamp: number;
  public views: XRView[] = [];
  
  constructor() {
    this.timestamp = performance.now();
  }
  
  addView(view: XRView): void {
    this.views.push(view);
  }
  
  getViewerPose(): { position: Vector3; orientation: Quaternion } | null {
    // 简化：返回模拟的头部姿态
    return {
      position: { x: 0, y: 1.6, z: 0 }, // 站立高度
      orientation: { x: 0, y: 0, z: 0, w: 1 }
    };
  }
}

// 3D场景对象
export class SceneObject {
  private children: SceneObject[] = [];
  private localTransform = Matrix4.identity();
  private worldTransform = Matrix4.identity();
  private parent: SceneObject | null = null;
  
  constructor(public name: string) {}
  
  setPosition(x: number, y: number, z: number): void {
    this.localTransform = Matrix4.fromTranslation(x, y, z);
    this.updateWorldTransform();
  }
  
  setRotationY(angle: number): void {
    const rot = Matrix4.fromRotationY(angle);
    this.localTransform = this.localTransform.multiply(rot);
    this.updateWorldTransform();
  }
  
  addChild(child: SceneObject): void {
    child.parent = this;
    this.children.push(child);
    child.updateWorldTransform();
  }
  
  private updateWorldTransform(): void {
    if (this.parent) {
      this.worldTransform = this.parent.worldTransform.multiply(this.localTransform);
    } else {
      this.worldTransform = this.localTransform;
    }
    
    for (const child of this.children) {
      child.updateWorldTransform();
    }
  }
  
  getWorldTransform(): Matrix4 {
    return this.worldTransform;
  }
}

// 手势追踪
export interface HandJoint {
  position: Vector3;
  radius: number;
}

export class HandTracking {
  private joints = new Map<string, HandJoint>();
  private gesture: string | null = null;
  
  updateJoint(name: string, position: Vector3, radius: number): void {
    this.joints.set(name, { position, radius });
    this.detectGesture();
  }
  
  private detectGesture(): void {
    const wrist = this.joints.get('wrist');
    const indexTip = this.joints.get('index-finger-tip');
    const thumbTip = this.joints.get('thumb-tip');
    
    if (!wrist || !indexTip || !thumbTip) return;
    
    // 检测捏合手势
    const distance = this.distance(indexTip.position, thumbTip.position);
    if (distance < 0.02) {
      this.gesture = 'pinch';
    } else {
      this.gesture = null;
    }
  }
  
  private distance(a: Vector3, b: Vector3): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) + 
      Math.pow(a.y - b.y, 2) + 
      Math.pow(a.z - b.z, 2)
    );
  }
  
  getGesture(): string | null {
    return this.gesture;
  }
  
  isPinched(): boolean {
    return this.gesture === 'pinch';
  }
}

// 空间锚点
export class XRAnchor {
  private position: Vector3;
  private createdAt: number;
  
  constructor(position: Vector3) {
    this.position = position;
    this.createdAt = Date.now();
  }
  
  getPosition(): Vector3 {
    return { ...this.position };
  }
  
  getAge(): number {
    return Date.now() - this.createdAt;
  }
}

// 锚点管理器
export class XRAnchorManager {
  private anchors = new Map<string, XRAnchor>();
  
  createAnchor(position: Vector3): string {
    const id = `anchor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.anchors.set(id, new XRAnchor(position));
    return id;
  }
  
  deleteAnchor(id: string): boolean {
    return this.anchors.delete(id);
  }
  
  getAnchor(id: string): XRAnchor | undefined {
    return this.anchors.get(id);
  }
  
  getAllAnchors(): { id: string; position: Vector3 }[] {
    return Array.from(this.anchors.entries()).map(([id, anchor]) => ({
      id,
      position: anchor.getPosition()
    }));
  }
}

// 命中测试
export class XRHitTest {
  // 射线与平面相交测试
  testRayPlane(
    rayOrigin: Vector3,
    rayDirection: Vector3,
    planePoint: Vector3,
    planeNormal: Vector3
  ): Vector3 | null {
    const denom = this.dot(rayDirection, planeNormal);
    if (Math.abs(denom) < 0.0001) return null; // 射线与平面平行
    
    const t = this.dot(
      { x: planePoint.x - rayOrigin.x, y: planePoint.y - rayOrigin.y, z: planePoint.z - rayOrigin.z },
      planeNormal
    ) / denom;
    
    if (t < 0) return null; // 交点在射线后方
    
    return {
      x: rayOrigin.x + rayDirection.x * t,
      y: rayOrigin.y + rayDirection.y * t,
      z: rayOrigin.z + rayDirection.z * t
    };
  }
  
  private dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
}

export function demo(): void {
  console.log('=== WebXR ===\n');
  
  // 场景图
  console.log('--- 3D场景 ---');
  const root = new SceneObject('root');
  const cube = new SceneObject('cube');
  const sphere = new SceneObject('sphere');
  
  root.addChild(cube);
  root.addChild(sphere);
  
  cube.setPosition(1, 0, 0);
  sphere.setPosition(-1, 0, 0);
  
  console.log('Cube世界位置:', cube.getWorldTransform().transformPoint({ x: 0, y: 0, z: 0 }));
  console.log('Sphere世界位置:', sphere.getWorldTransform().transformPoint({ x: 0, y: 0, z: 0 }));
  
  // XR视图
  console.log('\n--- XR视图 ---');
  const frame = new XRFrame();
  
  const leftView = new XRView('left', { x: 0, y: 0, width: 1080, height: 1200 });
  const rightView = new XRView('right', { x: 1080, y: 0, width: 1080, height: 1200 });
  
  leftView.setProjection(Math.PI / 2, 1080 / 1200, 0.1, 1000);
  rightView.setProjection(Math.PI / 2, 1080 / 1200, 0.1, 1000);
  
  frame.addView(leftView);
  frame.addView(rightView);
  
  console.log(`帧时间戳: ${frame.timestamp.toFixed(2)}ms`);
  console.log(`视图数量: ${frame.views.length}`);
  
  const pose = frame.getViewerPose();
  console.log('观看者位置:', pose?.position);
  
  // 手势追踪
  console.log('\n--- 手势追踪 ---');
  const hand = new HandTracking();
  
  hand.updateJoint('wrist', { x: 0, y: 0, z: 0 }, 0.025);
  hand.updateJoint('index-finger-tip', { x: 0.05, y: 0.1, z: 0 }, 0.01);
  hand.updateJoint('thumb-tip', { x: 0.03, y: 0.08, z: 0 }, 0.01);
  
  console.log('手势:', hand.getGesture() || '无');
  console.log('是否捏合:', hand.isPinched());
  
  // 更新为捏合状态
  hand.updateJoint('index-finger-tip', { x: 0.031, y: 0.081, z: 0 }, 0.01);
  console.log('更新后手势:', hand.getGesture());
  
  // 空间锚点
  console.log('\n--- 空间锚点 ---');
  const anchorManager = new XRAnchorManager();
  
  const anchor1 = anchorManager.createAnchor({ x: 1, y: 0, z: 2 });
  const anchor2 = anchorManager.createAnchor({ x: -1, y: 0, z: 3 });
  
  console.log('创建的锚点:', anchorManager.getAllAnchors());
  
  // 命中测试
  console.log('\n--- 命中测试 ---');
  const hitTest = new XRHitTest();
  
  const hit = hitTest.testRayPlane(
    { x: 0, y: 1, z: 0 }, // 射线起点
    { x: 0, y: -1, z: 0 }, // 射线方向（向下）
    { x: 0, y: 0, z: 0 }, // 平面上的点
    { x: 0, y: 1, z: 0 }  // 平面法向量
  );
  
  console.log('射线与平面交点:', hit);
}

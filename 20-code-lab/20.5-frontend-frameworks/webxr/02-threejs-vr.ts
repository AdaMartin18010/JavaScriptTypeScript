/**
 * @file Three.js VR 场景搭建
 * @category WebXR → Three.js Integration
 * @difficulty hard
 * @tags webxr, three.js, vr, rendering, stereo
 *
 * @description
 * Three.js 是 WebXR 开发的事实标准 3D 引擎。
 * 本模块演示如何构建支持 VR 的 Three.js 场景、管理立体渲染和交互。
 */

// ============================================================================
// 1. 基础 3D 数学工具（Three.js 子集模拟）
// ============================================================================

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  multiplyScalar(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  distanceTo(v: Vector3): number {
    return Math.sqrt(
      (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2
    );
  }
}

export class Quaternion {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

  static fromEuler(x: number, y: number, z: number): Quaternion {
    const cx = Math.cos(x / 2);
    const sx = Math.sin(x / 2);
    const cy = Math.cos(y / 2);
    const sy = Math.sin(y / 2);
    const cz = Math.cos(z / 2);
    const sz = Math.sin(z / 2);

    return new Quaternion(
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz,
      cx * cy * cz + sx * sy * sz
    );
  }
}

export class Matrix4 {
  elements = new Float32Array(16);

  constructor() {
    this.identity();
  }

  identity(): this {
    const e = this.elements;
    e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
    return this;
  }

  makePerspective(fov: number, aspect: number, near: number, far: number): this {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    const e = this.elements;

    e[0] = f / aspect; e[4] = 0; e[8] = 0; e[12] = 0;
    e[1] = 0; e[5] = f; e[9] = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = (far + near) * nf; e[14] = 2 * far * near * nf;
    e[3] = 0; e[7] = 0; e[11] = -1; e[15] = 0;
    return this;
  }

  makeTranslation(x: number, y: number, z: number): this {
    this.identity();
    this.elements[12] = x;
    this.elements[13] = y;
    this.elements[14] = z;
    return this;
  }

  multiplyMatrices(a: Matrix4, b: Matrix4): this {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += ae[i + k * 4] * be[k + j * 4];
        }
        te[i + j * 4] = sum;
      }
    }
    return this;
  }
}

// ============================================================================
// 2. 场景对象系统
// ============================================================================

export class Object3D {
  position = new Vector3();
  rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);
  children: Object3D[] = [];
  parent: Object3D | null = null;
  visible = true;
  name = '';

  add(child: Object3D): this {
    if (child.parent) {
      child.parent.remove(child);
    }
    child.parent = this;
    this.children.push(child);
    return this;
  }

  remove(child: Object3D): this {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
    return this;
  }

  getWorldPosition(): Vector3 {
    const worldPos = this.position.clone();
    let current = this.parent;
    while (current) {
      worldPos.x += current.position.x;
      worldPos.y += current.position.y;
      worldPos.z += current.position.z;
      current = current.parent;
    }
    return worldPos;
  }
}

export class Mesh extends Object3D {
  constructor(
    public geometry: Geometry,
    public material: Material
  ) {
    super();
  }
}

export interface Geometry {
  vertices: Vector3[];
  indices: number[];
  type: 'box' | 'sphere' | 'plane';
}

export interface Material {
  color: string;
  wireframe?: boolean;
  opacity?: number;
}

// ============================================================================
// 3. 相机系统
// ============================================================================

export class Camera extends Object3D {
  projectionMatrix = new Matrix4();

  constructor(
    public fov = 75,
    public aspect = 1,
    public near = 0.1,
    public far = 1000
  ) {
    super();
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix(): void {
    this.projectionMatrix.makePerspective(
      (this.fov * Math.PI) / 180,
      this.aspect,
      this.near,
      this.far
    );
  }
}

/** VR 双眼相机 */
export class VRStereoCamera {
  left = new Camera();
  right = new Camera();
  private ipd = 0.064; // 瞳距，单位：米

  update(fov: number, aspect: number, near: number, far: number, headPosition: Vector3): void {
    const halfIpd = this.ipd / 2;

    // 左眼
    this.left.fov = fov;
    this.left.aspect = aspect;
    this.left.near = near;
    this.left.far = far;
    this.left.updateProjectionMatrix();
    this.left.position = headPosition.clone().add(new Vector3(-halfIpd, 0, 0));

    // 右眼
    this.right.fov = fov;
    this.right.aspect = aspect;
    this.right.near = near;
    this.right.far = far;
    this.right.updateProjectionMatrix();
    this.right.position = headPosition.clone().add(new Vector3(halfIpd, 0, 0));
  }

  setIPD(ipd: number): void {
    this.ipd = ipd;
  }
}

// ============================================================================
// 4. VR 场景构建器
// ============================================================================

export class VRSceneBuilder {
  scene = new Object3D();
  private renderer: WebGLRendererLike;

  constructor(renderer: WebGLRendererLike) {
    this.renderer = renderer;
  }

  /** 创建立方体 */
  createCube(size: number, color: string, position: Vector3): Mesh {
    const half = size / 2;
    const geometry: Geometry = {
      type: 'box',
      vertices: [
        new Vector3(-half, -half, -half), new Vector3(half, -half, -half),
        new Vector3(half, half, -half), new Vector3(-half, half, -half),
        new Vector3(-half, -half, half), new Vector3(half, -half, half),
        new Vector3(half, half, half), new Vector3(-half, half, half),
      ],
      indices: [
        0, 1, 2, 0, 2, 3, // 前
        4, 6, 5, 4, 7, 6, // 后
        0, 3, 7, 0, 7, 4, // 左
        1, 5, 6, 1, 6, 2, // 右
        3, 2, 6, 3, 6, 7, // 上
        0, 4, 5, 0, 5, 1, // 下
      ],
    };

    const material: Material = { color };
    const mesh = new Mesh(geometry, material);
    mesh.position = position.clone();
    mesh.name = `cube_${color}`;
    this.scene.add(mesh);
    return mesh;
  }

  /** 创建地面 */
  createGround(size: number, color = '#444444'): Mesh {
    const geometry: Geometry = {
      type: 'plane',
      vertices: [
        new Vector3(-size / 2, 0, -size / 2),
        new Vector3(size / 2, 0, -size / 2),
        new Vector3(size / 2, 0, size / 2),
        new Vector3(-size / 2, 0, size / 2),
      ],
      indices: [0, 2, 1, 0, 3, 2],
    };

    const material: Material = { color, wireframe: false };
    const mesh = new Mesh(geometry, material);
    mesh.name = 'ground';
    this.scene.add(mesh);
    return mesh;
  }

  /** 创建交互目标 */
  createInteractable(name: string, position: Vector3, onInteract: () => void): Mesh {
    const geometry: Geometry = {
      type: 'sphere',
      vertices: [], // 简化
      indices: [],
    };

    const material: Material = { color: '#ff6b6b', opacity: 0.8 };
    const mesh = new Mesh(geometry, material);
    mesh.position = position.clone();
    mesh.name = name;
    (mesh as Mesh & { onInteract?: () => void }).onInteract = onInteract;
    this.scene.add(mesh);
    return mesh;
  }

  getScene(): Object3D {
    return this.scene;
  }
}

interface WebGLRendererLike {
  render(scene: Object3D, camera: Camera): void;
}

// ============================================================================
// 5. VR 渲染循环
// ============================================================================

export class VRRenderer {
  private stereoCamera = new VRStereoCamera();
  private isPresenting = false;

  constructor(
    private renderer: WebGLRendererLike,
    private scene: Object3D
  ) {}

  /** 进入 VR 模式 */
  enterVR(session: XRSessionLike): void {
    this.isPresenting = true;
    console.log('[VRRenderer] 进入 VR 模式');
  }

  /** 退出 VR 模式 */
  exitVR(): void {
    this.isPresenting = false;
    console.log('[VRRenderer] 退出 VR 模式');
  }

  /** 渲染单帧 */
  renderFrame(pose: XRPoseLike): void {
    if (!this.isPresenting) {
      // 非 VR 模式使用默认相机
      const defaultCamera = new Camera(75, 16 / 9, 0.1, 1000);
      defaultCamera.position = new Vector3(0, 1.6, 3);
      this.renderer.render(this.scene, defaultCamera);
      return;
    }

    // VR 立体渲染
    const views = pose.views;
    for (const view of views) {
      const camera = new Camera(
        90,
        view.viewport.width / view.viewport.height,
        0.1,
        1000
      );

      // 应用视图变换
      camera.position = new Vector3(
        view.transform.position.x,
        view.transform.position.y,
        view.transform.position.z
      );

      // 渲染到对应的眼缓冲区
      this.renderer.render(this.scene, camera);
    }
  }

  getStereoCamera(): VRStereoCamera {
    return this.stereoCamera;
  }
}

interface XRSessionLike {
  requestAnimationFrame(cb: (time: number, frame: unknown) => void): number;
}

interface XRPoseLike {
  views: Array<{
    eye: 'left' | 'right';
    viewport: { width: number; height: number };
    transform: {
      position: { x: number; y: number; z: number };
      orientation: { x: number; y: number; z: number; w: number };
    };
  }>;
}

// ============================================================================
// 6. 演示
// ============================================================================

export function demo(): void {
  console.log('=== Three.js VR 场景搭建 ===\n');

  // 模拟渲染器
  const mockRenderer: WebGLRendererLike = {
    render(scene: Object3D, camera: Camera) {
      console.log(`  渲染场景: ${scene.children.length} 个对象, 相机位置: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
    },
  };

  // 构建 VR 场景
  const builder = new VRSceneBuilder(mockRenderer);
  builder.createGround(10, '#333');
  builder.createCube(1, '#e74c3c', new Vector3(-1.5, 0.5, -2));
  builder.createCube(1, '#3498db', new Vector3(0, 0.5, -3));
  builder.createCube(1, '#2ecc71', new Vector3(1.5, 0.5, -2));

  console.log('场景对象数:', builder.getScene().children.length);

  // 立体相机
  console.log('\n--- VR 立体相机 ---');
  const stereo = new VRStereoCamera();
  stereo.update(90, 1, 0.1, 1000, new Vector3(0, 1.6, 0));
  console.log('左眼位置:', stereo.left.position);
  console.log('右眼位置:', stereo.right.position);

  // VR 渲染
  console.log('\n--- VR 渲染 ---');
  const vrRenderer = new VRRenderer(mockRenderer, builder.getScene());

  const mockPose: XRPoseLike = {
    views: [
      {
        eye: 'left',
        viewport: { width: 1080, height: 1200 },
        transform: { position: { x: -0.032, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
      },
      {
        eye: 'right',
        viewport: { width: 1080, height: 1200 },
        transform: { position: { x: 0.032, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
      },
    ],
  };

  vrRenderer.enterVR({ requestAnimationFrame: () => 0 });
  vrRenderer.renderFrame(mockPose);
}

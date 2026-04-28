/**
 * @file 空间计算基础
 * @category WebXR → Spatial Computing
 * @difficulty hard
 * @tags webxr, spatial-computing, anchors, hit-test, plane-detection, mesh
 *
 * @description
 * 空间计算（Spatial Computing）是 AR/VR 应用的核心，涉及真实世界几何的
 * 感知、持久化锚点和虚拟内容的空间对齐。
 */

// ============================================================================
// 1. 空间锚点 (Spatial Anchors)
// ============================================================================

export interface SpatialAnchor {
  id: string;
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
  createdAt: number;
  lastUpdated: number;
  cloudSynced: boolean;
}

export class AnchorManager {
  private anchors = new Map<string, SpatialAnchor>();
  private onUpdateListeners: Set<(anchor: SpatialAnchor) => void> = new Set();

  /** 创建本地锚点 */
  createAnchor(position: { x: number; y: number; z: number }, orientation = { x: 0, y: 0, z: 0, w: 1 }): SpatialAnchor {
    const anchor: SpatialAnchor = {
      id: `anchor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      position: { ...position },
      orientation: { ...orientation },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      cloudSynced: false,
    };

    this.anchors.set(anchor.id, anchor);
    return anchor;
  }

  /** 更新锚点（当设备优化位置时调用） */
  updateAnchor(id: string, position: { x: number; y: number; z: number }, orientation?: { x: number; y: number; z: number; w: number }): boolean {
    const anchor = this.anchors.get(id);
    if (!anchor) return false;

    anchor.position = { ...position };
    if (orientation) anchor.orientation = { ...orientation };
    anchor.lastUpdated = Date.now();
    anchor.cloudSynced = false;

    for (const listener of this.onUpdateListeners) {
      listener(anchor);
    }

    return true;
  }

  deleteAnchor(id: string): boolean {
    return this.anchors.delete(id);
  }

  getAnchor(id: string): SpatialAnchor | undefined {
    return this.anchors.get(id);
  }

  getAllAnchors(): SpatialAnchor[] {
    return Array.from(this.anchors.values());
  }

  onUpdate(listener: (anchor: SpatialAnchor) => void): () => void {
    this.onUpdateListeners.add(listener);
    return () => this.onUpdateListeners.delete(listener);
  }

  /** 导出为可持久化的格式 */
  export(): string {
    return JSON.stringify({
      version: 1,
      anchors: Array.from(this.anchors.values()),
    });
  }

  /** 从持久化数据恢复 */
  import(data: string): void {
    const parsed = JSON.parse(data);
    this.anchors.clear();
    for (const anchor of parsed.anchors as SpatialAnchor[]) {
      this.anchors.set(anchor.id, anchor);
    }
  }
}

// ============================================================================
// 2. 命中测试 (Hit Test)
// ============================================================================

export interface HitTestResult {
  hitMatrix: Float32Array;      // 4×4 变换矩阵
  distance: number;             // 射线起点到命中点的距离
  plane: DetectedPlane | null;  // 命中的平面（如有）
  point: { x: number; y: number; z: number };
}

export interface Ray {
  origin: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
}

export interface DetectedPlane {
  id: string;
  center: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  extent: { width: number; height: number };
  polygon: Array<{ x: number; z: number }>;
  orientation: 'horizontal' | 'vertical';
}

export class HitTestEngine {
  private planes: DetectedPlane[] = [];

  updatePlanes(planes: DetectedPlane[]): void {
    this.planes = planes;
  }

  /** 射线与检测到的平面相交测试 */
  testRay(ray: Ray): HitTestResult | null {
    let closestHit: HitTestResult | null = null;
    let minDistance = Infinity;

    for (const plane of this.planes) {
      const hit = this.rayPlaneIntersect(ray, plane);
      if (hit && hit.distance < minDistance && hit.distance > 0) {
        minDistance = hit.distance;
        closestHit = hit;
      }
    }

    return closestHit;
  }

  /** 射线-平面相交 */
  private rayPlaneIntersect(ray: Ray, plane: DetectedPlane): HitTestResult | null {
    const denom = this.dot(ray.direction, plane.normal);
    if (Math.abs(denom) < 1e-6) return null; // 平行

    const diff = {
      x: plane.center.x - ray.origin.x,
      y: plane.center.y - ray.origin.y,
      z: plane.center.z - ray.origin.z,
    };

    const t = this.dot(diff, plane.normal) / denom;
    if (t < 0) return null;

    const point = {
      x: ray.origin.x + ray.direction.x * t,
      y: ray.origin.y + ray.direction.y * t,
      z: ray.origin.z + ray.direction.z * t,
    };

    // 简单边界检查（AABB）
    const halfW = plane.extent.width / 2;
    const halfH = plane.extent.height / 2;
    if (
      Math.abs(point.x - plane.center.x) > halfW ||
      Math.abs(point.z - plane.center.z) > halfH
    ) {
      return null;
    }

    const hitMatrix = new Float32Array(16);
    this.buildHitMatrix(hitMatrix, point, plane.normal);

    return {
      hitMatrix,
      distance: t,
      plane,
      point,
    };
  }

  private buildHitMatrix(out: Float32Array, point: { x: number; y: number; z: number }, normal: { x: number; y: number; z: number }): void {
    // 构建以命中点为原点、法向为 Y 轴的局部坐标系
    const yAxis = this.normalize(normal);
    const xAxis = this.normalize(this.cross({ x: 0, y: 1, z: 0 }, yAxis));
    const zAxis = this.cross(xAxis, yAxis);

    out[0] = xAxis.x;  out[4] = yAxis.x;  out[8]  = zAxis.x;  out[12] = point.x;
    out[1] = xAxis.y;  out[5] = yAxis.y;  out[9]  = zAxis.y;  out[13] = point.y;
    out[2] = xAxis.z;  out[6] = yAxis.z;  out[10] = zAxis.z;  out[14] = point.z;
    out[3] = 0;        out[7] = 0;        out[11] = 0;        out[15] = 1;
  }

  private dot(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private cross(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  }

  private normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const len = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    if (len === 0) return { x: 0, y: 1, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }
}

// ============================================================================
// 3. 网格检测与空间理解
// ============================================================================

export interface DetectedMesh {
  id: string;
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
  timestamp: number;
  confidence: number;
}

export class SpatialMeshManager {
  private meshes = new Map<string, DetectedMesh>();

  updateMesh(mesh: DetectedMesh): void {
    this.meshes.set(mesh.id, mesh);
  }

  removeMesh(id: string): boolean {
    return this.meshes.delete(id);
  }

  getMesh(id: string): DetectedMesh | undefined {
    return this.meshes.get(id);
  }

  getAllMeshes(): DetectedMesh[] {
    return Array.from(this.meshes.values());
  }

  /** 计算网格包围盒 */
  getBoundingBox(meshId: string): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } | null {
    const mesh = this.meshes.get(meshId);
    if (!mesh) return null;

    const verts = mesh.vertices;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < verts.length; i += 3) {
      minX = Math.min(minX, verts[i]);
      minY = Math.min(minY, verts[i + 1]);
      minZ = Math.min(minZ, verts[i + 2]);
      maxX = Math.max(maxX, verts[i]);
      maxY = Math.max(maxY, verts[i + 1]);
      maxZ = Math.max(maxZ, verts[i + 2]);
    }

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };
  }

  /** 估算可放置物体的平面区域 */
  findPlaceableSurfaces(minArea = 0.1): Array<{ center: { x: number; y: number; z: number }; area: number }> {
    const surfaces: Array<{ center: { x: number; y: number; z: number }; area: number }> = [];

    for (const mesh of this.meshes.values()) {
      const bbox = this.getBoundingBox(mesh.id);
      if (!bbox) continue;

      const area = (bbox.max.x - bbox.min.x) * (bbox.max.z - bbox.min.z);
      if (area >= minArea) {
        surfaces.push({
          center: {
            x: (bbox.min.x + bbox.max.x) / 2,
            y: (bbox.min.y + bbox.max.y) / 2,
            z: (bbox.min.z + bbox.max.z) / 2,
          },
          area,
        });
      }
    }

    return surfaces.sort((a, b) => b.area - a.area);
  }
}

// ============================================================================
// 4. 空间放置约束系统
// ============================================================================

export interface PlacementConstraint {
  minHeight?: number;           // 最小离地高度
  maxHeight?: number;           // 最大离地高度
  requireHorizontal?: boolean;  // 是否要求水平面
  requireVertical?: boolean;    // 是否要求垂直面
  minDistanceFromWall?: number; // 离墙最小距离
  avoidOcclusion?: boolean;     // 避免遮挡
}

export class SpatialPlacementEngine {
  constructor(
    private anchorManager: AnchorManager,
    private hitTestEngine: HitTestEngine
  ) {}

  /** 尝试在射线指向处放置物体 */
  tryPlace(
    ray: Ray,
    constraints: PlacementConstraint = {}
  ): { success: boolean; anchor?: SpatialAnchor; reason?: string } {
    const hit = this.hitTestEngine.testRay(ray);

    if (!hit) {
      return { success: false, reason: '未检测到可放置表面' };
    }

    const { point, plane } = hit;

    // 高度约束
    if (constraints.minHeight !== undefined && point.y < constraints.minHeight) {
      return { success: false, reason: '高度低于最小限制' };
    }
    if (constraints.maxHeight !== undefined && point.y > constraints.maxHeight) {
      return { success: false, reason: '高度超过最大限制' };
    }

    // 平面方向约束
    if (constraints.requireHorizontal && plane?.orientation !== 'horizontal') {
      return { success: false, reason: '需要水平面' };
    }
    if (constraints.requireVertical && plane?.orientation !== 'vertical') {
      return { success: false, reason: '需要垂直面' };
    }

    const anchor = this.anchorManager.createAnchor(point);
    return { success: true, anchor };
  }

  /** 获取推荐放置位置（基于空间理解） */
  suggestPlacement(
    meshManager: SpatialMeshManager,
    preferences: { preferFloor?: boolean; preferWall?: boolean } = {}
  ): Array<{ position: { x: number; y: number; z: number }; score: number; reason: string }> {
    const surfaces = meshManager.findPlaceableSurfaces(0.2);
    const suggestions: Array<{ position: { x: number; y: number; z: number }; score: number; reason: string }> = [];

    for (const surface of surfaces) {
      let score = 0;
      const reasons: string[] = [];

      // 面积越大越推荐
      score += Math.min(surface.area * 10, 50);

      // 高度适中加分
      if (surface.center.y > 0.8 && surface.center.y < 1.6) {
        score += 20;
        reasons.push(' ergonomic height');
      }

      // 中心区域加分（假设原点是用户位置）
      const distFromCenter = Math.sqrt(surface.center.x ** 2 + surface.center.z ** 2);
      if (distFromCenter < 2) {
        score += 15;
        reasons.push(' within comfortable range');
      }

      suggestions.push({
        position: surface.center,
        score,
        reason: reasons.join(','),
      });
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 空间计算基础 ===\n');

  // 锚点管理
  console.log('--- 空间锚点 ---');
  const anchorManager = new AnchorManager();
  const anchor1 = anchorManager.createAnchor({ x: 1, y: 0, z: 2 });
  const anchor2 = anchorManager.createAnchor({ x: -1, y: 0.5, z: 1.5 });
  console.log('创建锚点:', anchor1.id, anchor2.id);
  console.log('全部锚点:', anchorManager.getAllAnchors().length);

  // 命中测试
  console.log('\n--- 命中测试 ---');
  const hitTestEngine = new HitTestEngine();
  const plane: DetectedPlane = {
    id: 'floor-1',
    center: { x: 0, y: 0, z: 0 },
    normal: { x: 0, y: 1, z: 0 },
    extent: { width: 5, height: 5 },
    polygon: [{ x: -2.5, z: -2.5 }, { x: 2.5, z: -2.5 }, { x: 2.5, z: 2.5 }, { x: -2.5, z: 2.5 }],
    orientation: 'horizontal',
  };
  hitTestEngine.updatePlanes([plane]);

  const ray: Ray = {
    origin: { x: 0, y: 1.6, z: 0 },
    direction: { x: 0, y: -1, z: -0.5 },
  };
  const hit = hitTestEngine.testRay(ray);
  console.log('射线命中:', hit ? `距离 ${hit.distance.toFixed(2)}m` : '无');

  // 空间放置
  console.log('\n--- 智能放置 ---');
  const placementEngine = new SpatialPlacementEngine(anchorManager, hitTestEngine);
  const result = placementEngine.tryPlace(ray, { minHeight: 0, requireHorizontal: true });
  console.log('放置结果:', result.success ? `锚点 ${result.anchor!.id}` : result.reason);

  // 网格管理
  console.log('\n--- 空间网格 ---');
  const meshManager = new SpatialMeshManager();
  meshManager.updateMesh({
    id: 'mesh-1',
    vertices: new Float32Array([
      -1, 0, -1,  1, 0, -1,  1, 0, 1,  -1, 0, 1,
      -0.5, 0, -0.5,  0.5, 0, -0.5,  0.5, 0, 0.5,  -0.5, 0, 0.5,
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
    normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
    timestamp: Date.now(),
    confidence: 0.95,
  });

  const surfaces = meshManager.findPlaceableSurfaces(0.5);
  console.log('可放置表面数:', surfaces.length);
}

/**
 * @file WebXR 基础与设备检测
 * @category WebXR → Basics
 * @difficulty medium
 * @tags webxr, device-api, vr, ar, feature-detection
 *
 * @description
 * WebXR Device API 是现代浏览器提供的沉浸式体验标准接口。
 * 本模块涵盖设备能力检测、会话生命周期管理和参考空间选择。
 */

// ============================================================================
// 1. 设备与能力检测
// ============================================================================

/** WebXR 支持检测结果 */
export interface XRSupportResult {
  supported: boolean;
  immersiveVR: boolean;
  immersiveAR: boolean;
  inline: boolean;
  handTracking: boolean;
  layers: boolean;
  meshDetection: boolean;
  depthSensing: boolean;
}

/** 检测浏览器 WebXR 支持情况 */
export async function detectXRSupport(): Promise<XRSupportResult> {
  const result: XRSupportResult = {
    supported: false,
    immersiveVR: false,
    immersiveAR: false,
    inline: false,
    handTracking: false,
    layers: false,
    meshDetection: false,
    depthSensing: false,
  };

  if (typeof navigator === 'undefined' || !('xr' in navigator)) {
    return result;
  }

  const xr = (navigator as NavigatorXR).xr;
  result.supported = true;

  // 检测各模式支持
  result.immersiveVR = await xr.isSessionSupported('immersive-vr').catch(() => false);
  result.immersiveAR = await xr.isSessionSupported('immersive-ar').catch(() => false);
  result.inline = await xr.isSessionSupported('inline').catch(() => false);

  // 检测可选特性
  if (result.supported) {
    try {
      const session = await xr.requestSession('inline', {
        optionalFeatures: [
          'hand-tracking',
          'layers',
          'mesh-detection',
          'depth-sensing',
        ] as string[],
      });

      const enabledFeatures = (session as XRSessionWithFeatures).enabledFeatures ?? [];
      result.handTracking = enabledFeatures.includes('hand-tracking');
      result.layers = enabledFeatures.includes('layers');
      result.meshDetection = enabledFeatures.includes('mesh-detection');
      result.depthSensing = enabledFeatures.includes('depth-sensing');

      await session.end();
    } catch {
      // inline 会话可能不可用，忽略错误
    }
  }

  return result;
}

// 扩展类型定义（简化版）
interface NavigatorXR {
  xr: {
    isSessionSupported(mode: string): Promise<boolean>;
    requestSession(mode: string, options?: unknown): Promise<XRSessionWithFeatures>;
  };
}

interface XRSessionWithFeatures {
  enabledFeatures?: string[];
  end(): Promise<void>;
}

// ============================================================================
// 2. 会话生命周期管理
// ============================================================================

export type XRSessionMode = 'immersive-vr' | 'immersive-ar' | 'inline';

export interface XRSessionConfig {
  mode: XRSessionMode;
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: HTMLElement };
}

/** 会话状态 */
export type XRSessionState =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'visible'
  | 'visible-blurred'
  | 'hidden'
  | 'ending'
  | 'ended';

export class XRSessionManager {
  private session: XRSessionWithFeatures | null = null;
  private state: XRSessionState = 'idle';
  private stateListeners: Set<(state: XRSessionState) => void> = new Set();

  getState(): XRSessionState {
    return this.state;
  }

  onStateChange(listener: (state: XRSessionState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(state: XRSessionState): void {
    this.state = state;
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  /** 请求 XR 会话 */
  async requestSession(config: XRSessionConfig): Promise<XRSessionWithFeatures | null> {
    if (this.state === 'requesting' || this.state === 'active') {
      console.warn('[XRSessionManager] 会话已存在，请先结束当前会话');
      return null;
    }

    if (typeof navigator === 'undefined' || !('xr' in navigator)) {
      throw new Error('WebXR 不受当前浏览器支持');
    }

    this.setState('requesting');

    try {
      const xr = (navigator as NavigatorXR).xr;
      const session = await xr.requestSession(config.mode, {
        requiredFeatures: config.requiredFeatures ?? [],
        optionalFeatures: config.optionalFeatures ?? [],
        domOverlay: config.domOverlay,
      });

      this.session = session;
      this.setState('active');

      // 绑定事件
      this.bindSessionEvents(session);

      return session;
    } catch (error) {
      this.setState('ended');
      throw error;
    }
  }

  private bindSessionEvents(session: XRSessionWithFeatures & { addEventListener?: (event: string, handler: () => void) => void }): void {
    if (!session.addEventListener) return;

    session.addEventListener('end', () => {
      this.session = null;
      this.setState('ended');
    });

    session.addEventListener('visibilitychange', () => {
      // 简化处理
      this.setState('visible');
    });
  }

  /** 结束当前会话 */
  async endSession(): Promise<void> {
    if (!this.session) return;

    this.setState('ending');
    try {
      await this.session.end();
    } finally {
      this.session = null;
      this.setState('ended');
    }
  }

  getSession(): XRSessionWithFeatures | null {
    return this.session;
  }
}

// ============================================================================
// 3. 参考空间 (Reference Space)
// ============================================================================

export type XRReferenceSpaceType =
  | 'viewer'      // 以设备位置为原点的追踪空间
  | 'local'       // 以设备启动位置为原点的自由追踪
  | 'local-floor' // 以地面为 y=0 的追踪空间
  | 'bounded-floor' // 有边界的地面追踪（需要用户划定安全区域）
  | 'unbounded';  // 无边界追踪（仅 AR）

export interface ReferenceSpaceInfo {
  type: XRReferenceSpaceType;
  description: string;
  requiresFloor: boolean;
  useCase: string;
}

/** 参考空间对照表 */
export const REFERENCE_SPACES: ReferenceSpaceInfo[] = [
  {
    type: 'viewer',
    description: '以设备当前位置为原点的坐标系，无方向锁定',
    requiresFloor: false,
    useCase: '简单的 360° 全景内容、inline 预览',
  },
  {
    type: 'local',
    description: '以会话启动位置为原点的自由 6DoF 追踪',
    requiresFloor: false,
    useCase: 'VR 游戏、站立式体验',
  },
  {
    type: 'local-floor',
    description: '以地面高度为 y=0 的追踪空间',
    requiresFloor: true,
    useCase: '站立/坐立混合体验、人体工学界面',
  },
  {
    type: 'bounded-floor',
    description: '用户划定安全区域内的地面追踪',
    requiresFloor: true,
    useCase: 'Room-scale VR、需要物理空间感知的应用',
  },
  {
    type: 'unbounded',
    description: '无边界追踪，适合大空间 AR',
    requiresFloor: false,
    useCase: '户外 AR、室内大空间导航',
  },
];

export class XRReferenceSpaceManager {
  private currentSpace: XRReferenceSpaceType | null = null;

  selectSpace(type: XRReferenceSpaceType, session: XRSessionWithFeatures & { requestReferenceSpace?: (type: string) => Promise<unknown> }): Promise<unknown> {
    this.currentSpace = type;

    if (!session.requestReferenceSpace) {
      return Promise.resolve(null);
    }

    return session.requestReferenceSpace(type).catch((err: Error) => {
      console.error(`[XRReferenceSpace] 请求 ${type} 失败:`, err);
      throw err;
    });
  }

  getCurrentSpace(): XRReferenceSpaceType | null {
    return this.currentSpace;
  }
}

// ============================================================================
// 4. 渲染循环适配器
// ============================================================================

export type XRFrameCallback = (time: number, frame: XRFrameLike) => void;

interface XRFrameLike {
  timestamp: number;
  getViewerPose(referenceSpace: unknown): XRViewerPoseLike | null;
}

interface XRViewerPoseLike {
  transform: {
    position: { x: number; y: number; z: number };
    orientation: { x: number; y: number; z: number; w: number };
    matrix: Float32Array;
  };
  views: Array<{
    eye: 'left' | 'right' | 'none';
    projectionMatrix: Float32Array;
    transform: { matrix: Float32Array };
  }>;
}

export class XRRenderLoop {
  private running = false;
  private callback: XRFrameCallback | null = null;
  private rafId: number | null = null;

  start(session: XRSessionWithFeatures & { requestAnimationFrame?: (cb: (time: number, frame: XRFrameLike) => void) => number }, onFrame: XRFrameCallback): void {
    if (this.running) return;

    this.running = true;
    this.callback = onFrame;

    const loop = (time: number, frame: XRFrameLike) => {
      if (!this.running) return;

      this.callback?.(time, frame);

      if (session.requestAnimationFrame) {
        this.rafId = session.requestAnimationFrame(loop);
      }
    };

    if (session.requestAnimationFrame) {
      this.rafId = session.requestAnimationFrame(loop);
    }
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== WebXR 基础与设备检测 ===\n');

  // 设备检测
  console.log('--- 能力检测 ---');
  detectXRSupport().then((support) => {
    console.log('WebXR 支持:', support.supported);
    console.log('沉浸式 VR:', support.immersiveVR);
    console.log('沉浸式 AR:', support.immersiveAR);
    console.log('手势追踪:', support.handTracking);
  }).catch(() => {
    console.log('当前环境不支持 WebXR');
  });

  // 会话管理
  console.log('\n--- 会话状态机 ---');
  const manager = new XRSessionManager();
  manager.onStateChange((state) => {
    console.log('会话状态变更:', state);
  });
  console.log('初始状态:', manager.getState());

  // 参考空间
  console.log('\n--- 参考空间对照 ---');
  for (const space of REFERENCE_SPACES) {
    console.log(`${space.type}: ${space.useCase}`);
  }
}

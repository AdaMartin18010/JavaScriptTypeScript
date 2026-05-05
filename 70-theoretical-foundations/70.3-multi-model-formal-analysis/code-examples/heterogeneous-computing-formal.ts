/**
 * 异构计算形式化模型 —— 配套可运行代码示例
 * Heterogeneous Computing Formal Model - Runnable Code Examples
 *
 * 涵盖：
 * 1. WebGPU 显式状态机初始化
 * 2. WGSL 类型系统与内存布局
 * 3. WebAssembly 线性内存共享
 * 4. JS + WASM + WebGPU 三元交互
 * 5. 命令编码器的 Writer Monad 实现
 * 6. 零拷贝数据流
 */

// ============================================================================
// 示例 1: WebGPU 显式状态机 —— 完整初始化流程
// ============================================================================

interface WebGPUInitResult {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

/**
 * 显式状态机：Adapter → Device → Pipeline → Command Encoder → Submit
 * 展示 WebGPU 的层级依赖结构与不可变性设计
 */
export async function initWebGPUExplicitStateMachine(
  canvas: HTMLCanvasElement
): Promise<WebGPUInitResult> {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported in this browser');
  }

  // Level 1: Adapter —— 物理 GPU 的只读能力查询
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance'
  });
  if (!adapter) {
    throw new Error('No suitable GPU adapter found');
  }

  console.log('Adapter features:', [...adapter.features]);
  console.log('Adapter limits:', adapter.limits);

  // Level 2: Device —— 逻辑设备，所有资源工厂
  const device = await adapter.requestDevice({
    requiredFeatures: [],
    requiredLimits: {
      maxBindGroups: 4,
      maxStorageBuffersPerShaderStage: 8
    }
  });

  // 异步错误处理：设备丢失事件
  device.lost.then((info) => {
    console.error(`Device lost: ${info.reason}`, info.message);
  });

  // Level 3: Canvas Context —— 交换链配置
  const context = canvas.getContext('webgpu')!;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format });

  return { device, context, format };
}

// ============================================================================
// 示例 2: WGSL 显式内存布局 —— 粒子系统结构体
// ============================================================================

/**
 * WGSL 中的结构体内存布局要求 CPU 侧精确匹配。
 * 此 TypeScript 代码生成对应的 WGSL 与缓冲区布局。
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  position: Vec3;
  mass: number;
  velocity: Vec3;
  lifetime: number;
}

/**
 * 生成与 WGSL 结构体精确匹配的 Float32Array。
 * WGSL 定义：
 *   struct Particle {
 *     position: vec3f,      // 12 bytes, offset 0
 *     @align(16) @size(4)    // 4 bytes padding to align mass
 *     mass: f32,             // 4 bytes, offset 16
 *     velocity: vec3f,       // 12 bytes, offset 20 (but aligns to 16!)
 *     @align(16) @size(4)
 *     lifetime: f32,         // 4 bytes, offset 32
 *   }
 * 实际占用：32 bytes（两个 vec3 各对齐到 16 字节）
 */
export function particlesToBuffer(particles: Particle[]): Float32Array {
  const PARTICLE_STRIDE = 8; // 32 bytes / 4 bytes per float
  const buffer = new Float32Array(particles.length * PARTICLE_STRIDE);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const base = i * PARTICLE_STRIDE;
    // position (vec3f + padding)
    buffer[base + 0] = p.position.x;
    buffer[base + 1] = p.position.y;
    buffer[base + 2] = p.position.z;
    buffer[base + 3] = p.mass; // mass occupies the padding slot for alignment
    // velocity (vec3f + padding)
    buffer[base + 4] = p.velocity.x;
    buffer[base + 5] = p.velocity.y;
    buffer[base + 6] = p.velocity.z;
    buffer[base + 7] = p.lifetime;
  }

  return buffer;
}

export const PARTICLE_WGSL = `
struct Particle {
  position: vec3f,
  @align(16) @size(4)
  mass: f32,
  velocity: vec3f,
  @align(16) @size(4)
  lifetime: f32,
}

@group(0) @binding(0)
var<storage, read> particles: array<Particle>;

@group(0) @binding(1)
var<storage, read_write> output_particles: array<Particle>;

@compute @workgroup_size(64)
fn updateParticles(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= arrayLength(&particles)) {
    return;
  }

  var p = particles[idx];
  p.position = p.position + p.velocity * 0.016;
  p.lifetime = p.lifetime - 0.016;

  output_particles[idx] = p;
}
`;

// ============================================================================
// 示例 3: Wasm 线性内存与 JS 零拷贝共享
// ============================================================================

export interface WASMPhysicsExports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  stepSimulation: (dt: number) => void;
  getParticleCount: () => number;
}

/**
 * 创建 Wasm 内存的 JS 视图，实现零拷贝数据交换。
 * 注意：若 Wasm 内部调用 memory.grow()，所有既有视图将失效。
 */
export function createSharedMemoryView(
  wasmExports: WASMPhysicsExports
): {
  positions: Float32Array;
  velocities: Float32Array;
  refresh: () => void;
} {
  const memory = wasmExports.memory;

  let positions = new Float32Array(memory.buffer, 0, 1024);
  let velocities = new Float32Array(memory.buffer, 4096, 1024);

  function refresh() {
    // 检测 memory.grow() 导致的 ArrayBuffer 分离
    if (positions.buffer !== memory.buffer) {
      positions = new Float32Array(memory.buffer, 0, 1024);
      velocities = new Float32Array(memory.buffer, 4096, 1024);
    }
  }

  return { positions, velocities, refresh };
}

// ============================================================================
// 示例 4: 命令编码器的 Writer Monad 实现
// ============================================================================

/**
 * 将 GPU 命令累积建模为 Writer Monad。
 * W 为命令日志类型，A 为返回值类型。
 */
export interface Writer<W, A> {
  readonly value: A;
  readonly log: W[];
}

export function pure<W, A>(value: A): Writer<W, A> {
  return { value, log: [] };
}

export function bind<W, A, B>(
  writer: Writer<W, A>,
  f: (a: A) => Writer<W, B>
): Writer<W, B> {
  const next = f(writer.value);
  return {
    value: next.value,
    log: [...writer.log, ...next.log]
  };
}

export function tell<W>(command: W): Writer<W, void> {
  return { value: undefined, log: [command] };
}

// GPU 命令的代数数据类型
export type GPUCommand =
  | { type: 'setPipeline'; pipeline: string }
  | { type: 'setBindGroup'; index: number; group: string }
  | { type: 'draw'; vertexCount: number; instanceCount: number }
  | { type: 'dispatchWorkgroups'; x: number; y: number; z: number }
  | { type: 'copyBufferToBuffer'; source: string; dest: string; size: number };

/**
 * 使用 Writer Monad 累积渲染命令。
 * 所有操作无副作用，直到显式提取 log。
 */
export function buildRenderCommands(): Writer<GPUCommand, void> {
  const step1 = tell<GPUCommand>({
    type: 'setPipeline',
    pipeline: 'render-particle-pipeline'
  });

  const step2 = bind(step1, () =>
    tell<GPUCommand>({
      type: 'setBindGroup',
      index: 0,
      group: 'particle-bind-group'
    })
  );

  const step3 = bind(step2, () =>
    tell<GPUCommand>({
      type: 'draw',
      vertexCount: 65536,
      instanceCount: 1
    })
  );

  return step3;
}

// 使用示例：
// const commands = buildRenderCommands();
// console.log(commands.log); // 提取累积的命令列表

// ============================================================================
// 示例 5: WebGPU 零拷贝数据流 —— GPUBuffer MAP 模式
// ============================================================================

/**
 * 通过 GPUBuffer 的 mappedAtCreation 实现 CPU ↔ GPU 零拷贝路径。
 * 适用于初始化数据或每帧 CPU 更新的场景。
 */
export async function zeroCopyParticleUpload(
  device: GPUDevice,
  particles: Particle[]
): Promise<GPUBuffer> {
  const PARTICLE_STRIDE = 32; // bytes
  const bufferSize = particles.length * PARTICLE_STRIDE;

  // 创建时即映射到 CPU 可访问地址空间
  const gpuBuffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.MAP_WRITE,
    mappedAtCreation: true
  });

  // getMappedRange 返回的 ArrayBuffer 直接 backed by GPU 内存
  const mappedRange = gpuBuffer.getMappedRange();
  const floatView = new Float32Array(mappedRange);

  // CPU 直接填充（零拷贝）
  const data = particlesToBuffer(particles);
  floatView.set(data);

  // 解除映射，将控制权交还 GPU
  gpuBuffer.unmap();

  return gpuBuffer;
}

/**
 * 回读 GPU 计算结果到 CPU（零拷贝读取路径）。
 */
export async function zeroCopyReadback(
  device: GPUDevice,
  sourceBuffer: GPUBuffer,
  size: number
): Promise<Float32Array> {
  const readbackBuffer = device.createBuffer({
    size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  // 编码拷贝命令
  const encoder = device.createCommandEncoder();
  encoder.copyBufferToBuffer(sourceBuffer, 0, readbackBuffer, 0, size);
  device.queue.submit([encoder.finish()]);

  // 异步等待 GPU 完成，然后映射读取
  await readbackBuffer.mapAsync(GPUMapMode.READ);
  const mappedRange = readbackBuffer.getMappedRange();

  // 创建副本（因为 unmap 后 mappedRange 失效）
  const result = new Float32Array(mappedRange.slice(0) as ArrayBuffer);
  readbackBuffer.unmap();

  // 清理临时缓冲区
  readbackBuffer.destroy();

  return result;
}

// ============================================================================
// 示例 6: JS + WASM + WebGPU 三元交互 —— 完整渲染循环骨架
// ============================================================================

export class HeterogeneousRenderLoop {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;

  // GPU 长期资源
  private uniformBuffer: GPUBuffer;
  private particleBuffer: GPUBuffer;
  private renderPipeline: GPURenderPipeline;
  private computePipeline: GPUComputePipeline;
  private bindGroup: GPUBindGroup;

  // Wasm 实例（可选）
  private wasmPhysics?: WASMPhysicsExports;

  constructor(device: GPUDevice, context: GPUCanvasContext, format: GPUTextureFormat) {
    this.device = device;
    this.context = context;
    this.format = format;

    // 初始化长期 GPU 资源
    this.uniformBuffer = device.createBuffer({
      size: 4 * 4 * 4, // mat4x4<f32>
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.particleBuffer = device.createBuffer({
      size: 65536 * 32,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX
    });

    // 简化：假设管线和绑定组已在别处创建
    this.renderPipeline = null as unknown as GPURenderPipeline;
    this.computePipeline = null as unknown as GPUComputePipeline;
    this.bindGroup = null as unknown as GPUBindGroup;
  }

  setWasmPhysics(exports: WASMPhysicsExports): void {
    this.wasmPhysics = exports;
  }

  /**
   * 单帧渲染：JS 控制流 → Wasm 物理更新 → GPU 计算/渲染
   */
  render(frameTimeMs: number): void {
    const dt = frameTimeMs / 1000;

    // Step 1: JS 层更新 Uniform（如 MVP 矩阵）
    const mvpMatrix = this.computeMVPMatrix(dt);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, mvpMatrix);

    // Step 2: 可选 Wasm 物理更新
    if (this.wasmPhysics) {
      this.wasmPhysics.stepSimulation(dt);
      // 若 Wasm 内存与 GPUBuffer 共享，无需额外拷贝
    }

    // Step 3: GPU 命令编码（Writer Monad 的隐式实现）
    const encoder = this.device.createCommandEncoder();

    // 计算 Pass：GPU 侧粒子更新
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.bindGroup);
    computePass.dispatchWorkgroups(Math.ceil(65536 / 256));
    computePass.end();

    // 渲染 Pass：GPU 侧光栅化
    const textureView = this.context.getCurrentTexture().createView();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 }
      }]
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.setVertexBuffer(0, this.particleBuffer);
    renderPass.draw(65536);
    renderPass.end();

    // Step 4: 单一提交点 —— 所有副作用在此发生
    this.device.queue.submit([encoder.finish()]);
  }

  private computeMVPMatrix(_dt: number): Float32Array {
    // 简化的单位矩阵
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }
}

// ============================================================================
// 示例 7: 对称差分析 —— 能力集合比较工具
// ============================================================================

export type APIFeature =
  | 'ComputeShader'
  | 'StorageBuffers'
  | 'IndirectDraw'
  | 'MultiThreadRecord'
  | 'ExplicitBarriers'
  | 'ModernBinding'
  | 'Instancing'
  | 'HDR'
  | 'VR'
  | 'OffscreenCanvas';

export const apiCapabilities: Record<string, Set<APIFeature>> = {
  'Canvas2D': new Set(['OffscreenCanvas']),
  'WebGL1': new Set(['Instancing', 'VR']),
  'WebGL2': new Set(['Instancing', 'IndirectDraw', 'VR', 'OffscreenCanvas']),
  'WebGPU': new Set([
    'ComputeShader', 'StorageBuffers', 'IndirectDraw', 'MultiThreadRecord',
    'ExplicitBarriers', 'ModernBinding', 'Instancing', 'HDR', 'VR', 'OffscreenCanvas'
  ])
};

/**
 * 计算两个 API 能力集合的对称差。
 * 形式化：Δ(A, B) = (A \ B) ∪ (B \ A)
 */
export function symmetricDifference(
  setA: Set<APIFeature>,
  setB: Set<APIFeature>
): { onlyInA: APIFeature[]; onlyInB: APIFeature[] } {
  const onlyInA = [...setA].filter(f => !setB.has(f));
  const onlyInB = [...setB].filter(f => !setA.has(f));
  return { onlyInA, onlyInB };
}

/**
 * 判断 API 间的能力精化关系。
 * A ⊑ B 当且仅当 A 的能力集合是 B 的子集。
 */
export function refines(
    sub: Set<APIFeature>,
    sup: Set<APIFeature>
  ): boolean {
  for (const f of sub) {
    if (!sup.has(f)) return false;
  }
  return true;
}

// 使用示例：
// const diff = symmetricDifference(apiCapabilities.WebGL2, apiCapabilities.WebGPU);
// console.log('WebGPU has but WebGL2 lacks:', diff.onlyInB);
// console.log('Does WebGPU refine WebGL2?', refines(apiCapabilities.WebGL2, apiCapabilities.WebGPU));

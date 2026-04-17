/**
 * @file WebGPU 计算基础
 * @category Edge AI → WebGPU
 * @difficulty hard
 * @tags webgpu, compute-shader, gpgpu, parallel-computation, vector-add
 *
 * @description
 * WebGPU 是现代浏览器提供的新一代图形与计算 API，支持通用 GPU 计算（GPGPU）。
 * 本模块模拟 WebGPU 计算管线核心流程，并在不支持 WebGPU 的环境回退到 CPU 实现。
 *
 * 核心概念：
 * - Compute Pipeline：配置计算着色器与绑定组
 * - Workgroup：并行执行单元（本模拟中映射到循环分块）
 * - Storage Buffer：GPU 与 CPU 之间的数据交换区
 */

export interface GPUBuffer {
  readonly size: number;
  readonly data: Float32Array;
}

export interface ComputeShader {
  entryPoint: string;
  workgroupSize: readonly [number, number, number];
  /** 模拟着色器逻辑：对输入缓冲区执行操作 */
  compute: (inputs: GPUBuffer[], outputs: GPUBuffer[], globalId: number) => void;
}

export class WebGPUCompute {
  private buffers = new Map<number, GPUBuffer>();
  private nextBufferId = 1;

  /**
   * 创建存储缓冲区
   */
  createBuffer(size: number): number {
    const id = this.nextBufferId++;
    this.buffers.set(id, { size, data: new Float32Array(size) });
    return id;
  }

  /**
   * 向缓冲区写入数据
   */
  writeBuffer(bufferId: number, data: Float32Array, offset = 0): void {
    const buffer = this.buffers.get(bufferId);
    if (!buffer) throw new Error(`Buffer ${bufferId} not found`);
    if (offset + data.length > buffer.size) {
      throw new Error('Write exceeds buffer size');
    }
    buffer.data.set(data, offset);
  }

  /**
   * 读取缓冲区数据
   */
  readBuffer(bufferId: number): Float32Array {
    const buffer = this.buffers.get(bufferId);
    if (!buffer) throw new Error(`Buffer ${bufferId} not found`);
    return buffer.data.slice();
  }

  /**
   * 分发计算任务（模拟 workgroup 执行）
   * @param shader - 计算着色器逻辑
   * @param bindings - 绑定组：bufferId 数组（输入在前，输出在后）
   * @param workgroupCount - workgroup 数量（一维）
   */
  dispatchWorkgroups(
    shader: ComputeShader,
    bindings: number[],
    workgroupCount: number
  ): void {
    const inputs = bindings.slice(0, -1).map(id => this.buffers.get(id)!);
    const output = this.buffers.get(bindings[bindings.length - 1])!;

    const totalThreads = workgroupCount * shader.workgroupSize[0];
    for (let globalId = 0; globalId < totalThreads; globalId++) {
      shader.compute(inputs, [output], globalId);
    }
  }

  /**
   * 内置：向量加法计算着色器
   */
  static vectorAddShader(): ComputeShader {
    return {
      entryPoint: 'main',
      workgroupSize: [64, 1, 1],
      compute: (inputs, outputs, globalId) => {
        const a = inputs[0].data;
        const b = inputs[1].data;
        const c = outputs[0].data;
        if (globalId < c.length) {
          c[globalId] = a[globalId] + b[globalId];
        }
      }
    };
  }

  /**
   * 内置：逐元素 ReLU 计算着色器
   */
  static reluShader(): ComputeShader {
    return {
      entryPoint: 'main',
      workgroupSize: [64, 1, 1],
      compute: (inputs, outputs, globalId) => {
        const inp = inputs[0].data;
        const out = outputs[0].data;
        if (globalId < out.length) {
          out[globalId] = Math.max(0, inp[globalId]);
        }
      }
    };
  }
}

export function demo(): void {
  console.log('=== WebGPU 计算模拟 ===\n');

  const gpu = new WebGPUCompute();
  const size = 8;

  const bufA = gpu.createBuffer(size);
  const bufB = gpu.createBuffer(size);
  const bufC = gpu.createBuffer(size);

  gpu.writeBuffer(bufA, new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]));
  gpu.writeBuffer(bufB, new Float32Array([8, 7, 6, 5, 4, 3, 2, 1]));

  const shader = WebGPUCompute.vectorAddShader();
  gpu.dispatchWorkgroups(shader, [bufA, bufB, bufC], Math.ceil(size / shader.workgroupSize[0]));

  console.log('向量加法结果:', Array.from(gpu.readBuffer(bufC)).join(', '));
}

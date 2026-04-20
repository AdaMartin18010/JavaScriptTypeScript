/**
 * @file ONNX 运行时桥接器：会话管理、执行 Provider 选择与动态形状处理
 * @category Edge AI → Inference Engine
 * @difficulty hard
 * @tags onnx, inference-engine, session-management, execution-provider, dynamic-shape, edge-ai
 */

/** ONNX 张量类型 */
export interface Tensor {
  shape: number[];
  data: Float32Array;
}

/** ONNX 节点类型 */
export interface ONNXNode {
  opType: 'Conv' | 'Relu' | 'MaxPool' | 'Gemm' | 'Flatten';
  inputs: string[];
  outputs: string[];
  attributes?: Record<string, number | number[] | string>;
}

/** 简化版 ONNX 模型图 */
export interface ONNXGraph {
  name: string;
  inputs: Record<string, Tensor>;
  initializers: Record<string, Tensor>;
  nodes: ONNXNode[];
  outputs: string[];
}

/** 内存池：存储中间计算结果 */
export class ValuePool {
  private values = new Map<string, Tensor>();

  set(name: string, tensor: Tensor): void {
    this.values.set(name, tensor);
  }

  get(name: string): Tensor {
    const t = this.values.get(name);
    if (!t) throw new Error(`Tensor "${name}" not found in value pool`);
    return t;
  }
}

/** 执行 Provider 类型 */
export type ExecutionProvider = 'cpu' | 'wasm' | 'webgpu';

/**
 * ONNX 会话管理器
 * 封装模型加载、Provider 选择与多次推理的运行时状态
 */
export class ONNXSession {
  private graph: ONNXGraph;
  private provider: ExecutionProvider;
  private runtime: ONNXRuntimeBridge;

  constructor(graph: ONNXGraph, provider: ExecutionProvider = 'cpu') {
    this.graph = graph;
    this.provider = provider;
    this.runtime = new ONNXRuntimeBridge(graph);
  }

  setProvider(provider: ExecutionProvider): void {
    this.provider = provider;
  }

  getProvider(): ExecutionProvider {
    return this.provider;
  }

  run(inputs: Record<string, Tensor>): Record<string, Tensor> {
    // 实际场景中不同 Provider 会调用不同后端；这里统一使用模拟运行时
    return this.runtime.run(inputs);
  }

  getGraphInfo(): { name: string; inputNames: string[]; outputNames: string[] } {
    return {
      name: this.graph.name,
      inputNames: Object.keys(this.graph.inputs),
      outputNames: this.graph.outputs
    };
  }
}

/**
 * 张量工厂：简化输入/输出张量的创建与形状推导
 */
export class TensorFactory {
  static create(data: number[], shape: number[]): Tensor {
    return { shape: shape.slice(), data: new Float32Array(data) };
  }

  static fromFloat32Array(data: Float32Array, shape: number[]): Tensor {
    return { shape: shape.slice(), data };
  }

  /** 根据动态 batch 维度重塑张量 */
  static reshape(tensor: Tensor, newShape: number[]): Tensor {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== tensor.data.length) {
      throw new Error(`Reshape mismatch: ${tensor.data.length} vs ${newSize}`);
    }
    return { shape: newShape.slice(), data: tensor.data.slice() };
  }

  /** 推导动态轴后的输出形状（简化版） */
  static inferDynamicShape(
    inputShape: number[],
    outputShapeTemplate: (number | string)[],
    axisMap: Record<string, number>
  ): number[] {
    return outputShapeTemplate.map(dim => {
      if (typeof dim === 'string') {
        const mapped = axisMap[dim];
        if (mapped === undefined) throw new Error(`Unknown dynamic axis: ${dim}`);
        return mapped;
      }
      return dim;
    });
  }
}

/**
 * ONNX 简化推理引擎
 * 支持 Conv（卷积）、ReLU（激活）、MaxPool（池化）、Gemm（矩阵乘）算子的模拟实现
 */
export class ONNXRuntimeBridge {
  constructor(private graph: ONNXGraph) {}

  /**
   * 执行模型前向传播
   */
  run(inputTensors: Record<string, Tensor>): Record<string, Tensor> {
    const pool = new ValuePool();

    // 加载输入
    for (const [name, tensor] of Object.entries(inputTensors)) {
      pool.set(name, tensor);
    }

    // 加载初始化器（权重/偏置）
    for (const [name, tensor] of Object.entries(this.graph.initializers)) {
      pool.set(name, tensor);
    }

    // 按拓扑序执行节点
    for (const node of this.graph.nodes) {
      this.executeNode(node, pool);
    }

    // 收集输出
    const outputs: Record<string, Tensor> = {};
    for (const name of this.graph.outputs) {
      outputs[name] = pool.get(name);
    }
    return outputs;
  }

  private executeNode(node: ONNXNode, pool: ValuePool): void {
    switch (node.opType) {
      case 'Conv':
        this.execConv(node, pool);
        break;
      case 'Relu':
        this.execRelu(node, pool);
        break;
      case 'MaxPool':
        this.execMaxPool(node, pool);
        break;
      case 'Gemm':
        this.execGemm(node, pool);
        break;
      case 'Flatten':
        this.execFlatten(node, pool);
        break;
      default:
        throw new Error(`Unsupported operator: ${node.opType}`);
    }
  }

  /**
   * Conv 算子模拟（仅支持单通道、无填充、stride=1、kernel=2x2 的简化版）
   */
  private execConv(node: ONNXNode, pool: ValuePool): void {
    const [xName, wName, bName] = node.inputs;
    const x = pool.get(xName);
    const w = pool.get(wName);
    const b = bName ? pool.get(bName) : null;

    const [batch, inC, inH, inW] = x.shape;
    const [outC, , kH, kW] = w.shape;
    const outH = inH - kH + 1;
    const outW = inW - kW + 1;

    const output = new Float32Array(batch * outC * outH * outW);

    for (let n = 0; n < batch; n++) {
      for (let oc = 0; oc < outC; oc++) {
        for (let h = 0; h < outH; h++) {
          for (let wIdx = 0; wIdx < outW; wIdx++) {
            let sum = 0;
            for (let ic = 0; ic < inC; ic++) {
              for (let kh = 0; kh < kH; kh++) {
                for (let kw = 0; kw < kW; kw++) {
                  const xVal = this.get4D(x, n, ic, h + kh, wIdx + kw);
                  const wVal = this.get4D(w, oc, ic, kh, kw);
                  sum += xVal * wVal;
                }
              }
            }
            if (b) sum += b.data[oc];
            this.set4D(output, [batch, outC, outH, outW], n, oc, h, wIdx, sum);
          }
        }
      }
    }

    pool.set(node.outputs[0], { shape: [batch, outC, outH, outW], data: output });
  }

  private execRelu(node: ONNXNode, pool: ValuePool): void {
    const input = pool.get(node.inputs[0]);
    const output = new Float32Array(input.data.length);
    for (let i = 0; i < input.data.length; i++) {
      output[i] = Math.max(0, input.data[i]);
    }
    pool.set(node.outputs[0], { shape: input.shape, data: output });
  }

  /**
   * MaxPool 算子模拟（2x2 窗口，stride=2）
   */
  private execMaxPool(node: ONNXNode, pool: ValuePool): void {
    const input = pool.get(node.inputs[0]);
    const [batch, channels, inH, inW] = input.shape;
    const poolSize = 2;
    const stride = 2;
    const outH = Math.floor(inH / stride);
    const outW = Math.floor(inW / stride);

    const output = new Float32Array(batch * channels * outH * outW);

    for (let n = 0; n < batch; n++) {
      for (let c = 0; c < channels; c++) {
        for (let h = 0; h < outH; h++) {
          for (let w = 0; w < outW; w++) {
            let maxVal = -Infinity;
            for (let ph = 0; ph < poolSize; ph++) {
              for (let pw = 0; pw < poolSize; pw++) {
                const val = this.get4D(input, n, c, h * stride + ph, w * stride + pw);
                maxVal = Math.max(maxVal, val);
              }
            }
            this.set4D(output, [batch, channels, outH, outW], n, c, h, w, maxVal);
          }
        }
      }
    }

    pool.set(node.outputs[0], { shape: [batch, channels, outH, outW], data: output });
  }

  /**
   * Gemm 算子模拟：Y = alpha * A * B + beta * C
   */
  private execGemm(node: ONNXNode, pool: ValuePool): void {
    const [aName, bName, cName] = node.inputs;
    const A = pool.get(aName);
    const B = pool.get(bName);
    const C = cName ? pool.get(cName) : null;

    const alpha = (node.attributes?.alpha as number) ?? 1.0;
    const beta = (node.attributes?.beta as number) ?? 1.0;
    const transA = (node.attributes?.transA as number) ?? 0;
    const transB = (node.attributes?.transB as number) ?? 0;

    const [m, kA] = A.shape;
    const [kB, n] = B.shape;
    const k = transA ? m : kA;

    const output = new Float32Array(m * n);

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let kk = 0; kk < k; kk++) {
          const aVal = transA ? A.data[kk * m + i] : A.data[i * k + kk];
          const bVal = transB ? B.data[j * k + kk] : B.data[kk * n + j];
          sum += aVal * bVal;
        }
        let val = alpha * sum;
        if (C) {
          val += beta * (C.data.length === 1 ? C.data[0] : C.data[j]);
        }
        output[i * n + j] = val;
      }
    }

    pool.set(node.outputs[0], { shape: [m, n], data: output });
  }

  private execFlatten(node: ONNXNode, pool: ValuePool): void {
    const input = pool.get(node.inputs[0]);
    const axis = (node.attributes?.axis as number) ?? 1;
    const firstDim = input.shape.slice(0, axis).reduce((a, b) => a * b, 1);
    const secondDim = input.shape.slice(axis).reduce((a, b) => a * b, 1);
    pool.set(node.outputs[0], { shape: [firstDim, secondDim], data: input.data });
  }

  private get4D(tensor: Tensor, n: number, c: number, h: number, w: number): number {
    const [N, C, H, W] = tensor.shape;
    return tensor.data[((n * C + c) * H + h) * W + w];
  }

  private set4D(data: Float32Array, shape: number[], n: number, c: number, h: number, w: number, val: number): void {
    const [N, C, H, W] = shape;
    data[((n * C + c) * H + h) * W + w] = val;
  }
}

export function demo(): void {
  console.log('=== ONNX Runtime Bridge 演示 ===\n');

  // 构建一个极简 LeNet 风格的 ONNX 图：Conv -> ReLU -> MaxPool -> Flatten -> Gemm
  const graph: ONNXGraph = {
    name: 'TinyLeNet',
    inputs: {},
    initializers: {
      convW: { shape: [2, 1, 2, 2], data: new Float32Array([
        0.5, 0.5, 0.5, 0.5, // filter 0
        0.2, 0.2, 0.2, 0.2  // filter 1
      ]) },
      convB: { shape: [2], data: new Float32Array([0.1, -0.1]) },
      gemmW: { shape: [8, 2], data: new Float32Array([
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
        0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1
      ]) },
      gemmB: { shape: [2], data: new Float32Array([0.05, -0.05]) }
    },
    nodes: [
      { opType: 'Conv', inputs: ['input', 'convW', 'convB'], outputs: ['convOut'] },
      { opType: 'Relu', inputs: ['convOut'], outputs: ['reluOut'] },
      { opType: 'MaxPool', inputs: ['reluOut'], outputs: ['poolOut'] },
      { opType: 'Flatten', inputs: ['poolOut'], outputs: ['flatOut'], attributes: { axis: 1 } },
      { opType: 'Gemm', inputs: ['flatOut', 'gemmW', 'gemmB'], outputs: ['output'], attributes: { alpha: 1.0, beta: 1.0 } }
    ],
    outputs: ['output']
  };

  // 使用 Session 管理器封装
  const session = new ONNXSession(graph, 'wasm');
  console.log('图信息:', session.getGraphInfo());

  // 构造 1x1x4x4 的输入（模拟 MNIST 的一小块）
  const inputTensor = TensorFactory.create([
    1, 2, 3, 4,
    5, 6, 7, 8,
    1, 2, 3, 4,
    5, 6, 7, 8
  ], [1, 1, 4, 4]);

  const outputs = session.run({ input: inputTensor });
  console.log('ONNX 图输出:', Array.from(outputs.output.data).map(v => v.toFixed(4)).join(', '));

  // 动态形状演示
  const dynamicShape = TensorFactory.inferDynamicShape(
    [1, 1, 4, 4], ['batch', 1, 'H', 'W'], { batch: 1, H: 4, W: 4 }
  );
  console.log('动态形状推导:', dynamicShape);

  console.log('ONNX Runtime Bridge 通过会话管理与 Provider 选择，在边缘端实现脱离 Python 环境的模型推理。');
}

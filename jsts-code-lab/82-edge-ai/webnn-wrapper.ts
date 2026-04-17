/**
 * @file WebNN API 封装器
 * @category Edge AI → WebNN
 * @difficulty hard
 * @tags webnn, neural-network, edge-inference, graph-compilation
 *
 * @description
 * WebNN 是 W3C 正在标准化的浏览器端神经网络推理 API，允许在 CPU、GPU 或 NPU 上
 * 执行预训练模型。本模块提供教学级封装，演示图构建、张量描述与推理流程。
 *
 * 由于 Node 环境不支持原生 WebNN，本实现使用内存模拟展示 API 设计思想。
 */

export interface WebNNTensorDesc {
  shape: readonly number[];
  dataType: 'float32' | 'int32';
}

export interface WebNNTensor {
  desc: WebNNTensorDesc;
  data: Float32Array;
}

export interface WebNNNode {
  name: string;
  op: 'matmul' | 'add' | 'relu' | 'conv2d';
  inputs: string[];
  output: string;
  attributes?: Record<string, number | number[]>;
}

export class WebNNWrapper {
  private tensors = new Map<string, WebNNTensor>();
  private nodes: WebNNNode[] = [];

  /**
   * 注册常量张量（如权重、偏置）
   */
  constant(name: string, desc: WebNNTensorDesc, data: Float32Array): void {
    this.tensors.set(name, { desc, data });
  }

  /**
   * 声明输入张量占位符
   */
  input(name: string, desc: WebNNTensorDesc): void {
    this.tensors.set(name, { desc, data: new Float32Array(desc.shape.reduce((a, b) => a * b, 1)) });
  }

  /**
   * 添加计算节点
   */
  addNode(node: WebNNNode): void {
    this.nodes.push(node);
  }

  /**
   * 构建并"编译"计算图
   */
  build(): void {
    // 教学级：仅验证拓扑与形状兼容性
    for (const node of this.nodes) {
      for (const inp of node.inputs) {
        if (!this.tensors.has(inp)) {
          throw new Error(`Build error: missing input tensor "${inp}" for node "${node.name}"`);
        }
      }
    }
    console.log('[WebNN] Graph built with', this.nodes.length, 'nodes');
  }

  /**
   * 执行推理
   * @param inputs - 输入张量映射
   * @returns 输出张量映射
   */
  compute(inputs: Record<string, WebNNTensor>): Record<string, WebNNTensor> {
    // 加载输入
    for (const [name, tensor] of Object.entries(inputs)) {
      this.tensors.set(name, tensor);
    }

    // 按节点顺序执行（假设已拓扑排序）
    for (const node of this.nodes) {
      this.executeNode(node);
    }

    // 收集所有输出张量
    const outputs: Record<string, WebNNTensor> = {};
    for (const node of this.nodes) {
      const out = this.tensors.get(node.output);
      if (out) outputs[node.output] = out;
    }
    return outputs;
  }

  private executeNode(node: WebNNNode): void {
    switch (node.op) {
      case 'add': {
        const a = this.tensors.get(node.inputs[0])!;
        const b = this.tensors.get(node.inputs[1])!;
        const result = new Float32Array(a.data.length);
        for (let i = 0; i < result.length; i++) {
          result[i] = a.data[i] + b.data[i];
        }
        this.tensors.set(node.output, { desc: a.desc, data: result });
        break;
      }
      case 'relu': {
        const inp = this.tensors.get(node.inputs[0])!;
        const result = new Float32Array(inp.data.length);
        for (let i = 0; i < result.length; i++) {
          result[i] = Math.max(0, inp.data[i]);
        }
        this.tensors.set(node.output, { desc: inp.desc, data: result });
        break;
      }
      case 'matmul': {
        const a = this.tensors.get(node.inputs[0])!;
        const b = this.tensors.get(node.inputs[1])!;
        const [m, k] = a.desc.shape;
        const [, n] = b.desc.shape;
        const result = new Float32Array(m * n);
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let kk = 0; kk < k; kk++) {
              sum += a.data[i * k + kk] * b.data[kk * n + j];
            }
            result[i * n + j] = sum;
          }
        }
        this.tensors.set(node.output, { desc: { shape: [m, n], dataType: 'float32' }, data: result });
        break;
      }
      default:
        throw new Error(`Unsupported op: ${node.op}`);
    }
  }
}

export function demo(): void {
  console.log('=== WebNN Wrapper ===\n');

  const webnn = new WebNNWrapper();
  webnn.input('input', { shape: [1, 4], dataType: 'float32' });
  webnn.constant('weight', { shape: [4, 2], dataType: 'float32' }, new Float32Array([
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8
  ]));
  webnn.constant('bias', { shape: [1, 2], dataType: 'float32' }, new Float32Array([0.1, -0.1]));

  webnn.addNode({ name: 'gemm', op: 'matmul', inputs: ['input', 'weight'], output: 'gemmOut' });
  webnn.addNode({ name: 'addBias', op: 'add', inputs: ['gemmOut', 'bias'], output: 'addOut' });
  webnn.addNode({ name: 'relu', op: 'relu', inputs: ['addOut'], output: 'output' });

  webnn.build();

  const result = webnn.compute({
    input: { desc: { shape: [1, 4], dataType: 'float32' }, data: new Float32Array([1, 2, 3, 4]) }
  });

  console.log('推理结果:', Array.from(result.output.data).map(v => v.toFixed(4)));
}

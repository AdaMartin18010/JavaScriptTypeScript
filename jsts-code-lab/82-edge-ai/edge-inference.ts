/**
 * @file 边缘推理
 * @category Edge AI → Inference
 * @difficulty hard
 * @tags edge-ai, model-optimization, federated-learning, quantization
 */

// 模型量化
export class ModelQuantization {
  // 权重量化：将float32量化为int8
  quantizeWeights(weights: Float32Array, bits: 8 | 16 = 8): {
    quantized: Int8Array;
    scale: number;
    zeroPoint: number;
  } {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    
    const qmin = bits === 8 ? -128 : -32768;
    const qmax = bits === 8 ? 127 : 32767;
    
    const scale = (max - min) / (qmax - qmin);
    const zeroPoint = Math.round(qmin - min / scale);
    
    const quantized = new Int8Array(weights.length);
    for (let i = 0; i < weights.length; i++) {
      quantized[i] = Math.max(qmin, Math.min(qmax, Math.round(weights[i] / scale + zeroPoint)));
    }
    
    return { quantized, scale, zeroPoint };
  }
  
  // 反量化
  dequantizeWeights(quantized: Int8Array, scale: number, zeroPoint: number): Float32Array {
    const weights = new Float32Array(quantized.length);
    for (let i = 0; i < quantized.length; i++) {
      weights[i] = (quantized[i] - zeroPoint) * scale;
    }
    return weights;
  }
  
  // 计算量化误差
  calculateQuantizationError(original: Float32Array, quantized: Float32Array): number {
    let error = 0;
    for (let i = 0; i < original.length; i++) {
      error += Math.abs(original[i] - quantized[i]);
    }
    return error / original.length;
  }
}

// 模型剪枝
export class ModelPruning {
  // 结构化剪枝：移除不重要的神经元/通道
  structuredPrune(weights: number[][], sparsity: number): {
    pruned: number[][];
    mask: boolean[][];
  } {
    // 计算每个神经元的重要性（L1范数）
    const importance = weights.map(row => 
      row.reduce((sum, w) => sum + Math.abs(w), 0)
    );
    
    // 确定阈值
    const sorted = [...importance].sort((a, b) => a - b);
    const thresholdIndex = Math.floor(sorted.length * sparsity);
    const threshold = sorted[thresholdIndex];
    
    // 创建掩码
    const mask = weights.map((row, i) => 
      row.map(() => importance[i] >= threshold)
    );
    
    // 应用掩码
    const pruned = weights.map((row, i) =>
      row.map((w, j) => mask[i][j] ? w : 0)
    );
    
    return { pruned, mask };
  }
  
  // 非结构化剪枝：移除小的权重
  unstructuredPrune(weights: number[], sparsity: number): {
    pruned: number[];
    mask: boolean[];
  } {
    const sorted = [...weights].map((w, i) => ({ w, i }))
      .sort((a, b) => Math.abs(a.w) - Math.abs(b.w));
    
    const numToPrune = Math.floor(weights.length * sparsity);
    const pruneIndices = new Set(sorted.slice(0, numToPrune).map(x => x.i));
    
    const mask = weights.map((_, i) => !pruneIndices.has(i));
    const pruned = weights.map((w, i) => mask[i] ? w : 0);
    
    return { pruned, mask };
  }
}

// 知识蒸馏
export class KnowledgeDistillation {
  // 使用教师模型的软标签训练学生模型
  distill(
    teacherLogits: number[],
    studentLogits: number[],
    trueLabels: number[],
    temperature: number = 4
  ): number {
    // 软化概率分布
    const softTeacher = this.softmax(teacherLogits.map(x => x / temperature));
    const softStudent = this.softmax(studentLogits.map(x => x / temperature));
    
    // 蒸馏损失
    const distillationLoss = this.crossEntropy(softStudent, softTeacher);
    
    // 硬标签损失
    const hardLoss = this.crossEntropy(
      this.softmax(studentLogits),
      trueLabels
    );
    
    // 总损失
    const alpha = 0.7;
    return alpha * distillationLoss * (temperature ** 2) + (1 - alpha) * hardLoss;
  }
  
  private softmax(logits: number[]): number[] {
    const max = Math.max(...logits);
    const exp = logits.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / sum);
  }
  
  private crossEntropy(predicted: number[], target: number[]): number {
    return -target.reduce((sum, t, i) => sum + t * Math.log(predicted[i] + 1e-10), 0);
  }
}

// 联邦学习
export interface FederatedClient {
  id: string;
  dataSize: number;
  model: Record<string, Float32Array>;
}

export class FederatedLearning {
  private clients: FederatedClient[] = [];
  private globalModel: Record<string, Float32Array> = {};
  
  registerClient(client: FederatedClient): void {
    this.clients.push(client);
  }
  
  // FedAvg算法：加权平均聚合
  aggregate(): Record<string, Float32Array> {
    const totalData = this.clients.reduce((sum, c) => sum + c.dataSize, 0);
    
    const aggregated: Record<string, Float32Array> = {};
    const layerNames = Object.keys(this.clients[0]?.model || {});
    
    for (const layer of layerNames) {
      const shape = this.clients[0].model[layer].length;
      aggregated[layer] = new Float32Array(shape);
      
      for (const client of this.clients) {
        const weight = client.dataSize / totalData;
        const clientWeights = client.model[layer];
        
        for (let i = 0; i < shape; i++) {
          aggregated[layer][i] += clientWeights[i] * weight;
        }
      }
    }
    
    this.globalModel = aggregated;
    return aggregated;
  }
  
  // 差分隐私聚合
  aggregateWithPrivacy(epsilon: number = 1.0): Record<string, Float32Array> {
    const aggregated = this.aggregate();
    
    // 添加噪声
    for (const layer of Object.keys(aggregated)) {
      const sensitivity = 2.0 / this.clients.length; // 简化敏感度计算
      const noiseScale = sensitivity / epsilon;
      
      for (let i = 0; i < aggregated[layer].length; i++) {
        aggregated[layer][i] += this.gaussianNoise(0, noiseScale);
      }
    }
    
    return aggregated;
  }
  
  private gaussianNoise(mean: number, std: number): number {
    // Box-Muller变换
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * std;
  }
  
  getGlobalModel(): Record<string, Float32Array> {
    return this.globalModel;
  }
}

// 设备端推理引擎
export class EdgeInferenceEngine {
  private model: Record<string, Float32Array> | null = null;
  private quantized = false;
  
  loadModel(model: Record<string, Float32Array>, quantized: boolean = false): void {
    this.model = model;
    this.quantized = quantized;
  }
  
  // 简化的前向传播（模拟）
  infer(input: Float32Array): Float32Array {
    if (!this.model) throw new Error('Model not loaded');
    
    // 模拟推理延迟
    const startTime = performance.now();
    
    // 简化的矩阵乘法模拟
    let output = input;
    for (const [layerName, weights] of Object.entries(this.model)) {
      if (layerName.includes('weight')) {
        output = this.matmul(output, weights);
        output = output.map(x => Math.max(0, x)); // ReLU
      }
    }
    
    const latency = performance.now() - startTime;
    console.log(`[EdgeInference] Latency: ${latency.toFixed(2)}ms`);
    
    return output;
  }
  
  private matmul(a: Float32Array, b: Float32Array): Float32Array {
    // 简化的矩阵乘法
    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] * b[i % b.length];
    }
    return result;
  }
  
  // 获取模型大小
  getModelSize(): number {
    if (!this.model) return 0;
    
    let size = 0;
    for (const weights of Object.values(this.model)) {
      size += weights.length * (this.quantized ? 1 : 4); // bytes per weight
    }
    return size;
  }
  
  // 内存优化：清理中间结果
  optimizeMemory(): void {
    // 模拟内存优化
    console.log('[EdgeInference] Memory optimized');
  }
}

// 模型性能分析
export class ModelProfiler {
  profileInference(model: EdgeInferenceEngine, input: Float32Array, runs: number = 100): {
    avgLatency: number;
    p50: number;
    p95: number;
    p99: number;
    throughput: number;
  } {
    const latencies: number[] = [];
    
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      model.infer(input);
      latencies.push(performance.now() - start);
    }
    
    latencies.sort((a, b) => a - b);
    
    const avg = latencies.reduce((a, b) => a + b, 0) / runs;
    const totalTime = latencies.reduce((a, b) => a + b, 0);
    
    return {
      avgLatency: avg,
      p50: latencies[Math.floor(runs * 0.5)],
      p95: latencies[Math.floor(runs * 0.95)],
      p99: latencies[Math.floor(runs * 0.99)],
      throughput: (runs / totalTime) * 1000 // inferences per second
    };
  }
}

export function demo(): void {
  console.log('=== 边缘AI ===\n');
  
  // 模型量化
  console.log('--- 模型量化 ---');
  const quantization = new ModelQuantization();
  
  const originalWeights = new Float32Array([0.1, -0.5, 0.8, -0.2, 0.3, -0.7, 0.4, -0.1]);
  const quantized = quantization.quantizeWeights(originalWeights, 8);
  
  console.log('原始权重:', Array.from(originalWeights).map(w => w.toFixed(3)).join(', '));
  console.log('量化后:', Array.from(quantized.quantized).join(', '));
  console.log('Scale:', quantized.scale.toFixed(4), 'Zero Point:', quantized.zeroPoint);
  
  const dequantized = quantization.dequantizeWeights(
    quantized.quantized,
    quantized.scale,
    quantized.zeroPoint
  );
  
  const error = quantization.calculateQuantizationError(originalWeights, dequantized);
  console.log('量化误差:', error.toFixed(6));
  
  // 模型剪枝
  console.log('\n--- 模型剪枝 ---');
  const pruning = new ModelPruning();
  
  const weights = [
    [0.1, 0.2, 0.3],
    [0.01, 0.02, 0.01], // 小权重，将被剪枝
    [0.5, 0.6, 0.7],
    [0.001, 0.002, 0.001] // 小权重，将被剪枝
  ];
  
  const pruned = pruning.structuredPrune(weights, 0.5);
  console.log('原始权重矩阵:');
  weights.forEach(row => console.log(' ', row.map(w => w.toFixed(3)).join(', ')));
  console.log('剪枝后矩阵:');
  pruned.pruned.forEach(row => console.log(' ', row.map(w => w.toFixed(3)).join(', ')));
  
  // 联邦学习
  console.log('\n--- 联邦学习 ---');
  const fl = new FederatedLearning();
  
  // 模拟3个客户端
  fl.registerClient({
    id: 'client-1',
    dataSize: 1000,
    model: { layer1: new Float32Array([0.1, 0.2, 0.3]), layer2: new Float32Array([0.4, 0.5]) }
  });
  
  fl.registerClient({
    id: 'client-2',
    dataSize: 2000,
    model: { layer1: new Float32Array([0.15, 0.25, 0.35]), layer2: new Float32Array([0.45, 0.55]) }
  });
  
  fl.registerClient({
    id: 'client-3',
    dataSize: 1500,
    model: { layer1: new Float32Array([0.12, 0.22, 0.32]), layer2: new Float32Array([0.42, 0.52]) }
  });
  
  const globalModel = fl.aggregate();
  console.log('聚合后的全局模型:');
  console.log('  layer1:', Array.from(globalModel.layer1).map(w => w.toFixed(3)).join(', '));
  
  // 边缘推理
  console.log('\n--- 边缘推理 ---');
  const engine = new EdgeInferenceEngine();
  engine.loadModel(globalModel, true);
  
  const input = new Float32Array([1.0, 2.0, 3.0]);
  const output = engine.infer(input);
  console.log('推理输出:', Array.from(output).map(o => o.toFixed(3)).join(', '));
  console.log('模型大小:', (engine.getModelSize() / 1024).toFixed(2), 'KB');
}

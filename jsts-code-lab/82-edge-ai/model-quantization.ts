/**
 * @file 模型量化：FP32 → INT8 / FP16 的线性量化、反量化与量化感知训练（QAT）演示
 * @category Edge AI → Model Optimization
 * @difficulty hard
 * @tags quantization, int8, fp16, qat, edge-ai, model-compression
 */

/** 量化参数：记录缩放因子与零点 */
export interface QuantizationParams {
  scale: number;
  zeroPoint: number;
  bits: 8 | 16;
}

/** 量化结果 */
export interface QuantizationResult {
  quantized: Int8Array | Int16Array;
  params: QuantizationParams;
}

/**
 * 线性量化器：将 FP32 权重量化为低精度整数
 * 线性量化公式：q = round(r / scale) + zero_point
 */
export class LinearQuantizer {
  /**
   * 对称量化：以零点为 0，适合权重分布以 0 为中心的场景
   */
  quantizeSymmetric(weights: Float32Array, bits: 8 | 16 = 8): QuantizationResult {
    const maxAbs = Math.max(...Array.from(weights).map(Math.abs));
    const qmax = bits === 8 ? 127 : 32767;
    const scale = maxAbs / qmax;
    const zeroPoint = 0;

    const quantized = bits === 8
      ? new Int8Array(weights.length)
      : new Int16Array(weights.length);

    for (let i = 0; i < weights.length; i++) {
      const q = Math.round(weights[i] / scale);
      const clamped = Math.max(-qmax - 1, Math.min(qmax, q));
      (quantized as Int8Array | Int16Array)[i] = clamped;
    }

    return { quantized, params: { scale, zeroPoint, bits } };
  }

  /**
   * 非对称量化：考虑最小/最大值，适合激活值分布不居中的场景
   */
  quantizeAsymmetric(weights: Float32Array, bits: 8 | 16 = 8): QuantizationResult {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const qmin = bits === 8 ? -128 : -32768;
    const qmax = bits === 8 ? 127 : 32767;

    const scale = (max - min) / (qmax - qmin);
    const zeroPoint = Math.round(qmin - min / scale);

    const quantized = bits === 8
      ? new Int8Array(weights.length)
      : new Int16Array(weights.length);

    for (let i = 0; i < weights.length; i++) {
      const q = Math.round(weights[i] / scale + zeroPoint);
      const clamped = Math.max(qmin, Math.min(qmax, q));
      (quantized as Int8Array | Int16Array)[i] = clamped;
    }

    return { quantized, params: { scale, zeroPoint, bits } };
  }

  /**
   * 反量化：将整数还原为浮点数
   */
  dequantize(quantized: Int8Array | Int16Array, params: QuantizationParams): Float32Array {
    const weights = new Float32Array(quantized.length);
    for (let i = 0; i < quantized.length; i++) {
      weights[i] = (quantized[i] - params.zeroPoint) * params.scale;
    }
    return weights;
  }

  /**
   * 计算量化误差（平均绝对误差）
   */
  calculateError(original: Float32Array, dequantized: Float32Array): number {
    let error = 0;
    for (let i = 0; i < original.length; i++) {
      error += Math.abs(original[i] - dequantized[i]);
    }
    return error / original.length;
  }
}

/**
 * 伪量化层（Fake Quantization Layer）
 * 量化感知训练（QAT）的核心：在前向传播中模拟量化误差，
 * 使网络在训练时就能适应低精度推理带来的精度损失
 */
export class FakeQuantizationLayer {
  private scale = 1.0;
  private zeroPoint = 0;

  constructor(private bits: 8 | 16 = 8) {}

  /**
   * 更新伪量化参数（通常基于移动平均最小/最大值）
   */
  updateParams(minVal: number, maxVal: number): void {
    const qmin = this.bits === 8 ? -128 : -32768;
    const qmax = this.bits === 8 ? 127 : 32767;
    this.scale = (maxVal - minVal) / (qmax - qmin);
    this.zeroPoint = Math.round(qmin - minVal / this.scale);
  }

  /**
   * 前向传播：先量化再反量化，模拟低精度推理
   */
  forward(input: Float32Array): Float32Array {
    const qmin = this.bits === 8 ? -128 : -32768;
    const qmax = this.bits === 8 ? 127 : 32767;
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; i++) {
      // 模拟量化
      const q = Math.round(input[i] / this.scale + this.zeroPoint);
      const clamped = Math.max(qmin, Math.min(qmax, q));
      // 立即反量化（伪量化）
      output[i] = (clamped - this.zeroPoint) * this.scale;
    }

    return output;
  }
}

/**
 * FP16 模拟器：展示 16 位半精度浮点的精度损失
 * 实际硬件中 FP16 使用 1-5-10 格式，这里用截断模拟
 */
export class FP16Simulator {
  private readonly FP16_MAX = 65504;

  toFP16(values: Float32Array): Float32Array {
    const result = new Float32Array(values.length);
    for (let i = 0; i < values.length; i++) {
      // 简单模拟：将值截断到 FP16 可表示范围
      const clamped = Math.max(-this.FP16_MAX, Math.min(this.FP16_MAX, values[i]));
      // 模拟精度损失：保留约 3-4 位有效数字
      result[i] = parseFloat(clamped.toPrecision(3));
    }
    return result;
  }
}

export function demo(): void {
  console.log('=== 模型量化演示 ===\n');

  const quantizer = new LinearQuantizer();
  const weights = new Float32Array([0.15, -0.42, 0.89, -0.11, 0.05, -0.73, 0.33, -0.28]);

  // INT8 对称量化
  console.log('--- INT8 对称量化 ---');
  const symResult = quantizer.quantizeSymmetric(weights, 8);
  console.log('原始权重:', Array.from(weights).map(v => v.toFixed(3)).join(', '));
  console.log('INT8 量化:', Array.from(symResult.quantized).join(', '));
  const symDeq = quantizer.dequantize(symResult.quantized, symResult.params);
  console.log('反量化后:', Array.from(symDeq).map(v => v.toFixed(4)).join(', '));
  console.log('量化误差:', quantizer.calculateError(weights, symDeq).toFixed(6));

  // INT8 非对称量化
  console.log('\n--- INT8 非对称量化 ---');
  const asymResult = quantizer.quantizeAsymmetric(weights, 8);
  console.log('Zero Point:', asymResult.params.zeroPoint, 'Scale:', asymResult.params.scale.toFixed(4));
  const asymDeq = quantizer.dequantize(asymResult.quantized, asymResult.params);
  console.log('反量化后:', Array.from(asymDeq).map(v => v.toFixed(4)).join(', '));
  console.log('量化误差:', quantizer.calculateError(weights, asymDeq).toFixed(6));

  // FP16 模拟
  console.log('\n--- FP16 精度模拟 ---');
  const fp16 = new FP16Simulator();
  const fp16Weights = fp16.toFP16(weights);
  console.log('FP16 近似:', Array.from(fp16Weights).map(v => v.toFixed(4)).join(', '));

  // 量化感知训练伪量化层
  console.log('\n--- 量化感知训练（QAT）伪量化层 ---');
  const fakeQ = new FakeQuantizationLayer(8);
  fakeQ.updateParams(Math.min(...weights), Math.max(...weights));
  const qatOutput = fakeQ.forward(weights);
  console.log('QAT 前向输出:', Array.from(qatOutput).map(v => v.toFixed(4)).join(', '));
  console.log('QAT 通过在前向传播中引入量化噪声，使模型在训练阶段适应低精度推理。');
}

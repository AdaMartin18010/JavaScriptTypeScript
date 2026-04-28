/**
 * @file 模型量化：FP32 → INT8 / INT4 / FP16 的线性量化、GPTQ / AWQ、校准与量化感知训练（QAT）演示
 * @category Edge AI → Model Optimization
 * @difficulty hard
 * @tags quantization, int8, int4, fp16, gptq, awq, qat, edge-ai, model-compression
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
 * INT4 量化器
 * 将权重压缩到 4-bit，用于超大规模模型在边缘端的极限部署
 */
export class INT4Quantizer {
  quantize(weights: Float32Array): { quantized: Int8Array; scale: number; zeroPoint: number } {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const qmin = -8;
    const qmax = 7;

    const scale = (max - min) / (qmax - qmin);
    const zeroPoint = Math.round(qmin - min / scale) || 0;

    // 每两个 4-bit 值打包到一个 Int8 中
    const packedLen = Math.ceil(weights.length / 2);
    const quantized = new Int8Array(packedLen);

    for (let i = 0; i < weights.length; i++) {
      const q = Math.round(weights[i] / scale + zeroPoint);
      const clamped = Math.max(qmin, Math.min(qmax, q)) & 0x0f;
      const byteIdx = Math.floor(i / 2);
      if (i % 2 === 0) {
        quantized[byteIdx] = clamped;
      } else {
        quantized[byteIdx] |= (clamped << 4);
      }
    }

    return { quantized, scale, zeroPoint };
  }

  unpack(quantized: Int8Array, scale: number, zeroPoint: number, length: number): Float32Array {
    const weights = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const byteIdx = Math.floor(i / 2);
      const nibble = i % 2 === 0 ? (quantized[byteIdx] & 0x0f) : ((quantized[byteIdx] >> 4) & 0x0f);
      // 符号扩展
      const signed = nibble >= 8 ? nibble - 16 : nibble;
      weights[i] = (signed - zeroPoint) * scale;
    }
    return weights;
  }
}

/**
 * 基于校准数据的量化器
 * 使用百分位数确定 min/max，减少离群值对 scale 的影响
 */
export class CalibrationQuantizer {
  calibrate(weights: Float32Array, bits: 8 | 16 = 8, percentile = 0.999): QuantizationParams {
    const sorted = Array.from(weights).sort((a, b) => a - b);
    const minIdx = Math.floor(sorted.length * (1 - percentile));
    const maxIdx = Math.ceil(sorted.length * percentile) - 1;
    const min = sorted[Math.max(0, minIdx)];
    const max = sorted[Math.min(sorted.length - 1, maxIdx)];

    const qmin = bits === 8 ? -128 : -32768;
    const qmax = bits === 8 ? 127 : 32767;
    const scale = (max - min) / (qmax - qmin);
    const zeroPoint = Math.round(qmin - min / scale);

    return { scale, zeroPoint, bits };
  }
}

/**
 * 简化 GPTQ 量化器
 * 模拟逐层 one-shot 量化：利用近似 Hessian 信息对权重进行最优舍入
 */
export class GPTQQuantizer {
  quantizeLayer(weights: Float32Array, bits: 8 | 16 = 8): QuantizationResult {
    const quantizer = new LinearQuantizer();
    // 简化版：先对称量化，再基于“Hessian 对角线近似”进行最优舍入修正
    const result = quantizer.quantizeSymmetric(weights, bits);

    // 模拟 OBQ（Optimal Brain Quantization）的逐通道修正：
    // 用随机对角 Hessian 近似来微调量化值
    const qmax = bits === 8 ? 127 : 32767;
    for (let i = 0; i < result.quantized.length; i++) {
      const hii = 1.0 + Math.random() * 0.1; // 模拟 Hessian 对角元
      const quantError = weights[i] - (result.quantized[i] * result.params.scale);
      // 若量化误差较大且 Hessian 权重高，则尝试调整量化值
      if (Math.abs(quantError) > result.params.scale * 0.5 && hii > 1.05) {
        const adjusted = result.quantized[i] + Math.sign(quantError);
        if (Math.abs(adjusted) <= qmax) {
          (result.quantized as Int8Array | Int16Array)[i] = adjusted;
        }
      }
    }

    return result;
  }
}

/**
 * 简化 AWQ 量化器（Activation-aware Weight Quantization）
 * 根据激活值幅值对权重通道进行缩放，保护重要权重
 */
export class AWQQuantizer {
  quantizeWithScaling(weights: Float32Array, activations: Float32Array, bits: 8 | 16 = 8): QuantizationResult {
    // 简化版：根据激活值平均幅值计算通道缩放因子
    const channelSize = weights.length / activations.length;
    const scaledWeights = new Float32Array(weights.length);

    for (let c = 0; c < activations.length; c++) {
      const scale = Math.pow(activations[c], 0.5); // 缩放因子与激活幅值相关
      const start = c * channelSize;
      for (let i = 0; i < channelSize; i++) {
        scaledWeights[start + i] = weights[start + i] / (scale + 1e-5);
      }
    }

    const quantizer = new LinearQuantizer();
    return quantizer.quantizeSymmetric(scaledWeights, bits);
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

  // INT4 量化
  console.log('\n--- INT4 量化 ---');
  const int4 = new INT4Quantizer();
  const int4Result = int4.quantize(weights);
  const int4Deq = int4.unpack(int4Result.quantized, int4Result.scale, int4Result.zeroPoint, weights.length);
  console.log('INT4 反量化后:', Array.from(int4Deq).map(v => v.toFixed(4)).join(', '));

  // 校准量化
  console.log('\n--- 校准量化 ---');
  const calibrator = new CalibrationQuantizer();
  const calibParams = calibrator.calibrate(weights, 8, 0.99);
  console.log('校准参数:', `scale=${calibParams.scale.toFixed(4)}, zeroPoint=${calibParams.zeroPoint}`);

  // GPTQ
  console.log('\n--- GPTQ 量化 ---');
  const gptq = new GPTQQuantizer();
  const gptqResult = gptq.quantizeLayer(weights, 8);
  const gptqDeq = quantizer.dequantize(gptqResult.quantized, gptqResult.params);
  console.log('GPTQ 反量化后:', Array.from(gptqDeq).map(v => v.toFixed(4)).join(', '));

  // AWQ
  console.log('\n--- AWQ 量化 ---');
  const awq = new AWQQuantizer();
  const acts = new Float32Array([1.0, 2.0]); // 模拟 2 个通道的激活值
  const awqResult = awq.quantizeWithScaling(weights, acts, 8);
  console.log('AWQ 量化后范围:', Math.min(...Array.from(awqResult.quantized)), '至', Math.max(...Array.from(awqResult.quantized)));

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

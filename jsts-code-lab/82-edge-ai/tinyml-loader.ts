/**
 * @file TinyML 模型加载器
 * @category Edge AI → TinyML
 * @difficulty medium
 * @tags tinyml, model-loader, flatbuffer, binary-format, edge-device
 *
 * @description
 * TinyML 指在资源极度受限的设备（如 MCU）上运行机器学习模型。
 * 本模块实现一个极简的二进制模型加载器，演示模型格式解析、版本检查与完整性校验。
 */

export interface TinyMLModelHeader {
  /** 魔数标识 */
  magic: number;
  /** 模型格式版本 */
  version: number;
  /** 层数量 */
  layerCount: number;
  /** 权重数据起始偏移 */
  weightsOffset: number;
  /** 校验和 */
  checksum: number;
}

export interface TinyMLLayer {
  type: 'dense' | 'conv2d' | 'relu' | 'maxpool' | 'flatten';
  inputShape: readonly number[];
  outputShape: readonly number[];
  weights?: Float32Array;
  bias?: Float32Array;
}

export class TinyMLModelLoader {
  private static readonly MAGIC = 0x54494e59; // 'TINY'
  private static readonly SUPPORTED_VERSION = 1;

  /**
   * 从 ArrayBuffer 加载模型
   * @param buffer - 原始二进制数据
   */
  load(buffer: ArrayBuffer): { header: TinyMLModelHeader; layers: TinyMLLayer[] } {
    const view = new DataView(buffer);
    let offset = 0;

    // 解析头部
    const magic = view.getUint32(offset, true);
    offset += 4;
    const version = view.getUint16(offset, true);
    offset += 2;
    const layerCount = view.getUint16(offset, true);
    offset += 2;
    const weightsOffset = view.getUint32(offset, true);
    offset += 4;
    const checksum = view.getUint32(offset, true);
    offset += 4;

    if (magic !== TinyMLModelLoader.MAGIC) {
      throw new Error(`Invalid model magic: expected 0x${TinyMLModelLoader.MAGIC.toString(16)}, got 0x${magic.toString(16)}`);
    }
    if (version !== TinyMLModelLoader.SUPPORTED_VERSION) {
      throw new Error(`Unsupported model version: ${version}`);
    }

    const header: TinyMLModelHeader = { magic, version, layerCount, weightsOffset, checksum };

    // 校验和验证（简化：所有权重字节累加）
    const computedChecksum = this.computeChecksum(new Uint8Array(buffer, weightsOffset));
    if (computedChecksum !== checksum) {
      throw new Error(`Checksum mismatch: expected ${checksum}, got ${computedChecksum}`);
    }

    // 解析层描述
    const layers: TinyMLLayer[] = [];
    for (let i = 0; i < layerCount; i++) {
      const typeCode = view.getUint8(offset++);
      const type = this.decodeLayerType(typeCode);
      const inputDims = view.getUint8(offset++);
      const inputShape: number[] = [];
      for (let d = 0; d < inputDims; d++) {
        inputShape.push(view.getUint16(offset, true));
        offset += 2;
      }
      const outputDims = view.getUint8(offset++);
      const outputShape: number[] = [];
      for (let d = 0; d < outputDims; d++) {
        outputShape.push(view.getUint16(offset, true));
        offset += 2;
      }

      let weights: Float32Array | undefined;
      let bias: Float32Array | undefined;

      if (type === 'dense' || type === 'conv2d') {
        // 与 generateDummyModel 保持一致：跳过对齐填充
        if (offset % 4 !== 0) offset += 4 - (offset % 4);
        const weightCount = view.getUint32(offset, true);
        offset += 4;
        weights = new Float32Array(buffer, offset, weightCount);
        offset += weightCount * 4;

        const biasCount = view.getUint32(offset, true);
        offset += 4;
        bias = new Float32Array(buffer, offset, biasCount);
        offset += biasCount * 4;
      }

      layers.push({ type, inputShape, outputShape, weights, bias });
    }

    return { header, layers };
  }

  /**
   * 生成一个简单的模型二进制（用于测试）
   */
  generateDummyModel(layers: Omit<TinyMLLayer, 'weights' | 'bias'> & { weightCount?: number; biasCount?: number }[]): ArrayBuffer {
    // 先计算大小
    let size = 16; // header
    for (const layer of layers) {
      size += 1 + 1 + layer.inputShape.length * 2 + 1 + layer.outputShape.length * 2;
      if (layer.weightCount) {
        // 预留最多 3 字节的对齐填充
        size += 3 + 4 + layer.weightCount * 4 + 4 + (layer.biasCount ?? 0) * 4;
      }
    }

    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    let offset = 0;

    // header
    view.setUint32(offset, TinyMLModelLoader.MAGIC, true);
    offset += 4;
    view.setUint16(offset, TinyMLModelLoader.SUPPORTED_VERSION, true);
    offset += 2;
    view.setUint16(offset, layers.length, true);
    offset += 2;
    view.setUint32(offset, 16, true); // weightsOffset = header size
    offset += 4;
    view.setUint32(offset, 0, true); // checksum placeholder
    offset += 4;

    for (const layer of layers) {
      view.setUint8(offset++, this.encodeLayerType(layer.type));
      view.setUint8(offset++, layer.inputShape.length);
      for (const dim of layer.inputShape) {
        view.setUint16(offset, dim, true);
        offset += 2;
      }
      view.setUint8(offset++, layer.outputShape.length);
      for (const dim of layer.outputShape) {
        view.setUint16(offset, dim, true);
        offset += 2;
      }
      if (layer.weightCount) {
        // 确保 4 字节对齐
        if (offset % 4 !== 0) offset += 4 - (offset % 4);
        view.setUint32(offset, layer.weightCount, true);
        offset += 4;
        const weights = new Float32Array(buffer, offset, layer.weightCount);
        for (let i = 0; i < layer.weightCount; i++) weights[i] = (Math.random() - 0.5) * 0.1;
        offset += layer.weightCount * 4;

        const biasCount = layer.biasCount ?? 0;
        view.setUint32(offset, biasCount, true);
        offset += 4;
        const bias = new Float32Array(buffer, offset, biasCount);
        bias.fill(0);
        offset += biasCount * 4;
      }
    }

    // 计算并写入校验和
    const checksum = this.computeChecksum(new Uint8Array(buffer, 16));
    view.setUint32(12, checksum, true);

    return buffer;
  }

  private decodeLayerType(code: number): TinyMLLayer['type'] {
    switch (code) {
      case 0: return 'dense';
      case 1: return 'conv2d';
      case 2: return 'relu';
      case 3: return 'maxpool';
      case 4: return 'flatten';
      default: throw new Error(`Unknown layer type code: ${code}`);
    }
  }

  private encodeLayerType(type: TinyMLLayer['type']): number {
    switch (type) {
      case 'dense': return 0;
      case 'conv2d': return 1;
      case 'relu': return 2;
      case 'maxpool': return 3;
      case 'flatten': return 4;
    }
  }

  private computeChecksum(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = (sum + data[i]) & 0xffffffff;
    }
    return sum;
  }
}

export function demo(): void {
  console.log('=== TinyML 模型加载器 ===\n');

  const loader = new TinyMLModelLoader();
  const buffer = loader.generateDummyModel([
    { type: 'dense', inputShape: [4], outputShape: [8], weightCount: 32, biasCount: 8 },
    { type: 'relu', inputShape: [8], outputShape: [8] },
    { type: 'dense', inputShape: [8], outputShape: [1], weightCount: 8, biasCount: 1 }
  ]);

  const model = loader.load(buffer);
  console.log('模型版本:', model.header.version);
  console.log('层数:', model.header.layerCount);
  console.log('层类型:', model.layers.map(l => l.type).join(' -> '));
}

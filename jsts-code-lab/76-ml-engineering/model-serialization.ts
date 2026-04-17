/**
 * @file 模型序列化与反序列化
 * @category ML Engineering → Model Persistence
 * @difficulty medium
 * @tags serialization, deserialization, model-versioning, json, binary
 *
 * @description
 * 提供模型权重与结构的序列化、反序列化及版本兼容性检查。
 * 支持 JSON（人类可读）与 Typed Array（紧凑二进制）两种格式，
 * 用于理解模型持久化的核心概念。
 */

export interface ModelArtifact {
  version: string;
  format: 'json' | 'binary';
  createdAt: number;
  architecture: {
    layers: { type: string; inputSize: number; outputSize: number; activation?: string }[];
  };
  weights: Record<string, number[]>;
}

export interface SerializedModel {
  version: string;
  format: 'json' | 'binary';
  createdAt: number;
  payload: string; // base64 or JSON string
}

export class ModelSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelSerializationError';
  }
}

export class ModelSerializer {
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * 将模型构件序列化为 JSON 字符串
   * @param artifact - 模型构件
   */
  serializeToJSON(artifact: ModelArtifact): SerializedModel {
    const payload = JSON.stringify({
      architecture: artifact.architecture,
      weights: artifact.weights
    });
    return {
      version: artifact.version,
      format: 'json',
      createdAt: artifact.createdAt,
      payload
    };
  }

  /**
   * 将模型构件序列化为 Base64 编码的二进制字符串
   * @param artifact - 模型构件
   */
  serializeToBinary(artifact: ModelArtifact): SerializedModel {
    const encoder = new TextEncoder();
    const meta = encoder.encode(JSON.stringify(artifact.architecture));

    // 计算总长度
    let totalWeightLength = 0;
    const weightArrays: Float32Array[] = [];
    for (const [name, values] of Object.entries(artifact.weights)) {
      const arr = new Float32Array(values);
      weightArrays.push(arr);
      totalWeightLength += 4 + encoder.encode(name).length + 4 + arr.byteLength;
    }

    const buffer = new ArrayBuffer(4 + meta.length + 4 + totalWeightLength);
    const view = new DataView(buffer);
    let offset = 0;

    // meta length + meta
    view.setUint32(offset, meta.length, true);
    offset += 4;
    new Uint8Array(buffer, offset, meta.length).set(meta);
    offset += meta.length;

    // weights count
    view.setUint32(offset, Object.keys(artifact.weights).length, true);
    offset += 4;

    for (let idx = 0; idx < weightArrays.length; idx++) {
      const name = Object.keys(artifact.weights)[idx];
      const nameBytes = encoder.encode(name);
      view.setUint32(offset, nameBytes.length, true);
      offset += 4;
      new Uint8Array(buffer, offset, nameBytes.length).set(nameBytes);
      offset += nameBytes.length;

      const arr = weightArrays[idx];
      view.setUint32(offset, arr.length, true);
      offset += 4;
      // 使用 Uint8Array 复制以避免 Float32Array 的 4 字节对齐限制
      const floatBytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      new Uint8Array(buffer, offset, floatBytes.length).set(floatBytes);
      offset += arr.byteLength;
    }

    const base64 = this.arrayBufferToBase64(buffer);
    return {
      version: artifact.version,
      format: 'binary',
      createdAt: artifact.createdAt,
      payload: base64
    };
  }

  /**
   * 从 JSON 反序列化
   * @param serialized - 序列化对象
   */
  deserializeJSON(serialized: SerializedModel): ModelArtifact {
    if (serialized.format !== 'json') {
      throw new ModelSerializationError('Expected JSON format');
    }
    const parsed = JSON.parse(serialized.payload) as Pick<ModelArtifact, 'architecture' | 'weights'>;
    return {
      version: serialized.version,
      format: serialized.format,
      createdAt: serialized.createdAt,
      architecture: parsed.architecture,
      weights: parsed.weights
    };
  }

  /**
   * 从二进制反序列化
   * @param serialized - 序列化对象
   */
  deserializeBinary(serialized: SerializedModel): ModelArtifact {
    if (serialized.format !== 'binary') {
      throw new ModelSerializationError('Expected binary format');
    }
    const buffer = this.base64ToArrayBuffer(serialized.payload);
    const view = new DataView(buffer);
    let offset = 0;

    const metaLen = view.getUint32(offset, true);
    offset += 4;
    const metaBytes = new Uint8Array(buffer, offset, metaLen);
    const architecture = JSON.parse(new TextDecoder().decode(metaBytes)) as ModelArtifact['architecture'];
    offset += metaLen;

    const weightCount = view.getUint32(offset, true);
    offset += 4;

    const weights: Record<string, number[]> = {};
    for (let i = 0; i < weightCount; i++) {
      const nameLen = view.getUint32(offset, true);
      offset += 4;
      const nameBytes = new Uint8Array(buffer, offset, nameLen);
      const name = new TextDecoder().decode(nameBytes);
      offset += nameLen;

      const arrLen = view.getUint32(offset, true);
      offset += 4;
      // 使用 Uint8Array 复制以避免 Float32Array 的 4 字节对齐限制
      const arr = new Float32Array(arrLen);
      const floatBytes = new Uint8Array(buffer, offset, arrLen * 4);
      new Uint8Array(arr.buffer).set(floatBytes);
      offset += arrLen * 4;
      weights[name] = Array.from(arr);
    }

    return {
      version: serialized.version,
      format: serialized.format,
      createdAt: serialized.createdAt,
      architecture,
      weights
    };
  }

  /**
   * 版本兼容性检查（简化版：要求主版本号一致）
   * @param version - 待检查的版本
   */
  checkCompatibility(version: string): boolean {
    const currentMajor = ModelSerializer.CURRENT_VERSION.split('.')[0];
    const targetMajor = version.split('.')[0];
    return currentMajor === targetMajor;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export function demo(): void {
  console.log('=== 模型序列化 ===\n');

  const artifact: ModelArtifact = {
    version: '1.0.0',
    format: 'json',
    createdAt: Date.now(),
    architecture: {
      layers: [
        { type: 'dense', inputSize: 4, outputSize: 8, activation: 'relu' },
        { type: 'dense', inputSize: 8, outputSize: 1, activation: 'sigmoid' }
      ]
    },
    weights: {
      'layer1.W': Array.from({ length: 32 }, () => Math.random()),
      'layer1.b': Array.from({ length: 8 }, () => 0),
      'layer2.W': Array.from({ length: 8 }, () => Math.random()),
      'layer2.b': [0]
    }
  };

  const serializer = new ModelSerializer();

  const jsonModel = serializer.serializeToJSON(artifact);
  console.log('JSON payload length:', jsonModel.payload.length);

  const binaryModel = serializer.serializeToBinary(artifact);
  console.log('Binary payload length:', binaryModel.payload.length);

  const restored = serializer.deserializeBinary(binaryModel);
  console.log('Restored architecture layers:', restored.architecture.layers.length);
  console.log('Compatibility check:', serializer.checkCompatibility(restored.version));
}

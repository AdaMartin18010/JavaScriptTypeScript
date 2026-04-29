# 边缘 AI — 架构设计

## 1. 架构概述

本模块实现了浏览器端 AI 推理的完整架构，包括模型加载、预处理管道、推理引擎和后处理。展示如何在资源受限环境中运行机器学习模型。架构采用"模型即服务"的边缘推理范式，通过多后端加速和动态量化策略，在浏览器环境中实现接近原生的 AI 推理性能，同时保证数据隐私和离线可用性。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         输入层 (Input Layer)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │    Text      │  │    Image     │  │    Audio     │                   │
│  │   (Tokenize) │  │  (Resize /   │  │  (Resample / │                   │
│  │              │  │  Normalize)  │  │   Spectro-   │                   │
│  │              │  │              │  │   gram)      │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      预处理管道 (Pre-processing Pipeline)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Tokenizer  │  │   Image      │  │   Audio      │                   │
│  │   (WordPiece │  │   Processor  │  │   Processor  │                   │
│  │   / BPE)     │  │ (Tensor      │  │ (MFCC /      │                   │
│  │              │  │  Conversion) │  │  Mel-scale)  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      模型管理层 (Model Management)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Model      │  │   Version    │  │  Quantization│                   │
│  │   Loader     │  │   Manager    │  │   Engine     │                   │
│  │ (Progressive │  │ (Cache /     │  │ (FP32 ->     │                   │
│  │  Streaming)  │  │  Update)     │  │  INT8/INT4)  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      推理引擎 (Inference Engine)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   WebGPU     │  │   WebGL      │  │    WASM      │  │   WebNN     │ │
│  │   Backend    │  │   Backend    │  │   Backend    │  │  (Future)   │ │
│  │ (Compute     │  │ (Shader      │  │ (CPU SIMD    │  │  (Native    │ │
│  │  Shaders)    │  │  Programs)   │  │   Fallback)  │  │   ML API)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      后处理层 (Post-processing)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Decode     │  │    NMS       │  │   Result     │                   │
│  │   (Greedy /  │  │ (Non-Max     │  │   Formatter  │                   │
│  │   Beam)      │  │  Suppression)│  │ (Structured  │                   │
│  │              │  │              │  │   Output)    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 模型管理层

| 组件 | 职责 | 关键技术 | 性能影响 |
|------|------|----------|----------|
| Model Loader | 按需加载和缓存模型文件 | 渐进式流式加载 | 首包时间 |
| Version Manager | 模型版本控制和更新 | Service Worker 缓存 | 更新策略 |
| Quantization Engine | INT8/INT4 量化减少模型体积 | 权重量化 + 激活量化 | 精度/速度权衡 |

### 3.2 推理引擎

| 组件 | 职责 | 支持算子 | 性能等级 |
|------|------|----------|----------|
| WebGPU Backend | GPU 加速推理 | 计算着色器 | ★★★★★ |
| WebGL Backend | 兼容性 GPU 回退 | GLSL 着色器 | ★★★★ |
| WASM Backend | CPU 推理，纯计算着色器 | SIMD128 | ★★★ |
| WebNN (Future) | 原生 ML API | OS 级优化 | ★★★★★ |

### 3.3 数据管道

| 组件 | 职责 | 输入/输出 | 关键算法 |
|------|------|-----------|----------|
| PreProcessor | 输入数据标准化、张量转换 | Raw -> Tensor | 归一化、填充 |
| PostProcessor | 输出解码、NMS（非极大值抑制）| Tensor -> Result | Softmax、Beam Search |
| Result Formatter | 结构化结果输出 | Result -> JSON | 结构化解析 |

## 4. 数据流

```
Input (Image/Text/Audio) -> PreProcess -> Inference Engine -> PostProcess -> Structured Output
                                  |
                           Model (ONNX/TensorFlow.js/Transformers.js)
```

## 5. 边缘推理框架对比

| 框架 | 模型格式 | 后端支持 | 包体积 | 模型生态 | 量化 | 适用场景 |
|------|----------|----------|--------|----------|------|----------|
| Transformers.js | ONNX | WASM / WebGL | ~3MB | HuggingFace | 内置 | NLP / CV |
| ONNX Runtime Web | ONNX | WASM / WebGL / WebGPU | ~8MB | 通用 | 内置 | 通用 |
| TensorFlow.js | TFJS | WebGL / WASM / Node | ~120KB* | TF Hub | 支持 | CV / 训练 |
| MediaPipe | TFLite | WebGL / WASM | ~300KB | Google | 内置 | 视觉/音频 |
| llama.cpp (wasm) | GGUF | WASM SIMD | ~1MB | 社区 | 内置 | LLM 推理 |
| WebLLM | MLC | WebGPU | ~2MB | 社区 | 内置 | LLM 推理 |

*仅运行时，不含模型

## 6. 代码示例

### 6.1 多后端推理引擎

```typescript
// edge-ai/src/inference/InferenceEngine.ts
interface InferenceBackend {
  name: string;
  isSupported(): boolean;
  loadModel(modelBuffer: ArrayBuffer): Promise<ModelSession>;
}

interface ModelSession {
  run(inputs: Record<string, Tensor>): Promise<Record<string, Tensor>>;
  dispose(): void;
}

interface Tensor {
  data: Float32Array | Int32Array | Uint8Array;
  dims: number[];
  type: 'float32' | 'int32' | 'uint8';
}

class EdgeInferenceEngine {
  private backends: InferenceBackend[] = [];
  private currentBackend?: InferenceBackend;

  constructor() {
    // 按优先级注册后端
    this.backends = [
      new WebGPUBackend(),
      new WebGLBackend(),
      new WASMBackend(),
    ];
  }

  async initialize(): Promise<void> {
    for (const backend of this.backends) {
      if (backend.isSupported()) {
        this.currentBackend = backend;
        console.log(`Using backend: ${backend.name}`);
        return;
      }
    }
    throw new Error('No supported inference backend found');
  }

  async loadModel(url: string): Promise<ModelSession> {
    if (!this.currentBackend) throw new Error('Engine not initialized');

    const response = await fetch(url);
    const modelBuffer = await response.arrayBuffer();
    return this.currentBackend.loadModel(modelBuffer);
  }

  async run(session: ModelSession, inputs: Record<string, Tensor>): Promise<Record<string, Tensor>> {
    return session.run(inputs);
  }
}

// WebGPU 后端实现
class WebGPUBackend implements InferenceBackend {
  name = 'WebGPU';
  private device?: GPUDevice;

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  async loadModel(modelBuffer: ArrayBuffer): Promise<ModelSession> {
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter!.requestDevice();
    // 实际实现需解析 ONNX 并生成计算管线
    return {
      run: async (inputs) => {
        // 使用 GPU 计算着色器执行推理
        return inputs; // 占位
      },
      dispose: () => {},
    };
  }
}
```

### 6.2 模型量化配置

```typescript
// edge-ai/src/quantization/Quantizer.ts
interface QuantizationConfig {
  format: 'int8' | 'int4' | 'fp16';
  calibrationDataset?: Float32Array[];
  perChannel?: boolean;
}

class ModelQuantizer {
  async quantize(
    modelWeights: Float32Array,
    config: QuantizationConfig
  ): Promise<{ quantized: Uint8Array; scale: Float32Array; zeroPoint: Int8Array }> {
    const numElements = modelWeights.length;
    const quantized = new Uint8Array(numElements);
    const scale = new Float32Array(config.perChannel ? modelWeights.length / 64 : 1);
    const zeroPoint = new Int8Array(scale.length);

    if (config.format === 'int8') {
      // 对称量化: q = round(r / scale)
      const maxVal = Math.max(...modelWeights.map(Math.abs));
      scale[0] = maxVal / 127;
      zeroPoint[0] = 0;

      for (let i = 0; i < numElements; i++) {
        quantized[i] = Math.round(modelWeights[i] / scale[0]) + 128;
      }
    } else if (config.format === 'int4') {
      // INT4 量化: 每字节存两个权重
      const maxVal = Math.max(...modelWeights.map(Math.abs));
      scale[0] = maxVal / 7;

      for (let i = 0; i < numElements; i += 2) {
        const q1 = Math.round(modelWeights[i] / scale[0]) & 0x0F;
        const q2 = Math.round(modelWeights[i + 1] / scale[0]) & 0x0F;
        quantized[i >> 1] = (q1 << 4) | q2;
      }
    }

    return { quantized, scale, zeroPoint };
  }

  dequantize(
    quantized: Uint8Array,
    scale: Float32Array,
    zeroPoint: Int8Array,
    format: 'int8' | 'int4'
  ): Float32Array {
    if (format === 'int8') {
      return new Float32Array(quantized.length).map((_, i) =>
        (quantized[i] - 128 - zeroPoint[0]) * scale[0]
      );
    }
    // INT4 反量化...
    return new Float32Array(0);
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 推理框架 | Transformers.js / ONNX Runtime | 生态成熟 |
| 加速后端 | WebGPU > WebGL > WASM | 性能优先 |
| 模型格式 | ONNX | 跨框架兼容 |

## 8. 质量属性

- **低延迟**: 端侧推理无需网络往返
- **隐私性**: 数据不离开设备
- **离线可用**: 无网络依赖

## 9. 参考链接

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js) — HuggingFace 浏览器推理库
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) — 跨平台推理运行时
- [WebGPU Specification](https://www.w3.org/TR/webgpu/) — W3C WebGPU 标准
- [MediaPipe Solutions](https://developers.google.com/mediapipe/solutions/guide) — Google 端侧 ML 方案
- [WebLLM Project](https://webllm.mlc.ai/) — 浏览器大语言模型推理
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide) — TensorFlow 浏览器部署指南

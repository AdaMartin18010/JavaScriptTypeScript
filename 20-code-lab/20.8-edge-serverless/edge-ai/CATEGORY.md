---
dimension: 应用领域
application-domain: AI 与 Agent 应用 / 边缘与 Serverless
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 边缘 AI — 浏览器端推理、模型量化、WebNN/WebGPU 加速
- **模块编号**: 82-edge-ai

## 边界说明

本模块聚焦在边缘环境（浏览器、边缘节点）中进行 AI 推理，包括：

- 设备能力检测与模型量化
- ONNX Runtime 与 TinyML
- WebNN / WebGPU 计算加速
- 联邦学习基础

云端模型训练和大规模分布式训练不属于本模块范围。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `model-quantization/` | INT8/FP16 量化与模型压缩 | `quantization.ts` |
| `onnx-runtime-web/` | ONNX Runtime Web 部署 | `onnx-web.ts` |
| `webnn-acceleration/` | WebNN API 加速推理 | `webnn-demo.ts` |
| `webgpu-compute/` | WebGPU 通用计算着色器 | `webgpu-matmul.ts` |
| `federated-learning/` | 联邦学习基础协议 | `federated-learning.ts` |
| `device-capability/` | 设备能力检测与降级策略 | `device-check.ts` |

## 代码示例

### WebGPU 矩阵乘法（计算着色器）

```typescript
async function matmulWebGPU(a: Float32Array, b: Float32Array, M: number, N: number, K: number) {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA: array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB: array<f32>;
    @group(0) @binding(2) var<storage, read_write> matrixC: array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      if (row >= ${M}u || col >= ${N}u) { return; }
      var sum = 0.0;
      for (var k = 0u; k < ${K}u; k = k + 1u) {
        sum = sum + matrixA[row * ${K}u + k] * matrixB[k * ${N}u + col];
      }
      matrixC[row * ${N}u + col] = sum;
    }
  `;

  const module = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
  // ... 创建 buffer、绑定、提交命令
}
```

### 设备能力检测与降级

```typescript
interface DeviceCapability {
  webgpu: boolean;
  webnn: boolean;
  webgl: boolean;
  wasm: boolean;
}

async function detectCapabilities(): Promise<DeviceCapability> {
  return {
    webgpu: !!navigator.gpu,
    webnn: 'ml' in navigator,
    webgl: !!document.createElement('canvas').getContext('webgl2'),
    wasm: typeof WebAssembly === 'object',
  };
}

function selectBackend(cap: DeviceCapability): 'webgpu' | 'webnn' | 'wasm' {
  if (cap.webgpu) return 'webgpu';
  if (cap.webnn) return 'webnn';
  return 'wasm';
}
```

### ONNX Runtime Web 推理

```typescript
// onnx-web.ts — 浏览器端 ONNX 推理
import * as ort from 'onnxruntime-web';

async function runONNXInference(
  modelUrl: string,
  inputData: Float32Array,
  inputShape: number[]
): Promise<Float32Array> {
  const session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ['webgpu', 'wasm'], // 优先 GPU，回退 WASM
    graphOptimizationLevel: 'all',
  });

  const tensor = new ort.Tensor('float32', inputData, inputShape);
  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = tensor;

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];
  return output.data as Float32Array;
}

// 使用：
// const result = await runONNXInference('/models/mnist.onnx', imageData, [1, 1, 28, 28]);
```

### 模型权重量化（FP32 → INT8）

```typescript
// quantization.ts — 后训练静态量化
function quantizeLinear(
  weights: Float32Array,
  numBits = 8
): { quantized: Int8Array; scale: number; zeroPoint: number } {
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const qmin = -(1 << (numBits - 1));
  const qmax = (1 << (numBits - 1)) - 1;

  const scale = (max - min) / (qmax - qmin);
  const zeroPoint = Math.round(qmin - min / scale);

  const quantized = new Int8Array(weights.length);
  for (let i = 0; i < weights.length; i++) {
    quantized[i] = Math.max(qmin, Math.min(qmax, Math.round(weights[i] / scale + zeroPoint)));
  }

  return { quantized, scale, zeroPoint };
}

function dequantizeLinear(
  quantized: Int8Array,
  scale: number,
  zeroPoint: number
): Float32Array {
  const result = new Float32Array(quantized.length);
  for (let i = 0; i < quantized.length; i++) {
    result[i] = scale * (quantized[i] - zeroPoint);
  }
  return result;
}
```

### WebNN API 推理示例

```typescript
// webnn-demo.ts — W3C WebNN 模型构建
async function buildWebNNGraph() {
  if (!('ml' in navigator)) throw new Error('WebNN not supported');
  const context = await (navigator as any).ml.createContext({
    devicePreference: 'gpu',
  });

  const builder = new (window as any).MLGraphBuilder(context);

  // 定义输入张量描述
  const inputDesc = { dataType: 'float32', dimensions: [1, 224, 224, 3] };
  const input = builder.input('input', inputDesc);

  // 构建简单的卷积层（示意）
  const weightDesc = { dataType: 'float32', dimensions: [32, 3, 3, 3] };
  const weights = builder.constant(weightDesc, new Float32Array(32 * 3 * 3 * 3));
  const conv = builder.conv2d(input, weights, { padding: [1, 1, 1, 1] });
  const relu = builder.relu(conv);

  const graph = await builder.build({ output: relu });
  return { context, graph };
}
```

## 关联模块

- `33-ai-integration` — AI 集成
- `32-edge-computing` — 边缘计算
- `93-deployment-edge-lab` — 部署与边缘实战
- `examples/edge-ai-inference/` — 边缘 AI 示例
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| WebGPU 规范 | W3C | [gpuweb.github.io/gpuweb](https://gpuweb.github.io/gpuweb/) |
| WebNN API | W3C | [webmachinelearning.github.io/webnn](https://webmachinelearning.github.io/webnn/) |
| ONNX Runtime Web | 微软 | [onnxruntime.ai/docs/tutorials/web](https://onnxruntime.ai/docs/tutorials/web/) |
| TensorFlow.js 后端 | 指南 | [tensorflow.org/js/guide/platform_environment](https://www.tensorflow.org/js/guide/platform_environment) |
| Edge AI 最佳实践 | web.dev | [web.dev/ai](https://web.dev/ai) |
| Transformers.js | Hugging Face | [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js) |
| MediaPipe for Web | Google | [developers.google.com/mediapipe](https://developers.google.com/mediapipe) |
| WebAssembly SIMD | MDN | [developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface) |
| Apache TVM | 深度学习编译器 | [tvm.apache.org/docs](https://tvm.apache.org/docs/) |
| MLIR | 机器学习中间表示 | [mlir.llvm.org](https://mlir.llvm.org/) |
| TinyML 基金会 | 边缘 AI 社区 | [tinyml.org](https://tinyml.org/) |

---

*最后更新: 2026-04-29*

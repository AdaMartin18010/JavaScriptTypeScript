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

---

*最后更新: 2026-04-29*

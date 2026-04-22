# 边缘 AI 理论：在设备端运行智能

> **目标读者**：关注端侧 AI、隐私计算、离线智能的工程师
> **关联文档**：[`docs/categories/82-edge-ai.md`](../../docs/categories/82-edge-ai.md)
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. 边缘 AI 的定义与价值

### 1.1 为什么需要边缘 AI

| 维度 | 云端 AI | 边缘 AI |
|------|--------|--------|
| **延迟** | 50-500ms | < 10ms |
| **隐私** | 数据上传 | 本地处理 |
| **成本** | API 调用费 | 一次性硬件 |
| **可用性** | 需联网 | 离线可用 |
| **算力** | 无限 | 受限 |

### 1.2 应用场景

- **实时翻译**：AR 眼镜实时翻译对话
- **隐私保护**：本地处理敏感数据（健康、金融）
- **自动驾驶**：低延迟决策（< 1ms）
- **工业质检**：产线实时缺陷检测

---

## 2. 端侧模型技术

### 2.1 模型压缩技术

| 技术 | 原理 | 压缩比 | 精度损失 |
|------|------|--------|---------|
| **量化** | FP32 → INT8 / INT4 | 2-4x | 低 |
| **剪枝** | 移除不重要权重 | 2-10x | 中 |
| **蒸馏** | 大模型教小模型 | 10-100x | 中 |
| **神经架构搜索** | 自动设计小模型 | 10-50x | 低 |

### 2.2 端侧推理框架

| 框架 | 平台 | 特点 |
|------|------|------|
| **TensorFlow Lite** | 移动端 | 生态广、量化支持好 |
| **ONNX Runtime** | 跨平台 | 模型互换、性能优化 |
| **Core ML** | iOS/macOS | Apple 芯片优化 |
| **WebNN** | 浏览器 | Web 标准、跨平台 |
| **Transformers.js** | 浏览器 | Hugging Face 生态 |

---

## 3. Web 端 AI

### 3.1 Transformers.js

```typescript
import { pipeline } from '@xenova/transformers';

const classifier = await pipeline('sentiment-analysis');
const result = await classifier('I love this product!');
// [{ label: 'POSITIVE', score: 0.999 }]
```

**优势**：纯浏览器运行，无需后端，零 API 成本。

### 3.2 WebGPU 加速

```typescript
// WebGPU 推理比 CPU 快 10-100x
const session = await ort.InferenceSession.create('model.onnx', {
  executionProviders: ['webgpu'],
});
```

**浏览器支持**：Chrome 113+, Edge, Firefox Nightly。

---

## 4. 总结

边缘 AI 是**隐私优先、低延迟、离线可用**的智能方案。

**选型建议**：
- 简单 NLP 任务 → Transformers.js
- 复杂模型 → ONNX Runtime + WebGPU
- 移动端 → TensorFlow Lite / Core ML

---

## 参考资源

- [Transformers.js](https://huggingface.co/docs/transformers.js/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- [WebNN 草案](https://www.w3.org/TR/webnn/)

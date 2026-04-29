---
dimension: 应用领域
application-domain: ML 工程与科学计算
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: ML 工程 — 线性回归、神经网络、Tensor 运算与模型服务
- **模块编号**: 76-ml-engineering

## 边界说明

本模块聚焦在 JS/TS 环境中进行机器学习工程，包括：

- 特征工程与数据预处理
- 简单神经网络与线性回归
- 模型序列化与推理服务
- Tensor 运算基础

Python ML 生态（PyTorch/TensorFlow 训练）和底层数学库不属于本模块范围。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `linear-regression/` | 线性回归实现与梯度下降 | `linear-regression.ts`, `linear-regression.test.ts` |
| `neural-network-basics/` | 前馈神经网络与反向传播 | `neural-network.ts` |
| `tensor-operations/` | 多维数组运算与广播 | `tensor-ops.ts` |
| `model-serialization/` | ONNX/JSON 模型序列化与加载 | `model-serialization.ts` |
| `inference-service/` | 浏览器/Node 推理服务封装 | `inference-service.ts` |

## 代码示例

### TensorFlow.js 线性回归

```typescript
import * as tf from '@tensorflow/tfjs';

// 定义模型
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

// 准备数据
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([2, 4, 6, 8], [4, 1]);

// 训练
await model.fit(xs, ys, { epochs: 100 });

// 推理
model.predict(tf.tensor2d([5], [1, 1])).print();
```

### ONNX Runtime Web 推理

```typescript
import * as ort from 'onnxruntime-web';

async function runInference(session: ort.InferenceSession, input: Float32Array) {
  const tensor = new ort.Tensor('float32', input, [1, input.length]);
  const feeds: Record<string, ort.Tensor> = { input: tensor };
  const results = await session.run(feeds);
  return results.output.data;
}
```

## 关联模块

- `77-quantum-computing` — 量子计算
- `82-edge-ai` — 边缘 AI 推理
- `85-nlp-engineering` — NLP 工程
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TensorFlow.js | 官方文档 | [tensorflow.org/js](https://www.tensorflow.org/js) |
| ONNX Runtime | 官方文档 | [onnxruntime.ai](https://onnxruntime.ai/) |
| ML5.js | 友好 API 库 | [ml5js.org](https://ml5js.org/) |
| Danfo.js | 类 Pandas 数据处理 | [danfo.jsdata.org](https://danfo.jsdata.org/) |
| Brain.js | 神经网络库 | [brain.js.org](https://brain.js.org/) |

---

*最后更新: 2026-04-29*

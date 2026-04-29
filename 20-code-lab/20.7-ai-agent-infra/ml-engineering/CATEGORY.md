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
| `simple-neural-network/` | 前馈神经网络与反向传播 | `simple-neural-network.ts`, `simple-neural-network.test.ts` |
| `tensor-operations/` | 多维数组运算与广播 | `tensor-ops.ts`, `tensor-ops.test.ts` |
| `model-serialization/` | ONNX/JSON 模型序列化与加载 | `model-serialization.ts`, `model-serialization.test.ts` |
| `model-serving/` | 浏览器/Node 推理服务封装 | `model-serving.ts`, `model-serving.test.ts` |
| `feature-scaler/` | 特征归一化与标准化 | `feature-scaler.ts`, `feature-scaler.test.ts` |
| `feature-store/` | 特征存储与在线/离线一致性 | `feature-store.ts`, `feature-store.test.ts` |
| `ml-pipeline/` | 训练-验证-部署流水线编排 | `ml-pipeline.ts`, `ml-pipeline.test.ts` |

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

### 特征归一化（Min-Max Scaler）

```typescript
function minMaxScaler(values: number[]): { scaled: number[]; min: number; max: number } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const scaled = values.map((v) => (v - min) / range);
  return { scaled, min, max };
}

function inverseMinMax(scaled: number[], min: number, max: number): number[] {
  return scaled.map((v) => v * (max - min) + min);
}
```

### 自定义训练循环（梯度下降）

```typescript
// custom-training-loop.ts
import * as tf from '@tensorflow/tfjs';

async function customTrainLoop() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [2] }));

  const optimizer = tf.train.sgd(0.01);

  const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]], [4, 2]);
  const ys = tf.tensor2d([[0], [1], [1], [0]], [4, 1]);

  for (let epoch = 0; epoch < 200; epoch++) {
    optimizer.minimize(() => {
      const pred = model.predict(xs) as tf.Tensor;
      return tf.losses.meanSquaredError(ys, pred);
    });

    if (epoch % 20 === 0) {
      const loss = tf.tidy(() => {
        const pred = model.predict(xs) as tf.Tensor;
        return tf.losses.meanSquaredError(ys, pred).dataSync()[0];
      });
      console.log(`Epoch ${epoch}, Loss: ${loss.toFixed(4)}`);
    }
  }

  // 保存模型
  await model.save('localstorage://xor-model');
}
```

### 模型漂移检测（Data Drift）

```typescript
// drift-detection.ts
function kolmogorovSmirnovTest(a: number[], b: number[]): number {
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);

  let maxDiff = 0;
  const all = Array.from(new Set([...sortedA, ...sortedB])).sort((x, y) => x - y);

  for (const x of all) {
    const cdfA = sortedA.filter(v => v <= x).length / sortedA.length;
    const cdfB = sortedB.filter(v => v <= x).length / sortedB.length;
    maxDiff = Math.max(maxDiff, Math.abs(cdfA - cdfB));
  }

  return maxDiff;
}

function detectDrift(
  reference: number[],
  current: number[],
  threshold = 0.1
): { drifted: boolean; ksStatistic: number; pValue: number } {
  const ks = kolmogorovSmirnovTest(reference, current);
  // 简化的 p-value 估计（大样本近似）
  const n = reference.length;
  const m = current.length;
  const en = Math.sqrt((n * m) / (n + m));
  const pValue = Math.min(1, 2 * Math.exp(-2 * en * en * ks * ks));

  return { drifted: ks > threshold, ksStatistic: ks, pValue };
}

// 使用示例
const trainingPreds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const productionPreds = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
console.log(detectDrift(trainingPreds, productionPreds));
// { drifted: true, ksStatistic: 0.25, pValue: ~0.8 }
```

### WebNN API 推理（实验性）

```typescript
// webnn-inference.ts
async function runWebNNInference(inputData: Float32Array) {
  if (!('ml' in navigator)) {
    throw new Error('WebNN not supported');
  }

  const context = await (navigator as any).ml.createContext();
  const builder = new (window as any).MLGraphBuilder(context);

  // 定义计算图：全连接层
  const input = builder.input('input', { type: 'float32', dimensions: [1, 784] });
  const weight = builder.constant(
    { type: 'float32', dimensions: [784, 10] },
    new Float32Array(784 * 10).fill(0.01)
  );
  const bias = builder.constant(
    { type: 'float32', dimensions: [10] },
    new Float32Array(10).fill(0)
  );

  const matmul = builder.matmul(input, weight);
  const output = builder.add(matmul, bias);

  const graph = await builder.build({ output });
  const result = await context.compute(graph, { input: inputData });
  return result.outputs.output;
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
| Transformers.js | 浏览器端 Transformer 推理 | [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js) |
| WebNN API | W3C 标准 | [webmachinelearning.github.io/webnn](https://webmachinelearning.github.io/webnn/) |
| Made With ML | MLOps 教程 | [madewithml.com](https://madewithml.com/) |
| MLOps Community | 社区资源 | [mlops.community](https://mlops.community/) |
| Feature Stores for ML | 特征存储专著 | [featurestorebook.com](https://www.featurestorebook.com/) |

---

*最后更新: 2026-04-29*

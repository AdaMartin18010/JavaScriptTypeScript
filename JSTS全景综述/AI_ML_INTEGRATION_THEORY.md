# AI/ML 集成理论全景指南

> 本文档系统性地介绍 AI/ML 在前端/全栈 JavaScript/TypeScript 生态系统中的理论基础与实践应用。

---

## 目录

- [AI/ML 集成理论全景指南](#aiml-集成理论全景指南)
  - [目录](#目录)
  - [1. 神经网络基础](#1-神经网络基础)
    - [1.1 理论解释](#11-理论解释)
    - [1.2 数学基础](#12-数学基础)
      - [前向传播（Forward Propagation）](#前向传播forward-propagation)
      - [反向传播（Backpropagation）](#反向传播backpropagation)
    - [1.3 代码示例](#13-代码示例)
      - [使用 TensorFlow.js 实现神经网络](#使用-tensorflowjs-实现神经网络)
      - [手动实现反向传播（教育目的）](#手动实现反向传播教育目的)
    - [1.4 最佳实践](#14-最佳实践)
  - [2. TensorFlow.js 浏览器端推理](#2-tensorflowjs-浏览器端推理)
    - [2.1 理论解释](#21-理论解释)
    - [2.2 数学基础](#22-数学基础)
    - [2.3 代码示例](#23-代码示例)
      - [图像分类（MobileNet）](#图像分类mobilenet)
      - [自定义模型训练（浏览器内）](#自定义模型训练浏览器内)
      - [性能优化模式](#性能优化模式)
    - [2.4 最佳实践](#24-最佳实践)
  - [3. ONNX Runtime 跨平台部署](#3-onnx-runtime-跨平台部署)
    - [3.1 理论解释](#31-理论解释)
    - [3.2 数学基础](#32-数学基础)
    - [3.3 代码示例](#33-代码示例)
      - [Node.js 推理](#nodejs-推理)
      - [浏览器端 ONNX Runtime Web](#浏览器端-onnx-runtime-web)
    - [3.4 最佳实践](#34-最佳实践)
  - [4. LLM 集成模式](#4-llm-集成模式)
    - [4.1 理论解释](#41-理论解释)
    - [4.2 数学基础](#42-数学基础)
    - [4.3 代码示例](#43-代码示例)
      - [RAG 系统实现](#rag-系统实现)
      - [Agent 模式实现](#agent-模式实现)
      - [Function Calling](#function-calling)
    - [4.4 最佳实践](#44-最佳实践)
  - [5. 向量数据库理论](#5-向量数据库理论)
    - [5.1 理论解释](#51-理论解释)
    - [5.2 数学基础](#52-数学基础)
    - [5.3 代码示例](#53-代码示例)
      - [基于内存的向量存储](#基于内存的向量存储)
      - [与 Pinecone 集成](#与-pinecone-集成)
    - [5.4 最佳实践](#54-最佳实践)
  - [6. 提示工程形式化](#6-提示工程形式化)
    - [6.1 理论解释](#61-理论解释)
    - [6.2 数学基础](#62-数学基础)
    - [6.3 代码示例](#63-代码示例)
      - [提示模板引擎](#提示模板引擎)
      - [Chain-of-Thought 实现](#chain-of-thought-实现)
    - [6.4 最佳实践](#64-最佳实践)
  - [7. 微调与迁移学习](#7-微调与迁移学习)
    - [7.1 理论解释](#71-理论解释)
    - [7.2 数学基础](#72-数学基础)
    - [7.3 代码示例](#73-代码示例)
      - [TensorFlow.js 迁移学习](#tensorflowjs-迁移学习)
      - [适配器层（Adapter Layers）](#适配器层adapter-layers)
    - [7.4 最佳实践](#74-最佳实践)
  - [8. 模型压缩与量化](#8-模型压缩与量化)
    - [8.1 理论解释](#81-理论解释)
    - [8.2 数学基础](#82-数学基础)
    - [8.3 代码示例](#83-代码示例)
      - [TensorFlow.js 量化](#tensorflowjs-量化)
      - [知识蒸馏](#知识蒸馏)
      - [WebGPU 推理优化](#webgpu-推理优化)
    - [8.4 最佳实践](#84-最佳实践)
  - [9. A/B 测试在 ML 中的应用](#9-ab-测试在-ml-中的应用)
    - [9.1 理论解释](#91-理论解释)
    - [9.2 数学基础](#92-数学基础)
    - [9.3 代码示例](#93-代码示例)
      - [A/B 测试框架](#ab-测试框架)
      - [多臂老虎机](#多臂老虎机)
    - [9.4 最佳实践](#94-最佳实践)
  - [10. AI 伦理与安全](#10-ai-伦理与安全)
    - [10.1 理论解释](#101-理论解释)
    - [10.2 数学基础](#102-数学基础)
    - [10.3 代码示例](#103-代码示例)
      - [公平性检测](#公平性检测)
      - [差分隐私训练](#差分隐私训练)
      - [模型可解释性（LIME）](#模型可解释性lime)
      - [对抗防御](#对抗防御)
    - [10.4 最佳实践](#104-最佳实践)
  - [总结](#总结)

---

## 1. 神经网络基础

### 1.1 理论解释

神经网络是一种受生物神经系统启发的计算模型，由相互连接的节点（神经元）组成。核心思想是通过多层非线性变换学习数据的层次化表示。

**感知机（Perceptron）** 是最基础的神经网络单元：

```
输入: x₁, x₂, ..., xₙ
权重: w₁, w₂, ..., wₙ
偏置: b
输出: y = f(∑ᵢ wᵢxᵢ + b)
```

**多层感知机（MLP）** 通过堆叠隐藏层增强表达能力：

```
输入层 → 隐藏层1 → 隐藏层2 → ... → 输出层
```

### 1.2 数学基础

#### 前向传播（Forward Propagation）

对于第 $l$ 层，计算过程为：

$$
z^{[l]} = W^{[l]} \cdot a^{[l-1]} + b^{[l]}
$$

$$
a^{[l]} = g^{[l]}(z^{[l]})
$$

其中：

- $W^{[l]} \in \mathbb{R}^{n^{[l]} \times n^{[l-1]}}$ 是权重矩阵
- $b^{[l]} \in \mathbb{R}^{n^{[l]}}$ 是偏置向量
- $g^{[l]}$ 是激活函数
- $a^{[0]} = x$ 是输入

**常用激活函数：**

| 函数 | 公式 | 导数 | 特性 |
|------|------|------|------|
| Sigmoid | $\sigma(x) = \frac{1}{1 + e^{-x}}$ | $\sigma'(x) = \sigma(x)(1-\sigma(x))$ | 输出(0,1)，梯度消失 |
| ReLU | $\text{ReLU}(x) = \max(0, x)$ | $f'(x) = \begin{cases} 1 & x > 0 \\ 0 & x < 0 \end{cases}$ | 计算高效，缓解梯度消失 |
| Tanh | $\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$ | $1 - \tanh^2(x)$ | 输出(-1,1)，零中心化 |
| Softmax | $\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}$ | 见雅可比矩阵 | 多分类输出层 |

#### 反向传播（Backpropagation）

反向传播使用**链式法则**计算梯度：

**损失函数（交叉熵）：**

$$
\mathcal{L}(y, \hat{y}) = -\sum_{i} y_i \log(\hat{y}_i)
$$

**输出层梯度：**

$$
\delta^{[L]} = \nabla_a \mathcal{L} \odot g'^{[L]}(z^{[L]})
$$

**隐藏层梯度（反向传播）：**

$$
\delta^{[l]} = \left( (W^{[l+1]})^T \delta^{[l+1]} \right) \odot g'^{[l]}(z^{[l]})
$$

**参数梯度：**

$$
\frac{\partial \mathcal{L}}{\partial W^{[l]}} = \delta^{[l]} (a^{[l-1]})^T
$$

$$
\frac{\partial \mathcal{L}}{\partial b^{[l]}} = \delta^{[l]}
$$

**梯度下降更新：**

$$
W^{[l]} := W^{[l]} - \alpha \frac{\partial \mathcal{L}}{\partial W^{[l]}}
$$

$$
b^{[l]} := b^{[l]} - \alpha \frac{\partial \mathcal{L}}{\partial b^{[l]}}
$$

### 1.3 代码示例

#### 使用 TensorFlow.js 实现神经网络

```typescript
import * as tf from '@tensorflow/tfjs';

class NeuralNetwork {
  private model: tf.Sequential;

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.model = tf.sequential({
      layers: [
        // 输入层 -> 隐藏层1
        tf.layers.dense({
          inputShape: [inputSize],
          units: hiddenSize,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        // Dropout 防止过拟合
        tf.layers.dropout({ rate: 0.2 }),
        // 隐藏层2
        tf.layers.dense({
          units: hiddenSize / 2,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        // 输出层
        tf.layers.dense({
          units: outputSize,
          activation: 'softmax'
        })
      ]
    });

    // 编译模型
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(
    xTrain: tf.Tensor2D,
    yTrain: tf.Tensor2D,
    epochs: number = 100,
    batchSize: number = 32,
    validationSplit: number = 0.2
  ): Promise<tf.History> {
    return await this.model.fit(xTrain, yTrain, {
      epochs,
      batchSize,
      validationSplit,
      callbacks: [
        tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: 10,
          restoreBestWeights: true
        }),
        {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, val_loss = ${logs?.val_loss.toFixed(4)}`);
          }
        }
      ]
    });
  }

  predict(x: tf.Tensor2D): tf.Tensor {
    return this.model.predict(x) as tf.Tensor;
  }

  async save(path: string): Promise<void> {
    await this.model.save(`file://${path}`);
  }
}

// 使用示例
async function example() {
  // 生成模拟数据
  const numSamples = 1000;
  const numFeatures = 10;
  const numClasses = 3;

  const xData = tf.randomNormal([numSamples, numFeatures]);
  const yData = tf.oneHot(
    tf.randomUniform([numSamples], 0, numClasses, 'int32'),
    numClasses
  );

  // 创建和训练模型
  const nn = new NeuralNetwork(numFeatures, 64, numClasses);
  await nn.train(xData as tf.Tensor2D, yData as tf.Tensor2D, 50);

  // 预测
  const testData = tf.randomNormal([5, numFeatures]);
  const predictions = nn.predict(testData as tf.Tensor2D);
  predictions.print();

  // 清理内存
  tf.dispose([xData, yData, testData, predictions]);
}
```

#### 手动实现反向传播（教育目的）

```typescript
class SimpleNN {
  private weights: number[][][];
  private biases: number[][];
  private activations: string[];

  constructor(layerSizes: number[]) {
    this.weights = [];
    this.biases = [];
    this.activations = [];

    // Xavier/Glorot 初始化
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const inputSize = layerSizes[i];
      const outputSize = layerSizes[i + 1];
      const std = Math.sqrt(2.0 / (inputSize + outputSize));

      this.weights.push(
        Array(outputSize).fill(0).map(() =>
          Array(inputSize).fill(0).map(() =>
            this.randn() * std
          )
        )
      );

      this.biases.push(Array(outputSize).fill(0));
      this.activations.push(i === layerSizes.length - 2 ? 'softmax' : 'relu');
    }
  }

  private randn(): number {
    // Box-Muller 变换生成正态分布
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private activate(x: number, type: string): number {
    switch (type) {
      case 'relu': return Math.max(0, x);
      case 'sigmoid': return 1 / (1 + Math.exp(-x));
      case 'tanh': return Math.tanh(x);
      default: return x;
    }
  }

  private activateDerivative(x: number, type: string): number {
    switch (type) {
      case 'relu': return x > 0 ? 1 : 0;
      case 'sigmoid': {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      }
      case 'tanh': {
        const t = Math.tanh(x);
        return 1 - t * t;
      }
      default: return 1;
    }
  }

  forward(x: number[]): { output: number[]; cache: any[] } {
    let current = [...x];
    const cache = [{ a: [...x] }];

    for (let l = 0; l < this.weights.length; l++) {
      const z = this.weights[l].map((w, i) =>
        w.reduce((sum, wi, j) => sum + wi * current[j], 0) + this.biases[l][i]
      );

      let a: number[];
      if (this.activations[l] === 'softmax') {
        const expZ = z.map(zi => Math.exp(zi - Math.max(...z)));
        const sumExp = expZ.reduce((a, b) => a + b, 0);
        a = expZ.map(e => e / sumExp);
      } else {
        a = z.map(zi => this.activate(zi, this.activations[l]));
      }

      cache.push({ z, a });
      current = a;
    }

    return { output: current, cache };
  }

  backward(
    yTrue: number[],
    cache: any[],
    learningRate: number
  ): void {
    const L = this.weights.length;
    const m = 1; // batch size = 1 for simplicity

    // 输出层误差
    const aL = cache[L].a;
    let delta = aL.map((a, i) => a - yTrue[i]); // 交叉熵 + softmax 的简化梯度

    // 反向传播
    for (let l = L - 1; l >= 0; l--) {
      const aPrev = cache[l].a;
      const z = cache[l + 1].z;

      // 计算梯度
      const dW = this.weights[l].map((_, i) =>
        aPrev.map((aj, j) => delta[i] * aj / m)
      );
      const db = delta.map(di => di / m);

      // 更新参数
      for (let i = 0; i < this.weights[l].length; i++) {
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] -= learningRate * dW[i][j];
        }
        this.biases[l][i] -= learningRate * db[i];
      }

      // 传播到前一层
      if (l > 0) {
        delta = aPrev.map((_, j) =>
          this.weights[l].reduce((sum, w, i) => sum + w[j] * delta[i], 0) *
          this.activateDerivative(z[j], this.activations[l - 1])
        );
      }
    }
  }
}
```

### 1.4 最佳实践

1. **权重初始化**
   - Xavier/Glorot 初始化：$W \sim \mathcal{U}\left[-\frac{\sqrt{6}}{\sqrt{n_{in} + n_{out}}}, \frac{\sqrt{6}}{\sqrt{n_{in} + n_{out}}}\right]$
   - He 初始化（ReLU）：$W \sim \mathcal{N}(0, \frac{2}{n_{in}})$

2. **学习率调度**

   ```typescript
   // 余弦退火
   const cosineAnnealing = (epoch: number, maxEpochs: number, initialLR: number, minLR: number) => {
     return minLR + 0.5 * (initialLR - minLR) * (1 + Math.cos(Math.PI * epoch / maxEpochs));
   };
   ```

3. **批归一化（Batch Normalization）**
   $$
   \hat{x} = \frac{x - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}
   $$
   $$
   y = \gamma \hat{x} + \beta
   $$

4. **正则化技术**
   - L2 正则化：$\mathcal{L}_{reg} = \mathcal{L} + \lambda \sum_{l} \|W^{[l]}\|_F^2$
   - Dropout：训练时以概率 $p$ 随机丢弃神经元

---

## 2. TensorFlow.js 浏览器端推理

### 2.1 理论解释

TensorFlow.js 是 Google 开发的用于在浏览器和 Node.js 中运行 ML 模型的 JavaScript 库。它支持：

- **Layer API**：高级 API，类似 Keras
- **Core API**：低级操作，直接处理张量
- **预训练模型**：直接使用 MobileNet、PoseNet、Coco-SSD 等

**后端选择：**

| 后端 | 适用场景 | 性能 |
|------|----------|------|
| CPU | 简单模型，兼容性要求 | 低 |
| WebGL | 大多数 GPU 加速场景 | 高 |
| WebGPU | 新一代 GPU 加速（实验性） | 极高 |
| WASM | 无 WebGL 时的替代方案 | 中 |

### 2.2 数学基础

**张量运算核心：**

$$
\mathbf{C}_{ij} = \sum_{k} \mathbf{A}_{ik} \cdot \mathbf{B}_{kj} \quad \text{(矩阵乘法)}
$$

$$
\text{conv2d}(\mathbf{X}, \mathbf{K})_{i,j} = \sum_{m}\sum_{n} \mathbf{X}_{i+m, j+n} \cdot \mathbf{K}_{m,n}
$$

**WebGL 加速原理：**

将张量操作转换为片段着色器（Fragment Shader）：

```glsl
// GLSL 伪代码示例
uniform sampler2D matrixA;
uniform sampler2D matrixB;

void main() {
  float sum = 0.0;
  for (int k = 0; k < K; k++) {
    sum += texture2D(matrixA, vec2(k, gl_FragCoord.y)) *
           texture2D(matrixB, vec2(gl_FragCoord.x, k));
  }
  gl_FragColor = vec4(sum, 0.0, 0.0, 0.0);
}
```

### 2.3 代码示例

#### 图像分类（MobileNet）

```typescript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

class BrowserImageClassifier {
  private model: tf.GraphModel | null = null;
  private readonly MODEL_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

  async loadModel(): Promise<void> {
    // 设置后端优先级
    await tf.setBackend('webgl');
    console.log('Using backend:', tf.getBackend());

    // 加载 MobileNet
    this.model = await tf.loadGraphModel(this.MODEL_URL);
    console.log('Model loaded successfully');

    // 预热
    const dummy = tf.zeros([1, 224, 224, 3]);
    this.model.predict(dummy);
    tf.dispose(dummy);
  }

  async classifyImage(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    topK: number = 5
  ): Promise<{ className: string; probability: number }[]> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return tf.tidy(() => {
      // 预处理
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims()
        .div(127.5)
        .sub(1);

      // 推理
      const predictions = this.model!.predict(tensor) as tf.Tensor;

      // 获取 topK
      const { values, indices } = tf.topk(predictions, topK);
      const probs = values.dataSync();
      const classes = indices.dataSync();

      // ImageNet 类别映射（简化）
      const IMAGENET_CLASSES: Record<number, string> = {
        0: 'tench',
        1: 'goldfish',
        282: 'tiger cat',
        283: 'Persian cat',
      };

      return Array.from({ length: topK }, (_, i) => ({
        className: IMAGENET_CLASSES[classes[i]] || `class_${classes[i]}`,
        probability: probs[i]
      }));
    });
  }

  // 实时视频处理
  async startVideoClassification(
    video: HTMLVideoElement,
    onPrediction: (results: any[]) => void,
    fps: number = 10
  ): Promise<() => void> {
    const interval = 1000 / fps;
    let lastTime = 0;
    let animationId: number;
    let isRunning = true;

    const classify = async (time: number) => {
      if (!isRunning) return;
      if (time - lastTime >= interval) {
        if (video.readyState >= 2) {
          const results = await this.classifyImage(video, 3);
          onPrediction(results);
        }
        lastTime = time;
      }
      animationId = requestAnimationFrame(classify);
    };

    animationId = requestAnimationFrame(classify);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
    };
  }
}
```

#### 自定义模型训练（浏览器内）

```typescript
import * as tf from '@tensorflow/tfjs';

class BrowserTrainer {
  private model: tf.LayersModel;

  constructor(numFeatures: number, numClasses: number) {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [numFeatures],
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: numClasses, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async trainOnBatch(
    xs: Float32Array,
    ys: Float32Array,
    batchSize: number
  ): Promise<tf.Logs | undefined> {
    const featureDim = xs.length / batchSize;
    const classDim = ys.length / batchSize;

    const xTensor = tf.tensor2d(xs, [batchSize, featureDim]);
    const yTensor = tf.tensor2d(ys, [batchSize, classDim]);

    const result = await this.model.trainOnBatch(xTensor, yTensor);

    tf.dispose([xTensor, yTensor]);
    return result;
  }

  // 迁移学习：特征提取
  async createTransferLearningModel(
    baseModelUrl: string,
    numClasses: number
  ): Promise<void> {
    const baseModel = await tf.loadLayersModel(baseModelUrl);

    // 冻结基础层
    baseModel.layers.forEach(layer => layer.trainable = false);

    // 添加分类头
    const input = baseModel.input;
    const baseOutput = baseModel.getLayer('global_average_pooling2d').output;

    const x = tf.layers.dense({
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }).apply(baseOutput) as tf.SymbolicTensor;

    const dropout = tf.layers.dropout({ rate: 0.5 }).apply(x) as tf.SymbolicTensor;

    const output = tf.layers.dense({
      units: numClasses,
      activation: 'softmax'
    }).apply(dropout) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: output });
  }
}
```

#### 性能优化模式

```typescript
class TFOptimization {
  // 1. 内存管理
  static withCleanup<T>(fn: () => T): T {
    return tf.tidy(fn);
  }

  // 2. 异步数据管道
  static async* dataGenerator(
    dataSource: AsyncIterable<Float32Array>
  ): AsyncGenerator<tf.Tensor2D, void, unknown> {
    for await (const batch of dataSource) {
      yield tf.tensor2d(batch, [1, batch.length]);
    }
  }

  // 3. 模型量化推理
  static async loadQuantizedModel(url: string): Promise<tf.LayersModel> {
    const model = await tf.loadLayersModel(url);
    return model;
  }

  // 4. WebWorker 推理
  static createWorkerInference(modelUrl: string): Worker {
    const workerCode = `
      importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

      let model;

      self.onmessage = async (e) => {
        const { type, data } = e.data;

        if (type === 'LOAD') {
          model = await tf.loadLayersModel(data);
          self.postMessage({ type: 'LOADED' });
        }

        if (type === 'PREDICT') {
          const tensor = tf.tensor(data);
          const result = model.predict(tensor);
          const output = await result.data();
          tf.dispose([tensor, result]);
          self.postMessage({ type: 'RESULT', data: output });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
}
```

### 2.4 最佳实践

1. **内存管理**

   ```typescript
   // 使用 tf.tidy() 自动清理
   const result = tf.tidy(() => {
     const a = tf.tensor([1, 2, 3]);
     const b = tf.tensor([4, 5, 6]);
     return a.add(b);
   });

   // 显式 dispose
   const c = tf.tensor([7, 8, 9]);
   c.dispose();
   ```

2. **模型缓存策略**

   ```typescript
   // IndexedDB 缓存
   await model.save('indexeddb://my-model');
   const cachedModel = await tf.loadLayersModel('indexeddb://my-model');
   ```

3. **性能监控**

   ```typescript
   const start = performance.now();
   const result = model.predict(input);
   await result.data(); // 确保 GPU 完成
   console.log(`Inference time: ${performance.now() - start}ms`);
   ```

---

## 3. ONNX Runtime 跨平台部署

### 3.1 理论解释

ONNX（Open Neural Network Exchange）是一种开放的深度学习模型格式，允许不同框架间的模型互操作。ONNX Runtime 是高性能的推理引擎。

**支持的框架转换：**

```
PyTorch → ONNX → ONNX Runtime
TensorFlow → ONNX → ONNX Runtime
scikit-learn → ONNX → ONNX Runtime
```

**架构优势：**

- 统一的中间表示（IR）
- 硬件特定优化（DirectML、TensorRT、OpenVINO）
- 跨平台支持（Web、移动端、边缘设备）

### 3.2 数学基础

**图优化：**

ONNX Runtime 在推理前执行多种优化：

1. **算子融合（Operator Fusion）**
   $$
   \text{Conv} \rightarrow \text{BN} \rightarrow \text{ReLU} \Rightarrow \text{ConvBNReLU}
   $$

2. **常量折叠（Constant Folding）**
   在图构建时预计算常量表达式

3. **内存布局优化**
   NCHW ↔ NHWC 自动转换

### 3.3 代码示例

#### Node.js 推理

```typescript
import * as ort from 'onnxruntime-node';

class ONNXInferenceEngine {
  private session: ort.InferenceSession | null = null;

  async loadModel(modelPath: string): Promise<void> {
    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
      executionMode: 'parallel',
      interOpNumThreads: 4,
      intraOpNumThreads: 4
    });

    console.log('Input names:', this.session.inputNames);
    console.log('Output names:', this.session.outputNames);
  }

  async predict(inputData: Float32Array, inputShape: number[]): Promise<any> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // 创建输入张量
    const inputTensor = new ort.Tensor('float32', inputData, inputShape);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session.inputNames[0]] = inputTensor;

    // 运行推理
    const startTime = performance.now();
    const results = await this.session.run(feeds);
    const inferenceTime = performance.now() - startTime;

    // 提取输出
    const output = results[this.session.outputNames[0]];

    return {
      data: output.data,
      dims: output.dims,
      inferenceTime
    };
  }

  async batchPredict(
    inputs: Float32Array[],
    inputShape: number[]
  ): Promise<any[]> {
    return Promise.all(inputs.map(input =>
      this.predict(input, inputShape)
    ));
  }

  release(): void {
    this.session?.release();
    this.session = null;
  }
}
```

#### 浏览器端 ONNX Runtime Web

```typescript
import * as ort from 'onnxruntime-web';

class BrowserONNXRuntime {
  private session: ort.InferenceSession | null = null;

  async initialize(
    modelUrl: string,
    backend: 'webgl' | 'wasm' | 'cpu' = 'wasm'
  ): Promise<void> {
    // 设置 WASM 路径
    ort.env.wasm.wasmPaths = {
      'ort-wasm.wasm': '/wasm/ort-wasm.wasm',
      'ort-wasm-simd.wasm': '/wasm/ort-wasm-simd.wasm',
      'ort-wasm-threaded.wasm': '/wasm/ort-wasm-threaded.wasm'
    };

    // 启用 SIMD 和多线程
    ort.env.wasm.simd = true;
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

    this.session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: [backend],
      graphOptimizationLevel: 'all'
    });
  }

  async runInference(imageData: ImageData): Promise<any> {
    if (!this.session) throw new Error('Session not initialized');

    const { width, height, data } = imageData;

    // 预处理：归一化并转换为 CHW 格式
    const inputData = new Float32Array(3 * height * width);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let c = 0; c < 3; c++) {
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          const pixelIndex = (h * width + w) * 4;
          const value = data[pixelIndex + c] / 255.0;
          inputData[c * height * width + h * width + w] = (value - mean[c]) / std[c];
        }
      }
    }

    const inputTensor = new ort.Tensor('float32', inputData, [1, 3, height, width]);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session.inputNames[0]] = inputTensor;

    const results = await this.session.run(feeds);
    return results;
  }
}
```

### 3.4 最佳实践

1. **模型优化**

   ```bash
   # 使用 ONNX Runtime 工具优化
   python -m onnxruntime.tools.optimizer_cli model.onnx

   # 量化
   python -m onnxruntime.quantization.preprocess --input model.onnx --output model_opt.onnx
   ```

2. **Web 部署优化**

   ```typescript
   // 分片加载大型模型
   const loadModelChunked = async (urls: string[]): Promise<ArrayBuffer> => {
     const chunks = await Promise.all(
       urls.map(url => fetch(url).then(r => r.arrayBuffer()))
     );
     const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
     const combined = new Uint8Array(totalLength);
     let offset = 0;
     chunks.forEach(chunk => {
       combined.set(new Uint8Array(chunk), offset);
       offset += chunk.byteLength;
     });
     return combined.buffer;
   };
   ```

3. **错误处理**

   ```typescript
   try {
     const session = await ort.InferenceSession.create(modelUrl);
   } catch (e) {
     if (e instanceof ort.OnnxError) {
       console.error('ONNX Error:', e.code, e.message);
       return await ort.InferenceSession.create(modelUrl, {
         executionProviders: ['wasm']
       });
     }
   }
   ```

---


## 4. LLM 集成模式

### 4.1 理论解释

大型语言模型（LLM）如 GPT、Claude、Llama 等，通过 Transformer 架构处理自然语言任务。集成模式包括：

**RAG（Retrieval-Augmented Generation）**
结合信息检索与文本生成，解决知识截止和幻觉问题。

**Agent 模式**
LLM 作为推理引擎，使用工具（Tools）与环境交互，实现自主任务执行。

**Function Calling**
结构化输出使 LLM 能够调用外部函数/API。

### 4.2 数学基础

**Transformer 架构：**

**自注意力机制：**

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

其中：

- $Q \in \mathbb{R}^{n \times d_k}$：查询矩阵
- $K \in \mathbb{R}^{m \times d_k}$：键矩阵
- $V \in \mathbb{R}^{m \times d_v}$：值矩阵
- $\sqrt{d_k}$：缩放因子

**多头注意力：**

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O
$$

$$
\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

**位置编码（RoPE）：**

$$
\text{RoPE}(x, m) = x \cdot e^{i m \theta_j}
$$

**RAG 相似度计算：**

$$
\text{score}(q, d) = \frac{\mathbf{e}_q \cdot \mathbf{e}_d}{\|\mathbf{e}_q\| \|\mathbf{e}_d\|}
$$

### 4.3 代码示例

#### RAG 系统实现

```typescript
interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
}

class RAGSystem {
  private documents: Document[] = [];
  private embeddingModel: string;

  constructor(embeddingModel: string = 'text-embedding-3-small') {
    this.embeddingModel = embeddingModel;
  }

  // 计算嵌入向量
  async computeEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: this.embeddingModel
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  // 添加文档到知识库
  async addDocuments(docs: { content: string; metadata?: any }[]): Promise<void> {
    for (const doc of docs) {
      const embedding = await this.computeEmbedding(doc.content);
      this.documents.push({
        id: crypto.randomUUID(),
        content: doc.content,
        embedding,
        metadata: doc.metadata || {}
      });
    }
  }

  // 余弦相似度检索
  async retrieve(query: string, topK: number = 5): Promise<Document[]> {
    const queryEmbedding = await this.computeEmbedding(query);

    const scores = this.documents.map(doc => ({
      doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding!)
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => s.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // 生成回答
  async generateAnswer(
    query: string,
    options: {
      topK?: number;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{ answer: string; sources: Document[] }> {
    const { topK = 5, temperature = 0.7, maxTokens = 1000 } = options;

    const relevantDocs = await this.retrieve(query, topK);
    const context = relevantDocs.map(d => d.content).join('\n\n---\n\n');

    const prompt = `上下文：\n${context}\n\n用户问题：${query}\n\n请根据上下文提供准确、简洁的回答。`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个有帮助的助手。使用提供的上下文回答问题。' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    const result = await response.json();

    return {
      answer: result.choices[0].message.content,
      sources: relevantDocs
    };
  }
}
```

#### Agent 模式实现

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}

class LLMAgent {
  private tools: Map<string, Tool> = new Map();
  private maxIterations: number = 10;

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async execute(userQuery: string): Promise<{ result: any; reasoning: string[] }> {
    const reasoning: string[] = [];
    let currentQuery = userQuery;
    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;

      const toolDescriptions = Array.from(this.tools.values())
        .map(t => `${t.name}: ${t.description}\nParameters: ${JSON.stringify(t.parameters)}`)
        .join('\n\n');

      const prompt = `你是一个AI助手，可以使用以下工具帮助回答问题：\n${toolDescriptions}\n\n用户问题：${currentQuery}\n\n如果需要使用工具，请回复：\nACTION: tool_name\nPARAMETERS: {"param": "value"}\n\n如果已有答案，请回复：\nFINAL: 你的答案`;

      const response = await this.callLLM(prompt);
      reasoning.push(response);

      if (response.includes('FINAL:')) {
        return {
          result: response.split('FINAL:')[1]?.trim() || response,
          reasoning
        };
      }

      const actionMatch = response.match(/ACTION:\s*(\w+)/);
      const paramsMatch = response.match(/PARAMETERS:\s*(\{[^}]+\})/);

      if (actionMatch && paramsMatch) {
        const toolName = actionMatch[1];
        const params = JSON.parse(paramsMatch[1]);

        const tool = this.tools.get(toolName);
        if (tool) {
          try {
            const toolResult = await tool.execute(params);
            currentQuery += `\n\n工具 ${toolName} 执行结果：${JSON.stringify(toolResult)}`;
          } catch (error) {
            currentQuery += `\n\n工具 ${toolName} 执行错误：${error}`;
          }
        }
      }
    }

    throw new Error('Max iterations reached');
  }

  private async callLLM(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

#### Function Calling

```typescript
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: object;
}

class FunctionCallingLLM {
  async callWithFunctions(
    messages: { role: string; content: string }[],
    functions: FunctionDefinition[],
    onFunctionCall?: (name: string, args: any) => Promise<any>
  ): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        functions,
        function_call: 'auto'
      })
    });

    const result = await response.json();
    const message = result.choices[0].message;

    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      if (onFunctionCall) {
        const functionResult = await onFunctionCall(functionName, functionArgs);

        messages.push(message);
        messages.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        });

        return this.callWithFunctions(messages, functions, onFunctionCall);
      }
    }

    return message.content;
  }
}
```

### 4.4 最佳实践

1. **提示工程模板**

   ```typescript
   const RAG_PROMPT_TEMPLATE = `基于以下上下文回答问题。

   上下文：{context}

   问题：{question}

   指导原则：
   1. 仅使用提供上下文中的信息
   2. 如果上下文不足，明确说明
   3. 引用来源文档ID`;
   ```

2. **流式响应处理**

   ```typescript
   const streamResponse = async (
     response: Response,
     onChunk: (chunk: string) => void
   ) => {
     const reader = response.body?.getReader();
     const decoder = new TextDecoder();

     while (true) {
       const { done, value } = await reader!.read();
       if (done) break;

       const chunk = decoder.decode(value);
       const lines = chunk.split('\n');

       for (const line of lines) {
         if (line.startsWith('data: ')) {
           const data = line.slice(6);
           if (data === '[DONE]') return;

           try {
             const parsed = JSON.parse(data);
             const content = parsed.choices?.[0]?.delta?.content;
             if (content) onChunk(content);
           } catch (e) {}
         }
       }
     }
   };
   ```

3. **重试和降级策略**

   ```typescript
   const withFallback = async <T>(
     primary: () => Promise<T>,
     fallback: () => Promise<T>,
     maxRetries: number = 3
   ): Promise<T> => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await primary();
       } catch (e) {
         if (i === maxRetries - 1) return await fallback();
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
       }
     }
     throw new Error('All retries failed');
   };
   ```

---

## 5. 向量数据库理论

### 5.1 理论解释

向量数据库存储高维向量（嵌入），支持高效的相似度搜索。核心概念：

**嵌入（Embedding）**
将离散数据（文本、图像、音频）映射到连续向量空间，语义相近的数据在向量空间中距离更近。

**相似度度量**

- 余弦相似度：方向相似性
- 欧氏距离：绝对距离
- 点积：考虑向量长度

**索引结构**

- 暴力搜索（Brute Force）：精确但慢
- HNSW（Hierarchical Navigable Small World）：近似最近邻
- IVF（Inverted File Index）：聚类后搜索
- PQ（Product Quantization）：向量压缩

### 5.2 数学基础

**嵌入映射：**

$$
\mathbf{e} = f_{\text{encoder}}(x) \in \mathbb{R}^d
$$

**余弦相似度：**

$$
\text{cos}(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \|\mathbf{b}\|}
$$

**欧氏距离：**

$$
\text{dist}(\mathbf{a}, \mathbf{b}) = \sqrt{\sum_{i=1}^{d} (a_i - b_i)^2}
$$

**HNSW 图构建：**

层次化导航图，每层是 NSW（Navigable Small World）图：

$$
P_{link}(i, j) = e^{-\frac{\text{dist}(i, j)}{m}}
$$

其中 $m$ 控制连接概率。

### 5.3 代码示例

#### 基于内存的向量存储

```typescript
interface VectorRecord {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

class InMemoryVectorDB {
  private vectors: VectorRecord[] = [];
  private dimension: number;

  constructor(dimension: number) {
    this.dimension = dimension;
  }

  add(records: Omit<VectorRecord, 'id'>[]): string[] {
    const ids: string[] = [];

    for (const record of records) {
      if (record.vector.length !== this.dimension) {
        throw new Error(`Expected dimension ${this.dimension}, got ${record.vector.length}`);
      }

      const id = crypto.randomUUID();
      this.vectors.push({ ...record, id });
      ids.push(id);
    }

    return ids;
  }

  search(
    query: number[],
    topK: number = 10,
    metric: 'cosine' | 'euclidean' = 'cosine'
  ): { id: string; score: number; metadata: any }[] {
    if (query.length !== this.dimension) {
      throw new Error('Query dimension mismatch');
    }

    const scores = this.vectors.map(record => ({
      id: record.id,
      score: metric === 'cosine'
        ? this.cosineSimilarity(query, record.vector)
        : -this.euclideanDistance(query, record.vector),
      metadata: record.metadata
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}
```

#### 与 Pinecone 集成

```typescript
class PineconeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, environment: string) {
    this.apiKey = apiKey;
    this.baseUrl = `https://controller.${environment}.pinecone.io`;
  }

  async upsert(
    indexName: string,
    vectors: { id: string; values: number[]; metadata?: any }[],
    namespace?: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/indexes/${indexName}/vectors/upsert`,
      {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vectors, namespace })
      }
    );

    if (!response.ok) {
      throw new Error(`Pinecone upsert failed: ${response.statusText}`);
    }
  }

  async query(
    indexName: string,
    vector: number[],
    topK: number = 10,
    filter?: any
  ): Promise<{ matches: any[] }> {
    const response = await fetch(
      `${this.baseUrl}/indexes/${indexName}/query`,
      {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector,
          topK,
          filter,
          includeMetadata: true,
          includeValues: false
        })
      }
    );

    return response.json();
  }
}
```

### 5.4 最佳实践

1. **嵌入维度选择**

   ```typescript
   const EMBEDDING_DIMENSIONS = {
     'text-embedding-3-small': 1536,
     'text-embedding-3-large': 3072,
     'text-embedding-ada-002': 1536,
     'openai-clip': 512
   };
   ```

2. **批量处理**

   ```typescript
   const batchProcess = async <T, R>(
     items: T[],
     processor: (batch: T[]) => Promise<R[]>,
     batchSize: number = 100
   ): Promise<R[]> => {
     const results: R[] = [];
     for (let i = 0; i < items.length; i += batchSize) {
       const batch = items.slice(i, i + batchSize);
       const batchResults = await processor(batch);
       results.push(...batchResults);
     }
     return results;
   };
   ```

---

## 6. 提示工程形式化

### 6.1 理论解释

提示工程是设计和优化输入以获得期望 LLM 输出的技术。形式化方法包括：

**提示结构：**

- 指令（Instruction）：任务描述
- 上下文（Context）：背景信息
- 示例（Examples）：少样本学习
- 输入（Input）：具体数据
- 输出格式（Output Format）：期望格式

**Prompting 模式：**

- Zero-shot：直接指令
- Few-shot：提供示例
- Chain-of-Thought（CoT）：逐步推理
- ReAct：推理 + 行动

### 6.2 数学基础

**提示的隐式条件概率：**

$$
P(y | x, p) = \prod_{t=1}^{T} P(y_t | y_{<t}, x, p)
$$

其中 $p$ 是提示，$x$ 是输入，$y$ 是输出。

**CoT 的贝叶斯解释：**

$$
P(\text{answer} | \text{question}) = \sum_{r} P(\text{answer} | r, \text{question}) P(r | \text{question})
$$

其中 $r$ 是推理链。

### 6.3 代码示例

#### 提示模板引擎

```typescript
interface PromptTemplate {
  template: string;
  inputVariables: string[];
  partialVariables?: Record<string, string>;
}

class PromptBuilder {
  private templates: Map<string, PromptTemplate> = new Map();

  registerTemplate(name: string, template: PromptTemplate): void {
    this.templates.set(name, template);
  }

  format(templateName: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateName);
    if (!template) throw new Error(`Template ${templateName} not found`);

    let result = template.template;

    if (template.partialVariables) {
      for (const [key, value] of Object.entries(template.partialVariables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    for (const key of template.inputVariables) {
      if (!(key in variables)) {
        throw new Error(`Missing variable: ${key}`);
      }
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), variables[key]);
    }

    return result;
  }
}
```

#### Chain-of-Thought 实现

```typescript
class ChainOfThought {
  private llmClient: any;

  constructor(llmClient: any) {
    this.llmClient = llmClient;
  }

  async solve(problem: string, maxSteps: number = 10): Promise<{
    answer: string;
    reasoning: string[];
  }> {
    const reasoning: string[] = [];

    const prompt = `Solve this problem step by step:

Problem: ${problem}

Think step by step. For each step:
1. State what you are doing
2. Show your work
3. Decide: CONTINUE or FINAL ANSWER

Step 1:`;

    for (let step = 0; step < maxSteps; step++) {
      const response = await this.llmClient.complete(
        prompt + '\n\n' + reasoning.join('\n')
      );
      reasoning.push(response);

      if (response.includes('FINAL ANSWER')) {
        const answer = response.split('FINAL ANSWER')[1]?.trim() || response;
        return { answer, reasoning };
      }
    }

    return {
      answer: 'Unable to solve within step limit',
      reasoning
    };
  }
}
```

### 6.4 最佳实践

1. **提示版本控制**

   ```typescript
   interface PromptVersion {
     version: string;
     template: string;
     metrics: {
       accuracy: number;
       latency: number;
       cost: number;
     };
   }
   ```

2. **自动提示优化**

   ```typescript
   const optimizePrompt = async (basePrompt: string, testCases: any[]) => {
     // 使用 DSPy 或类似框架自动优化
     const variations = generateVariations(basePrompt);
     const results = await evaluateAll(variations, testCases);
     return selectBest(results);
   };
   ```

---


## 7. 微调与迁移学习

### 7.1 理论解释

**迁移学习（Transfer Learning）**
利用在源任务上预训练的模型知识，通过微调适应目标任务。核心思想是：底层特征具有通用性，高层特征具有任务特异性。

**微调策略：**

- **特征提取**：冻结预训练层，仅训练分类头
- **全层微调**：解冻所有层，使用小学习率
- **逐层解冻**：从顶层开始逐步解冻
- **适配器（Adapters）**：插入小型可训练模块

### 7.2 数学基础

**特征提取的数学表示：**

设预训练模型为 $f_{\text{pre}} = f_{\text{high}} \circ f_{\text{low}}$，其中 $f_{\text{low}}$ 是底层特征提取器，$f_{\text{high}}$ 是高层任务特定层。

迁移学习固定 $f_{\text{low}}$，仅训练新的 $g_{\text{task}}$：

$$
y = g_{\text{task}}(f_{\text{low}}(x))
$$

**微调的目标函数：**

$$
\min_{\theta} \mathcal{L}(f_{\theta}(x), y) + \lambda \|\theta - \theta_{\text{pre}}\|^2
$$

其中第二项是正则化，防止偏离预训练权重过远。

**学习率调度（Discriminative Fine-tuning）：**

不同层使用不同学习率：

$$
\alpha_l = \alpha_{\text{base}} \cdot \text{decay}^{L-l}
$$

其中 $l$ 是层索引，$L$ 是总层数。

### 7.3 代码示例

#### TensorFlow.js 迁移学习

```typescript
import * as tf from '@tensorflow/tfjs';

class TransferLearning {
  private baseModel: tf.LayersModel | null = null;
  private customModel: tf.LayersModel | null = null;

  async loadBaseModel(modelUrl: string): Promise<void> {
    this.baseModel = await tf.loadLayersModel(modelUrl);

    // 冻结所有层
    this.baseModel.layers.forEach(layer => {
      layer.trainable = false;
    });

    console.log(`Loaded base model with ${this.baseModel.layers.length} layers`);
  }

  buildCustomModel(numClasses: number, fineTuningLayers: number = 0): void {
    if (!this.baseModel) throw new Error('Base model not loaded');

    // 解冻指定数量的顶层
    const layers = this.baseModel.layers;
    for (let i = layers.length - fineTuningLayers; i < layers.length; i++) {
      if (layers[i]) layers[i].trainable = true;
    }

    // 获取特征输出层
    const featureLayer = this.baseModel.getLayer('global_average_pooling2d') ||
                         layers[layers.length - 2];

    // 构建新分类头
    const input = this.baseModel.input;
    const x = featureLayer.output;

    const dense1 = tf.layers.dense({
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }).apply(x) as tf.SymbolicTensor;

    const dropout = tf.layers.dropout({ rate: 0.5 }).apply(dense1) as tf.SymbolicTensor;

    const output = tf.layers.dense({
      units: numClasses,
      activation: 'softmax',
      name: 'custom_output'
    }).apply(dropout) as tf.SymbolicTensor;

    this.customModel = tf.model({ inputs: input, outputs: output });

    // 编译模型 - 使用不同的学习率
    this.customModel.compile({
      optimizer: tf.train.adam(0.0001), // 较小的学习率
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(
    trainData: tf.Tensor,
    trainLabels: tf.Tensor,
    valData: tf.Tensor,
    valLabels: tf.Tensor,
    epochs: number = 20
  ): Promise<tf.History> {
    if (!this.customModel) throw new Error('Model not built');

    return await this.customModel.fit(trainData, trainLabels, {
      epochs,
      batchSize: 32,
      validationData: [valData, valLabels],
      callbacks: [
        tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: 5,
          restoreBestWeights: true
        }),
        tf.callbacks.reduceLROnPlateau({
          monitor: 'val_loss',
          factor: 0.5,
          patience: 3
        })
      ]
    });
  }

  // 渐进式解冻
  async progressiveFineTuning(
    trainData: tf.Tensor,
    trainLabels: tf.Tensor,
    valData: tf.Tensor,
    valLabels: tf.Tensor
  ): Promise<void> {
    if (!this.baseModel || !this.customModel) return;

    // 阶段 1：仅训练分类头
    console.log('Stage 1: Training classifier head');
    await this.train(trainData, trainLabels, valData, valLabels, 10);

    // 阶段 2：解冻顶层卷积层
    console.log('Stage 2: Fine-tuning top layers');
    const layers = this.baseModel.layers;
    for (let i = layers.length - 10; i < layers.length; i++) {
      if (layers[i]) layers[i].trainable = true;
    }

    this.customModel.compile({
      optimizer: tf.train.adam(0.00001), // 更小的学习率
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    await this.train(trainData, trainLabels, valData, valLabels, 10);

    // 阶段 3：解冻更多层
    console.log('Stage 3: Fine-tuning more layers');
    for (let i = layers.length - 20; i < layers.length; i++) {
      if (layers[i]) layers[i].trainable = true;
    }

    this.customModel.compile({
      optimizer: tf.train.adam(0.000001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    await this.train(trainData, trainLabels, valData, valLabels, 5);
  }
}
```

#### 适配器层（Adapter Layers）

```typescript
class AdapterLayer extends tf.layers.Layer {
  private adapterDown: tf.layers.Layer;
  private adapterUp: tf.layers.Layer;
  private activation: tf.layers.Layer;
  private residual: boolean;

  constructor(config: { bottleneckDim: number; residual?: boolean }) {
    super(config);
    this.residual = config.residual ?? true;

    this.adapterDown = tf.layers.dense({
      units: config.bottleneckDim,
      activation: 'relu',
      name: 'adapter_down'
    });

    // 使用零初始化保持恒等映射
    this.adapterUp = tf.layers.dense({
      units: config.bottleneckDim * 4, // 假设输入维度是 bottleneck * 4
      kernelInitializer: 'zeros',
      biasInitializer: 'zeros',
      name: 'adapter_up'
    });
  }

  call(inputs: tf.Tensor | tf.Tensor[]): tf.Tensor {
    const input = Array.isArray(inputs) ? inputs[0] : inputs;

    const down = this.adapterDown.apply(input) as tf.Tensor;
    const up = this.adapterUp.apply(down) as tf.Tensor;

    if (this.residual) {
      return tf.add(input, up);
    }
    return up;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      bottleneckDim: this.adapterDown.getConfig().units
    };
  }
}
```

### 7.4 最佳实践

1. **数据增强策略**

   ```typescript
   const dataAugmentation = tf.sequential({
     layers: [
       tf.layers.randomFlip({ mode: 'horizontal' }),
       tf.layers.randomRotation({ factor: 0.1 }),
       tf.layers.randomZoom({ heightFactor: 0.1, widthFactor: 0.1 }),
       tf.layers.randomContrast({ factor: 0.1 })
     ]
   });
   ```

2. **早停与检查点**

   ```typescript
   const callbacks = [
     tf.callbacks.earlyStopping({
       monitor: 'val_accuracy',
       patience: 7,
       mode: 'max'
     }),
     {
       onEpochEnd: async (epoch, logs) => {
         if (epoch % 5 === 0) {
           await model.save(`file://./checkpoints/epoch-${epoch}`);
         }
       }
     }
   ];
   ```

3. **学习率查找**

   ```typescript
   const findLearningRate = async (model, data) => {
     const lrs = [];
     const losses = [];
     let lr = 1e-7;

     for (let i = 0; i < 100; i++) {
       model.optimizer.learningRate = lr;
       const loss = await model.trainOnBatch(data.x, data.y);

       lrs.push(lr);
       losses.push(loss);

       lr *= 1.1; // 指数增长
     }

     // 找到损失下降最快的学习率
     return lrs[losses.indexOf(Math.min(...losses))];
   };
   ```

---

## 8. 模型压缩与量化

### 8.1 理论解释

模型压缩技术减少模型大小和计算量，使模型能够在资源受限的环境中运行：

**量化（Quantization）**
将浮点权重转换为低精度整数（INT8、INT4），减少内存占用和加速推理。

**剪枝（Pruning）**
移除不重要的权重或神经元连接。

**知识蒸馏（Knowledge Distillation）**
训练小型学生模型模仿大型教师模型的行为。

### 8.2 数学基础

**对称量化：**

$$
X_{int8} = \text{round}\left(\frac{X_{float}}{scale}\right)
$$

$$
scale = \frac{\max(|X|)}{127}
$$

**非对称量化：**

$$
X_{uint8} = \text{round}\left(\frac{X_{float} - zero\_point}{scale}\right)
$$

$$
scale = \frac{\max(X) - \min(X)}{255}
$$

**知识蒸馏损失：**

$$
\mathcal{L} = \alpha \mathcal{L}_{CE}(y_{student}, y_{true}) + (1-\alpha) \mathcal{L}_{KL}(y_{student}, y_{teacher})
$$

其中 $\mathcal{L}_{KL}$ 是 KL 散度：

$$
\mathcal{L}_{KL}(P, Q) = \sum_i P(i) \log\frac{P(i)}{Q(i)}
$$

**剪枝重要性度量：**

$$
\text{importance}(w) = |w| \cdot \|\nabla_w \mathcal{L}\|
$$

### 8.3 代码示例

#### TensorFlow.js 量化

```typescript
import * as tf from '@tensorflow/tfjs';

class ModelQuantization {
  // 后训练量化
  async quantizeModel(model: tf.LayersModel): Promise<tf.LayersModel> {
    const weights = model.getWeights();
    const quantizedWeights = weights.map(w => this.quantizeTensor(w, 8));

    // 创建新模型并设置量化权重
    const json = model.toJSON();
    const newModel = await tf.models.modelFromJSON(json);
    newModel.setWeights(quantizedWeights);

    return newModel;
  }

  private quantizeTensor(tensor: tf.Tensor, bits: number = 8): tf.Tensor {
    return tf.tidy(() => {
      const min = tensor.min();
      const max = tensor.max();
      const scale = max.sub(min).div(Math.pow(2, bits) - 1);
      const zeroPoint = min;

      // 量化
      const quantized = tensor.sub(zeroPoint)
        .div(scale)
        .round()
        .clipByValue(0, Math.pow(2, bits) - 1);

      // 反量化（模拟量化效果）
      return quantized.mul(scale).add(zeroPoint);
    });
  }

  // 动态范围量化
  async convertToUint8(model: tf.LayersModel): Promise<ArrayBuffer> {
    // 转换为 TensorFlow Lite 格式并量化
    const artifact = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      // 量化权重
      artifacts.weightSpecs = artifacts.weightSpecs.map((spec, i) => {
        const data = artifacts.weightData;
        // 简化的量化逻辑
        return { ...spec, dtype: 'uint8' };
      });
      return artifacts;
    }));

    return artifact as ArrayBuffer;
  }
}
```

#### 知识蒸馏

```typescript
class KnowledgeDistillation {
  private teacherModel: tf.LayersModel;
  private studentModel: tf.LayersModel;
  private temperature: number = 4;

  constructor(teacher: tf.LayersModel, student: tf.LayersModel) {
    this.teacherModel = teacher;
    this.teacherModel.trainable = false; // 冻结教师模型
    this.studentModel = student;
  }

  async distill(
    trainData: tf.Tensor,
    trainLabels: tf.Tensor,
    epochs: number = 50,
    alpha: number = 0.3 // 软目标权重
  ): Promise<tf.History> {
    const optimizer = tf.train.adam(0.001);
    const batchSize = 32;
    const numBatches = Math.ceil(trainData.shape[0] / batchSize);

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, trainData.shape[0]);

        const xBatch = trainData.slice(start, end - start);
        const yBatch = trainLabels.slice(start, end - start);

        const loss = optimizer.minimize(() => {
          return tf.tidy(() => {
            // 学生预测
            const studentLogits = this.studentModel.apply(xBatch) as tf.Tensor;

            // 教师预测（软目标）
            const teacherLogits = this.teacherModel.apply(xBatch) as tf.Tensor;
            const teacherSoft = this.softmaxWithTemperature(teacherLogits, this.temperature);
            const studentSoft = this.softmaxWithTemperature(studentLogits, this.temperature);

            // 硬目标损失
            const hardLoss = tf.losses.softmaxCrossEntropy(yBatch, studentLogits);

            // 软目标损失（KL散度）
            const softLoss = tf.losses.softmaxCrossEntropy(teacherSoft, studentSoft);

            // 总损失
            const totalLoss = tf.add(
              tf.mul(hardLoss, alpha),
              tf.mul(softLoss, 1 - alpha)
            );

            return totalLoss as tf.Scalar;
          });
        }, true);

        totalLoss += (await loss!.data())[0];

        tf.dispose([xBatch, yBatch]);
      }

      console.log(`Epoch ${epoch + 1}, Loss: ${(totalLoss / numBatches).toFixed(4)}`);
    }

    return {} as tf.History;
  }

  private softmaxWithTemperature(logits: tf.Tensor, T: number): tf.Tensor {
    return tf.tidy(() => {
      const scaled = logits.div(T);
      return tf.softmax(scaled);
    });
  }
}
```

#### WebGPU 推理优化

```typescript
class WebGPUOptimizer {
  private device: GPUDevice | null = null;

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      throw new Error('Failed to get WebGPU adapter');
    }

    this.device = await adapter.requestDevice();
    console.log('WebGPU device initialized');
  }

  // 创建计算管线用于矩阵乘法
  async createMatMulPipeline(): Promise<GPUComputePipeline> {
    if (!this.device) throw new Error('Device not initialized');

    const shaderCode = `
      @group(0) @binding(0) var<storage, read> matrixA: array<f32>;
      @group(0) @binding(1) var<storage, read> matrixB: array<f32>;
      @group(0) @binding(2) var<storage, read_write> result: array<f32>;

      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let row = global_id.x;
        let col = global_id.y;
        let M = 256u; // 矩阵维度
        let N = 256u;
        let K = 256u;

        if (row >= M || col >= N) {
          return;
        }

        var sum = 0.0;
        for (var k = 0u; k < K; k = k + 1u) {
          sum = sum + matrixA[row * K + k] * matrixB[k * N + col];
        }

        result[row * N + col] = sum;
      }
    `;

    const shaderModule = this.device.createShaderModule({ code: shaderCode });

    return this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main'
      }
    });
  }
}
```

### 8.4 最佳实践

1. **量化感知训练（QAT）**

   ```typescript
   // 在训练过程中模拟量化
   const fakeQuantize = (x: tf.Tensor, numBits: number = 8) => {
     return tf.tidy(() => {
       const min = x.min();
       const max = x.max();
       const scale = (max.sub(min)).div(Math.pow(2, numBits) - 1);
       return x.div(scale).round().mul(scale);
     });
   };
   ```

2. **混合精度推理**

   ```typescript
   // 对敏感层使用 FP32，其他使用 INT8
   const mixedPrecisionConfig = {
     'input_layer': 'float32',
     'conv1': 'int8',
     'conv2': 'int8',
     'output_layer': 'float32'
   };
   ```

3. **模型分片加载**

   ```typescript
   const loadModelChunked = async (baseUrl: string, numShards: number) => {
     const shards = await Promise.all(
       Array.from({ length: numShards }, (_, i) =>
         fetch(`${baseUrl}/model_shard_${i}.bin`)
           .then(r => r.arrayBuffer())
       )
     );

     const totalSize = shards.reduce((sum, s) => sum + s.byteLength, 0);
     const combined = new Uint8Array(totalSize);
     let offset = 0;
     shards.forEach(shard => {
       combined.set(new Uint8Array(shard), offset);
       offset += shard.byteLength;
     });

     return combined.buffer;
   };
   ```

---

## 9. A/B 测试在 ML 中的应用

### 9.1 理论解释

A/B 测试在 ML 中用于比较不同模型版本或策略的效果：

**在线 A/B 测试**
将流量随机分配到不同模型变体，比较业务指标。

**多臂老虎机（Multi-Armed Bandit）**
动态调整流量分配，在探索和利用之间平衡。

**因果推断**
估计模型变更对业务指标的真实因果效应。

### 9.2 数学基础

**假设检验：**

零假设 $H_0: \mu_A = \mu_B$
备择假设 $H_1: \mu_A \neq \mu_B$

**t 统计量：**

$$
t = \frac{\bar{X}_A - \bar{X}_B}{\sqrt{\frac{s_A^2}{n_A} + \frac{s_B^2}{n_B}}}
$$

**汤普森采样（Thompson Sampling）：**

对于每个臂 $i$，维护后验分布 $P(\theta_i | D_i)$。每次选择时，从每个臂的后验中采样，选择采样值最大的臂。

对于伯努利奖励：

$$
\theta_i \sim \text{Beta}(\alpha_i + \text{successes}, \beta_i + \text{failures})
$$

**Upper Confidence Bound（UCB）：**

$$
UCB_i = \hat{\mu}_i + c\sqrt{\frac{\ln t}{N_i}}
$$

其中 $c$ 是探索参数，$t$ 是总轮数，$N_i$ 是臂 $i$ 的拉动次数。

### 9.3 代码示例

#### A/B 测试框架

```typescript
interface Variant {
  id: string;
  model: any;
  trafficAllocation: number;
  metrics: {
    impressions: number;
    conversions: number;
    revenue: number;
  };
}

class ABTestFramework {
  private variants: Map<string, Variant> = new Map();
  private activeVariant: string | null = null;
  private confidenceLevel: number = 0.95;

  registerVariant(variant: Variant): void {
    this.variants.set(variant.id, variant);
  }

  // 随机分配
  selectVariant(userId: string): Variant {
    const hash = this.hashString(userId);
    const rand = (hash % 1000) / 1000;

    let cumProb = 0;
    for (const variant of this.variants.values()) {
      cumProb += variant.trafficAllocation;
      if (rand <= cumProb) {
        return variant;
      }
    }

    return Array.from(this.variants.values())[0];
  }

  // 一致性哈希确保同一用户总是分配到同一变体
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // 记录事件
  recordEvent(variantId: string, event: 'impression' | 'conversion', value?: number): void {
    const variant = this.variants.get(variantId);
    if (!variant) return;

    if (event === 'impression') {
      variant.metrics.impressions++;
    } else if (event === 'conversion') {
      variant.metrics.conversions++;
      variant.metrics.revenue += value || 0;
    }
  }

  // 统计显著性检验
  analyze(): { winner: string | null; pValue: number; uplift: number } {
    const variants = Array.from(this.variants.values());
    if (variants.length !== 2) {
      throw new Error('Currently only supports 2 variants');
    }

    const [control, treatment] = variants;

    // 计算转化率
    const p1 = control.metrics.conversions / control.metrics.impressions;
    const p2 = treatment.metrics.conversions / treatment.metrics.impressions;

    // 合并比例
    const p = (control.metrics.conversions + treatment.metrics.conversions) /
              (control.metrics.impressions + treatment.metrics.impressions);

    // 标准误
    const se = Math.sqrt(p * (1 - p) * (1/control.metrics.impressions + 1/treatment.metrics.impressions));

    // z 统计量
    const z = (p2 - p1) / se;

    // p 值（双尾）
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));

    // 提升
    const uplift = (p2 - p1) / p1;

    // 显著性判断
    const isSignificant = pValue < (1 - this.confidenceLevel);
    const winner = isSignificant ? (p2 > p1 ? treatment.id : control.id) : null;

    return { winner, pValue, uplift };
  }

  private normalCDF(x: number): number {
    // 使用误差函数近似
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1 + sign * y);
  }
}
```

#### 多臂老虎机

```typescript
class MultiArmedBandit {
  private arms: Map<string, {
    successes: number;
    failures: number;
    model: any;
  }> = new Map();

  private strategy: 'epsilon-greedy' | 'ucb' | 'thompson' = 'thompson';
  private epsilon: number = 0.1;

  addArm(id: string, model: any): void {
    this.arms.set(id, { successes: 0, failures: 0, model });
  }

  selectArm(): string {
    switch (this.strategy) {
      case 'epsilon-greedy':
        return this.epsilonGreedy();
      case 'ucb':
        return this.ucb();
      case 'thompson':
        return this.thompsonSampling();
      default:
        throw new Error('Unknown strategy');
    }
  }

  private epsilonGreedy(): string {
    if (Math.random() < this.epsilon) {
      // 探索：随机选择
      const keys = Array.from(this.arms.keys());
      return keys[Math.floor(Math.random() * keys.length)];
    } else {
      // 利用：选择成功率最高的
      let bestArm = '';
      let bestRate = -1;

      for (const [id, arm] of this.arms) {
        const total = arm.successes + arm.failures;
        const rate = total === 0 ? 0 : arm.successes / total;
        if (rate > bestRate) {
          bestRate = rate;
          bestArm = id;
        }
      }

      return bestArm;
    }
  }

  private ucb(): string {
    let bestArm = '';
    let bestUCB = -Infinity;
    const totalPulls = Array.from(this.arms.values())
      .reduce((sum, arm) => sum + arm.successes + arm.failures, 0);

    for (const [id, arm] of this.arms) {
      const n = arm.successes + arm.failures;
      const avgReward = n === 0 ? Infinity : arm.successes / n;
      const confidence = n === 0 ? Infinity : Math.sqrt(2 * Math.log(totalPulls + 1) / n);

      const ucb = avgReward + confidence;

      if (ucb > bestUCB) {
        bestUCB = ucb;
        bestArm = id;
      }
    }

    return bestArm;
  }

  private thompsonSampling(): string {
    let bestArm = '';
    let bestSample = -1;

    for (const [id, arm] of this.arms) {
      // 从 Beta 分布采样
      const sample = this.sampleBeta(
        arm.successes + 1,
        arm.failures + 1
      );

      if (sample > bestSample) {
        bestSample = sample;
        bestArm = id;
      }
    }

    return bestArm;
  }

  private sampleBeta(alpha: number, beta: number): number {
    // 使用 Gamma 分布生成 Beta 分布样本
    const x = this.sampleGamma(alpha, 1);
    const y = this.sampleGamma(beta, 1);
    return x / (x + y);
  }

  private sampleGamma(shape: number, scale: number): number {
    // Marsaglia and Tsang 方法
    if (shape < 1) {
      return this.sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x = this.randn();
      let v = Math.pow(1 + c * x, 3);

      if (v > 0) {
        let u = Math.random();
        if (u < 1 - 0.0331 * x * x * x * x ||
            Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v * scale;
        }
      }
    }
  }

  private randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  update(armId: string, reward: number): void {
    const arm = this.arms.get(armId);
    if (!arm) return;

    if (reward > 0) {
      arm.successes++;
    } else {
      arm.failures++;
    }
  }
}
```

### 9.4 最佳实践

1. **样本量计算**

   ```typescript
   const calculateSampleSize = (
     baselineRate: number,
     minDetectableEffect: number,
     alpha: number = 0.05,
     power: number = 0.8
   ): number => {
     const zAlpha = 1.96; // 95% confidence
     const zBeta = 0.84;  // 80% power

     const p1 = baselineRate;
     const p2 = baselineRate * (1 + minDetectableEffect);
     const p = (p1 + p2) / 2;

     const n = (2 * p * (1 - p) * Math.pow(zAlpha + zBeta, 2)) / Math.pow(p2 - p1, 2);

     return Math.ceil(n);
   };
   ```

2. **分层抽样**

   ```typescript
   const stratifiedAssignment = (
     user: { id: string; segment: string },
     variants: string[],
     stratification: Record<string, number[]>
   ): string => {
     const segment = user.segment;
     const allocations = stratification[segment] || stratification['default'];

     const hash = hashString(user.id + segment);
     const rand = (hash % 1000) / 1000;

     let cumProb = 0;
     for (let i = 0; i < variants.length; i++) {
       cumProb += allocations[i];
       if (rand <= cumProb) return variants[i];
     }

     return variants[0];
   };
   ```

3. **持续监控**

   ```typescript
   const setupMonitoring = (test: ABTestFramework) => {
     setInterval(() => {
       const analysis = test.analyze();

       // 警报条件
       if (analysis.uplift < -0.1) {
         alert('Significant negative impact detected!');
       }

       // 自动停止条件
       if (analysis.pValue < 0.001 && analysis.uplift > 0.05) {
         test.promoteWinner(analysis.winner!);
       }
     }, 60000); // 每分钟检查
   };
   ```

---

## 10. AI 伦理与安全

### 10.1 理论解释

**偏见（Bias）**
模型在训练数据中学习到的系统性偏差，导致对某些群体的不公平对待。

**隐私（Privacy）**
保护训练数据和用户隐私，防止数据泄露和成员推理攻击。

**可解释性（Explainability）**
理解模型决策过程，建立用户信任并满足监管要求。

**对抗攻击（Adversarial Attacks）**
恶意设计的输入欺骗模型产生错误输出。

### 10.2 数学基础

**公平性度量：**

**人口统计均等（Demographic Parity）：**

$$
P(\hat{Y} = 1 | A = 0) = P(\hat{Y} = 1 | A = 1)
$$

**机会均等（Equal Opportunity）：**

$$
P(\hat{Y} = 1 | Y = 1, A = 0) = P(\hat{Y} = 1 | Y = 1, A = 1)
$$

**差分隐私（Differential Privacy）：**

对于相邻数据集 $D$ 和 $D'$，机制 $M$ 满足 $(\epsilon, \delta)$-差分隐私：

$$
P(M(D) \in S) \leq e^{\epsilon} P(M(D') \in S) + \delta
$$

**高斯机制：**

$$
M(D) = f(D) + \mathcal{N}(0, \sigma^2)
$$

其中 $\sigma = \frac{\Delta f \sqrt{2\ln(1.25/\delta)}}{\epsilon}$

**LIME 解释：**

在局部近似复杂模型 $f$：

$$\xi(x) = \arg\min_{g \in G} \mathcal{L}(f, g, \pi_x) + \Omega(g)
$$

其中 $\pi_x$ 是邻近度核，$\Omega$ 是复杂度惩罚。

**对抗样本生成（FGSM）：**

$$
x_{adv} = x + \epsilon \cdot \text{sign}(\nabla_x \mathcal{L}(\theta, x, y))
$$

### 10.3 代码示例

#### 公平性检测

```typescript
interface FairnessMetrics {
  demographicParity: number;
  equalOpportunity: number;
  disparateImpact: number;
}

class FairnessAnalyzer {
  calculateMetrics(
    predictions: boolean[],
    labels: boolean[],
    protectedAttribute: boolean[] // 例如：是否为少数群体
  ): FairnessMetrics {
    // 分离群体
    const privilegedIdx = protectedAttribute.map((a, i) => a ? -1 : i).filter(i => i >= 0);
    const unprivilegedIdx = protectedAttribute.map((a, i) => a ? i : -1).filter(i => i >= 0);

    const privilegedPred = privilegedIdx.map(i => predictions[i]);
    const unprivilegedPred = unprivilegedIdx.map(i => predictions[i]);
    const privilegedLabel = privilegedIdx.map(i => labels[i]);
    const unprivilegedLabel = unprivilegedIdx.map(i => labels[i]);

    // 人口统计均等
    const privilegedRate = privilegedPred.filter(p => p).length / privilegedPred.length;
    const unprivilegedRate = unprivilegedPred.filter(p => p).length / unprivilegedPred.length;
    const demographicParity = Math.abs(privilegedRate - unprivilegedRate);

    // 机会均等
    const privilegedPositive = privilegedIdx.filter(i => labels[i]);
    const unprivilegedPositive = unprivilegedIdx.filter(i => labels[i]);

    const privilegedTPR = privilegedPositive.filter(i => predictions[i]).length / privilegedPositive.length;
    const unprivilegedTPR = unprivilegedPositive.filter(i => predictions[i]).length / unprivilegedPositive.length;
    const equalOpportunity = Math.abs(privilegedTPR - unprivilegedTPR);

    // 差异影响
    const disparateImpact = unprivilegedRate / privilegedRate;

    return {
      demographicParity,
      equalOpportunity,
      disparateImpact
    };
  }

  // 偏见缓解：重加权
  calculateSampleWeights(
    labels: boolean[],
    protectedAttribute: boolean[]
  ): number[] {
    // 计算各组各标签的期望比例
    const n = labels.length;
    const group0Label0 = labels.filter((l, i) => !protectedAttribute[i] && !l).length;
    const group0Label1 = labels.filter((l, i) => !protectedAttribute[i] && l).length;
    const group1Label0 = labels.filter((l, i) => protectedAttribute[i] && !l).length;
    const group1Label1 = labels.filter((l, i) => protectedAttribute[i] && l).length;

    const w00 = n / (4 * group0Label0);
    const w01 = n / (4 * group0Label1);
    const w10 = n / (4 * group1Label0);
    const w11 = n / (4 * group1Label1);

    return labels.map((l, i) => {
      if (!protectedAttribute[i] && !l) return w00;
      if (!protectedAttribute[i] && l) return w01;
      if (protectedAttribute[i] && !l) return w10;
      return w11;
    });
  }
}
```

#### 差分隐私训练

```typescript
import * as tf from '@tensorflow/tfjs';

class DPSGDOptimizer extends tf.Optimizer {
  private learningRate: number;
  private noiseMultiplier: number;
  private l2NormClip: number;
  private microBatches: number;

  constructor(
    learningRate: number,
    noiseMultiplier: number,
    l2NormClip: number,
    microBatches: number = 1
  ) {
    super();
    this.learningRate = learningRate;
    this.noiseMultiplier = noiseMultiplier;
    this.l2NormClip = l2NormClip;
    this.microBatches = microBatches;
  }

  async applyGradients(variableGradients: tf.NamedVariableMap): Promise<void> {
    const variables = Object.keys(variableGradients);

    for (const varName of variables) {
      const variable = variableGradients[varName];
      const gradient = await variable.data();

      // 裁剪梯度
      const globalNorm = tf.norm(gradient);
      const clipScale = tf.minimum(
        this.l2NormClip / globalNorm,
        1.0
      );
      const clippedGradient = gradient.mul(clipScale);

      // 添加噪声
      const noise = tf.randomNormal(gradient.shape, 0,
        this.l2NormClip * this.noiseMultiplier / this.microBatches);

      const noisyGradient = clippedGradient.add(noise);

      // 应用更新
      const newValue = variable.sub(noisyGradient.mul(this.learningRate));
      variable.assign(newValue);

      tf.dispose([globalNorm, clipScale, clippedGradient, noise, noisyGradient]);
    }
  }

  getConfig(): tf.ConfigDict {
    return {
      learningRate: this.learningRate,
      noiseMultiplier: this.noiseMultiplier,
      l2NormClip: this.l2NormClip
    };
  }
}

// 隐私预算计算
const calculateEpsilon = (
  numExamples: number,
  batchSize: number,
  noiseMultiplier: number,
  epochs: number,
  delta: number = 1e-5
): number => {
  const q = batchSize / numExamples;
  const steps = epochs * numExamples / batchSize;

  // 简化计算，实际应使用 Rényi 差分隐私
  return Math.sqrt(2 * steps * Math.log(1/delta)) / noiseMultiplier;
};
```

#### 模型可解释性（LIME）

```typescript
class LIMEExplainer {
  private model: any;
  private numSamples: number = 1000;
  private kernelWidth: number = 0.75;

  constructor(model: any) {
    this.model = model;
  }

  async explain(
    input: number[],
    featureNames: string[]
  ): Promise<{ feature: string; importance: number }[]> {
    // 生成扰动样本
    const perturbedSamples = this.generatePerturbations(input);

    // 获取预测
    const predictions = await Promise.all(
      perturbedSamples.map(s => this.model.predict(s))
    );

    // 计算样本权重（基于与原始输入的距离）
    const weights = perturbedSamples.map(s =>
      this.kernel(this.euclideanDistance(input, s))
    );

    // 拟合局部线性模型
    const coefficients = this.weightedLinearRegression(
      perturbedSamples,
      predictions,
      weights
    );

    // 排序特征重要性
    return coefficients
      .map((c, i) => ({ feature: featureNames[i], importance: Math.abs(c) }))
      .sort((a, b) => b.importance - a.importance);
  }

  private generatePerturbations(original: number[]): number[][] {
    const perturbations: number[][] = [];

    for (let i = 0; i < this.numSamples; i++) {
      const perturbed = original.map(v => {
        // 高斯扰动
        const noise = this.randn() * 0.1;
        return Math.max(0, Math.min(1, v + noise));
      });
      perturbations.push(perturbed);
    }

    // 包含原始样本
    perturbations.push([...original]);

    return perturbations;
  }

  private kernel(distance: number): number {
    return Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(this.kernelWidth, 2)));
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private weightedLinearRegression(
    X: number[][],
    y: number[],
    weights: number[]
  ): number[] {
    // 简化实现，实际应使用矩阵运算
    const n = X.length;
    const m = X[0].length;

    // 加权最小二乘的闭式解
    const coefficients: number[] = [];

    for (let j = 0; j < m; j++) {
      let numerator = 0;
      let denominator = 0;

      for (let i = 0; i < n; i++) {
        numerator += weights[i] * X[i][j] * y[i];
        denominator += weights[i] * X[i][j] * X[i][j];
      }

      coefficients.push(denominator > 0 ? numerator / denominator : 0);
    }

    return coefficients;
  }

  private randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}
```

#### 对抗防御

```typescript
class AdversarialDefense {
  // 对抗训练
  async adversarialTraining(
    model: tf.LayersModel,
    xTrain: tf.Tensor,
    yTrain: tf.Tensor,
    epsilon: number = 0.03,
    epochs: number = 10
  ): Promise<void> {
    const optimizer = tf.train.adam(0.001);

    for (let epoch = 0; epoch < epochs; epoch++) {
      const xBatch = xTrain;
      const yBatch = yTrain;

      // 生成对抗样本
      const xAdv = this.generateFGSM(model, xBatch, yBatch, epsilon);

      // 在干净样本和对抗样本上训练
      optimizer.minimize(() => {
        return tf.tidy(() => {
          const cleanLoss = tf.losses.softmaxCrossEntropy(
            yBatch,
            model.apply(xBatch) as tf.Tensor
          );
          const advLoss = tf.losses.softmaxCrossEntropy(
            yBatch,
            model.apply(xAdv) as tf.Tensor
          );
          return cleanLoss.add(advLoss).div(2) as tf.Scalar;
        });
      });

      tf.dispose(xAdv);
    }
  }

  // FGSM 攻击生成
  generateFGSM(
    model: tf.LayersModel,
    x: tf.Tensor,
    y: tf.Tensor,
    epsilon: number
  ): tf.Tensor {
    return tf.tidy(() => {
      const xVar = tf.variable(x);

      const lossFn = () => {
        const pred = model.apply(xVar) as tf.Tensor;
        return tf.losses.softmaxCrossEntropy(y, pred);
      };

      // 计算梯度
      const { grads } = tf.variableGrads(lossFn, [xVar]);
      const gradient = grads[0];

      // 生成对抗样本
      const xAdv = x.add(gradient.sign().mul(epsilon));

      return tf.clipByValue(xAdv, 0, 1);
    });
  }

  // 输入验证和净化
  sanitizeInput(input: number[]): number[] | null {
    // 检查数值范围
    for (const val of input) {
      if (val < 0 || val > 1 || !isFinite(val)) {
        return null;
      }
    }

    // 检查异常值（使用 IQR 方法）
    const sorted = [...input].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;

    const outliers = input.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
    if (outliers.length > input.length * 0.1) {
      return null; // 过多异常值
    }

    return input;
  }
}
```

### 10.4 最佳实践

1. **模型卡片（Model Cards）**

   ```typescript
   interface ModelCard {
     name: string;
     version: string;
     description: string;
     intendedUse: string[];
     factors: string[];
     metrics: {
       performance: Record<string, number>;
       fairness: FairnessMetrics;
     };
     evaluationData: string;
     trainingData: string;
     ethicalConsiderations: string[];
     caveats: string[];
   }
   ```

2. **数据匿名化**

   ```typescript
   const anonymizeData = (data: any[],
     sensitiveFields: string[],
     k: number = 5
   ): any[] => {
     // k-匿名化
     return data.map(record => {
       const anonymized = { ...record };
       sensitiveFields.forEach(field => {
         // 泛化敏感字段
         anonymized[field] = generalize(record[field], k);
       });
       return anonymized;
     });
   };
   ```

3. **模型审计日志**

   ```typescript
   const auditLogger = {
     log: (event: {
       timestamp: Date;
       modelVersion: string;
       input: any;
       output: any;
       userId: string;
       latency: number;
     }) => {
       // 存储审计日志
       storeAuditLog(event);

       // 异常检测
       if (event.latency > 1000) {
         alert('High latency detected');
       }
     }
   };
   ```

4. **红队测试**

   ```typescript
   const redTeamTest = async (model: any) => {
     const testCases = [
       { input: 'harmful prompt 1', expected: 'rejection' },
       { input: 'harmful prompt 2', expected: 'rejection' },
       // ...
     ];

     const results = [];
     for (const test of testCases) {
       const output = await model.generate(test.input);
       results.push({
         test: test.input,
         passed: checkSafety(output) === test.expected
       });
     }

     return results;
   };
   ```

---

## 总结

本文档涵盖了 AI/ML 集成的主要理论领域：

1. **神经网络基础** - 掌握前向/反向传播的数学原理
2. **TensorFlow.js** - 浏览器端推理的最佳实践
3. **ONNX Runtime** - 跨平台部署的统一方案
4. **LLM 集成** - RAG、Agent 和 Function Calling 模式
5. **向量数据库** - 高维相似度搜索的核心技术
6. **提示工程** - 形式化方法提升 LLM 效果
7. **微调与迁移学习** - 高效适配预训练模型
8. **模型压缩** - 量化和蒸馏技术
9. **A/B 测试** - 数据驱动的模型迭代
10. **AI 伦理** - 偏见检测、隐私保护和可解释性

这些知识为构建生产级 AI 应用提供了坚实的理论基础。

---

*文档版本: 1.0*
*最后更新: 2024*

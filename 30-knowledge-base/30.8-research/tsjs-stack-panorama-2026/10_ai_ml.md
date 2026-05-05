---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# AI/ML 在 JavaScript/TypeScript 生态中的全面应用指南

> 本文档系统性地梳理了AI/ML技术在JavaScript/TypeScript生态中的应用，涵盖从基础ML库到LLM集成、RAG架构、Agent模式以及MLOps的完整技术栈。

---

## 目录

- [AI/ML 在 JavaScript/TypeScript 生态中的全面应用指南](#aiml-在-javascripttypescript-生态中的全面应用指南)
  - [目录](#目录)
  - [1. JavaScript ML基础](#1-javascript-ml基础)
    - [1.1 TensorFlow.js](#11-tensorflowjs)
      - [核心概念](#核心概念)
      - [形式化定义](#形式化定义)
      - [完整实现示例](#完整实现示例)
      - [反例（错误用法）](#反例错误用法)
      - [性能优化](#性能优化)
    - [1.2 ONNX.js](#12-onnxjs)
      - [核心概念](#核心概念-1)
      - [完整实现示例](#完整实现示例-1)
      - [反例（错误用法）](#反例错误用法-1)
      - [性能优化](#性能优化-1)
    - [1.3 ML5.js](#13-ml5js)
      - [核心概念](#核心概念-2)
      - [完整实现示例](#完整实现示例-2)
      - [反例（错误用法）](#反例错误用法-2)
    - [1.4 Brain.js](#14-brainjs)
      - [核心概念](#核心概念-3)
      - [完整实现示例](#完整实现示例-3)
      - [反例（错误用法）](#反例错误用法-3)
      - [性能优化](#性能优化-2)
  - [2. 大语言模型(LLM)集成](#2-大语言模型llm集成)
    - [2.1 OpenAI API](#21-openai-api)
      - [核心概念](#核心概念-4)
      - [完整实现示例](#完整实现示例-4)
      - [反例（错误用法）](#反例错误用法-4)
      - [性能优化](#性能优化-3)
    - [2.2 Anthropic Claude API](#22-anthropic-claude-api)
      - [核心概念](#核心概念-5)
      - [完整实现示例](#完整实现示例-5)
    - [2.3 开源模型本地运行 (Ollama \& LM Studio)](#23-开源模型本地运行-ollama--lm-studio)
      - [核心概念](#核心概念-6)
      - [完整实现示例](#完整实现示例-6)
    - [2.4 LangChain.js](#24-langchainjs)
      - [核心概念](#核心概念-7)
      - [完整实现示例](#完整实现示例-7)
      - [反例（错误用法）](#反例错误用法-5)
  - [3. RAG架构](#3-rag架构)
    - [3.1 向量数据库](#31-向量数据库)
      - [核心概念](#核心概念-8)
      - [完整实现示例](#完整实现示例-8)
    - [3.2 嵌入模型](#32-嵌入模型)
      - [核心概念](#核心概念-9)
      - [完整实现示例](#完整实现示例-9)
    - [3.3 文档分块策略](#33-文档分块策略)
      - [核心概念](#核心概念-10)
      - [完整实现示例](#完整实现示例-10)
    - [3.4 检索和重排序](#34-检索和重排序)
      - [核心概念](#核心概念-11)
      - [完整实现示例](#完整实现示例-11)
  - [4. AI应用架构模式](#4-ai应用架构模式)
    - [4.1 Agent模式](#41-agent模式)
      - [核心概念](#核心概念-12)
      - [完整实现示例](#完整实现示例-12)
    - [4.2 多Agent系统](#42-多agent系统)
      - [核心概念](#核心概念-13)
      - [完整实现示例](#完整实现示例-13)
    - [4.3 多模态处理](#43-多模态处理)
      - [核心概念](#核心概念-14)
      - [完整实现示例](#完整实现示例-14)
    - [4.4 流式响应处理](#44-流式响应处理)
      - [核心概念](#核心概念-15)
      - [完整实现示例](#完整实现示例-15)
  - [5. MLOps for JS](#5-mlops-for-js)
    - [5.1 模型版本管理](#51-模型版本管理)
      - [核心概念](#核心概念-16)
      - [完整实现示例](#完整实现示例-16)
    - [5.2 A/B测试](#52-ab测试)
      - [核心概念](#核心概念-17)
      - [完整实现示例](#完整实现示例-17)
    - [5.3 监控和可观测性](#53-监控和可观测性)
      - [核心概念](#核心概念-18)
      - [完整实现示例](#完整实现示例-18)
    - [5.4 边缘部署](#54-边缘部署)
      - [核心概念](#核心概念-19)
      - [完整实现示例](#完整实现示例-19)
  - [6. 形式化论证](#6-形式化论证)
    - [6.1 正确性论证](#61-正确性论证)
    - [6.2 性能界限](#62-性能界限)
    - [6.3 安全性论证](#63-安全性论证)
  - [7. 总结](#7-总结)
  - [参考资源](#参考资源)

---

## 1. JavaScript ML基础

### 1.1 TensorFlow.js

#### 核心概念

TensorFlow.js 是 Google 开发的用于在浏览器和 Node.js 中训练和部署机器学习模型的库。它提供了三个核心功能层：

- **Core API**: 底层张量操作和自动微分
- **Layers API**: 高级神经网络层构建
- **Converter**: 将 Python TensorFlow 模型转换为 JS 格式

#### 形式化定义

设模型为函数 $f: \mathcal{X} \rightarrow \mathcal{Y}$，其中：

- $\mathcal{X} \subseteq \mathbb{R}^{n}$ 为输入空间
- $\mathcal{Y} \subseteq \mathbb{R}^{m}$ 为输出空间
- 参数 $\theta \in \Theta$ 为可学习权重

训练目标：$\theta^* = \arg\min_{\theta} \mathcal{L}(f_\theta(X), Y)$

#### 完整实现示例

```typescript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node'; // Node.js环境

// ============================================
// 1. 线性回归模型
// ============================================

interface LinearRegressionConfig {
  inputDim: number;
  outputDim: number;
  learningRate: number;
}

class LinearRegressionModel {
  private model: tf.LayersModel;
  private config: LinearRegressionConfig;

  constructor(config: LinearRegressionConfig) {
    this.config = config;
    this.model = this.buildModel();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      inputShape: [this.config.inputDim],
      units: this.config.outputDim,
      activation: 'linear',
      kernelInitializer: 'glorotUniform',
      biasInitializer: 'zeros'
    }));

    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    return model;
  }

  async train(
    xs: number[][],
    ys: number[][],
    epochs: number = 100,
    validationSplit: number = 0.2
  ): Promise<tf.History> {
    const xTensor = tf.tensor2d(xs);
    const yTensor = tf.tensor2d(ys);

    const history = await this.model.fit(xTensor, yTensor, {
      epochs,
      validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
          }
        }
      }
    });

    xTensor.dispose();
    yTensor.dispose();

    return history;
  }

  predict(inputs: number[][]): number[] {
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
    const result = outputTensor.dataSync() as Float32Array;

    inputTensor.dispose();
    outputTensor.dispose();

    return Array.from(result);
  }

  async save(path: string): Promise<void> {
    await this.model.save(`file://${path}`);
  }

  async load(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${path}/model.json`);
  }

  dispose(): void {
    this.model.dispose();
  }
}

// ============================================
// 2. 神经网络分类器
// ============================================

interface NeuralNetworkConfig {
  inputShape: number[];
  hiddenUnits: number[];
  numClasses: number;
  dropoutRate?: number;
  learningRate: number;
}

class NeuralNetworkClassifier {
  private model: tf.LayersModel;
  private config: NeuralNetworkConfig;

  constructor(config: NeuralNetworkConfig) {
    this.config = config;
    this.model = this.buildModel();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();

    // 输入层 + 第一个隐藏层
    model.add(tf.layers.dense({
      inputShape: this.config.inputShape,
      units: this.config.hiddenUnits[0],
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    if (this.config.dropoutRate) {
      model.add(tf.layers.dropout({ rate: this.config.dropoutRate }));
    }

    // 额外隐藏层
    for (let i = 1; i < this.config.hiddenUnits.length; i++) {
      model.add(tf.layers.dense({
        units: this.config.hiddenUnits[i],
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      }));

      if (this.config.dropoutRate) {
        model.add(tf.layers.dropout({ rate: this.config.dropoutRate }));
      }
    }

    // 输出层
    model.add(tf.layers.dense({
      units: this.config.numClasses,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async train(
    xs: number[][],
    labels: number[][], // one-hot encoded
    epochs: number = 50,
    batchSize: number = 32
  ): Promise<void> {
    const xTensor = tf.tensor2d(xs);
    const yTensor = tf.tensor2d(labels);

    await this.model.fit(xTensor, yTensor, {
      epochs,
      batchSize,
      validationSplit: 0.2,
      callbacks: tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 5
      })
    });

    xTensor.dispose();
    yTensor.dispose();
  }

  predictClass(inputs: number[][]): { classIndex: number; confidence: number }[] {
    const inputTensor = tf.tensor2d(inputs);
    const predictions = this.model.predict(inputTensor) as tf.Tensor;
    const probs = predictions.dataSync() as Float32Array;

    const results: { classIndex: number; confidence: number }[] = [];
    const numClasses = this.config.numClasses;

    for (let i = 0; i < inputs.length; i++) {
      const startIdx = i * numClasses;
      const classProbs = Array.from(probs.slice(startIdx, startIdx + numClasses));
      const maxProb = Math.max(...classProbs);
      const classIndex = classProbs.indexOf(maxProb);

      results.push({ classIndex, confidence: maxProb });
    }

    inputTensor.dispose();
    predictions.dispose();

    return results;
  }
}

// ============================================
// 3. 卷积神经网络 (CNN) 图像分类
// ============================================

class ImageClassifier {
  private model: tf.LayersModel;

  constructor(
    private imageSize: number = 28,
    private numChannels: number = 1,
    private numClasses: number = 10
  ) {
    this.model = this.buildCNN();
  }

  private buildCNN(): tf.LayersModel {
    const model = tf.sequential();

    // 第一个卷积块
    model.add(tf.layers.conv2d({
      inputShape: [this.imageSize, this.imageSize, this.numChannels],
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // 第二个卷积块
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // 第三个卷积块
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // 全连接层
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: this.numClasses, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async train(
    images: tf.Tensor4D,
    labels: tf.Tensor2D,
    epochs: number = 20
  ): Promise<void> {
    // 数据增强
    const augmentedImages = tf.tidy(() => {
      return tf.image.resizeNearestNeighbor(images, [this.imageSize, this.imageSize]);
    });

    await this.model.fit(augmentedImages, labels, {
      epochs,
      batchSize: 64,
      validationSplit: 0.1,
      callbacks: [
        tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 3 }),
        {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: acc=${logs?.acc?.toFixed(4)}, val_acc=${logs?.val_acc?.toFixed(4)}`);
          }
        }
      ]
    });

    augmentedImages.dispose();
  }

  predict(image: tf.Tensor3D | ImageData): number[] {
    return tf.tidy(() => {
      let tensor: tf.Tensor3D;

      if (image instanceof ImageData) {
        tensor = tf.browser.fromPixels(image, this.numChannels);
      } else {
        tensor = image;
      }

      const resized = tf.image.resizeBilinear(tensor, [this.imageSize, this.imageSize]);
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);

      const prediction = this.model.predict(batched) as tf.Tensor;
      return Array.from(prediction.dataSync());
    });
  }
}

// ============================================
// 使用示例
// ============================================

async function tensorflowExample(): Promise<void> {
  // 线性回归示例
  const lrModel = new LinearRegressionModel({
    inputDim: 2,
    outputDim: 1,
    learningRate: 0.01
  });

  // 训练数据: y = 2*x1 + 3*x2 + 1
  const trainX = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
  const trainY = [[6], [11], [16], [21], [26]]; // 2*1+3*1+1=6, etc.

  await lrModel.train(trainX, trainY, 200);

  const prediction = lrModel.predict([[6, 6]]);
  console.log('Prediction for [6,6]:', prediction); // 应接近 [31]

  lrModel.dispose();
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 内存泄漏 - 未释放张量
function badPredict(model: tf.LayersModel, input: number[][]): number[] {
  const tensor = tf.tensor2d(input);
  const result = model.predict(tensor) as tf.Tensor;
  // 忘记调用 tensor.dispose() 和 result.dispose()
  return Array.from(result.dataSync());
}

// ❌ 错误2: 在训练循环中创建新张量
async function badTrainingLoop(
  model: tf.LayersModel,
  data: number[][]
): Promise<void> {
  for (let i = 0; i < 1000; i++) {
    // 每次迭代都创建新张量，导致内存爆炸
    const x = tf.tensor2d(data);
    const y = tf.tensor2d(data.map(d => [d[0] * 2]));
    await model.fit(x, y, { epochs: 1 });
    // 缺少 dispose()
  }
}

// ❌ 错误3: 混淆 eager execution 和 graph mode
function badGradientComputation(): void {
  const x = tf.variable(tf.tensor1d([2]));
  // 错误：在梯度带外修改变量
  x.assign(tf.tensor1d([3]));

  const grad = tf.grad(x => x.square());
  // 结果可能不符合预期
}

// ❌ 错误4: 错误的输入维度
function badInputShape(model: tf.LayersModel): void {
  // 模型期望 [batch, 28, 28, 1]
  const wrongInput = tf.tensor2d([[1, 2], [3, 4]]); // 维度错误
  model.predict(wrongInput); // 抛出错误
}

// ❌ 错误5: 未归一化的输入
function badNormalization(imageData: Uint8Array): tf.Tensor {
  // 图像数据范围 [0, 255]，应归一化到 [0, 1] 或 [-1, 1]
  const tensor = tf.tensor3d(imageData, [28, 28, 1]);
  return tensor; // 缺少归一化: tensor.div(255.0)
}
```

#### 性能优化

```typescript
// ============================================
// TensorFlow.js 性能优化最佳实践
// ============================================

class TensorFlowOptimizer {
  // 1. 使用 tf.tidy 自动管理内存
  efficientComputation(): number[] {
    return tf.tidy(() => {
      const a = tf.tensor1d([1, 2, 3]);
      const b = tf.tensor1d([4, 5, 6]);
      const result = a.add(b);
      return Array.from(result.dataSync());
    }); // 所有中间张量自动释放
  }

  // 2. 使用 WebGL 后端加速
  async enableWebGL(): Promise<void> {
    await tf.setBackend('webgl');
    console.log('Using backend:', tf.getBackend());

    // WebGL 特定优化
    const webglBackend = tf.backend() as tf.WebGLBackend;
    // 预编译着色器
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
  }

  // 3. 批处理预测
  batchPredict(
    model: tf.LayersModel,
    inputs: number[][],
    batchSize: number = 32
  ): number[][] {
    const results: number[][] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);

      tf.tidy(() => {
        const tensor = tf.tensor2d(batch);
        const predictions = model.predict(tensor) as tf.Tensor;
        const batchResults = predictions.arraySync() as number[][];
        results.push(...batchResults);
      });
    }

    return results;
  }

  // 4. 模型量化
  async quantizeModel(model: tf.LayersModel): Promise<tf.LayersModel> {
    // 转换为 GraphModel 并进行量化
    const savedPath = 'file:///tmp/model';
    await model.save(savedPath);

    // 使用 tensorflowjs_converter 进行量化
    // 命令行: tensorflowjs_converter --quantization_bytes 1 ...

    return model;
  }

  // 5. 使用 WASM 后端（CPU 优化）
  async enableWASM(): Promise<void> {
    await tf.setBackend('wasm');
    // WASM 适合小模型或 WebGL 不支持的环境
  }

  // 6. 预热模型
  async warmupModel(
    model: tf.LayersModel,
    inputShape: number[]
  ): Promise<void> {
    const dummyInput = tf.zeros(inputShape);

    // 执行几次推理以预热 GPU/编译着色器
    for (let i = 0; i < 3; i++) {
      model.predict(dummyInput);
    }

    dummyInput.dispose();
  }

  // 7. 使用 IndexedDB 缓存模型
  async cacheModel(model: tf.LayersModel, modelName: string): Promise<void> {
    await model.save(`indexeddb://${modelName}`);
  }

  async loadCachedModel(modelName: string): Promise<tf.LayersModel | null> {
    try {
      return await tf.loadLayersModel(`indexeddb://${modelName}`);
    } catch {
      return null;
    }
  }
}

// ============================================
// 性能基准测试
// ============================================

interface BenchmarkResult {
  backend: string;
  averageTime: number;
  memoryUsage: number;
}

async function benchmarkModel(
  model: tf.LayersModel,
  inputShape: number[],
  iterations: number = 100
): Promise<BenchmarkResult[]> {
  const backends = ['webgl', 'wasm', 'cpu'];
  const results: BenchmarkResult[] = [];

  for (const backend of backends) {
    try {
      await tf.setBackend(backend);

      // 预热
      const warmup = tf.zeros(inputShape);
      for (let i = 0; i < 5; i++) {
        model.predict(warmup);
      }
      warmup.dispose();

      // 基准测试
      const times: number[] = [];
      const initialMemory = tf.memory();

      for (let i = 0; i < iterations; i++) {
        const input = tf.randomNormal(inputShape);
        const start = performance.now();

        const output = model.predict(input) as tf.Tensor;
        output.dataSync(); // 强制同步

        times.push(performance.now() - start);

        input.dispose();
        output.dispose();
      }

      const finalMemory = tf.memory();

      results.push({
        backend,
        averageTime: times.reduce((a, b) => a + b) / times.length,
        memoryUsage: finalMemory.numBytes - initialMemory.numBytes
      });
    } catch (e) {
      console.log(`Backend ${backend} not available`);
    }
  }

  return results;
}
```

---

### 1.2 ONNX.js

#### 核心概念

ONNX (Open Neural Network Exchange) 是跨框架的开放格式，ONNX.js 允许在浏览器中运行 ONNX 模型。

**形式化定义**:

- 设 ONNX 模型为计算图 $G = (V, E)$
- $V$ 为算子节点集合，$E$ 为张量数据流
- 执行语义：拓扑排序后按序执行每个节点

#### 完整实现示例

```typescript
import * as ort from 'onnxruntime-web';

// ============================================
// ONNX Runtime Web 封装
// ============================================

interface ONNXSessionConfig {
  modelPath: string;
  executionProviders?: string[]; // 'webgl', 'wasm', 'cpu'
  graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
}

interface InferenceResult {
  outputs: Record<string, ort.Tensor>;
  inferenceTime: number;
}

class ONNXInferenceEngine {
  private session: ort.InferenceSession | null = null;
  private config: ONNXSessionConfig;

  constructor(config: ONNXSessionConfig) {
    this.config = {
      executionProviders: ['webgl', 'wasm', 'cpu'],
      graphOptimizationLevel: 'all',
      ...config
    };
  }

  async initialize(): Promise<void> {
    const sessionOptions: ort.InferenceSession.SessionOptions = {
      executionProviders: this.config.executionProviders as ort.ExecutionProvider[],
      graphOptimizationLevel: this.config.graphOptimizationLevel,
      enableCpuMemArena: true,
      enableMemPattern: true
    };

    this.session = await ort.InferenceSession
      .create(this.config.modelPath, sessionOptions);

    console.log('ONNX Session initialized');
    console.log('Input names:', this.session.inputNames);
    console.log('Output names:', this.session.outputNames);
  }

  async infer(
    inputs: Record<string, ort.Tensor | Float32Array | number[]>
  ): Promise<InferenceResult> {
    if (!this.session) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    // 转换输入为 Tensor
    const tensorInputs: Record<string, ort.Tensor> = {};

    for (const [name, value] of Object.entries(inputs)) {
      if (value instanceof ort.Tensor) {
        tensorInputs[name] = value;
      } else if (value instanceof Float32Array) {
        // 需要知道形状，这里假设从 session 获取
        tensorInputs[name] = new ort.Tensor('float32', value);
      } else if (Array.isArray(value)) {
        tensorInputs[name] = new ort.Tensor('float32', value);
      }
    }

    const startTime = performance.now();
    const outputs = await this.session.run(tensorInputs);
    const inferenceTime = performance.now() - startTime;

    return { outputs, inferenceTime };
  }

  async inferImage(
    imageData: ImageData | HTMLImageElement | HTMLCanvasElement,
    inputName: string = 'input',
    preprocessing?: (data: Float32Array) => Float32Array
  ): Promise<InferenceResult> {
    // 图像预处理
    const tensor = await this.preprocessImage(imageData, preprocessing);

    return this.infer({ [inputName]: tensor });
  }

  private async preprocessImage(
    image: ImageData | HTMLImageElement | HTMLCanvasElement,
    preprocessing?: (data: Float32Array) => Float32Array
  ): Promise<ort.Tensor> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let width: number, height: number;

    if (image instanceof ImageData) {
      width = image.width;
      height = image.height;
      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(image, 0, 0);
    } else if (image instanceof HTMLImageElement) {
      width = image.naturalWidth;
      height = image.naturalHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0);
    } else {
      width = image.width;
      height = image.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0);
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = new Float32Array(width * height * 3);

    // RGB 分离并归一化
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIdx = i / 4;
      data[pixelIdx] = imageData.data[i] / 255.0;         // R
      data[pixelIdx + width * height] = imageData.data[i + 1] / 255.0; // G
      data[pixelIdx + width * height * 2] = imageData.data[i + 2] / 255.0; // B
    }

    const processedData = preprocessing ? preprocessing(data) : data;

    // NCHW 格式 [1, 3, H, W]
    return new ort.Tensor('float32', processedData, [1, 3, height, width]);
  }

  release(): void {
    this.session = null;
  }
}

// ============================================
// 预训练模型加载器
// ============================================

interface ModelMetadata {
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  classes?: string[];
}

class PretrainedModelLoader {
  private modelCache: Map<string, ONNXInferenceEngine> = new Map();

  async loadModel(
    modelUrl: string,
    metadata?: ModelMetadata
  ): Promise<ONNXInferenceEngine> {
    // 检查缓存
    if (this.modelCache.has(modelUrl)) {
      return this.modelCache.get(modelUrl)!;
    }

    const engine = new ONNXInferenceEngine({
      modelPath: modelUrl,
      executionProviders: ['webgl', 'wasm']
    });

    await engine.initialize();
    this.modelCache.set(modelUrl, engine);

    return engine;
  }

  async loadFromHuggingFace(
    modelId: string,
    fileName: string = 'model.onnx'
  ): Promise<ONNXInferenceEngine> {
    const url = `https://huggingface.co/${modelId}/resolve/main/${fileName}`;
    return this.loadModel(url);
  }

  clearCache(): void {
    this.modelCache.clear();
  }
}

// ============================================
// 使用示例：图像分类
// ============================================

async function onnxImageClassificationExample(): Promise<void> {
  // 加载 MobileNet 模型
  const loader = new PretrainedModelLoader();
  const engine = await loader.loadFromHuggingFace(
    'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
    'onnx/model.onnx'
  );

  // 假设有一个图像元素
  // const image = document.getElementById('input-image') as HTMLImageElement;

  // 创建测试图像数据
  const dummyImageData = new ImageData(224, 224);

  const result = await engine.inferImage(dummyImageData, 'input');

  // 处理输出
  const outputTensor = result.outputs[Object.keys(result.outputs)[0]];
  const probabilities = outputTensor.data as Float32Array;

  // 找到最高概率的类别
  let maxProb = 0;
  let maxIdx = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxIdx = i;
    }
  }

  console.log(`Predicted class: ${maxIdx}, confidence: ${maxProb}`);
  console.log(`Inference time: ${result.inferenceTime.toFixed(2)}ms`);

  engine.release();
}

// ============================================
// 使用示例：BERT 文本嵌入
// ============================================

class BERTEmbedder {
  private engine: ONNXInferenceEngine;
  private tokenizer: any; // 需要配合 tokenizer 库

  constructor(engine: ONNXInferenceEngine) {
    this.engine = engine;
  }

  async embed(texts: string[]): Promise<number[][]> {
    // 这里简化处理，实际需要使用 tokenizer
    const maxLength = 128;
    const inputIds: number[][] = texts.map(() =>
      Array(maxLength).fill(0).map(() => Math.floor(Math.random() * 30000))
    );
    const attentionMask: number[][] = texts.map(() =>
      Array(maxLength).fill(1)
    );

    const inputIdsTensor = new ort.Tensor(
      'int64',
      BigInt64Array.from(inputIds.flat().map(BigInt)),
      [texts.length, maxLength]
    );
    const attentionMaskTensor = new ort.Tensor(
      'int64',
      BigInt64Array.from(attentionMask.flat().map(BigInt)),
      [texts.length, maxLength]
    );

    const result = await this.engine.infer({
      input_ids: inputIdsTensor,
      attention_mask: attentionMaskTensor
    });

    // 提取 [CLS] token 的嵌入
    const outputTensor = Object.values(result.outputs)[0];
    const embeddings = outputTensor.data as Float32Array;
    const hiddenSize = embeddings.length / texts.length;

    const results: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      const start = i * hiddenSize;
      results.push(Array.from(embeddings.slice(start, start + hiddenSize)));
    }

    return results;
  }
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 未检查 session 初始化状态
async function badInference(session: ort.InferenceSession | null): Promise<void> {
  const input = new ort.Tensor('float32', [1, 2, 3], [1, 3]);
  // 未检查 session 是否为 null
  const output = await session!.run({ input }); // 可能抛出空指针
}

// ❌ 错误2: 错误的数据类型
function badTensorType(): void {
  // ONNX 期望特定类型，如 'float32', 'int64'
  const wrongTensor = new ort.Tensor('float64', [1.0, 2.0]); // 可能不支持
}

// ❌ 错误3: 未处理异步加载
function badModelLoading(): void {
  const session = ort.InferenceSession.create('model.onnx');
  // session 是 Promise，不是 session 对象
  // 立即使用会报错
}

// ❌ 错误4: 错误的输入形状
async function badInputShape(session: ort.InferenceSession): Promise<void> {
  // 模型期望 [batch, 3, 224, 224]
  const wrongShape = new ort.Tensor(
    'float32',
    new Float32Array(224 * 224 * 3),
    [224, 224, 3] // 错误：应该是 [1, 3, 224, 224]
  );
  await session.run({ input: wrongShape }); // 形状不匹配错误
}

// ❌ 错误5: 未释放资源
async function resourceLeak(): Promise<void> {
  while (true) {
    const session = await ort.InferenceSession.create('model.onnx');
    // 使用完毕未释放，每次循环创建新 session
  }
}
```

#### 性能优化

```typescript
// ============================================
// ONNX.js 性能优化
// ============================================

class ONNXOptimizer {
  // 1. 选择最佳执行提供程序
  async selectBestExecutionProvider(): Promise<string[]> {
    const providers: string[] = [];

    // 检查 WebGL 支持
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (gl) {
        providers.push('webgl');
      }
    } catch {
      // WebGL 不可用
    }

    // WASM 总是可用
    providers.push('wasm');
    providers.push('cpu');

    return providers;
  }

  // 2. 模型优化选项
  getOptimizedSessionOptions(): ort.InferenceSession.SessionOptions {
    return {
      executionProviders: ['webgl', 'wasm'],
      graphOptimizationLevel: 'all',
      enableCpuMemArena: true,
      enableMemPattern: true,
      // 额外优化选项
      extra: {
        session: {
          use_arena: '1',
          use_memory_pattern: '1'
        }
      }
    };
  }

  // 3. 批量推理
  async batchInference<T extends ort.Tensor>(
    session: ort.InferenceSession,
    inputs: T[],
    batchSize: number = 8
  ): Promise<ort.InferenceSession.OnnxValueMapType[]> {
    const results: ort.InferenceSession.OnnxValueMapType[] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);

      // 合并批次
      const batchTensor = this.concatTensors(batch);
      const result = await session.run({ input: batchTensor });

      // 分割结果
      const outputTensors = this.splitTensor(
        Object.values(result)[0] as ort.Tensor,
        batch.length
      );

      results.push(...outputTensors.map(t => ({ output: t })));
    }

    return results;
  }

  private concatTensors<T extends ort.Tensor>(tensors: T[]): T {
    // 实现张量拼接逻辑
    // 简化示例
    const totalSize = tensors.reduce((sum, t) => sum + t.data.length, 0);
    const concatenated = new Float32Array(totalSize);

    let offset = 0;
    for (const tensor of tensors) {
      concatenated.set(tensor.data as Float32Array, offset);
      offset += tensor.data.length;
    }

    const shape = [...tensors[0].dims];
    shape[0] = tensors.length;

    return new ort.Tensor('float32', concatenated, shape) as T;
  }

  private splitTensor(tensor: ort.Tensor, numSplits: number): ort.Tensor[] {
    const data = tensor.data as Float32Array;
    const splitSize = data.length / numSplits;
    const baseShape = tensor.dims.slice(1);

    const results: ort.Tensor[] = [];
    for (let i = 0; i < numSplits; i++) {
      const splitData = data.slice(i * splitSize, (i + 1) * splitSize);
      results.push(new ort.Tensor('float32', splitData, [1, ...baseShape]));
    }

    return results;
  }

  // 4. 使用 Worker 进行推理
  async createInferenceWorker(modelPath: string): Promise<Worker> {
    const workerCode = `
      importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

      let session = null;

      self.onmessage = async function(e) {
        const { type, data } = e.data;

        if (type === 'init') {
          session = await ort.InferenceSession.create(data.modelPath);
          self.postMessage({ type: 'initialized' });
        } else if (type === 'infer') {
          const input = new ort.Tensor('float32', data.input, data.shape);
          const result = await session.run({ input });
          self.postMessage({
            type: 'result',
            data: Array.from(result.output.data)
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.postMessage({ type: 'init', data: { modelPath } });

    return new Promise((resolve) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'initialized') {
          resolve(worker);
        }
      };
    });
  }
}
```

---

### 1.3 ML5.js

#### 核心概念

ML5.js 是基于 TensorFlow.js 的高级封装，提供友好的 API 用于常见 ML 任务。

**支持的模型类别**:

- 图像: MobileNet、PoseNet、BodyPix、UNET
- 文本: CharRNN、Sentiment
- 声音: SoundClassifier、PitchDetection
- 通用: NeuralNetwork、KNNClassifier

#### 完整实现示例

```typescript
// 注意: ML5.js 主要是 JavaScript 库，TypeScript 类型需要单独安装
// npm install --save ml5 @types/ml5

import * as ml5 from 'ml5';

// ============================================
// 1. 图像分类器
// ============================================

interface ImageClassifierOptions {
  topk?: number;
  version?: 1 | 2;
  alpha?: 0.25 | 0.5 | 0.75 | 1.0;
}

interface ClassificationResult {
  label: string;
  confidence: number;
}

class ML5ImageClassifier {
  private classifier: any;

  async initialize(options: ImageClassifierOptions = {}): Promise<void> {
    this.classifier = await ml5.imageClassifier(
      'MobileNet',
      options
    );
  }

  async classify(
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Promise<ClassificationResult[]> {
    if (!this.classifier) {
      throw new Error('Classifier not initialized');
    }

    const results = await this.classifier.classify(image);

    return results.map((r: any) => ({
      label: r.label,
      confidence: r.confidence
    }));
  }
}

// ============================================
// 2. 姿态检测 (PoseNet)
// ============================================

interface PoseNetOptions {
  detectionType?: 'single' | 'multiple';
  outputStride?: 8 | 16 | 32;
  imageScaleFactor?: number;
  minConfidence?: number;
  maxPoseDetections?: number;
  scoreThreshold?: number;
  nmsRadius?: number;
}

interface Keypoint {
  position: { x: number; y: number };
  score: number;
  part: string;
}

interface Pose {
  pose: {
    keypoints: Keypoint[];
    score: number;
  };
  skeleton: Array<[Keypoint, Keypoint]>;
}

class ML5PoseDetector {
  private poseNet: any;

  async initialize(options: PoseNetOptions = {}): Promise<void> {
    this.poseNet = await ml5.poseNet(options);
  }

  async detect(
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<Pose[]> {
    if (!this.poseNet) {
      throw new Error('PoseNet not initialized');
    }

    const results = await this.poseNet.singlePose(image);
    return Array.isArray(results) ? results : [results];
  }

  // 实时视频姿态检测
  onPoseDetected(
    video: HTMLVideoElement,
    callback: (poses: Pose[]) => void
  ): void {
    this.poseNet.on('pose', (results: any) => {
      callback(results);
    });
  }

  // 计算关节角度
  calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
    const radians = Math.atan2(c.position.y - b.position.y, c.position.x - b.position.x) -
                    Math.atan2(a.position.y - b.position.y, a.position.x - b.position.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
      angle = 360 - angle;
    }

    return angle;
  }

  // 检测特定姿势（如举手）
  detectHandsUp(pose: Pose): boolean {
    const keypoints = pose.pose.keypoints;
    const leftWrist = keypoints.find(k => k.part === 'leftWrist');
    const leftShoulder = keypoints.find(k => k.part === 'leftShoulder');
    const rightWrist = keypoints.find(k => k.part === 'rightWrist');
    const rightShoulder = keypoints.find(k => k.part === 'rightShoulder');

    const leftHandUp = leftWrist && leftShoulder &&
                       leftWrist.position.y < leftShoulder.position.y;
    const rightHandUp = rightWrist && rightShoulder &&
                        rightWrist.position.y < rightShoulder.position.y;

    return Boolean(leftHandUp || rightHandUp);
  }
}

// ============================================
// 3. 神经网络训练
// ============================================

interface NeuralNetworkOptions {
  inputs: number;
  outputs: number;
  task?: 'classification' | 'regression';
  debug?: boolean;
  learningRate?: number;
  hiddenUnits?: number;
}

interface TrainingData {
  xs: Record<string, number>;
  ys: Record<string, number>;
}

class ML5NeuralNetwork {
  private neuralNetwork: any;

  constructor(options: NeuralNetworkOptions) {
    this.neuralNetwork = ml5.neuralNetwork(options);
  }

  addData(input: Record<string, number>, output: Record<string, number>): void {
    this.neuralNetwork.addData(input, output);
  }

  normalizeData(): void {
    this.neuralNetwork.normalizeData();
  }

  async train(options: {
    epochs?: number;
    batchSize?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.neuralNetwork.train(options, () => {
        resolve();
      });
    });
  }

  async predict(input: Record<string, number>): Promise<Record<string, number>> {
    return new Promise((resolve, reject) => {
      this.neuralNetwork.predict(input, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  save(modelName: string = 'model'): void {
    this.neuralNetwork.save(modelName);
  }

  async load(modelPath: string): Promise<void> {
    await this.neuralNetwork.load(modelPath);
  }
}

// ============================================
// 4. 特征提取器 (迁移学习)
// ============================================

class ML5FeatureExtractor {
  private featureExtractor: any;
  private classifier: any;

  async initialize(numClasses: number = 2): Promise<void> {
    // 使用 MobileNet 作为特征提取器
    this.featureExtractor = ml5.featureExtractor('MobileNet', {
      numLabels: numClasses
    });
    this.classifier = this.featureExtractor.classification();
  }

  async addImage(
    image: HTMLImageElement | HTMLVideoElement,
    label: string
  ): Promise<void> {
    await this.classifier.addImage(image, label);
  }

  async train(): Promise<void> {
    await this.classifier.train();
  }

  async classify(
    image: HTMLImageElement | HTMLVideoElement
  ): Promise<{ label: string; confidence: number }[]> {
    const results = await this.classifier.classify(image);
    return results.map((r: any) => ({
      label: r.label,
      confidence: r.confidence
    }));
  }

  save(modelName: string): void {
    this.featureExtractor.save(modelName);
  }
}

// ============================================
// 5. 文本生成 (CharRNN)
// ============================================

interface CharRNNTOptions {
  modelUrl: string;
}

interface GenerationOptions {
  seed?: string;
  length?: number;
  temperature?: number;
  stateful?: boolean;
}

class ML5TextGenerator {
  private charRNN: any;

  async initialize(modelUrl: string): Promise<void> {
    this.charRNN = await ml5.charRNN(modelUrl);
  }

  async generate(options: GenerationOptions = {}): Promise<string> {
    const result = await this.charRNN.generate(options);
    return result.sample;
  }

  async feed(seed: string): Promise<void> {
    await this.charRNN.feed(seed);
  }

  async predict(temperature: number = 0.5): Promise<string> {
    const result = await this.charRNN.predict(temperature);
    return result.sample;
  }
}

// ============================================
// 使用示例
// ============================================

async function ml5Examples(): Promise<void> {
  // 图像分类示例
  const classifier = new ML5ImageClassifier();
  await classifier.initialize({ topk: 5 });

  // 假设有一个图像元素
  // const img = document.getElementById('image') as HTMLImageElement;
  // const results = await classifier.classify(img);
  // console.log(results);

  // 神经网络训练示例
  const nn = new ML5NeuralNetwork({
    inputs: 2,
    outputs: 1,
    task: 'regression',
    learningRate: 0.1,
    hiddenUnits: 16
  });

  // 添加训练数据: XOR 问题
  nn.addData({ x0: 0, x1: 0 }, { y: 0 });
  nn.addData({ x0: 0, x1: 1 }, { y: 1 });
  nn.addData({ x0: 1, x1: 0 }, { y: 1 });
  nn.addData({ x0: 1, x1: 1 }, { y: 0 });

  nn.normalizeData();
  await nn.train({ epochs: 100 });

  const prediction = await nn.predict({ x0: 0, x1: 1 });
  console.log('Prediction:', prediction);
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 未等待初始化完成
async function badInitialization(): Promise<void> {
  const classifier = new ML5ImageClassifier();
  // 忘记 await initialize()
  const results = await classifier.classify(document.createElement('img'));
  // 报错: classifier 为 undefined
}

// ❌ 错误2: 在模型加载前使用
function badModelUsage(): void {
  const nn = new ML5NeuralNetwork({ inputs: 2, outputs: 1 });
  nn.addData({ x0: 1, x1: 0 }, { y: 1 });
  nn.normalizeData();
  nn.train({ epochs: 10 }); // 忘记 await
  nn.predict({ x0: 1, x1: 0 }); // 可能在训练完成前执行
}

// ❌ 错误3: 未归一化数据
function badDataNormalization(): void {
  const nn = new ML5NeuralNetwork({ inputs: 1, outputs: 1 });

  // 添加范围差异很大的数据
  nn.addData({ x: 0.001 }, { y: 1000000 });
  nn.addData({ x: 1000 }, { y: 0.0001 });

  // 忘记调用 nn.normalizeData()
  nn.train({ epochs: 100 }); // 训练效果极差
}

// ❌ 错误4: 混淆分类和回归
function badTaskType(): void {
  // 实际是回归问题但设置为分类
  const nn = new ML5NeuralNetwork({
    inputs: 1,
    outputs: 1,
    task: 'classification' // 错误：应该是 'regression'
  });

  nn.addData({ x: 1 }, { y: 2.5 });
  nn.addData({ x: 2 }, { y: 5.0 });
  // 训练会失败或产生错误结果
}

// ❌ 错误5: 视频元素未正确设置
async function badVideoSetup(): Promise<void> {
  const video = document.createElement('video');
  // 忘记设置视频源或等待加载

  const poseDetector = new ML5PoseDetector();
  await poseDetector.initialize();

  const poses = await poseDetector.detect(video);
  // 视频未加载，返回空结果或错误
}
```

---

### 1.4 Brain.js

#### 核心概念

Brain.js 是一个用于 JavaScript 的神经网络库，专注于简单性和易用性，支持前馈神经网络和循环神经网络(RNN/LSTM)。

**形式化定义**:

- 神经网络: $f_{\theta}: \mathbb{R}^{n} \rightarrow \mathbb{R}^{m}$
- 训练目标: 最小化损失函数 $\mathcal{L}(\theta) = \frac{1}{N}\sum_{i=1}^{N} ||f_{\theta}(x_i) - y_i||^2$

#### 完整实现示例

```typescript
import brain from 'brain.js';

// ============================================
// 1. 前馈神经网络
// ============================================

interface FeedForwardConfig {
  inputSize: number;
  hiddenLayers?: number[];
  outputSize: number;
  learningRate?: number;
  activation?: 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';
}

interface TrainingData {
  input: number[];
  output: number[];
}

class BrainFeedForwardNetwork {
  private net: brain.NeuralNetwork;
  private config: FeedForwardConfig;

  constructor(config: FeedForwardConfig) {
    this.config = config;
    this.net = new brain.NeuralNetwork({
      inputSize: config.inputSize,
      hiddenLayers: config.hiddenLayers || [10, 10],
      outputSize: config.outputSize,
      learningRate: config.learningRate || 0.3,
      activation: config.activation || 'sigmoid'
    });
  }

  train(data: TrainingData[], iterations: number = 20000): brain.INeuralNetworkState {
    return this.net.train(data, {
      iterations,
      log: true,
      logPeriod: 1000,
      errorThresh: 0.005
    });
  }

  predict(input: number[]): number[] {
    return this.net.run(input) as number[];
  }

  toJSON(): brain.INeuralNetworkJSON {
    return this.net.toJSON();
  }

  fromJSON(json: brain.INeuralNetworkJSON): void {
    this.net.fromJSON(json);
  }
}

// ============================================
// 2. LSTM 文本生成
// ============================================

interface LSTMConfig {
  inputSize?: number;
  hiddenLayers?: number[];
  outputSize?: number;
}

class BrainLSTM {
  private net: brain.recurrent.LSTM;

  constructor(config: LSTMConfig = {}) {
    this.net = new brain.recurrent.LSTM({
      inputSize: config.inputSize || 20,
      hiddenLayers: config.hiddenLayers || [20, 20],
      outputSize: config.outputSize || 20
    });
  }

  train(texts: string[], iterations: number = 1500): void {
    this.net.train(texts, {
      iterations,
      log: true,
      logPeriod: 100,
      errorThresh: 0.011
    });
  }

  generate(seed: string = '', maxLength: number = 50): string {
    return this.net.run(seed) as string;
  }

  forecast(input: string[], count: number = 3): string[] {
    return this.net.forecast(input, count) as string[];
  }
}

// ============================================
// 3. GRU 时间序列预测
// ============================================

class BrainGRU {
  private net: brain.recurrent.GRU;

  constructor(hiddenLayers: number[] = [10, 10]) {
    this.net = new brain.recurrent.GRU({
      inputSize: 1,
      hiddenLayers,
      outputSize: 1
    });
  }

  train(data: number[][], iterations: number = 2000): void {
    this.net.train(data, {
      iterations,
      log: true,
      logPeriod: 100,
      errorThresh: 0.01
    });
  }

  predict(sequence: number[]): number[] {
    return this.net.run(sequence) as number[];
  }

  forecast(sequence: number[], steps: number = 5): number[][] {
    return this.net.forecast(sequence, steps) as number[][];
  }
}

// ============================================
// 4. 情感分析
// ============================================

interface SentimentTrainingData {
  input: string;
  output: { positive: number; negative: number };
}

class BrainSentimentAnalyzer {
  private net: brain.NeuralNetwork;

  constructor() {
    this.net = new brain.NeuralNetwork({
      hiddenLayers: [50, 50],
      activation: 'sigmoid'
    });
  }

  // 简单的词袋编码
  private encodeText(text: string, vocab: Set<string>): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const vocabArray = Array.from(vocab);
    return vocabArray.map(word => words.includes(word) ? 1 : 0);
  }

  buildVocabulary(texts: string[]): Set<string> {
    const vocab = new Set<string>();
    texts.forEach(text => {
      text.toLowerCase().split(/\s+/).forEach(word => vocab.add(word));
    });
    return vocab;
  }

  prepareData(
    data: SentimentTrainingData[],
    vocab: Set<string>
  ): { input: number[]; output: number[] }[] {
    return data.map(item => ({
      input: this.encodeText(item.input, vocab),
      output: [item.output.positive, item.output.negative]
    }));
  }

  train(preparedData: { input: number[]; output: number[] }[]): void {
    this.net.train(preparedData, {
      iterations: 2000,
      log: true,
      logPeriod: 200,
      errorThresh: 0.005
    });
  }

  analyze(text: string, vocab: Set<string>): { positive: number; negative: number } {
    const encoded = this.encodeText(text, vocab);
    const result = this.net.run(encoded) as number[];
    return {
      positive: result[0],
      negative: result[1]
    };
  }
}

// ============================================
// 5. 股票预测示例
// ============================================

class StockPricePredictor {
  private net: brain.recurrent.LSTMTimeStep;

  constructor() {
    this.net = new brain.recurrent.LSTMTimeStep({
      inputSize: 4,  // open, high, low, close
      hiddenLayers: [20, 20],
      outputSize: 4
    });
  }

  // 归一化价格数据
  private normalize(data: number[][]): number[][] {
    const max = Math.max(...data.flat());
    const min = Math.min(...data.flat());
    return data.map(day => day.map(price => (price - min) / (max - min)));
  }

  train(priceData: number[][], iterations: number = 3000): void {
    const normalized = this.normalize(priceData);
    this.net.train(normalized, {
      iterations,
      log: true,
      logPeriod: 100,
      errorThresh: 0.02
    });
  }

  predict(lastDays: number[][]): number[] {
    return this.net.run(lastDays) as number[];
  }

  forecast(lastDays: number[][], days: number = 5): number[][] {
    return this.net.forecast(lastDays, days) as number[][];
  }
}

// ============================================
// 使用示例
// ============================================

function brainExamples(): void {
  // XOR 问题示例
  const xorNet = new BrainFeedForwardNetwork({
    inputSize: 2,
    hiddenLayers: [4],
    outputSize: 1,
    learningRate: 0.5
  });

  const xorData = [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] }
  ];

  xorNet.train(xorData, 5000);

  console.log('[0, 0] =>', xorNet.predict([0, 0])); // 接近 0
  console.log('[0, 1] =>', xorNet.predict([0, 1])); // 接近 1
  console.log('[1, 0] =>', xorNet.predict([1, 0])); // 接近 1
  console.log('[1, 1] =>', xorNet.predict([1, 1])); // 接近 0

  // 颜色对比度检测
  const contrastNet = new BrainFeedForwardNetwork({
    inputSize: 3,
    hiddenLayers: [6],
    outputSize: 1
  });

  const contrastData = [
    { input: [0, 0, 0], output: [1] }, // 黑色背景 -> 白色文字
    { input: [1, 1, 1], output: [0] }, // 白色背景 -> 黑色文字
    { input: [0.5, 0.5, 0.5], output: [0.5] }, // 灰色背景 -> 灰色文字
    { input: [1, 0, 0], output: [1] }, // 红色背景 -> 白色文字
    { input: [0, 1, 0], output: [0] }, // 绿色背景 -> 黑色文字
    { input: [0, 0, 1], output: [1] }  // 蓝色背景 -> 白色文字
  ];

  contrastNet.train(contrastData, 3000);

  const darkBlue = contrastNet.predict([0.1, 0.1, 0.8]);
  console.log('Dark blue background text color:', darkBlue[0] > 0.5 ? 'white' : 'black');
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 输入输出维度不匹配
function badDimensions(): void {
  const net = new brain.NeuralNetwork({
    inputSize: 3,
    hiddenLayers: [5],
    outputSize: 2
  });

  net.train([
    { input: [1, 2], output: [1] },      // 错误：input 应该是 3 维
    { input: [1, 2, 3], output: [1, 0] } // 正确
  ]);
}

// ❌ 错误2: 未归一化输入
function badNormalization(): void {
  const net = new brain.NeuralNetwork();

  net.train([
    { input: [1000, 2000, 3000], output: [1] }, // 值太大，sigmoid 会饱和
    { input: [0.1, 0.2, 0.3], output: [0] }
  ]);
  // 应该将输入归一化到 [0, 1] 或 [-1, 1]
}

// ❌ 错误3: 训练数据太少
function badTrainingData(): void {
  const net = new brain.NeuralNetwork({
    hiddenLayers: [100, 100, 100] // 大量隐藏层
  });

  net.train([
    { input: [1], output: [1] },
    { input: [0], output: [0] }
  ]);
  // 严重过拟合，模型会记住而不是学习
}

// ❌ 错误4: 混淆网络类型
function badNetworkType(): void {
  // 用 LSTM 处理非序列数据
  const net = new brain.recurrent.LSTM();

  net.train([
    { input: [0.1, 0.2, 0.3], output: [1] },
    { input: [0.4, 0.5, 0.6], output: [0] }
  ]);
  // 应该使用普通的 NeuralNetwork
}

// ❌ 错误5: 未设置合适的 errorThresh
function badErrorThreshold(): void {
  const net = new brain.NeuralNetwork();

  net.train([
    { input: [1, 0], output: [1] },
    { input: [0, 1], output: [0] }
  ], {
    errorThresh: 0.000001, // 太小，训练可能永远不收敛
    iterations: 100
  });
}
```

#### 性能优化

```typescript
// ============================================
// Brain.js 性能优化
// ============================================

class BrainOptimizer {
  // 1. GPU 加速（如果可用）
  enableGPU(): void {
    // Brain.js 使用 gpu.js 自动检测 GPU
    // 确保安装: npm install gpu.js
    const net = new brain.NeuralNetworkGPU({
      hiddenLayers: [100, 100]
    });
  }

  // 2. 批处理训练
  batchTrain<T extends { input: number[]; output: number[] }>(
    net: brain.NeuralNetwork,
    data: T[],
    batchSize: number = 100
  ): void {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      net.train(batch, {
        iterations: 100,
        log: false
      });
    }
  }

  // 3. 早停策略
  trainWithEarlyStopping<T extends { input: number[]; output: number[] }>(
    net: brain.NeuralNetwork,
    trainData: T[],
    validationData: T[],
    patience: number = 10
  ): void {
    let bestError = Infinity;
    let patienceCounter = 0;

    for (let epoch = 0; epoch < 10000; epoch++) {
      const trainResult = net.train(trainData, {
        iterations: 1,
        log: false
      });

      // 验证
      let validationError = 0;
      for (const item of validationData) {
        const prediction = net.run(item.input) as number[];
        const error = prediction.reduce((sum, p, i) =>
          sum + Math.pow(p - item.output[i], 2), 0
        );
        validationError += error;
      }
      validationError /= validationData.length;

      if (validationError < bestError) {
        bestError = validationError;
        patienceCounter = 0;
      } else {
        patienceCounter++;
      }

      if (patienceCounter >= patience) {
        console.log(`Early stopping at epoch ${epoch}`);
        break;
      }
    }
  }

  // 4. 模型压缩
  pruneNetwork(net: brain.NeuralNetwork, threshold: number = 0.01): void {
    const json = net.toJSON();

    // 将小的权重设为 0
    json.layers.forEach(layer => {
      if (layer.weights) {
        layer.weights = layer.weights.map((w: number) =>
          Math.abs(w) < threshold ? 0 : w
        );
      }
    });

    net.fromJSON(json);
  }

  // 5. 使用 Web Worker
  createTrainingWorker(): Worker {
    const workerCode = `
      importScripts('https://unpkg.com/brain.js@2.0.0-beta.23/dist/brain-browser.min.js');

      self.onmessage = function(e) {
        const { data, config } = e.data;

        const net = new brain.NeuralNetwork(config);
        const result = net.train(data, {
          iterations: 1000,
          log: true,
          logPeriod: 100
        });

        self.postMessage({
          result: result,
          model: net.toJSON()
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
}
```

---


## 2. 大语言模型(LLM)集成

### 2.1 OpenAI API

#### 核心概念

OpenAI API 提供了对 GPT 系列模型的访问，包括文本生成、嵌入、图像生成、语音识别等功能。

**形式化定义**:

- LLM 为概率模型: $P(y|x) = \prod_{t=1}^{T} P(y_t|y_{<t}, x)$
- 其中 $x$ 为输入提示，$y$ 为生成序列
- 采样策略: Temperature $T$ 控制随机性，Top-p 控制多样性

#### 完整实现示例

```typescript
import OpenAI from 'openai';

// ============================================
// OpenAI 客户端配置
// ============================================

interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
}

class OpenAIClient {
  private client: OpenAI;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3
    });
  }

  // ============================================
  // 1. 聊天完成 (Chat Completions)
  // ============================================

  async chat(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      stop?: string[];
    } = {}
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stop: options.stop
    });

    return response.choices[0]?.message?.content || '';
  }

  // 流式聊天
  async *chatStream(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  // ============================================
  // 2. Function Calling
  // ============================================

  interface FunctionDefinition {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  }

  async chatWithFunctions(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    functions: FunctionDefinition[],
    options: {
      model?: string;
      functionCall?: 'auto' | 'none' | { name: string };
    } = {}
  ): Promise<{
    content: string | null;
    functionCall: {
      name: string;
      arguments: string;
    } | null;
  }> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      functions: functions as OpenAI.Chat.ChatCompletionCreateParams.Function[],
      function_call: options.functionCall || 'auto'
    });

    const message = response.choices[0]?.message;

    return {
      content: message?.content || null,
      functionCall: message?.function_call ? {
        name: message.function_call.name,
        arguments: message.function_call.arguments
      } : null
    };
  }

  // ============================================
  // 3. 嵌入 (Embeddings)
  // ============================================

  async createEmbedding(
    text: string,
    model: string = 'text-embedding-3-small'
  ): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model,
      input: text
    });

    return response.data[0].embedding;
  }

  async createEmbeddings(
    texts: string[],
    model: string = 'text-embedding-3-small',
    batchSize: number = 100
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.client.embeddings.create({
        model,
        input: batch
      });

      embeddings.push(...response.data.map(d => d.embedding));
    }

    return embeddings;
  }

  // ============================================
  // 4. 结构化输出 (JSON Mode)
  // ============================================

  async structuredOutput<T>(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    schema: object,
    options: {
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<T> {
    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: `You must respond with valid JSON matching this schema: ${JSON.stringify(schema)}`
    };

    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: [systemMessage, ...messages],
      temperature: options.temperature ?? 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  }

  // ============================================
  // 5. 视觉模型
  // ============================================

  async visionChat(
    imageUrl: string,
    prompt: string,
    options: {
      model?: string;
      detail?: 'low' | 'high' | 'auto';
    } = {}
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: options.detail || 'auto'
              }
            }
          ]
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  }

  async visionChatBase64(
    base64Image: string,
    prompt: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    return this.visionChat(
      `data:${mimeType};base64,${base64Image}`,
      prompt
    );
  }

  // ============================================
  // 6. 语音转文字
  // ============================================

  async transcribeAudio(
    audioBuffer: Buffer,
    options: {
      model?: string;
      language?: string;
      prompt?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    } = {}
  ): Promise<string> {
    const response = await this.client.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
      model: options.model || 'whisper-1',
      language: options.language,
      prompt: options.prompt,
      response_format: options.responseFormat || 'json'
    });

    return response.text;
  }

  // ============================================
  // 7. 文字转语音
  // ============================================

  async textToSpeech(
    text: string,
    options: {
      model?: string;
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed?: number;
    } = {}
  ): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: options.model || 'tts-1',
      voice: options.voice || 'alloy',
      input: text,
      speed: options.speed ?? 1.0
    });

    return Buffer.from(await response.arrayBuffer());
  }

  // ============================================
  // 8. 图像生成
  // ============================================

  async generateImage(
    prompt: string,
    options: {
      model?: string;
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
      n?: number;
    } = {}
  ): Promise<string[]> {
    const response = await this.client.images.generate({
      model: options.model || 'dall-e-3',
      prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      n: options.n || 1
    });

    return response.data.map(d => d.url || d.b64_json || '').filter(Boolean);
  }

  // ============================================
  // 9. 微调模型
  // ============================================

  async createFineTuningJob(
    trainingFileId: string,
    options: {
      model?: string;
      suffix?: string;
      validationFileId?: string;
      hyperparameters?: {
        n_epochs?: 'auto' | number;
        batch_size?: 'auto' | number;
        learning_rate_multiplier?: 'auto' | number;
      };
    } = {}
  ): Promise<string> {
    const job = await this.client.fineTuning.jobs.create({
      training_file: trainingFileId,
      model: options.model || 'gpt-3.5-turbo',
      suffix: options.suffix,
      validation_file: options.validationFileId,
      hyperparameters: options.hyperparameters
    });

    return job.id;
  }

  async getFineTuningStatus(jobId: string): Promise<{
    status: string;
    fineTunedModel?: string;
    trainedTokens?: number;
  }> {
    const job = await this.client.fineTuning.jobs.retrieve(jobId);

    return {
      status: job.status,
      fineTunedModel: job.fine_tuned_model || undefined,
      trainedTokens: job.trained_tokens || undefined
    };
  }
}

// ============================================
// 使用示例
// ============================================

async function openAIExamples(): Promise<void> {
  const client = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!
  });

  // 简单聊天
  const response = await client.chat([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ]);
  console.log(response);

  // 流式聊天
  console.log('Streaming response:');
  for await (const chunk of client.chatStream([
    { role: 'user', content: 'Tell me a short story.' }
  ])) {
    process.stdout.write(chunk);
  }
  console.log();

  // Function Calling
  const weatherFunction = {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object' as const,
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit']
        }
      },
      required: ['location']
    }
  };

  const functionResult = await client.chatWithFunctions(
    [{ role: 'user', content: 'What\'s the weather like in Tokyo?' }],
    [weatherFunction]
  );

  if (functionResult.functionCall) {
    console.log('Function called:', functionResult.functionCall.name);
    console.log('Arguments:', JSON.parse(functionResult.functionCall.arguments));
  }

  // 结构化输出
  interface MovieRecommendation {
    title: string;
    year: number;
    genre: string;
    reason: string;
  }

  const movie = await client.structuredOutput<MovieRecommendation>(
    [{ role: 'user', content: 'Recommend a sci-fi movie from the 1980s' }],
    {
      type: 'object',
      properties: {
        title: { type: 'string' },
        year: { type: 'integer' },
        genre: { type: 'string' },
        reason: { type: 'string' }
      },
      required: ['title', 'year', 'genre', 'reason']
    }
  );
  console.log('Movie recommendation:', movie);
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 在循环中不控制速率限制
async function badRateLimiting(client: OpenAIClient): Promise<void> {
  const texts = Array(1000).fill('test');

  // 会触发速率限制错误
  const embeddings = await Promise.all(
    texts.map(t => client.createEmbedding(t))
  );
}

// ❌ 错误2: 未处理 API 错误
async function badErrorHandling(client: OpenAIClient): Promise<void> {
  // 假设 API 密钥无效
  const response = await client.chat([
    { role: 'user', content: 'Hello' }
  ]);
  // 未 try-catch，程序会崩溃
}

// ❌ 错误3: 使用过长的上下文
async function badContextLength(client: OpenAIClient): Promise<void> {
  const longText = 'a'.repeat(1000000); // 远超上下文限制

  await client.chat([
    { role: 'user', content: longText }
  ]);
  // 会抛出 context length exceeded 错误
}

// ❌ 错误4: 未正确解析 Function Calling 结果
async function badFunctionParsing(client: OpenAIClient): Promise<void> {
  const result = await client.chatWithFunctions(
    [{ role: 'user', content: 'Get weather' }],
    [{
      name: 'get_weather',
      description: 'Get weather',
      parameters: { type: 'object', properties: {} }
    }]
  );

  // 错误：假设 arguments 总是有效的 JSON
  const args = JSON.parse(result.functionCall!.arguments);
  // 如果 arguments 为 undefined 会崩溃
}

// ❌ 错误5: 未处理流式输出的错误
async function badStreamHandling(client: OpenAIClient): Promise<void> {
  const stream = client.chatStream([
    { role: 'user', content: 'Generate long text' }
  ]);

  for await (const chunk of stream) {
    console.log(chunk);
  }
  // 未处理流中断或网络错误
}
```

#### 性能优化

```typescript
// ============================================
// OpenAI API 性能优化
// ============================================

class OpenAIOptimizer {
  private client: OpenAI;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  // 1. 带缓存的嵌入
  async getEmbeddingWithCache(text: string): Promise<number[]> {
    const cacheKey = this.hashText(text);

    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const embedding = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    const result = embedding.data[0].embedding;
    this.embeddingCache.set(cacheKey, result);

    return result;
  }

  private hashText(text: string): string {
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // 2. 批量嵌入处理
  async batchEmbeddings(
    texts: string[],
    batchSize: number = 100
  ): Promise<number[][]> {
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch
      });

      results.push(...response.data.map(d => d.embedding));

      // 速率限制保护
      if (i + batchSize < texts.length) {
        await this.sleep(100);
      }
    }

    return results;
  }

  // 3. 带重试和退避的请求
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  // 4. 并发控制
  async concurrentWithLimit<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const [index, item] of items.entries()) {
      const promise = operation(item).then(result => {
        results[index] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  // 5. 流式响应聚合
  async *streamWithAggregation(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options: {
      model?: string;
      aggregationSize?: number;
    } = {}
  ): AsyncGenerator<string, string, unknown> {
    const stream = await this.client.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages,
      stream: true
    });

    let buffer = '';
    let fullResponse = '';
    const aggregationSize = options.aggregationSize || 10;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      buffer += content;
      fullResponse += content;

      if (buffer.length >= aggregationSize) {
        yield buffer;
        buffer = '';
      }
    }

    if (buffer.length > 0) {
      yield buffer;
    }

    return fullResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// Token 计数和成本控制
// ============================================

import { encoding_for_model } from 'tiktoken';

class TokenCounter {
  private encoder: any;

  constructor(model: string = 'gpt-4') {
    this.encoder = encoding_for_model(model as any);
  }

  countTokens(text: string): number {
    return this.encoder.encode(text).length;
  }

  countMessageTokens(
    messages: OpenAI.Chat.ChatCompletionMessageParam[]
  ): number {
    let tokens = 0;

    for (const message of messages) {
      tokens += 4; // 每条消息的开销
      tokens += this.countTokens(message.role);
      tokens += this.countTokens(
        typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content)
      );
    }

    tokens += 2; // 回复的开销
    return tokens;
  }

  estimateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 5, output: 15 }, // per 1M tokens
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 }
    };

    const price = pricing[model] || pricing['gpt-4o'];

    return (inputTokens * price.input + outputTokens * price.output) / 1000000;
  }
}
```

---

### 2.2 Anthropic Claude API

#### 核心概念

Claude 是 Anthropic 开发的 AI 助手，以其安全性和长上下文窗口著称。

**特点**:

- 200K token 上下文窗口
- 强大的推理能力
- 内置安全机制
- 支持工具使用

#### 完整实现示例

```typescript
import Anthropic from '@anthropic-ai/sdk';

// ============================================
// Claude 客户端
// ============================================

interface ClaudeConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

class ClaudeClient {
  private client: Anthropic;

  constructor(config: ClaudeConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000
    });
  }

  // ============================================
  // 1. 基本消息完成
  // ============================================

  async message(
    messages: Anthropic.MessageParam[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      topK?: number;
      system?: string;
      stopSequences?: string[];
    } = {}
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 4096,
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP,
      top_k: options.topK,
      system: options.system,
      stop_sequences: options.stopSequences
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  // ============================================
  // 2. 流式消息
  // ============================================

  async *messageStream(
    messages: Anthropic.MessageParam[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): AsyncGenerator<string, Anthropic.Message, unknown> {
    const stream = await this.client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 4096,
      messages,
      temperature: options.temperature ?? 0.7,
      system: options.system,
      stream: true
    });

    let fullMessage: Anthropic.Message | null = null;

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      } else if (event.type === 'message_stop') {
        fullMessage = event.message;
      }
    }

    return fullMessage!;
  }

  // ============================================
  // 3. 工具使用 (Tool Use)
  // ============================================

  interface ToolDefinition {
    name: string;
    description: string;
    input_schema: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  }

  async messageWithTools(
    messages: Anthropic.MessageParam[],
    tools: ToolDefinition[],
    options: {
      model?: string;
      maxTokens?: number;
      toolChoice?: { type: 'auto' | 'any' | 'tool'; name?: string };
    } = {}
  ): Promise<{
    content: string;
    toolCalls: Array<{
      name: string;
      id: string;
      input: Record<string, unknown>;
    }>;
    stopReason: string;
  }> {
    const response = await this.client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 4096,
      messages,
      tools: tools as Anthropic.Tool[],
      tool_choice: options.toolChoice || { type: 'auto' }
    });

    const toolCalls: Array<{
      name: string;
      id: string;
      input: Record<string, unknown>;
    }> = [];
    let textContent = '';

    for (const content of response.content) {
      if (content.type === 'tool_use') {
        toolCalls.push({
          name: content.name,
          id: content.id,
          input: content.input as Record<string, unknown>
        });
      } else if (content.type === 'text') {
        textContent += content.text;
      }
    }

    return {
      content: textContent,
      toolCalls,
      stopReason: response.stop_reason || 'unknown'
    };
  }

  // 发送工具结果
  async sendToolResult(
    conversation: Anthropic.MessageParam[],
    toolUseId: string,
    result: unknown
  ): Promise<string> {
    const messages: Anthropic.MessageParam[] = [
      ...conversation,
      {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: JSON.stringify(result)
        }]
      }
    ];

    return this.message(messages);
  }

  // ============================================
  // 4. 视觉理解
  // ============================================

  async visionMessage(
    imageBase64: string,
    prompt: string,
    mimeType: string = 'image/jpeg',
    options: {
      model?: string;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const messages: Anthropic.MessageParam[] = [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as any,
            data: imageBase64
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ]
    }];

    return this.message(messages, {
      model: options.model || 'claude-3-5-sonnet-20241022',
      maxTokens: options.maxTokens || 4096
    });
  }

  // ============================================
  // 5. 长文档处理
  // ============================================

  async processLongDocument(
    document: string,
    instructions: string,
    options: {
      model?: string;
      chunkSize?: number;
    } = {}
  ): Promise<string> {
    const chunkSize = options.chunkSize || 8000;
    const chunks: string[] = [];

    // 分块处理
    for (let i = 0; i < document.length; i += chunkSize) {
      chunks.push(document.slice(i, i + chunkSize));
    }

    const summaries: string[] = [];

    for (const chunk of chunks) {
      const summary = await this.message([
        {
          role: 'user',
          content: `Summarize this section of the document:\n\n${chunk}`
        }
      ], {
        model: options.model || 'claude-3-haiku-20240307',
        maxTokens: 1000
      });

      summaries.push(summary);
    }

    // 最终汇总
    const finalResponse = await this.message([
      {
        role: 'user',
        content: `${instructions}\n\nDocument summaries:\n${summaries.join('\n\n')}`
      }
    ], {
      model: options.model || 'claude-3-5-sonnet-20241022',
      maxTokens: 4096
    });

    return finalResponse;
  }

  // ============================================
  // 6. 代码生成和审查
  // ============================================

  async reviewCode(
    code: string,
    language: string
  ): Promise<{
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      line?: number;
      description: string;
      suggestion: string;
    }>;
    summary: string;
  }> {
    const systemPrompt = `You are an expert code reviewer. Analyze the provided ${language} code and identify issues, bugs, and improvements. Respond in JSON format with the following structure:
{
  "issues": [
    {
      "severity": "low|medium|high|critical",
      "line": number (optional),
      "description": "issue description",
      "suggestion": "how to fix"
    }
  ],
  "summary": "overall assessment"
}`;

    const response = await this.message([
      {
        role: 'user',
        content: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ], {
      system: systemPrompt,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
      temperature: 0.1
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        issues: [],
        summary: response
      };
    }
  }

  async generateTests(
    code: string,
    language: string,
    framework: string
  ): Promise<string> {
    return this.message([
      {
        role: 'user',
        content: `Generate comprehensive unit tests for this ${language} code using ${framework}:\n\n\`\`\`${language}\n${code}\n\`\`\`

Requirements:
1. Cover all edge cases
2. Include setup and teardown if needed
3. Add descriptive test names
4. Include both positive and negative test cases`
      }
    ], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096
    });
  }
}

// ============================================
// 使用示例
// ============================================

async function claudeExamples(): Promise<void> {
  const client = new ClaudeClient({
    apiKey: process.env.ANTHROPIC_API_KEY!
  });

  // 基本对话
  const response = await client.message([
    { role: 'user', content: 'Explain quantum computing in simple terms.' }
  ]);
  console.log(response);

  // 带系统提示的对话
  const codeResponse = await client.message([
    { role: 'user', content: 'Write a function to reverse a linked list.' }
  ], {
    system: 'You are an expert programmer. Provide clean, well-commented code with explanations.',
    model: 'claude-3-5-sonnet-20241022'
  });
  console.log(codeResponse);

  // 工具使用
  const calculatorTool = {
    name: 'calculate',
    description: 'Perform mathematical calculations',
    input_schema: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate'
        }
      },
      required: ['expression']
    }
  };

  const toolResult = await client.messageWithTools(
    [{ role: 'user', content: 'What is 1234 * 5678?' }],
    [calculatorTool]
  );

  if (toolResult.toolCalls.length > 0) {
    console.log('Tool called:', toolResult.toolCalls[0].name);
    console.log('Input:', toolResult.toolCalls[0].input);
  }

  // 代码审查
  const codeReview = await client.reviewCode(`
function factorial(n) {
  if (n == 0) return 1;
  return n * factorial(n - 1);
}
`, 'javascript');

  console.log('Code review:', codeReview);
}
```

---

### 2.3 开源模型本地运行 (Ollama & LM Studio)

#### 核心概念

开源 LLM 可以在本地运行，提供隐私保护和成本优势。

**Ollama**: 简化本地 LLM 运行的工具
**LM Studio**: 带 GUI 的本地 LLM 管理器

#### 完整实现示例

```typescript
// ============================================
// Ollama 客户端
// ============================================

interface OllamaConfig {
  baseURL: string;
  defaultModel?: string;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  raw?: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // base64 encoded
}

class OllamaClient {
  private baseURL: string;
  private defaultModel: string;

  constructor(config: OllamaConfig) {
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.defaultModel = config.defaultModel || 'llama3.2';
  }

  // ============================================
  // 1. 生成文本
  // ============================================

  async generate(
    prompt: string,
    options: {
      model?: string;
      system?: string;
      temperature?: number;
      maxTokens?: number;
      format?: 'json';
    } = {}
  ): Promise<string> {
    const request: OllamaGenerateRequest = {
      model: options.model || this.defaultModel,
      prompt,
      system: options.system,
      stream: false,
      format: options.format,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens
      }
    };

    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  // ============================================
  // 2. 流式生成
  // ============================================

  async *generateStream(
    prompt: string,
    options: {
      model?: string;
      system?: string;
      temperature?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const request: OllamaGenerateRequest = {
      model: options.model || this.defaultModel,
      prompt,
      system: options.system,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7
      }
    };

    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            yield data.response;
          }
          if (data.done) return;
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  // ============================================
  // 3. 聊天
  // ============================================

  async chat(
    messages: OllamaChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      format?: 'json';
    } = {}
  ): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages,
        stream: false,
        format: options.format,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  }

  // ============================================
  // 4. 嵌入
  // ============================================

  async createEmbedding(
    text: string,
    model: string = 'nomic-embed-text'
  ): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  // ============================================
  // 5. 模型管理
  // ============================================

  async listModels(): Promise<Array<{
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      format: string;
      family: string;
      families: string[];
      parameter_size: string;
      quantization_level: string;
    };
  }>> {
    const response = await fetch(`${this.baseURL}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models || [];
  }

  async pullModel(model: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: false })
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }
  }

  async deleteModel(model: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete model: ${response.statusText}`);
    }
  }

  // ============================================
  // 6. 多模态（视觉）
  // ============================================

  async visionChat(
    imageBase64: string,
    prompt: string,
    options: {
      model?: string;
    } = {}
  ): Promise<string> {
    const messages: OllamaChatMessage[] = [{
      role: 'user',
      content: prompt,
      images: [imageBase64]
    }];

    return this.chat(messages, {
      model: options.model || 'llava'
    });
  }
}

// ============================================
// LM Studio 客户端
// ============================================

class LMStudioClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:1234') {
    this.baseURL = baseURL;
  }

  // LM Studio 使用 OpenAI 兼容 API
  async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'local-model',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async *chatStream(
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/v1/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async listModels(): Promise<Array<{ id: string; object: string }>> {
    const response = await fetch(`${this.baseURL}/v1/models`);

    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

// ============================================
// 使用示例
// ============================================

async function localLLMExamples(): Promise<void> {
  // Ollama 示例
  const ollama = new OllamaClient({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2'
  });

  // 列出可用模型
  const models = await ollama.listModels();
  console.log('Available models:', models.map(m => m.name));

  // 生成文本
  const response = await ollama.generate(
    'Explain the benefits of TypeScript.',
    { temperature: 0.7 }
  );
  console.log(response);

  // 流式生成
  console.log('Streaming:');
  for await (const chunk of ollama.generateStream('Write a haiku about coding.')) {
    process.stdout.write(chunk);
  }
  console.log();

  // 聊天
  const chatResponse = await ollama.chat([
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'How do I reverse a string in JavaScript?' }
  ]);
  console.log(chatResponse);

  // 嵌入
  const embedding = await ollama.createEmbedding('Hello world');
  console.log('Embedding dimension:', embedding.length);

  // LM Studio 示例
  const lmStudio = new LMStudioClient('http://localhost:1234');

  const lmResponse = await lmStudio.chat([
    { role: 'user', content: 'What is machine learning?' }
  ]);
  console.log('LM Studio:', lmResponse);
}
```

---

### 2.4 LangChain.js

#### 核心概念

LangChain 是一个用于构建 LLM 应用的框架，提供模块化组件用于链式调用、记忆、工具集成等。

**核心组件**:

- **Models**: LLM 和 Chat Model 接口
- **Prompts**: 提示模板和管理
- **Chains**: 组件序列化调用
- **Agents**: 动态决策执行
- **Memory**: 对话历史管理
- **Tools**: 外部功能集成

#### 完整实现示例

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// ============================================
// 1. 基础模型和提示
// ============================================

class LangChainBasics {
  private model: ChatOpenAI;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0.7
    });
  }

  // 简单调用
  async simpleCall(prompt: string): Promise<string> {
    const response = await this.model.invoke(prompt);
    return response.content as string;
  }

  // 提示模板
  async withTemplate(): Promise<void> {
    const template = new PromptTemplate({
      inputVariables: ['product', 'audience'],
      template: `Write a marketing description for {product} targeting {audience}.
Make it engaging and highlight key benefits.`
    });

    const formatted = await template.format({
      product: 'wireless headphones',
      audience: 'fitness enthusiasts'
    });

    console.log(formatted);
  }

  // 结构化提示
  async structuredPrompt(): Promise<void> {
    const template = PromptTemplate.fromTemplate(`
You are a helpful assistant that generates product descriptions.

Product Name: {name}
Category: {category}
Price: {price}
Key Features: {features}

Generate a compelling product description in {tone} tone.
    `);

    const formatted = await template.format({
      name: 'SmartWatch Pro',
      category: 'Wearable Technology',
      price: '$299',
      features: 'Heart rate monitor, GPS, Water resistant',
      tone: 'professional'
    });

    const response = await this.model.invoke(formatted);
    console.log(response.content);
  }
}

// ============================================
// 2. 链 (Chains)
// ============================================

class LangChainChains {
  private model: ChatOpenAI;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.7
    });
  }

  // LLM 链
  async llmChain(): Promise<void> {
    const template = new PromptTemplate({
      inputVariables: ['topic'],
      template: 'Write a short paragraph about {topic}.'
    });

    const chain = new LLMChain({
      llm: this.model,
      prompt: template
    });

    const result = await chain.call({ topic: 'artificial intelligence' });
    console.log(result.text);
  }

  // 顺序链
  async sequentialChain(): Promise<void> {
    // 链 1: 生成标题
    const titleTemplate = new PromptTemplate({
      inputVariables: ['topic'],
      template: 'Generate 3 catchy blog post titles about {topic}.'
    });

    const titleChain = new LLMChain({
      llm: this.model,
      prompt: titleTemplate,
      outputKey: 'titles'
    });

    // 链 2: 选择最佳标题并写大纲
    const outlineTemplate = new PromptTemplate({
      inputVariables: ['titles'],
      template: `Given these titles: {titles}

Select the best one and create a detailed outline for the blog post.`
    });

    const outlineChain = new LLMChain({
      llm: this.model,
      prompt: outlineTemplate,
      outputKey: 'outline'
    });

    // 手动顺序执行
    const titleResult = await titleChain.call({ topic: 'remote work' });
    const outlineResult = await outlineChain.call({
      titles: titleResult.titles
    });

    console.log('Titles:', titleResult.titles);
    console.log('Outline:', outlineResult.outline);
  }

  // 带记忆的对话链
  async conversationChain(): Promise<void> {
    const memory = new BufferMemory();

    const chain = new ConversationChain({
      llm: this.model,
      memory,
      verbose: true
    });

    const response1 = await chain.call({
      input: 'Hi, my name is Alice.'
    });
    console.log(response1.response);

    const response2 = await chain.call({
      input: 'What is my name?'
    });
    console.log(response2.response);
  }
}

// ============================================
// 3. Agent 和工具
// ============================================

class LangChainAgents {
  private model: ChatOpenAI;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0
    });
  }

  // 自定义工具
  createCalculatorTool(): Tool {
    return new Tool({
      name: 'calculator',
      description: 'Useful for performing mathematical calculations. Input should be a valid mathematical expression.',
      func: async (input: string) => {
        try {
          // 注意：实际应用中应该使用安全的计算方式
          const result = eval(input);
          return String(result);
        } catch {
          return 'Error: Invalid expression';
        }
      }
    });
  }

  createSearchTool(): Tool {
    return new Tool({
      name: 'web_search',
      description: 'Search the web for information. Input should be a search query.',
      func: async (query: string) => {
        // 实际实现会调用搜索 API
        return `Search results for "${query}" would appear here.`;
      }
    });
  }

  createWeatherTool(): Tool {
    return new Tool({
      name: 'get_weather',
      description: 'Get the current weather for a location. Input should be a city name.',
      func: async (city: string) => {
        // 实际实现会调用天气 API
        return `Weather in ${city}: Sunny, 22°C`;
      }
    });
  }

  // 创建 Agent
  async createAgent(): Promise<AgentExecutor> {
    const tools = [
      this.createCalculatorTool(),
      this.createSearchTool(),
      this.createWeatherTool()
    ];

    const prompt = await createOpenAIFunctionsAgent({
      llm: this.model,
      tools,
      prompt: PromptTemplate.fromTemplate(`
You are a helpful assistant with access to various tools.
Answer the user's questions to the best of your ability.
Use tools when necessary to provide accurate information.

{agent_scratchpad}
      `)
    });

    return new AgentExecutor({
      agent: prompt,
      tools,
      verbose: true
    });
  }

  // 运行 Agent
  async runAgent(query: string): Promise<string> {
    const executor = await this.createAgent();
    const result = await executor.invoke({ input: query });
    return result.output as string;
  }
}

// ============================================
// 4. 文档处理
// ============================================

class LangChainDocuments {
  private embeddings: OpenAIEmbeddings;

  constructor(apiKey: string) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey
    });
  }

  // 文档分割
  async splitDocument(text: string): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', '']
    });

    return splitter.createDocuments([text]);
  }

  // 创建文档嵌入
  async embedDocuments(documents: Document[]): Promise<number[][]> {
    const texts = documents.map(doc => doc.pageContent);
    return this.embeddings.embedDocuments(texts);
  }

  // 语义搜索
  async semanticSearch(
    query: string,
    documents: Document[]
  ): Promise<Array<{ document: Document; score: number }>> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const docEmbeddings = await this.embedDocuments(documents);

    // 计算余弦相似度
    const similarities = docEmbeddings.map((embedding, i) => ({
      document: documents[i],
      score: this.cosineSimilarity(queryEmbedding, embedding)
    }));

    return similarities.sort((a, b) => b.score - a.score);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// ============================================
// 5. 高级：RAG 链
// ============================================

import { RetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

class LangChainRAG {
  private model: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o'
    });
    this.embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey });
  }

  async createRAGChain(documents: Document[]): Promise<RetrievalQAChain> {
    // 创建向量存储
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      this.embeddings
    );

    // 创建检索器
    const retriever = vectorStore.asRetriever({
      k: 4 // 返回前 4 个相关文档
    });

    // 创建 RAG 链
    const chain = RetrievalQAChain.fromLLM(
      this.model,
      retriever,
      {
        returnSourceDocuments: true,
        verbose: true
      }
    );

    return chain;
  }

  async queryRAG(
    chain: RetrievalQAChain,
    question: string
  ): Promise<{ answer: string; sources: Document[] }> {
    const result = await chain.call({ query: question });

    return {
      answer: result.text,
      sources: result.sourceDocuments || []
    };
  }
}

// ============================================
// 使用示例
// ============================================

async function langchainExamples(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY!;

  // 基础示例
  const basics = new LangChainBasics(apiKey);
  await basics.withTemplate();

  // 链示例
  const chains = new LangChainChains(apiKey);
  await chains.llmChain();
  await chains.conversationChain();

  // Agent 示例
  const agents = new LangChainAgents(apiKey);
  const agentResult = await agents.runAgent(
    'What is 1234 * 5678? Also, what is the weather in Tokyo?'
  );
  console.log('Agent result:', agentResult);

  // 文档处理示例
  const docs = new LangChainDocuments(apiKey);
  const sampleText = `
    TypeScript is a strongly typed programming language that builds on JavaScript.
    It adds optional static typing to the language.
    TypeScript is developed and maintained by Microsoft.
    It was first released in October 2012.
  `;
  const splitDocs = await docs.splitDocument(sampleText);
  console.log('Split into', splitDocs.length, 'chunks');

  // RAG 示例
  const rag = new LangChainRAG(apiKey);
  const ragChain = await rag.createRAGChain(splitDocs);
  const ragResult = await rag.queryRAG(ragChain, 'Who developed TypeScript?');
  console.log('RAG Answer:', ragResult.answer);
}
```

#### 反例（错误用法）

```typescript
// ❌ 错误1: 未处理模型调用错误
async function badErrorHandling(): Promise<void> {
  const model = new ChatOpenAI({ apiKey: 'invalid' });
  const response = await model.invoke('Hello');
  // 未 try-catch，API 错误会崩溃
}

// ❌ 错误2: 在循环中创建新链
async function badChainReuse(): Promise<void> {
  const topics = ['AI', 'ML', 'DL'];

  for (const topic of topics) {
    // 错误：每次循环都创建新链
    const chain = new LLMChain({
      llm: new ChatOpenAI({ apiKey: 'key' }),
      prompt: PromptTemplate.fromTemplate('Tell me about {topic}')
    });
    await chain.call({ topic });
  }
}

// ❌ 错误3: 未清理 Agent 执行器
async function badAgentCleanup(): Promise<void> {
  while (true) {
    const executor = await createAgent();
    await executor.invoke({ input: 'query' });
    // 未释放资源，可能导致内存泄漏
  }
}

// ❌ 错误4: 未处理工具错误
async function badToolError(): Promise<void> {
  const tool = new Tool({
    name: 'risky_tool',
    func: async () => {
      throw new Error('Tool failed');
    }
  });

  const agent = new AgentExecutor({ agent: null as any, tools: [tool] });
  // 工具错误可能导致 Agent 崩溃
}

// ❌ 错误5: 文档分割参数不当
async function badDocumentSplitting(): Promise<void> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10,      // 太小
    chunkOverlap: 100   // 比 chunkSize 还大
  });
  // 会产生大量小片段，影响检索质量
}
```

---


## 3. RAG架构

### 3.1 向量数据库

#### 核心概念

RAG (Retrieval-Augmented Generation) 通过检索相关文档来增强 LLM 的生成能力。向量数据库是 RAG 的核心组件，用于高效存储和检索向量嵌入。

**形式化定义**:

- 文档集合: $\mathcal{D} = \{d_1, d_2, ..., d_n\}$
- 嵌入函数: $E: \mathcal{D} \rightarrow \mathbb{R}^d$
- 相似度函数: $sim: \mathbb{R}^d \times \mathbb{R}^d \rightarrow [0, 1]$
- 检索: $Retrieve(q, k) = \arg\max_{D' \subset \mathcal{D}, |D'|=k} \sum_{d \in D'} sim(E(q), E(d))$

#### 完整实现示例

```typescript
// ============================================
// Pinecone 向量数据库
// ============================================

import { Pinecone } from '@pinecone-database/pinecone';

interface PineconeConfig {
  apiKey: string;
  environment: string;
}

class PineconeVectorStore {
  private client: Pinecone;
  private indexName: string;

  constructor(config: PineconeConfig, indexName: string) {
    this.client = new Pinecone({
      apiKey: config.apiKey
    });
    this.indexName = indexName;
  }

  // 创建索引
  async createIndex(
    dimension: number = 1536,
    metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine'
  ): Promise<void> {
    await this.client.createIndex({
      name: this.indexName,
      dimension,
      metric,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
  }

  // 插入向量
  async upsert(
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, unknown>;
    }>,
    namespace?: string
  ): Promise<void> {
    const index = this.client.index(this.indexName);
    const targetNamespace = namespace ? index.namespace(namespace) : index;

    // 批量插入（Pinecone 限制每批最多 100 个）
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await targetNamespace.upsert(batch);
    }
  }

  // 相似度搜索
  async search(
    query: number[],
    topK: number = 5,
    filter?: Record<string, unknown>,
    namespace?: string
  ): Promise<Array<{
    id: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>> {
    const index = this.client.index(this.indexName);
    const targetNamespace = namespace ? index.namespace(namespace) : index;

    const results = await targetNamespace.query({
      vector: query,
      topK,
      filter,
      includeMetadata: true
    });

    return results.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata
    })) || [];
  }

  // 删除向量
  async delete(ids: string[], namespace?: string): Promise<void> {
    const index = this.client.index(this.indexName);
    const targetNamespace = namespace ? index.namespace(namespace) : index;
    await targetNamespace.deleteMany(ids);
  }

  // 删除命名空间
  async deleteNamespace(namespace: string): Promise<void> {
    const index = this.client.index(this.indexName);
    await index.namespace(namespace).deleteAll();
  }
}

// ============================================
// Weaviate 向量数据库
// ============================================

import weaviate, { WeaviateClient } from 'weaviate-client';

class WeaviateVectorStore {
  private client: WeaviateClient;
  private className: string;

  constructor(host: string, className: string) {
    this.client = weaviate.client({
      scheme: 'http',
      host
    });
    this.className = className;
  }

  // 创建 Schema
  async createSchema(vectorizer: string = 'none'): Promise<void> {
    const schema = {
      class: this.className,
      vectorizer,
      moduleConfig: {
        'text2vec-openai': {},
        'text2vec-cohere': {},
        'text2vec-huggingface': {}
      },
      properties: [
        {
          name: 'content',
          dataType: ['text'],
          description: 'The content of the document'
        },
        {
          name: 'source',
          dataType: ['text'],
          description: 'Source of the document'
        },
        {
          name: 'metadata',
          dataType: ['object']
        }
      ]
    };

    await this.client.schema.classCreator().withClass(schema).do();
  }

  // 插入对象
  async insert(
    objects: Array<{
      id?: string;
      vector: number[];
      properties: {
        content: string;
        source?: string;
        metadata?: Record<string, unknown>;
      };
    }>
  ): Promise<void> {
    const batcher = this.client.batch.objectsBatcher();

    for (const obj of objects) {
      batcher.withObject({
        class: this.className,
        id: obj.id,
        vector: obj.vector,
        properties: obj.properties
      });
    }

    await batcher.do();
  }

  // 向量搜索
  async search(
    vector: number[],
    limit: number = 5,
    certainty?: number
  ): Promise<Array<{
    id: string;
    certainty: number;
    properties: Record<string, unknown>;
  }>> {
    const builder = this.client.graphql
      .get()
      .withClassName(this.className)
      .withFields('content source _additional { id certainty }')
      .withNearVector({ vector, certainty });

    const result = await builder.do();

    return result.data.Get[this.className].map((item: any) => ({
      id: item._additional.id,
      certainty: item._additional.certainty,
      properties: {
        content: item.content,
        source: item.source
      }
    }));
  }

  // 混合搜索（向量 + 关键词）
  async hybridSearch(
    query: string,
    vector: number[],
    alpha: number = 0.5, // 0 = 纯关键词, 1 = 纯向量
    limit: number = 5
  ): Promise<Array<{
    id: string;
    score: number;
    properties: Record<string, unknown>;
  }>> {
    const result = await this.client.graphql
      .get()
      .withClassName(this.className)
      .withFields('content source _additional { id score }')
      .withHybrid({ query, vector, alpha })
      .withLimit(limit)
      .do();

    return result.data.Get[this.className].map((item: any) => ({
      id: item._additional.id,
      score: item._additional.score,
      properties: {
        content: item.content,
        source: item.source
      }
    }));
  }
}

// ============================================
// Chroma 向量数据库（本地/自托管）
// ============================================

import { ChromaClient, Collection } from 'chromadb';

class ChromaVectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;

  constructor(host: string = 'http://localhost:8000', collectionName: string) {
    this.client = new ChromaClient({ path: host });
    this.collectionName = collectionName;
  }

  // 获取或创建集合
  async initialize(): Promise<void> {
    this.collection = await this.client.getOrCreateCollection({
      name: this.collectionName,
      metadata: { 'hnsw:space': 'cosine' }
    });
  }

  // 添加文档
  async add(
    ids: string[],
    embeddings: number[][],
    documents: string[],
    metadatas?: Record<string, unknown>[]
  ): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    await this.collection.add({
      ids,
      embeddings,
      documents,
      metadatas
    });
  }

  // 查询
  async query(
    queryEmbeddings: number[][],
    nResults: number = 5,
    where?: Record<string, unknown>
  ): Promise<{
    ids: string[][];
    distances: number[][];
    documents: (string | null)[][];
    metadatas: (Record<string, unknown> | null)[][];
  }> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    return this.collection.query({
      queryEmbeddings,
      nResults,
      where
    });
  }

  // 删除
  async delete(ids: string[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    await this.collection.delete({ ids });
  }

  // 获取集合统计
  async count(): Promise<number> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    return this.collection.count();
  }
}

// ============================================
// Qdrant 向量数据库
// ============================================

import { QdrantClient } from '@qdrant/js-client-rest';

class QdrantVectorStore {
  private client: QdrantClient;
  private collectionName: string;

  constructor(url: string, apiKey?: string, collectionName: string = 'documents') {
    this.client = new QdrantClient({
      url,
      apiKey
    });
    this.collectionName = collectionName;
  }

  // 创建集合
  async createCollection(
    vectorSize: number = 1536,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
  ): Promise<void> {
    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: vectorSize,
        distance
      }
    });
  }

  // 插入点
  async upsert(
    points: Array<{
      id: string | number;
      vector: number[];
      payload?: Record<string, unknown>;
    }>
  ): Promise<void> {
    await this.client.upsert(this.collectionName, {
      points: points.map(p => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload
      }))
    });
  }

  // 搜索
  async search(
    vector: number[],
    limit: number = 5,
    filter?: Record<string, unknown>
  ): Promise<Array<{
    id: string | number;
    score: number;
    payload?: Record<string, unknown>;
  }>> {
    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      filter,
      withPayload: true
    });

    return results.map(r => ({
      id: r.id,
      score: r.score,
      payload: r.payload as Record<string, unknown>
    }));
  }

  // 带过滤的搜索
  async searchWithFilter(
    vector: number[],
    filterConditions: Array<{
      key: string;
      match?: { value: string | number | boolean };
      range?: { gt?: number; gte?: number; lt?: number; lte?: number };
    }>,
    limit: number = 5
  ): Promise<Array<{
    id: string | number;
    score: number;
    payload?: Record<string, unknown>;
  }>> {
    const mustConditions = filterConditions.map(fc => {
      if (fc.match) {
        return { key: fc.key, match: fc.match };
      }
      if (fc.range) {
        return { key: fc.key, range: fc.range };
      }
      return null;
    }).filter(Boolean);

    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      filter: { must: mustConditions },
      withPayload: true
    });

    return results.map(r => ({
      id: r.id,
      score: r.score,
      payload: r.payload as Record<string, unknown>
    }));
  }
}

// ============================================
// 内存向量存储（用于开发和测试）
// ============================================

interface VectorDocument {
  id: string;
  vector: number[];
  content: string;
  metadata: Record<string, unknown>;
}

class InMemoryVectorStore {
  private documents: VectorDocument[] = [];

  add(documents: VectorDocument[]): void {
    this.documents.push(...documents);
  }

  search(
    query: number[],
    topK: number = 5,
    metric: 'cosine' | 'euclidean' = 'cosine'
  ): Array<VectorDocument & { score: number }> {
    const scored = this.documents.map(doc => ({
      ...doc,
      score: metric === 'cosine'
        ? this.cosineSimilarity(query, doc.vector)
        : this.euclideanDistance(query, doc.vector)
    }));

    return scored
      .sort((a, b) => metric === 'cosine' ? b.score - a.score : a.score - b.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  delete(id: string): void {
    this.documents = this.documents.filter(doc => doc.id !== id);
  }

  clear(): void {
    this.documents = [];
  }

  count(): number {
    return this.documents.length;
  }
}
```

---

### 3.2 嵌入模型

#### 核心概念

嵌入模型将文本转换为高维向量，使得语义相似的文本在向量空间中距离较近。

**形式化定义**:

- 嵌入函数: $E: \mathcal{T} \rightarrow \mathbb{R}^d$
- 其中 $\mathcal{T}$ 为文本空间，$d$ 为嵌入维度
- 性质: $sim(t_1, t_2) \approx sim(E(t_1), E(t_2))$

#### 完整实现示例

```typescript
// ============================================
// OpenAI 嵌入
// ============================================

import OpenAI from 'openai';

class OpenAIEmbedder {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts
    });

    return response.data.map(d => d.embedding);
  }

  // 带维度缩减的嵌入
  async embedWithDimensions(
    text: string,
    dimensions: number
  ): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
      dimensions
    });

    return response.data[0].embedding;
  }
}

> **Note:** As of 2026, the package has been rebranded from `@xenova/transformers` to `@huggingface/transformers` (v3+). The legacy `@xenova/transformers` package remains on v2 only.

// ============================================
// HuggingFace 嵌入（本地）
// ============================================

import { pipeline, FeatureExtractionPipeline } from '@huggingface/transformers';

class HuggingFaceEmbedder {
  private extractor: FeatureExtractionPipeline | null = null;
  private modelName: string;

  constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
  }

  async initialize(): Promise<void> {
    this.extractor = await pipeline(
      'feature-extraction',
      this.modelName
    );
  }

  async embed(text: string): Promise<number[]> {
    if (!this.extractor) {
      throw new Error('Embedder not initialized');
    }

    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

// ============================================
// Ollama 嵌入（本地）
// ============================================

class OllamaEmbedder {
  private baseURL: string;
  private model: string;

  constructor(
    model: string = 'nomic-embed-text',
    baseURL: string = 'http://localhost:11434'
  ) {
    this.model = model;
    this.baseURL = baseURL;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

// ============================================
// 嵌入模型选择器
// ============================================

interface Embedder {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

class EmbeddingProvider {
  private embedders: Map<string, Embedder> = new Map();
  private defaultEmbedder: string;

  constructor(defaultEmbedder: string = 'openai') {
    this.defaultEmbedder = defaultEmbedder;
  }

  register(name: string, embedder: Embedder): void {
    this.embedders.set(name, embedder);
  }

  async embed(text: string, provider?: string): Promise<number[]> {
    const embedder = this.embedders.get(provider || this.defaultEmbedder);
    if (!embedder) {
      throw new Error(`Embedder '${provider}' not found`);
    }
    return embedder.embed(text);
  }

  async embedBatch(
    texts: string[],
    provider?: string
  ): Promise<number[][]> {
    const embedder = this.embedders.get(provider || this.defaultEmbedder);
    if (!embedder) {
      throw new Error(`Embedder '${provider}' not found`);
    }
    return embedder.embedBatch(texts);
  }
}

// ============================================
// 嵌入缓存
// ============================================

import crypto from 'crypto';

class CachedEmbedder implements Embedder {
  private embedder: Embedder;
  private cache: Map<string, number[]>;
  private maxCacheSize: number;

  constructor(embedder: Embedder, maxCacheSize: number = 10000) {
    this.embedder = embedder;
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  async embed(text: string): Promise<number[]> {
    const hash = this.hashText(text);

    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    const embedding = await this.embedder.embed(text);
    this.setCache(hash, embedding);

    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const toEmbed: { text: string; index: number }[] = [];

    // 检查缓存
    for (let i = 0; i < texts.length; i++) {
      const hash = this.hashText(texts[i]);
      if (this.cache.has(hash)) {
        results[i] = this.cache.get(hash)!;
      } else {
        toEmbed.push({ text: texts[i], index: i });
      }
    }

    // 批量嵌入未缓存的文本
    if (toEmbed.length > 0) {
      const embeddings = await this.embedder.embedBatch(
        toEmbed.map(t => t.text)
      );

      for (let i = 0; i < toEmbed.length; i++) {
        const { text, index } = toEmbed[i];
        const embedding = embeddings[i];
        results[index] = embedding;
        this.setCache(this.hashText(text), embedding);
      }
    }

    return results;
  }

  private hashText(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  private setCache(key: string, value: number[]): void {
    if (this.cache.size >= this.maxCacheSize) {
      // LRU: 删除最早的条目
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}
```

---

### 3.3 文档分块策略

#### 核心概念

文档分块是将长文档分割成适合嵌入和检索的小块。分块策略直接影响检索质量。

**分块策略**:

1. **固定大小**: 固定字符/Token 数
2. **递归**: 按分隔符层次分割
3. **语义**: 基于语义边界分割
4. **Agent-based**: 使用 LLM 决定分割点

#### 完整实现示例

```typescript
// ============================================
// 文档分块器
// ============================================

interface Chunk {
  content: string;
  metadata: {
    index: number;
    start: number;
    end: number;
    source?: string;
  };
}

interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

class DocumentChunker {
  private config: ChunkingConfig;

  constructor(config: ChunkingConfig) {
    this.config = {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
      ...config
    };
  }

  // 固定大小分块
  chunkFixedSize(document: string): Chunk[] {
    const chunks: Chunk[] = [];
    const { chunkSize, chunkOverlap } = this.config;

    let start = 0;
    let index = 0;

    while (start < document.length) {
      const end = Math.min(start + chunkSize, document.length);
      const content = document.slice(start, end);

      chunks.push({
        content,
        metadata: {
          index,
          start,
          end
        }
      });

      start += chunkSize - chunkOverlap;
      index++;
    }

    return chunks;
  }

  // 递归分块
  chunkRecursive(document: string, source?: string): Chunk[] {
    const separators = this.config.separators || ['\n\n', '\n', '. ', ' ', ''];
    return this._recursiveChunk(document, separators, 0, source);
  }

  private _recursiveChunk(
    text: string,
    separators: string[],
    separatorIndex: number,
    source?: string,
    startOffset: number = 0
  ): Chunk[] {
    const { chunkSize, chunkOverlap } = this.config;
    const chunks: Chunk[] = [];

    if (text.length <= chunkSize) {
      return [{
        content: text,
        metadata: {
          index: 0,
          start: startOffset,
          end: startOffset + text.length,
          source
        }
      }];
    }

    if (separatorIndex >= separators.length) {
      // 没有更多分隔符，使用固定大小
      return this.chunkFixedSize(text).map((chunk, i) => ({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          start: startOffset + chunk.metadata.start,
          end: startOffset + chunk.metadata.end,
          source
        }
      }));
    }

    const separator = separators[separatorIndex];
    const parts = text.split(separator);

    let currentChunk = '';
    let currentStart = startOffset;
    let chunkIndex = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const separatorLen = i < parts.length - 1 ? separator.length : 0;

      if (currentChunk.length + part.length + separatorLen <= chunkSize) {
        currentChunk += (currentChunk ? separator : '') + part;
      } else {
        if (currentChunk) {
          chunks.push({
            content: currentChunk,
            metadata: {
              index: chunkIndex++,
              start: currentStart,
              end: currentStart + currentChunk.length,
              source
            }
          });
        }

        // 处理剩余部分
        if (part.length > chunkSize) {
          // 递归分割
          const subChunks = this._recursiveChunk(
            part,
            separators,
            separatorIndex + 1,
            source,
            currentStart + (currentChunk ? currentChunk.length + separator.length : 0)
          );
          chunks.push(...subChunks.map(c => ({
            ...c,
            metadata: { ...c.metadata, index: chunkIndex++ }
          })));
          currentChunk = '';
        } else {
          currentChunk = part;
        }

        currentStart = startOffset + chunks.reduce((sum, c) => sum + c.content.length, 0) +
                      (chunks.length * separator.length);
      }
    }

    if (currentChunk) {
      chunks.push({
        content: currentChunk,
        metadata: {
          index: chunkIndex,
          start: currentStart,
          end: currentStart + currentChunk.length,
          source
        }
      });
    }

    return chunks;
  }

  // Markdown 特定分块
  chunkMarkdown(markdown: string, source?: string): Chunk[] {
    // 按标题分割
    const headerRegex = /^(#{1,6}\s.+)$/gm;
    const sections: { header: string; content: string; start: number }[] = [];

    let match;
    let lastIndex = 0;
    let lastHeader = '';

    while ((match = headerRegex.exec(markdown)) !== null) {
      if (lastHeader) {
        sections.push({
          header: lastHeader,
          content: markdown.slice(lastIndex, match.index),
          start: lastIndex
        });
      }
      lastHeader = match[1];
      lastIndex = match.index;
    }

    // 添加最后一部分
    if (lastHeader) {
      sections.push({
        header: lastHeader,
        content: markdown.slice(lastIndex),
        start: lastIndex
      });
    }

    // 对每个部分进行递归分块
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const sectionChunks = this._recursiveChunk(
        section.content,
        this.config.separators || ['\n\n', '\n', '. ', ' ', ''],
        0,
        source,
        section.start
      );

      for (const chunk of sectionChunks) {
        chunks.push({
          ...chunk,
          metadata: {
            ...chunk.metadata,
            index: chunkIndex++,
            header: section.header
          }
        });
      }
    }

    return chunks;
  }

  // 代码特定分块
  chunkCode(code: string, language: string, source?: string): Chunk[] {
    // 按函数/类定义分割
    const patterns: Record<string, RegExp> = {
      javascript: /(?:function|class|const|let|var)\s+\w+\s*[\({]/g,
      python: /(?:def|class)\s+\w+\s*[\(:]/g,
      typescript: /(?:function|class|interface|const|let|var)\s+\w+\s*[\({<]/g
    };

    const pattern = patterns[language] || patterns.javascript;
    const chunks: Chunk[] = [];

    let match;
    let lastIndex = 0;
    let chunkIndex = 0;

    while ((match = pattern.exec(code)) !== null) {
      if (lastIndex > 0) {
        const content = code.slice(lastIndex, match.index);
        if (content.trim()) {
          chunks.push({
            content: content.trim(),
            metadata: {
              index: chunkIndex++,
              start: lastIndex,
              end: match.index,
              source,
              language
            }
          });
        }
      }
      lastIndex = match.index;
    }

    // 添加最后一部分
    if (lastIndex < code.length) {
      const content = code.slice(lastIndex).trim();
      if (content) {
        chunks.push({
          content,
          metadata: {
            index: chunkIndex,
            start: lastIndex,
            end: code.length,
            source,
            language
          }
        });
      }
    }

    return chunks;
  }
}

// ============================================
// 分块评估
// ============================================

class ChunkingEvaluator {
  // 评估分块质量
  evaluateChunks(chunks: Chunk[]): {
    totalChunks: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    emptyChunks: number;
    score: number;
  } {
    const sizes = chunks.map(c => c.content.length);
    const totalSize = sizes.reduce((sum, s) => sum + s, 0);
    const emptyChunks = chunks.filter(c => !c.content.trim()).length;

    // 计算分数（越小越好）
    const avgSize = totalSize / chunks.length;
    const variance = sizes.reduce((sum, s) => sum + Math.pow(s - avgSize, 2), 0) / chunks.length;
    const stdDev = Math.sqrt(variance);

    // 分数基于：块大小一致性、无空块
    const score = stdDev + emptyChunks * 1000;

    return {
      totalChunks: chunks.length,
      avgChunkSize: Math.round(avgSize),
      minChunkSize: Math.min(...sizes),
      maxChunkSize: Math.max(...sizes),
      emptyChunks,
      score
    };
  }

  // 找到最佳分块参数
  findOptimalParams(
    document: string,
    targetChunkSize: number = 1000
  ): { chunkSize: number; chunkOverlap: number; score: number } {
    const sizes = [500, 1000, 1500, 2000];
    const overlaps = [0, 100, 200, 300];

    let bestParams = { chunkSize: 1000, chunkOverlap: 200, score: Infinity };

    for (const size of sizes) {
      for (const overlap of overlaps) {
        if (overlap >= size) continue;

        const chunker = new DocumentChunker({ chunkSize: size, chunkOverlap: overlap });
        const chunks = chunker.chunkRecursive(document);
        const evaluation = this.evaluateChunks(chunks);

        // 优先选择接近目标大小的配置
        const sizePenalty = Math.abs(evaluation.avgChunkSize - targetChunkSize) / targetChunkSize;
        const totalScore = evaluation.score + sizePenalty * 100;

        if (totalScore < bestParams.score) {
          bestParams = { chunkSize: size, chunkOverlap: overlap, score: totalScore };
        }
      }
    }

    return bestParams;
  }
}
```

---

### 3.4 检索和重排序

#### 核心概念

检索是从向量数据库中找到相关文档的过程。重排序使用更精确的模型对初步检索结果进行重新排序。

**检索流程**:

1. 查询嵌入: $q_{emb} = E(q)$
2. 向量搜索: $D_{candidates} = TopK(q_{emb}, \mathcal{D}, k)$
3. 重排序: $D_{ranked} = Rerank(q, D_{candidates})$
4. 选择: $D_{final} = D_{ranked}[0:n]$

#### 完整实现示例

```typescript
// ============================================
// 检索器
// ============================================

interface RetrievedDocument {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

interface SearchResult {
  documents: RetrievedDocument[];
  totalCandidates: number;
  queryTime: number;
}

class VectorRetriever {
  private vectorStore: any; // 具体的向量数据库客户端
  private embedder: Embedder;

  constructor(vectorStore: any, embedder: Embedder) {
    this.vectorStore = vectorStore;
    this.embedder = embedder;
  }

  async retrieve(
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, unknown>;
      minScore?: number;
    } = {}
  ): Promise<SearchResult> {
    const startTime = performance.now();
    const { topK = 5, filter, minScore = 0.5 } = options;

    // 嵌入查询
    const queryEmbedding = await this.embedder.embed(query);

    // 向量搜索
    const candidates = await this.vectorStore.search(
      queryEmbedding,
      topK * 2, // 检索更多候选用于过滤
      filter
    );

    // 过滤低分结果
    const filtered = candidates.filter((c: any) => c.score >= minScore);

    const queryTime = performance.now() - startTime;

    return {
      documents: filtered.slice(0, topK).map((c: any) => ({
        id: c.id,
        content: c.metadata?.content || '',
        score: c.score,
        metadata: c.metadata || {}
      })),
      totalCandidates: candidates.length,
      queryTime
    };
  }

  // 混合搜索（向量 + 关键词）
  async hybridRetrieve(
    query: string,
    options: {
      topK?: number;
      vectorWeight?: number;
      keywordWeight?: number;
    } = {}
  ): Promise<SearchResult> {
    const { topK = 5, vectorWeight = 0.7, keywordWeight = 0.3 } = options;

    // 向量搜索
    const vectorResults = await this.retrieve(query, { topK: topK * 2 });

    // 关键词搜索（简化实现）
    const keywordResults = await this.keywordSearch(query, topK * 2);

    // 融合结果
    const fused = this.fuseResults(
      vectorResults.documents,
      keywordResults,
      vectorWeight,
      keywordWeight
    );

    return {
      documents: fused.slice(0, topK),
      totalCandidates: vectorResults.totalCandidates + keywordResults.length,
      queryTime: vectorResults.queryTime
    };
  }

  private async keywordSearch(
    query: string,
    topK: number
  ): Promise<RetrievedDocument[]> {
    // 简化的关键词搜索实现
    // 实际应用中应该使用 Elasticsearch、Meilisearch 等
    const keywords = query.toLowerCase().split(/\s+/);

    // 这里假设有一个获取所有文档的方法
    // 实际实现取决于具体的向量数据库
    return [];
  }

  private fuseResults(
    vectorResults: RetrievedDocument[],
    keywordResults: RetrievedDocument[],
    vectorWeight: number,
    keywordWeight: number
  ): RetrievedDocument[] {
    const scores = new Map<string, { doc: RetrievedDocument; score: number }>();

    // 归一化并加权向量分数
    const maxVectorScore = Math.max(...vectorResults.map(r => r.score), 1);
    for (const doc of vectorResults) {
      const normalizedScore = doc.score / maxVectorScore;
      scores.set(doc.id, {
        doc,
        score: normalizedScore * vectorWeight
      });
    }

    // 归一化并加权关键词分数
    const maxKeywordScore = Math.max(...keywordResults.map(r => r.score), 1);
    for (const doc of keywordResults) {
      const normalizedScore = doc.score / maxKeywordScore;
      if (scores.has(doc.id)) {
        scores.get(doc.id)!.score += normalizedScore * keywordWeight;
      } else {
        scores.set(doc.id, {
          doc,
          score: normalizedScore * keywordWeight
        });
      }
    }

    // 按融合分数排序
    return Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .map(s => ({ ...s.doc, score: s.score }));
  }
}

// ============================================
// 重排序器
// ============================================

interface Reranker {
  rerank(query: string, documents: RetrievedDocument[]): Promise<RetrievedDocument[]>;
}

// 基于 LLM 的重排序
class LLMReranker implements Reranker {
  private llmClient: any; // OpenAI 或其他 LLM 客户端

  constructor(llmClient: any) {
    this.llmClient = llmClient;
  }

  async rerank(
    query: string,
    documents: RetrievedDocument[]
  ): Promise<RetrievedDocument[]> {
    const prompt = `Given the query and the following documents, rank them by relevance.

Query: ${query}

Documents:
${documents.map((d, i) => `[${i + 1}] ${d.content.slice(0, 200)}...`).join('\n\n')}

Return the document numbers in order of relevance (most relevant first), one per line.`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    // 解析排名
    const lines = response.split('\n').filter((l: string) => l.trim());
    const ranked: RetrievedDocument[] = [];

    for (const line of lines) {
      const match = line.match(/\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        if (documents[idx] && !ranked.includes(documents[idx])) {
          ranked.push(documents[idx]);
        }
      }
    }

    // 添加未排名的文档
    for (const doc of documents) {
      if (!ranked.includes(doc)) {
        ranked.push(doc);
      }
    }

    // 重新分配分数
    return ranked.map((doc, i) => ({
      ...doc,
      score: 1 - i / ranked.length // 递减分数
    }));
  }
}

// 基于交叉编码器的重排序（使用 HuggingFace）
class CrossEncoderReranker implements Reranker {
  private model: any;

  async initialize(modelName: string = 'Xenova/ms-marco-MiniLM-L-6-v2'): Promise<void> {
    const { pipeline } = await import('@huggingface/transformers');
    this.model = await pipeline('text-classification', modelName);
  }

  async rerank(
    query: string,
    documents: RetrievedDocument[]
  ): Promise<RetrievedDocument[]> {
    if (!this.model) {
      throw new Error('Reranker not initialized');
    }

    // 为每个文档计算相关性分数
    const pairs = documents.map(d => ({
      text: query,
      text_pair: d.content.slice(0, 512) // 限制长度
    }));

    const results = await this.model(pairs);

    // 结合原始分数和重排序分数
    const scored = documents.map((doc, i) => ({
      ...doc,
      rerankScore: results[i].label === 'LABEL_1' ? results[i].score : 1 - results[i].score
    }));

    // 融合分数
    return scored
      .map(d => ({
        ...d,
        score: d.score * 0.3 + d.rerankScore * 0.7
      }))
      .sort((a, b) => b.score - a.score);
  }
}

// ============================================
// 完整的 RAG 系统
// ============================================

class RAGSystem {
  private retriever: VectorRetriever;
  private reranker?: Reranker;
  private llmClient: any;

  constructor(
    retriever: VectorRetriever,
    llmClient: any,
    reranker?: Reranker
  ) {
    this.retriever = retriever;
    this.llmClient = llmClient;
    this.reranker = reranker;
  }

  async query(
    question: string,
    options: {
      topK?: number;
      useReranking?: boolean;
      includeSources?: boolean;
    } = {}
  ): Promise<{
    answer: string;
    sources?: RetrievedDocument[];
    retrievalTime: number;
  }> {
    const { topK = 5, useReranking = true, includeSources = true } = options;

    // 1. 检索
    const retrievalStart = performance.now();
    let results = await this.retriever.retrieve(question, { topK: topK * 2 });

    // 2. 重排序
    if (useReranking && this.reranker) {
      results.documents = await this.reranker.rerank(
        question,
        results.documents
      );
    }

    const retrievalTime = performance.now() - retrievalStart;
    const topDocuments = results.documents.slice(0, topK);

    // 3. 生成答案
    const context = topDocuments
      .map((d, i) => `[${i + 1}] ${d.content}`)
      .join('\n\n');

    const prompt = `Answer the following question based on the provided context.

Context:
${context}

Question: ${question}

Provide a comprehensive answer. If the context doesn't contain enough information, say so.`;

    const answer = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    return {
      answer,
      sources: includeSources ? topDocuments : undefined,
      retrievalTime
    };
  }

  // 流式查询
  async *queryStream(
    question: string,
    options: {
      topK?: number;
      useReranking?: boolean;
    } = {}
  ): AsyncGenerator<
    | { type: 'retrieving' }
    | { type: 'sources'; documents: RetrievedDocument[] }
    | { type: 'content'; text: string }
    | { type: 'complete'; answer: string },
    void,
    unknown
  > {
    const { topK = 5, useReranking = true } = options;

    yield { type: 'retrieving' };

    // 检索
    let results = await this.retriever.retrieve(question, { topK: topK * 2 });

    if (useReranking && this.reranker) {
      results.documents = await this.reranker.rerank(
        question,
        results.documents
      );
    }

    const topDocuments = results.documents.slice(0, topK);
    yield { type: 'sources', documents: topDocuments };

    // 生成
    const context = topDocuments
      .map((d, i) => `[${i + 1}] ${d.content}`)
      .join('\n\n');

    const prompt = `Answer the following question based on the provided context.

Context:
${context}

Question: ${question}`;

    let fullAnswer = '';

    for await (const chunk of this.llmClient.chatStream([
      { role: 'user', content: prompt }
    ])) {
      fullAnswer += chunk;
      yield { type: 'content', text: chunk };
    }

    yield { type: 'complete', answer: fullAnswer };
  }
}

// ============================================
// 使用示例
// ============================================

async function ragExample(): Promise<void> {
  // 初始化组件
  const embedder = new OpenAIEmbedder(process.env.OPENAI_API_KEY!);

  // 假设使用内存向量存储进行演示
  const vectorStore = new InMemoryVectorStore();

  // 添加一些文档
  const documents = [
    {
      id: '1',
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
      metadata: { source: 'docs' }
    },
    {
      id: '2',
      content: 'JavaScript is the programming language of the Web.',
      metadata: { source: 'docs' }
    },
    {
      id: '3',
      content: 'Python is a high-level programming language known for its readability.',
      metadata: { source: 'docs' }
    }
  ];

  // 嵌入并存储
  for (const doc of documents) {
    const embedding = await embedder.embed(doc.content);
    vectorStore.add([{
      ...doc,
      vector: embedding,
      metadata: doc.metadata
    }]);
  }

  // 创建检索器
  const retriever = new VectorRetriever(vectorStore, embedder);

  // 检索
  const results = await retriever.retrieve('What is TypeScript?', { topK: 2 });
  console.log('Retrieved:', results);

  // 完整的 RAG 查询
  const llmClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });
  const rag = new RAGSystem(retriever, llmClient);

  const answer = await rag.query('What is TypeScript used for?');
  console.log('Answer:', answer.answer);
  console.log('Sources:', answer.sources);
}
```

---


## 4. AI应用架构模式

### 4.1 Agent模式

#### 核心概念

Agent 是能够自主决策并执行任务的 AI 系统。核心模式包括 ReAct (Reasoning + Acting) 和 Plan-and-Execute。

**形式化定义**:

- Agent: $\mathcal{A} = (S, A, T, R, \pi)$
- $S$: 状态空间
- $A$: 动作空间（工具集合）
- $T: S \times A \rightarrow S$: 状态转移
- $R: S \times A \rightarrow \mathbb{R}$: 奖励函数
- $\pi: S \rightarrow A$: 策略

#### 完整实现示例

```typescript
// ============================================
// ReAct Agent
// ============================================

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (params: Record<string, unknown>) => Promise<string>;
}

interface ReActStep {
  thought: string;
  action?: {
    name: string;
    input: Record<string, unknown>;
  };
  observation?: string;
  isFinal: boolean;
  answer?: string;
}

class ReActAgent {
  private llmClient: any;
  private tools: Map<string, Tool>;
  private maxIterations: number;

  constructor(
    llmClient: any,
    tools: Tool[],
    maxIterations: number = 10
  ) {
    this.llmClient = llmClient;
    this.tools = new Map(tools.map(t => [t.name, t]));
    this.maxIterations = maxIterations;
  }

  async run(query: string): Promise<{
    answer: string;
    steps: ReActStep[];
    iterations: number;
  }> {
    const steps: ReActStep[] = [];
    let iteration = 0;

    const systemPrompt = `You are a helpful assistant that can use tools to answer questions.
Available tools:
${Array.from(this.tools.values()).map(t =>
  `- ${t.name}: ${t.description}`
).join('\n')}

Follow this format:
Thought: [your reasoning about what to do]
Action: [tool name]
Action Input: [JSON input for the tool]

Or if you have the answer:
Thought: [your reasoning]
Final Answer: [your answer]`;

    while (iteration < this.maxIterations) {
      // 构建提示
      const prompt = this.buildPrompt(query, steps);

      // 获取 LLM 响应
      const response = await this.llmClient.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);

      // 解析响应
      const parsed = this.parseResponse(response);
      steps.push(parsed);

      if (parsed.isFinal) {
        return {
          answer: parsed.answer || 'No answer provided',
          steps,
          iterations: iteration + 1
        };
      }

      // 执行工具
      if (parsed.action) {
        const tool = this.tools.get(parsed.action.name);
        if (tool) {
          try {
            const observation = await tool.execute(parsed.action.input);
            steps[steps.length - 1].observation = observation;
          } catch (error) {
            steps[steps.length - 1].observation =
              `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        } else {
          steps[steps.length - 1].observation =
            `Error: Tool '${parsed.action.name}' not found`;
        }
      }

      iteration++;
    }

    return {
      answer: 'Maximum iterations reached without finding an answer',
      steps,
      iterations: iteration
    };
  }

  private buildPrompt(query: string, steps: ReActStep[]): string {
    let prompt = `Question: ${query}\n\n`;

    for (const step of steps) {
      prompt += `Thought: ${step.thought}\n`;
      if (step.action) {
        prompt += `Action: ${step.action.name}\n`;
        prompt += `Action Input: ${JSON.stringify(step.action.input)}\n`;
        prompt += `Observation: ${step.observation}\n\n`;
      }
    }

    prompt += 'Thought:';
    return prompt;
  }

  private parseResponse(response: string): ReActStep {
    const thoughtMatch = response.match(/Thought:\s*(.+?)(?=\n(?:Action|Final Answer):|$)/s);
    const actionMatch = response.match(/Action:\s*(\w+)/);
    const actionInputMatch = response.match(/Action Input:\s*(\{[\s\S]*\})/);
    const finalAnswerMatch = response.match(/Final Answer:\s*(.+)$/s);

    const thought = thoughtMatch?.[1]?.trim() || '';

    if (finalAnswerMatch) {
      return {
        thought,
        isFinal: true,
        answer: finalAnswerMatch[1].trim()
      };
    }

    if (actionMatch) {
      const actionName = actionMatch[1].trim();
      let actionInput: Record<string, unknown> = {};

      if (actionInputMatch) {
        try {
          actionInput = JSON.parse(actionInputMatch[1]);
        } catch {
          actionInput = { raw: actionInputMatch[1] };
        }
      }

      return {
        thought,
        action: {
          name: actionName,
          input: actionInput
        },
        isFinal: false
      };
    }

    return {
      thought,
      isFinal: true,
      answer: response.trim()
    };
  }
}

// ============================================
// Plan-and-Execute Agent
// ============================================

interface PlanStep {
  id: number;
  description: string;
  dependencies: number[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
}

class PlanAndExecuteAgent {
  private llmClient: any;
  private tools: Map<string, Tool>;

  constructor(llmClient: any, tools: Tool[]) {
    this.llmClient = llmClient;
    this.tools = new Map(tools.map(t => [t.name, t]));
  }

  async run(query: string): Promise<{
    answer: string;
    plan: PlanStep[];
  }> {
    // 1. 创建计划
    const plan = await this.createPlan(query);

    // 2. 执行计划
    for (const step of plan) {
      if (step.dependencies.some(depId =>
        plan.find(s => s.id === depId)?.status !== 'completed'
      )) {
        step.status = 'failed';
        step.result = 'Dependencies not met';
        continue;
      }

      step.status = 'in_progress';

      try {
        const result = await this.executeStep(step, plan, query);
        step.result = result;
        step.status = 'completed';
      } catch (error) {
        step.result = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        step.status = 'failed';
      }
    }

    // 3. 综合结果
    const answer = await this.synthesizeResults(query, plan);

    return { answer, plan };
  }

  private async createPlan(query: string): Promise<PlanStep[]> {
    const prompt = `Create a step-by-step plan to answer this question: "${query}"

Available tools:
${Array.from(this.tools.values()).map(t =>
  `- ${t.name}: ${t.description}`
).join('\n')}

Return the plan as a JSON array with this structure:
[
  {
    "id": 1,
    "description": "step description",
    "dependencies": [0] // IDs of steps this depends on, empty if none
  }
]`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    try {
      const planData = JSON.parse(response);
      return planData.map((s: any) => ({
        ...s,
        status: 'pending' as const
      }));
    } catch {
      // 回退：创建单步计划
      return [{
        id: 1,
        description: 'Answer the question directly',
        dependencies: [],
        status: 'pending'
      }];
    }
  }

  private async executeStep(
    step: PlanStep,
    plan: PlanStep[],
    originalQuery: string
  ): Promise<string> {
    const context = plan
      .filter(s => step.dependencies.includes(s.id) && s.result)
      .map(s => `Step ${s.id} result: ${s.result}`)
      .join('\n');

    const prompt = `Execute this step: ${step.description}

Original question: ${originalQuery}

${context ? `Previous results:\n${context}\n\n` : ''}
Execute the step and return the result.`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  private async synthesizeResults(
    query: string,
    plan: PlanStep[]
  ): Promise<string> {
    const completedSteps = plan.filter(s => s.status === 'completed');

    const prompt = `Based on the following completed steps, answer the original question.

Original question: ${query}

Completed steps:
${completedSteps.map(s =>
  `Step ${s.id}: ${s.description}\nResult: ${s.result}`
).join('\n\n')}

Provide a comprehensive answer.`;

    return this.llmClient.chat([{ role: 'user', content: prompt }]);
  }
}

// ============================================
// 工具实现示例
// ============================================

class ToolRegistry {
  static createCalculatorTool(): Tool {
    return {
      name: 'calculator',
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Mathematical expression to evaluate'
          }
        },
        required: ['expression']
      },
      execute: async (params) => {
        // 注意：实际应用中应使用安全的计算方式
        try {
          const result = Function('"use strict"; return (' + params.expression + ')')();
          return String(result);
        } catch {
          return 'Error: Invalid expression';
        }
      }
    };
  }

  static createSearchTool(searchFunction: (query: string) => Promise<string>): Tool {
    return {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          }
        },
        required: ['query']
      },
      execute: async (params) => {
        return searchFunction(params.query as string);
      }
    };
  }

  static createWeatherTool(weatherFunction: (city: string) => Promise<string>): Tool {
    return {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name'
          }
        },
        required: ['city']
      },
      execute: async (params) => {
        return weatherFunction(params.city as string);
      }
    };
  }
}

// ============================================
// 使用示例
// ============================================

async function agentExample(): Promise<void> {
  const llmClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });

  const tools = [
    ToolRegistry.createCalculatorTool(),
    ToolRegistry.createSearchTool(async (query) => {
      // 模拟搜索
      return `Search results for "${query}"`;
    }),
    ToolRegistry.createWeatherTool(async (city) => {
      // 模拟天气 API
      return `Weather in ${city}: Sunny, 25°C`;
    })
  ];

  // ReAct Agent
  const reactAgent = new ReActAgent(llmClient, tools);
  const reactResult = await reactAgent.run(
    'What is 1234 * 5678 and what is the weather in Tokyo?'
  );
  console.log('ReAct Answer:', reactResult.answer);
  console.log('Steps:', reactResult.steps);

  // Plan-and-Execute Agent
  const planAgent = new PlanAndExecuteAgent(llmClient, tools);
  const planResult = await planAgent.run(
    'Calculate the sum of 100, 200, and 300, then multiply by 2'
  );
  console.log('Plan Answer:', planResult.answer);
  console.log('Plan:', planResult.plan);
}
```

---

### 4.2 多Agent系统

#### 核心概念

多 Agent 系统由多个专门的 Agent 协作完成复杂任务。常见模式包括：

- **层级结构**: 主管 Agent 协调多个子 Agent
- **协作网络**: Agent 之间平等协作
- **竞争机制**: 多个 Agent 提出方案，选择最优

#### 完整实现示例

```typescript
// ============================================
// 主管-工作者模式
// ============================================

interface WorkerAgent {
  name: string;
  description: string;
  capabilities: string[];
  execute: (task: string, context?: string) => Promise<string>;
}

class SupervisorAgent {
  private llmClient: any;
  private workers: Map<string, WorkerAgent>;

  constructor(llmClient: any, workers: WorkerAgent[]) {
    this.llmClient = llmClient;
    this.workers = new Map(workers.map(w => [w.name, w]));
  }

  async delegate(task: string): Promise<{
    result: string;
    delegation: {
      selectedWorker: string;
      reasoning: string;
    };
  }> {
    // 1. 分析任务并选择最合适的 Worker
    const selection = await this.selectWorker(task);

    // 2. 委托任务
    const worker = this.workers.get(selection.selectedWorker);
    if (!worker) {
      throw new Error(`Worker '${selection.selectedWorker}' not found`);
    }

    const result = await worker.execute(task, selection.reasoning);

    return {
      result,
      delegation: selection
    };
  }

  private async selectWorker(task: string): Promise<{
    selectedWorker: string;
    reasoning: string;
  }> {
    const prompt = `Given the following task and available workers, select the best worker for the job.

Task: ${task}

Available workers:
${Array.from(this.workers.values()).map(w =>
  `- ${w.name}: ${w.description}\n  Capabilities: ${w.capabilities.join(', ')}`
).join('\n')}

Respond in JSON format:
{
  "selectedWorker": "worker name",
  "reasoning": "why this worker is best suited"
}`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch {
      // 回退：选择第一个 Worker
      const firstWorker = this.workers.keys().next().value;
      return {
        selectedWorker: firstWorker,
        reasoning: 'Fallback selection'
      };
    }
  }

  // 复杂任务分解和并行执行
  async executeComplexTask(task: string): Promise<{
    results: Array<{ worker: string; subtask: string; result: string }>;
    finalAnswer: string;
  }> {
    // 1. 分解任务
    const subtasks = await this.decomposeTask(task);

    // 2. 并行执行
    const executions = subtasks.map(async (subtask) => {
      const selection = await this.selectWorker(subtask);
      const worker = this.workers.get(selection.selectedWorker)!;
      const result = await worker.execute(subtask);

      return {
        worker: selection.selectedWorker,
        subtask,
        result
      };
    });

    const results = await Promise.all(executions);

    // 3. 综合结果
    const finalAnswer = await this.synthesizeResults(task, results);

    return { results, finalAnswer };
  }

  private async decomposeTask(task: string): Promise<string[]> {
    const prompt = `Break down this complex task into smaller, independent subtasks:

Task: ${task}

Respond with a JSON array of subtask descriptions.`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch {
      return [task]; // 无法分解，作为单任务处理
    }
  }

  private async synthesizeResults(
    originalTask: string,
    results: Array<{ worker: string; subtask: string; result: string }>
  ): Promise<string> {
    const prompt = `Synthesize the following subtask results into a final answer for the original task.

Original task: ${originalTask}

Subtask results:
${results.map(r =>
  `[${r.worker}] ${r.subtask}:\n${r.result}`
).join('\n\n')}

Provide a comprehensive final answer.`;

    return this.llmClient.chat([{ role: 'user', content: prompt }]);
  }
}

// ============================================
// 讨论式多 Agent
// ============================================

interface DiscussionMessage {
  agent: string;
  content: string;
  timestamp: Date;
}

class DiscussionMultiAgent {
  private llmClient: any;
  private agents: Array<{
    name: string;
    persona: string;
    expertise: string[];
  }>;
  private maxRounds: number;

  constructor(
    llmClient: any,
    agents: Array<{ name: string; persona: string; expertise: string[] }>,
    maxRounds: number = 3
  ) {
    this.llmClient = llmClient;
    this.agents = agents;
    this.maxRounds = maxRounds;
  }

  async discuss(topic: string): Promise<{
    discussion: DiscussionMessage[];
    consensus: string;
    disagreements: string[];
  }> {
    const discussion: DiscussionMessage[] = [];

    // 初始观点
    for (const agent of this.agents) {
      const response = await this.getAgentResponse(agent, topic, discussion);
      discussion.push({
        agent: agent.name,
        content: response,
        timestamp: new Date()
      });
    }

    // 讨论轮次
    for (let round = 0; round < this.maxRounds; round++) {
      for (const agent of this.agents) {
        const response = await this.getAgentResponse(agent, topic, discussion);
        discussion.push({
          agent: agent.name,
          content: response,
          timestamp: new Date()
        });
      }
    }

    // 分析共识和分歧
    const analysis = await this.analyzeDiscussion(topic, discussion);

    return {
      discussion,
      consensus: analysis.consensus,
      disagreements: analysis.disagreements
    };
  }

  private async getAgentResponse(
    agent: { name: string; persona: string; expertise: string[] },
    topic: string,
    discussion: DiscussionMessage[]
  ): Promise<string> {
    const discussionContext = discussion.length > 0
      ? `Previous discussion:\n${discussion.map(m =>
          `${m.agent}: ${m.content}`
        ).join('\n')}\n\n`
      : '';

    const prompt = `You are ${agent.name}, ${agent.persona}
Your expertise: ${agent.expertise.join(', ')}

${discussionContext}Topic: ${topic}

Provide your perspective on this topic. Be concise but thorough.`;

    return this.llmClient.chat([{ role: 'user', content: prompt }]);
  }

  private async analyzeDiscussion(
    topic: string,
    discussion: DiscussionMessage[]
  ): Promise<{ consensus: string; disagreements: string[] }> {
    const prompt = `Analyze the following discussion and identify:
1. Areas of consensus
2. Points of disagreement

Topic: ${topic}

Discussion:
${discussion.map(m => `${m.agent}: ${m.content}`).join('\n\n')}

Respond in JSON format:
{
  "consensus": "summary of agreed points",
  "disagreements": ["point 1", "point 2"]
}`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch {
      return {
        consensus: 'Unable to determine consensus',
        disagreements: []
      };
    }
  }
}

// ============================================
// 竞争式多 Agent
// ============================================

class CompetitiveMultiAgent {
  private llmClient: any;
  private agents: Array<{
    name: string;
    approach: string;
  }>;

  constructor(
    llmClient: any,
    agents: Array<{ name: string; approach: string }>
  ) {
    this.llmClient = llmClient;
    this.agents = agents;
  }

  async compete<T>(
    task: string,
    solutionParser: (response: string) => T
  ): Promise<{
    winner: string;
    solution: T;
    allSolutions: Array<{ agent: string; solution: T; evaluation: string }>;
  }> {
    // 1. 每个 Agent 提出解决方案
    const proposals = await Promise.all(
      this.agents.map(async (agent) => {
        const response = await this.getAgentProposal(agent, task);
        return {
          agent: agent.name,
          response,
          solution: solutionParser(response)
        };
      })
    );

    // 2. 评估每个方案
    const evaluations = await Promise.all(
      proposals.map(async (proposal) => ({
        ...proposal,
        evaluation: await this.evaluateSolution(task, proposal.response, proposals)
      }))
    );

    // 3. 选择最佳方案
    const winner = await this.selectWinner(task, evaluations);

    return {
      winner: winner.agent,
      solution: winner.solution,
      allSolutions: evaluations
    };
  }

  private async getAgentProposal(
    agent: { name: string; approach: string },
    task: string
  ): Promise<string> {
    const prompt = `You are ${agent.name}. Your approach: ${agent.approach}

Task: ${task}

Provide your solution to this task.`;

    return this.llmClient.chat([{ role: 'user', content: prompt }]);
  }

  private async evaluateSolution(
    task: string,
    solution: string,
    allProposals: Array<{ agent: string; response: string }>
  ): Promise<string> {
    const prompt = `Evaluate this solution to the task.

Task: ${task}

Solution to evaluate:
${solution}

Other proposals:
${allProposals.filter(p => p.response !== solution).map(p =>
  `- ${p.agent}: ${p.response.slice(0, 200)}...`
).join('\n')}

Provide a brief evaluation of strengths and weaknesses.`;

    return this.llmClient.chat([{ role: 'user', content: prompt }]);
  }

  private async selectWinner<T>(
    task: string,
    evaluations: Array<{ agent: string; solution: T; evaluation: string }>
  ): Promise<{ agent: string; solution: T }> {
    const prompt = `Select the best solution for this task.

Task: ${task}

Evaluated solutions:
${evaluations.map(e =>
  `${e.agent}:\nSolution: ${JSON.stringify(e.solution)}\nEvaluation: ${e.evaluation}`
).join('\n\n')}

Respond with just the name of the best agent.`;

    const response = await this.llmClient.chat([
      { role: 'user', content: prompt }
    ]);

    const winnerName = response.trim();
    const winner = evaluations.find(e => e.agent === winnerName) || evaluations[0];

    return { agent: winner.agent, solution: winner.solution };
  }
}

// ============================================
// 使用示例
// ============================================

async function multiAgentExample(): Promise<void> {
  const llmClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });

  // 主管-工作者模式
  const workers: WorkerAgent[] = [
    {
      name: 'researcher',
      description: 'Specializes in gathering and analyzing information',
      capabilities: ['web_search', 'data_analysis', 'summarization'],
      execute: async (task) => `Research result for: ${task}`
    },
    {
      name: 'writer',
      description: 'Specializes in creating written content',
      capabilities: ['writing', 'editing', 'creative_writing'],
      execute: async (task) => `Written content for: ${task}`
    },
    {
      name: 'coder',
      description: 'Specializes in writing and reviewing code',
      capabilities: ['programming', 'code_review', 'debugging'],
      execute: async (task) => `Code solution for: ${task}`
    }
  ];

  const supervisor = new SupervisorAgent(llmClient, workers);
  const delegation = await supervisor.delegate('Write a Python script to analyze stock data');
  console.log('Selected worker:', delegation.delegation.selectedWorker);
  console.log('Result:', delegation.result);

  // 讨论式多 Agent
  const discussionAgents = [
    {
      name: 'Optimist',
      persona: 'You always see the positive side of things',
      expertise: ['opportunity_identification', 'motivation']
    },
    {
      name: 'Pessimist',
      persona: 'You are cautious and identify potential risks',
      expertise: ['risk_assessment', 'critical_thinking']
    },
    {
      name: 'Realist',
      persona: 'You provide balanced, practical perspectives',
      expertise: ['practical_planning', 'feasibility_analysis']
    }
  ];

  const discussionSystem = new DiscussionMultiAgent(llmClient, discussionAgents);
  const discussion = await discussionSystem.discuss(
    'Should we adopt AI in our customer service?'
  );
  console.log('Consensus:', discussion.consensus);
  console.log('Disagreements:', discussion.disagreements);
}
```

---

### 4.3 多模态处理

#### 核心概念

多模态 AI 能够处理和生成多种类型的数据：文本、图像、音频、视频。

**形式化定义**:

- 模态: $m \in \{text, image, audio, video\}$
- 编码器: $E_m: \mathcal{X}_m \rightarrow \mathcal{Z}$
- 解码器: $D_m: \mathcal{Z} \rightarrow \mathcal{X}_m$
- 跨模态对齐: $sim(E_{m_1}(x_1), E_{m_2}(x_2))$

#### 完整实现示例

```typescript
// ============================================
// 多模态处理器
// ============================================

import OpenAI from 'openai';
import fs from 'fs';

interface MultimodalContent {
  type: 'text' | 'image' | 'audio';
  content: string; // text, base64 image, or audio path
  mimeType?: string;
}

class MultimodalProcessor {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // ============================================
  // 1. 图像理解
  // ============================================

  async analyzeImage(
    imageBase64: string,
    prompt: string,
    options: {
      detail?: 'low' | 'high' | 'auto';
      model?: string;
    } = {}
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: options.detail || 'auto'
              }
            }
          ]
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  }

  async analyzeImageUrl(
    imageUrl: string,
    prompt: string
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  }

  // 批量图像分析
  async analyzeImages(
    images: Array<{ image: string; isBase64: boolean }>,
    prompt: string
  ): Promise<string[]> {
    const results = await Promise.all(
      images.map(img =>
        img.isBase64
          ? this.analyzeImage(img.image, prompt)
          : this.analyzeImageUrl(img.image, prompt)
      )
    );
    return results;
  }

  // ============================================
  // 2. 图像生成
  // ============================================

  async generateImage(
    prompt: string,
    options: {
      model?: string;
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
    } = {}
  ): Promise<string> {
    const response = await this.openai.images.generate({
      model: options.model || 'dall-e-3',
      prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid'
    });

    return response.data[0]?.url || '';
  }

  // 编辑图像
  async editImage(
    imagePath: string,
    maskPath: string | null,
    prompt: string
  ): Promise<string> {
    const response = await this.openai.images.edit({
      image: fs.createReadStream(imagePath) as any,
      mask: maskPath ? fs.createReadStream(maskPath) as any : undefined,
      prompt
    });

    return response.data[0]?.url || '';
  }

  // ============================================
  // 3. 语音处理
  // ============================================

  async transcribeAudio(
    audioBuffer: Buffer,
    options: {
      model?: string;
      language?: string;
      prompt?: string;
    } = {}
  ): Promise<string> {
    const response = await this.openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
      model: options.model || 'whisper-1',
      language: options.language,
      prompt: options.prompt
    });

    return response.text;
  }

  async translateAudio(
    audioBuffer: Buffer,
    options: {
      model?: string;
      prompt?: string;
    } = {}
  ): Promise<string> {
    const response = await this.openai.audio.translations.create({
      file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
      model: options.model || 'whisper-1',
      prompt: options.prompt
    });

    return response.text;
  }

  async textToSpeech(
    text: string,
    options: {
      model?: string;
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed?: number;
    } = {}
  ): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({
      model: options.model || 'tts-1',
      voice: options.voice || 'alloy',
      input: text,
      speed: options.speed ?? 1.0
    });

    return Buffer.from(await response.arrayBuffer());
  }

  // ============================================
  // 4. 多模态对话
  // ============================================

  async multimodalChat(
    contents: MultimodalContent[],
    options: {
      model?: string;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const messageContent: any[] = contents.map(c => {
      if (c.type === 'text') {
        return { type: 'text', text: c.content };
      } else if (c.type === 'image') {
        return {
          type: 'image_url',
          image_url: {
            url: c.content.startsWith('http')
              ? c.content
              : `data:${c.mimeType || 'image/jpeg'};base64,${c.content}`
          }
        };
      }
      return { type: 'text', text: c.content };
    });

    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages: [{ role: 'user', content: messageContent }],
      max_tokens: options.maxTokens
    });

    return response.choices[0]?.message?.content || '';
  }

  // ============================================
  // 5. 视频处理（使用图像帧）
  // ============================================

  async analyzeVideoFrames(
    frameBase64s: string[],
    prompt: string
  ): Promise<string> {
    const content: any[] = [
      { type: 'text', text: prompt }
    ];

    for (const frame of frameBase64s.slice(0, 10)) { // 限制帧数
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${frame}`
        }
      });
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }]
    });

    return response.choices[0]?.message?.content || '';
  }
}

// ============================================
// 多模态 RAG
// ============================================

interface MultimodalDocument {
  id: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  metadata: Record<string, unknown>;
}

class MultimodalRAG {
  private textEmbedder: any;
  private imageEmbedder: any;
  private vectorStore: any;
  private llmClient: any;

  constructor(
    textEmbedder: any,
    imageEmbedder: any,
    vectorStore: any,
    llmClient: any
  ) {
    this.textEmbedder = textEmbedder;
    this.imageEmbedder = imageEmbedder;
    this.vectorStore = vectorStore;
    this.llmClient = llmClient;
  }

  async indexDocument(doc: MultimodalDocument): Promise<void> {
    const embeddings: Array<{ vector: number[]; content: string; metadata: any }> = [];

    if (doc.text) {
      const textEmbedding = await this.textEmbedder.embed(doc.text);
      embeddings.push({
        vector: textEmbedding,
        content: doc.text,
        metadata: { ...doc.metadata, type: 'text', docId: doc.id }
      });
    }

    if (doc.imageUrl) {
      const imageEmbedding = await this.imageEmbedder.embed(doc.imageUrl);
      embeddings.push({
        vector: imageEmbedding,
        content: `[Image: ${doc.imageUrl}]`,
        metadata: { ...doc.metadata, type: 'image', docId: doc.id, url: doc.imageUrl }
      });
    }

    // 存储到向量数据库
    for (const emb of embeddings) {
      await this.vectorStore.upsert([{
        id: `${doc.id}_${emb.metadata.type}`,
        values: emb.vector,
        metadata: emb.metadata
      }]);
    }
  }

  async query(
    query: string,
    queryImage?: string
  ): Promise<{
    answer: string;
    relevantDocuments: MultimodalDocument[];
  }> {
    // 嵌入查询
    const queryEmbeddings: number[][] = [];

    const textEmbedding = await this.textEmbedder.embed(query);
    queryEmbeddings.push(textEmbedding);

    if (queryImage) {
      const imageEmbedding = await this.imageEmbedder.embed(queryImage);
      queryEmbeddings.push(imageEmbedding);
    }

    // 检索
    const allResults: any[] = [];
    for (const embedding of queryEmbeddings) {
      const results = await this.vectorStore.search(embedding, 5);
      allResults.push(...results);
    }

    // 去重并排序
    const uniqueResults = this.deduplicateResults(allResults);

    // 生成答案
    const context = uniqueResults.map(r => r.metadata.content).join('\n\n');
    const answer = await this.llmClient.chat([
      {
        role: 'user',
        content: `Based on the following context, answer the question: ${query}\n\nContext:\n${context}`
      }
    ]);

    return {
      answer,
      relevantDocuments: uniqueResults.map(r => ({
        id: r.metadata.docId,
        metadata: r.metadata
      }))
    };
  }

  private deduplicateResults(results: any[]): any[] {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }).sort((a, b) => b.score - a.score);
  }
}

// ============================================
// 使用示例
// ============================================

async function multimodalExample(): Promise<void> {
  const processor = new MultimodalProcessor(process.env.OPENAI_API_KEY!);

  // 图像分析
  // const imageBase64 = fs.readFileSync('image.jpg').toString('base64');
  // const analysis = await processor.analyzeImage(
  //   imageBase64,
  //   'Describe what you see in this image.'
  // );
  // console.log(analysis);

  // 图像生成
  const generatedImageUrl = await processor.generateImage(
    'A serene Japanese garden with cherry blossoms'
  );
  console.log('Generated image:', generatedImageUrl);

  // 语音转文字
  // const audioBuffer = fs.readFileSync('audio.mp3');
  // const transcription = await processor.transcribeAudio(audioBuffer);
  // console.log(transcription);

  // 文字转语音
  const speech = await processor.textToSpeech(
    'Hello, this is a test of text to speech.',
    { voice: 'nova' }
  );
  // fs.writeFileSync('output.mp3', speech);

  // 多模态对话
  const response = await processor.multimodalChat([
    { type: 'text', content: 'What can you tell me about this image?' },
    // { type: 'image', content: imageBase64 }
  ]);
  console.log(response);
}
```

---

### 4.4 流式响应处理

#### 核心概念

流式响应允许实时接收 LLM 输出，提升用户体验和感知性能。

**形式化定义**:

- 流: 序列 $\{y_t\}_{t=1}^{T}$ 其中 $y_t$ 为第 $t$ 个 token
- 增量更新: $output_t = output_{t-1} \oplus y_t$

#### 完整实现示例

```typescript
// ============================================
// 流式响应处理器
// ============================================

import { EventEmitter } from 'events';

interface StreamChunk {
  content: string;
  isComplete: boolean;
  metadata?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

interface StreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  bufferSize?: number;
}

class StreamingHandler extends EventEmitter {
  private buffer: string = '';
  private fullText: string = '';
  private options: StreamOptions;

  constructor(options: StreamOptions = {}) {
    super();
    this.options = {
      bufferSize: 10,
      ...options
    };
  }

  processChunk(chunk: string): void {
    this.buffer += chunk;
    this.fullText += chunk;

    // 触发逐字回调
    this.options.onChunk?.(chunk);
    this.emit('chunk', chunk);

    // 缓冲区处理
    if (this.buffer.length >= (this.options.bufferSize || 10)) {
      this.emit('buffer', this.buffer);
      this.buffer = '';
    }
  }

  complete(metadata?: StreamChunk['metadata']): void {
    // 发送剩余缓冲区
    if (this.buffer.length > 0) {
      this.emit('buffer', this.buffer);
      this.buffer = '';
    }

    this.options.onComplete?.(this.fullText);
    this.emit('complete', this.fullText, metadata);
  }

  error(error: Error): void {
    this.options.onError?.(error);
    this.emit('error', error);
  }

  getFullText(): string {
    return this.fullText;
  }

  reset(): void {
    this.buffer = '';
    this.fullText = '';
  }
}

// ============================================
// Server-Sent Events (SSE) 处理器
// ============================================

import { Response } from 'express';

class SSEStreamHandler {
  private response: Response;
  private isClosed: boolean = false;

  constructor(response: Response) {
    this.response = response;
    this.setupSSE();
  }

  private setupSSE(): void {
    this.response.setHeader('Content-Type', 'text/event-stream');
    this.response.setHeader('Cache-Control', 'no-cache');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.setHeader('X-Accel-Buffering', 'no');

    this.response.on('close', () => {
      this.isClosed = true;
    });
  }

  send(data: unknown, event?: string): void {
    if (this.isClosed) return;

    if (event) {
      this.response.write(`event: ${event}\n`);
    }
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  sendChunk(content: string): void {
    this.send({ type: 'chunk', content });
  }

  sendComplete(fullText: string, metadata?: Record<string, unknown>): void {
    this.send({
      type: 'complete',
      content: fullText,
      metadata
    }, 'complete');
  }

  sendError(error: string): void {
    this.send({ type: 'error', error }, 'error');
  }

  close(): void {
    if (!this.isClosed) {
      this.response.end();
      this.isClosed = true;
    }
  }
}

// ============================================
// WebSocket 流处理器
// ============================================

import WebSocket from 'ws';

class WebSocketStreamHandler {
  private ws: WebSocket;
  private isClosed: boolean = false;

  constructor(ws: WebSocket) {
    this.ws = ws;

    ws.on('close', () => {
      this.isClosed = true;
    });
  }

  send(data: unknown): void {
    if (this.isClosed || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(data));
  }

  sendChunk(content: string): void {
    this.send({ type: 'chunk', content });
  }

  sendComplete(fullText: string, metadata?: Record<string, unknown>): void {
    this.send({
      type: 'complete',
      content: fullText,
      metadata
    });
  }

  sendError(error: string): void {
    this.send({ type: 'error', error });
  }
}

// ============================================
// 带打字机效果的流式显示
// ============================================

class TypewriterEffect {
  private element: HTMLElement | null = null;
  private speed: number;
  private queue: string[] = [];
  private isTyping: boolean = false;

  constructor(speed: number = 30) {
    this.speed = speed;
  }

  attach(element: HTMLElement): void {
    this.element = element;
  }

  addText(text: string): void {
    this.queue.push(...text.split(''));
    if (!this.isTyping) {
      this.typeNext();
    }
  }

  private typeNext(): void {
    if (!this.element || this.queue.length === 0) {
      this.isTyping = false;
      return;
    }

    this.isTyping = true;
    const char = this.queue.shift();
    this.element.textContent += char;

    setTimeout(() => this.typeNext(), this.speed);
  }

  clear(): void {
    if (this.element) {
      this.element.textContent = '';
    }
    this.queue = [];
    this.isTyping = false;
  }
}

// ============================================
// 流式聚合器（用于批处理）
// ============================================

class StreamingAggregator {
  private streams: Map<string, StreamingHandler> = new Map();
  private completedStreams: Set<string> = new Set();

  addStream(id: string, handler: StreamingHandler): void {
    this.streams.set(id, handler);

    handler.on('complete', () => {
      this.completedStreams.add(id);
      this.checkAllComplete();
    });
  }

  private checkAllComplete(): void {
    if (this.completedStreams.size === this.streams.size) {
      this.emit('allComplete', this.getAllResults());
    }
  }

  getAllResults(): Map<string, string> {
    const results = new Map<string, string>();
    for (const [id, handler] of this.streams) {
      results.set(id, handler.getFullText());
    }
    return results;
  }

  reset(): void {
    this.streams.clear();
    this.completedStreams.clear();
  }

  // EventEmitter 方法
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }
}

// ============================================
// 使用示例
// ============================================

async function streamingExample(): Promise<void> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // 基本流式处理
  const handler = new StreamingHandler({
    onChunk: (chunk) => {
      process.stdout.write(chunk);
    },
    onComplete: (fullText) => {
      console.log('\n\nComplete:', fullText);
    }
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Tell me a story about AI.' }],
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      handler.processChunk(content);
    }
  }

  handler.complete();

  // Express SSE 示例
  // app.get('/stream', async (req, res) => {
  //   const sse = new SSEStreamHandler(res);
  //
  //   const stream = await openai.chat.completions.create({
  //     model: 'gpt-4o-mini',
  //     messages: [{ role: 'user', content: req.query.message as string }],
  //     stream: true
  //   });
  //
  //   for await (const chunk of stream) {
  //     const content = chunk.choices[0]?.delta?.content;
  //     if (content) {
  //       sse.sendChunk(content);
  //     }
  //   }
  //
  //   sse.sendComplete('Done');
  //   sse.close();
  // });
}
```

---


## 5. MLOps for JS

### 5.1 模型版本管理

#### 核心概念

模型版本管理跟踪模型的变更历史，支持回滚和复现。

**形式化定义**:

- 模型版本: $v = (m, t, h, p)$
- $m$: 模型文件
- $t$: 时间戳
- $h$: 哈希值
- $p$: 超参数和元数据

#### 完整实现示例

```typescript
// ============================================
// 模型版本管理器
// ============================================

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface ModelVersion {
  id: string;
  version: string;
  createdAt: Date;
  hash: string;
  metadata: {
    framework: string;
    architecture: string;
    hyperparameters: Record<string, unknown>;
    metrics?: Record<string, number>;
    dataset?: string;
    description?: string;
  };
  tags: string[];
  parentVersion?: string;
}

interface ModelRegistry {
  versions: ModelVersion[];
  latest: string;
}

class ModelVersionManager {
  private registryPath: string;
  private modelsPath: string;
  private registry: ModelRegistry;

  constructor(basePath: string) {
    this.registryPath = path.join(basePath, 'registry.json');
    this.modelsPath = path.join(basePath, 'models');
    this.registry = { versions: [], latest: '' };
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.registryPath, 'utf-8');
      this.registry = JSON.parse(data);
    } catch {
      // 创建新注册表
      await fs.mkdir(this.modelsPath, { recursive: true });
      await this.saveRegistry();
    }
  }

  async registerVersion(
    modelBuffer: Buffer,
    metadata: ModelVersion['metadata'],
    options: {
      version?: string;
      tags?: string[];
      parentVersion?: string;
    } = {}
  ): Promise<ModelVersion> {
    // 计算哈希
    const hash = crypto.createHash('sha256').update(modelBuffer).digest('hex');

    // 生成版本号
    const version = options.version || this.generateVersion();

    // 创建版本记录
    const modelVersion: ModelVersion = {
      id: crypto.randomUUID(),
      version,
      createdAt: new Date(),
      hash,
      metadata,
      tags: options.tags || [],
      parentVersion: options.parentVersion
    };

    // 保存模型文件
    const modelPath = path.join(this.modelsPath, `${version}.bin`);
    await fs.writeFile(modelPath, modelBuffer);

    // 更新注册表
    this.registry.versions.push(modelVersion);
    this.registry.latest = version;
    await this.saveRegistry();

    return modelVersion;
  }

  async getVersion(version: string): Promise<{
    version: ModelVersion;
    modelBuffer: Buffer;
  } | null> {
    const modelVersion = this.registry.versions.find(v => v.version === version);
    if (!modelVersion) return null;

    const modelPath = path.join(this.modelsPath, `${version}.bin`);
    const modelBuffer = await fs.readFile(modelPath);

    // 验证哈希
    const hash = crypto.createHash('sha256').update(modelBuffer).digest('hex');
    if (hash !== modelVersion.hash) {
      throw new Error('Model file corruption detected: hash mismatch');
    }

    return { version: modelVersion, modelBuffer };
  }

  async getLatest(): Promise<{
    version: ModelVersion;
    modelBuffer: Buffer;
  } | null> {
    if (!this.registry.latest) return null;
    return this.getVersion(this.registry.latest);
  }

  async listVersions(filters?: {
    tags?: string[];
    framework?: string;
    after?: Date;
    before?: Date;
  }): Promise<ModelVersion[]> {
    let versions = [...this.registry.versions];

    if (filters?.tags) {
      versions = versions.filter(v =>
        filters.tags!.some(tag => v.tags.includes(tag))
      );
    }

    if (filters?.framework) {
      versions = versions.filter(v =>
        v.metadata.framework === filters.framework
      );
    }

    if (filters?.after) {
      versions = versions.filter(v =>
        new Date(v.createdAt) >= filters.after!
      );
    }

    if (filters?.before) {
      versions = versions.filter(v =>
        new Date(v.createdAt) <= filters.before!
      );
    }

    return versions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async addTag(version: string, tag: string): Promise<void> {
    const modelVersion = this.registry.versions.find(v => v.version === version);
    if (!modelVersion) {
      throw new Error(`Version ${version} not found`);
    }

    if (!modelVersion.tags.includes(tag)) {
      modelVersion.tags.push(tag);
      await this.saveRegistry();
    }
  }

  async removeTag(version: string, tag: string): Promise<void> {
    const modelVersion = this.registry.versions.find(v => v.version === version);
    if (!modelVersion) return;

    modelVersion.tags = modelVersion.tags.filter(t => t !== tag);
    await this.saveRegistry();
  }

  async deleteVersion(version: string): Promise<void> {
    const index = this.registry.versions.findIndex(v => v.version === version);
    if (index === -1) return;

    // 删除模型文件
    const modelPath = path.join(this.modelsPath, `${version}.bin`);
    try {
      await fs.unlink(modelPath);
    } catch {
      // 文件可能不存在
    }

    // 更新注册表
    this.registry.versions.splice(index, 1);

    if (this.registry.latest === version) {
      this.registry.latest = this.registry.versions.length > 0
        ? this.registry.versions[this.registry.versions.length - 1].version
        : '';
    }

    await this.saveRegistry();
  }

  async compareVersions(
    version1: string,
    version2: string
  ): Promise<{
    version1: ModelVersion;
    version2: ModelVersion;
    differences: {
      hyperparameters: string[];
      metrics: string[];
      architecture: boolean;
    };
  }> {
    const v1 = this.registry.versions.find(v => v.version === version1);
    const v2 = this.registry.versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    const differences = {
      hyperparameters: this.compareObjects(
        v1.metadata.hyperparameters,
        v2.metadata.hyperparameters
      ),
      metrics: this.compareObjects(
        v1.metadata.metrics || {},
        v2.metadata.metrics || {}
      ),
      architecture: v1.metadata.architecture !== v2.metadata.architecture
    };

    return { version1: v1, version2: v2, differences };
  }

  private compareObjects(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>
  ): string[] {
    const differences: string[] = [];
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      if (obj1[key] !== obj2[key]) {
        differences.push(`${key}: ${obj1[key]} → ${obj2[key]}`);
      }
    }

    return differences;
  }

  private generateVersion(): string {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}-${now.getTime()}`;
  }

  private async saveRegistry(): Promise<void> {
    await fs.writeFile(
      this.registryPath,
      JSON.stringify(this.registry, null, 2)
    );
  }
}

// ============================================
// 与 TensorFlow.js 集成
// ============================================

import * as tf from '@tensorflow/tfjs';

class TensorFlowModelRegistry {
  private versionManager: ModelVersionManager;

  constructor(basePath: string) {
    this.versionManager = new ModelVersionManager(basePath);
  }

  async initialize(): Promise<void> {
    await this.versionManager.initialize();
  }

  async saveModel(
    model: tf.LayersModel,
    metadata: {
      hyperparameters: Record<string, unknown>;
      metrics?: Record<string, number>;
      description?: string;
    },
    tags?: string[]
  ): Promise<ModelVersion> {
    // 序列化模型
    const modelJson = model.toJSON();
    const weights = await Promise.all(
      model.weights.map(async w => ({
        name: w.name,
        data: Array.from(await w.read())
      }))
    );

    const modelData = JSON.stringify({ architecture: modelJson, weights });
    const modelBuffer = Buffer.from(modelData);

    return this.versionManager.registerVersion(modelBuffer, {
      framework: 'tensorflow.js',
      architecture: modelJson.class_name || 'unknown',
      hyperparameters: metadata.hyperparameters,
      metrics: metadata.metrics,
      description: metadata.description
    }, { tags });
  }

  async loadModel(version: string): Promise<tf.LayersModel> {
    const result = await this.versionManager.getVersion(version);
    if (!result) {
      throw new Error(`Version ${version} not found`);
    }

    const { modelBuffer } = result;
    const modelData = JSON.parse(modelBuffer.toString());

    // 重建模型
    const model = await tf.models.modelFromJSON(modelData.architecture);

    // 恢复权重
    for (const weightData of modelData.weights) {
      const weight = model.getWeights().find(w => w.name === weightData.name);
      if (weight) {
        const tensor = tf.tensor(weightData.data, weight.shape);
        // 注意：实际实现需要正确设置权重
      }
    }

    return model;
  }

  async getLatestModel(): Promise<tf.LayersModel | null> {
    const result = await this.versionManager.getLatest();
    if (!result) return null;
    return this.loadModel(result.version.version);
  }
}
```

---

### 5.2 A/B测试

#### 核心概念

A/B 测试比较不同模型版本的表现，数据驱动决策。

**形式化定义**:

- 假设: $H_0: \mu_A = \mu_B$ vs $H_1: \mu_A \neq \mu_B$
- 统计显著性: $p < \alpha$ (通常 $\alpha = 0.05$)

#### 完整实现示例

```typescript
// ============================================
// A/B 测试框架
// ============================================

interface ABTestConfig {
  testId: string;
  modelA: string;
  modelB: string;
  trafficSplit: number; // 0-1, percentage for model A
  metrics: string[];
  minSampleSize: number;
  confidenceLevel: number;
}

interface ABTestEvent {
  testId: string;
  variant: 'A' | 'B';
  userId: string;
  timestamp: Date;
  metrics: Record<string, number>;
}

interface ABTestResult {
  testId: string;
  status: 'running' | 'completed' | 'stopped';
  sampleSizeA: number;
  sampleSizeB: number;
  metrics: Record<string, {
    meanA: number;
    meanB: number;
    diff: number;
    percentChange: number;
    pValue: number;
    isSignificant: boolean;
    confidenceInterval: [number, number];
  }>;
  winner?: 'A' | 'B' | 'tie';
  recommendation: string;
}

class ABTestFramework {
  private tests: Map<string, ABTestConfig> = new Map();
  private events: ABTestEvent[] = [];
  private storage: any; // 持久化存储

  constructor(storage: any) {
    this.storage = storage;
  }

  createTest(config: ABTestConfig): void {
    this.tests.set(config.testId, config);
  }

  // 分配用户到变体
  assignVariant(testId: string, userId: string): 'A' | 'B' {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // 使用哈希确保一致性分配
    const hash = crypto.createHash('md5')
      .update(`${testId}:${userId}`)
      .digest('hex');
    const hashValue = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

    return hashValue < test.trafficSplit ? 'A' : 'B';
  }

  // 记录事件
  async recordEvent(event: ABTestEvent): Promise<void> {
    this.events.push(event);
    await this.storage.saveEvent(event);
  }

  // 获取测试结果
  async getResults(testId: string): Promise<ABTestResult> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // 获取事件数据
    const events = await this.storage.getEvents(testId);
    const eventsA = events.filter((e: ABTestEvent) => e.variant === 'A');
    const eventsB = events.filter((e: ABTestEvent) => e.variant === 'B');

    const results: ABTestResult = {
      testId,
      status: this.determineStatus(test, eventsA.length, eventsB.length),
      sampleSizeA: eventsA.length,
      sampleSizeB: eventsB.length,
      metrics: {},
      recommendation: ''
    };

    // 计算每个指标的统计结果
    for (const metric of test.metrics) {
      const valuesA = eventsA.map((e: ABTestEvent) => e.metrics[metric]).filter(Boolean);
      const valuesB = eventsB.map((e: ABTestEvent) => e.metrics[metric]).filter(Boolean);

      if (valuesA.length === 0 || valuesB.length === 0) continue;

      results.metrics[metric] = this.calculateMetricStats(
        valuesA,
        valuesB,
        test.confidenceLevel
      );
    }

    // 确定胜者
    results.winner = this.determineWinner(results);
    results.recommendation = this.generateRecommendation(results);

    return results;
  }

  private calculateMetricStats(
    valuesA: number[],
    valuesB: number[],
    confidenceLevel: number
  ): ABTestResult['metrics'][string] {
    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;

    const diff = meanB - meanA;
    const percentChange = (diff / meanA) * 100;

    // 双样本 t 检验
    const pValue = this.tTest(valuesA, valuesB);

    // 置信区间
    const ci = this.confidenceInterval(
      meanA,
      meanB,
      valuesA.length,
      valuesB.length,
      confidenceLevel
    );

    return {
      meanA,
      meanB,
      diff,
      percentChange,
      pValue,
      isSignificant: pValue < (1 - confidenceLevel),
      confidenceInterval: ci
    };
  }

  private tTest(valuesA: number[], valuesB: number[]): number {
    const n1 = valuesA.length;
    const n2 = valuesB.length;

    const mean1 = valuesA.reduce((a, b) => a + b, 0) / n1;
    const mean2 = valuesB.reduce((a, b) => a + b, 0) / n2;

    const variance1 = valuesA.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
    const variance2 = valuesB.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);

    const pooledSE = Math.sqrt(variance1 / n1 + variance2 / n2);
    const tStat = (mean1 - mean2) / pooledSE;

    // 简化的 p 值计算（使用正态分布近似）
    return this.normalCDF(-Math.abs(tStat)) * 2;
  }

  private confidenceInterval(
    meanA: number,
    meanB: number,
    nA: number,
    nB: number,
    confidenceLevel: number
  ): [number, number] {
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.576;
    const se = Math.sqrt(Math.pow(meanA, 2) / nA + Math.pow(meanB, 2) / nB);
    const diff = meanB - meanA;

    return [
      diff - zScore * se,
      diff + zScore * se
    ];
  }

  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  private determineStatus(
    test: ABTestConfig,
    sampleSizeA: number,
    sampleSizeB: number
  ): ABTestResult['status'] {
    if (sampleSizeA >= test.minSampleSize && sampleSizeB >= test.minSampleSize) {
      return 'completed';
    }
    return 'running';
  }

  private determineWinner(results: ABTestResult): 'A' | 'B' | 'tie' | undefined {
    const metrics = Object.values(results.metrics);
    if (metrics.length === 0) return undefined;

    const significantImprovements = metrics.filter(m =>
      m.isSignificant && m.percentChange > 0
    );
    const significantDegradations = metrics.filter(m =>
      m.isSignificant && m.percentChange < 0
    );

    if (significantImprovements.length > significantDegradations.length) {
      return 'B';
    } else if (significantDegradations.length > significantImprovements.length) {
      return 'A';
    }

    return 'tie';
  }

  private generateRecommendation(results: ABTestResult): string {
    if (!results.winner) {
      return 'Insufficient data to make a recommendation.';
    }

    if (results.winner === 'tie') {
      return 'No significant difference detected between variants.';
    }

    const winningMetrics = Object.entries(results.metrics)
      .filter(([, m]) => m.isSignificant && (results.winner === 'B' ? m.percentChange > 0 : m.percentChange < 0))
      .map(([name, m]) => `${name}: ${Math.abs(m.percentChange).toFixed(2)}% improvement`);

    return `Variant ${results.winner} shows significant improvement in: ${winningMetrics.join(', ')}.`;
  }

  // 停止测试
  stopTest(testId: string): void {
    const test = this.tests.get(testId);
    if (test) {
      // 标记为已停止
    }
  }
}

// ============================================
// 模型路由器（用于 A/B 测试）
// ============================================

interface ModelRouterConfig {
  models: Array<{
    name: string;
    version: string;
    weight: number;
  }>;
  strategy: 'random' | 'weighted' | 'user_hash';
}

class ModelRouter {
  private config: ModelRouterConfig;
  private loadedModels: Map<string, any> = new Map();

  constructor(config: ModelRouterConfig) {
    this.config = config;
  }

  // 选择模型
  selectModel(userId?: string): string {
    switch (this.config.strategy) {
      case 'random':
        return this.randomSelection();
      case 'weighted':
        return this.weightedSelection();
      case 'user_hash':
        return userId
          ? this.hashBasedSelection(userId)
          : this.randomSelection();
      default:
        return this.config.models[0].name;
    }
  }

  private randomSelection(): string {
    const index = Math.floor(Math.random() * this.config.models.length);
    return this.config.models[index].name;
  }

  private weightedSelection(): string {
    const totalWeight = this.config.models.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    for (const model of this.config.models) {
      random -= model.weight;
      if (random <= 0) {
        return model.name;
      }
    }

    return this.config.models[this.config.models.length - 1].name;
  }

  private hashBasedSelection(userId: string): string {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const hashValue = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

    const totalWeight = this.config.models.reduce((sum, m) => sum + m.weight, 0);
    let cumulativeWeight = 0;

    for (const model of this.config.models) {
      cumulativeWeight += model.weight / totalWeight;
      if (hashValue <= cumulativeWeight) {
        return model.name;
      }
    }

    return this.config.models[this.config.models.length - 1].name;
  }

  // 加载模型
  async loadModel(name: string, loader: () => Promise<any>): Promise<any> {
    if (this.loadedModels.has(name)) {
      return this.loadedModels.get(name);
    }

    const model = await loader();
    this.loadedModels.set(name, model);
    return model;
  }

  // 预测并记录
  async predict(
    input: unknown,
    userId: string,
    abTest?: ABTestFramework
  ): Promise<{
    output: unknown;
    modelUsed: string;
    variant?: 'A' | 'B';
  }> {
    const modelName = this.selectModel(userId);
    const model = this.loadedModels.get(modelName);

    if (!model) {
      throw new Error(`Model ${modelName} not loaded`);
    }

    const output = await model.predict(input);

    // 记录 A/B 测试事件
    if (abTest) {
      // 记录推理事件
    }

    return {
      output,
      modelUsed: modelName
    };
  }
}
```

---

### 5.3 监控和可观测性

#### 核心概念

监控 ML 系统需要跟踪性能指标、错误率和资源使用情况。

#### 完整实现示例

```typescript
// ============================================
// ML 监控系统
// ============================================

interface MetricPoint {
  timestamp: Date;
  value: number;
  labels: Record<string, string>;
}

interface ModelMetrics {
  inferenceLatency: MetricPoint[];
  inferenceCount: MetricPoint[];
  errorRate: MetricPoint[];
  tokenUsage: MetricPoint[];
  modelLoadTime: MetricPoint[];
}

class MLMonitor {
  private metrics: Map<string, ModelMetrics> = new Map();
  private alerts: Array<{
    condition: (metrics: ModelMetrics) => boolean;
    action: () => void;
  }> = [];
  private exporters: Array<(metrics: Map<string, ModelMetrics>) => void> = [];

  // 记录推理指标
  recordInference(
    modelName: string,
    latency: number,
    tokenCount?: number,
    error?: Error
  ): void {
    const timestamp = new Date();

    if (!this.metrics.has(modelName)) {
      this.metrics.set(modelName, {
        inferenceLatency: [],
        inferenceCount: [],
        errorRate: [],
        tokenUsage: [],
        modelLoadTime: []
      });
    }

    const modelMetrics = this.metrics.get(modelName)!;

    // 记录延迟
    modelMetrics.inferenceLatency.push({
      timestamp,
      value: latency,
      labels: { model: modelName }
    });

    // 记录推理次数
    modelMetrics.inferenceCount.push({
      timestamp,
      value: 1,
      labels: { model: modelName, status: error ? 'error' : 'success' }
    });

    // 记录 Token 使用
    if (tokenCount) {
      modelMetrics.tokenUsage.push({
        timestamp,
        value: tokenCount,
        labels: { model: modelName }
      });
    }

    // 检查告警
    this.checkAlerts(modelName);
  }

  // 记录模型加载时间
  recordModelLoad(modelName: string, loadTime: number): void {
    const modelMetrics = this.metrics.get(modelName);
    if (modelMetrics) {
      modelMetrics.modelLoadTime.push({
        timestamp: new Date(),
        value: loadTime,
        labels: { model: modelName }
      });
    }
  }

  // 添加告警规则
  addAlert(
    condition: (metrics: ModelMetrics) => boolean,
    action: () => void
  ): void {
    this.alerts.push({ condition, action });
  }

  private checkAlerts(modelName: string): void {
    const modelMetrics = this.metrics.get(modelName);
    if (!modelMetrics) return;

    for (const alert of this.alerts) {
      if (alert.condition(modelMetrics)) {
        alert.action();
      }
    }
  }

  // 获取统计信息
  getStats(
    modelName: string,
    timeWindow: number = 3600000 // 1 hour
  ): {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
    totalInferences: number;
    errorRate: number;
    avgTokenUsage: number;
  } {
    const modelMetrics = this.metrics.get(modelName);
    if (!modelMetrics) {
      throw new Error(`No metrics for model ${modelName}`);
    }

    const cutoff = new Date(Date.now() - timeWindow);

    const recentLatencies = modelMetrics.inferenceLatency
      .filter(m => m.timestamp >= cutoff)
      .map(m => m.value);

    const recentErrors = modelMetrics.inferenceCount
      .filter(m => m.timestamp >= cutoff && m.labels.status === 'error')
      .length;

    const recentTokens = modelMetrics.tokenUsage
      .filter(m => m.timestamp >= cutoff)
      .map(m => m.value);

    const sortedLatencies = [...recentLatencies].sort((a, b) => a - b);

    return {
      avgLatency: this.average(recentLatencies),
      p95Latency: this.percentile(sortedLatencies, 0.95),
      p99Latency: this.percentile(sortedLatencies, 0.99),
      totalInferences: modelMetrics.inferenceCount.filter(m => m.timestamp >= cutoff).length,
      errorRate: recentErrors / (modelMetrics.inferenceCount.filter(m => m.timestamp >= cutoff).length || 1),
      avgTokenUsage: this.average(recentTokens)
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil(sortedValues.length * p) - 1;
    return sortedValues[Math.max(0, index)];
  }

  // 导出指标
  addExporter(exporter: (metrics: Map<string, ModelMetrics>) => void): void {
    this.exporters.push(exporter);
  }

  export(): void {
    for (const exporter of this.exporters) {
      exporter(this.metrics);
    }
  }

  // Prometheus 格式导出
  toPrometheusFormat(): string {
    const lines: string[] = [];

    for (const [modelName, metrics] of this.metrics) {
      // 延迟直方图
      lines.push(`# HELP model_inference_latency Model inference latency in ms`);
      lines.push(`# TYPE model_inference_latency histogram`);

      for (const point of metrics.inferenceLatency) {
        lines.push(`model_inference_latency{model="${modelName}"} ${point.value} ${point.timestamp.getTime()}`);
      }

      // 推理计数
      lines.push(`# HELP model_inference_total Total number of inferences`);
      lines.push(`# TYPE model_inference_total counter`);

      const totalInferences = metrics.inferenceCount.reduce((sum, m) => sum + m.value, 0);
      lines.push(`model_inference_total{model="${modelName}"} ${totalInferences}`);
    }

    return lines.join('\n');
  }
}

// ============================================
// 日志记录器
// ============================================

interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: {
    modelName?: string;
    requestId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

class MLLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number;
  private exporters: Array<(entry: LogEntry) => void> = [];

  constructor(maxLogs: number = 10000) {
    this.maxLogs = maxLogs;
  }

  log(
    level: LogEntry['level'],
    message: string,
    context: LogEntry['context'] = {}
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    };

    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 导出到外部系统
    for (const exporter of this.exporters) {
      exporter(entry);
    }
  }

  debug(message: string, context?: LogEntry['context']): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogEntry['context']): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogEntry['context']): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogEntry['context']): void {
    this.log('error', message, context);
  }

  addExporter(exporter: (entry: LogEntry) => void): void {
    this.exporters.push(exporter);
  }

  // 查询日志
  query(filters: {
    level?: LogEntry['level'];
    modelName?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[] {
    let results = [...this.logs];

    if (filters.level) {
      results = results.filter(l => l.level === filters.level);
    }

    if (filters.modelName) {
      results = results.filter(l => l.context.modelName === filters.modelName);
    }

    if (filters.startTime) {
      results = results.filter(l => l.timestamp >= filters.startTime!);
    }

    if (filters.endTime) {
      results = results.filter(l => l.timestamp <= filters.endTime!);
    }

    if (filters.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }
}

// ============================================
// 追踪系统
// ============================================

interface Span {
  id: string;
  parentId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  attributes: Record<string, unknown>;
  events: Array<{
    timestamp: Date;
    name: string;
    attributes?: Record<string, unknown>;
  }>;
  status: 'ok' | 'error';
  errorMessage?: string;
}

interface Trace {
  id: string;
  spans: Span[];
  startTime: Date;
  endTime?: Date;
}

class MLTracer {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, Span> = new Map();

  startTrace(traceId?: string): string {
    const id = traceId || crypto.randomUUID();

    this.traces.set(id, {
      id,
      spans: [],
      startTime: new Date()
    });

    return id;
  }

  startSpan(
    traceId: string,
    name: string,
    parentId?: string,
    attributes: Record<string, unknown> = {}
  ): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    const spanId = crypto.randomUUID();
    const span: Span = {
      id: spanId,
      parentId,
      name,
      startTime: new Date(),
      attributes,
      events: [],
      status: 'ok'
    };

    trace.spans.push(span);
    this.activeSpans.set(spanId, span);

    return spanId;
  }

  addEvent(
    spanId: string,
    name: string,
    attributes?: Record<string, unknown>
  ): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.events.push({
      timestamp: new Date(),
      name,
      attributes
    });
  }

  endSpan(spanId: string, error?: Error): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = new Date();

    if (error) {
      span.status = 'error';
      span.errorMessage = error.message;
    }

    this.activeSpans.delete(spanId);
  }

  endTrace(traceId: string): Trace {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    trace.endTime = new Date();
    return trace;
  }

  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  // 导出为 OpenTelemetry 格式
  toOpenTelemetryFormat(traceId: string): object {
    const trace = this.traces.get(traceId);
    if (!trace) return {};

    return {
      resourceSpans: [{
        resource: {
          attributes: [{
            key: 'service.name',
            value: { stringValue: 'ml-service' }
          }]
        },
        scopeSpans: [{
          scope: { name: 'ml-inference' },
          spans: trace.spans.map(span => ({
            traceId: trace.id.replace(/-/g, ''),
            spanId: span.id.replace(/-/g, '').slice(0, 16),
            parentSpanId: span.parentId?.replace(/-/g, '').slice(0, 16),
            name: span.name,
            kind: 1, // SPAN_KIND_INTERNAL
            startTimeUnixNano: BigInt(span.startTime.getTime()) * 1000000n,
            endTimeUnixNano: span.endTime
              ? BigInt(span.endTime.getTime()) * 1000000n
              : undefined,
            attributes: Object.entries(span.attributes).map(([k, v]) => ({
              key: k,
              value: { stringValue: String(v) }
            })),
            status: span.status === 'error'
              ? { code: 2, message: span.errorMessage }
              : { code: 1 }
          }))
        }]
      }]
    };
  }
}
```

---

### 5.4 边缘部署

#### 核心概念

边缘部署将模型部署到靠近用户的设备或边缘服务器，减少延迟和带宽。

#### 完整实现示例

```typescript
// ============================================
// 边缘部署管理器
// ============================================

interface EdgeDeploymentConfig {
  modelId: string;
  version: string;
  targetDevices: string[];
  optimization: {
    quantization: 'none' | 'fp16' | 'int8';
    pruning: boolean;
    caching: boolean;
  };
  rollout: {
    strategy: 'all' | 'gradual' | 'canary';
    percentage?: number;
  };
}

interface EdgeDevice {
  id: string;
  type: 'browser' | 'mobile' | 'iot' | 'edge_server';
  capabilities: {
    webgl: boolean;
    wasm: boolean;
    webgpu: boolean;
    memory: number;
  };
  location: {
    region: string;
    latency: number;
  };
}

class EdgeDeploymentManager {
  private deployments: Map<string, EdgeDeploymentConfig> = new Map();
  private devices: Map<string, EdgeDevice> = new Map();

  // 注册设备
  registerDevice(device: EdgeDevice): void {
    this.devices.set(device.id, device);
  }

  // 创建部署
  createDeployment(config: EdgeDeploymentConfig): void {
    this.deployments.set(config.modelId, config);
  }

  // 获取适合设备的模型配置
  getOptimizedModel(
    modelId: string,
    deviceId: string
  ): {
    modelUrl: string;
    backend: string;
    batchSize: number;
  } {
    const deployment = this.deployments.get(modelId);
    const device = this.devices.get(deviceId);

    if (!deployment) {
      throw new Error(`Deployment for model ${modelId} not found`);
    }

    // 根据设备能力选择后端
    let backend = 'cpu';
    if (device?.capabilities.webgpu) {
      backend = 'webgpu';
    } else if (device?.capabilities.webgl) {
      backend = 'webgl';
    } else if (device?.capabilities.wasm) {
      backend = 'wasm';
    }

    // 根据内存选择批大小
    const batchSize = this.calculateBatchSize(device?.capabilities.memory || 512);

    // 构建模型 URL
    const modelUrl = this.buildModelUrl(deployment, backend);

    return { modelUrl, backend, batchSize };
  }

  private calculateBatchSize(memoryMB: number): number {
    if (memoryMB >= 4096) return 32;
    if (memoryMB >= 2048) return 16;
    if (memoryMB >= 1024) return 8;
    return 1;
  }

  private buildModelUrl(
    deployment: EdgeDeploymentConfig,
    backend: string
  ): string {
    const suffix = deployment.optimization.quantization !== 'none'
      ? `-${deployment.optimization.quantization}`
      : '';

    return `/models/${deployment.modelId}/${deployment.version}/${backend}${suffix}/model.json`;
  }

  // 检查是否应该向设备提供模型
  shouldServeModel(modelId: string, deviceId: string): boolean {
    const deployment = this.deployments.get(modelId);
    if (!deployment) return false;

    const device = this.devices.get(deviceId);
    if (!device) return false;

    // 检查部署策略
    switch (deployment.rollout.strategy) {
      case 'all':
        return true;
      case 'canary':
        // 基于设备 ID 的哈希决定是否包含
        const hash = crypto.createHash('md5')
          .update(deviceId)
          .digest('hex');
        const hashValue = parseInt(hash.slice(0, 4), 16) / 0xffff;
        return hashValue < (deployment.rollout.percentage || 0.1);
      case 'gradual':
        // 基于区域逐步推出
        return ['us-east', 'eu-west'].includes(device.location.region);
      default:
        return false;
    }
  }
}

// ============================================
// 模型优化器
// ============================================

import * as tf from '@tensorflow/tfjs';

class ModelOptimizer {
  // 量化模型
  async quantizeModel(
    model: tf.LayersModel,
    bits: 8 | 16 = 8
  ): Promise<tf.LayersModel> {
    // TensorFlow.js 量化
    const quantized = await tf.tidy(() => {
      // 获取权重
      const weights = model.weights;

      // 量化权重
      const quantizedWeights = weights.map(w => {
        const tensor = w.read();
        const min = tensor.min();
        const max = tensor.max();
        const scale = max.sub(min).div(bits === 8 ? 255 : 65535);

        const quantized = tensor.sub(min)
          .div(scale)
          .round()
          .mul(scale)
          .add(min);

        return { name: w.name, tensor: quantized };
      });

      // 创建新模型并设置量化权重
      // 注意：实际实现需要更复杂的处理
      return model;
    });

    return quantized;
  }

  // 剪枝模型
  async pruneModel(
    model: tf.LayersModel,
    sparsity: number = 0.5
  ): Promise<tf.LayersModel> {
    return tf.tidy(() => {
      const weights = model.weights;

      const prunedWeights = weights.map(w => {
        const tensor = w.read();
        const flat = tensor.flatten();
        const thresholdIndex = Math.floor(flat.size * sparsity);

        // 获取阈值
        const sorted = tf.topk(tf.abs(flat), thresholdIndex);
        const threshold = sorted.values.min();

        // 应用掩码
        const mask = tf.abs(tensor).greater(threshold);
        const pruned = tensor.mul(mask.cast('float32'));

        return { name: w.name, tensor: pruned };
      });

      // 创建新模型
      return model;
    });
  }

  // 转换为 TensorFlow.js 格式
  async convertToTFJS(
    modelPath: string,
    outputPath: string,
    options: {
      quantizationBytes?: 1 | 2 | 4;
      splitWeightsByLayer?: boolean;
    } = {}
  ): Promise<void> {
    // 使用 tensorflowjs_converter
    // 命令行: tensorflowjs_converter
    //   --input_format=tf_saved_model
    //   --output_format=tfjs_graph_model
    //   --quantization_bytes=${options.quantizationBytes || 4}
    //   ${modelPath} ${outputPath}

    console.log(`Converting ${modelPath} to TFJS format at ${outputPath}`);
  }

  // 优化用于特定后端
  async optimizeForBackend(
    model: tf.LayersModel,
    backend: 'webgl' | 'wasm' | 'cpu'
  ): Promise<tf.LayersModel> {
    switch (backend) {
      case 'webgl':
        // WebGL 优化：确保张量维度对齐
        return this.optimizeForWebGL(model);
      case 'wasm':
        // WASM 优化：使用更小的操作
        return this.optimizeForWASM(model);
      case 'cpu':
        // CPU 优化：简化图
        return this.optimizeForCPU(model);
      default:
        return model;
    }
  }

  private optimizeForWebGL(model: tf.LayersModel): tf.LayersModel {
    // WebGL 特定优化
    // 1. 确保批大小是 2 的幂
    // 2. 使用纹理友好的数据布局
    return model;
  }

  private optimizeForWASM(model: tf.LayersModel): tf.LayersModel {
    // WASM 特定优化
    // 1. 使用 XNNPACK 友好的操作
    // 2. 避免复杂控制流
    return model;
  }

  private optimizeForCPU(model: tf.LayersModel): tf.LayersModel {
    // CPU 特定优化
    // 1. 融合操作
    // 2. 减少内存分配
    return model;
  }
}

// ============================================
// 服务工作者缓存
// ============================================

// service-worker.ts
const MODEL_CACHE_NAME = 'ml-models-v1';

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(MODEL_CACHE_NAME).then(cache => {
      // 预缓存关键模型
      return cache.addAll([
        '/models/base/model.json',
        '/models/base/weights.bin'
      ]);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // 拦截模型请求
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        // 返回缓存或网络请求
        return response || fetch(event.request).then(fetchResponse => {
          // 缓存新模型
          const clone = fetchResponse.clone();
          caches.open(MODEL_CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return fetchResponse;
        });
      })
    );
  }
});

// ============================================
// 使用示例
// ============================================

async function edgeDeploymentExample(): Promise<void> {
  // 创建边缘部署
  const deploymentManager = new EdgeDeploymentManager();

  deploymentManager.createDeployment({
    modelId: 'sentiment-classifier',
    version: '1.0.0',
    targetDevices: ['browser', 'mobile'],
    optimization: {
      quantization: 'int8',
      pruning: true,
      caching: true
    },
    rollout: {
      strategy: 'gradual',
      percentage: 0.5
    }
  });

  // 注册设备
  deploymentManager.registerDevice({
    id: 'user-device-1',
    type: 'browser',
    capabilities: {
      webgl: true,
      wasm: true,
      webgpu: false,
      memory: 4096
    },
    location: {
      region: 'us-east',
      latency: 20
    }
  });

  // 获取优化配置
  const config = deploymentManager.getOptimizedModel(
    'sentiment-classifier',
    'user-device-1'
  );
  console.log('Optimized config:', config);

  // 模型优化
  const optimizer = new ModelOptimizer();

  // 假设有一个模型
  // const model = await tf.loadLayersModel('model.json');
  // const quantized = await optimizer.quantizeModel(model, 8);
  // const pruned = await optimizer.pruneModel(quantized, 0.3);
}
```

---

## 6. 形式化论证

### 6.1 正确性论证

**定理 1** (RAG 检索正确性): 给定查询 $q$ 和文档集合 $\mathcal{D}$，RAG 检索器返回的文档集合 $D_{retrieved}$ 满足：

$$\forall d \in D_{retrieved}: sim(E(q), E(d)) \geq \theta$$

其中 $\theta$ 为相似度阈值，$E$ 为嵌入函数。

**证明**:

1. 查询嵌入: $q_{emb} = E(q)$
2. 向量搜索返回满足 $sim(q_{emb}, E(d)) \geq \theta$ 的所有文档
3. 因此 $D_{retrieved} = \{d \in \mathcal{D} : sim(q_{emb}, E(d)) \geq \theta\}$
4. 证毕。

### 6.2 性能界限

**定理 2** (流式响应延迟): 对于生成 $T$ 个 token 的响应，流式处理的感知延迟为 $O(1)$，而非流式为 $O(T)$。

**证明**:

- 流式: 第一个 token 到达时间为 $t_1$，用户立即看到内容
- 非流式: 用户等待所有 $T$ 个 token 生成，时间为 $\sum_{i=1}^{T} t_i$
- 因此流式感知延迟为常数，非流式为线性。

### 6.3 安全性论证

**定理 3** (本地模型隐私): 使用本地运行的 LLM（如 Ollama）时，用户输入 $x$ 不会离开本地环境，满足隐私保护。

$$\nexists \text{ network transmission of } x \Rightarrow \text{privacy preserved}$$

---

## 7. 总结

本文档全面梳理了 AI/ML 技术在 JavaScript/TypeScript 生态中的应用，涵盖：

1. **ML 基础**: TensorFlow.js、ONNX.js、ML5.js、Brain.js
2. **LLM 集成**: OpenAI、Claude、开源模型、LangChain.js
3. **RAG 架构**: 向量数据库、嵌入模型、文档分块、检索重排序
4. **AI 应用架构**: Agent 模式、多 Agent 系统、多模态处理、流式响应
5. **MLOps**: 模型版本管理、A/B 测试、监控、边缘部署

每种技术都提供了完整的 TypeScript 实现示例、反例和性能优化建议，帮助开发者构建生产级的 AI 应用。

---

## 参考资源

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [ML5.js](https://ml5js.org/)
- [Brain.js](https://brain.js.org/)
- [OpenAI API](https://platform.openai.com/docs)
- [LangChain.js](https://js.langchain.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Ollama](https://ollama.com/)

# ML 工程理论：从 Notebook 到生产系统

> **目标读者**：关注 AI 应用工程化的开发者
> **关联文档**：``30-knowledge-base/30.2-categories/ml-engineering.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. ML 工程 vs 数据科学

| 维度 | 数据科学 | ML 工程 |
|------|---------|---------|
| **关注点** | 模型精度 | 系统可靠性 |
| **代码** | Notebook | 模块化、可测试 |
| **部署** | 手动 | 自动 CI/CD |
| **监控** | 离线评估 | 在线指标、漂移检测 |
| **规模** | 单机 | 分布式、弹性 |

**关键洞察**：90% 的 ML 项目失败不是因为模型不好，而是因为**工程化不足**。

---

## 2. MLOps 生命周期

```
数据收集 → 特征工程 → 模型训练 → 评估 → 部署 → 监控 → 再训练
   ↑                                                      ↓
   └───────────────── 反馈循环 ───────────────────────────┘
```

### 2.1 特征存储

| 方案 | 特点 | 适用 |
|------|------|------|
| **Tecton** | 企业级 | 大规模实时特征 |
| **Feast** | 开源 | 中小型团队 |
| **自定义** | 灵活 | 特定场景 |

### 2.2 模型服务

| 架构 | 延迟 | 适用 |
|------|------|------|
| **实时推理** | < 100ms | 推荐、搜索 |
| **批量推理** | 分钟级 | 报表、分析 |
| **边缘推理** | < 10ms | 实时交互 |

---

## 3. JS/TS ML 生态

### 3.1 浏览器端 ML

```typescript
// TensorFlow.js
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('model.json');
const prediction = model.predict(inputTensor);
```

### 3.2 Node.js ML

```typescript
// ONNX Runtime
import * as ort from 'onnxruntime-node';

const session = await ort.InferenceSession.create('model.onnx');
const results = await session.run({ input: tensor });
```

### 3.3 ONNX Runtime Web — 浏览器高性能推理

```typescript
// onnx-runtime-web.ts — 跨浏览器标准化推理

import * as ort from 'onnxruntime-web';

async function runInference(imageData: ImageData): Promise<number[]> {
  // 创建输入张量 [1, 3, 224, 224]
  const tensor = new ort.Tensor('float32', preprocess(imageData), [1, 3, 224, 224]);
  const session = await ort.InferenceSession.create('model.onnx', {
    executionProviders: ['wasm'], // 或 'webgpu' 以获得 GPU 加速
  });

  const feeds: Record<string, ort.Tensor> = { input: tensor };
  const results = await session.run(feeds);
  const output = results.output as ort.Tensor;
  return Array.from(output.data as Float32Array);
}

function preprocess(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const normalized = new Float32Array(3 * width * height);
  for (let i = 0; i < width * height; i++) {
    normalized[i] = data[i * 4] / 255;             // R
    normalized[i + width * height] = data[i * 4 + 1] / 255; // G
    normalized[i + 2 * width * height] = data[i * 4 + 2] / 255; // B
  }
  return normalized;
}
```

### 3.4 TensorFlow.js 模型量化与转换

```typescript
// tfjs-quantization.ts — 减少模型体积，提升推理速度

import * as tf from '@tensorflow/tfjs';

async function quantizeAndSave(model: tf.LayersModel) {
  // 将权重从 float32 量化为 uint8（仅 1/4 体积）
  const quantized = await tf.tidy(() => {
    const weights = model.getWeights();
    const quantizedWeights = weights.map((w) => {
      const min = w.min();
      const max = w.max();
      const scale = max.sub(min).div(255);
      const zeroPoint = tf.floor(min.div(scale).neg());
      return w.div(scale).add(zeroPoint).clipByValue(0, 255).cast('uint8');
    });
    // 实际生产应使用 tfjs-converter 的量化标志
    return quantizedWeights;
  });

  await model.save('localstorage://quantized-model');
  console.log('模型已量化并保存');
}

// 命令行转换（推荐）
// tensorflowjs_converter --quantization_bytes 1 ./saved_model ./web_model
```

### 3.5 ML Pipeline 编排

```typescript
// ml-pipeline.ts
interface PipelineStage<TInput, TOutput> {
  name: string;
  execute(input: TInput): Promise<TOutput>;
  validate(output: TOutput): boolean;
}

class MLPipeline {
  private stages: Array<PipelineStage<any, any>> = [];

  add<T, U>(stage: PipelineStage<T, U>): MLPipeline {
    this.stages.push(stage);
    return this;
  }

  async run<T>(initialInput: T): Promise<unknown> {
    let data: unknown = initialInput;
    const metrics: { stage: string; duration: number; status: string }[] = [];

    for (const stage of this.stages) {
      const start = performance.now();
      try {
        data = await stage.execute(data);
        const isValid = stage.validate(data);
        if (!isValid) {
          throw new Error(`Validation failed at stage: ${stage.name}`);
        }
        metrics.push({
          stage: stage.name,
          duration: performance.now() - start,
          status: 'success',
        });
      } catch (error) {
        metrics.push({
          stage: stage.name,
          duration: performance.now() - start,
          status: 'failed',
        });
        throw new PipelineError(stage.name, error);
      }
    }

    return { output: data, metrics };
  }
}

class PipelineError extends Error {
  constructor(public stage: string, public cause: unknown) {
    super(`Pipeline failed at stage: ${stage}`);
  }
}

// 使用示例：完整的训练-验证-部署流水线
const trainingPipeline = new MLPipeline()
  .add({
    name: 'data-preprocessing',
    execute: async (rawData: number[][]) => {
      // 归一化、缺失值填充
      return rawData.map(row => row.map(v => (v === null ? 0 : v / 255)));
    },
    validate: (output) => output.every(row => row.every(v => v >= 0 && v <= 1)),
  })
  .add({
    name: 'feature-engineering',
    execute: async (normalized: number[][]) => {
      // PCA 降维或特征交叉
      return normalized.map(row => [...row, row[0] * row[1]]);
    },
    validate: (output) => output.length > 0 && output[0].length === 785,
  })
  .add({
    name: 'model-training',
    execute: async (features: number[][]) => {
      // 使用 TF.js 或自定义模型训练
      return { model: 'trained-model-v1', accuracy: 0.94, features };
    },
    validate: (output) => output.accuracy > 0.8,
  })
  .add({
    name: 'model-evaluation',
    execute: async (trainResult) => {
      // 交叉验证、AUC、F1 计算
      return { ...trainResult, f1Score: 0.91, auc: 0.96 };
    },
    validate: (output) => output.f1Score > 0.85,
  })
  .add({
    name: 'model-deployment',
    execute: async (evalResult) => {
      // 序列化并部署到推理服务
      await deployModel(evalResult.model);
      return { deployed: true, version: evalResult.model };
    },
    validate: (output) => output.deployed === true,
  });

// 执行
// const result = await trainingPipeline.run(rawTrainingData);
```

### 3.6 A/B 测试与模型实验管理

```typescript
// experiment-manager.ts
interface Experiment {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    modelVersion: string;
    trafficPercentage: number;
  }>;
  metric: string;
}

class ExperimentManager {
  private activeExperiments = new Map<string, Experiment>();
  private assignments = new Map<string, string>(); // userId -> variantId

  registerExperiment(experiment: Experiment) {
    const totalTraffic = experiment.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Variant traffic percentages must sum to 100');
    }
    this.activeExperiments.set(experiment.id, experiment);
  }

  assignVariant(experimentId: string, userId: string): string {
    const key = `${experimentId}:${userId}`;
    if (this.assignments.has(key)) {
      return this.assignments.get(key)!;
    }

    const experiment = this.activeExperiments.get(experimentId);
    if (!experiment) return 'control';

    // 一致性哈希确保同一用户始终分到同一组
    const hash = this.hashString(key);
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.trafficPercentage;
      if (hash % 100 < cumulative) {
        this.assignments.set(key, variant.id);
        return variant.id;
      }
    }
    return experiment.variants[0].id;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

### 3.7 数据漂移检测（Data Drift Detection）

```typescript
// drift-detection.ts — 基于统计检验的输入分布监控

export class DriftDetector {
  private referenceMean: number = 0;
  private referenceStd: number = 1;

  fit(referenceData: number[]) {
    this.referenceMean = referenceData.reduce((a, b) => a + b, 0) / referenceData.length;
    const variance = referenceData.reduce((sum, v) => sum + (v - this.referenceMean) ** 2, 0) / referenceData.length;
    this.referenceStd = Math.sqrt(variance);
  }

  /** 计算 Z-Score 漂移指标，超过阈值触发告警 */
  detect(newData: number[], threshold = 3.0): { drifted: boolean; zScore: number } {
    const newMean = newData.reduce((a, b) => a + b, 0) / newData.length;
    const zScore = Math.abs(newMean - this.referenceMean) / (this.referenceStd / Math.sqrt(newData.length));
    return { drifted: zScore > threshold, zScore };
  }
}

// 使用
const detector = new DriftDetector();
detector.fit(trainingFeatureDistribution);
const result = detector.detect(latestFeatureDistribution);
if (result.drifted) {
  console.warn(`数据漂移告警: Z-Score = ${result.zScore.toFixed(2)}`);
}
```

---

## 4. 反模式

### 反模式 1：训练-服务偏差

❌ 训练时用 Python 处理特征，服务时用 JS 重写。
✅ 特征工程代码共享，或用 ONNX 标准化模型。

### 反模式 2：无监控部署

❌ 模型部署后不再关注性能。
✅ 监控：延迟、吞吐量、预测分布漂移。

### 反模式 3：没有版本控制的模型

```typescript
// ✅ 模型版本管理最佳实践
class ModelRegistry {
  private models = new Map<string, ModelVersion[]>();

  register(name: string, version: string, artifactPath: string, metrics: Record<string, number>) {
    const versions = this.models.get(name) || [];
    versions.push({ version, artifactPath, metrics, createdAt: new Date() });
    this.models.set(name, versions);
  }

  getLatest(name: string): ModelVersion | undefined {
    const versions = this.models.get(name);
    return versions?.sort((a, b) => +b.createdAt - +a.createdAt)[0];
  }

  rollback(name: string, targetVersion: string): boolean {
    const versions = this.models.get(name);
    const target = versions?.find(v => v.version === targetVersion);
    if (target) {
      // 触发部署回滚
      console.log(`Rolling back ${name} to ${targetVersion}`);
      return true;
    }
    return false;
  }
}

interface ModelVersion {
  version: string;
  artifactPath: string;
  metrics: Record<string, number>;
  createdAt: Date;
}
```

---

## 5. 总结

ML 工程 = **软件工程 + 数据科学 + 运维**。

**核心原则**：

1. 模型是代码，需要版本控制、测试、CI/CD
2. 数据是资产，需要血缘追踪、质量监控
3. 监控是生命线，模型会随时间退化

---

## 参考资源

### 权威书籍与课程
- [Made With ML](https://madewithml.com/) — 开源 MLOps 课程（涵盖从建模到部署的全流程）
- [Designing Machine Learning Systems — Chip Huyen](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) — ML 系统设计权威著作
- [Feature Stores for ML](https://www.featurestorebook.com/) — 特征存储专著
- [Machine Learning Engineering — Andriy Burkov](http://www.mlebook.com/) — 工程化实践指南

### 开源工具
- [MLOps Community](https://mlops.community/) — MLOps 从业者社区
- [TensorFlow.js](https://www.tensorflow.org/js) — Google 浏览器/Node ML 框架
- [ONNX Runtime](https://onnxruntime.ai/) — 跨平台高性能推理引擎
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) — 浏览器端 ONNX 推理
- [Feast](https://feast.dev/) — 开源特征存储
- [Evidently AI](https://www.evidentlyai.com/) — ML 模型与数据漂移检测
- [Great Expectations](https://greatexpectations.io/) — 数据质量验证框架

### 规范与标准
- [MLflow](https://mlflow.org/) — 开源 ML 生命周期管理平台
- [Kubeflow](https://www.kubeflow.org/) — Kubernetes 上的 ML 工作流
- [Open Neural Network Exchange (ONNX)](https://onnx.ai/) — 跨框架模型交换标准
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js) — 浏览器端 Transformer 模型库
- [Papers With Code — MLOps](https://paperswithcode.com/area/machine-learning/mlops) — 学术论文与实现对应
- [Google — Rules of ML](https://developers.google.com/machine-learning/guides/rules-of-ml) — Google ML 工程最佳实践

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `feature-scaler.ts`
- `feature-store.ts`
- `index.ts`
- `linear-regression.ts`
- `ml-pipeline.ts`
- `model-serialization.ts`
- `model-serving.ts`
- `simple-neural-network.ts`
- `tensor-ops.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

1. **Pipeline 模式**：将 ML 工作流分解为可组合、可验证的阶段，每个阶段可独立测试和回滚
2. **Feature Store 模式**：分离在线/离线特征计算，消除训练-服务偏差
3. **Shadow Deployment 模式**：新版本模型与旧版本并行运行，对比输出后再切换流量

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `linear-regression.ts` — 理解基础算法 |
| 后续进阶 | `model-serving.ts` — 模型部署与推理优化 |

---

> 📅 理论深化更新：2026-04-29

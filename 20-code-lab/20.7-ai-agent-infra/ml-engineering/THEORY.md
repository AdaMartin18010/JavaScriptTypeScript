# ML 工程理论：从 Notebook 到生产系统

> **目标读者**：关注 AI 应用工程化的开发者
> **关联文档**：[`docs/categories/76-ml-engineering.md`](../../docs/categories/76-ml-engineering.md)
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

---

## 4. 反模式

### 反模式 1：训练-服务偏差

❌ 训练时用 Python 处理特征，服务时用 JS 重写。
✅ 特征工程代码共享，或用 ONNX 标准化模型。

### 反模式 2：无监控部署

❌ 模型部署后不再关注性能。
✅ 监控：延迟、吞吐量、预测分布漂移。

---

## 5. 总结

ML 工程 = **软件工程 + 数据科学 + 运维**。

**核心原则**：

1. 模型是代码，需要版本控制、测试、CI/CD
2. 数据是资产，需要血缘追踪、质量监控
3. 监控是生命线，模型会随时间退化

---

## 参考资源

- [MLOps Community](https://mlops.community/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Made With ML](https://madewithml.com/)

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

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27

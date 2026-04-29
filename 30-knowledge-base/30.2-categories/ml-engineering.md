# 机器学习工程

> JavaScript/TypeScript 生态 ML 工程工具链。

---

## 工具链

| 层级 | 工具 | 说明 |
|------|------|------|
| **运行时** | Node.js / Deno / Bun | 模型推理 |
| **框架** | TensorFlow.js, ONNX Runtime | 浏览器 + Node.js |
| **向量数据库** | pgvector, Pinecone, Milvus | Embedding 存储 |
| **LLM SDK** | OpenAI SDK, Vercel AI SDK | API 调用 |
| **特征工程** | Danfo.js, lodash | 数据处理 |

---

## 主流运行时/框架对比

| 维度 | TensorFlow.js | ONNX Runtime Web | Transformers.js |
|------|---------------|------------------|-----------------|
| **定位** | 端到端 ML 框架 | 跨平台模型推理引擎 | 预训练模型直接运行 |
| **支持环境** | 浏览器 / Node.js / React Native | 浏览器 (WASM/WebGL/WebGPU) / Node.js | 浏览器 (WASM) / Node.js |
| **模型格式** | TF SavedModel / Layers / Graph | ONNX | ONNX (自动转换) |
| **训练能力** | 支持（迁移学习 / 微调） | 仅推理 | 仅推理 |
| **硬件加速** | WebGL / WebGPU / WASM / Node 绑定 | WebGPU / WebGL / WASM | WASM（未来 WebGPU） |
| **模型生态** | 丰富（官方模型库） | 极丰富（PyTorch/TensorFlow 均可导出） | Hugging Face 生态 |
| **包体积** | 较大（~500KB+ 核心） | 中等（~1MB+ WASM） | 按需加载（模型分片） |
| **冷启动延迟** | 中 | 低 | 低（量化模型） |
| **适用场景** | 自定义模型训练 / 图像识别 | 部署 PyTorch 导出模型 | 文本 Embedding / 分类 / 生成 |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 快速增长 |

---

## 代码示例：TensorFlow.js + Node.js 图像分类

```typescript
import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync } from 'node:fs';

async function classifyImage(imagePath: string) {
  // 加载 MobileNet 预训练模型
  const model = await mobilenet.load({ version: 2, alpha: 1.0 });

  // 加载图片并转为 Tensor
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // 从 canvas 获取图像数据
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const tensor = tf.browser.fromPixels(imageData)
    .resizeNearestNeighbor([224, 224])   // MobileNet 输入尺寸
    .toFloat()
    .expandDims(0)
    .div(tf.scalar(127.5))
    .sub(tf.scalar(1));

  // 推理
  const predictions = await model.classify(tensor as tf.Tensor3D);

  // 释放内存
  tensor.dispose();

  return predictions.map((p) => ({
    className: p.className,
    probability: p.probability,
  }));
}

(async () => {
  try {
    const results = await classifyImage('./sample-cat.jpg');
    console.log('分类结果:');
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.className} — ${(r.probability * 100).toFixed(2)}%`);
    });
  } catch (err) {
    console.error('推理失败:', err);
  } finally {
    // 清理 TF 后端资源
    tf.backend().dispose();
  }
})();
```

---

## 场景

- **客户端推理**：TensorFlow.js 在浏览器运行图像识别
- **服务端推理**：ONNX Runtime 运行导出模型
- **RAG 系统**：向量数据库 + Embedding + LLM

---

## 权威参考链接

- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [ONNX Runtime JavaScript 文档](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [Transformers.js 官方文档](https://huggingface.co/docs/transformers.js)
- [Hugging Face Hub](https://huggingface.co/models)
- [Danfo.js 文档](https://danfo.jsdata.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

*最后更新: 2026-04-29*

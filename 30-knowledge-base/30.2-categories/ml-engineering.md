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
| **浏览器推理** | Transformers.js, ML5.js | WASM/WebGPU 本地运行 |

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

## ONNX Runtime Web 浏览器推理

```typescript
// onnx-browser.ts — 浏览器端运行 ONNX 模型
import * as ort from 'onnxruntime-web';

async function runONNXInference(
  modelPath: string,
  inputData: Float32Array
): Promise<number[]> {
  const session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['webgpu', 'wasm'], // 优先 GPU 加速
  });

  const tensor = new ort.Tensor('float32', inputData, [1, inputData.length]);
  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = tensor;

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];
  return Array.from(output.data as Float32Array);
}

// 示例：情感分类模型
const logits = await runONNXInference('/models/sentiment.onnx', new Float32Array([...]));
const sentiment = logits[0] > logits[1] ? 'positive' : 'negative';
```

## Transformers.js 文本 Embedding 与分类

```typescript
// transformers-pipeline.ts — 零样本分类与特征提取
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

// 零样本分类
const classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
const result = await classifier('This is a great product!', ['positive', 'negative', 'neutral']);
console.log(result);
// [{ label: 'positive', score: 0.98 }, ...]

// 文本 Embedding（用于 RAG）
let embedder: FeatureExtractionPipeline;
async function getEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

const embedding = await getEmbedding('JavaScript ML engineering');
console.log('Embedding dimension:', embedding.length); // 384
```

## Vercel AI SDK 流式对话

```typescript
// ai-sdk-stream.ts — 服务端流式 LLM 响应
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: '你是一个 TypeScript 专家，只回答与类型系统和工程化相关的问题。',
    messages,
  });

  return result.toDataStreamResponse();
}
```

```typescript
// client-stream.ts — 前端消费流式响应
import { useChat } from 'ai/react';

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id} className={m.role}>
          {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Ask about TS..." />
      </form>
    </div>
  );
}
```

## pgvector + OpenAI Embedding RAG 检索

```typescript
// rag-retrieval.ts — 基于 pgvector 的语义检索
import { Pool } from 'pg';
import OpenAI from 'openai';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchSimilarDocuments(query: string, limit = 5) {
  // 1. 生成查询向量
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const vector = embeddingRes.data[0].embedding;

  // 2. pgvector 余弦相似度检索
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity
       FROM documents
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(vector), limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

(async () => {
  const docs = await searchSimilarDocuments('JavaScript 性能优化', 3);
  console.log(docs);
})();
```

## ML5.js — 浏览器友好 ML

```typescript
// ml5-browser.ts — 基于 TensorFlow.js 的高级封装，更易上手
import ml5 from 'ml5';

// 图像分类
async function classifyWithML5(imageElement: HTMLImageElement) {
  const classifier = await ml5.imageClassifier('MobileNet');
  const results = await classifier.classify(imageElement);
  console.log(results);
  // [{ label: 'tabby cat', confidence: 0.89 }, ...]
  return results;
}

// 姿态检测
async function detectPose(videoElement: HTMLVideoElement) {
  const poseNet = await ml5.poseNet(videoElement);
  poseNet.on('pose', (results: any[]) => {
    console.log(`检测到 ${results.length} 个姿态`);
    results.forEach((pose) => {
      console.log(pose.pose.keypoints); // 鼻子、肩膀、手肘等关键点
    });
  });
}
```

## WebNN API — 浏览器原生神经网络推理

```typescript
// webnn-browser.ts — W3C 草案标准的浏览器原生 ML 推理
async function runWebNN(modelBuffer: ArrayBuffer, inputData: Float32Array) {
  if (!('ml' in navigator)) {
    throw new Error('WebNN not supported in this browser');
  }

  const context = await (navigator as any).ml.createContext({
    devicePreference: 'gpu', // 'cpu' | 'gpu'
  });

  // 构建简单的全连接网络图
  const builder = new (window as any).MLGraphBuilder(context);
  const input = builder.input('input', { type: 'float32', dimensions: [1, 784] });
  const weights = builder.constant({ type: 'float32', dimensions: [784, 10] }, new Float32Array(7840));
  const bias = builder.constant({ type: 'float32', dimensions: [10] }, new Float32Array(10));

  const matmul = builder.matmul(input, weights);
  const output = builder.add(matmul, bias);

  const graph = await builder.build({ output });
  const result = await context.compute(graph, { input: inputData });
  return result.outputs.output;
}
```

## LangChain.js 工具链编排

```typescript
// langchain-tools.ts — 使用 LangChain.js 编排 LLM 工具调用
import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// 定义自定义工具
const weatherTool = {
  name: 'get_weather',
  description: '获取指定城市的当前天气',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: '城市名称' },
    },
    required: ['city'],
  },
  async invoke({ city }: { city: string }) {
    // 调用天气 API
    return JSON.stringify({ city, temperature: 22, condition: 'sunny' });
  },
};

async function createAgent() {
  const model = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', '你是一个 helpful assistant，可以使用工具回答问题。'],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools: [weatherTool as any],
    prompt,
  });

  return new AgentExecutor({ agent, tools: [weatherTool as any] });
}

(async () => {
  const executor = await createAgent();
  const result = await executor.invoke({ input: '北京今天天气怎么样？' });
  console.log(result.output);
})();
```

---

## 场景

- **客户端推理**：TensorFlow.js / Transformers.js 在浏览器运行图像识别、文本分类
- **服务端推理**：ONNX Runtime 运行导出模型，降低客户端负载
- **RAG 系统**：向量数据库 + Embedding + LLM，构建知识问答系统
- **实时交互**：WebNN / WebGPU 加速浏览器端推理，零后端依赖
- **工具编排**：LangChain.js / Vercel AI SDK 编排多步骤 LLM 工作流

---

## 权威参考链接

- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [ONNX Runtime JavaScript 文档](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [Transformers.js 官方文档](https://huggingface.co/docs/transformers.js)
- [Hugging Face Hub](https://huggingface.co/models)
- [Danfo.js 文档](https://danfo.jsdata.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [LangChain.js 文档](https://js.langchain.com/)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [Pinecone 文档](https://docs.pinecone.io/)
- [Milvus 文档](https://milvus.io/docs/)
- [ML5.js — 浏览器友好 ML](https://ml5js.org/)
- [Google AI Edge — MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/guide)
- [Papers with Code — JS/TS ML](https://paperswithcode.com/)
- [WebNN API — W3C 草案](https://www.w3.org/TR/webnn/) — 浏览器原生神经网络推理标准
- [WebGPU API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — 浏览器 GPU 计算标准
- [NVIDIA TensorRT](https://developer.nvidia.com/tensorrt) — GPU 推理优化引擎
- [Hugging Face Optimum](https://huggingface.co/docs/optimum/) — 模型优化与加速工具
- [RAG Survey Paper (arXiv)](https://arxiv.org/abs/2312.10997) — 检索增强生成技术综述
- [Google Research — Embedding Models](https://research.google/pubs/?q=embedding) — Google Embedding 研究论文

---

*最后更新: 2026-04-29*

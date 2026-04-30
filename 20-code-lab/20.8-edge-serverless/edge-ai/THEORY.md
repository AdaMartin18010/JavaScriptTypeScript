# 边缘 AI — 理论基础

## 1. 边缘 AI 的定义

在终端设备（手机、IoT、浏览器）上直接运行机器学习模型，无需将数据发送到云端。核心优势：**隐私保护**、**低延迟**、**离线可用**、**带宽节省**。

## 2. 边缘 AI 平台对比

| 维度 | Cloudflare AI | Vercel AI SDK | Netlify Blobs + Functions |
|------|--------------|---------------|--------------------------|
| **模型托管** | Workers AI（内置模型库） | 自托管 / 第三方 API | 自托管 / 第三方 API |
| **推理位置** | Cloudflare 边缘节点 | Edge Functions / Node.js | Netlify Edge Functions |
| **延迟** | < 50ms 全球 | 取决于模型位置 | 取决于模型位置 |
| **价格模型** | 按请求 + Tokens | 按计算时长 | 按函数调用时长 |
| **内置模型** | Llama、Mistral、Bge、Whisper 等 | 无（通过 API 接入） | 无 |
| **流式输出** | 支持 | 原生支持（AI SDK） | 需手动实现 |
| **TypeScript SDK** | `workers-ai` | `ai` + `@ai-sdk/openai` | `@netlify/blobs` |
| **最佳场景** | 全球低延迟推理、RAG 嵌入 | Next.js 全栈 AI 应用 | 静态站点 + 轻量 AI |

## 3. 模型压缩技术

为了在资源受限设备上运行大模型，需要压缩：

| 技术 | 原理 | 压缩比 | 精度损失 |
|------|------|--------|---------|
| **量化** | FP32 → INT8/INT4 | 4x | 1-3% |
| **剪枝** | 移除不重要权重 | 2-10x | 1-5% |
| **知识蒸馏** | 小模型学习大模型输出 | 2-10x | 2-5% |
| **结构化稀疏** | 移除整个神经元/通道 | 2-4x | 2-4% |

## 4. Cloudflare AI 推理代码示例

```typescript
// workers/ai-inference.ts — Cloudflare Worker with AI binding
export interface Env {
  AI: Ai; // Cloudflare Workers AI binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 文本生成示例
    if (url.pathname === '/generate') {
      const { prompt } = await request.json<{ prompt: string }>();
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 512,
        temperature: 0.7
      });
      return Response.json({ text: response.response });
    }

    // Embedding 示例（用于 RAG）
    if (url.pathname === '/embed') {
      const { text } = await request.json<{ text: string }>();
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text
      });
      return Response.json({ embedding: embedding.data[0] });
    }

    // 图像分类示例
    if (url.pathname === '/classify') {
      const imageData = await request.arrayBuffer();
      const result = await env.AI.run('@cf/microsoft/resnet-50', {
        image: [...new Uint8Array(imageData)]
      });
      return Response.json({ labels: result });
    }

    return new Response('Not Found', { status: 404 });
  }
};
```

Wrangler 配置：

```toml
# wrangler.toml
name = "edge-ai-demo"
main = "workers/ai-inference.ts"
compatibility_date = "2024-09-23"

[ai]
binding = "AI"
```

## 5. 浏览器端 Transformers.js 推理示例

```typescript
// 纯浏览器运行，无需后端，适合隐私敏感场景
import { pipeline } from '@xenova/transformers';

// 文本分类（情感分析）
async function classifySentiment(text: string): Promise<{ label: string; score: number }[]> {
  const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  return classifier(text);
}

// 特征提取（生成 Embedding）
async function extractEmbedding(text: string): Promise<number[]> {
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// 使用 Web Worker 避免阻塞主线程
// worker.ts
self.addEventListener('message', async (e) => {
  const { text, task } = e.data;
  const pipe = await pipeline(task as any);
  const result = await pipe(text);
  self.postMessage(result);
});
```

## 6. 边缘流式 AI 响应示例

```typescript
// workers/streaming-ai.ts — 流式文本生成
export interface Env { AI: Ai; }

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: '用中文解释边缘计算的优势',
      max_tokens: 256,
      stream: true,
    });

    return new Response(stream as ReadableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }
};
```

## 7. TensorFlow.js WebGPU 推理示例

```typescript
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgpu';

async function runWebGPUInference() {
  await tf.setBackend('webgpu');
  await tf.ready();

  const a = tf.tensor2d([1, 2, 3, 4], [2, 2]);
  const b = tf.tensor2d([5, 6, 7, 8], [2, 2]);
  const c = tf.matMul(a, b);

  const result = await c.data();
  console.log('WebGPU result:', result);

  a.dispose(); b.dispose(); c.dispose();
}
```

## 8. 边缘推理框架

- **TensorFlow.js**: 浏览器和 Node.js 的 ML 推理，支持 WebGL/WebGPU 加速
- **ONNX Runtime Web**: 跨平台模型格式，浏览器 WASM 执行
- **Transformers.js**: Hugging Face 模型的 JS 实现，纯浏览器运行
- **MediaPipe**: Google 的跨平台 ML 解决方案，专注视觉和文本
- **LLM.js**: 浏览器端大语言模型推理（Llama、Mistral 等）

## 9. WebGPU 加速

WebGPU 使浏览器能够直接访问 GPU 计算能力：

- **计算着色器**: 通用并行计算（矩阵乘法、卷积）
- **性能提升**: 相比 WASM CPU 推理，GPU 加速可达 10-100 倍
- **兼容性**: Chrome 113+、Firefox、Safari（实验性）

## 10. 应用场景

- **实时图像处理**: 滤镜、物体检测、人脸识别
- **语音处理**: 语音识别、语音合成、降噪
- **文本处理**: 本地翻译、摘要、情感分析
- **推荐系统**: 端侧个性化推荐（保护用户隐私）

## 11. 与相邻模块的关系

- **33-ai-integration**: 云端 AI 集成（本模块是端侧 AI）
- **36-web-assembly**: WASM 作为边缘推理的运行时
- **32-edge-computing**: 边缘计算架构与部署

## 12. 代码示例：Vercel AI SDK 流式 UI

```typescript
// app/api/chat/route.ts — Vercel AI SDK 流式聊天
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: '你是一个 helpful 的助手。',
  });

  return result.toDataStreamResponse();
}
```

```typescript
// app/page.tsx — 客户端流式消费
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className={m.role === 'user' ? 'user' : 'assistant'}>
          {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="说点什么..." />
        <button type="submit">发送</button>
      </form>
    </div>
  );
}
```

## 13. 代码示例：浏览器端 Whisper 语音转文字

```typescript
// whisper-browser.ts — Transformers.js 本地语音识别

import { pipeline } from '@xenova/transformers';

async function transcribeAudio(audioBuffer: AudioBuffer): Promise<string> {
  const transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny.en',
    { dtype: 'fp32' }
  );

  // 将 AudioBuffer 转换为 Float32Array
  const audioData = audioBuffer.getChannelData(0);

  const result = await transcriber(audioData, {
    return_timestamps: true,
    chunk_length_s: 30,
  });

  return (result as any).text;
}

// 使用 Web Audio API 录制并转写
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext({ sampleRate: 16000 });
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);

  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };

  source.connect(processor);
  processor.connect(ctx.destination);

  // 5 秒后停止并转写
  setTimeout(async () => {
    source.disconnect();
    processor.disconnect();
    const fullAudio = new Float32Array(chunks.reduce((a, b) => a + b.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      fullAudio.set(chunk, offset);
      offset += chunk.length;
    }
    const buffer = ctx.createBuffer(1, fullAudio.length, 16000);
    buffer.copyToChannel(fullAudio, 0);
    const text = await transcribeAudio(buffer);
    console.log('Transcription:', text);
  }, 5000);
}
```

## 14. 代码示例：RAG 向量检索与边缘 Embedding

```typescript
// edge-rag.ts — 边缘 RAG：Embedding + 向量相似度搜索

export interface Env {
  AI: Ai;
  VECTOR_INDEX: VectorizeIndex;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { query } = await request.json<{ query: string }>();

    // 1. 生成查询 Embedding
    const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
    const vector = embedding.data[0];

    // 2. 向量相似度搜索（Cloudflare Vectorize）
    const matches = await env.VECTOR_INDEX.query(vector, { topK: 3 });

    // 3. 拼接上下文并生成回答
    const context = matches.matches.map(m => m.metadata?.text).join('\n\n');
    const answer = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: `基于以下上下文回答问题：\n\n${context}\n\n问题：${query}`,
      max_tokens: 512,
    });

    return Response.json({ answer: answer.response, sources: matches.matches });
  },
};
```

## 参考链接

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction)
- [Transformers.js — Hugging Face](https://huggingface.co/docs/transformers.js/index)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [WebGPU — W3C Specification](https://www.w3.org/TR/webgpu/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- [MediaPipe for Web](https://developers.google.com/mediapipe/solutions/vision)
- [WebLLM — Apache TVM](https://webllm.mlc.ai/)
- [Google AI Edge](https://ai.google.dev/edge)
- [WASM SIMD Proposal](https://github.com/WebAssembly/simd)
- [Vercel AI SDK — Chat API](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot)
- [Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js/index)
- [TensorFlow.js — WebGPU Backend](https://www.tensorflow.org/js/guide/webgpu)
- [ONNX Runtime — Web Execution Provider](https://onnxruntime.ai/docs/execution-providers/WebNN-ExecutionProvider.html)
- [MDN — WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [Chrome Developers — WebGPU](https://developer.chrome.com/docs/web-platform/webgpu)

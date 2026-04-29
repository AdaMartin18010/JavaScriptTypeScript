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

## 5. 边缘推理框架

- **TensorFlow.js**: 浏览器和 Node.js 的 ML 推理，支持 WebGL/WebGPU 加速
- **ONNX Runtime Web**: 跨平台模型格式，浏览器 WASM 执行
- **Transformers.js**: Hugging Face 模型的 JS 实现，纯浏览器运行
- **MediaPipe**: Google 的跨平台 ML 解决方案，专注视觉和文本
- **LLM.js**: 浏览器端大语言模型推理（Llama、Mistral 等）

## 6. WebGPU 加速

WebGPU 使浏览器能够直接访问 GPU 计算能力：

- **计算着色器**: 通用并行计算（矩阵乘法、卷积）
- **性能提升**: 相比 WASM CPU 推理，GPU 加速可达 10-100 倍
- **兼容性**: Chrome 113+、Firefox、Safari（实验性）

## 7. 应用场景

- **实时图像处理**: 滤镜、物体检测、人脸识别
- **语音处理**: 语音识别、语音合成、降噪
- **文本处理**: 本地翻译、摘要、情感分析
- **推荐系统**: 端侧个性化推荐（保护用户隐私）

## 8. 与相邻模块的关系

- **33-ai-integration**: 云端 AI 集成（本模块是端侧 AI）
- **36-web-assembly**: WASM 作为边缘推理的运行时
- **32-edge-computing**: 边缘计算架构与部署

## 参考链接

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction)
- [Transformers.js — Hugging Face](https://huggingface.co/docs/transformers.js/index)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [WebGPU — W3C Specification](https://www.w3.org/TR/webgpu/)

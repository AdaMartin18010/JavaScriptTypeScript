/**
 * Edge AI Inference Worker
 *
 * 在 Cloudflare Workers 环境中运行轻量级 AI 模型推理。
 * 演示了模型加载、请求处理、流式响应返回的完整链路。
 */

export interface Env {
  MODEL_BASE_URL: string;
  // 如果使用 Cloudflare Workers AI 绑定：
  // AI: Ai;
}

// ==================== 类型定义 ====================

interface InferenceRequest {
  model: string;
  input: string | string[];
  stream?: boolean;
  params?: Record<string, number | string | boolean>;
}

interface InferenceResult {
  model: string;
  predictions: Array<{
    label: string;
    score: number;
  }>;
  latencyMs: number;
}

// ==================== 模型管理器 ====================

/**
 * 轻量级模型管理器
 *
 * 在 Edge Runtime 中：
 * - 使用 fetch 从 CDN 下载模型权重
 * - 利用 Workers Cache API 缓存模型，避免重复下载
 * - 实际推理通常通过 ONNX Runtime Web / TensorFlow.js / 外部 API 完成
 */
class EdgeModelManager {
  private cache: Cache;
  private baseUrl: string;

  constructor(baseUrl: string, cache: Cache) {
    this.baseUrl = baseUrl;
    this.cache = cache;
  }

  /**
   * 加载模型配置（模拟）
   *
   * 实际项目中，这里会返回 ONNX 模型的 ArrayBuffer 或
   * 指向 Workers AI / 外部推理服务的配置。
   */
  async loadModelConfig(modelId: string): Promise<{
    id: string;
    version: string;
    maxInputLength: number;
    labels: string[];
  }> {
    const cacheKey = `${this.baseUrl}/models/${modelId}/config.json`;

    // 尝试从 Cache 读取
    let response = await this.cache.match(cacheKey);

    if (!response) {
      // 模拟从 CDN 获取配置
      // 真实场景：response = await fetch(`${this.baseUrl}/models/${modelId}/config.json`);
      response = new Response(
        JSON.stringify({
          id: modelId,
          version: '1.0.0',
          maxInputLength: 512,
          labels: ['正面', '负面', '中性'],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      await this.cache.put(cacheKey, response.clone());
    }

    return response.json();
  }
}

// ==================== 推理引擎 ====================

/**
 * 模拟推理引擎
 *
 * 在真实 Edge AI 项目中，这里会集成：
 * - onnxruntime-web：运行 ONNX 量化模型
 * - @tensorflow/tfjs-core + 后端：运行 TF.js 模型
 * - @cloudflare/ai：调用 Cloudflare Workers AI 托管模型
 */
class InferenceEngine {
  constructor(private modelManager: EdgeModelManager) {}

  async infer(request: InferenceRequest): Promise<InferenceResult> {
    const start = Date.now();
    const config = await this.modelManager.loadModelConfig(request.model);

    // 模拟推理延迟（实际项目这里执行真正的模型前向传播）
    await new Promise((r) => setTimeout(r, 30));

    // 模拟分类结果
    const inputText = Array.isArray(request.input) ? request.input[0] : request.input;
    const predictions = this.mockClassify(inputText, config.labels);

    return {
      model: request.model,
      predictions,
      latencyMs: Date.now() - start,
    };
  }

  /**
   * 流式推理（模拟生成任务）
   *
   * 返回一个 ReadableStream，客户端可以逐字接收生成内容。
   */
  async inferStream(
    request: InferenceRequest
  ): Promise<ReadableStream<Uint8Array>> {
    const encoder = new TextEncoder();
    const inputText = Array.isArray(request.input) ? request.input[0] : request.input;

    return new ReadableStream({
      async start(controller) {
        // 发送 SSE 格式的数据
        const send = (data: unknown) => {
          const chunk = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        };

        send({ status: 'start', model: request.model });

        // 模拟逐字生成
        const words = [`根据输入 "${inputText}"，`, '模型正在', '逐步', '生成', '结果...'];
        for (const word of words) {
          await new Promise((r) => setTimeout(r, 80));
          send({ token: word, done: false });
        }

        send({
          status: 'done',
          result: {
            text: `${inputText} → [生成完成]`,
            tokens: words.length,
          },
        });

        controller.close();
      },
    });
  }

  private mockClassify(
    text: string,
    labels: string[]
  ): Array<{ label: string; score: number }> {
    // 简单的关键词模拟，真实场景由模型输出
    const scores = labels.map((label) => {
      let score = Math.random() * 0.3 + 0.1;
      if (label === '正面' && /精彩|棒|好|优秀/.test(text)) score += 0.5;
      if (label === '负面' && /差|烂|糟糕|不好/.test(text)) score += 0.5;
      if (label === '中性') score += 0.1;
      return { label, score: Math.min(score, 0.99) };
    });

    // 归一化到 softmax
    const expSum = scores.reduce((sum, s) => sum + Math.exp(s.score), 0);
    return scores
      .map((s) => ({ label: s.label, score: Math.exp(s.score) / expSum }))
      .sort((a, b) => b.score - a.score);
  }
}

// ==================== 请求处理器 ====================

function parseRequest(body: unknown): InferenceRequest {
  if (typeof body !== 'object' || body === null) {
    throw new Error('请求体必须是 JSON 对象');
  }

  const req = body as Record<string, unknown>;

  if (!req.model || typeof req.model !== 'string') {
    throw new Error('缺少必填字段: model');
  }
  if (!req.input || (typeof req.input !== 'string' && !Array.isArray(req.input))) {
    throw new Error('缺少必填字段: input');
  }

  return {
    model: req.model,
    input: req.input as string | string[],
    stream: req.stream === true,
    params: typeof req.params === 'object' ? (req.params as Record<string, number | string | boolean>) : undefined,
  };
}

function createErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ==================== Worker 入口 ====================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          runtime: 'cloudflare-workers',
          version: '0.1.0',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 推理接口
    if (url.pathname === '/infer' && request.method === 'POST') {
      try {
        const body = await request.json();
        const inferRequest = parseRequest(body);

        const cache = await caches.open('edge-ai-models');
        const modelManager = new EdgeModelManager(env.MODEL_BASE_URL, cache);
        const engine = new InferenceEngine(modelManager);

        if (inferRequest.stream) {
          const stream = await engine.inferStream(inferRequest);
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }

        const result = await engine.infer(inferRequest);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return createErrorResponse(
          error instanceof Error ? error.message : '未知错误',
          400
        );
      }
    }

    return createErrorResponse('Not Found', 404);
  },
};

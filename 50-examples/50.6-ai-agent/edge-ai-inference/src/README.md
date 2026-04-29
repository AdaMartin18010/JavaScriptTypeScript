# Edge AI 推理源码目录 (src)

> **路径**: `50-examples/50.6-ai-agent/edge-ai-inference/src/`

## 概述

此目录存放 **Edge AI 推理服务** 的核心源码。本项目演示如何在 Cloudflare Workers（或兼容的 Edge Runtime）环境中部署轻量级 AI 模型推理能力。与传统中心化云服务不同，Edge AI 将模型部署在距离用户最近的边缘节点，具有**低延迟、高隐私、离线可用**等优势，非常适合实时分类、文本生成、嵌入式推理等场景。

## 文件说明

| 文件 | 说明 |
|------|------|
| `worker.ts` | Cloudflare Worker 入口文件，包含模型管理器、推理引擎、请求解析与路由分发的完整实现 |

## 核心架构

### 1. 环境变量 (`Env` 接口)

```ts
export interface Env {
  MODEL_BASE_URL: string;
  // AI: Ai; // Cloudflare Workers AI 绑定（可选）
}
```

- `MODEL_BASE_URL`：模型权重与配置文件的 CDN 根地址
- `AI`（注释态）：若使用 Cloudflare Workers AI 原生绑定，可直接调用托管模型，无需自行加载权重

### 2. EdgeModelManager — 边缘模型管理器

负责在资源受限的 Edge Runtime 中管理模型生命周期：

- **Cache API 集成**：利用 Cloudflare Workers 的 `caches` 全局对象缓存模型配置与权重，避免每次请求重复下载
- **配置驱动**：通过 `loadModelConfig()` 读取模型的元数据（版本、输入长度限制、输出标签）
- **可扩展性**：实际生产环境中，可替换为 ONNX Runtime Web 或 TensorFlow.js 的模型加载逻辑

### 3. InferenceEngine — 推理引擎

核心推理逻辑，当前提供两种模式：

#### 同步推理 (`infer`)

```ts
async infer(request: InferenceRequest): Promise<InferenceResult>
```

适用于短文本分类、情感分析等即时返回结果的任务。响应包含：

- `model`：使用的模型标识
- `predictions`：按置信度排序的分类结果数组
- `latencyMs`：端到端推理耗时（毫秒）

#### 流式推理 (`inferStream`)

```ts
async inferStream(request: InferenceRequest): Promise<ReadableStream<Uint8Array>>
```

返回 SSE（Server-Sent Events）格式的流，逐字/逐句推送给客户端。适用于：

- 大模型文本生成（如 GPT 风格的逐 token 输出）
- 长响应场景，降低首字节时间（TTFB）
- 实时交互式 AI（聊天机器人、代码补全）

### 4. 请求路由

Worker 入口根据 `request.url.pathname` 分发请求：

| 路由 | 方法 | 功能 |
|------|------|------|
| `/` 或 `/health` | GET | 健康检查，返回运行时信息 |
| `/infer` | POST | 推理接口，支持同步与流式两种模式 |

请求体格式（JSON）：

```json
{
  "model": "sentiment-v1",
  "input": "这个产品真的很棒！",
  "stream": false,
  "params": { "temperature": 0.7 }
}
```

### 5. 错误处理

统一错误响应格式：

```json
{
  "error": "缺少必填字段: model"
}
```

- 参数校验失败返回 `400 Bad Request`
- 路由不存在返回 `404 Not Found`
- 所有错误均携带人类可读的中文提示

## 技术选型对比

| 方案 | 适用场景 | 本示例状态 |
|------|----------|------------|
| **模拟推理** | 演示、原型验证 | ✅ 当前实现 |
| **ONNX Runtime Web** | 运行量化后的 ONNX 模型 | 📝 可扩展 |
| **TensorFlow.js** | TF 模型在浏览器/Worker 中运行 | 📝 可扩展 |
| **Cloudflare Workers AI** | 调用平台托管模型（LLM、Embedding） | 📝 可扩展 |
| **外部 API 代理** | 转发到 OpenAI / Claude / 自建模型 | 📝 可扩展 |

## 开发规范

1. **Worker 全局对象**：Edge Runtime 中不存在 `window` 或 `document`，所有代码必须基于 Web 标准 API（`fetch`、`Request`、`Response`、`caches`）。
2. **内存与 CPU 限制**：Cloudflare Workers 有 128MB 内存与 50ms CPU 时间限制（免费版），模型加载与推理必须轻量化。大于 100MB 的模型应考虑拆分为多个 Worker 或使用 Cloudflare AI Gateway 代理。
3. **冷启动优化**：首次请求时模型缓存为空，可能触发下载。建议在部署后发送预热请求，或利用 Cloudflare Cache Reserve 持久化缓存。
4. **类型安全**：所有请求/响应接口均定义 TypeScript 类型，配合 `parseRequest()` 进行运行时校验，防止恶意输入导致 Worker 崩溃。

## 部署与调试

```bash
# 本地调试（使用 Wrangler）
npx wrangler dev src/worker.ts

# 部署到 Cloudflare
npx wrangler deploy src/worker.ts
```

调试时可结合 Cloudflare Dashboard 的"实时日志"功能查看 `console.log` 输出，或使用 `wrangler tail` 命令流式读取生产日志。

## 扩展方向

- **`models/` 子目录**：按模型维度拆分代码，每个模型独立实现预处理、推理、后处理逻辑
- **`middleware.ts`**：通用中间件（速率限制、请求日志、CORS、API Key 校验）
- **`streaming.ts`**：提取流式响应的通用逻辑，支持多种 SSE 格式变体
- **`cache.ts`**：封装 Cache API，实现 LRU 淘汰策略与缓存命中率监控

---

*此目录是 Edge AI 架构的核心实现，展示了如何在极端资源受限的环境中运行 AI 推理。随着 ONNX Runtime Web 和 WebGPU 的成熟，边缘端直接运行大模型的场景将越来越普遍。*

# Edge AI Inference 示例

展示如何在 Edge Runtime（如 Cloudflare Workers、Deno Deploy、Vercel Edge Functions）中运行 AI 模型推理。利用 Edge Runtime 的低延迟特性，在靠近用户的位置进行轻量级推理。

## 项目结构

```
.
├── src/
│   └── worker.ts          # Cloudflare Worker 入口
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## 核心特性

- **Edge Runtime 兼容**：使用 Web 标准 API（Fetch、Streams、WebGPU*）
- **模型加载抽象**：支持从多种来源加载 ONNX / GGML / TensorFlow.js 模型
- **流式响应**：使用 TransformStream 将推理结果分段返回客户端
- **TypeScript 安全**：完整的 Workers 类型支持

## 如何运行

### 本地开发（Wrangler）

```bash
# 安装依赖
npm install

# 本地启动 Worker 开发服务器
npx wrangler dev

# 部署到 Cloudflare
npx wrangler deploy
```

### 测试请求

```bash
# 非流式推理
curl -X POST http://localhost:8787/infer \
  -H "Content-Type: application/json" \
  -d '{"model":"text-classifier","input":"这部电影太精彩了！"}'

# 流式推理
curl -X POST http://localhost:8787/infer \
  -H "Content-Type: application/json" \
  -d '{"model":"text-generator","input":"从前有座山","stream":true}'
```

## 注意事项

- Edge Runtime 有 CPU 和内存限制，适合运行轻量级模型（ONNX 量化、DistilBERT 等）
- 大模型推理建议调用外部 AI 推理服务（Workers AI、OpenAI、Together 等）
- 模型文件通常托管在 R2 / S3 / HuggingFace CDN，Worker 中按需下载并缓存

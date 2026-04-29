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

## 场景

- **客户端推理**：TensorFlow.js 在浏览器运行图像识别
- **服务端推理**：ONNX Runtime 运行导出模型
- **RAG 系统**：向量数据库 + Embedding + LLM

---

*最后更新: 2026-04-29*

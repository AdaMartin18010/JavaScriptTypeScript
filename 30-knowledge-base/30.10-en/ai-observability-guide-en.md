# AI Observability Guide

> **English Summary** of `30.1-guides/ai-observability-guide.md`

---

## Why AI Needs Observability

Production AI systems face unique observability challenges:

| Challenge | Traditional | AI-Specific |
|-----------|------------|-------------|
| Output uncertainty | Deterministic | Probabilistic |
| Latency source | Code execution | Model inference time |
| Cost tracking | CPU/memory | Token consumption |
| Quality assessment | Unit tests | Human eval, auto-scoring (RAGAS) |

## OpenTelemetry LLM Semantic Conventions

Key span attributes:

- `gen_ai.system`: `openai`, `anthropic`
- `gen_ai.request.model`: `gpt-4o`
- `gen_ai.usage.input_tokens`: 1024
- `gen_ai.usage.output_tokens`: 512

## Tool Ecosystem

| Tool | Type | Open Source | Core Feature |
|------|------|-------------|--------------|
| **Langfuse** | Tracing | Yes | LLM call tracing, cost analysis |
| **LangSmith** | Tracing | No | LangChain native integration |
| **Helicone** | Gateway+Obs | Yes | Proxy interception, caching |

## TypeScript Integration

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseExporter } from 'langfuse-vercel';

const sdk = new NodeSDK({
  traceExporter: new LangfuseExporter({ /* config */ })
});
sdk.start();
```

---

*English summary. Full Chinese guide: `../30.1-guides/ai-observability-guide.md`.*

# AI Observability Guide

> Building production-grade observability for LLM applications: from OpenTelemetry LLM Semantic Conventions to multi-tenant cost attribution.

---

## 1. Why AI Observability is Different

Traditional observability assumes deterministic behavior. LLM applications break this assumption:

| Dimension | Traditional | AI Application |
|-----------|-------------|----------------|
| Output | Deterministic | Probabilistic (temperature, sampling) |
| Cost | CPU/memory/time | Token consumption |
| Latency | Code + DB + Network | Model inference (TTFT + generation) |
| Errors | Binary (200/500) | Hallucination, bias, safety violations |
| Versions | Code + dependencies | Prompt version, model version, RAG context |

## 2. Key Tools Comparison

| Tool | Strength | Best For |
|------|----------|----------|
| **Langfuse** | Open-source, self-hostable | Cost-conscious teams |
| **Helicone** | Gateway-layer observability | Proxy-based architectures |
| **Weave** | W&B experiment tracking | ML research teams |
| **Traceloop** | Zero-code OpenTelemetry | Quick adoption |

## 3. Core Metrics

- **Token Usage**: Input/output tokens per request, per user, per session
- **Latency**: TTFT (Time To First Token), total generation time
- **Cost**: $ per request, per 1K tokens, per user
- **Quality**: Hallucination rate, relevance score, safety score

*For the full Chinese version, see [../guides/ai-observability-guide.md](../guides/ai-observability-guide.md)*

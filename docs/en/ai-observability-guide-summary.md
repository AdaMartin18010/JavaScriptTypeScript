# AI Observability Guide — English Summary

> Full Chinese version: [`docs/guides/ai-observability-guide.md`](../guides/ai-observability-guide.md)

## Overview

AI Observability is the practice of monitoring, tracing, and analyzing AI system behavior in production. It extends traditional observability (metrics, logs, traces) with LLM-specific concerns.

## Three Pillars of AI Observability

| Pillar | Traditional Equivalent | AI-Specific Concerns |
|--------|----------------------|---------------------|
| **Metrics** | Request latency, error rate | Token usage, cost per request, model performance drift |
| **Traces** | Distributed request tracing | LLM call chains, tool execution sequences, agent decision paths |
| **Logs** | Application logs | Prompt/response logging (with PII filtering), model outputs |

## OpenTelemetry LLM Semantic Conventions

Standardized attributes for LLM spans:
- `gen_ai.system`: Provider (openai, anthropic, etc.)
- `gen_ai.request.model`: Model identifier
- `gen_ai.usage.input_tokens`: Input token count
- `gen_ai.usage.output_tokens`: Output token count
- `gen_ai.response.finish_reason`: Stop reason

## Key Tools

| Tool | Type | Open Source | Key Feature |
|------|------|-------------|-------------|
| **Langfuse** | Full-stack | ✅ 8K stars | Tracing + evaluation + prompt management |
| **OpenLLMetry** | SDK | ✅ | OpenTelemetry-native LLM instrumentation |
| **LangSmith** | Platform | ❌ (LangChain) | Deep LangChain integration |
| **Helicone** | Gateway | ✅ | Request caching + cost analytics |

## Cost Optimization Strategies

1. **Token-aware caching**: Cache identical prompts with TTL
2. **Model routing**: Route simple queries to cheaper models
3. **Streaming optimization**: Reduce time-to-first-token latency
4. **Batch processing**: Group non-urgent requests

---

> 📅 Summary generated: 2026-04-27

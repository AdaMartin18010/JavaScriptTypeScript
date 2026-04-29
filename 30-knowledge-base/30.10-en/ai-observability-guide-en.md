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

---

## LLM Observability Pillars: Tracing vs Evals vs Guardrails

| Pillar | Purpose | Key Metrics | When to Use |
|--------|---------|-------------|-------------|
| **Tracing** | Track full LLM call lifecycle | Latency, token usage, cost per call | Debug slow responses, audit model usage |
| **Evaluations** | Measure output quality | Accuracy, relevance, hallucination rate | CI/CD gates, model selection, prompt A/B testing |
| **Guardrails** | Block unsafe inputs/outputs | PII detection, toxicity score, jailbreak attempts | Real-time production filtering, compliance |

**Relationship**: Tracing tells you *what happened*, Evaluations tell you *how good it was*, Guardrails ensure *it stays safe*.

---

## OpenTelemetry LLM Semantic Conventions

Key span attributes:

- `gen_ai.system`: `openai`, `anthropic`
- `gen_ai.request.model`: `gpt-4o`
- `gen_ai.usage.input_tokens`: 1024
- `gen_ai.usage.output_tokens`: 512

---

## Tool Ecosystem

| Tool | Type | Open Source | Core Feature |
|------|------|-------------|--------------|
| **Langfuse** | Tracing + Evals | Yes | LLM call tracing, cost analysis, dataset evals |
| **LangSmith** | Tracing + Evals | No | LangChain native integration, prompt versioning |
| **Helicone** | Gateway + Obs | Yes | Proxy interception, caching, cost tracking |
| **Weights & Biases** | Experiment Tracking | Yes (core) | Model versioning, prompt comparison |
| **OpenPipe** | Evals + Fine-tuning | Yes | Prompt regression testing, model distillation |
| **Lakera Guard** | Guardrails | No | PII/toxicity/jailbreak detection |

---

## Code Example: LangSmith Trace with OpenTelemetry

```typescript
import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';
import { OpenAI } from 'openai';

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

const openai = new OpenAI();

// Wrap any function with automatic trace generation
const generateSummary = traceable(
  async (document: string) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Summarize the following document.' },
        { role: 'user', content: document },
      ],
    });
    return response.choices[0].message.content;
  },
  {
    name: 'document-summarizer',
    runType: 'llm',
    metadata: { project: 'knowledge-base' },
  }
);

// Usage: automatically emits trace to LangSmith with latency, tokens, cost
const summary = await generateSummary('TypeScript is a typed superset of JavaScript...');

// OpenTelemetry bridge for unified observability
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseExporter } from 'langfuse-vercel';

const sdk = new NodeSDK({
  traceExporter: new LangfuseExporter({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: 'https://cloud.langfuse.com',
  }),
});
sdk.start();
```

### Helicone Proxy Integration (Zero Code Changes)

```typescript
import OpenAI from 'openai';

// Route OpenAI SDK through Helicone to auto-capture traces
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.hconeai.com/v1',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    'Helicone-Cache-Enabled': 'true',
    'Helicone-Property-App': 'customer-support-bot',
  },
});

// All calls are automatically traced, cached, and cost-attributed
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### OpenTelemetry Manual LLM Instrumentation

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';
import type { ChatCompletion } from 'openai/resources/chat/completions';

const tracer = trace.getTracer('ai-gateway');

export async function tracedChatCompletion(
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<ChatCompletion> {
  return tracer.startActiveSpan('chat.completion', async (span) => {
    span.setAttribute('gen_ai.system', 'openai');
    span.setAttribute('gen_ai.request.model', model);
    span.setAttribute('gen_ai.request.message_count', messages.length);

    const start = performance.now();
    try {
      const result = await openai.chat.completions.create({ model, messages });
      const latency = performance.now() - start;

      span.setAttribute('gen_ai.usage.input_tokens', result.usage?.prompt_tokens ?? 0);
      span.setAttribute('gen_ai.usage.output_tokens', result.usage?.completion_tokens ?? 0);
      span.setAttribute('gen_ai.response.latency_ms', latency);
      span.setAttribute('gen_ai.response.finish_reason', result.choices[0]?.finish_reason ?? 'unknown');
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

---

## Evaluation Pipeline Example (RAGAS)

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

# Prepare evaluation dataset
questions = ["What is TypeScript?", "How does RSC work?"]
answers = ["A typed superset of JavaScript.", "React Server Components render on the server."]
contexts = [["TypeScript adds static types to JS."], ["RSC serialize to a special format."]]

dataset = Dataset.from_dict({
    "question": questions,
    "answer": answers,
    "contexts": contexts,
})

# Run automated evaluation
results = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_precision])
print(results)  # Scores 0.0–1.0 per metric
```

### Custom Guardrails with Nemo Guardrails

```python
# config.yml (NeMo Guardrails)
coline:
  - type: general
    instructions:
      - "Do not provide medical, legal, or financial advice."
      - "Refuse requests to generate harmful content."
  - type: output
    instructions:
      - "Check that the response does not contain PII."
      - "Check that the response is not toxic."

# Python usage
from nemoguardrails import RailsConfig, LLMRails

config = RailsConfig.from_path("./config")
rails = LLMRails(config)

response = rails.generate(messages=[{
    "role": "user",
    "content": "How do I hack a website?"
}])
# response['content'] will be a refusal or safe fallback
```

### Prompt Regression Test (CI/CD Gate)

```typescript
// __tests__/prompt-snapshots.test.ts
import { evaluate } from '@your-eval-lib/core';

describe('RAG prompt regression', () => {
  it('should maintain >0.85 answer relevance across model versions', async () => {
    const dataset = await loadEvalDataset('./fixtures/rag-tests.jsonl');
    const results = await evaluate({
      model: 'gpt-4o-2026-04-15',
      prompts: dataset,
      metrics: ['answer_relevancy', 'faithfulness'],
    });

    const avgRelevancy = results.reduce((s, r) => s + r.answer_relevancy, 0) / results.length;
    expect(avgRelevancy).toBeGreaterThanOrEqual(0.85);
  });
});
```

---

## Reference Links

- [OpenTelemetry LLM Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [Langfuse Open Source LLM Engineering Platform](https://langfuse.com/)
- [RAGAS — Retrieval Augmented Generation Assessment](https://docs.ragas.io/)
- [Helicone AI Gateway & Observability](https://helicone.ai/)
- [OpenAI API — Usage & Cost Tracking](https://platform.openai.com/usage)
- [NeMo Guardrails Documentation](https://docs.nvidia.com/nemo/guardrails/)
- [OpenAI — Evals Framework](https://github.com/openai/evals)
- [Weights & Biases — Prompts](https://docs.wandb.ai/guides/prompts)
- [Anthropic — Building Evaluations](https://www.anthropic.com/engineering/building-evaluations)
- [Google Cloud — Responsible AI](https://cloud.google.com/responsible-ai)
- [Microsoft Azure — Content Safety](https://azure.microsoft.com/en-us/products/ai-services/ai-content-safety/)
- [Pinecone — LLM Observability Patterns](https://www.pinecone.io/learn/llm-observability/)
- [Honeycomb — AI Observability](https://www.honeycomb.io/blog/ai-observability)
- [The Lancet — LLM Evaluation Benchmarks](https://www.thelancet.com/journals/landig/article/PIIS2589-7500(24)00056-X/fulltext)

---

*English summary. Full Chinese guide: `../30.1-guides/ai-observability-guide.md`.*

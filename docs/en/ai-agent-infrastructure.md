# AI Agent Infrastructure Guide

> English summary of the AI Agent infrastructure landscape for JavaScript/TypeScript developers. Covers MCP, A2A, Vercel AI SDK, Mastra, LangGraph, CrewAI, OpenAI Agents SDK, observability, and security governance.
>
> **Data as of**: April 2026

---

## Overview: Why Full-Stack TS Developers Must Care

By 2026, AI Agents have evolved from experimental concepts to production-grade architectural components. For full-stack TypeScript developers, Agent infrastructure is no longer optional — it is as critical as frontend frameworks, backend APIs, and databases.

### Key Shifts for Traditional Full-Stack Developers

| Concern | Traditional Full-Stack | AI Agent Full-Stack |
|---------|----------------------|---------------------|
| Interaction | Request-response | Streaming dialogue + tool-call loops |
| State management | Redux / Zustand | Long-term Memory + session context |
| External integration | REST API | MCP Server + A2A protocol |
| Observability | APM (Datadog / New Relic) | LLM Traces + Token cost tracking |
| Security | OAuth + RBAC | Prompt-injection defense + tool permission boundaries |

---

## Core Protocols

### MCP (Model Context Protocol)

- **Maintainer**: Linux Foundation AAIF (donated by Anthropic)
- **Downloads**: 97M+ monthly (npm, 2026-04)
- **Core idea**: The "USB-C" for AI — a unified interface for LLMs to connect to external tools, data sources, and context.
- **Primitives**: Tools (functions), Resources (read-only data), Prompts (templates), Sampling (reverse LLM calls).
- **Transport**: stdio (local CLI), SSE (web), HTTP (stateless).

### A2A (Agent-to-Agent Protocol)

- **Maintainer**: Google / Linux Foundation
- **Core idea**: Enables interoperability between Agents built with different frameworks and vendors.
- **Relationship to MCP**: MCP solves "Agent ↔ Tool"; A2A solves "Agent ↔ Agent".

---

## Framework Comparison

| Framework | Positioning | Stars / Downloads | Best For |
|-----------|-------------|-------------------|----------|
| **Vercel AI SDK v6** | Unified 100+ model API + Agent orchestration | 2M+ weekly downloads | Next.js full-stack chat apps |
| **Mastra** | TS-first workflow + memory + multi-Agent | 10k+ Stars, 300K+ weekly | Enterprise automation, multi-role systems |
| **LangGraph** | Graph-based Agent workflow engine | 25k+ Stars, 34.5M+ monthly | Complex state machines, human-in-the-loop |
| **CrewAI** | Multi-Agent role-based collaboration | 46k+ Stars | Research teams, content pipelines |
| **OpenAI Agents SDK** | Official type-safe Agent toolkit | 19k+ Stars | Deep OpenAI ecosystem, rapid prototypes |
| **Cloudflare Agents SDK** | Edge-native stateful Agent runtime | 3k+ Stars | Global low-latency real-time AI |

---

## Architecture Patterns

| Pattern | Description | Typical Frameworks |
|---------|-------------|-------------------|
| **ReAct** | Thought → Action → Observation loop | Vercel AI SDK, OpenAI Agents SDK |
| **Plan-and-Execute** | Multi-step plan then sequential execution | LangGraph, Mastra |
| **Multi-Agent Collaboration** | Specialist Agents collaborate via A2A / message bus | CrewAI, LangGraph |
| **Human-in-the-Loop** | Human approval at critical decision points | LangGraph, Mastra |
| **RAG + Agent Hybrid** | Retrieval-augmented generation combined with tool calling | LangChain.js, Mastra |

---

## Observability & Security

### Observability Tools

| Tool | Open Source | Core Capabilities |
|------|-------------|-------------------|
| **Langfuse** | ✅ MIT | Traces, Evaluations, Prompt Management, Metrics |
| **Helicone** | Partial | Gateway, caching, cost tracking, experiment management |
| **Traceloop** | ✅ | OpenTelemetry-native auto-instrumentation |

### Key Metrics

- **Cost**: Token consumption (input/output), API cost per request, tool-call frequency.
- **Quality**: Trace completeness, task success rate, human feedback score (RLHF).
- **Performance**: TTFT (time to first token), end-to-end latency, stream stutter rate.
- **Security**: Prompt-injection detection, sensitive-data leakage, over-authorized tool calls.

### Security Best Practices

1. **Prompt Injection Defense**: Structured templates (MCP Prompts) to isolate system instructions from user input.
2. **Least-Privilege Tool Access**: Dynamically register tools per session context; never expose all tools globally.
3. **Jailbreak Detection**: Multi-layer defense (input classification → model moderation → output rules → behavioral anomaly detection).

---

## Decision Tree

```
Start: Choose AI Agent Framework
├── Need UI streaming output?
│   ├── YES → Using Next.js?
│   │   ├── YES → Vercel AI SDK (native RSC streaming)
│   │   └── NO → Need edge deployment?
│   │       ├── YES → Vercel AI SDK (Edge Runtime)
│   │       └── NO → Mastra or OpenAI Agents SDK
│   └── NO → Need multi-Agent collaboration?
│       ├── YES → Workflow complexity?
│       │   ├── Simple Handoffs → OpenAI Agents SDK
│       │   ├── Complex DAG / State Machine → Mastra
│       │   └── Graph + Human-in-the-Loop → LangGraph
│       └── NO → Deeply tied to OpenAI?
│           ├── YES → OpenAI Agents SDK
│           └── NO → Need smallest bundle?
│               ├── YES → Vercel AI SDK (~25KB core)
│               └── NO → Mastra
└── Need MCP tool ecosystem?
    ├── YES → Vercel AI SDK (native MCP) / Mastra (community)
    └── NO → Standard Tool Calling
```

### Quick Recommendations

| Scenario | Recommendation |
|----------|----------------|
| Next.js full-stack chat | **Vercel AI SDK** |
| Complex business automation | **Mastra** |
| Deep RAG system | **LangChain.js** |
| OpenAI-native Agent | **OpenAI Agents SDK** |
| Global edge low-latency | **Cloudflare Agents SDK** |
| Multi-role research team | **CrewAI** |
| Enterprise multi-Agent platform | **Mastra + Langfuse** |

---

*For the full Chinese version, see [../categories/28-ai-agent-infrastructure.md](../categories/28-ai-agent-infrastructure.md)*

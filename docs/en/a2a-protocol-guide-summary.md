# A2A Protocol Guide — English Summary

> Full Chinese version: [`docs/guides/a2a-protocol-guide.md`](../guides/a2a-protocol-guide.md)

## Overview

The **Agent-to-Agent (A2A) Protocol** (announced by Google in April 2025) is an open standard for AI agent interoperability, enabling multi-agent collaboration across different frameworks and vendors.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Agent Card** | JSON-based capability advertisement (skills, endpoints, auth) |
| **Task** | Unit of work with lifecycle: submitted → working → input-required → completed/failed |
| **Artifact** | Structured output (text, file, JSON) produced by an agent |
| **Message** | Communication primitive between client and remote agent |

## Transport Layer

- **Primary**: JSON-RPC 2.0 over HTTP/2 with Server-Sent Events (SSE) for streaming
- **Alternative**: gRPC for high-throughput scenarios
- **Authentication**: OAuth 2.0 / JWT / API Key

## Comparison with MCP

| Dimension | MCP (Anthropic) | A2A (Google) |
|-----------|-----------------|--------------|
| Scope | Tool/resource discovery for single agent | Multi-agent collaboration and task delegation |
| Protocol | JSON-RPC 2.0 | JSON-RPC 2.0 + SSE |
| Ecosystem | LangChain, OpenAI, Vercel AI SDK | Google ADK, LangGraph, CrewAI |
| Status | Open standard, 97M+ monthly downloads | Industry standard, major vendor adoption |

## Key Implementations

- **Google ADK**: Official Python/TypeScript SDK
- **LangGraph**: Native A2A support for multi-agent workflows
- **CrewAI**: A2A-compatible agent orchestration

---

> 📅 Summary generated: 2026-04-27

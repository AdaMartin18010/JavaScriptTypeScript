# LLM Security Guide — English Summary

> Full Chinese version: [`docs/guides/llm-security-guide.md`](../guides/llm-security-guide.md)

## Overview

LLM Security addresses unique risks introduced by AI integration: prompt injection, model extraction, data leakage, and output manipulation.

## Threat Taxonomy

| Threat | Severity | Description |
|--------|----------|-------------|
| **Prompt Injection** | 🔴 Critical | Malicious input overrides system instructions |
| **Indirect Prompt Injection** | 🔴 Critical | Adversarial data in external sources (RAG, web) |
| **Model Extraction** | 🟠 High | Systematic querying to reconstruct model weights |
| **Data Leakage** | 🟠 High | Training data or sensitive prompts exposed in outputs |
| **Jailbreaking** | 🟡 Medium | Bypassing safety guardrails through social engineering |
| **Supply Chain** | 🟡 Medium | Compromised models, datasets, or LoRA adapters |

## Defense Strategies

| Strategy | Implementation | Effectiveness |
|----------|---------------|---------------|
| **Input Validation** | Structured schemas + regex filters | 60-70% |
| **Prompt Hardening** | Delimiter separation, instruction defense | 40-50% |
| **Output Filtering** | Regex + LLM-as-judge for toxic/PII content | 70-80% |
| **Least Privilege** | Sandboxed tool execution, no direct DB access | 80-90% |
| **Rate Limiting** | Per-user token budgets, anomaly detection | 50-60% |
| **Human-in-the-Loop** | Human approval for high-stakes operations | 95%+ |

## OWASP LLM Top 10 (2025)

1. LLM01: Prompt Injection
2. LLM02: Insecure Output Handling
3. LLM03: Training Data Poisoning
4. LLM04: Model Denial of Service
5. LLM05: Supply Chain Vulnerabilities
6. LLM06: Sensitive Information Disclosure
7. LLM07: Insecure Plugin Design
8. LLM08: Excessive Agency
9. LLM09: Overreliance
10. LLM10: Model Theft

---

> 📅 Summary generated: 2026-04-27

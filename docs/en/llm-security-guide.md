# LLM Security Guide

> Security threats and defense strategies for AI-driven applications. Covers OWASP LLM Top 10 with actionable engineering solutions.

---

## 1. Threat Model

LLM applications have fundamentally different attack surfaces:

- **Prompt Injection**: Direct and indirect manipulation of system instructions
- **Model Extraction**: Reconstructing model capabilities through queries
- **PII Leakage**: Training data containing sensitive information
- **Jailbreaking**: Bypassing safety alignment
- **Tool Poisoning**: Malicious tool definitions

## 2. Defense Layers

```
Input → [Sanitization] → [Prompt Guard] → [Model] → [Output Validation] → Response
           ↓                    ↓              ↓            ↓
        Rate Limiting      Pattern Detection   Safety API   Schema Validation
```

## 3. Checklist

- [ ] Input sanitization and length limits
- [ ] Output schema validation (Zod / JSON Schema)
- [ ] Prompt versioning and drift detection
- [ ] Tool permission boundaries
- [ ] PII detection and filtering
- [ ] Rate limiting per user/IP
- [ ] Audit logging for all LLM calls
- [ ] Human-in-the-loop for sensitive operations

*For the full Chinese version, see [../guides/llm-security-guide.md](../guides/llm-security-guide.md)*

# LLM Security Guide

> **English Summary** of `30.1-guides/llm-security-guide.md`

---

## Threat Model

```
LLM Application Attack Surface
├── Input Layer
│   ├── Prompt Injection
│   ├── Jailbreaking
│   └── Malicious context injection
├── Processing Layer
│   ├── Data poisoning
│   ├── Model extraction (API abuse)
│   └── Supply chain attacks
└── Output Layer
    ├── PII leakage
    ├── Hallucination propagation
    └── Harmful content generation
```

## Prompt Injection Defense

### Input Sanitization

```typescript
function sanitizeInput(userInput: string): string {
  const blocked = [
    /ignore previous instructions/i,
    /system prompt/i,
    /your new goal/i
  ];
  for (const pattern of blocked) {
    if (pattern.test(userInput)) {
      throw new Error('Potential prompt injection detected');
    }
  }
  return userInput;
}
```

### Output Validation

```typescript
import { z } from 'zod';
const ReviewSchema = z.object({
  issues: z.array(z.string()),
  severity: z.enum(['low', 'medium', 'high'])
});
```

## Security Checklist

- [ ] Input validation and filtering
- [ ] Prompt injection detection
- [ ] Output structured validation (Zod/Yup)
- [ ] PII automatic filtering
- [ ] Rate limiting (prevent API abuse)
- [ ] Cost alerts (abnormal token consumption)
- [ ] Model version locking
- [ ] Audit logs (Prompt + Response)
- [ ] Human review loop (high-risk operations)
- [ ] Emergency response plan

---

*English summary. Full Chinese guide: `../30.1-guides/llm-security-guide.md`.*

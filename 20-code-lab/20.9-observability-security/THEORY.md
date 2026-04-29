# 可观测性与安全：理论基础

> **定位**：`20-code-lab/20.9-observability-security/`
> **关联**：`10-fundamentals/10.1-language-semantics/theorems/jit-security-tension-theorem.md`

---

## 一、核心理论

### 1.1 可观测性三支柱

| 支柱 | 数据类型 | JS/TS 工具 |
|------|---------|-----------|
| **Metrics** | 数值时序数据 | Prometheus + Grafana |
| **Logs** | 结构化事件 | Pino, Winston, OpenTelemetry |
| **Traces** | 请求链路 | OpenTelemetry, Jaeger |

### 1.2 JIT 安全张力定理的工程含义

**定理回顾**：V8 的性能来源于激进 JIT 优化，而这些设计决策使类型混淆漏洞成为结构性风险。

**工程应对**：

- 浏览器层：V8 Sandbox 进程隔离
- 运行时层：Deno 权限模型
- 应用层：依赖审计 + 供应链安全

---

## 二、设计原理

### 2.1 可观测性的经济学

```
无观测性：
  故障发生 → 人工排查 → 数小时定位 → 修复

有观测性：
  告警触发 → 链路追踪 → 分钟级定位 → 修复

ROI = (MTTR_reduction × incident_frequency × revenue_impact) - observability_cost
```

### 2.2 安全分层防御

```
Layer 1: 输入验证（Zod/Yup）
Layer 2: 权限控制（RBAC/ACL）
Layer 3: 运行时沙箱（Deno permissions）
Layer 4: 依赖审计（npm audit / Snyk）
Layer 5: 基础设施隔离（容器/VM）
```

---

## 三、安全框架对比

| 框架 | 发布机构 | 覆盖范围 | 严格程度 | 适用阶段 | 验证方式 | JS/TS 生态工具 |
|------|---------|---------|---------|---------|---------|---------------|
| **OWASP ASVS** | OWASP | 应用安全验证 | 3 级（L1/L2/L3） | 全生命周期 | 检查清单 | `owasp-dependency-check`, `eslint-plugin-security` |
| **NIST SSDF** | NIST | 软件供应链安全 | 4 个实践组 | 开发阶段 | 流程审计 | `sigstore`, `SLSA` |
| **CIS Controls** | CIS | 企业安全控制 | 18 项控制 | 运维阶段 | 配置扫描 | `cis-kubernetes-benchmark` |
| **ISO 27001** | ISO | 信息安全管理 | 全面体系 | 组织级 | 外部审计 | 流程/策略文档 |
| **SLSA** | OpenSSF | 软件制品供应链 | 4 个等级 | 构建/发布 |  provenance 验证 | `sigstore/cosign`, GitHub attestations |
| **MITRE ATT&CK** | MITRE | 威胁建模 | 战术/技术矩阵 | 防御设计 | 红队演练 | 威胁情报集成 |

---

## 四、代码示例：Express 安全中间件（Security Headers + 基础防护）

```typescript
// security.ts — 生产级安全中间件配置
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// 1. Helmet：安全响应头集合
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // 生产环境移除 unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // 根据需求启用
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// 2. 速率限制
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每 IP 100 请求
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
});

// 3. CORS 精细化配置
export const corsOptions = cors({
  origin: (origin, callback) => {
    const whitelist = [
      'https://app.example.com',
      'https://admin.example.com',
    ];
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
});

// 4. 自定义安全中间件：请求签名验证 + 输入消毒
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // 添加安全响应头（Helmet 的补充）
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // 请求 ID 追踪
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);

  // 简单输入长度限制（防止基础 DoS）
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10 * 1024 * 1024) { // 10MB 限制
    return res.status(413).json({ error: 'Payload too large' });
  }

  next();
}

// 5. 应用组合示例
/*
import express from 'express';
const app = express();

app.use(securityHeaders);
app.use(corsOptions);
app.use('/api/', apiLimiter);
app.use(securityMiddleware);
app.use(express.json({ limit: '1mb' }));
*/
```

---

## 五、代码示例：OWASP ASVS Level 2 验证清单（TypeScript 类型）

```typescript
// asvs-checklist.ts — 结构化 ASVS 验证
interface ASVSRequirement {
  id: string;
  category: string;
  level: 1 | 2 | 3;
  description: string;
  verify: () => boolean;
}

const asvsAuthRequirements: ASVSRequirement[] = [
  {
    id: 'V2.1.1',
    category: 'Authentication',
    level: 1,
    description: '应用不使用默认凭证',
    verify: () => !process.env.DEFAULT_PASSWORD,
  },
  {
    id: 'V2.1.2',
    category: 'Authentication',
    level: 2,
    description: '密码最小长度 12 字符',
    verify: () => {
      const policy = getPasswordPolicy();
      return policy.minLength >= 12;
    },
  },
  {
    id: 'V2.2.1',
    category: 'Authentication',
    level: 2,
    description: '多因素认证支持',
    verify: () => isMFAEnabled(),
  },
  {
    id: 'V2.5.1',
    category: 'Session',
    level: 2,
    description: '会话令牌具有足够熵值',
    verify: () => getSessionEntropy() >= 128,
  },
];

function runASVSCheck(requirements: ASVSRequirement[], targetLevel: 1 | 2 | 3) {
  const applicable = requirements.filter((r) => r.level <= targetLevel);
  const results = applicable.map((r) => ({
    ...r,
    passed: r.verify(),
  }));

  const passed = results.filter((r) => r.passed).length;
  console.log(`ASVS Level ${targetLevel}: ${passed}/${results.length} passed`);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.warn('Failed requirements:', failed.map((f) => f.id));
  }

  return { passed, total: results.length, failed };
}
```

---

## 六、扩展阅读

- `10-fundamentals/10.1-language-semantics/theorems/jit-security-tension-theorem.md`
- `30-knowledge-base/30.1-guides/llm-security-guide.md`

---

## 七、权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **OWASP ASVS** | 应用安全验证标准 4.0 | [owasp.org/www-project-application-security-verification-standard](https://owasp.org/www-project-application-security-verification-standard/) |
| **NIST SSDF** | 安全软件开发框架 | [nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-security-supply-chains-software-1](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-security-supply-chains-software-1) |
| **CIS Controls** | 企业安全控制基线 | [cisecurity.org/controls](https://www.cisecurity.org/controls) |
| **SLSA** | 软件制品供应链等级 | [slsa.dev](https://slsa.dev/) |
| **Sigstore** | 开源软件签名生态 | [sigstore.dev](https://www.sigstore.dev/) |
| **OWASP Top 10** | 十大 Web 安全风险 | [owasp.org/Top10](https://owasp.org/Top10/) |
| **npm audit** | Node.js 依赖安全审计 | [docs.npmjs.com/cli/commands/npm-audit](https://docs.npmjs.com/cli/commands/npm-audit) |
| **Snyk** | 开发者安全平台 | [snyk.io](https://snyk.io/) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

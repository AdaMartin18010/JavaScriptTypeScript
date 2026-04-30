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

## 六、代码示例：OpenTelemetry 自动埋点与链路追踪

```typescript
// telemetry.ts — Node.js 服务端 OpenTelemetry 自动埋点
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // 减少噪声
    }),
  ],
});

sdk.start();

// 优雅关闭
process.on('SIGTERM', () => sdk.shutdown().then(() => process.exit(0)));
```

## 七、代码示例：结构化日志与关联 ID

```typescript
// structured-logger.ts — Pino 结构化日志 + 请求上下文关联
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'api-gateway', version: '1.2.0' },
  formatters: {
    level(label) { return { level: label }; },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// 请求级子日志（自动附加 requestId）
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}

// 使用示例
app.use((req, res, next) => {
  req.log = createRequestLogger(req.id, req.user?.id);
  req.log.info({ method: req.method, path: req.path }, 'incoming request');
  next();
});

// 输出（JSON，可直接被 Loki / Datadog 索引）：
// {"level":"info","time":"2026-04-29T08:00:00.000Z","service":"api-gateway","version":"1.2.0","requestId":"uuid","userId":"u-123","method":"GET","path":"/api/users","msg":"incoming request"}
```

## 八、代码示例：Deno 权限模型与安全运行

```typescript
// deno-secure-run.ts — Deno 细粒度权限控制示例
// 运行方式：
// deno run --allow-net=api.example.com --allow-read=/tmp/data --allow-env=API_KEY app.ts

// 运行时检测权限（防御性编程）
const netPerm = await Deno.permissions.query({ name: 'net', host: 'api.example.com' });
if (netPerm.state !== 'granted') {
  console.error('Network permission to api.example.com is required');
  Deno.exit(1);
}

// 受限文件系统访问
const data = await Deno.readTextFile('/tmp/data/config.json');

// 受控网络请求
const res = await fetch('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${Deno.env.get('API_KEY')}` },
});

// Deno 的权限模型让供应链攻击面显著缩小：
// - 无文件系统默认访问
// - 无网络默认访问
// - 无环境变量默认访问
```

## 九、代码示例：Prometheus 自定义指标端点

```typescript
// metrics.ts — Node.js 应用暴露 Prometheus 格式指标
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

// 自定义指标
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active WebSocket / SSE connections',
  registers: [register],
});

const failedLogins = new Counter({
  name: 'failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['reason'],
  registers: [register],
});

// Express 中间件：自动记录请求耗时
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path ?? 'unknown', status_code: res.statusCode });
  });
  next();
}

// 指标暴露端点（Prometheus 每 15s 拉取）
export async function metricsHandler(_req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
```

## 十、代码示例：JWT 边缘验证中间件（jose + Web Crypto）

```typescript
// jwt-edge.ts — 零依赖边缘 JWT 验证（Cloudflare Workers / Deno / Node 18+）
import { jwtVerify, createRemoteJWKSet } from 'jose';

interface JWTPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

// 使用 Auth0 / Clerk / 自建 JWKS 端点
const JWKS = createRemoteJWKSet(new URL('https://my-auth.example.com/.well-known/jwks.json'));

export async function verifyJWTEdge(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://my-auth.example.com/',
    audience: 'my-api',
    clockTolerance: 60,
  });
  return payload as unknown as JWTPayload;
}

// Hono / Cloudflare Workers 中间件
export async function authMiddleware(c: any, next: () => Promise<void>) {
  const header = c.req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing token' }, 401);
  }
  try {
    const payload = await verifyJWTEdge(header.slice(7));
    c.set('jwt', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
```

## 十一、代码示例：依赖供应链审计脚本

```typescript
// audit-supply-chain.ts — 自动化依赖漏洞与许可证审计
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

interface AuditResult {
  package: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  CVE?: string;
  patchedIn?: string;
}

function runNpmAudit(): AuditResult[] {
  const output = execSync('npm audit --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  const parsed = JSON.parse(output);
  return Object.values(parsed.vulnerabilities ?? {}).map((v: any) => ({
    package: v.name,
    severity: v.severity,
    CVE: v.via?.[0]?.cves?.[0],
    patchedIn: v.range,
  }));
}

function checkLicenseCompliance(allowedLicenses: string[]): string[] {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const violations: string[] = [];

  // 简化示例：实际应使用 license-checker / fossa
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name] of Object.entries(deps)) {
    try {
      const depPkg = JSON.parse(readFileSync(`./node_modules/${name}/package.json`, 'utf-8'));
      const license = depPkg.license || depPkg.licenses?.[0]?.type || 'UNKNOWN';
      if (!allowedLicenses.some((l) => license.toLowerCase().includes(l.toLowerCase()))) {
        violations.push(`${name}: ${license}`);
      }
    } catch {
      violations.push(`${name}: unable to read`);
    }
  }
  return violations;
}

// CI 管道调用
const audits = runNpmAudit();
const critical = audits.filter((a) => a.severity === 'critical' || a.severity === 'high');
if (critical.length > 0) {
  console.error('Critical vulnerabilities found:', critical);
  process.exit(1);
}

const licenseIssues = checkLicenseCompliance(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC']);
if (licenseIssues.length > 0) {
  console.warn('License compliance issues:', licenseIssues);
}
```

---

## 九、扩展阅读

- `10-fundamentals/10.1-language-semantics/theorems/jit-security-tension-theorem.md`
- `30-knowledge-base/30.1-guides/llm-security-guide.md`

---

## 十、权威参考与外部链接

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
| **OpenTelemetry** | 可观测性标准 | [opentelemetry.io](https://opentelemetry.io/) |
| **OpenTelemetry JS** | Node.js 官方 SDK | [opentelemetry.io/docs/languages/js](https://opentelemetry.io/docs/languages/js/) |
| **Pino — Fast JSON Logger** | 仓库 | [github.com/pinojs/pino](https://github.com/pinojs/pino) |
| **Helmet.js** | Express 安全头中间件 | [helmetjs.github.io](https://helmetjs.github.io/) |
| **express-rate-limit** | 限流中间件 | [github.com/express-rate-limit/express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| **Deno Permissions** | 官方文档 | [docs.deno.com/runtime/fundamentals/security](https://docs.deno.com/runtime/fundamentals/security/) |
| **Prometheus** | 时序数据库 | [prometheus.io](https://prometheus.io/) |
| **Grafana** | 可视化平台 | [grafana.com](https://grafana.com/) |
| **Jaeger — Distributed Tracing** | 官方文档 | [jaegertracing.io](https://www.jaegertracing.io/) |
| **MITRE ATT&CK Matrix** | 威胁框架 | [attack.mitre.org](https://attack.mitre.org/) |
| **GitHub Security Advisories** | 平台 | [github.com/advisories](https://github.com/advisories) |
| **CSP Evaluator (Google)** | 工具 | [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com/) |
| **Prometheus Documentation** | 官方文档 | [prometheus.io/docs](https://prometheus.io/docs/) |
| **Grafana Documentation** | 官方文档 | [grafana.com/docs](https://grafana.com/docs/) |
| **OpenTelemetry Collector** | 官方文档 | [opentelemetry.io/docs/collector](https://opentelemetry.io/docs/collector/) |
| **jose — JWT Library** | 仓库 | [github.com/panva/jose](https://github.com/panva/jose) |
| **Node.js Permission Model** | 官方文档 | [nodejs.org/api/permissions](https://nodejs.org/api/permissions.html) |
| **OWASP Cheat Sheet Series** | 指南 | [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/) |
| **CWE — Common Weakness Enumeration** | 规范 | [cwe.mitre.org](https://cwe.mitre.org/) |
| **NVD — National Vulnerability Database** | 数据库 | [nvd.nist.gov](https://nvd.nist.gov/) |
| **Sigstore / Cosign** | 官方文档 | [docs.sigstore.dev](https://docs.sigstore.dev/) |
| **osv.dev** | 平台 | [osv.dev](https://osv.dev/) |
| **lockfile-lint** | 仓库 | [github.com/lirantal/lockfile-lint](https://github.com/lirantal/lockfile-lint) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

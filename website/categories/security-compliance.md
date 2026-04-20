
# 安全与合规工具

> 本文档盘点 JavaScript/TypeScript 生态中用于依赖安全、代码安全、运行时安全和合规审计的主流工具与库。覆盖 SCA（软件成分分析）、SAST（静态应用安全测试）、运行时防护和许可证合规等维度。
>

## 🧪 关联代码实验室

> **2** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [21-api-security](../../jsts-code-lab/21-api-security/) | 🌳 | 3 | 3 |
| [38-web-security](../../jsts-code-lab/38-web-security/) | 🌿 | 1 | 1 |


---

## 📊 整体概览

| 类别 | 代表工具 | 定位 | Stars / 知名度 |
|------|----------|------|----------------|
| 依赖安全 | Snyk | 商业 SCA 平台 | 行业领先 |
| 依赖安全 | Dependabot | GitHub 原生 | 内置免费 |
| 依赖安全 | Socket.dev | 供应链安全 | 新兴热门 |
| 依赖安全 | npm audit | npm 内置 | 免费基础 |
| 代码安全 | SonarQube | 代码质量 + 安全 | 行业领先 |
| 代码安全 | CodeQL | GitHub 语义分析 | 免费 |
| 代码安全 | Semgrep | 轻量静态分析 | 12k+ |
| 代码安全 | ESLint Security | 安全规则插件 | 8k+ |
| 运行时安全 | Helmet | HTTP 头安全 | 10k+ |
| 运行时安全 | express-rate-limit | 限流中间件 | 8k+ |
| 合规 | FOSSA | 许可证合规 | 商业 |
| 合规 | license-checker | 许可证扫描 CLI | 2k+ |

---

## 1. 依赖安全（SCA）

### 1.1 Snyk

| 属性 | 详情 |
|------|------|
| **名称** | Snyk |
| **定位** | 商业级软件成分分析（SCA）与安全平台 |
| **TS支持** | ✅ CLI 和 IDE 插件支持 |
| **官网** | [snyk.io](https://snyk.io) |

**一句话描述**：业界领先的开发者安全平台，覆盖依赖漏洞扫描、容器安全、代码安全和 IaC 安全，以精确的漏洞数据库和修复建议著称。

**核心特点**：

- 精确的漏洞数据库（CVE 关联与优先级评分）
- 自动 PR 修复（Auto-fix Pull Requests）
- 许可证合规扫描
- 容器镜像和 Kubernetes 配置扫描
- IDE 插件（VS Code、IntelliJ）实时检测
- 与 GitHub/GitLab/Bitbucket 深度集成

**适用场景**：

- 企业级安全治理
- 需要自动化修复建议的团队
- 多语言混合项目（JS/TS + Python + Go）

```bash
# 安装 Snyk CLI
npm install -g snyk

# 认证
snyk auth

# 扫描项目依赖
snyk test

# 监控生产依赖（持续监控新漏洞）
snyk monitor

# 扫描 Docker 镜像
snyk container test my-image:latest
```

---

### 1.2 Dependabot

| 属性 | 详情 |
|------|------|
| **名称** | Dependabot |
| **定位** | GitHub 原生依赖漏洞与更新工具 |
| **官网** | [docs.github.com/code-security/dependabot](https://docs.github.com/code-security/dependabot) |

**一句话描述**：GitHub 免费内置的依赖监控和自动更新服务，为每个仓库自动检测漏洞并发起版本升级 PR。

**核心特点**：

- 完全免费，GitHub 仓库一键启用
- 自动创建漏洞修复 PR
- 支持 npm、yarn、pnpm、Docker、GitHub Actions 等
- 可配置更新频率和忽略规则
- 与 GitHub Security Advisories 联动

**适用场景**：

- 所有 GitHub 托管项目的基础安全防线
- 希望零成本获得自动更新提醒的团队

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        patterns:
          - '*eslint*'
          - '*prettier*'
          - '*vitest*'
```

---

### 1.3 Socket.dev

| 属性 | 详情 |
|------|------|
| **名称** | Socket.dev |
| **定位** | 供应链安全与恶意包检测 |
| **TS支持** | ✅ GitHub App + CLI |
| **官网** | [socket.dev](https://socket.dev) |

**一句话描述**：专注于 JavaScript 供应链安全的新兴平台，不仅检测已知 CVE，还分析包行为以识别恶意代码（如 typosquatting、混淆代码）。

**核心特点**：

- 行为分析：检测 install/postinstall 脚本中的恶意行为
- 供应链风险评估：维护者变更、权限提升监测
- Typosquatting 检测（仿冒流行包名）
- PR 实时扫描：在合并前阻止恶意依赖引入

**适用场景**：

- 对供应链攻击（Supply Chain Attack）高度敏感的企业
- 需要超越传统 CVE 扫描的深度安全分析

---

### 1.4 OWASP Dependency-Check

| 属性 | 详情 |
|------|------|
| **名称** | OWASP Dependency-Check |
| **定位** | 开源 SCA 工具 |
| **官网** | [owasp.org/www-project-dependency-check](https://owasp.org/www-project-dependency-check/) |

**一句话描述**：OWASP 出品的开源依赖漏洞扫描器，通过比对 NVD（National Vulnerability Database）检测已知漏洞。

**核心特点**：

- 完全开源免费
- 支持多种语言（JS 通过 package-lock.json）
- 生成 HTML/JSON/XML 报告
- CLI 和 CI 插件

**局限**：

- JavaScript 生态支持不如 Snyk 精确
- 需要定期更新漏洞数据库
- 误报率相对较高

---

### 1.5 npm audit

| 属性 | 详情 |
|------|------|
| **名称** | npm audit |
| **定位** | npm 内置漏洞扫描 |

**一句话描述**：npm 自带的依赖安全审计命令，基于 npm Advisory Database 检测项目中的已知漏洞。

**核心特点**：

- 零安装，npm 内置
- `npm audit fix` 自动修复可升级漏洞
- 与 `package-lock.json` 联动
- CI 友好（`npm audit --audit-level=moderate`）

**局限**：

- 数据库覆盖不如 Snyk 全面
- 无法检测恶意包（仅已知 CVE）
- 修复建议可能引入破坏性变更

```bash
# 审计依赖
npm audit

# 只显示高危以上
npm audit --audit-level=high

# 自动修复
npm audit fix

# CI 中阻断构建
npm audit --audit-level=moderate
```

---

## 2. 代码安全（SAST）

### 2.1 SonarQube

| 属性 | 详情 |
|------|------|
| **名称** | SonarQube |
| **Stars** | ⭐ 8,500+ |
| **定位** | 代码质量与安全性分析平台 |
| **GitHub** | [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) |
| **官网** | [sonarsource.com/products/sonarqube](https://www.sonarsource.com/products/sonarqube) |

**一句话描述**：业界最广泛使用的代码质量和安全分析平台，覆盖 30+ 语言，通过规则引擎检测 Bug、漏洞和代码异味。

**核心特点**：

- 全面的规则库（Bug、漏洞、代码异味、安全热点）
- 增量分析（只分析变更代码）
- 技术债务量化（Debt ratio）
- 与 CI 集成，质量门禁（Quality Gate）阻断不达标代码
- SonarCloud：SaaS 版本，开源项目免费

**适用场景**：

- 需要统一代码质量和安全标准的企业
- 多语言混合项目
- 需要质量门禁和趋势报告的团队

```yaml
# GitHub Actions 集成示例
- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

### 2.2 CodeQL

| 属性 | 详情 |
|------|------|
| **名称** | CodeQL |
| **定位** | 语义代码分析引擎 |
| **官网** | [codeql.github.com](https://codeql.github.com) |

**一句话描述**：GitHub 开发的语义代码分析引擎，将代码转化为可查询的数据库，通过类 SQL 的 QL 语言发现深层安全漏洞。

**核心特点**：

- 语义分析（非正则匹配），检测复杂数据流漏洞
- GitHub Advanced Security 原生集成
- 自动为 PR 创建安全告警
- 支持自定义 QL 查询规则
- 对开源项目免费

**适用场景**：

- GitHub 托管的项目
- 需要深度数据流分析（如 SQL 注入路径追踪）
- 开源项目（免费使用）

```yaml
# .github/workflows/codeql.yml
name: "CodeQL"
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
```

---

### 2.3 Semgrep

| 属性 | 详情 |
|------|------|
| **名称** | Semgrep |
| **Stars** | ⭐ 12,000+ |
| **定位** | 轻量级静态分析工具 |
| **GitHub** | [returntocorp/semgrep](https://github.com/returntocorp/semgrep) |
| **官网** | [semgrep.dev](https://semgrep.dev) |

**一句话描述**：以速度和易用性著称的静态分析工具，规则语法类似代码本身，学习成本极低，社区规则库丰富。

**核心特点**：

- 规则编写简单（类代码模式匹配）
- 扫描速度极快（比传统 SAST 快 10-100 倍）
- 丰富的规则注册表（OWASP、CWE、框架专用）
- 支持本地扫描和 CI 集成
- Semgrep Supply Chain（依赖漏洞扫描）

**适用场景**：

- 需要快速引入 SAST 的团队
- 希望自定义安全规则的项目
- 本地开发阶段前置安全检测

```bash
# 安装
npm install -g @semgrep/semgrep

# 扫描项目
semgrep --config=auto .

# 指定规则集
semgrep --config=p/security-audit --config=p/owasp-top-ten .

# 仅扫描变更文件（CI 加速）
semgrep --diff --config=auto
```

---

### 2.4 ESLint Security Plugin

| 属性 | 详情 |
|------|------|
| **名称** | eslint-plugin-security |
| **Stars** | ⭐ 8,000+ |
| **定位** | ESLint 安全规则集 |
| **GitHub** | [eslint-community/eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security) |

**一句话描述**：ESLint 社区维护的安全规则插件，在编码阶段检测常见的 Node.js 安全陷阱。

**核心规则**：

- `detect-eval-with-expression`：检测不安全的 `eval()`
- `detect-non-literal-fs-filename`：检测动态文件路径（路径遍历）
- `detect-unsafe-regex`：检测可能 ReDoS 的正则表达式
- `detect-no-csrf-before-method-override`：CSRF 防护顺序检测
- `detect-buffer-noassert`：Buffer 读取边界检测

```bash
npm install -D eslint-plugin-security
```

```javascript
// .eslintrc.cjs
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'warn',
  },
};
```

---

## 3. 运行时安全

### 3.1 Helmet

| 属性 | 详情 |
|------|------|
| **名称** | Helmet |
| **Stars** | ⭐ 10,000+ |
| **定位** | Express / Node.js HTTP 头安全中间件 |
| **GitHub** | [helmetjs/helmet](https://github.com/helmetjs/helmet) |

**一句话描述**：Express 生态必备的安全中间件，通过设置 11+ 个 HTTP 安全头（CSP、HSTS、X-Frame-Options 等）减少常见 Web 攻击面。

**核心功能**：

| 头字段 | 防护目标 |
|--------|----------|
| `Content-Security-Policy` | XSS、数据注入 |
| `Strict-Transport-Security` | SSL 剥离攻击 |
| `X-Frame-Options` | Clickjacking |
| `X-Content-Type-Options` | MIME 嗅探攻击 |
| `Referrer-Policy` | 隐私泄漏 |
| `Permissions-Policy` | 限制浏览器 API |

```typescript
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

### 3.2 CORS

```typescript
import cors from 'cors';

// 生产环境应明确配置允许的来源
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowlist = ['https://app.example.com', 'https://admin.example.com'];
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

---

### 3.3 Rate Limiting

| 属性 | 详情 |
|------|------|
| **名称** | express-rate-limit |
| **Stars** | ⭐ 8,000+ |
| **GitHub** | [express-rate-limit/express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// 基础限流
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100,                 // 每 IP 100 请求
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 严格限流（登录、注册等敏感端点）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
});

// 分布式限流（Redis 存储）
const distributedLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', strictLimiter);
```

---

### 3.4 CSRF Protection

```typescript
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

const csrfProtection = csurf({ cookie: true });

app.use(cookieParser());
app.use(csrfProtection);

// 获取 CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

> ⚠️ **注意**：CSRF 防护在现代 SPA + JWT（存 localStorage）架构中作用有限。Cookie-based 认证仍需 CSRF 防护。

---

## 4. 合规与许可证

### 4.1 FOSSA

| 属性 | 详情 |
|------|------|
| **名称** | FOSSA |
| **定位** | 商业许可证合规与 SBOM 平台 |
| **官网** | [fossa.com](https://fossa.com) |

**一句话描述**：企业级开源许可证合规平台，自动生成 SBOM（软件物料清单），检测许可证冲突和政策违规。

**核心特点**：

- 自动识别所有依赖的许可证
- 策略引擎：自定义许可证黑白名单
- SBOM 生成（SPDX、CycloneDX 格式）
- Vulnerability + License 双扫描
- 与 CI/CD 集成阻断不合规依赖

---

### 4.2 license-checker

| 属性 | 详情 |
|------|------|
| **名称** | license-checker |
| **Stars** | ⭐ 2,000+ |
| **定位** | CLI 许可证扫描工具 |
| **GitHub** | [davglass/license-checker](https://github.com/davglass/license-checker) |

```bash
# 安装
npm install -g license-checker

# 扫描并输出 CSV
license-checker --csv --out licenses.csv

# 只列出指定许可证
license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;ISC'

# 排除私有包
license-checker --excludePrivatePackages
```

---

### 4.3 SOC 2 相关工具

SOC 2（Service Organization Control 2）是面向 SaaS 提供商的安全合规框架。JS/TS 项目涉及的工具链：

| 工具/服务 | 用途 |
|-----------|------|
| **Vanta** / **Drata** / **Secureframe** | 自动化 SOC 2 合规平台 |
| **GitHub Advanced Security** | 代码扫描、密钥检测、依赖审查 |
| **Snyk / Dependabot** | 漏洞管理和修复证据 |
| **1Password / HashiCorp Vault** | 机密管理和轮换 |
| **AWS Config / Azure Policy** | 云资源配置合规 |

---

## 5. 统一对比矩阵

### 5.1 依赖安全

| 工具 | Stars | 开源 | 恶意包检测 | 自动修复 PR | CI 集成 | 定价 |
|------|-------|:----:|:----------:|:-----------:|:-------:|------|
| **Snyk** | — | CLI 开源 | ✅ | ✅ | ⭐⭐⭐⭐⭐ | 免费额度 + 付费 |
| **Dependabot** | — | 内置 | ❌ | ✅ | ⭐⭐⭐⭐⭐ | 免费 |
| **Socket.dev** | — | 部分 | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ | 免费开源 + 付费 |
| **npm audit** | — | 内置 | ❌ | ⚠️ | ⭐⭐⭐ | 免费 |
| **OWASP DC** | — | ✅ | ❌ | ❌ | ⭐⭐⭐ | 免费 |

### 5.2 代码安全

| 工具 | Stars | 开源 | SAST 深度 | 自定义规则 | JS/TS 支持 | 速度 |
|------|-------|:----:|:---------:|:----------:|:----------:|:----:|
| **SonarQube** | 8.5k+ | 社区版 | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | 中 |
| **CodeQL** | — | 免费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 慢 |
| **Semgrep** | 12k+ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 极快 |
| **ESLint Security** | 8k+ | ✅ | ⭐⭐⭐ | ⚠️ | ⭐⭐⭐⭐ | 快 |

### 5.3 运行时安全

| 工具 | Stars | 功能 | 框架 | 维护状态 |
|------|-------|------|------|----------|
| **Helmet** | 10k+ | HTTP 安全头 | Express / Koa / Fastify | ✅ 活跃 |
| **express-rate-limit** | 8k+ | 请求限流 | Express | ✅ 活跃 |
| **csurf** | — | CSRF Token | Express | ⚠️ 维护缓慢 |
| **cors** | — | 跨域控制 | Express / 通用 | ✅ 稳定 |

---

## 6. 选型建议

### 按阶段构建安全体系

```
Phase 1: 基础防护
├── Dependabot（自动依赖更新）
├── npm audit（CI 阻断）
├── Helmet（HTTP 安全头）
└── express-rate-limit（基础限流）

Phase 2: 深度检测
├── Snyk（SCA + 容器安全）
├── Semgrep（SAST 快速扫描）
├── ESLint Security（编码规范）
└── CodeQL（GitHub 深度分析）

Phase 3: 合规治理
├── SonarQube（质量门禁）
├── FOSSA（许可证合规）
├── GitHub Advanced Security（ Secrets 扫描）
└── Vanta/Drata（SOC 2 自动化）
```

### 按团队规模

| 规模 | 推荐组合 |
|------|----------|
| 个人/开源 | Dependabot + npm audit + Semgrep + Helmet |
| 初创（< 20人）| Snyk Free + Semgrep + CodeQL + Helmet + rate-limit |
| 中型（20-100人）| Snyk Team + SonarQube + Semgrep Pro + 完整运行时防护 |
| 企业（> 100人）| Snyk Enterprise + SonarQube Enterprise + FOSSA + SOC 2 平台 |

### 相关决策树

- 认证方案选型决策树

---

## 7. 最佳实践

1. **依赖冻结**：使用 `package-lock.json` / `pnpm-lock.yaml` 并锁定版本，避免浮动版本引入漏洞
2. **最小权限**：运行 Node.js 应用使用非 root 用户，容器以 `USER node` 运行
3. **Secrets 管理**：绝不在代码中硬编码密钥，使用环境变量 + 机密管理器
4. **自动更新策略**：Dependabot/Snyk 自动 PR + CI 自动化测试 + 人工审核合并
5. **纵深防御**：SAST + SCA + DAST + 运行时防护多层叠加
6. **安全头检查**：使用 [securityheaders.com](https://securityheaders.com) 验证生产环境 HTTP 头
7. **定期渗透测试**：每季度或重大发布前进行第三方安全审计

---

## 8. 安全速查表

```typescript
// ===== Express 应用安全启动模板 =====
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. 信任代理（若部署在反向代理后）
app.set('trust proxy', 1);

// 2. 安全头
app.use(helmet());

// 3. 跨域控制
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || [] }));

// 4. 请求体限制（防 DoS）
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. 全局限流
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
}));

// 6. 输入校验（配合 zod / joi）
// 7. 错误处理不泄漏堆栈
// 8. 日志记录安全事件
```

---

> 📅 本文档最后更新：2026年4月
>
> ⚠️ **安全提示**：安全是一个持续过程，非一次性配置。建议建立定期审查机制，跟踪新发现的 CVE 和攻击向量。

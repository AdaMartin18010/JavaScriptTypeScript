# Web 安全深度理论：从 XSS 到供应链攻击

> **目标读者**：全栈工程师、安全工程师、关注应用安全的架构师
> **关联文档**：``30-knowledge-base/30.2-categories/web-security.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 4,200 字

---

## 1. Web 安全威胁模型

### 1.1 OWASP Top 10 (2025-2026)

| 排名 | 威胁 | 影响 | 防护复杂度 |
|------|------|------|-----------|
| A01 | 访问控制失效 | 数据泄露、未授权操作 | 中 |
| A02 | 加密失败 | 敏感数据明文存储 | 低 |
| A03 | 注入攻击 (SQL/NoSQL/Command) | 数据篡改、服务器接管 | 中 |
| A04 | 不安全设计 | 架构级漏洞 | 高 |
| A05 | 安全配置错误 | 信息泄露、功能暴露 | 低 |
| A06 | 易受攻击的组件 | 依赖漏洞利用 | 中 |
| A07 | 认证失效 | 账户接管 | 中 |
| A08 | 数据完整性失效 | 篡改、伪造 | 中 |
| A09 | 日志监控不足 | 入侵未被发现 | 低 |
| A10 | SSRF | 内网渗透 | 中 |

**新增趋势（2025-2026）**：

- **AI 生成代码的漏洞**：LLM 生成的代码常包含已知漏洞模式
- **供应链攻击升级**：xz utils 后门事件后，依赖审查成为核心安全实践

---

## 2. 前端安全核心

### 2.1 XSS（跨站脚本攻击）

**三种类型**：

| 类型 | 触发方式 | 示例 | 防护 |
|------|---------|------|------|
| **Stored XSS** | 恶意脚本存储在服务器 | 评论框注入 `<script>` | 输出编码、CSP |
| **Reflected XSS** | 恶意脚本在 URL 中 | `?search=<script>alert(1)</script>` | 输入验证、编码 |
| **DOM-based XSS** | 前端 JS 不安全处理数据 | `innerHTML = location.hash` | 安全的 DOM API |

**现代防护矩阵**：

```javascript
// 危险
element.innerHTML = userInput;

// 安全：自动转义
element.textContent = userInput;

// 安全：DOMPurify 过滤
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

**Content Security Policy (CSP)**：

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### 2.2 CSRF（跨站请求伪造）

**原理**：用户已登录站点 A，访问恶意站点 B，B 自动发起对 A 的请求。

**防护策略**：

| 策略 | 实现 | 有效性 |
|------|------|--------|
| **SameSite Cookie** | `Set-Cookie: session=xxx; SameSite=Lax` | 99%+ |
| **CSRF Token** | 表单包含随机 token | 100% |
| **Origin/Referer 验证** | 检查请求来源 | 辅助手段 |
| **自定义 Header** | `X-Requested-With: XMLHttpRequest` | AJAX 请求有效 |

**推荐**：`SameSite=Lax` 为默认值，`SameSite=Strict` 用于敏感操作。

---

## 3. 后端安全核心

### 3.1 认证与授权

**现代认证栈（2026）**：

```
传统: Session + Cookie
  JWT (有状态/无状态)
  OAuth 2.1 + PKCE (第三方登录)
  Passkeys / WebAuthn (无密码)
```

**Passkeys 优势**：

- 防钓鱼（绑定域名）
- 无共享密钥
- 生物识别/设备 PIN

### 3.2 注入攻击防御

```typescript
// SQL 注入
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// 参数化查询 (Prisma)
const user = await prisma.user.findUnique({ where: { id: userId } });

// 参数化查询 (pg)
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

---

## 4. 供应链安全

### 4.1 依赖漏洞管理

**2024-2025 重大事件**：

- **xz utils 后门**：社会工程学攻击，潜伏 3 年
- **polyfill.io 劫持**：CDN 被恶意收购，注入跟踪代码

**防护策略**：

```bash
# 1. 定期扫描
npm audit
pnpm audit

# 2. 使用 lockfile，禁止浮动版本
# package-lock.json / pnpm-lock.yaml

# 3. 依赖审查 CI
# .github/workflows/dependency-review.yml

# 4. 私有的 npm registry
# Verdaccio / JFrog Artifactory

# 5. 签名验证
# npm audit signatures
```

### 4.2 SBOM（软件物料清单）

```json
{
  "spdxVersion": "SPDX-2.3",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-npm-lodash",
      "name": "lodash",
      "versionInfo": "4.17.21",
      "downloadLocation": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "checksums": [{ "algorithm": "SHA256", "checksumValue": "..." }]
    }
  ]
}
```

**法规要求**：美国 EO 14028 要求联邦政府软件提供 SBOM。

---

## 5. 安全测试方法论

### 5.1 自动化安全测试

| 测试类型 | 工具 | 时机 |
|---------|------|------|
| **SAST** | Semgrep, CodeQL, SonarQube | CI 中 |
| **DAST** | OWASP ZAP, Burp Suite | 部署后 |
| **SCA** | Snyk, Dependabot, Mend | CI + 定期 |
| **秘密扫描** | GitGuardian, truffleHog | 提交时 |

### 5.2 渗透测试清单

```markdown
- [ ] 所有输入点（URL参数、表单、Header、文件上传）
- [ ] 认证绕过（直接访问需授权的端点）
- [ ] 权限提升（普通用户到管理员）
- [ ] 敏感数据泄露（日志、错误信息、响应头）
- [ ] CSRF 防护验证
- [ ] 点击劫持（X-Frame-Options）
- [ ] 不安全的反序列化
- [ ] SSRF（服务器端请求伪造）
```

---

## 6. 代码示例

### HMAC 请求签名

```typescript
// hmac-request-signer.ts
import { createHmac, timingSafeEqual } from 'crypto';

function signRequest(payload: string, secret: string, timestamp: number): string {
  const data = `${timestamp}.${payload}`;
  return createHmac('sha256', secret).update(data).digest('hex');
}

function verifyRequest(payload: string, secret: string, timestamp: number, signature: string): boolean {
  const expected = signRequest(payload, secret, timestamp);
  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}
```

### Argon2id 密码哈希（Node.js 原生 crypto）

```typescript
// password-hashing.ts
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hashed, 'hex'), buf);
}
```

### 入侵检测日志分析器

```typescript
// intrusion-detection.ts
interface SecurityEvent {
  timestamp: number;
  sourceIp: string;
  action: string;
  path: string;
  statusCode: number;
  userAgent: string;
}

class SimpleIDS {
  private ipFailures = new Map<string, number[]>();
  private readonly THRESHOLD = 5;
  private readonly WINDOW_MS = 60_000;

  analyze(event: SecurityEvent): { alert: boolean; reason?: string } {
    if (event.statusCode < 400) return { alert: false };

    const now = event.timestamp;
    const failures = this.ipFailures.get(event.sourceIp) || [];
    const recent = failures.filter((t) => now - t < this.WINDOW_MS);
    recent.push(now);
    this.ipFailures.set(event.sourceIp, recent);

    if (recent.length >= this.THRESHOLD) {
      return { alert: true, reason: `Brute force detected from ${event.sourceIp}` };
    }

    // 检测路径遍历
    if (event.path.includes('..') || event.path.includes('%2e%2e')) {
      return { alert: true, reason: `Path traversal attempt: ${event.path}` };
    }

    return { alert: false };
  }
}
```

---

## 7. 总结

Web 安全不是"功能"，是**贯穿整个 SDLC 的系统工程**。

**分层防御策略**：

1. **设计层**：威胁建模、最小权限原则
2. **编码层**：安全编码规范、SAST 扫描
3. **依赖层**：SBOM、漏洞监控、签名验证
4. **部署层**：CSP、HSTS、安全响应头
5. **运营层**：日志监控、入侵检测、应急响应

**2026 年关键行动**：

- 全面采用 Passkeys 替代密码
- 实施供应链安全（SBOM + 签名验证）
- AI 生成代码的安全审查流程

---

## 参考资源

### 权威标准与规范

- [OWASP Top 10](https://owasp.org/Top10/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [web.dev Passkeys](https://web.dev/passkeys/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls)
- [NIST SP 800-53 — Security and Privacy Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [ISO/IEC 27001 — Information Security Management](https://www.iso.org/isoiec-27001-information-security.html)

### 工具与平台

- [Semgrep — Lightweight static analysis](https://semgrep.dev/)
- [CodeQL — GitHub semantic code analysis](https://codeql.github.com/)
- [OWASP ZAP — Web application security scanner](https://www.zaproxy.org/)
- [Trivy — Container and dependency scanner](https://trivy.dev/)
- [SLSA — Supply-chain Levels for Software Artifacts](https://slsa.dev/)
- [Sigstore — Software signing and transparency](https://www.sigstore.dev/)
- [npm audit signatures](https://docs.npmjs.com/cli/v10/commands/npm-audit-signatures)
- [GitHub Advanced Security](https://github.com/features/security)
- [OpenSSF Scorecard](https://securityscorecards.dev/)

### 书籍与课程

- [The Tangled Web — Michal Zalewski](https://nostarch.com/tangledweb) — 浏览器安全经典
- [Real-World Bug Hunting — Peter Yaworski](https://nostarch.com/bug-hunting) — 漏洞挖掘实战
- [Hacking: The Art of Exploitation — Jon Erickson](https://nostarch.com/hacking2.htm) — 底层安全原理
- [Web Security for Developers — Malcolm McDonald](https://nostarch.com/websecurity)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `hash-functions.ts`
- `index.ts`
- `jwt-auth.ts`
- `jwt-security.ts`
- `password-strength.ts`
- `rate-limiter.ts`
- `request-signer.ts`
- `secure-headers.ts`
- `security-framework.ts`
- `threat-modeling.ts`

> 学习建议：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括：

1. **防御纵深模式**：多层安全控制，单层失效不导致整体崩溃
2. **最小权限模式**：每个组件仅拥有完成工作所需的最小权限
3. **零信任架构模式**：永不信任，始终验证

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `jwt-auth.ts` — 理解认证基础 |
| 后续进阶 | `threat-modeling.ts` — 威胁建模实践 |

---

> 理论深化更新：2026-04-30

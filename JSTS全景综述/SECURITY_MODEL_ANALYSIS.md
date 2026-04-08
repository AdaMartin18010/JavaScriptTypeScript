# JavaScript/TypeScript 安全模型深度分析

> 本文档系统性地分析 JavaScript/TypeScript 生态系统的安全模型，涵盖 Web 安全基础、常见攻击向量、防御策略及最佳实践。

---

## 目录

- [JavaScript/TypeScript 安全模型深度分析](#javascripttypescript-安全模型深度分析)
  - [目录](#目录)
  - [安全评级矩阵](#安全评级矩阵)
  - [1. Web 安全模型基础](#1-web-安全模型基础)
    - [1.1 同源策略 (Same-Origin Policy, SOP)](#11-同源策略-same-origin-policy-sop)
      - [形式化定义](#形式化定义)
      - [浏览器安全边界](#浏览器安全边界)
      - [代码示例](#代码示例)
    - [1.2 内容安全策略 (Content Security Policy, CSP)](#12-内容安全策略-content-security-policy-csp)
      - [形式化策略语法](#形式化策略语法)
      - [CSP 指令安全矩阵](#csp-指令安全矩阵)
      - [生产级 CSP 配置](#生产级-csp-配置)
      - [CSP Bypass 检测](#csp-bypass-检测)
    - [1.3 跨域资源共享 (CORS)](#13-跨域资源共享-cors)
      - [形式化模型](#形式化模型)
      - [CORS 配置安全评级](#cors-配置安全评级)
      - [安全 CORS 实现](#安全-cors-实现)
  - [2. XSS 攻击与防御的形式化分析](#2-xss-攻击与防御的形式化分析)
    - [2.1 XSS 类型形式化定义](#21-xss-类型形式化定义)
    - [2.2 XSS 安全评级](#22-xss-安全评级)
    - [2.3 攻击原理与向量](#23-攻击原理与向量)
      - [常见 XSS Payload 矩阵](#常见-xss-payload-矩阵)
      - [高级绕过技术](#高级绕过技术)
    - [2.4 防御策略](#24-防御策略)
      - [分层防御架构](#分层防御架构)
      - [安全编码库实现](#安全编码库实现)
      - [DOMPurify 安全配置](#dompurify-安全配置)
    - [2.5 XSS 检测方法](#25-xss-检测方法)
      - [自动化检测规则](#自动化检测规则)
      - [运行时 XSS 监控](#运行时-xss-监控)
  - [3. CSRF 攻击与防御](#3-csrf-攻击与防御)
    - [3.1 CSRF 形式化模型](#31-csrf-形式化模型)
    - [3.2 CSRF 防御策略矩阵](#32-csrf-防御策略矩阵)
    - [3.3 SameSite Cookie 详解](#33-samesite-cookie-详解)
      - [SameSite 行为矩阵](#samesite-行为矩阵)
    - [3.4 CSRF Token 实现](#34-csrf-token-实现)
      - [自定义 CSRF Token 实现](#自定义-csrf-token-实现)
    - [3.5 CSRF 检测方法](#35-csrf-检测方法)
  - [4. 原型污染 (Prototype Pollution) 的形式化](#4-原型污染-prototype-pollution-的形式化)
    - [4.1 攻击原理形式化](#41-攻击原理形式化)
    - [4.2 原型污染攻击向量](#42-原型污染攻击向量)
    - [4.3 漏洞库与影响](#43-漏洞库与影响)
    - [4.4 防御策略](#44-防御策略)
      - [安全的对象操作](#安全的对象操作)
      - [冻结原型链](#冻结原型链)
    - [4.5 检测与监控](#45-检测与监控)
  - [5. 供应链安全](#5-供应链安全)
    - [5.1 供应链攻击模型](#51-供应链攻击模型)
    - [5.2 依赖项审计](#52-依赖项审计)
      - [自动化安全审计脚本](#自动化安全审计脚本)
    - [5.3 Lockfile 安全](#53-lockfile-安全)
    - [5.4 SBOM 生成](#54-sbom-生成)
    - [5.5 供应链安全检测清单](#55-供应链安全检测清单)
  - [6. 认证与授权](#6-认证与授权)
    - [6.1 JWT 安全形式化](#61-jwt-安全形式化)
    - [6.2 JWT 安全实现](#62-jwt-安全实现)
    - [6.3 OAuth 2.0 / OIDC 安全](#63-oauth-20--oidc-安全)
    - [6.4 RBAC 授权模型](#64-rbac-授权模型)
  - [7. 输入验证与 Sanitization](#7-输入验证与-sanitization)
    - [7.1 验证策略矩阵](#71-验证策略矩阵)
    - [7.2 Zod Schema 验证](#72-zod-schema-验证)
    - [7.3 SQL/NoSQL 注入防护](#73-sqlnosql-注入防护)
    - [7.4 文件上传安全](#74-文件上传安全)
    - [7.5 正则表达式安全](#75-正则表达式安全)
  - [8. 密码学基础](#8-密码学基础)
    - [8.1 Node.js 密码学安全](#81-nodejs-密码学安全)
    - [8.2 密码学安全清单](#82-密码学安全清单)
  - [9. 安全头部配置](#9-安全头部配置)
    - [9.1 安全头部矩阵](#91-安全头部矩阵)
    - [9.2 Helmet 配置](#92-helmet-配置)
    - [9.3 安全头部检测](#93-安全头部检测)
  - [10. 安全开发生命周期](#10-安全开发生命周期)
    - [10.1 SDL 阶段与活动](#101-sdl-阶段与活动)
    - [10.2 威胁建模 (STRIDE)](#102-威胁建模-stride)
    - [10.3 自动化安全测试](#103-自动化安全测试)
      - [GitHub Actions 安全流水线](#github-actions-安全流水线)
    - [10.4 渗透测试清单](#104-渗透测试清单)
  - [附录](#附录)
    - [A. 安全工具推荐](#a-安全工具推荐)
    - [B. 参考资源](#b-参考资源)

---

## 安全评级矩阵

| 风险类别 | 严重度 | 发生概率 | 检测难度 | 修复复杂度 | 综合评级 |
|---------|--------|---------|---------|-----------|---------|
| XSS | 🔴 Critical | High | Medium | Low | **9.5/10** |
| CSRF | 🟠 High | Medium | Medium | Low | **7.5/10** |
| 原型污染 | 🔴 Critical | Medium | High | Medium | **8.5/10** |
| 供应链攻击 | 🔴 Critical | High | High | High | **9.0/10** |
| JWT 漏洞 | 🟠 High | Medium | Medium | Low | **7.0/10** |
| 注入攻击 | 🔴 Critical | Medium | Low | Low | **8.5/10** |
| 弱加密 | 🟡 Medium | Low | High | Medium | **6.0/10** |
| 配置错误 | 🟠 High | High | Low | Low | **7.5/10** |

*评级标准: 1-10, 10 为最高风险*

---

## 1. Web 安全模型基础

### 1.1 同源策略 (Same-Origin Policy, SOP)

#### 形式化定义

```
给定两个资源 R₁ 和 R₂，其源定义为三元组:
Origin(R) = <protocol, host, port>

同源关系: R₁ ~ R₂ ⟺ Origin(R₁) = Origin(R₂)
        ⟺ (proto₁ = proto₂) ∧ (host₁ = host₂) ∧ (port₁ = port₂)
```

#### 浏览器安全边界

| 资源类型 | 跨域读取 | 跨域写入 | 跨域嵌入 |
|---------|---------|---------|---------|
| JavaScript | ❌ 禁止 | ✅ 允许 (form/link) | - |
| CSS | ❌ 禁止 | - | ✅ 允许 |
| 图片 | ❌ 禁止 (canvas tainted) | - | ✅ 允许 |
| 字体 | ❌ 禁止 | - | ⚠️ CORS 依赖 |
| iframe | ❌ 禁止 | - | ✅ 允许 (限制) |
| Web Storage | ❌ 禁止 | ✅ 同源允许 | - |
| IndexedDB | ❌ 禁止 | ✅ 同源允许 | - |
| WebSocket | ⚠️ 握手后允许 | ✅ 允许 | - |

#### 代码示例

```javascript
// ❌ 违反同源策略 - 无法读取跨域 iframe 内容
try {
  const iframe = document.getElementById('cross-origin-iframe');
  const content = iframe.contentDocument; // DOMException: Blocked a frame...
} catch (e) {
  console.error('SOP Violation:', e.message);
}

// ✅ 正确方式 - 使用 postMessage API 进行跨域通信
// 父页面
window.addEventListener('message', (event) => {
  // 必须验证来源
  if (event.origin !== 'https://trusted-domain.com') return;
  console.log('Received:', event.data);
});

// iframe 内
parent.postMessage({ type: 'DATA', payload: data }, 'https://parent-domain.com');
```

---

### 1.2 内容安全策略 (Content Security Policy, CSP)

#### 形式化策略语法

```
Policy := DirectiveList
DirectiveList := Directive *(; Directive)
Directive := DirectiveName Whitespace ValueList
ValueList := SourceExpression *(Whitespace SourceExpression)

SourceExpression :=
    "'none'" | "'self'" | SchemeSource | HostSource
  | "'nonce-" base64-value "'" | "'sha256-" base64-value "'"
```

#### CSP 指令安全矩阵

| 指令 | 控制范围 | 安全风险(无限制) | 推荐值 |
|-----|---------|----------------|-------|
| `default-src` | 默认回退 | 全范围注入 | `'self'` |
| `script-src` | JavaScript 执行 | XSS | `'self'` + nonce/hash |
| `style-src` | CSS 应用 | 数据窃取、UI 伪装 | `'self'` `'unsafe-inline'` |
| `img-src` | 图片加载 | 数据外泄 | `'self'` data: |
| `connect-src` | fetch/XHR/WebSocket | 数据外泄 | `'self'` |
| `object-src` | Flash/插件 | RCE | `'none'` |
| `base-uri` | `<base>` 标签 | 相对 URL 劫持 | `'self'` |
| `form-action` | 表单提交 | 钓鱼 | `'self'` |

#### 生产级 CSP 配置

```javascript
// Express.js 中间件示例
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      (req, res) => `'nonce-${res.locals.cspNonce}'`,
      "'strict-dynamic'"
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.trusted.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    reportUri: '/csp-report'
  },
  reportOnly: process.env.NODE_ENV === 'development'
}));
```

#### CSP Bypass 检测

```javascript
function analyzeCSP(policyString) {
  const issues = [];

  if (policyString.includes("script-src 'unsafe-inline'") &&
      !policyString.includes("'nonce-") &&
      !policyString.includes("'sha256-")) {
    issues.push({
      severity: 'HIGH',
      issue: 'Unsafe-inline without nonce/hash allows XSS',
      recommendation: 'Use nonce- or hash-based CSP'
    });
  }

  if (/script-src[^;]*\*/.test(policyString)) {
    issues.push({
      severity: 'CRITICAL',
      issue: 'Wildcard in script-src allows arbitrary script loading',
      recommendation: 'Remove wildcard, whitelist specific domains'
    });
  }

  return issues;
}
```

---

### 1.3 跨域资源共享 (CORS)

#### 形式化模型

```
预检请求条件:
PreflightRequired(method, headers) :=
    (method ∈ {PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH}) ∨
    (∃h ∈ headers: h ∉ CORS-safelisted-request-headers)
```

#### CORS 配置安全评级

| 配置 | 安全风险 | 适用场景 |
|-----|---------|---------|
| `Access-Control-Allow-Origin: *` | 🔴 高危 - 完全开放 | 仅限公开 API |
| `Access-Control-Allow-Origin: https://example.com` | 🟢 安全 - 白名单 | 生产环境推荐 |
| `Access-Control-Allow-Credentials: true` + `*` | 🔴 危险 - 规范禁止 | 永不使用 |

#### 安全 CORS 实现

```javascript
// ❌ 危险配置 - 反射任意 Origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// ✅ 安全配置 - 白名单验证
const ALLOWED_ORIGINS = [
  'https://app.example.com',
  /^https:\/\/.*\.example\.com$/
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed =>
    allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
  );
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  next();
});
```



---

## 2. XSS 攻击与防御的形式化分析

### 2.1 XSS 类型形式化定义

```
XSS 攻击模型:
Attack(Input, Context) → Injection(Vector) → Execution(Payload)

类型分类:
1. 反射型 XSS: Input = URL参数, Context = 服务器响应, 触发 = 诱导点击
2. 存储型 XSS: Input = 持久存储, Context = 多用户渲染, 触发 = 正常访问
3. DOM型 XSS: Input = 客户端源, Context = DOM操作, 触发 = JS执行
```

### 2.2 XSS 安全评级

| XSS 类型 | 影响范围 | 持久性 | 检测难度 | 修复难度 | 风险评分 |
|---------|---------|-------|---------|---------|---------|
| 存储型 | 多用户 | 永久 | 高 | 中 | **10/10** |
| 反射型 | 单用户 | 一次 | 低 | 低 | **7/10** |
| DOM 型 | 单用户 | 可持久 | 很高 | 中 | **8/10** |
| 盲 XSS | 多用户 | 永久 | 极高 | 中 | **9/10** |

### 2.3 攻击原理与向量

#### 常见 XSS Payload 矩阵

| 上下文 | Payload 示例 | 绕过技巧 |
|-------|-------------|---------|
| HTML 内容 | `<img src=x onerror=alert(1)>` | `<svg onload=alert(1)>` |
| 属性值 | `" onmouseover="alert(1)` | `javascript:alert(1)` |
| JavaScript | `';alert(1);//` | `\x61\x6c\x65\x72\x74(1)` |
| URL | `javascript:alert(1)` | `data:text/html,<script>alert(1)` |

#### 高级绕过技术

```javascript
// 多编码绕过
%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E  // URL 编码
\u003cimg src=x onerror=alert(1)\u003e         // Unicode 转义
<iframe src="data:text/html,<script>alert(1)"> // data URI

// DOM XSS 利用链
var x = location.hash.slice(1);
eval(x); // #alert(1)
```

### 2.4 防御策略

#### 分层防御架构

```
┌─────────────────────────────────────────────────────────────┐
│                    XSS 防御层次架构                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: 输入验证 (Input Validation)                        │
│ Layer 2: 输出编码 (Output Encoding)                         │
│ Layer 3: CSP (Content Security Policy)                      │
│ Layer 4: 浏览器防护 (HttpOnly, Trusted Types)               │
└─────────────────────────────────────────────────────────────┘
```

#### 安全编码库实现

```javascript
// 上下文感知编码器
class XssEncoder {
  static htmlEncode(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static htmlAttributeEncode(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  static jsEncode(text) {
    return JSON.stringify(text);
  }

  static urlEncode(text) {
    return encodeURIComponent(text);
  }
}

// 使用示例
const userInput = '<script>alert(1)</script>';
element.innerHTML = XssEncoder.htmlEncode(userInput);
// 输出: &lt;script&gt;alert(1)&lt;/script&gt;
```

#### DOMPurify 安全配置

```javascript
import DOMPurify from 'dompurify';

const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3',
    'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:f|ht)tps?|mailto|tel):/i,
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  RETURN_TRUSTED_TYPE: true
};

function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, purifyConfig);
}
```

### 2.5 XSS 检测方法

#### 自动化检测规则

```javascript
// ESLint XSS 检测配置
module.exports = {
  plugins: ['security', 'no-unsanitized'],
  rules: {
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-object-injection': 'error'
  }
};
```

#### 运行时 XSS 监控

```javascript
class XSSMonitor {
  constructor(config) {
    this.config = { endpoint: '/security-report', ...config };
    this.init();
  }

  init() {
    // 监控 innerHTML setter
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        if (XSSMonitor.looksLikeXSS(value)) {
          XSSMonitor.report({ type: 'SUSPICIOUS_INNERHTML', value });
        }
        return original.set.call(this, value);
      },
      get: original.get
    });
  }

  static looksLikeXSS(input) {
    return [/<script\b/i, /javascript:/i, /on\w+\s*=/i]
      .some(p => p.test(input));
  }

  static report(data) {
    navigator.sendBeacon?.(this.config.endpoint, JSON.stringify(data));
  }
}
```

---

## 3. CSRF 攻击与防御

### 3.1 CSRF 形式化模型

```
CSRF 攻击模型:
Attacker → 构造恶意页面 → 受害者浏览器 → 自动携带 Cookie → 目标站点

攻击前提:
1. 用户已登录目标站点 (持有有效 Cookie)
2. 目标站点仅依赖 Cookie 进行认证
3. 攻击者知道/猜测目标 URL 和参数
```

### 3.2 CSRF 防御策略矩阵

| 防御机制 | 安全级别 | 兼容性 | 实现复杂度 | 推荐场景 |
|---------|---------|-------|-----------|---------|
| SameSite Cookie | 🟢 高 | 现代浏览器 | 低 | **首选方案** |
| CSRF Token | 🟢 高 | 全浏览器 | 中 | 需要向后兼容 |
| Double Submit Cookie | 🟡 中 | 全浏览器 | 中 | 无服务器状态 |

### 3.3 SameSite Cookie 详解

```javascript
// 严格模式 - 最安全
res.cookie('sessionId', value, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});

// 宽松模式 - 允许安全 HTTP 方法跨站
res.cookie('sessionId', value, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 3600000
});
```

#### SameSite 行为矩阵

| 请求类型 | Strict | Lax | None |
|---------|--------|-----|------|
| 链接 | ❌ | ✅ | ✅ |
| 表单 GET | ❌ | ✅ | ✅ |
| 表单 POST | ❌ | ❌ | ✅ |
| AJAX | ❌ | ❌ | ✅ |

### 3.4 CSRF Token 实现

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: true } });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
  res.send('Data processed');
});
```

#### 自定义 CSRF Token 实现

```javascript
class CSRFGuard {
  generateToken() {
    return crypto.randomBytes(32).toString('base64');
  }

  middleware() {
    return (req, res, next) => {
      let token = req.cookies.csrf_token;
      if (!token) {
        token = this.generateToken();
        res.cookie('csrf_token', token, { httpOnly: true, sameSite: 'strict' });
      }

      res.locals.csrfToken = token;

      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const submitted = req.headers['x-csrf-token'] || req.body._csrf;
        if (!submitted || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(submitted))) {
          return res.status(403).json({ error: 'CSRF token validation failed' });
        }
      }
      next();
    };
  }
}
```

### 3.5 CSRF 检测方法

```javascript
class CSRFScanner {
  async scan(targetUrl) {
    const results = [];

    // 测试 SameSite Cookie
    const response = await fetch(targetUrl, { credentials: 'include' });
    const cookies = response.headers.get('set-cookie') || '';
    if (!cookies.toLowerCase().includes('samesite')) {
      results.push({ severity: 'HIGH', issue: 'Cookie missing SameSite attribute' });
    }

    // 尝试不带 Token 的 POST
    const postResp = await fetch(`${targetUrl}/api/action`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test' })
    });

    if (postResp.ok) {
      results.push({ severity: 'CRITICAL', issue: 'POST accepted without CSRF token' });
    }

    return results;
  }
}
```



---

## 4. 原型污染 (Prototype Pollution) 的形式化

### 4.1 攻击原理形式化

```
原型污染攻击模型:

JavaScript 对象模型:
obj.__proto__ === Object.prototype

污染路径:
UserInput → Merge/Set Operation → Prototype Modification →
Global Behavior Change → Code Execution/DoS

关键属性链:
  constructor → prototype → __proto__
  __proto__   → Object.prototype
```

### 4.2 原型污染攻击向量

```javascript
// 典型污染 Payload
const payload1 = {
  "__proto__": {
    "isAdmin": true,
    "polluted": true
  }
};

const payload2 = {
  "constructor": {
    "prototype": {
      "isAdmin": true
    }
  }
};

// 危险代码模式
function dangerousMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {};
      dangerousMerge(target[key], source[key]); // 🚨 未检查 key === '__proto__'
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 漏洞演示
const obj = {};
dangerousMerge({}, payload1);
console.log({}.polluted);  // true - 所有对象都被污染！
```

### 4.3 漏洞库与影响

| 受影响的库 | 版本范围 | 攻击向量 | CVE |
|-----------|---------|---------|-----|
| lodash | < 4.17.19 | `merge`, `defaultsDeep` | CVE-2020-8203 |
| jQuery | < 3.4.0 | `$.extend` | CVE-2019-11358 |
| hoek | < 4.2.1 | `merge` | CVE-2018-3728 |
| minimist | < 1.2.6 | 参数解析 | CVE-2021-44906 |

### 4.4 防御策略

#### 安全的对象操作

```javascript
// ✅ 安全的 merge 实现
function safeMerge(target, source, options = {}) {
  const { depth = 5 } = options;
  if (depth <= 0) throw new Error('Merge depth exceeded');

  for (const key in source) {
    // 原型污染防护
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn(`Blocked prototype pollution attempt: ${key}`);
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = target[key] || {};
      safeMerge(target[key], value, { ...options, depth: depth - 1 });
    } else {
      target[key] = value;
    }
  }
  return target;
}

// ✅ 使用 Object.create(null) - 无原型对象
const safeObj = Object.create(null);
safeObj.__proto__ = 'value'; // 不会污染 Object.prototype

// ✅ 使用 Map 替代对象
const safeMap = new Map();
safeMap.set('__proto__', 'value'); // 完全安全
```

#### 冻结原型链

```javascript
function freezePrototypes() {
  Object.freeze(Object.prototype);
  Object.freeze(Array.prototype);
  Object.freeze(Function.prototype);
  console.log('Prototypes frozen for security');
}

// 使用 Proxy 拦截原型访问
function createProtectedObject() {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === '__proto__' || prop === 'constructor') return undefined;
      return target[prop];
    },
    set(target, prop, value) {
      if (prop === '__proto__') throw new Error('Cannot modify __proto__');
      target[prop] = value;
      return true;
    }
  });
}
```

### 4.5 检测与监控

```javascript
class PrototypePollutionDetector {
  constructor() {
    this.checksums = new Map();
    this.snapshotPrototypes();
  }

  snapshotPrototypes() {
    this.checksums.set('Object', this.getProtoChecksum(Object.prototype));
    this.checksums.set('Array', this.getProtoChecksum(Array.prototype));
  }

  getProtoChecksum(proto) {
    return JSON.stringify(Object.getOwnPropertyNames(proto).sort());
  }

  detectPollution() {
    const detections = [];
    const suspiciousProps = ['isAdmin', 'polluted', 'evil', 'shell'];

    for (const prop of suspiciousProps) {
      if (prop in Object.prototype) {
        detections.push({ prototype: 'Object', suspiciousProperty: prop });
      }
    }
    return detections;
  }
}

// 运行时监控
if (typeof window !== 'undefined') {
  const detector = new PrototypePollutionDetector();
  setInterval(() => {
    const pollution = detector.detectPollution();
    if (pollution.length > 0) {
      console.error('Prototype pollution detected!', pollution);
    }
  }, 5000);
}
```

---

## 5. 供应链安全

### 5.1 供应链攻击模型

```
供应链攻击向量:

1. 依赖投毒
   Attacker → 发布恶意包 → npm Registry → Developer Install → Compromise

2. 依赖混淆
   Attacker → 注册私有包名 → Public Registry → Build Pull → Compromise

3. 开发者账户接管
   Attacker → 凭据窃取 → 合法包更新 → Auto Update → Compromise
```

### 5.2 依赖项审计

```javascript
// package.json 安全配置检查
function auditPackageJson(packageJson) {
  const issues = [];

  // 检查脚本钩子
  const dangerousScripts = ['preinstall', 'install', 'postinstall', 'prepare'];
  if (packageJson.scripts) {
    for (const script of dangerousScripts) {
      if (packageJson.scripts[script]) {
        issues.push({
          severity: 'MEDIUM',
          issue: `Potentially dangerous script: ${script}`,
          command: packageJson.scripts[script]
        });
      }
    }
  }

  // 检查依赖版本范围
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const [name, version] of Object.entries(allDeps)) {
    if (version === '*' || version.startsWith('>=') || version === 'latest') {
      issues.push({
        severity: 'HIGH',
        issue: `Unpinned dependency: ${name}@${version}`
      });
    }
  }

  return issues;
}
```

#### 自动化安全审计脚本

```javascript
const { execSync } = require('child_process');

function runSecurityAudit() {
  try {
    const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(auditResult);

    const report = {
      total: Object.keys(audit.vulnerabilities || {}).length,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      details: []
    };

    for (const [pkg, info] of Object.entries(audit.vulnerabilities || {})) {
      for (const via of info.via) {
        if (typeof via === 'object') {
          report.bySeverity[via.severity]++;
        }
      }
    }

    if (report.bySeverity.critical > 0 || report.bySeverity.high > 0) {
      console.error('Critical security vulnerabilities found!');
      process.exit(1);
    }

    return report;
  } catch (e) {
    console.error('Audit failed:', e.message);
    process.exit(1);
  }
}
```

### 5.3 Lockfile 安全

```javascript
const crypto = require('crypto');
const fs = require('fs');

class LockfileValidator {
  constructor(lockfilePath) {
    this.lockfilePath = lockfilePath;
  }

  generateIntegrityHash() {
    const lockfile = JSON.parse(fs.readFileSync(this.lockfilePath, 'utf-8'));
    const packages = lockfile.packages || lockfile.dependencies || {};
    const hashes = [];

    for (const [name, info] of Object.entries(packages)) {
      if (info.resolved && info.integrity) {
        hashes.push(`${name}@${info.resolved}:${info.integrity}`);
      }
    }

    return crypto.createHash('sha256').update(hashes.sort().join('\n')).digest('hex');
  }

  detectSuspiciousRegistries() {
    const lockfile = JSON.parse(fs.readFileSync(this.lockfilePath, 'utf-8'));
    const trustedRegistries = ['https://registry.npmjs.org', 'https://registry.yarnpkg.com'];
    const suspicious = [];

    const packages = lockfile.packages || lockfile.dependencies || {};
    for (const [name, info] of Object.entries(packages)) {
      if (info.resolved) {
        const registry = info.resolved.split('/-/')[0];
        if (!trustedRegistries.some(trusted => registry.startsWith(trusted))) {
          suspicious.push({ package: name, registry });
        }
      }
    }
    return suspicious;
  }
}
```

### 5.4 SBOM 生成

```javascript
class SBOMGenerator {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  generateCycloneDX() {
    const pkg = require(`${this.projectPath}/package.json`);

    const bom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:${crypto.randomUUID()}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          type: 'application',
          name: pkg.name,
          version: pkg.version,
          purl: `pkg:npm/${pkg.name}@${pkg.version}`
        }
      },
      components: []
    };

    const addDependencies = (deps) => {
      for (const [name, version] of Object.entries(deps || {})) {
        const cleanVersion = version.replace(/[^0-9.]/g, '');
        bom.components.push({
          type: 'library',
          name,
          version: cleanVersion,
          purl: `pkg:npm/${name}@${cleanVersion}`
        });
      }
    };

    addDependencies(pkg.dependencies);
    addDependencies(pkg.devDependencies);

    return bom;
  }
}
```

### 5.5 供应链安全检测清单

```javascript
const securityChecks = {
  hasLockfile: () => {
    return fs.existsSync('package-lock.json') ||
           fs.existsSync('yarn.lock') ||
           fs.existsSync('pnpm-lock.yaml');
  },

  auditCheck: () => {
    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  },

  pinnedVersions: () => {
    const pkg = require('./package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const unpinned = Object.entries(deps).filter(([_, v]) =>
      v.startsWith('^') || v.startsWith('~') || v === '*'
    );
    return unpinned.length === 0;
  }
};

async function runSupplyChainChecks() {
  const results = {};
  for (const [name, check] of Object.entries(securityChecks)) {
    try {
      results[name] = await check();
    } catch (e) {
      results[name] = { error: e.message };
    }
  }
  console.table(results);

  const failed = Object.entries(results).filter(([_, v]) => v === false);
  if (failed.length > 0) {
    console.error('Failed checks:', failed.map(([n]) => n).join(', '));
    process.exit(1);
  }
}
```


---

## 6. 认证与授权

### 6.1 JWT 安全形式化

```
JWT 结构: header.payload.signature

形式化验证:
Verify(token, secret) :=
  decode(token) = {header, payload, signature} ∧
  signature = HMAC_SHA256(base64(header) + "." + base64(payload), secret) ∧
  payload.exp > now()

攻击向量:
1. 算法混淆: alg: "none" → VerifyBypass
2. 密钥混淆: alg: "HS256" + RSA公钥 → HMAC验证
3. 密钥暴力破解: weak_secret → TokenForgery
```

### 6.2 JWT 安全实现

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SecureJWTManager {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'HS256';
    this.accessTokenExpiry = options.accessTokenExpiry || '15m';
    this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
    this.secretKey = this.loadOrGenerateSecret();
  }

  loadOrGenerateSecret() {
    const envSecret = process.env.JWT_SECRET;
    if (envSecret && envSecret.length >= 32) {
      return envSecret;
    }
    return crypto.randomBytes(64).toString('base64');
  }

  generateTokenPair(payload) {
    const accessToken = jwt.sign({
      ...payload,
      type: 'access',
      jti: crypto.randomUUID()
    }, this.secretKey, {
      algorithm: this.algorithm,
      expiresIn: this.accessTokenExpiry,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });

    const refreshToken = crypto.randomBytes(64).toString('base64');
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    const decoded = jwt.verify(token, this.secretKey, {
      algorithms: [this.algorithm], // 强制指定算法
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  }
}

// Express 中间件
function authenticateJWT(jwtManager) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    try {
      req.user = jwtManager.verifyAccessToken(authHeader.substring(7));
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### 6.3 OAuth 2.0 / OIDC 安全

```javascript
class SecureOAuthClient {
  constructor(config) {
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.authorizationEndpoint = config.authorizationEndpoint;
    this.tokenEndpoint = config.tokenEndpoint;
  }

  generatePKCE() {
    const codeVerifier = this.base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = this.base64URLEncode(
      crypto.createHash('sha256').update(codeVerifier).digest()
    );
    const state = this.base64URLEncode(crypto.randomBytes(32));

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state
    };
  }

  buildAuthorizationUrl(scope = 'openid profile email') {
    const pkce = this.generatePKCE();
    sessionStorage.setItem('oauth_pkce', JSON.stringify(pkce));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      state: pkce.state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod
    });

    return `${this.authorizationEndpoint}?${params}`;
  }

  async handleCallback(callbackUrl) {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const stored = JSON.parse(sessionStorage.getItem('oauth_pkce') || '{}');
    if (stored.state !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const tokenResponse = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code,
        redirect_uri: this.redirectUri,
        code_verifier: stored.codeVerifier
      })
    });

    return tokenResponse.json();
  }
}
```

### 6.4 RBAC 授权模型

```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  name: string;
  permissions: Permission[];
  parent?: string;
}

class RBACManager {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, Set<string>> = new Map();

  defineRole(role: Role) {
    this.roles.set(role.name, role);
  }

  assignRole(userId: string, roleName: string) {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    this.userRoles.get(userId)!.add(roleName);
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any
  ): Promise<boolean> {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) return false;

    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (!role) continue;

      const permissions = this.getAllPermissions(role);
      for (const perm of permissions) {
        if (this.permissionMatches(perm, resource, action, context)) {
          return true;
        }
      }
    }
    return false;
  }

  private getAllPermissions(role: Role): Permission[] {
    const permissions = [...role.permissions];
    if (role.parent) {
      const parent = this.roles.get(role.parent);
      if (parent) {
        permissions.push(...this.getAllPermissions(parent));
      }
    }
    return permissions;
  }

  private permissionMatches(perm: Permission, resource: string, action: string, context?: any): boolean {
    const resourceMatch = perm.resource === '*' || perm.resource === resource;
    const actionMatch = perm.action === '*' || perm.action === action;

    if (!resourceMatch || !actionMatch) return false;

    if (perm.conditions?.ownerOnly && context) {
      return context.userId === context.resourceOwner;
    }
    return true;
  }
}

// Express 授权中间件
function requirePermission(rbac: RBACManager, resource: string, action: string) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await rbac.checkPermission(userId, resource, action, {
      userId,
      resourceOwner: req.params.userId
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}
```

---

## 7. 输入验证与 Sanitization

### 7.1 验证策略矩阵

| 输入类型 | 验证方法 | 库推荐 | 安全级别 |
|---------|---------|-------|---------|
| API 请求体 | Schema 验证 | Zod/Yup/Joi | 🟢 高 |
| URL 参数 | 类型转换+范围 | Zod | 🟢 高 |
| 文件上传 | MIME+大小+魔数 | Multer | 🟢 高 |
| HTML 富文本 | DOMPurify | DOMPurify | 🟢 高 |
| SQL 查询 | 参数化 | 原生参数化 | 🟢 高 |

### 7.2 Zod Schema 验证

```typescript
import { z } from 'zod';

const schemas = {
  userRegistration: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(5).max(254)
      .transform(val => val.toLowerCase().trim()),

    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number and special char'
      ),

    username: z.string()
      .min(3).max(30)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username characters'),

    role: z.enum(['user', 'admin']).default('user')
  }).strict()
};

function validate(schema: z.ZodSchema) {
  return async (req: any, res: any, next: any) => {
    try {
      req.validated = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}
```

### 7.3 SQL/NoSQL 注入防护

```javascript
const mysql = require('mysql2/promise');

// ❌ 危险代码 - 字符串拼接
function dangerousQuery(userId, tableName) {
  return `SELECT * FROM ${tableName} WHERE id = '${userId}'`;
}

// ✅ 安全代码 - 参数化查询
async function safeQuery(pool, userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ? AND active = ?',
    [userId, true]
  );
  return rows;
}

// NoSQL 注入防护
const userQuerySchema = z.object({
  username: z.string().min(1).max(100),
  age: z.number().int().min(0).optional()
});

app.get('/users', async (req, res) => {
  const { username, age } = userQuerySchema.parse(req.query);
  const user = await User.find({ username, ...(age && { age: { $gte: age } }) });
  res.json(user);
});
```

### 7.4 文件上传安全

```javascript
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const secureUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads', 'temp'));
    },
    filename: (req, file, cb) => {
      const randomName = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomName}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf']
    };

    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes[file.mimetype]?.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});
```

### 7.5 正则表达式安全

```javascript
// ReDoS (正则表达式拒绝服务) 防护

// ❌ 危险的正则表达式 (Catastrophic Backtracking)
const dangerousPatterns = [
  /(a+)+$/,           // 嵌套量词
  /(a*)*$/,           // 嵌套量词
  /(a|aa)+$/          // 分支重复
];

// ✅ 安全的正则模式
const safePatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  phone: /^1[3-9]\d{9}$/,  // 中国大陆手机号
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// 带超时保护的正则匹配
async function safeRegexTest(pattern, input, timeout = 1000) {
  return Promise.race([
    new Promise((resolve) => {
      try {
        resolve({ success: true, result: pattern.test(input) });
      } catch (e) {
        resolve({ success: false, error: e.message });
      }
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Regex timeout - possible ReDoS')), timeout)
    )
  ]);
}
```

---

## 8. 密码学基础

### 8.1 Node.js 密码学安全

```javascript
const crypto = require('crypto');

// ==================== 密码哈希 ====================
class PasswordHasher {
  static async hashPBKDF2(password) {
    const salt = crypto.randomBytes(32);
    const iterations = 600000; // OWASP 2023 推荐
    const keylen = 64;
    const digest = 'sha512';

    const hash = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    return `pbkdf2_${digest}$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
  }

  static async verifyPBKDF2(password, storedHash) {
    const [algorithm, iterations, salt, hash] = storedHash.split('$');
    const digest = algorithm.replace('pbkdf2_', '');

    const computedHash = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        Buffer.from(salt, 'base64'),
        parseInt(iterations),
        Buffer.from(hash, 'base64').length,
        digest,
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    });

    return crypto.timingSafeEqual(Buffer.from(hash, 'base64'), computedHash);
  }
}

// ==================== 对称加密 ====================
class SymmetricEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(plaintext, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64')
    ].join(':');
  }

  decrypt(ciphertext, key) {
    const [ivBase64, authTagBase64, encryptedBase64] = ciphertext.split(':');

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  static generateKey() {
    return crypto.randomBytes(32);
  }
}

// ==================== 数字签名 ====================
class DigitalSignature {
  static sign(data, privateKey, passphrase) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign({ key: privateKey, passphrase }, 'base64');
  }

  static verify(data, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  }

  static hmac(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('base64');
  }
}
```

### 8.2 密码学安全清单

```javascript
// 安全常量配置
const SECURITY_CONFIG = {
  password: {
    minLength: 12,
    hashAlgorithm: 'argon2id',
    pbkdf2Iterations: 600000
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  },
  jwt: {
    algorithm: 'HS256',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  session: {
    cookieSecure: true,
    cookieHttpOnly: true,
    cookieSameSite: 'strict'
  }
};

// 密码学审计检查
const cryptoAudit = {
  checkHashAlgorithm: (algorithm) => {
    const weakAlgorithms = ['md5', 'sha1', 'ripemd160'];
    return !weakAlgorithms.includes(algorithm.toLowerCase());
  },

  checkCipherMode: (mode) => {
    const unsafeModes = ['ecb'];
    return !unsafeModes.includes(mode.toLowerCase());
  },

  checkKeyLength: (algorithm, length) => {
    const minLengths = { aes: 128, rsa: 2048, ec: 256 };
    return length >= (minLengths[algorithm.toLowerCase()] || 0);
  }
};
```



---

## 9. 安全头部配置

### 9.1 安全头部矩阵

| 头部 | 作用 | 推荐值 | 兼容性 |
|-----|-----|-------|-------|
| `Strict-Transport-Security` | 强制 HTTPS | `max-age=31536000; includeSubDomains; preload` | 现代浏览器 |
| `X-Content-Type-Options` | 禁用 MIME 嗅探 | `nosniff` | 全浏览器 |
| `X-Frame-Options` | 防止 Clickjacking | `DENY` 或 `SAMEORIGIN` | 全浏览器 |
| `Content-Security-Policy` | XSS 防护 | 见第1章 | 现代浏览器 |
| `Referrer-Policy` | 控制 Referer | `strict-origin-when-cross-origin` | 现代浏览器 |
| `Permissions-Policy` | 限制浏览器 API | 见下文 | Chrome/Edge |
| `Cross-Origin-Opener-Policy` | 隔离窗口 | `same-origin` | 现代浏览器 |

### 9.2 Helmet 配置

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        "'strict-dynamic'"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },

  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },

  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },

  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  noSniff: true,

  permissionsPolicy: {
    features: {
      accelerometer: [],
      camera: [],
      geolocation: [],
      gyroscope: [],
      magnetometer: [],
      microphone: [],
      payment: [],
      usb: []
    }
  },

  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: false // 使用 CSP 替代
}));

// 自定义安全头部中间件
function securityHeaders(req, res, next) {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

app.use(securityHeaders);
```

### 9.3 安全头部检测

```javascript
class SecurityHeadersScanner {
  constructor(targetUrl) {
    this.targetUrl = targetUrl;
    this.expectedHeaders = {
      'strict-transport-security': {
        required: true,
        validate: (value) => {
          const maxAge = value.match(/max-age=(\d+)/);
          return maxAge && parseInt(maxAge[1]) >= 31536000;
        }
      },
      'content-security-policy': { required: true },
      'x-content-type-options': { required: true, expected: 'nosniff' },
      'x-frame-options': { required: true },
      'referrer-policy': { required: true }
    };
  }

  async scan() {
    const response = await fetch(this.targetUrl);
    const headers = Object.fromEntries(
      [...response.headers.entries()].map(([k, v]) => [k.toLowerCase(), v])
    );

    const results = [];

    for (const [header, config] of Object.entries(this.expectedHeaders)) {
      const value = headers[header];

      if (!value && config.required) {
        results.push({ header, status: 'MISSING', severity: 'HIGH' });
      } else if (value) {
        let valid = true;
        if (config.expected && value.toLowerCase() !== config.expected.toLowerCase()) {
          valid = false;
        } else if (config.validate && !config.validate(value)) {
          valid = false;
        }
        results.push({ header, status: valid ? 'VALID' : 'INVALID', value });
      }
    }

    // 检查泄漏信息的头部
    const leakyHeaders = ['x-powered-by', 'server'];
    for (const header of leakyHeaders) {
      if (headers[header]) {
        results.push({ header, status: 'LEAK', value: headers[header] });
      }
    }

    return results;
  }

  generateReport(results) {
    const missing = results.filter(r => r.status === 'MISSING');
    const invalid = results.filter(r => r.status === 'INVALID');
    const leaking = results.filter(r => r.status === 'LEAK');

    return {
      score: Math.max(0, 100 - missing.length * 10 - invalid.length * 5),
      missing,
      invalid,
      leaking,
      recommendations: [
        ...missing.map(m => `Add ${m.header} header`),
        ...invalid.map(i => `Fix ${i.header} configuration`),
        ...leaking.map(l => `Remove ${l.header} header`)
      ]
    };
  }
}
```

---

## 10. 安全开发生命周期

### 10.1 SDL 阶段与活动

```
┌─────────────────────────────────────────────────────────────────┐
│                    安全开发生命周期 (SDL)                        │
├─────────────┬───────────────────────────────────────────────────┤
│   阶段      │                        安全活动                    │
├─────────────┼───────────────────────────────────────────────────┤
│ 1. 需求     │ • 威胁建模                                          │
│             │ • 定义安全需求 (认证、授权、加密、审计)              │
│             │ • 合规要求识别 (GDPR, SOC2, PCI-DSS)               │
├─────────────┼───────────────────────────────────────────────────┤
│ 2. 设计     │ • 架构安全评审                                      │
│             │ • 攻击面分析                                        │
│             │ • 安全设计模式应用                                  │
├─────────────┼───────────────────────────────────────────────────┤
│ 3. 开发     │ • 安全编码规范                                      │
│             │ • 静态代码分析 (SAST)                               │
│             │ • 依赖安全扫描 (SCA)                                │
│             │ • 代码安全评审                                      │
├─────────────┼───────────────────────────────────────────────────┤
│ 4. 测试     │ • 动态应用测试 (DAST)                               │
│             │ • 渗透测试                                          │
│             │ • 模糊测试                                          │
│             │ • 安全回归测试                                      │
├─────────────┼───────────────────────────────────────────────────┤
│ 5. 部署     │ • 基础设施扫描                                      │
│             │ • 容器安全扫描                                      │
│             │ • 密钥管理验证                                      │
├─────────────┼───────────────────────────────────────────────────┤
│ 6. 运营     │ • 安全监控                                          │
│             │ • 漏洞响应流程                                      │
│             │ • 安全事件响应                                      │
│             │ • 定期安全评估                                      │
└─────────────┴───────────────────────────────────────────────────┘
```

### 10.2 威胁建模 (STRIDE)

```javascript
const STRIDE_CATEGORIES = {
  Spoofing: {
    description: '身份伪装',
    examples: ['伪造 JWT 令牌', 'Session 固定攻击'],
    mitigations: ['强认证机制 (MFA)', '安全的令牌管理']
  },
  Tampering: {
    description: '数据篡改',
    examples: ['修改请求参数', '中间人攻击'],
    mitigations: ['HTTPS 全站', '请求签名验证', '审计日志']
  },
  Repudiation: {
    description: '否认行为',
    examples: ['用户否认执行操作'],
    mitigations: ['不可篡改的审计日志', '数字签名']
  },
  InformationDisclosure: {
    description: '信息泄露',
    examples: ['错误信息暴露堆栈', '日志记录敏感信息'],
    mitigations: ['最小权限原则', '数据分类和加密']
  },
  DenialOfService: {
    description: '拒绝服务',
    examples: ['资源耗尽攻击', 'ReDoS'],
    mitigations: ['速率限制', '资源配额', 'CDN 和 WAF']
  },
  ElevationOfPrivilege: {
    description: '权限提升',
    examples: ['垂直权限提升', '水平权限提升'],
    mitigations: ['RBAC/ABAC 授权', '权限最小化']
  }
};

class ThreatModel {
  constructor(systemName) {
    this.systemName = systemName;
    this.assets = [];
    this.dataFlows = [];
    this.threats = [];
  }

  addAsset(name, type, sensitivity) {
    this.assets.push({ name, type, sensitivity });
  }

  addDataFlow(from, to, data, protocol) {
    this.dataFlows.push({ from, to, data, protocol });
  }

  identifyThreats() {
    for (const flow of this.dataFlows) {
      for (const [category, info] of Object.entries(STRIDE_CATEGORIES)) {
        const threat = this.analyzeThreat(category, flow);
        if (threat) this.threats.push(threat);
      }
    }
    return this.threats;
  }

  analyzeThreat(category, flow) {
    const rules = {
      Spoofing: () => flow.protocol === 'HTTP' || flow.data.includes('token'),
      Tampering: () => !flow.protocol.includes('HTTPS'),
      InformationDisclosure: () =>
        flow.data.includes('password') || flow.data.includes('credit_card')
    };

    if (rules[category]?.()) {
      return {
        category,
        flow: `${flow.from} -> ${flow.to}`,
        risk: this.calculateRisk(flow),
        mitigations: STRIDE_CATEGORIES[category].mitigations
      };
    }
    return null;
  }

  calculateRisk(flow) {
    let score = 0;
    if (flow.data.includes('password')) score += 3;
    if (!flow.protocol.includes('HTTPS')) score += 2;
    return score >= 5 ? 'HIGH' : score >= 3 ? 'MEDIUM' : 'LOW';
  }
}
```

### 10.3 自动化安全测试

```json
{
  "scripts": {
    "security:lint": "eslint . --ext .js,.ts --config .eslintrc.security.js",
    "security:audit": "npm audit --audit-level=moderate",
    "security:sast": "semgrep --config=auto --error",
    "security:secrets": "gitleaks detect --source . --verbose",
    "security:deps": "snyk test",
    "security:all": "npm run security:lint && npm run security:audit && npm run security:sast"
  }
}
```

#### GitHub Actions 安全流水线

```yaml
name: Security Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/cwe-top-25

      - name: Run ESLint Security
        run: |
          npm ci
          npm run security:lint

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: NPM Audit
        run: npm audit --audit-level=moderate

      - name: Snyk Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Secret Detection
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

### 10.4 渗透测试清单

```javascript
const pentestChecklist = {
  authentication: [
    { test: '暴力破解防护', check: 'rateLimit' },
    { test: '密码策略', check: 'passwordPolicy' },
    { test: 'MFA 绕过', check: 'mfaBypass' },
    { test: 'JWT 漏洞', check: 'jwtVulnerabilities' }
  ],

  authorization: [
    { test: 'IDOR', check: 'idor' },
    { test: '特权提升', check: 'privilegeEscalation' },
    { test: '路径遍历', check: 'pathTraversal' }
  ],

  injection: [
    { test: 'SQL 注入', check: 'sqlInjection' },
    { test: 'XSS', check: 'xss' },
    { test: '原型污染', check: 'prototypePollution' },
    { test: '命令注入', check: 'commandInjection' }
  ],

  cryptography: [
    { test: '弱加密算法', check: 'weakCrypto' },
    { test: '明文传输', check: 'plaintextTransmission' },
    { test: '硬编码密钥', check: 'hardcodedKeys' }
  ],

  configuration: [
    { test: '安全头部', check: 'securityHeaders' },
    { test: 'CORS 配置', check: 'corsConfig' },
    { test: '错误信息泄露', check: 'errorLeakage' }
  ],

  clientSide: [
    { test: 'DOM XSS', check: 'domXss' },
    { test: 'CSRF', check: 'csrf' },
    { test: 'Clickjacking', check: 'clickjacking' }
  ]
};

class PentestReportGenerator {
  constructor(target) {
    this.target = target;
    this.findings = [];
  }

  addFinding(category, severity, title, description, evidence, remediation) {
    this.findings.push({
      id: `VULN-${String(this.findings.length + 1).padStart(3, '0')}`,
      category,
      severity,
      title,
      description,
      evidence,
      remediation
    });
  }

  generateReport() {
    const severityCount = {
      Critical: this.findings.filter(f => f.severity === 'Critical').length,
      High: this.findings.filter(f => f.severity === 'High').length,
      Medium: this.findings.filter(f => f.severity === 'Medium').length,
      Low: this.findings.filter(f => f.severity === 'Low').length
    };

    return {
      target: this.target,
      date: new Date().toISOString(),
      summary: {
        total: this.findings.length,
        ...severityCount,
        riskScore: this.calculateRiskScore(severityCount)
      },
      findings: this.findings,
      remediationPriority: this.prioritizeRemediations()
    };
  }

  calculateRiskScore(counts) {
    return counts.Critical * 10 + counts.High * 5 + counts.Medium * 2 + counts.Low * 0.5;
  }

  prioritizeRemediations() {
    const priority = ['Critical', 'High', 'Medium', 'Low'];
    return priority.flatMap(sev =>
      this.findings.filter(f => f.severity === sev)
    );
  }
}
```

---

## 附录

### A. 安全工具推荐

| 工具类型 | 工具名称 | 用途 |
|---------|---------|-----|
| SAST | Semgrep, ESLint Security | 静态代码分析 |
| DAST | OWASP ZAP, Burp Suite | 动态应用测试 |
| SCA | Snyk, npm audit, Dependabot | 依赖安全扫描 |
| Secret Scan | GitLeaks, TruffleHog | 密钥泄露检测 |
| CSP | CSP Evaluator | CSP 策略分析 |
| 加密 | OWASP Crypto Cheatsheet | 密码学指南 |

### B. 参考资源

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

*文档版本: 1.0*
*最后更新: 2026-04-08*
*维护者: JavaScript/TypeScript 安全工作组*

# 应用开发 — 理论基础

## 1. 软件开发生命周期（SDLC）

```
需求分析 → 设计 → 编码 → 测试 → 部署 → 运维 → 反馈
```

现代实践强调**迭代**和**增量**：短周期（1-2周）交付可用版本。

---

## 2. 需求分析

- **功能性需求**: 系统必须做什么（用户故事、用例）
- **非功能性需求**: 性能、安全、可扩展性、可用性
- **验收标准**: 定义"完成"的明确条件（Given-When-Then）

#### 代码示例：Given-When-Then 验收测试（Cucumber 风格）

```typescript
// features/user-login.feature
Feature: User Login

  Scenario: Successful login with valid credentials
    Given the user has a registered account with email "alice@example.com"
    And the user's password is "SecurePass123!"
    When the user submits the login form
    Then the user should be redirected to the dashboard
    And the user session should be valid for 24 hours

  Scenario: Failed login with invalid password
    Given the user has a registered account with email "alice@example.com"
    When the user submits the login form with password "WrongPass"
    Then the user should see an error message "Invalid credentials"
    And the failed attempt should be logged for security audit
```

```typescript
// tests/steps/login.steps.ts — Playwright + Cucumber 实现
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('the user has a registered account with email {string}', async function (email: string) {
  await this.db.user.create({ data: { email, passwordHash: await hash('SecurePass123!') } });
});

When('the user submits the login form', async function () {
  await this.page.fill('[data-testid="email"]', 'alice@example.com');
  await this.page.fill('[data-testid="password"]', 'SecurePass123!');
  await this.page.click('[data-testid="login-button"]');
});

Then('the user should be redirected to the dashboard', async function () {
  await expect(this.page).toHaveURL('/dashboard');
});
```

---

## 3. 技术选型框架

| 维度 | 考量因素 |
|------|---------|
| **团队能力** | 技术栈熟悉度、学习曲线 |
| **生态成熟度** | 社区活跃度、文档质量、第三方库 |
| **性能要求** | 吞吐量、延迟、并发量 |
| **可维护性** | 代码清晰度、测试覆盖、类型安全 |
| **长期支持** | 赞助商、版本发布周期、向后兼容 |

---

## 4. 代码审查（Code Review）

审查清单：

- 功能正确性: 是否满足需求
- 代码质量: 可读性、命名、注释
- 测试覆盖: 是否包含单元测试
- 安全性: 输入验证、敏感数据处理
- 性能: 是否存在明显瓶颈

#### 代码示例：自动化代码审查配置

```typescript
// .github/workflows/code-review.yml
name: Automated Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - run: npm ci

      # 1. 类型检查
      - run: npx tsc --noEmit

      # 2. Lint
      - run: npx eslint . --ext .ts,.tsx

      # 3. 测试覆盖率门禁
      - run: npx vitest run --coverage

      # 4. 包体积检查
      - run: npx bundlesize

      # 5. 安全检查
      - run: npx audit-ci --moderate

      # 6. AI 辅助审查（可选）
      - uses: coderabbitai/ai-pr-reviewer@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## 5. 发布管理

- **语义化版本（SemVer）**: MAJOR.MINOR.PATCH
- **变更日志（Changelog）**: 记录每个版本的变更
- **功能开关**: 渐进式发布，快速回滚
- **蓝绿/金丝雀**: 降低发布风险

#### 代码示例：功能开关（Feature Flags）实现

```typescript
// lib/feature-flags.ts
interface FeatureFlags {
  newDashboard: boolean;
  darkMode: boolean;
  betaApi: boolean;
}

const defaultFlags: FeatureFlags = {
  newDashboard: false,
  darkMode: true,
  betaApi: false,
};

// 从环境变量或远程配置服务读取
export function getFeatureFlags(): FeatureFlags {
  return {
    ...defaultFlags,
    newDashboard: process.env.FF_NEW_DASHBOARD === 'true',
    darkMode: process.env.FF_DARK_MODE !== 'false',
    betaApi: process.env.FF_BETA_API === 'true',
  };
}

// React Hook 封装
import { useMemo } from 'react';

export function useFeatureFlag<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
  return useMemo(() => getFeatureFlags()[flag], [flag]);
}
```

```tsx
// pages/Dashboard.tsx
import { useFeatureFlag } from '@/lib/feature-flags';
import { LegacyDashboard } from './LegacyDashboard';
import { NewDashboard } from './NewDashboard';

export default function Dashboard() {
  const isNewDashboard = useFeatureFlag('newDashboard');
  return isNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
}
```

#### 代码示例：语义化版本自动化

```json
// package.json
{
  "name": "my-app",
  "version": "2.1.3",
  "scripts": {
    "version:patch": "npm version patch -m 'chore(release): %s'",
    "version:minor": "npm version minor -m 'feat(release): %s'",
    "version:major": "npm version major -m 'breaking(release): %s'",
    "postversion": "git push && git push --tags"
  }
}
```

```bash
# 遵循 Conventional Commits 的自动化版本管理
# 安装 standard-version 或 semantic-release
npm i -D semantic-release @semantic-release/git @semantic-release/changelog

# .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

---

## 6. 现代应用架构模式对比

| 特性 | SPA（单页应用） | MPA（多页应用） | PWA（渐进式 Web 应用） | TWA（可信 Web 活动） |
|------|---------------|---------------|---------------------|-------------------|
| **页面导航** | 客户端路由，无刷新 | 服务端路由，整页刷新 | 客户端路由，支持离线 | 客户端路由，嵌入原生壳 |
| **首屏加载** | 需下载 JS Bundle | 仅当前页 HTML/CSS | Service Worker 缓存 | 与 PWA 相同 |
| **离线能力** | ❌ 依赖网络 | ❌ 依赖网络 | ✅ Service Worker | ✅ Service Worker |
| **安装方式** | 浏览器书签 | 浏览器书签 | 添加到主屏幕 | Google Play / App Store |
| **原生能力** | 受限 | 受限 | 有限（Push、Camera） | 几乎完整原生 API |
| **SEO** | 需 SSR/预渲染 | ✅ 天然友好 | 同 SPA | 同 SPA |
| **代表技术** | React Router、Vue Router | Next.js 多路由、Django | Workbox、Vite PWA Plugin | Bubblewrap、PWABuilder |
| **适用场景** | 后台系统、社交应用 | 内容站点、官网 | 跨平台移动端应用 | 低成本上架应用商店 |

### 架构选型决策树

```
是否需要应用商店分发？
  ├─ 是 → 需要原生能力？
  │         ├─ 是 → TWA / 原生混合
  │         └─ 否 → PWA + WebAPK
  └─ 否 → 内容为主还是交互为主？
            ├─ 内容 → MPA / SSG
            └─ 交互 → SPA / PWA
```

---

## 7. 代码示例：Vite + React 现代项目初始化

```bash
# 1. 创建项目
npm create vite@latest my-modern-app -- --template react-ts

# 2. 安装依赖
cd my-modern-app
npm install

# 3. 添加 PWA 支持
npm install -D vite-plugin-pwa workbox-window
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Modern App',
        short_name: 'ModernApp',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

```tsx
// src/main.tsx — 注册 Service Worker
import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'

// 热更新 Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload?')) updateSW(true)
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## 8. 权威外部资源

- [Google Developers — Progressive Web Apps](https://developers.google.com/web/progressive-web-apps)
- [MDN — Web App Manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Vite PWA Plugin Documentation](https://vite-pwa-org.netlify.app/)
- [Trusted Web Activity — Chrome Developers](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [W3C — Service Workers Specification](https://w3c.github.io/ServiceWorker/)
- [web.dev — Modern Web Development](https://web.dev/)
- [Semantic Versioning 2.0.0](https://semver.org/) — SemVer 官方规范
- [Conventional Commits](https://www.conventionalcommits.org/) — 提交信息约定
- [GitHub — Code Review Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
- [Playwright Documentation](https://playwright.dev/) — E2E 测试框架
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/) — BDD 测试框架

---

## 9. 与相邻模块的关系

- **22-deployment-devops**: 部署与运维实践
- **29-documentation**: 技术文档编写
- **60-developer-experience**: 开发者体验优化

---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 工程实践完全指南

> 涵盖现代前端工程化的十大核心领域，提供系统化的最佳实践、工具推荐与检查清单

---

## 目录

- [JavaScript/TypeScript 工程实践完全指南](#javascripttypescript-工程实践完全指南)
  - [目录](#目录)
  - [1. 代码规范与风格指南](#1-代码规范与风格指南)
    - [1.1 主流规范对比](#11-主流规范对比)
    - [1.2 详细对比分析](#12-详细对比分析)
      - [Airbnb JavaScript Style Guide](#airbnb-javascript-style-guide)
      - [Google JavaScript Style Guide](#google-javascript-style-guide)
    - [1.3 推荐配置方案](#13-推荐配置方案)
    - [1.4 工具推荐](#14-工具推荐)
    - [1.5 检查清单](#15-检查清单)
    - [1.6 常见错误](#16-常见错误)
  - [2. 代码审查理论与实践](#2-代码审查理论与实践)
    - [2.1 审查时机与粒度](#21-审查时机与粒度)
    - [2.2 审查清单](#22-审查清单)
      - [功能性检查](#功能性检查)
      - [代码质量检查](#代码质量检查)
      - [安全性检查](#安全性检查)
      - [性能检查](#性能检查)
    - [2.3 审查沟通原则](#23-审查沟通原则)
    - [2.4 工具推荐](#24-工具推荐)
    - [2.5 常见错误](#25-常见错误)
  - [3. 版本控制策略](#3-版本控制策略)
    - [3.1 主流工作流对比](#31-主流工作流对比)
    - [3.2 Git Flow 分支规范](#32-git-flow-分支规范)
    - [3.3 提交信息规范](#33-提交信息规范)
      - [Conventional Commits 格式](#conventional-commits-格式)
      - [类型说明](#类型说明)
    - [3.4 语义化版本控制](#34-语义化版本控制)
    - [3.5 检查清单](#35-检查清单)
    - [3.6 常见错误](#36-常见错误)
  - [4. 持续集成/持续部署](#4-持续集成持续部署)
    - [4.1 CI/CD 完整流程](#41-cicd-完整流程)
    - [4.2 CI 流程阶段](#42-ci-流程阶段)
    - [4.3 工具推荐](#43-工具推荐)
    - [4.4 GitHub Actions 配置示例](#44-github-actions-配置示例)
    - [4.5 检查清单](#45-检查清单)
    - [4.6 常见错误](#46-常见错误)
  - [5. 文档化策略](#5-文档化策略)
    - [5.1 文档金字塔](#51-文档金字塔)
    - [5.2 README 标准结构](#52-readme-标准结构)
    - [5.3 API 文档规范](#53-api-文档规范)
    - [5.4 工具推荐](#54-工具推荐)
    - [5.5 检查清单](#55-检查清单)
    - [5.6 常见错误](#56-常见错误)
  - [6. 测试策略金字塔](#6-测试策略金字塔)
    - [6.1 测试金字塔](#61-测试金字塔)
    - [6.2 各层测试对比](#62-各层测试对比)
    - [6.3 单元测试最佳实践](#63-单元测试最佳实践)
    - [6.4 集成测试示例](#64-集成测试示例)
    - [6.5 E2E 测试示例](#65-e2e-测试示例)
    - [6.6 测试覆盖率目标](#66-测试覆盖率目标)
    - [6.7 工具推荐](#67-工具推荐)
    - [6.8 检查清单](#68-检查清单)
    - [6.9 常见错误](#69-常见错误)
  - [7. 性能预算与监控](#7-性能预算与监控)
    - [7.1 性能预算指标](#71-性能预算指标)
    - [7.2 性能优化策略](#72-性能优化策略)
    - [7.3 监控方案](#73-监控方案)
    - [7.4 Lighthouse CI 配置](#74-lighthouse-ci-配置)
    - [7.5 检查清单](#75-检查清单)
    - [7.6 常见错误](#76-常见错误)
  - [8. 安全开发生命周期](#8-安全开发生命周期)
    - [8.1 SDL 流程](#81-sdl-流程)
    - [8.2 安全编码规范](#82-安全编码规范)
    - [8.3 依赖安全](#83-依赖安全)
    - [8.4 安全扫描工具](#84-安全扫描工具)
    - [8.5 安全头部配置](#85-安全头部配置)
    - [8.6 检查清单](#86-检查清单)
    - [8.7 常见错误](#87-常见错误)
  - [9. 可访问性工程化](#9-可访问性工程化)
    - [9.1 WCAG 合规等级](#91-wcag-合规等级)
    - [9.2 核心原则 POUR](#92-核心原则-pour)
    - [9.3 ARIA 使用规范](#93-aria-使用规范)
    - [9.4 测试工具](#94-测试工具)
    - [9.5 检查清单](#95-检查清单)
    - [9.6 常见错误](#96-常见错误)
  - [10. 国际化工程化](#10-国际化工程化)
    - [10.1 i18n 架构](#101-i18n-架构)
    - [10.2 国际化库对比](#102-国际化库对比)
    - [10.3 最佳实践](#103-最佳实践)
    - [10.4 伪本地化测试](#104-伪本地化测试)
    - [10.5 RTL 支持](#105-rtl-支持)
    - [10.6 检查清单](#106-检查清单)
    - [10.7 常见错误](#107-常见错误)
  - [附录：完整检查清单汇总](#附录完整检查清单汇总)
    - [项目启动检查清单](#项目启动检查清单)
    - [发布前检查清单](#发布前检查清单)

---

## 1. 代码规范与风格指南

### 1.1 主流规范对比

| 规范 | 适用场景 | 严格程度 | 主要特点 |
|------|----------|----------|----------|
| **Airbnb** | 大型团队/企业级项目 | ⭐⭐⭐⭐⭐ | 最全面，规则严格，文档完善 |
| **Google** | Google生态/TypeScript项目 | ⭐⭐⭐⭐ | 强调TypeScript，现代化 |
| **Standard** | 快速启动/小型项目 | ⭐⭐⭐ | 无需配置，零决策负担 |
| **Prettier** | 代码格式化 | ⭐⭐⭐⭐ | 专注格式，与ESLint互补 |

### 1.2 详细对比分析

#### Airbnb JavaScript Style Guide

```javascript
// 推荐：使用 const/let，避免 var
const user = { name: 'John' };
let count = 0;

// 推荐：使用对象解构
function getUserInfo({ id, name, email }) {
  return { id, name, email };
}

// 推荐：使用模板字符串
const greeting = `Hello, ${user.name}!`;

// 避免：隐式类型转换
if (count == 0) { } // 使用 === 代替

// 避免：修改参数
function processData(data) {
  data.value = 42; // 不要修改入参
}
```

#### Google JavaScript Style Guide

```javascript
// 推荐：使用 JSDoc 注释
/**
 * 计算两个数的和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @return {number} 两数之和
 */
function add(a, b) {
  return a + b;
}

// 推荐：使用类而不是原型
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

// 推荐：使用 async/await
async function fetchData() {
  const response = await fetch('/api/data');
  return await response.json();
}
```

### 1.3 推荐配置方案

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:security/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'security',
    'unused-imports',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    'security/detect-object-injection': 'warn',
    'no-eval': 'error',
    'no-new-func': 'error',
  },
};
```

```javascript
// prettier.config.js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
};
```

### 1.4 工具推荐

| 工具类型 | 推荐工具 | 用途 |
|----------|----------|------|
| Linter | ESLint + @typescript-eslint | 代码质量检查 |
| Formatter | Prettier | 代码格式化 |
| Git Hooks | Husky + lint-staged | 提交前检查 |
| Security | eslint-plugin-security | 安全检查 |
| Accessibility | eslint-plugin-jsx-a11y | 可访问性检查 |
| Commit Lint | @commitlint/config-conventional | 提交信息规范 |

### 1.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| ESLint 配置覆盖所有源文件 | P0 | 待办 |
| Prettier 与 ESLint 无冲突 | P0 | 待办 |
| Git Hooks 在提交前自动检查 | P0 | 待办 |
| CI 流程包含 Lint 检查 | P0 | 待办 |
| 团队成员 IDE 统一配置 | P1 | 待办 |
| 提交信息遵循 Conventional Commits | P1 | 待办 |

### 1.6 常见错误

| 错误 | 问题 | 解决方案 |
|------|------|----------|
| ESLint 和 Prettier 冲突 | 规则重复或矛盾 | 使用 eslint-config-prettier 关闭冲突规则 |
| 忽略文件配置不当 | 检查不应检查的文件 | 完善 .eslintignore 和 .prettierignore |
| 团队成员不遵守规范 | 缺乏强制机制 | 配置 Git Hooks 和 CI 检查 |
| 规则过于严格 | 开发效率降低 | 根据团队实际情况调整规则严格程度 |

---

## 2. 代码审查理论与实践

### 2.1 审查时机与粒度

| 变更规模 | 建议审查时间 | 审查重点 |
|----------|--------------|----------|
| < 50 行 | 15-30 分钟 | 逻辑、命名、边界情况 |
| 50-200 行 | 30-60 分钟 | 设计、测试、性能 |
| 200-400 行 | 60-90 分钟 | 架构、耦合、复杂度 |
| > 400 行 | 拆分审查 | 建议拆分提交 |

### 2.2 审查清单

#### 功能性检查

- 代码是否实现了需求的所有功能？
- 边界条件是否被正确处理？
- 错误处理是否完善？
- 并发场景是否安全？

#### 代码质量检查

- 代码是否易于理解？（可读性）
- 函数/类是否职责单一？（单一职责）
- 是否有重复代码？（DRY 原则）
- 命名是否清晰准确？

#### 安全性检查

- 用户输入是否经过验证和清理？
- 敏感数据是否安全处理？
- 是否存在 SQL/XSS/注入漏洞？
- 权限检查是否完善？

#### 性能检查

- 是否有明显的性能瓶颈？
- 大数据量处理是否高效？
- 是否有不必要的计算或渲染？

### 2.3 审查沟通原则

| 标记 | 含义 | 处理方式 |
|------|------|----------|
| 阻塞 | 必须修复才能合并 | 作者必须处理 |
| 建议 | 强烈建议采纳 | 作者回复说明 |
| 疑问 | 需要澄清 | 讨论后决定 |
| 赞赏 | 好的实践 | 鼓励继续保持 |

### 2.4 工具推荐

| 工具 | 平台 | 功能 |
|------|------|------|
| GitHub Code Review | GitHub | 原生 PR 审查 |
| GitLab Code Review | GitLab | 原生 MR 审查 |
| Snyk Code | 跨平台 | 安全漏洞扫描 |
| SonarQube | 跨平台 | 代码质量分析 |

### 2.5 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 审查流于形式 | 问题无法被发现 | 建立强制检查点，要求至少 2 人审查 |
| 审查周期过长 | 影响交付效率 | 设定 SLA（如 24 小时内响应） |
| 评论过于主观 | 引发团队冲突 | 基于客观标准和 checklist |
| 大段代码一次性审查 | 审查质量下降 | 控制变更规模，分批提交 |

---

## 3. 版本控制策略

### 3.1 主流工作流对比

| 工作流 | 分支数量 | 适用场景 | 发布频率 |
|--------|----------|----------|----------|
| Git Flow | 多（5+） | 大型项目、固定发布周期 | 周期性 |
| GitHub Flow | 少（2） | Web应用、持续部署 | 随时 |
| Trunk Based | 极少（1） | CI/CD成熟、自动化测试完善 | 每天多次 |

### 3.2 Git Flow 分支规范

| 分支 | 用途 | 生命周期 | 保护级别 |
|------|------|----------|----------|
| master | 生产代码 | 永久 | 严格保护 |
| develop | 开发集成 | 永久 | 保护 |
| feature/* | 功能开发 | 临时 | 无 |
| release/* | 发布准备 | 临时 | 保护 |
| hotfix/* | 紧急修复 | 临时 | 保护 |

### 3.3 提交信息规范

#### Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| feat | 新功能 | feat(auth): add OAuth2 login |
| fix | Bug 修复 | fix(api): handle null response |
| docs | 文档更新 | docs: update API reference |
| style | 代码格式 | style: format with prettier |
| refactor | 重构 | refactor(utils): simplify date parsing |
| perf | 性能优化 | perf(db): add query caching |
| test | 测试 | test(auth): add login unit tests |
| chore | 构建/工具 | chore: update dependencies |

### 3.4 语义化版本控制

```
版本格式：主版本号.次版本号.修订号（MAJOR.MINOR.PATCH）

MAJOR：不兼容的 API 修改
MINOR：向下兼容的功能新增
PATCH：向下兼容的问题修复

示例：
v1.2.3 -> v1.2.4 (Bug修复)
v1.2.3 -> v1.3.0 (新功能)
v1.2.3 -> v2.0.0 (破坏性变更)
```

### 3.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 分支策略文档化 | P0 | 待办 |
| 主分支受保护 | P0 | 待办 |
| 代码审查强制要求 | P0 | 待办 |
| CI 检查通过才能合并 | P0 | 待办 |
| 提交信息遵循规范 | P1 | 待办 |
| 版本标签语义化 | P1 | 待办 |

### 3.6 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 直接向主分支提交 | 引入未审查代码 | 启用分支保护规则 |
| 提交信息随意 | 历史难以追溯 | 使用 commitlint 强制规范 |
| 长期存在的特性分支 | 合并冲突频繁 | 特性分支生命周期控制在 1-3 天 |
| 缺少版本标签 | 无法回滚 | 自动化版本标签创建 |

---

## 4. 持续集成/持续部署

### 4.1 CI/CD 完整流程

```
代码提交 -> 触发构建 -> 静态检查 -> 单元测试 -> 构建产物 -> 集成测试 -> 部署 staging -> E2E测试 -> 部署生产
```

### 4.2 CI 流程阶段

| 阶段 | 任务 | 失败处理 |
|------|------|----------|
| Install | 安装依赖 | 检查网络/镜像源 |
| Lint | ESLint/Prettier | 本地修复后重新提交 |
| Type Check | TypeScript 类型检查 | 修复类型错误 |
| Unit Test | 单元测试（Jest/Vitest） | 修复失败的测试 |
| Build | 构建应用 | 检查构建配置 |
| Integration Test | 集成测试 | 检查模块间交互 |
| Coverage | 覆盖率检查 | 补充测试用例 |

### 4.3 工具推荐

| 类型 | 工具 | 适用场景 |
|------|------|----------|
| CI 平台 | GitHub Actions | GitHub 仓库 |
| CI 平台 | GitLab CI/CD | GitLab 仓库 |
| CI 平台 | Jenkins | 自托管/企业 |
| CI 平台 | CircleCI | 云原生 |
| CD 平台 | ArgoCD | Kubernetes |
| CD 平台 | Vercel/Netlify | 前端托管 |

### 4.4 GitHub Actions 配置示例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Unit tests
        run: npm run test:unit -- --coverage

      - name: Build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests
        run: npm run test:e2e
```

### 4.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 每次提交触发 CI | P0 | 待办 |
| 失败时阻止合并 | P0 | 待办 |
| 测试覆盖率报告 | P0 | 待办 |
| 构建产物缓存 | P1 | 待办 |
| 并行化测试 | P1 | 待办 |
| 自动部署 staging | P1 | 待办 |
| 生产部署审批 | P2 | 待办 |
| 回滚机制 | P2 | 待办 |

### 4.6 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| CI 配置过于复杂 | 难以维护 | 拆分为可复用的 workflow |
| 测试不稳定 | 误报频繁 | 隔离测试，避免依赖外部服务 |
| 缺少并行化 | 构建时间长 | 使用矩阵策略并行运行 |
| 敏感信息泄露 | 安全风险 | 使用 Secrets 管理敏感数据 |
| 无缓存策略 | 构建缓慢 | 配置依赖和构建缓存 |

---

## 5. 文档化策略

### 5.1 文档金字塔

```
                    架构决策记录 ADR
                           |
              架构设计文档 (System Design)
                           |
            API 文档 (OpenAPI/Swagger)
                           |
         开发文档 (Contributing Guide)
                           |
      README / 快速开始指南
                           |
              代码注释
```

### 5.2 README 标准结构

```markdown
# 项目名称

> 一句话描述项目用途

## 特性
- 核心功能 1
- 核心功能 2

## 快速开始
### 安装
### 使用示例

## 文档
- 完整文档链接
- API 文档链接

## 贡献
贡献指南链接

## 许可证
MIT
```

### 5.3 API 文档规范

```yaml
# OpenAPI 3.0 示例
openapi: 3.0.0
info:
  title: 用户 API
  version: 1.0.0
paths:
  /users:
    get:
      summary: 获取用户列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### 5.4 工具推荐

| 文档类型 | 工具 | 用途 |
|----------|------|------|
| API 文档 | Swagger/OpenAPI | REST API 规范 |
| API 文档 | GraphQL Playground | GraphQL 文档 |
| 组件文档 | Storybook | UI 组件展示 |
| 知识库 | Docusaurus | 项目文档站点 |
| 知识库 | Notion/Confluence | 团队协作文档 |
| 代码文档 | TypeDoc/JSDoc | 自动生成 API 文档 |

### 5.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| README 包含安装和运行说明 | P0 | 待办 |
| API 文档与代码同步 | P0 | 待办 |
| 架构决策记录 ADR | P1 | 待办 |
| 贡献指南 CONTRIBUTING.md | P1 | 待办 |
| 代码变更同步更新文档 | P1 | 待办 |
| 文档版本与代码版本对应 | P2 | 待办 |

### 5.6 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 文档与代码不同步 | 误导开发者 | 代码审查时检查文档更新 |
| 缺少快速开始 | 上手困难 | README 必须包含最小可运行示例 |
| 过度文档 | 维护负担 | 聚焦用户关心的内容 |
| 文档分散 | 难以查找 | 统一文档入口和导航 |

---

## 6. 测试策略金字塔

### 6.1 测试金字塔

```
                    /
                   / E2E 测试 (10%)
                  /  用户场景、关键路径
                 /___________________
                /                     \
               /   集成测试 (30%)        \
              /    模块交互、API 测试       \
             /_____________________________\
            /                                 \
           /       单元测试 (60%)               \
          /        函数、组件、工具类             \
         /_______________________________________\
```

### 6.2 各层测试对比

| 层级 | 范围 | 速度 | 数量 | 维护成本 | 工具 |
|------|------|------|------|----------|------|
| 单元测试 | 函数/类/组件 | 快（毫秒） | 多 | 低 | Jest, Vitest |
| 集成测试 | 模块间交互 | 中（秒） | 中 | 中 | Vitest, Supertest |
| E2E 测试 | 完整用户流程 | 慢（分钟） | 少 | 高 | Playwright, Cypress |

### 6.3 单元测试最佳实践

```typescript
// 使用 AAA 模式：Arrange, Act, Assert
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './pricing';

describe('calculateDiscount', () => {
  it('should return correct discount for VIP customers', () => {
    // Arrange
    const price = 100;
    const customerType = 'VIP';

    // Act
    const result = calculateDiscount(price, customerType);

    // Assert
    expect(result).toBe(80); // 20% discount
  });

  it('should throw error for invalid price', () => {
    expect(() => calculateDiscount(-10, 'regular'))
      .toThrow('Price must be positive');
  });
});
```

### 6.4 集成测试示例

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from './server';

describe('User API Integration', () => {
  let server;

  beforeAll(async () => {
    server = await createServer({ port: 0 }); // 随机端口
  });

  afterAll(async () => {
    await server.close();
  });

  it('should create and retrieve user', async () => {
    // Create user
    const createRes = await server.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'John', email: 'john@example.com' },
    });
    expect(createRes.statusCode).toBe(201);

    const { id } = JSON.parse(createRes.body);

    // Retrieve user
    const getRes = await server.inject({
      method: 'GET',
      url: `/users/${id}`,
    });
    expect(getRes.statusCode).toBe(200);
  });
});
```

### 6.5 E2E 测试示例

```typescript
import { test, expect } from '@playwright/test';

test('user can complete checkout flow', async ({ page }) => {
  // Navigate to product page
  await page.goto('/products/123');

  // Add to cart
  await page.click('[data-testid="add-to-cart"]');

  // Go to cart
  await page.click('[data-testid="cart-icon"]');

  // Proceed to checkout
  await page.click('[data-testid="checkout"]');

  // Fill shipping info
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="address"]', '123 Test St');

  // Complete order
  await page.click('[data-testid="place-order"]');

  // Verify success
  await expect(page.locator('[data-testid="order-confirmation"]'))
    .toBeVisible();
});
```

### 6.6 测试覆盖率目标

| 层级 | 目标覆盖率 | 最低覆盖率 |
|------|------------|------------|
| 单元测试 | 80% | 70% |
| 集成测试 | 60% | 50% |
| E2E 测试 | 核心流程 | 关键路径 |

### 6.7 工具推荐

| 类型 | 工具 | 特点 |
|------|------|------|
| 单元测试 | Vitest | 速度快，ESM 原生支持 |
| 单元测试 | Jest | 生态成熟，兼容性好 |
| E2E 测试 | Playwright | 多浏览器，自动等待 |
| E2E 测试 | Cypress | 调试友好，实时重载 |
| Mock 工具 | MSW | API Mock，支持浏览器/Node |
| 测试工具 | Testing Library | 用户行为导向 |

### 6.8 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 单元测试覆盖率 > 70% | P0 | 待办 |
| 关键业务逻辑全覆盖 | P0 | 待办 |
| CI 中运行所有测试 | P0 | 待办 |
| API 集成测试 | P1 | 待办 |
| 核心用户流程 E2E 测试 | P1 | 待办 |
| 测试数据隔离 | P1 | 待办 |
| 可视化回归测试 | P2 | 待办 |

### 6.9 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 测试依赖外部服务 | 测试不稳定 | 使用 Mock/Stub |
| 测试实现细节 | 重构困难 | 测试行为而非实现 |
| 测试数据污染 | 测试相互影响 | 每个测试独立准备数据 |
| 缺少负面测试 | 遗漏边界情况 | 测试错误和异常场景 |
| 测试运行缓慢 | 反馈周期长 | 优化测试，并行执行 |

---

## 7. 性能预算与监控

### 7.1 性能预算指标

| 指标 | 预算 | 测量工具 |
|------|------|----------|
| First Contentful Paint (FCP) | < 1.8s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.8s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| First Input Delay (FID) | < 100ms | RUM |
| JavaScript Bundle Size | < 200KB (gzipped) | Bundle Analyzer |
| Image Size | WebP/AVIF | Lighthouse |

### 7.2 性能优化策略

```
加载性能优化
├── 代码分割 (Code Splitting)
│   ├── 路由级别分割
│   ├── 组件懒加载
│   └── 动态导入
├── 资源优化
│   ├── 图片压缩和格式转换
│   ├── 字体子集化
│   └── 静态资源 CDN
├── 缓存策略
│   ├── 浏览器缓存
│   ├── Service Worker
│   └── 预加载/预连接
└── 渲染优化
    ├── 关键 CSS 内联
    ├── 异步加载非关键 JS
    └── 骨架屏
```

### 7.3 监控方案

| 监控类型 | 工具 | 用途 |
|----------|------|------|
| 实验室数据 | Lighthouse CI | CI 中的性能检查 |
| 实验室数据 | WebPageTest | 多地点性能测试 |
| 真实用户监控 | Vercel Analytics | 真实性能数据 |
| 真实用户监控 | Sentry Performance | 错误和性能关联 |
| 自定义监控 | Web Vitals API | 自定义指标采集 |

### 7.4 Lighthouse CI 配置

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 7.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 定义性能预算 | P0 | 待办 |
| CI 集成性能检查 | P0 | 待办 |
| 监控 Core Web Vitals | P0 | 待办 |
| 配置资源缓存 | P1 | 待办 |
| 图片优化 | P1 | 待办 |
| 代码分割 | P1 | 待办 |
| 错误监控 | P2 | 待办 |

### 7.6 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 忽略移动性能 | 移动端体验差 | 以移动设备为基准测试 |
| 只看实验室数据 | 忽略真实用户 | 结合 RUM 数据 |
| 过度优化 | 代码复杂 | 优先优化关键路径 |
| 缺少预算告警 | 性能退化 | 设置 CI 失败阈值 |

---

## 8. 安全开发生命周期

### 8.1 SDL 流程

```
需求分析 -> 安全设计 -> 安全编码 -> 安全测试 -> 安全部署 -> 安全运维
    |           |           |           |           |           |
 威胁建模    安全审查    静态扫描    渗透测试    配置加固    漏洞响应
```

### 8.2 安全编码规范

| 风险类型 | 防护措施 | 工具 |
|----------|----------|------|
| XSS | 输入验证、输出编码 | DOMPurify, Helmet |
| CSRF | CSRF Token, SameSite Cookie | csurf |
| SQL 注入 | 参数化查询 | ORM (Prisma, TypeORM) |
| 命令注入 | 避免拼接命令 | child_process 安全使用 |
| 路径遍历 | 路径验证 | path.normalize |
| 敏感数据泄露 | 加密存储 | crypto, bcrypt |

### 8.3 依赖安全

```bash
# 检查已知漏洞
npm audit

# 自动修复
npm audit fix

# 持续监控
npx snyk test
npx snyk monitor
```

### 8.4 安全扫描工具

| 类型 | 工具 | 用途 |
|------|------|------|
| SAST | ESLint Security | 静态代码分析 |
| SAST | SonarQube | 代码质量和安全 |
| SCA | Snyk | 依赖漏洞扫描 |
| SCA | npm audit | 内置安全检查 |
| DAST | OWASP ZAP | 动态应用测试 |
| Secrets | GitGuardian | 密钥泄露检测 |

### 8.5 安全头部配置

```javascript
// Helmet 配置示例
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### 8.6 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 输入验证和清理 | P0 | 待办 |
| HTTPS 强制 | P0 | 待办 |
| 安全头部配置 | P0 | 待办 |
| 依赖漏洞扫描 | P0 | 待办 |
| 敏感信息不提交到仓库 | P0 | 待办 |
| 身份认证和授权 | P0 | 待办 |
| 错误信息不泄露敏感信息 | P1 | 待办 |
| 定期安全审查 | P2 | 待办 |

### 8.7 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 信任客户端输入 | 注入攻击 | 服务端验证所有输入 |
| 明文存储密码 | 数据泄露 | 使用 bcrypt/argon2 哈希 |
| 敏感信息硬编码 | 密钥泄露 | 使用环境变量和密钥管理服务 |
| 忽略安全更新 | 已知漏洞 | 自动化依赖更新 |

---

## 9. 可访问性工程化

### 9.1 WCAG 合规等级

| 等级 | 要求 | 适用场景 |
|------|------|----------|
| A | 最低可访问性 | 必须满足 |
| AA | 推荐可访问性 | 政府/企业要求 |
| AAA | 最高可访问性 | 特殊教育/医疗 |

### 9.2 核心原则 POUR

| 原则 | 含义 | 实践 |
|------|------|------|
| Perceivable | 可感知 | 替代文本、颜色对比 |
| Operable | 可操作 | 键盘导航、焦点管理 |
| Understandable | 可理解 | 清晰标签、错误提示 |
| Robust | 健壮 | 语义化 HTML、ARIA |

### 9.3 ARIA 使用规范

```html
<!-- 好的示例：按钮 -->
<button type="button" aria-label="关闭对话框">
  <svg><!-- 图标 --></svg>
</button>

<!-- 好的示例：自定义组件 -->
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">确认删除</h2>
  <p>此操作不可撤销。</p>
  <button>确认</button>
  <button>取消</button>
</div>

<!-- 避免：过度使用 ARIA -->
<!-- 不需要：button 已有默认语义 -->
<div role="button" tabindex="0">点击我</div>
```

### 9.4 测试工具

| 工具 | 用途 |
|------|------|
| axe-core | 自动化可访问性测试 |
| Lighthouse | 可访问性评分 |
| ESLint jsx-a11y | 代码层面检查 |
| NVDA/JAWS | 屏幕阅读器测试 |
| Keyboard Only | 键盘导航测试 |

### 9.5 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 图片有替代文本 | P0 | 待办 |
| 表单有关联标签 | P0 | 待办 |
| 键盘可访问 | P0 | 待办 |
| 颜色对比度 >= 4.5:1 | P0 | 待办 |
| 焦点可见 | P0 | 待办 |
| 页面标题有意义 | P1 | 待办 |
| 跳过链接 | P1 | 待办 |
| ARIA 标签正确 | P1 | 待办 |
| 屏幕阅读器测试 | P2 | 待办 |

### 9.6 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 使用 div 代替 button | 无法键盘操作 | 使用语义化元素 |
| 图片无 alt | 屏幕阅读器无法识别 | 提供描述性 alt |
| 仅依赖颜色传达信息 | 色盲用户无法理解 | 使用图标+文字 |
| 焦点丢失 | 键盘用户迷失 | 管理焦点状态 |

---

## 10. 国际化工程化

### 10.1 i18n 架构

```
源代码
   |
   ├── 翻译提取 -> 翻译文件 (JSON/XLIFF)
   |                   |
   |                   ├── 翻译管理系统 (TMS)
   |                   |       |
   |                   |       └── 译者翻译
   |                   |
   |                   └── 导入翻译
   |
   └── 运行时加载 -> 根据用户语言显示
```

### 10.2 国际化库对比

| 库 | 特点 | 适用场景 |
|----|------|----------|
| react-i18next | React 生态，功能丰富 | React 应用 |
| vue-i18n | Vue 生态，轻量 | Vue 应用 |
| FormatJS | ICU 消息格式，标准 | 企业级应用 |
| LinguiJS | 编译时提取，性能好 | 性能敏感应用 |

### 10.3 最佳实践

```typescript
// 使用 ICU 消息格式
const messages = {
  // 简单消息
  'greeting': 'Hello, {name}!',

  // 复数形式
  'item_count': `
    {count, plural,
      =0 {No items}
      =1 {One item}
      other {# items}
    }
  `,

  // 选择
  'gender_greeting': `
    {gender, select,
      male {He}
      female {She}
      other {They}
    } logged in
  `,

  // 数字格式化
  'price': 'Price: {price, number, ::currency/USD}',

  // 日期格式化
  'last_login': 'Last login: {date, date, long}',
};
```

### 10.4 伪本地化测试

```typescript
// 伪本地化：扩展文本检测布局问题
const pseudoLocale = {
  'Hello': 'Ħḗḗŀŀǿǿ',
  'Settings': 'Şḗḗŧŧīīƞɠş',
};

// 使用：在开发环境启用伪本地化
// 可以检测：文本截断、硬编码字符串、布局问题
```

### 10.5 RTL 支持

```css
/* 使用逻辑属性 */
.element {
  /* 物理属性 */
  margin-left: 1rem;  /* 不支持 RTL */

  /* 逻辑属性 - 推荐 */
  margin-inline-start: 1rem;  /* 自动适应 LTR/RTL */
}

/* 镜像图标 */
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}
```

### 10.6 检查清单

| 检查项 | 优先级 | 状态 |
|--------|--------|------|
| 无硬编码字符串 | P0 | 待办 |
| 支持复数形式 | P0 | 待办 |
| 日期/时间/数字本地化 | P0 | 待办 |
| RTL 布局支持 | P1 | 待办 |
| 伪本地化测试 | P1 | 待办 |
| 翻译密钥命名规范 | P1 | 待办 |
| 翻译文件版本管理 | P2 | 待办 |
| 翻译覆盖率监控 | P2 | 待办 |

### 10.7 常见错误

| 错误 | 后果 | 解决方案 |
|------|------|----------|
| 硬编码字符串 | 无法翻译 | 全部使用 i18n 函数 |
| 字符串拼接 | 语法错误 | 使用占位符和 ICU 格式 |
| 忽略复数规则 | 翻译不准确 | 使用标准复数形式 |
| 日期格式硬编码 | 不符合当地习惯 | 使用 Intl.DateTimeFormat |
| 缺少上下文 | 翻译歧义 | 提供翻译注释 |

---

## 附录：完整检查清单汇总

### 项目启动检查清单

| # | 检查项 | 类别 | 优先级 |
|---|--------|------|--------|
| 1 | 代码规范配置（ESLint + Prettier） | 规范 | P0 |
| 2 | Git Hooks 配置（Husky + lint-staged） | 规范 | P0 |
| 3 | 提交信息规范（Commitlint） | 规范 | P1 |
| 4 | 分支保护规则 | 版本控制 | P0 |
| 5 | CI/CD 流水线配置 | CI/CD | P0 |
| 6 | README 和基础文档 | 文档 | P0 |
| 7 | 单元测试框架配置 | 测试 | P0 |
| 8 | 测试覆盖率监控 | 测试 | P1 |
| 9 | 性能预算定义 | 性能 | P1 |
| 10 | 安全扫描配置 | 安全 | P0 |
| 11 | 可访问性检查工具 | a11y | P1 |
| 12 | i18n 框架集成 | i18n | P2 |

### 发布前检查清单

| # | 检查项 | 类别 |
|---|--------|------|
| 1 | 所有测试通过 | 测试 |
| 2 | 代码审查完成 | 协作 |
| 3 | 性能预算达标 | 性能 |
| 4 | 安全扫描通过 | 安全 |
| 5 | 可访问性检查通过 | a11y |
| 6 | 关键翻译完成 | i18n |
| 7 | 文档已更新 | 文档 |
| 8 | 回滚方案就绪 | 运维 |

---

*本文档持续更新，建议定期回顾并根据项目实际情况调整*

# 标签体系参考

本文档定义了 awesome-jsts-ecosystem 项目中使用的完整标签体系，用于对库进行分类和标注。

---

## 一、TypeScript 支持度

标识库的 TypeScript 支持级别，帮助开发者快速判断类型体验。

| 标签 | 名称 | 描述 | 使用场景 |
|------|------|------|---------|
| 🟢 | **Native TypeScript** | 原生 TypeScript 编写，源码即类型 | 优先选择，类型体验最佳 |
| 🟡 | **Full Type Definitions** | 官方提供完整、准确的类型定义 | 类型体验良好，可放心使用 |
| 🟠 | **Partial Types** | 部分类型支持，或社区维护的 @types | 需要时可用，可能需补充类型 |
| 🔴 | **No Types** | 无 TypeScript 支持 | 一般不推荐，JS 项目可用 |

### 判定标准

#### 🟢 Native TypeScript

- 源码使用 TypeScript 编写
- package.json 中包含 `types` 或 `typings` 字段
- 类型定义与源码同步更新

#### 🟡 Full Type Definitions

- 官方维护类型定义
- 类型覆盖率 > 90%
- 类型测试完善

#### 🟠 Partial Types

- 社区维护的 @types 包
- 类型覆盖率 50-90%
- 部分 API 可能缺少类型

#### 🔴 No Types

- 无任何类型定义
- @types 包质量差或不存在
- 仅适用于纯 JavaScript 项目

---

## 二、维护活跃度

标识库的持续维护状态，帮助评估长期可用性。

| 标签 | 名称 | 判定标准 | 建议 |
|------|------|---------|------|
| ⭐⭐⭐ | **Actively Maintained** | 最近 3 个月有提交，issue/PR 响应快 | 优先选择 |
| ⭐⭐ | **Maintained** | 最近 6 个月有提交，维护稳定 | 可放心使用 |
| ⭐ | **Low Maintenance** | 最近 12 个月有提交，功能成熟 | 适合稳定功能场景 |
| ⚠️ | **Unmaintained** | 超过 12 个月无更新 | 不推荐新项目使用 |

### 补充说明

#### ⭐⭐⭐ Actively Maintained

- 最近 3 个月内有代码提交
- issue 响应时间 < 7 天
- 定期发布新版本

#### ⭐⭐ Maintained

- 最近 6 个月内有代码提交
- issue 响应时间 < 30 天
- 安全漏洞及时修复

#### ⭐ Low Maintenance

- 最近 12 个月内有代码提交
- 功能已完善，无需频繁更新
- 进入维护模式

#### ⚠️ Unmaintained

- 超过 12 个月无代码提交
- issue 堆积无人处理
- 考虑标记为归档并推荐替代方案

---

## 三、适用场景

标识库最适合的使用场景，帮助快速筛选。

| 标签 | 名称 | 描述 | 典型特征 |
|------|------|------|---------|
| 🏢 | **Enterprise** | 企业级应用 | 稳定、安全、有商业支持 |
| 🚀 | **Rapid Prototyping** | 快速原型开发 | 上手快、功能丰富、开箱即用 |
| 🎮 | **Personal Projects** | 个人项目 | 轻量、有趣、满足个性化需求 |
| 📚 | **Learning** | 学习推荐 | 源码清晰、文档友好、适合入门 |

### 场景详解

#### 🏢 Enterprise

- 经过大规模生产环境验证
- 有长期维护承诺或商业支持
- 完善的测试覆盖和文档
- 安全审计合规

#### 🚀 Rapid Prototyping

- 5 分钟内可跑起来
- 零配置或低配置
- 功能开箱即用
- 适合 MVP 开发

#### 🎮 Personal Projects

- 解决特定小众需求
- 设计有趣或有特色
- 社区活跃度高
- 适合 side project

#### 📚 Learning

- 源码易于阅读
- 有详细教程或示例
- 设计模式清晰
- 适合学习源码或技术原理

---

## 四、标签组合示例

### 推荐组合

| 组合 | 含义 | 示例 |
|------|------|------|
| 🟢⭐⭐⭐🏢 | 原生 TS + 高活跃 + 企业级 | zod, Prisma |
| 🟡⭐⭐⭐🚀 | 完整类型 + 高活跃 + 快速原型 | shadcn/ui, Tailwind CSS |
| 🟢⭐⭐📚 | 原生 TS + 正常维护 + 学习推荐 | tiny-invariant |

### 不推荐的组合

| 组合 | 问题 | 建议 |
|------|------|------|
| 🔴⭐⭐⭐ | 无类型但高活跃 | 仅用于纯 JS 项目 |
| 🟢⚠️ | 原生 TS 但已停止维护 | 谨慎使用，寻找替代 |
| 🏢⚠️ | 企业级但已停止维护 | 强烈不推荐 |

---

## 五、标签使用规范

### 在列表中的显示格式

```markdown
- [库名](链接) 🟢⭐⭐⭐🏢 - 简短描述
```

### 排序优先级

1. TypeScript 支持度（🟢 > 🟡 > 🟠 > 🔴）
2. 维护活跃度（⭐⭐⭐ > ⭐⭐ > ⭐ > ⚠️）
3. 适用场景（按场景分类）

### 标签更新

- 每次发布更新时检查并更新标签
- 维护状态变化需及时调整
- 类型支持度改善可升级标签

---

## 六、自动化标签检测脚本

```typescript
// scripts/detect-tags.ts
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface PackageInfo {
  name: string;
  types?: boolean;
  lastCommit: Date;
  openIssues: number;
}

function detectTypeScriptSupport(pkgPath: string): '🟢' | '🟡' | '🟠' | '🔴' {
  const pkg = JSON.parse(readFileSync(`${pkgPath}/package.json`, 'utf-8'));
  if (pkg.types || pkg.typings) return '🟢';
  if (pkg.devDependencies?.['@types/' + pkg.name]) return '🟡';
  return '🔴';
}

function detectMaintenance(pkgPath: string): '⭐⭐⭐' | '⭐⭐' | '⭐' | '⚠️' {
  const lastCommit = execSync('git log -1 --format=%ci', { cwd: pkgPath }).toString().trim();
  const days = (Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 90) return '⭐⭐⭐';
  if (days < 180) return '⭐⭐';
  if (days < 365) return '⭐';
  return '⚠️';
}

// 批量检测示例
// const tags = packages.map(p => `${detectTypeScriptSupport(p)}${detectMaintenance(p)}`);
```

---

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| npm semver | 版本规范 | [docs.npmjs.com/about-semantic-versioning](https://docs.npmjs.com/about-semantic-versioning) |
| Snyk Advisor | 包健康度 | [snyk.io/advisor](https://snyk.io/advisor/) |
| Bundlephobia | 包体积分析 | [bundlephobia.com](https://bundlephobia.com/) |
| npm trends | 下载量趋势 | [npmtrends.com](https://www.npmtrends.com/) |
| OpenSSF Scorecard | 安全评分 | [securityscorecards.dev](https://securityscorecards.dev/) |

---

*最后更新: 2026-04-29*

# 库收录标准

本文档定义了 awesome-jsts-ecosystem 项目中收录库的最低标准和筛选条件。

## 收录原则

- **质量优先**：宁可少而精，不要大而全
- **实用导向**：优先收录生产环境验证过的库
- **生态兼容**：与主流 JS/TS 生态工具链兼容

---

## 1. Stars 门槛

| 类型 | 最低 Stars | 例外情况 |
|------|-----------|---------|
| 基础工具/框架 | 1,000+ | 无 |
| 细分领域库 | 500+ | 技术领域越小众，门槛越低 |
| 新兴项目 | 300+ | 发布 < 6 个月，增长趋势良好 |
| 官方/生态核心 | 无限制 | 官方团队维护、生态核心组件 |

### 例外评估标准

符合以下任一条件可降低 Stars 要求：

- 🏢 **企业背书**：被知名公司用于生产环境
- 📦 **生态核心**：被其他知名库依赖
- 🔬 **技术创新**：解决独特技术难题
- 🌍 **社区认可**：有知名开发者推荐或技术文章介绍

---

## 2. 维护状态要求

| 状态 | 最后更新时间 | 说明 |
|------|-------------|------|
| ✅ 推荐 | < 6 个月 | 活跃维护，建议使用 |
| ⚠️ 可用 | 6-12 个月 | 功能稳定，可正常使用 |
| ❌ 谨慎 | 12-24 个月 | 需评估替代方案 |
| 🚫 不推荐 | > 24 个月 | 通常不收录 |

### 特殊情况

- **功能完整**：某些工具库功能已完善，无需频繁更新
- **稳定阶段**：已进入 LTS 阶段的框架（如 Express.js）

---

## 3. TypeScript 支持度要求

| 等级 | 要求 | 优先级 |
|------|------|--------|
| 🟢 Native TypeScript | 原生 TS 编写 | ⭐⭐⭐ 优先 |
| 🟡 Full Type Definitions | 官方提供完整类型定义 | ⭐⭐⭐ 优先 |
| 🟠 Partial Types | 社区类型定义 (@types) | ⭐⭐ 可选 |
| 🔴 No Types | 无类型支持 | ⭐ 一般不收录 |

### 类型质量要求

- 类型定义需与运行时行为一致
- 避免大量使用 `any`
- 泛型支持完整

---

## 4. 文档完善度要求

### 必备文档

| 内容 | 最低要求 | 推荐形式 |
|------|---------|---------|
| 安装说明 | 必须 | README |
| 快速开始 | 必须 | README / 官网 |
| API 文档 | 必须 | 完整 API 列表 |
| 使用示例 | 必须 | CodeSandbox / StackBlitz |
| 更新日志 | 推荐 | CHANGELOG.md |

### 加分项

- 📖 中文文档
- 🎬 视频教程
- 🧪 在线演示
- 📚 迁移指南

---

## 5. 其他考量因素

### 安全性

- 无已知高危漏洞（通过 `npm audit` 检测）
- 依赖树不过于庞大

### 许可证

- 优先：MIT、Apache-2.0、BSD
- 可接受：ISC、Unlicense
- 需评估：GPL 系列（可能影响商业使用）

### 性能

- 提供性能基准数据（可选但推荐）
- 包体积合理（通过 BundlePhobia 评估）

---

## 6. 收录流程

```
提案 → 初步筛选 → 标准审核 → 分类归档 → 定期复审
```

### 定期复审

- 每季度检查维护状态
- 每年评估是否仍符合标准
- 标记过时库并推荐替代方案

---

## 📋 归档标准判定矩阵

| 判定维度 | 权重 | 达标线 | 测量方式 |
|---------|------|--------|---------|
| GitHub Stars | 15% | 见第 1 节 | GitHub API |
| 最后更新时间 | 20% | < 12 个月 | GitHub 提交记录 |
| npm 周下载量 | 15% | > 1,000 | npm-stat.com |
| TypeScript 支持 | 15% | 🟡 及以上 | 源码/类型定义检查 |
| 文档完整度 | 20% | 必备文档 ≥ 4/5 | 人工审核 |
| 安全评分 | 15% | 无高危漏洞 | `npm audit` / Snyk |

**归档决策规则**：

- 总分 ≥ 80：✅ 直接收录
- 总分 60–79：⚠️ 条件收录（需注明注意事项）
- 总分 < 60：❌ 暂不收录

---

## 📊 文档质量评估矩阵

| 等级 | API 文档 | 使用示例 | 变更日志 | 贡献指南 | TypeScript 定义 |
|------|---------|---------|---------|---------|----------------|
| 🏆 卓越 (A) | 完整 + 交互式 | 10+ 可运行示例 | 语义化版本 | 详细 + 模板 | 原生 + 泛型完整 |
| ✅ 良好 (B) | 完整 | 5+ 示例 | 存在 | 存在 | 官方定义 |
| ⚠️ 及格 (C) | 基本覆盖 | 1–2 示例 | 零星 | 简略 | @types 社区 |
| ❌ 不足 (D) | 缺失/过时 | 无 | 无 | 无 | 无 |

**推荐库文档质量底线**：B 级及以上。

---

## 🧪 代码示例：自动化评估脚本

### 使用 npm audit 检测安全漏洞

```bash
# 在待评估库目录中运行
npm audit --audit-level=moderate --json > audit-report.json

# 解析高危漏洞数量
node -e "
const report = require('./audit-report.json');
const high = report.metadata.vulnerabilities.high || 0;
const critical = report.metadata.vulnerabilities.critical || 0;
console.log('High:', high, 'Critical:', critical);
"
```

### 使用 BundlePhobia API 查询包体积

```javascript
// bundlephobia-fetch.js
async function fetchBundleInfo(packageName) {
  const url = `https://bundlephobia.com/api/size?package=${encodeURIComponent(packageName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BundlePhobia API error: ${res.status}`);
  const data = await res.json();
  return {
    name: data.name,
    version: data.version,
    size: data.size,           // 原始大小（bytes）
    gzip: data.gzip,           // gzip 后大小
    dependencyCount: data.dependencyCount,
    hasJSModule: data.hasJSModule,   // 是否提供 ESM
    hasJSNext: data.hasJSNext,
  };
}

// 使用示例
fetchBundleInfo('lodash-es').then(info => {
  console.log(`Package size: ${(info.gzip / 1024).toFixed(1)} KiB (gzip)`);
  console.log(`Dependencies: ${info.dependencyCount}`);
  console.log(`ESM support: ${info.hasJSModule}`);
});
```

### 使用 GitHub API 获取 Stars 与最后更新

```javascript
// github-evaluator.js
async function evaluateRepo(owner, repo, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [repoRes, commitRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers }),
  ]);

  const repoData = await repoRes.json();
  const commits = await commitRes.json();
  const lastUpdated = new Date(commits[0]?.commit?.committer?.date || repoData.pushed_at);
  const monthsAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24 * 30);

  return {
    stars: repoData.stargazers_count,
    openIssues: repoData.open_issues_count,
    lastCommitMonths: Math.round(monthsAgo),
    archived: repoData.archived,
    license: repoData.license?.spdx_id,
  };
}

// 使用示例
evaluateRepo('facebook', 'react', process.env.GH_TOKEN)
  .then(data => console.log(data));
```

### 计算综合评分的参考实现

```typescript
interface ScoreWeights {
  stars: number;
  lastUpdate: number;
  downloads: number;
  tsSupport: number;
  docs: number;
  security: number;
}

function calculateScore(
  metrics: {
    stars: number;
    lastUpdateMonths: number;
    weeklyDownloads: number;
    tsLevel: 0 | 1 | 2 | 3; // 0=none, 1=partial, 2=full, 3=native
    docsScore: number;      // 0–100
    highVulns: number;
  },
  weights: ScoreWeights = {
    stars: 0.15,
    lastUpdate: 0.20,
    downloads: 0.15,
    tsSupport: 0.15,
    docs: 0.20,
    security: 0.15,
  }
): number {
  const starScore = Math.min(metrics.stars / 1000, 1) * 100;
  const updateScore = metrics.lastUpdateMonths < 6 ? 100
    : metrics.lastUpdateMonths < 12 ? 70
    : metrics.lastUpdateMonths < 24 ? 40 : 0;
  const downloadScore = Math.min(metrics.weeklyDownloads / 1000, 1) * 100;
  const tsScore = metrics.tsLevel * 33.3;
  const securityScore = metrics.highVulns === 0 ? 100 : metrics.highVulns < 3 ? 50 : 0;

  return Math.round(
    starScore * weights.stars +
    updateScore * weights.lastUpdate +
    downloadScore * weights.downloads +
    tsScore * weights.tsSupport +
    metrics.docsScore * weights.docs +
    securityScore * weights.security
  );
}
```

---

## 🔗 权威参考链接

- [npm Audit 文档](https://docs.npmjs.com/cli/commands/npm-audit)
- [Snyk Open Source Security](https://snyk.io/product/open-source-security-management/)
- [BundlePhobia — 包体积分析](https://bundlephobia.com/)
- [npmtrends — 下载量对比](https://npmtrends.com/)
- [Open Source Insights (deps.dev)](https://deps.dev/)
- [Choose a License](https://choosealicense.com/)
- [Conventional Changelog 规范](https://www.conventionalcommits.org/)
- [Mozilla Open Source Archetypes](https://mozilla.github.io/open-leadership-training-series/articles/opening-your-project/)
- [GitHub REST API 文档](https://docs.github.com/en/rest)
- [npm Registry API](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md)
- [Socket.dev — 供应链安全分析](https://socket.dev/)
- [Libraries.io — 依赖健康度](https://libraries.io/)
- [StackBlitz — 在线可运行示例](https://stackblitz.com/)
- [CodeSandbox — 云端 IDE](https://codesandbox.io/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [OSI 认可的开源许可证列表](https://opensource.org/licenses)

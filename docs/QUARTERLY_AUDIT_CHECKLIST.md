# 季度内容审计检查清单

> 本清单定义对 JS/TS 全景知识库进行季度审计的五维度流程与自动化工具清单。
> 创建日期: 2026-04-27
> 审计频率: 每季度末（3月、6月、9月、12月）

---

## 一、审计五维度

### 维度 1：技术准确性（Accuracy）

- [ ] 所有指南中的代码示例可通过 CI 测试
- [ ] 版本号（TypeScript、React、Node.js 等）与官方最新稳定版一致
- [ ] 没有已知的虚构 CVE 或错误事实陈述
- [ ] 新发布的框架特性（ES2026 Stage 4、React 19.x 等）已及时覆盖

**自动化工具**:

```bash
# 版本号过期检查
node scripts/validate-versions.js --threshold=2

# 代码运行验证
pnpm test        # vitest 全部模块
pnpm type-check  # tsc --noEmit
```

### 维度 2：时效性（Freshness）

- [ ] 所有 Markdown 文件包含 `last-updated` frontmatter
- [ ] 超过 `review-cycle` 的文件已触发 review 提醒
- [ ] 生态数据（Stars、下载量）更新至当季末
- [ ] 对比矩阵中的工具版本号已刷新

**自动化工具**:

```bash
# frontmatter 完整性检查
node scripts/add-content-metadata.js --dry-run

# 生态数据刷新
node scripts/update-stars.js
node scripts/update-matrix-data.js
node scripts/trend-monitor.js
```

### 维度 3：覆盖度（Coverage）

- [ ] 新增热门工具（Stars 增速 >20%）是否有对应分类/指南
- [ ] code-lab 模块是否有 THEORY.md 和 README.md
- [ ] 示例项目是否覆盖主要技术栈
- [ ] 英文版文档比例是否达到目标（当前目标：核心文档 20%+）

**自动化工具**:

```bash
# 模块覆盖率统计
node scripts/generate-module-dependency-graph.js --coverage

# 英文版比例统计
node scripts/i18n-coverage.js
```

### 维度 4：结构性（Structure）

- [ ] 没有重复内容（单一事实来源原则）
- [ ] 交叉引用链接有效
- [ ] 模块编号无冲突
- [ ] 决策树数量与分类文档一致

**自动化工具**:

```bash
# 链接有效性检查
markdown-link-check docs/**/*.md

# 重复内容检测
node scripts/detect-duplicates.js --threshold=0.8
```

### 维度 5：可维护性（Maintainability）

- [ ] 依赖包无高危安全漏洞
- [ ] 测试覆盖率趋势未下降
- [ ] 构建/部署流程正常
- [ ] 贡献者文档（CONTRIBUTING.md）与流程一致

**自动化工具**:

```bash
# 安全审计
npm audit --audit-level=high

# 测试覆盖率
cd jsts-code-lab && pnpm vitest --coverage

# 构建验证
cd website && pnpm build
```

---

## 二、审计流程

```
季度末最后一周:
    ├── 周一: 运行自动化检查脚本
    │         └── 输出: AUDIT_AUTO_REPORT.md
    ├── 周二-周三: 人工复核自动化报告中的异常项
    │         └── 输出: AUDIT_REVIEW_NOTES.md
    ├── 周四: 修复确认的问题
    │         └── 输出: AUDIT_FIX_LOG.md
    └── 周五: 发布季度审计报告
              └── 输出: AUDIT_REPORT_YYYY-QX.md
```

---

## 三、季度审计报告模板

```markdown
# 季度审计报告 2026-Q2

## 执行摘要
- 审计日期: 2026-06-30
- 审计范围: 全库 37,000+ 文件
- 发现问题: X 个
- 已修复: Y 个
- 遗留问题: Z 个

## 五维度评分

| 维度 | 得分 | 权重 | 加权分 |
|------|------|------|--------|
| 技术准确性 | 95/100 | 30% | 28.5 |
| 时效性 | 90/100 | 25% | 22.5 |
| 覆盖度 | 85/100 | 20% | 17.0 |
| 结构性 | 92/100 | 15% | 13.8 |
| 可维护性 | 88/100 | 10% | 8.8 |
| **总分** | | | **90.6/100** |

## 主要发现

### ✅ 优秀项
- ...

### ⚠️ 需改进项
- ...

### ❌ 严重问题
- ...

## 下季度行动计划

1. ...
2. ...
3. ...
```

---

## 四、自动化脚本清单

| 脚本 | 功能 | 运行频率 |
|------|------|---------|
| `scripts/trend-monitor.js` | 生态趋势监测 | 每周 |
| `scripts/update-stars.js` | GitHub Stars 刷新 | 每月 |
| `scripts/update-matrix-data.js` | 对比矩阵数据更新 | 每月 |
| `scripts/add-content-metadata.js` | frontmatter 补全 | 每季度 |
| `scripts/validate-versions.js` | 版本号过期检查 | 每季度 |
| `scripts/detect-duplicates.js` | 重复内容检测 | 每季度 |
| `scripts/security-check.js` | 安全漏洞扫描 | 每周 |
| `scripts/validate-links.js` | 链接有效性检查 | 每月 |

---

*本清单由 `docs/QUARTERLY_AUDIT_CHECKLIST.md` 维护*
*最后更新: 2026-04-27*
*review-cycle: 3 months*
*next-review: 2026-07-27*
*status: current*

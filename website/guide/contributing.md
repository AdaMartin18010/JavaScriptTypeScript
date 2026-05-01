---
title: 贡献指南
description: 'Awesome JS/TS Ecosystem 贡献指南，了解如何参与内容建设、提交 PR 与维护规范'
---

# 贡献指南

> 感谢你对 Awesome JS/TS Ecosystem 的兴趣！本指南帮助你高效参与内容建设，确保每一次贡献都能为社区带来长期价值。

---

## 贡献类型详解

### 内容更新（数据刷新、版本更新）

JS/TS 生态迭代极快，数据时效性至关重要。我们欢迎以下内容更新贡献：

| 更新类型 | 说明 | 示例 |
|---------|------|------|
| **版本号刷新** | 工具发布新版本时更新版本号和发布日期 | React 从 v19.0 更新至 v19.1 |
| **Stars / 下载量更新** | 季度或月度批量刷新生态数据 | npm 周下载量从 500万 → 800万 |
| **趋势数据更新** | 更新 State of JS/TS 等调研数据引用 | 2025 调研数据替换为 2026 最新版 |
| **弃用标记** | 标记不再维护的工具，推荐替代方案 | `⚠️ 该项目已于 2026-03 归档` |

> 💡 **建议**：数据更新类 PR 请在描述中注明数据来源和采集时间，便于审核者快速验证。

### 新工具/库收录（收录标准、审核流程）

在提议收录新工具前，请先确认它满足以下**最低收录标准**：

1. **活跃度**：GitHub 仓库近 6 个月内有代码提交，或近 3 个月内有版本发布
2. **社区认可度**：GitHub Stars ≥ 500，或 npm 周下载量 ≥ 10,000（特殊情况如新兴领域标杆工具可放宽）
3. **文档完整度**：具备 README 英文文档，核心 API 有使用说明
4. **许可证合规**：采用 OSI 认可的开源许可证（MIT、Apache-2.0、BSD 等）
5. **无恶意行为**：不包含已知的安全漏洞、挖矿脚本或隐私窃取代码

**审核流程**：

```
提交收录申请 → 维护者初审（1-3 天）→ 社区讨论（如有争议）→ 合并或反馈修改意见
```

> 📌 收录前请在对应分类页面搜索，确认该工具尚未被收录。

### 错误修复（死链、错别字、代码错误）

| 错误类型 | 修复优先级 | 修复要点 |
|---------|-----------|---------|
| **死链（Dead Link）** | 🔴 P0 | 替换为官方新地址或存档链接；若项目已消失，添加弃用说明 |
| **错别字 / 语法错误** | 🟡 P1 | 中文表达、英文术语大小写、标点符号统一 |
| **代码错误** | 🔴 P0 | 确保代码块可复制后**直接运行**通过，包含必要的依赖安装命令 |
| **数据错误** | 🟡 P1 | 版本号、Stars 数量、性能数值等需提供修正依据 |

### 翻译贡献（多语言支持计划）

当前站点以中文为主，技术术语保留英文原名。多语言支持计划分为两个阶段：

- **第一阶段（进行中）**：核心分类页面和对比矩阵保持中文，关键术语提供英文原文
- **第二阶段（规划中）**：逐步建立英文版本（`website/en/`），欢迎有志者参与翻译

翻译贡献规范：
- 技术术语不翻译（如 Tree Shaking、Hydration、HMR）
- 首次出现术语时附英文原文，如"服务端渲染（SSR, Server-Side Rendering）"
- 保持 VitePress Frontmatter 中的 `title` 和 `description` 语义一致

### 深度指南撰写（指南质量标准）

深度指南（`website/guide/`）的撰写要求高于普通分类页：

- **问题驱动**：从真实开发场景出发，回答"为什么选 A 而不是 B"
- **覆盖维度**：至少包含核心 API 介绍、代码示例、选型建议、社区趋势
- **对比深度**：对竞争工具进行横向对比，标注各方案的取舍（trade-offs）
- **可验证性**：所有性能 claims 需注明测试环境和可复现步骤

---

## 开发环境搭建

### 前置要求

- **Node.js**：22 LTS（长期支持版）
- **包管理器**：pnpm 9.x+
- **Git**：2.40+

### Node.js 22 LTS 安装

推荐使用 [nvm](https://github.com/nvm-sh/nvm)（Linux/macOS）或 [nvm-windows](https://github.com/coreybutler/nvm-windows) 管理 Node 版本：

```bash
# 安装 Node.js 22 LTS
nvm install 22
nvm use 22

# 验证版本
node -v  # v22.x.x
```

Windows 用户也可直接从 [Node.js 官网](https://nodejs.org/) 下载 LTS 安装包。

### pnpm 安装与配置

```bash
# 通过 corepack 启用（推荐，Node.js 16.13+ 内置）
corepack enable
corepack prepare pnpm@latest --activate

# 或通过 npm 安装
npm install -g pnpm

# 验证
pnpm -v
```

本项目使用 pnpm 作为统一包管理器，请勿混用 npm/yarn，以免 lock 文件冲突。

### VitePress 本地开发服务器

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/你的用户名/JavaScriptTypeScript.git
cd JavaScriptTypeScript

# 2.安装依赖
cd website
pnpm install

# 3.启动本地开发服务器
pnpm docs:dev
# 或：npx vitepress dev

# 4.构建（用于验证）
pnpm docs:build
# 或：npx vitepress build
```

开发服务器默认运行在 `http://localhost:5173`。修改 Markdown 文件后会自动热更新。

> 🔧 本项目 `website/package.json` 中已预置脚本：`pnpm docs:dev` / `pnpm docs:build`。

### Oxlint 代码检查

本项目使用 [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) 对 `.js`、`.ts`、`.vue` 等文件进行快速静态检查：

```bash
# 安装（如未安装）
pnpm add -D oxlint

# 运行检查
npx oxlint .

# 自动修复可修复的问题
npx oxlint . --fix
```

提交前请确保 Oxlint 无错误（warning 可酌情处理，error 必须修复）。

### Git 工作流

```bash
# 1. 同步上游仓库最新代码
git remote add upstream https://github.com/原作者/JavaScriptTypeScript.git
git fetch upstream
git checkout main
git merge upstream/main

# 2. 创建功能分支
git checkout -b update/分类名-简述
# 示例：git checkout -b update/bundler-vite-v6

# 3. 提交更改（遵循 Commit Message 格式，见下文）
git add .
git commit -m "docs(bundler): 更新 Vite v6 特性说明与性能数据"

# 4. 推送到你的 Fork
git push origin update/分类名-简述

# 5. 在 GitHub 上发起 Pull Request
```

---

## 内容质量标准

### 数据标注规范

所有量化数据必须标注来源和采集时间，确保可追溯：

```markdown
> 📊 **数据来源**: GitHub Stars (2026-05), npm 周下载量 (2026-04)
> ⚡ **性能基准**: 本地测试, MacBook Pro M3, Node.js 22 LTS
```

| 数据类型 | 推荐来源 | 标注格式 |
|---------|---------|---------|
| GitHub Stars | GitHub API / 仓库主页 | `GitHub Stars (YYYY-MM)` |
| npm 下载量 | npm 官网 / npmtrends.com | `npm 周下载量 (YYYY-MM)` |
| Bundle 体积 | Bundlephobia / 本地 rollup-plugin-analyzer | `gzip 后体积, 来源` |
| 性能基准 | 本地 benchmark / 官方 benchmark | `测试环境, 工具版本` |
| 市场份额 | State of JS/TS / JetBrains 调研 | `调研名称 + 年份` |

### 技术深度要求

每篇内容至少覆盖以下维度：

1. **核心 API / 核心概念**：用简洁语言解释该工具解决什么问题
2. **代码示例**：提供一个最小可运行的代码片段，标注语言类型
3. **选型建议**：在对比矩阵或选型表格中给出明确场景化推荐
4. **版本与兼容性**：标注最低支持的 Node.js / 浏览器版本
5. **社区与生态**：维护活跃度、周边插件 / 集成生态

### 图片与图表规范

- **Mermaid 图表**：优先使用 Mermaid 语法内嵌图表，确保版本控制友好
  ```markdown
  ```mermaid
  flowchart TD
    A[源码] -->|转译| B[AST]
    B -->|转换| C[目标代码]
  ```
  ```
- **截图尺寸**：宽度建议 1200px 以内，单张体积不超过 500KB
- **文件路径**：截图统一存放于 `website/public/images/分类名/`，引用方式 `![描述](/images/分类名/文件名.png)`
- **可访问性**：所有图片必须添加 `alt` 文本说明

---

## PR 提交规范

### Commit Message 格式

本项目采用基于 [Conventional Commits](https://www.conventionalcommits.org/) 的简化格式：

```
<类型>(<可选范围>): <描述>

[可选正文]

[可选脚注]
```

**常用类型**：

| 类型 | 用途 |
|------|------|
| `docs` | 文档内容更新、新增、修正 |
| `fix` | 死链修复、错别字、数据错误 |
| `feat` | 新工具收录、新增分类页面 |
| `chore` | 依赖更新、脚本调整、CI 配置 |
| `refactor` | 大规模结构调整、内容重组 |

**示例**：

```bash
docs(bundler): 更新 Vite v6 新特性与性能对比数据

- 新增 Vite 6 环境 API 变更说明
- 更新构建速度基准测试数据（Node.js 22）
- 修正 Rspack 版本号（v1.2 → v1.3）

Fixes #123
```

### PR 模板填写

发起 Pull Request 时，请按以下模板填写：

```markdown
## 变更类型
- [ ] 数据更新
- [ ] 新工具收录
- [ ] 错误修复
- [ ] 深度指南
- [ ] 其他

## 变更内容
<!-- 简述本次修改的内容和原因 -->

## 数据来源
<!-- 如涉及数据更新，注明来源和验证方式 -->

## 本地验证
- [ ] `pnpm docs:build` 构建通过
- [ ] 无新增 dead links
- [ ] 代码块可运行

## 关联 Issue
Fixes #Issue编号（如有）
```

### Review 流程

```
提交 PR → CI 自动检查（build + dead links + lint）→ 维护者初审 → 
反馈修改（如需）→ 二次确认 → 合并 → 关闭 PR
```

- **初审周期**：通常在 3 个工作日内响应
- **修改请求**：请在 PR 分支上继续提交 commit，不要重新发起 PR
- **合并条件**：CI 全部通过 + 至少 1 名维护者 approve

---

## 自动化检查

### VitePress Build 验证

每次提交 PR 前，请本地执行构建确保无报错：

```bash
cd website
pnpm docs:build
```

常见构建失败原因：
- Markdown 语法错误（未闭合的代码块、表格格式错误）
- Vue / VitePress 组件引用路径错误
- Mermaid 语法不合法

### Dead Links 检查

项目配置了 VitePress `markdown-it` dead links 检测。构建日志中会输出类似：

```
[WARNING] Dead link "/guide/nonexistent" in file guide/xxx.md
```

**本地快速检查**：

```bash
# 构建后检查日志中的 WARNING
cd website
pnpm docs:build 2>&1 | grep -i "dead link\|warning"
```

修复方式：
- 内部链接：确认文件路径正确，使用相对路径或绝对路径 `/guide/xxx`
- 外部链接：若链接已失效，尝试使用 [Wayback Machine](https://web.archive.org/) 存档链接替换

### Frontmatter 校验

每个 Markdown 文件必须以如下 Frontmatter 开头：

```markdown
---
title: 页面标题
description: '页面描述，用于 SEO 和社交媒体分享'
---
```

校验清单：
- [ ] `title` 存在且不为空
- [ ] `description` 存在且长度在 50-200 字符之间
- [ ] 无重复的 Frontmatter 键

---

## 奖励与认可

### Contributors 页面

所有被合并 PR 的贡献者将自动出现在 GitHub  contributors 页面（基于 GitHub API 生成）。我们按季度更新贡献者列表，感谢每一位参与者。

### 贡献等级徽章

| 等级 | 条件 | 徽章 |
|------|------|------|
| 🥇 **核心维护者** | 合并 PR ≥ 20，或长期参与内容规划 | Core Maintainer |
| 🥈 **活跃贡献者** | 合并 PR ≥ 5，或贡献深度指南 ≥ 2 篇 | Active Contributor |
| 🥉 **初行者** | 首次合并 PR | First-Time Contributor |

> 🏆 年度特别贡献者将在项目 README 和年度回顾中特别致谢。

---

## 行为准则 (Code of Conduct)

### 我们的承诺

本项目致力于营造一个开放、友好、包容的参与环境。我们承诺：尊重每一位贡献者，无论其经验水平、性别认同、种族或技术背景。

### 我们的标准

**积极行为包括但不限于**：
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事
- 对其他社区成员表达同理心

**不可接受行为包括**：
- 使用带有性暗示的言语或图像
- 恶意挑衅、侮辱/贬低性评论、人身攻击
- 公开或私下骚扰他人
- 未经明确许可发布他人私人信息
- 其他在专业环境中被合理认定为不恰当的行为

### 执行

如有违反行为准则的情况，维护团队有权：
1. 要求行为人更正或道歉
2. 临时或永久禁止其参与项目讨论和贡献

如需举报，请发送邮件至项目维护团队，或在私密 Issue 中说明情况。

---

## 安全漏洞报告流程

如果你发现本站内容或相关工具链中存在**安全漏洞**（如供应链攻击、恶意依赖、敏感信息泄露），请遵循以下流程：

1. **请勿通过公开 Issue 报告**。安全相关的公开披露可能对社区造成伤害。
2. **发送私密报告**：通过 GitHub Security Advisories 提交，或发送邮件给维护团队。
3. **提供详细信息**：
   - 漏洞类型和严重程度评估
   - 复现步骤或受影响范围
   - 建议的修复方案（如有）
4. **响应时间**：维护团队将在 5 个工作日内确认收到报告，并在修复后协调披露时间。

---

## 常见问题 (FAQ)

**Q: 我不是资深开发者，可以贡献吗？**

A: 当然可以！修正一个错别字、更新一个版本号、修复一条死链，都是宝贵的贡献。我们鼓励"从小处开始"。

**Q: 我发现了数据过时，但没有时间写完整 PR，怎么办？**

A: 请直接提交一个 Issue，标题格式 `[数据更新] 分类名 - 工具名`，说明过时内容和建议更新值。维护者或社区其他成员会跟进。

**Q: 本地构建报错 `Cannot find module 'vitepress'`，怎么办？**

A: 请确认你在 `website/` 目录下执行了 `pnpm install`。如果仍报错，尝试删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装：

```bash
cd website
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Q: 我的 PR 被标记为 "needs discussion"，是什么意思？**

A: 说明该修改涉及内容方向、收录标准或技术观点的争议，需要社区讨论后再决定。请保持耐心，在 PR 评论中补充你的观点和数据依据。

**Q: 可以推荐自己的开源项目吗？**

A: 可以，但请确保项目满足[收录标准](#新工具-库收录-收录标准-审核流程)。为避免利益冲突，请在 PR 描述中明确声明这是你的项目或你参与维护的项目。

**Q: 图片应该放在哪里？可以使用外部图床吗？**

A: 图片请放在 `website/public/images/` 目录下，不要引用外部图床链接。外部图链容易失效，导致 dead links。

---

## 内容模板

### 分类页模板

```markdown
---
title: 分类名称
description: '简短描述'
---

# 分类名称

> 一句话概述

---

## 核心工具

| 工具 | Stars | 版本 | 说明 |
|------|-------|------|------|
| **Tool** | 10k+ | v1.0 | 描述 |

## 详细分析

### Tool Name

```bash
npm install tool
```

- **优势**: ...
- **劣势**: ...
- **适用**: ...

## 选型建议

| 场景 | 推荐 |
|------|------|
| 场景 A | Tool A |

## 参考资源

- [官方文档](https://example.com) 📚
```

### 对比矩阵模板

```markdown
---
title: XX 对比矩阵
description: '描述'
---

# XX 对比矩阵

> 最后更新: 2026-05-01

## 核心对比

| 维度 | A | B | C |
|------|---|---|---|
| **特性** | ✅ | ❌ | ⚠️ |

## 选型建议

## 参考资源
```

---

## 审核清单

提交前请检查：

- [ ] 数据标注来源和时间
- [ ] 代码块可运行
- [ ] 表格格式正确
- [ ] 无死链
- [ ] VitePress 构建通过
- [ ] 中文为主，术语保留英文
- [ ] 新增工具满足最低收录标准
- [ ] Commit message 符合规范

---

## 维护团队

| 角色 | 职责 |
|------|------|
| **内容审核** | 数据准确性、格式规范 |
| **技术评审** | 技术深度、代码质量 |
| **趋势跟踪** | 季度数据更新、新工具发现 |

---

## 许可证

本站点内容基于 MIT 许可发布。

---

*最后更新: 2026-05-01*

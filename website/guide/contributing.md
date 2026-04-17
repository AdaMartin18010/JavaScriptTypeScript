# 贡献指南

感谢您对 **Awesome JS/TS Ecosystem** 项目的关注！本文档将指导您如何参与贡献。

## 收录标准

### 基本要求

提交的资源需满足以下条件：

| 标准 | 最低要求 | 说明 |
|------|----------|------|
| ⭐ GitHub Stars | 1,000+ | 特殊优秀项目可例外 |
| 🔄 维护状态 | 6个月内更新 | 需有活跃的维护 |
| 📘 TypeScript | 类型定义 | 原生支持或高质量 @types |
| ✅ 生产就绪 | 有实际案例 | 知名公司或项目使用 |

### 优先收录

以下类型的项目将被优先收录：

- 🏆 获得过 JS 生态奖项或提名
- 📈 近期趋势快速上升
- 🌟 被知名项目或公司采用
- 💡 解决特定痛点或提供创新方案

## 如何贡献

### 方式一：提交 Issue（推荐新手）

发现优质资源但不确定如何添加？提交 Issue：

```markdown
**项目名称**: 库的名称
**GitHub**: https://github.com/xxx/xxx
**分类**: 前端框架 / UI组件库 / ...
**推荐理由**: 为什么这个库值得收录
```

### 方式二：提交 Pull Request

#### 步骤 1: Fork 仓库

点击 GitHub 页面的 "Fork" 按钮，创建您的副本。

#### 步骤 2: 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/awesome-jsts-ecosystem.git
cd awesome-jsts-ecosystem
```

#### 步骤 3: 创建分支

```bash
git checkout -b add-library-name
```

#### 步骤 4: 编辑文件

找到对应分类的 Markdown 文件，例如：

- `website/categories/01-frontend-frameworks.md`
- `website/categories/05-state-management.md`

#### 步骤 5: 内容格式

请按照以下模板添加库信息：

```markdown
### 库名称

| 属性 | 详情 |
|------|------|
| **名称** | 库名称 |
| **Stars** | ⭐ 数量 |
| **TS支持** | ✅ 原生支持 / 🟡 社区定义 / ⚠️ 弱支持 |
| **GitHub** | [user/repo](https://github.com/xxx/xxx) |
| **官网** | [site.com](https://site.com) |
| **许可证** | MIT / Apache-2.0 / etc |

**一句话描述**：用一句话概括库的核心功能。

**核心特点**：
- 特点 1：描述
- 特点 2：描述
- 特点 3：描述

**适用场景**：
- 场景 1
- 场景 2

---
```

#### 步骤 6: 提交更改

```bash
git add .
git commit -m "Add: 库名称 to 分类名称"
git push origin add-library-name
```

#### 步骤 7: 创建 Pull Request

在 GitHub 上创建 PR，填写以下信息：

```markdown
## 添加内容
- 库名称：xxx
- 所属分类：xxx

## 检查清单
- [ ] 符合收录标准
- [ ] 信息准确无误
- [ ] 格式符合规范
- [ ] 链接可正常访问
```

## 内容规范

### 语言风格

- ✅ 使用客观、中立的描述
- ✅ 技术术语准确
- ✅ 适当使用 Emoji 增加可读性
- ❌ 避免过度营销性语言
- ❌ 避免主观偏见

### 格式要求

#### 标题层级

```markdown
# 分类标题（H1）

## 库名称（H2）

### 子模块（H3）
```

#### 表格格式

```markdown
| 属性 | 详情 |
|------|------|
| **名称** | 值 |
| **Stars** | ⭐ 10,000+ |
```

#### 代码块

使用适当的语言标识：

```bash
# shell 命令
```

```typescript
// TypeScript 代码
```

```javascript
// JavaScript 代码
```

### 图片规范

- 使用相对路径引用图片
- 图片放置在 `website/public/images/` 目录
- 推荐格式：SVG > WebP > PNG
- 单个图片大小不超过 200KB

## 更新现有内容

### 版本更新

当库发布重大版本时：

```markdown
## 库名称

### v2.0 更新

| 属性 | 详情 |
|------|------|
| **版本** | v2.0.0 |
| **发布日期** | 2024-01-01 |

**主要变化**：
- 变化 1
- 变化 2
```

### 数据更新

定期更新 Stars 数量、维护状态等信息。

## 本地预览

### 安装依赖

```bash
cd website
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

运行 `npm run docs:dev` 启动本地预览服务器预览更改。

### 构建检查

```bash
npm run docs:build
```

确保构建无错误后再提交 PR。

## 行为准则

### 我们的承诺

- 尊重每一位贡献者
- 接受建设性的批评
- 关注社区利益
- 展现同理心

### 不可接受的行为

- 使用歧视性语言
- 人身攻击或侮辱
- 公开或私下骚扰
- 未经授权发布他人信息

## 审核流程

```
提交 PR
    ↓
自动检查（CI）
    ↓
维护者初审（1-3天）
    ↓
反馈修改（如需要）
    ↓
最终审核
    ↓
合并发布 🎉
```

## 常见问题

**Q: 我的项目 Stars 不足 1000，可以收录吗？**

A: 特殊优秀项目可以申请例外，请在 PR 中说明推荐理由。

**Q: 商业软件可以收录吗？**

A: 可以，但需明确标注许可证类型和限制。

**Q: 多久更新一次 Stars 数据？**

A: 计划每季度批量更新一次，您也可以随时提交更新。

**Q: 可以添加中文文档链接吗？**

A: 优先使用官方英文文档，如有优质中文文档可在备注中添加。

## 联系我们

- 💬 讨论区：[GitHub Discussions](https://github.com/yourusername/awesome-jsts-ecosystem/discussions)
- 🐛 Issue：[提交问题](https://github.com/yourusername/awesome-jsts-ecosystem/issues)
- 📧 邮件：<contact@example.com>

---

再次感谢您的贡献！🎉

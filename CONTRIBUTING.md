# 贡献指南

感谢您对 awesome-jsts-ecosystem 项目的关注！我们欢迎各种形式的贡献，包括：

- 添加新的 JavaScript/TypeScript 资源
- 更新现有资源信息
- 修复错误或过时的链接
- 改进文档

---

## 📋 提交 Pull Request 流程

### 1. Fork 仓库

点击右上角的 "Fork" 按钮创建您的仓库副本。

### 2. 克隆到本地

```bash
git clone https://github.com/YOUR_USERNAME/awesome-jsts-ecosystem.git
cd awesome-jsts-ecosystem
```

### 3. 创建分支

```bash
git checkout -b add-resource-name
```

分支名建议格式：
- `add-<resource-name>` - 添加新资源
- `update-<resource-name>` - 更新资源信息
- `fix-<description>` - 修复问题

### 4. 进行修改

根据下方格式规范编辑 `README.md` 文件。

### 5. 提交更改

```bash
git add README.md
git commit -m "Add: <资源名称> - <简短描述>"
git push origin add-resource-name
```

提交信息规范：
- `Add: <名称>` - 添加新资源
- `Update: <名称>` - 更新资源信息
- `Fix: <问题描述>` - 修复问题
- `Remove: <名称>` - 移除过时资源

### 6. 创建 Pull Request

在 GitHub 上创建 Pull Request，并填写以下信息：
- 资源名称和 GitHub 链接
- 简要说明为什么应该收录
- 确认符合收录标准

---

## ✅ 收录标准

提交的资源必须满足以下条件：

### 基本要求

| 条件 | 说明 | 例外情况 |
|------|------|----------|
| ⭐ Stars | GitHub Stars ≥ 1000 | 由核心团队维护的官方工具、新兴且有潜力的项目 |
| 🔄 维护状态 | 最近 6 个月内有更新 | 功能完整且稳定的成熟项目 |
| 📘 TypeScript | 原生支持 TS 或提供完整类型定义 | - |
| ✅ 稳定性 | 有实际生产环境使用案例 | - |
| 📝 文档 | 有完整的英文文档 | - |

### 不收录的内容

- ❌ 个人学习项目或实验性项目
- ❌ 长期无人维护的项目（超过 1 年无更新）
- ❌ 与 JavaScript/TypeScript 生态无关的项目
- ❌ 有严重安全漏洞且未修复的项目
- ❌ 克隆/复制现有流行项目的项目

---

## 📝 格式规范

### 表格格式

每个资源使用以下表格格式：

```markdown
| [项目名称](https://github.com/owner/repo) | 简短描述（不超过 15 个字） | ![Stars](https://img.shields.io/github/stars/owner/repo?style=flat-square) |
```

### 描述规范

- 使用中文描述
- 简洁明了，不超过 15 个汉字
- 突出核心功能或特点
- 避免使用"最好的"、"最强大的"等主观词汇

**示例：**

| ✅ 好的描述 | ❌ 不好的描述 |
|------------|--------------|
| 快速、无约束的 Web 框架 | 最好的 Node.js 框架 |
| 由 Vite 驱动的测试框架 | 超级好用的测试工具 |
| TypeScript 优先的 ORM | 最流行的数据库工具 |

### 分类规则

1. **找到最合适的分类**：如果资源属于多个分类，选择最核心的一项
2. **按 Stars 排序**：同一分类内按 Stars 数量降序排列
3. **添加新分类**：如需新分类，请在 PR 中说明理由

### 当前分类

- 📦 框架与运行时
  - Web 框架
  - 全栈框架
  - 运行时
- 🔧 开发工具
  - 构建工具
  - 代码质量
  - 测试框架
- 📊 数据与存储
  - ORM 与数据库工具
  - 缓存与消息队列
- 🔐 安全与认证
- 🚀 部署与运维
- 🧩 实用库

---

## 🔍 审核流程

提交 PR 后，维护者将会：

1. **自动检查**：CI 会验证链接有效性和格式
2. **人工审核**：维护者审核资源是否符合收录标准
3. **反馈修改**：如有问题，会请求修改
4. **合并发布**：通过后合并到主分支

审核通常在 3-7 个工作日内完成。

---

## ❓ 常见问题

### Q: 我的项目 Stars 不足 1000，可以提交吗？

如果您的项目由知名组织维护（如 Google、Microsoft、Vercel 等），或是某个流行工具的核心组件，可以提交并说明情况。

### Q: 可以提交商业软件吗？

可以，但必须开源且有 GitHub 仓库。纯商业闭源软件不在收录范围。

### Q: 发现链接失效了怎么办？

欢迎提交 PR 修复，或创建 Issue 报告。

### Q: 可以修改现有资源的描述吗？

可以，如果描述不准确或项目有重大更新，欢迎提交改进。

---

## 📧 联系方式

如有疑问，欢迎通过以下方式联系：

- 创建 [GitHub Issue](https://github.com/AdaMartin18010/JavaScriptTypeScript/issues)
- 发送邮件至：your-email@example.com

---

再次感谢您的贡献！🙏

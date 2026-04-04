# 🤝 贡献指南 / Contributing Guide

感谢您对 **Awesome JS/TS Ecosystem** 项目的关注！我们欢迎各种形式的贡献。

Thank you for your interest in the **Awesome JS/TS Ecosystem** project! We welcome all forms of contributions.

---

## 📋 目录 / Table of Contents

- [贡献流程 / Contribution Workflow](#贡献流程--contribution-workflow)
- [内容标准 / Content Standards](#内容标准--content-standards)
- [格式规范 / Format Guidelines](#格式规范--format-guidelines)
- [提交规范 / Commit Guidelines](#提交规范--commit-guidelines)
- [审核流程 / Review Process](#审核流程--review-process)

---

## 贡献流程 / Contribution Workflow

### 1. Fork & Clone

```bash
# Fork 本仓库到你的账号 / Fork this repo to your account
# 然后克隆你的 Fork / Then clone your fork
git clone https://github.com/YOUR_USERNAME/awesome-jsts-ecosystem.git
cd awesome-jsts-ecosystem
```

### 2. 创建分支 / Create Branch

```bash
git checkout -b feature/add-awesome-library
```

### 3. 进行修改 / Make Changes

按照下方的格式规范进行修改。/ Follow the format guidelines below.

### 4. 提交 PR / Submit PR

```bash
git add .
git commit -m "feat: add [library-name] to [category]"
git push origin feature/add-awesome-library
```

然后在 GitHub 上创建 Pull Request。/ Then create a Pull Request on GitHub.

---

## 内容标准 / Content Standards

### ✅ 收录标准 / Inclusion Criteria

1. **实用性 / Utility**: 解决实际问题的库 / Library that solves real problems
2. **活跃度 / Activity**: 最近 6 个月内有更新 / Updated within the last 6 months
3. **质量 / Quality**: 有良好的文档和测试 / Good documentation and tests
4. **受欢迎度 / Popularity**: GitHub Stars ≥ 100（特殊情况可放宽）/ GitHub Stars ≥ 100 (exceptions allowed)
5. **维护状态 / Maintenance**: 有活跃的维护者 / Active maintainers
6. **许可证 / License**: 有明确的 OSI 批准的开源许可证 / Clear OSI-approved open source license

### ❌ 不收录的内容 / Excluded Content

- 个人练习项目 / Personal practice projects
- 长期未维护的库 / Long-term unmaintained libraries
- 有严重安全漏洞的库 / Libraries with serious security vulnerabilities
- 商业闭源软件 / Commercial closed-source software
- 内容农场或低质量博客 / Content farms or low-quality blogs

---

## 格式规范 / Format Guidelines

### 列表项格式 / List Item Format

```markdown
- [库名/LibraryName](https://github.com/user/repo) - 简短描述（限制在 80 字符内）/ Short description (limit 80 chars). [:star: 1000]
```

### 示例 / Example

```markdown
- [Express](https://github.com/expressjs/express) - 快速、开放、极简的 Node.js Web 框架。/ Fast, unopinionated, minimalist web framework for Node.js. [:star: 65k]
```

### 分类顺序 / Category Order

1. 🔥 热门推荐 / Hot Picks
2. ⚡ 运行时与引擎 / Runtimes & Engines
3. 🛠️ 构建工具 / Build Tools
4. 📦 包管理器 / Package Managers
5. 🔧 开发工具 / Developer Tools
6. 🧪 测试框架 / Testing Frameworks
7. 🌐 Web 框架 / Web Frameworks
8. 📊 数据库与 ORM / Databases & ORMs
9. 🔐 认证与安全 / Authentication & Security
10. 🎨 UI 组件库 / UI Component Libraries
11. 📱 移动端开发 / Mobile Development
12. 💻 桌面端开发 / Desktop Development
13. ☁️ 云与部署 / Cloud & Deployment
14. 📚 学习资源 / Learning Resources

### 中英文格式 / Bilingual Format

每个分类先写中文内容，然后是英文内容。/ Each category should have Chinese content first, then English.

---

## 提交规范 / Commit Guidelines

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>
```

### 类型 / Types

- `feat`: 新增库 / Add new library
- `fix`: 修复错误 / Fix error
- `docs`: 文档更新 / Documentation changes
- `style`: 格式调整（不影响内容）/ Formatting changes (no content change)
- `refactor`: 重构 / Refactoring
- `chore`: 构建过程或辅助工具的变动 / Build process or auxiliary tool changes

### 示例 / Examples

```bash
feat: add NestJS to Web Frameworks
feat: 在 Web 框架分类中添加 NestJS

fix: update broken link for Express
fix: 更新 Express 的失效链接

docs: add contribution guide translation
docs: 添加贡献指南翻译
```

---

## 审核流程 / Review Process

1. **自动检查 / Auto-check**: CI 会检查链接有效性和格式 / CI checks link validity and format
2. **人工审核 / Manual Review**: 维护者会审核内容质量 / Maintainers review content quality
3. **反馈修改 / Feedback**: 如有问题会提出修改建议 / Feedback and modification suggestions if needed
4. **合并 / Merge**: 通过后合并到主分支 / Merge to main branch after approval

---

## 🏆 贡献者荣誉 / Contributors Hall of Fame

所有贡献者将在 README 中被列出。/ All contributors will be listed in the README.

---

## ❓ 有疑问？/ Questions?

- 创建 Issue 提问 / Create an Issue for questions
- 加入讨论 / Join discussions

感谢您的贡献！/ Thank you for contributing!

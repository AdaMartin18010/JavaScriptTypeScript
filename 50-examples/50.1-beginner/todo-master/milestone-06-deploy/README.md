# 里程碑 6：构建与部署

> 🎯 **学习目标**：配置 Vite 生产构建，部署到 Vercel，并设置 GitHub Actions CI/CD 自动化流水线。

---

## 学习目标

完成本里程碑后，你将能够：

1. 配置 Vite 生产构建（代码分割、压缩、Tree Shaking）
2. 使用环境变量管理不同环境的配置
3. 配置 Vercel 部署（`vercel.json`）
4. 编写 GitHub Actions 工作流：安装 → 测试 → 构建 → 部署
5. 理解现代前端工程化的完整流程

---

## 前置知识

- 里程碑 5 的全部内容（测试、React、状态管理）
- Git 基础操作
- 拥有 GitHub 账号和 Vercel 账号（免费）

---

## 关键概念解释

### 1. CI/CD

- **CI（持续集成）**：每次提交代码自动运行测试，确保不引入回归错误
- **CD（持续部署）**：测试通过后自动部署到生产环境

### 2. Vercel

Vercel 是面向前端开发者的部署平台，特点：

- 零配置部署（识别 Vite、Next.js 等框架）
- 自动 HTTPS、CDN 加速
- 每次 Push 自动生成预览链接

### 3. GitHub Actions

GitHub 提供的 CI/CD 服务，用 YAML 定义工作流：

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build
```

---

## 文件结构

```
milestone-06-deploy/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json              # 新增：Vercel 部署配置
├── index.html
├── .env.example             # 新增：环境变量示例
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── reducer.ts
    ├── context.tsx
    ├── components/
    │   ├── TodoForm.tsx
    │   ├── TodoList.tsx
    │   ├── TodoItem.tsx
    │   └── FilterBar.tsx
    ├── __tests__/
    │   ├── setup.ts
    │   ├── todoReducer.test.ts
    │   ├── TodoList.test.tsx
    │   └── TodoItem.test.tsx
    └── style.css
└── .github/
    └── workflows/
        └── deploy.yml       # 新增：GitHub Actions CI/CD
```

---

## 运行方式

```bash
cd milestone-06-deploy
npm install
npm run dev        # 开发模式
npm test           # 运行测试
npm run build      # 生产构建（输出到 dist/）
npm run preview    # 预览生产构建
```

---

## 部署指南

### 方式 1：Vercel CLI（推荐用于学习）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方式 2：GitHub 集成（推荐用于生产）

1. 将代码推送到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 导入项目
3. Vercel 自动识别 Vite 配置，一键部署
4. 后续每次 `git push` 自动触发部署

### 方式 3：GitHub Actions 自动部署

本里程碑已配置 `.github/workflows/deploy.yml`：

- Push 到 `main` 分支 → 自动运行测试 → 构建 → 部署到 Vercel
- 需要在 GitHub Secrets 中设置 `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`

---

## 常见错误排查

### ❌ 错误：部署后页面空白，控制台报路径错误

**原因**：Vite 构建的资源路径使用了绝对路径。

**解决**：在 `vite.config.ts` 中设置 `base: './'`：

```ts
export default defineConfig({
  base: './',
  plugins: [react()],
});
```

### ❌ 错误：`VERCEL_TOKEN` 未设置导致 Actions 失败

**原因**：GitHub Actions 没有 Vercel 的访问令牌。

**解决**：

1. 在 Vercel 设置中生成 Token
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加

### ❌ 错误：构建产物体积过大

**解决**：检查依赖，移除未使用的包；Vite 会自动 Tree Shake。

```bash
npm run build
# 查看 dist/assets 目录下的文件大小
```

---

## 🎉 恭喜完成全部里程碑！

你已经从原生 JavaScript 一路走到了生产部署，掌握了现代前端开发的核心技能。

建议下一步：
- 尝试添加新功能（编辑 Todo、拖拽排序）
- 学习 React Router 实现多页面
- 接入后端 API 替代 localStorage

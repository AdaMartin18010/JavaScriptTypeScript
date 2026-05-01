# 对比表格模板

本文档提供各类库对比表格的标准模板，用于在 awesome-jsts-ecosystem 中统一展示库之间的差异。

---

## 通用对比维度

| 维度 | 说明 | 数据来源 |
|------|------|---------|
| Stars | GitHub stars 数量 | GitHub API |
| 维护状态 | 最后更新时间 | GitHub API |
| TS 支持 | TypeScript 支持度 | 源码分析 |
| 包体积 | 安装后大小 | BundlePhobia |
| 下载量 | 周下载量 | npm stats |

---

## 模板一：HTTP 客户端对比

```markdown
### HTTP 客户端对比

| 库 | TS 支持 | Stars | 包体积 | 特点 | 适用场景 |
|---|--------|------|--------|------|---------|
| [axios](link) | 🟡⭐⭐⭐ | 105k | 14KB | 支持浏览器和 Node，API 友好 | 通用 HTTP 请求 |
| [fetch](link) | 🟢⭐⭐⭐ | native | 0KB | 原生 API，无需安装 | 现代环境首选 |
| [ky](link) | 🟢⭐⭐⭐ | 12k | 4KB | fetch 包装，更友好的 API | 轻量级请求 |
| [got](link) | 🟢⭐⭐ | 13k | 45KB | Node 专用，功能强大 | Node.js 服务端 |
```

---

## 模板二：ORM 对比

```markdown
### ORM 对比

| ORM | TS 支持 | Stars | 数据库 | 特点 | 适用场景 |
|-----|--------|------|--------|------|---------|
| [Prisma](link) | 🟢⭐⭐⭐🏢 | 40k | 多数据库 | 类型安全，自动生成 | 企业级应用 |
| [TypeORM](link) | 🟢⭐⭐🏢 | 34k | 多数据库 | Decorator 风格，成熟 | 传统 ORM 用户 |
| [Drizzle](link) | 🟢⭐⭐⭐🚀 | 24k | SQL 为主 | SQL-like API，轻量 | 追求性能和控制 |
| [Mongoose](link) | 🟡⭐⭐⭐ | 26k | MongoDB | MongoDB 专用，功能丰富 | MongoDB 项目 |
```

---

## 模板三：测试框架对比

```markdown
### 测试框架对比

| 框架 | TS 支持 | Stars | 测试类型 | 特点 | 适用场景 |
|------|--------|------|---------|------|---------|
| [Vitest](link) | 🟢⭐⭐⭐🏢 | 14k | 单元/集成 | 极速，Vite 原生 | Vite 项目首选 |
| [Jest](link) | 🟡⭐⭐⭐🏢 | 44k | 单元/集成 | 生态丰富，成熟 | 传统项目 |
| [Playwright](link) | 🟢⭐⭐⭐🏢 | 68k | E2E | 多浏览器，可靠 | E2E 测试 |
| [Cypress](link) | 🟡⭐⭐⭐ | 47k | E2E | 开发体验好 | 前端 E2E |
```

---

## 模板四：构建工具对比

```markdown
### 构建工具对比

| 工具 | TS 支持 | Stars | 构建速度 | 配置复杂度 | 适用场景 |
|------|--------|------|---------|-----------|---------|
| [Vite](link) | 🟢⭐⭐⭐🏢 | 69k | ⭐⭐⭐⭐⭐ | 低 | 现代前端开发 |
| [esbuild](link) | 🟢⭐⭐⭐ | 38k | ⭐⭐⭐⭐⭐ | 中 | 极速构建 |
| [tsc](link) | 🟢⭐⭐⭐ | native | ⭐⭐⭐ | 低 | 类型检查 |
| [Webpack](link) | 🟡⭐⭐⭐ | 64k | ⭐⭐⭐ | 高 | 复杂配置需求 |
```

---

## 模板五：表单处理库对比

```markdown
### 表单处理库对比

| 库 | TS 支持 | Stars | 包体积 | 验证方案 | 适用场景 |
|---|--------|------|--------|---------|---------|
| [React Hook Form](link) | 🟢⭐⭐⭐ | 43k | 9KB | 配合 zod/yup | 性能优先 |
| [Formik](link) | 🟡⭐⭐ | 33k | 13KB | 内置 + 配合 yup | 传统方案 |
| [TanStack Form](link) | 🟢⭐⭐⭐ | 4k | 8KB | 配合 zod | 跨框架 |
```

---

## 模板六：UI 组件库对比

```markdown
### React UI 组件库对比

| 库 | TS 支持 | Stars | 样式方案 | 组件数量 | 适用场景 |
|---|--------|------|---------|---------|---------|
| [shadcn/ui](link) | 🟢⭐⭐⭐🚀 | 82k | Tailwind | 50+ | 现代项目 |
| [MUI](link) | 🟢⭐⭐⭐🏢 | 93k | CSS-in-JS | 100+ | 企业级应用 |
| [Ant Design](link) | 🟢⭐⭐⭐🏢 | 92k | CSS-in-JS | 80+ | 中后台系统 |
| [Chakra UI](link) | 🟢⭐⭐⭐ | 38k | CSS-in-JS | 50+ | 简洁设计 |
```

---

## 模板七：状态管理库对比

```markdown
### React 状态管理对比

| 库 | TS 支持 | Stars | 学习曲线 | 特点 | 适用场景 |
|---|--------|------|---------|------|---------|
| [Zustand](link) | 🟢⭐⭐⭐🚀 | 47k | 低 | 简单，高性能 | 中小型应用 |
| [Jotai](link) | 🟢⭐⭐⭐ | 19k | 中 | 原子化，React 风格 | 细粒度状态 |
| [Redux Toolkit](link) | 🟢⭐⭐⭐🏢 | 11k | 高 | 规范，生态丰富 | 大型应用 |
| [Valtio](link) | 🟢⭐⭐⭐ | 10k | 低 | Proxy 驱动，可变状态 | 简单可变状态 |
```

---

## 使用说明

### 填充步骤

1. **收集数据**：从 GitHub/npm 获取最新数据
2. **验证标签**：根据实际体验验证 TS 支持度和维护状态
3. **补充说明**：添加实际使用中的关键差异点
4. **定期更新**：每季度检查更新一次

### 数据获取命令

```bash
# 获取 GitHub stars
curl -s https://api.github.com/repos/OWNER/REPO | jq '.stargazers_count'

# 获取 npm 下载量
npm view PACKAGE_NAME --json | jq '.versions'

# 获取包体积
npx bundlephobia PACKAGE_NAME
```

### 注意事项

- 数据应保持最新，建议每季度更新
- 客观描述，避免主观偏见
- 重要差异用 **粗体** 标注
- 版本差异在备注中说明

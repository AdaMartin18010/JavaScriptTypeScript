# Awesome JS/TS Ecosystem 文档站点

> 基于 VitePress 构建的「最全面的 TypeScript/JavaScript 学习知识体系」，覆盖 800+ 文档页面、496 HTML 输出、20+ 旗舰专题。

## 项目概览

| 指标 | 数值 |
|------|------|
| Markdown 文档 | **802** 篇 |
| 总内容量 | **15.33 MB** |
| HTML 输出页 | **496** 页 |
| 构建工具 | VitePress 1.6.4 |
| 构建时间 | ~190 秒 |

## 本地开发

### 前置要求

- Node.js 22 LTS+
- pnpm 9+ (推荐) 或 npm 10+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

### 构建（生产环境）

```bash
# Windows PowerShell
cd website
$env:NODE_OPTIONS='--max-old-space-size=8192'
npx vitepress build --outDir .vitepress\dist

# 若 dist 目录被占用，使用备用输出目录
npx vitepress build --outDir .vitepress\dist2
```

### 预览构建结果

```bash
npm run docs:preview
```

## 目录结构

```
website/
├── .vitepress/           # VitePress 配置
│   ├── config.ts         # 站点配置（SEO、搜索、Mermaid）
│   ├── theme/            # 主题定制
│   └── sidebar.ts        # 侧边栏配置（20+ 专题导航）
├── public/               # 静态资源
├── guide/                # 指南页面 (25+)
├── categories/           # 分类文档 (33+)
├── comparison-matrices/  # 对比矩阵 (24)
├── code-lab/             # 代码实验室导航 (25+ 实验)
├── learning-paths/       # 学习路径 (3 条)
├── patterns/             # 设计模式 (4 专题)
├── platforms/            # 跨平台开发 (3 专题)
├── diagrams/             # 架构图与流程图 (20+)
├── cheatsheets/          # 速查表 (5 份)
├── research/             # 研究报告 (3 份)
├── templates/            # 文档模板
├── data/                 # 数据与趋势报告
├── examples/             # 示例分类 (15+ 分类)
├── index.md              # 首页
└── about.md              # 关于页面
```

## 内容规范

### Markdown 质量标准

每篇文档应满足：

- [ ] 标准 frontmatter（title、description）
- [ ] 内容长度 ≥ 15KB（导航页可适当降低）
- [ ] 包含「总结」或「核心洞察」章节
- [ ] 包含「参考资源」或「延伸阅读」
- [ ] 复杂逻辑使用 Mermaid 图表表达
- [ ] 与其他文档建立交叉引用
- [ ] 双轨结构：理论讲解 + 工程实践

### 语法高亮规范

使用 Shiki 内置支持的语言标识符：

| 正确 | 错误 |
|------|------|
| `typescript` / `ts` | `tsx`（部分场景可用，但需验证） |
| `javascript` / `js` | `jsx` |
| `rust` | `wat` |
| `text` | `icu`, `tla`, `pseudo` 等不支持语言 |

### Vue 安全清单

行内代码（非代码块）中必须转义：

| 字符 | 风险 | 处理方式 |
|------|------|----------|
| `<tag>` | 被解析为 HTML | 用反引号包裹或使用 `&lt;` |
| <code>&#123;&#123;</code> | Vue 插值 | 用代码块或转义 |
| `{` | 可能触发解析 | 确保在代码块内 |
| `</tag>` | 被解析为结束标签 | 用反引号包裹 |

## 构建配置

### 关键配置项

```typescript
// .vitepress/config.ts
export default withMermaid(defineConfig({
  metaChunk: true,
  prefetchLinks: true,
  ignoreDeadLinks: [
    // 保留跨项目链接保护
    /jsts-code-lab\//,
    /30\.8-research/,
    // ... 其他规则
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 10000  // 消除 chunk 过大警告
    }
  }
}))
```

### 已知问题

| 问题 | 状态 |  workaround |
|------|------|-------------|
| `dist` 目录文件锁定 (Windows EBUSY) | 🔄 待修复 | 使用 `--outDir .vitepress\dist2` |
| 构建内存消耗大 | ✅ 已缓解 | `NODE_OPTIONS='--max-old-space-size=8192'` |

## 贡献指南

请查看 [贡献指南](./guide/contributing) 了解如何参与文档编写。

### 快速贡献流程

1. Fork 仓库并创建功能分支
2. 遵循内容规范编写文档
3. 确保本地构建通过（`npm run docs:build`）
4. 提交 PR，等待 CI 检查

## 技术栈

| 层级 | 技术 |
|------|------|
| 静态站点生成 | VitePress 1.6.4 |
| 前端框架 | Vue 3.5 |
| 图表渲染 | Mermaid 10.x (vitepress-plugin-mermaid) |
| 搜索 | 本地搜索（中文支持） |
| 代码高亮 | Shiki |
| 运行时 | Node.js 22 LTS |

## 许可证

[MIT](https://github.com/AdaMartin18010/JavaScriptTypeScript/blob/main/LICENSE)

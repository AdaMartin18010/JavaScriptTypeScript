# 内容质量自动化检查脚本

本目录包含用于维护 JS/TS 全景知识库内容质量的自动化检查脚本。

## 脚本清单

| 脚本 | 功能 | 退出码 |
|------|------|--------|
| `link-checker.js` | 扫描所有 `.md` 文件的内部相对链接，检测断裂链接 | 0 = 通过, 2 = 有断裂链接 |
| `version-audit.js` | 扫描技术版本号提及，标记可能过期的版本 | 0 = 通过, 1 = 有过期版本 |
| `cross-reference-validator.js` | 验证 `THEORY.md` 引用的关联文件存在性，检查 `20-code-lab/` 模块覆盖率 | 0 = 通过, 1 = 缺 THEORY, 2 = 有断裂引用 |
| `run-all-checks.js` | 依次运行上述三个脚本，汇总 JSON 质量报告 | 0 = 全部通过, 1 = 有警告, 2 = 有错误 |

## 运行方式

### 单独运行某个检查

```bash
# 检查内部链接
node 60-meta-content/ci-checks/link-checker.js

# 版本号审计
node 60-meta-content/ci-checks/version-audit.js

# 交叉引用验证
node 60-meta-content/ci-checks/cross-reference-validator.js
```

### 运行全部检查

```bash
node 60-meta-content/ci-checks/run-all-checks.js
```

运行后会在同一目录生成对应的 JSON 报告文件：

- `link-check-report.json`
- `version-audit-report.json`
- `cross-reference-report.json`
- `quality-report.json`（汇总报告）

## 检查范围说明

### link-checker.js

- **扫描范围**：项目根目录下所有 `.md` 文件（排除 `node_modules`、`.git` 等目录）
- **检测链接**：`[text](./path)`、`[text](../path)` 等相对路径链接
- **忽略内容**：外部 `http/https` 链接、锚点链接（`#section`）、邮件链接
- **智能解析**：若链接指向目录，会自动尝试查找该目录下的 `index.md` 或 `README.md`

### version-audit.js

- **扫描范围**：所有 `.md` 文件
- **检测技术**：Node.js、React、TypeScript、Vite、Vue、Angular、Next.js、npm、pnpm、Deno、Jest、Vitest、Playwright、Tailwind CSS、Express、NestJS、Prisma、Electron、Astro、Svelte 等
- **对比基准**：2026 年已知最新稳定版本（如 Node.js v24、React 19、TypeScript 5.8）
- **注意**：本脚本仅作提醒，部分旧版本提及可能是历史背景说明，需人工判断

### cross-reference-validator.js

- **扫描范围**：所有 `THEORY.md` 文件
- **验证内容**：
  1. 反引号中的路径引用（如 `` `path/to/file.ts` ``）是否真实存在
  2. `20-code-lab/` 下每个模块目录是否都有至少一个 `THEORY.md`
- **排除项**：纯代码关键字、无路径分隔符且非已知扩展名的内容

## CI 集成

本项目已在 `.github/workflows/content-check.yml` 中配置 GitHub Actions，会在以下时机自动运行：

- 推送到 `main` / `master` 分支
- 针对 `main` / `master` 分支的 Pull Request
- 每周一 UTC 00:00 定时运行
- 支持手动触发 (`workflow_dispatch`)

## 维护说明

如需新增技术版本检测，请编辑 `version-audit.js` 中的 `LATEST_VERSIONS` 对象，添加对应的正则表达式和最新版本号。

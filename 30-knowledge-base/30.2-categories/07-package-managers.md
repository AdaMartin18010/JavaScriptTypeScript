# 包管理器 (Package Managers)

> JavaScript 生态包管理器选型矩阵：npm、Yarn、pnpm、Bun 的速度、磁盘效率与兼容性深度对比。

---

## 核心概念

包管理器的核心职责不仅是安装依赖，还包括：

- **依赖解析**：处理版本冲突、Peer Dependencies、可选依赖
- **磁盘存储策略**：复制 vs 硬链接 vs 内容寻址存储 vs PnP
- **锁文件确定性**：保证 `install` 在不同环境产生完全相同的依赖树
- **工作区支持**：Monorepo 中多包的链接与递归执行

---

## 工具对比矩阵

| 维度 | npm (v11) | Yarn Berry (v4) | pnpm (v10) | Bun (v1.3) |
|------|-----------|-----------------|------------|------------|
| **实现语言** | JavaScript | JavaScript | JavaScript | Zig |
| **冷安装速度（50 deps）** | 14.3s | 6.8s | 4.2s | **0.8s** |
| **冷安装速度（800 deps）** | 134.2s | 52.3s | 28.6s | **4.8s** |
| **磁盘效率** | 低（每项目复制） | 高（PnP 无 node_modules） | **最高**（内容寻址 + 硬链接） | 中（每项目复制） |
| **磁盘节省** | 基准 | ~90%（PnP 模式） | **50–70%** | 基准 |
| **node_modules 结构** | 扁平（hoisted） | PnP（zip 存档）或 hoisted | 严格（symlinked） | 扁平（hoisted） |
| **幽灵依赖保护** | ❌ | ✅ | ✅ | ❌ |
| **Monorepo 支持** | 基础 Workspaces | 强（Constraints + PnP） | **最强**（Filtering + Workspace Protocol） |  growing |
| **锁文件格式** | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` | `bun.lock`（二进制+文本） |
| **Corepack 支持** | ✅ | ✅ | ✅ | ❌ |
| **Node.js 兼容性** | 原生（随 Node 发布） | 原生 | 原生 | **98%**（独立运行时） |
| **最佳场景** | 简单项目，零配置 | 大型团队 PnP 生态 | **Monorepo，磁盘优化** | 极速安装，全栈工具 |

> **基准环境**：M3 MacBook Pro, Node.js 22.x。数据来源：Pockit (Jan 2026)、pnpm.io benchmarks。

---

## 选型决策树

```
新项目选型？
├── 追求极简，零学习成本 → npm（随 Node 自带）
├── Monorepo / 多项目共享依赖 → pnpm（内容寻址存储，磁盘节省 50–70%）
├── 大型团队，已投入 PnP 生态 → Yarn Berry v4（Constraints + Zero-Installs）
└── 追求极致速度 + 全栈统一 → Bun（运行时 + 包管理 + 测试 + 打包一体）
```

---

## 2026 生态动态

### npm v11 改进

- **安装管道重写**（2025）：冷安装速度较 v10 提升约 30%
- **确定性锁文件**：`package-lock.json` v3 格式更稳定
- **审计增强**：`npm audit` 集成 provenance 验证

### Yarn Classic 已弃用

Yarn Classic（v1.22.x）自 2020 年进入**仅维护模式**，仅接收关键安全补丁：

> 新项目应使用 Yarn Berry（v4）或迁移至 pnpm。State of JS 2024 显示 pnpm 保留率 92%，Yarn 仅 65%。

### Bun 1.3 生产就绪

- **Anthropic 生产使用**：Claude Code 基于 Bun 构建
- **独立包管理器模式**：可仅用 `bun install` 而不替换 Node.js 运行时
- **二进制锁文件**：`bun.lock` 解析速度远超 JSON/YAML

### Corepack 默认启用

Node.js 22+ 默认启用 Corepack，允许项目声明所需的包管理器：

```json
// package.json
{
  "packageManager": "pnpm@10.2.0"
}
```

> 执行 `corepack enable` 后，项目自动使用声明的 pnpm 版本，避免团队版本不一致。

---

## 最佳实践

### 1. 锁文件策略

```bash
# CI 中始终使用冻结锁文件安装
pnpm install --frozen-lockfile   # pnpm
npm ci                           # npm
yarn install --immutable         # Yarn
bun install --frozen-lockfile    # Bun
```

### 2. 幽灵依赖防护

- **pnpm**：严格依赖隔离，未声明的依赖无法导入（`node_modules/.pnpm` 结构）
- **Yarn Berry PnP**：完全消除 `node_modules`，依赖必须通过 PnP API 解析
- **npm/Yarn Classic/Bun**：扁平结构可能暴露未声明的依赖，需配合 `eslint-plugin-import` 或 `depcheck`

### 3. Monorepo 工作区配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```bash
# 递归执行命令
pnpm -r run build          # 所有包 build
pnpm --filter web dev      # 仅 web 应用 dev
pnpm --filter './packages/**' test   # 仅 packages 测试
```

### 4. 迁移路径

| 从 | 到 | 步骤 |
|----|-----|------|
| npm | pnpm | `pnpm import` → 删除 `node_modules` → `pnpm install` |
| Yarn Classic | pnpm | 同上，或 `pnpm import` 支持 `yarn.lock` |
| npm/Yarn | Bun | 删除 lockfile → `bun install`（生成 `bun.lock`） |

---

## 参考资源

- [npm Documentation](https://docs.npmjs.com/)
- [pnpm Documentation](https://pnpm.io/)
- [Yarn Documentation](https://yarnpkg.com/)
- [Bun Documentation](https://bun.sh/)
- [Yarn vs npm 2026](https://tech-insider.org/yarn-vs-npm-2026/)
- [pnpm vs npm vs Yarn vs Bun (2026)](https://techsy.io/blog/bun-vs-pnpm-vs-yarn-vs-npm)

---

## 关联文档

- `30-knowledge-base/30.2-categories/08-monorepo-tools.md`
- `30-knowledge-base/30.2-categories/13-ci-cd.md`
- `20-code-lab/20.11-rust-toolchain/`

---

*最后更新: 2026-04-29*

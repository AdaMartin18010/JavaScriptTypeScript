---
title: Claude Code工作流
description: 'Claude Code完全指南：终端AI Agent安装配置、项目级上下文管理、MCP集成、自主Agent模式与最佳实践'
keywords: 'Claude Code, Claude Agent, Terminal AI, MCP, Model Context Protocol, Anthropic, AI Terminal, Project Context'
---

# Claude Code工作流

> 最后更新: 2026-05-02 | 预计阅读: 40 min | 难度: 🌿 中级
>
> Claude Code是Anthropic推出的终端AI编码工具，以Claude 3.7 Sonnet为核心，提供项目级上下文理解和自主Agent能力，是2026年终端AI编码的首选工具。

---

## 📸 界面概览

> **截图占位**: `IMG-002` — Claude Code终端界面
>
> 建议内容：展示终端中Claude Code的交互界面，包括命令提示符、文件树视图、任务执行状态、以及多轮对话历史。

Claude Code完全运行在终端中，无需GUI，适合喜欢命令行工作流的开发者：

```
$ claude
╭─────────────────────────────────────────────────────────────╮
│  Claude Code v0.2.45                                        │
│  模型: Claude 3.7 Sonnet  │  项目: /home/dev/my-project    │
╰─────────────────────────────────────────────────────────────╯

> 帮我分析这个项目的架构

我将分析项目架构...

📁 项目结构:
  src/
  ├── components/    (React组件，23个文件)
  ├── lib/           (工具函数，12个文件)
  ├── api/           (API路由，8个文件)
  └── types/         (类型定义，5个文件)

🔧 技术栈识别:
  - 前端: React 19 + TypeScript 5.8
  - 构建: Vite 6.3
  - 测试: Vitest
  - 样式: Tailwind CSS

📊 代码统计:
  - 总文件: 87
  - TypeScript: 78 | CSS: 5 | Config: 4
  - 测试覆盖率: 62%

💡 观察:
  - 使用相对路径导入，建议配置 path alias
  - 缺少 ESLint 配置
  - 部分组件缺少类型定义

>
```

---

## 🚀 安装与配置

### 安装要求

| 要求 | 版本/说明 |
|------|----------|
| Node.js | 18+ |
| Anthropic API Key | 需要 `claude-code` 权限 |
| Git | 推荐配置（用于变更追踪） |
| 操作系统 | macOS / Linux / WSL |

### 安装步骤

```bash
# 通过npm安装
npm install -g @anthropic-ai/claude-code

# 或通过Bun（更快）
bun install -g @anthropic-ai/claude-code

# 首次运行，配置API Key
claude config set api_key sk-ant-xxx

# 验证安装
claude --version
```

### 配置文件

```bash
# 全局配置目录
~/.config/claude-code/
├── config.json          # 主配置
├── settings.json        # 行为设置
└── history/             # 对话历史
```

```json
// ~/.config/claude-code/config.json
{
  "model": "claude-3-7-sonnet-20250219",
  "maxTokens": 8192,
  "temperature": 0.2,
  "autoApprove": {
    "readFiles": true,
    "writeFiles": false,
    "executeCommands": false,
    "webSearch": true
  },
  "context": {
    "maxFiles": 50,
    "includeGitHistory": true,
    "includeNodeModules": false
  }
}
```

---

## 🎯 核心工作流

### 工作流一：项目理解与导航

```bash
# 进入项目目录
cd my-project

# 启动Claude Code
claude

# 快速了解项目
> 这个项目是做什么的？使用了什么技术栈？

# 查找特定代码
> 找到处理用户认证的代码

# 理解复杂逻辑
> 解释 src/services/payment.ts 中的支付流程

# 查看文件关系
> 哪些文件依赖 src/types/user.ts？
```

### 工作流二：代码生成与编辑

```bash
# 创建新文件
> 在 src/utils/ 下创建一个日期格式化工具，支持相对时间（如"2小时前"）

# 修改现有文件
> 在 src/api/routes.ts 中添加健康检查路由 /health

# 批量修改
> 将所有使用 var 的地方改为 const 或 let

# 重构建议
> 如何改进 src/services/legacy/ 的代码结构？
```

### 工作流三：调试与故障排除

```bash
# 分析错误
> 测试失败了，帮我看看为什么

# 日志分析
> 分析 logs/error.log，找出最常见的错误模式

# 性能诊断
> 为什么 src/components/DataTable.tsx 渲染这么慢？

# 依赖问题
> npm install 报错了，怎么解决？
```

### 工作流四：自主Agent模式

Claude Code的Agent模式可以自主规划和执行多步骤任务。

> **录屏占位**: `GIF-003` — Claude Code自主Agent演示
>
> 建议内容：展示开发者输入"实现JWT认证中间件"后，Claude Code自动分析项目结构、创建文件、修改路由、运行测试的完整流程。

```bash
# 启动Agent模式
claude --agent

# 或交互式切换
> /agent 实现用户注册和登录功能

# Agent执行过程
🤖 任务: 实现用户注册和登录功能

📋 计划:
  1. 分析现有数据库schema
  2. 创建认证服务
  3. 添加API路由
  4. 生成测试

⚡ 执行步骤 1/4: 分析数据库schema
  ✓ 读取 prisma/schema.prisma
  ✓ 发现 User 模型已有 email 和 password 字段

⚡ 执行步骤 2/4: 创建认证服务
  ✓ 创建 src/services/auth.ts
  ✓ 实现 register() 和 login() 函数

⚡ 执行步骤 3/4: 添加API路由
  ✓ 更新 src/api/routes.ts
  ✓ 添加 POST /auth/register 和 POST /auth/login

⚡ 执行步骤 4/4: 生成测试
  ✓ 创建 src/services/auth.test.ts
  ✓ 运行测试: 6 passed, 0 failed

✅ 任务完成！变更文件:
   M src/api/routes.ts
   A src/services/auth.ts
   A src/services/auth.test.ts

> /diff   # 查看完整diff
> /accept # 接受所有变更
> /reject # 放弃变更
```

---

## 🧠 项目级上下文管理

### 自动上下文构建

Claude Code自动索引和分析项目，构建以下上下文：

| 上下文类型 | 来源 | 用途 |
|-----------|------|------|
| **文件树** | `git ls-files` / `find` | 理解项目结构 |
| **类型定义** | `.d.ts`, `interface`, `type` | 类型安全编码 |
| **依赖信息** | `package.json`, `Cargo.toml` | 技术栈识别 |
| **Git历史** | `git log`, `git diff` | 变更追踪 |
| **配置文件** | `.eslintrc`, `tsconfig.json` | 编码规范 |
| **文档** | `README.md`, `docs/` | 项目背景 |

### CLAUDE.md — 项目AI配置

在项目根目录创建 `CLAUDE.md`，为Claude Code提供项目专属指导：

```markdown
# 项目上下文

## 项目简介
这是一个全栈TypeScript SaaS应用，提供团队协作文档编辑功能。

## 技术栈
- 前端: Next.js 15 App Router + React 19 + Tailwind CSS
- 后端: tRPC + Prisma + PostgreSQL
- 认证: NextAuth.js + JWT
- 部署: Vercel + Docker

## 编码规范
1. 使用函数组件 + Hooks，不用类组件
2. API使用tRPC，不用REST
3. 数据库查询必须通过Prisma，不用原始SQL
4. 错误处理使用try/catch + 自定义AppError类
5. 所有用户输入必须Zod验证

## 文件组织
```

src/
  app/           # Next.js App Router
  components/    # React组件（按功能域分组）
  lib/           # 工具函数和配置
  server/        # 服务端代码（tRPC routers, Prisma client）
  types/         # 全局类型定义

```

## 常用模式

### tRPC Router定义
```typescript
// src/server/routers/example.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.text}` };
    }),
});
```

### 组件模式

```typescript
// 所有组件使用以下结构
interface Props {
  // ...
}

export function ComponentName({ ... }: Props) {
  // ...
}
```

## 注意事项

- 不要在组件中直接调用Prisma client
- 敏感数据不要console.log
- API响应统一使用 { success: boolean, data?, error? } 格式

```

### 上下文增强技巧

```bash
# 手动添加文件到上下文
> /context add src/core/business-logic.ts

# 查看当前上下文包含的文件
> /context list

# 清除上下文重新开始
> /context clear

# 使用特定目录作为上下文根
claude --root src/features/auth
```

---

## 🔌 MCP（Model Context Protocol）集成

Claude Code原生支持MCP，可以连接外部工具和数据源。

> **录屏占位**: `GIF-005` — MCP工具调用流程
>
> 建议内容：展示Claude Code通过MCP连接数据库、查询数据、返回结果给AI的完整流程。

### 配置MCP Servers

```json
// ~/.config/claude-code/mcp.json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/dev/projects"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### MCP使用示例

```bash
# 查询数据库
> 查看users表中有多少用户注册了超过30天

Claude: [通过MCP Postgres Server查询]
结果: 1,247 用户

# 创建GitHub Issue
> 根据最近的错误日志创建一个Bug报告

Claude: [通过MCP GitHub Server创建Issue]
✓ 已创建 Issue #234: "修复用户认证超时问题"

# 读取外部文档
> 查看React 19官方文档中关于Server Components的部分

Claude: [通过MCP Fetch获取文档内容]
[总结文档要点...]
```

### 常用MCP Servers

| Server | 用途 | 安装 |
|--------|------|------|
| `@modelcontextprotocol/server-postgres` | PostgreSQL数据库查询 | `npx -y @modelcontextprotocol/server-postgres <url>` |
| `@modelcontextprotocol/server-github` | GitHub API操作 | `npx -y @modelcontextprotocol/server-github` |
| `@modelcontextprotocol/server-filesystem` | 文件系统访问 | `npx -y @modelcontextprotocol/server-filesystem <path>` |
| `@modelcontextprotocol/server-fetch` | HTTP请求 | `npx -y @modelcontextprotocol/server-fetch` |
| `@modelcontextprotocol/server-puppeteer` | 浏览器自动化 | `npx -y @modelcontextprotocol/server-puppeteer` |

---

## 📝 Prompt模板（Claude Code专用）

### 模板1：功能开发（Agent模式）

```markdown
实现功能：[功能描述]

技术约束：
- 使用现有技术栈（见 package.json）
- 遵循 src/ 下的编码规范
- 复用 src/lib/ 中的现有工具

具体要求：
1. [需求1]
2. [需求2]
3. [需求3]

验收标准：
- [ ] 功能正确实现
- [ ] 包含单元测试（覆盖率>80%）
- [ ] 类型检查通过（npm run typecheck）
- [ ] 代码风格检查通过（npm run lint）

请先制定计划，确认后再执行。
```

### 模板2：代码审查

```markdown
请审查 [文件路径/目录]，重点关注：

1. 架构设计：是否符合项目规范？
2. 类型安全：是否有类型漏洞？
3. 错误处理：是否遗漏异常路径？
4. 性能：是否有明显瓶颈？
5. 安全：是否有注入、XSS等风险？

对每个问题给出：
- 严重程度（Critical/Major/Minor）
- 具体位置（文件:行号）
- 修复建议（含代码示例）
```

### 模板3：Bug修复

```markdown
Bug描述：[现象描述]

重现步骤：
1. [步骤1]
2. [步骤2]

错误信息：
```

[粘贴错误堆栈]

```

相关代码：
- [文件1]
- [文件2]

请：
1. 分析根本原因
2. 提供修复方案
3. 解释修复逻辑
4. 建议如何预防类似问题
```

### 模板4：技术债务清理

```markdown
请分析 [目录/项目] 的技术债务：

1. 找出代码异味（重复、过长函数、魔法数字等）
2. 找出未使用的导入和变量
3. 找出类型定义不一致的地方
4. 评估测试覆盖率缺口

输出：
- 优先级排序的改进清单
- 每个改进的估计工作量
- 推荐的改进顺序
```

---

## 🎓 高级技巧

### 技巧1：Git集成工作流

```bash
# 基于当前变更生成commit message
> /git commit

# 生成PR描述
> /git pr

# 基于分支差异回答代码审查问题
> 这个分支改了什么？有什么风险？

# 交互式rebase辅助
> 帮我整理最近的commit历史
```

### 技巧2：批量文件操作

```bash
# 批量重命名
> 将所有以 old_ 开头的文件改为 new_ 前缀

# 批量添加注释
> 为 src/components/ 下的所有组件添加 JSDoc

# 批量格式转换
> 将 src/data/ 下的 JSON 文件转为 TypeScript 常量
```

### 技巧3：测试驱动开发

```bash
# 先生成测试，再实现功能
> 为 src/services/order.ts 编写测试，覆盖所有边界情况

# 基于测试实现功能
> 实现代码使所有测试通过

# 突变测试
> 检查测试是否足够严格（尝试引入bug看测试是否捕获）
```

---

## ⚖️ Cursor vs Claude Code 对比

| 维度 | **Cursor** | **Claude Code** |
|------|:----------:|:---------------:|
| **界面** | GUI IDE | 终端 |
| **启动速度** | 快（IDE常驻） | 极快（命令行） |
| **代码补全** | ✅ Tab（实时） | ❌ 无 |
| **可视化编辑** | ✅ 强（diff查看） | ⚠️ 文本diff |
| **终端集成** | 内置终端 | 原生终端 |
| **批量操作** | ✅ Composer | ✅ Agent模式 |
| **远程开发** | VS Code Remote | SSH + 终端 |
| **IDE生态** | VS Code全生态 | 无（纯终端） |
| **最佳场景** | 日常开发、大型重构 | 快速脚本、系统管理、CI/CD |

**选择建议**：

- 长时间编码 → Cursor
- 快速任务、脚本、DevOps → Claude Code
- 两者互补：Cursor写代码，Claude Code做系统级操作

---

## 🔧 常见问题与解决

| 问题 | 解决 |
|------|------|
| API Key无效 | 检查Key是否有 `claude-code` 权限，非普通API Key |
| 上下文太大 | 使用 `/context clear` 或缩小项目范围 |
| 文件修改未生效 | Agent模式下需要 `/accept` 确认 |
| 命令执行被拒 | 检查 `autoApprove` 配置或手动确认 |
| 响应慢 | 检查网络，或切换到较小的模型 |
| 索引失败 | 确保在Git仓库内，或手动指定文件 |

---

## 📸 截图/录屏占位说明

| 占位符ID | 描述 | 建议格式 |
|----------|------|----------|
| `IMG-002` | Claude Code终端界面：交互式命令行 | PNG, 1920x1080 |
| `GIF-003` | Agent模式自主执行：任务→计划→执行→测试 | GIF/MP4, 45s |
| `IMG-008` | CLAUDE.md项目配置示例 | PNG, 1200x600 |
| `GIF-005` | MCP工具调用：AI→MCP Server→数据库查询→结果 | GIF/MP4, 15s |
| `IMG-009` | Agent模式执行计划与文件变更列表 | PNG, 1200x600 |

---

## 参考资源

- [Claude Code官方文档](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [MCP协议规范](https://modelcontextprotocol.io)
- [Anthropic API文档](https://docs.anthropic.com)

> 最后更新: 2026-05-02 | 状态: ✅ 已创建 | 对齐: AI辅助编码工作流专题

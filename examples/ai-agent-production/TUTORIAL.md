# AI Agent Production 跟练教程

> 难度等级: ⭐⭐⭐⭐
> 预计时间: 3-4 小时
> 前置知识: TypeScript 基础、Node.js 包管理、REST API 概念、对 LLM/OpenAI API 有基本了解

## 目标

完成本教程后，你将能够：

- 使用 Mastra 框架搭建多 Agent 协作系统的核心架构
- 配置和启动 MCP (Model Context Protocol) Server 为 Agent 提供工具能力
- 使用 better-auth 实现 AI 系统的认证与权限控制
- 运行并验证多 Agent 工作流的端到端流程
- 理解生产级 AI Agent 系统的项目结构

## 环境准备

- **Node.js**: `>= 20.0.0` (建议使用 nvm 或 fnm 管理)
- **包管理器**: pnpm `>= 9.0.0` 或 npm `>= 10.0.0`
- **Git**: 用于克隆示例代码
- **OpenAI API Key**: 用于驱动 Mastra Agent (或其他兼容的 LLM Provider，如 Claude/Groq)
- **编辑器**: VS Code (推荐安装 TypeScript、Prettier 扩展)

### 全局工具安装

```bash
# 安装 pnpm (如未安装)
npm install -g pnpm

# 验证 Node.js 版本
node -v  # 应输出 v20.x.x 或更高
```

## Step 1: 克隆项目并安装依赖

首先进入本示例项目目录，安装所有依赖。

```bash
cd e:\_src\JavaScriptTypeScript\examples\ai-agent-production

# 安装项目依赖
pnpm install

# 或在 macOS/Linux 上
npm install
```

### 验证

运行以下命令，确认无报错：

```bash
pnpm list mastra @mastra/core
```

应能看到 `mastra` 和 `@mastra/core` 等核心包已安装。

## Step 2: 配置环境变量

项目需要 LLM API Key 和 MCP Server 配置。

```bash
# 复制环境变量模板
cp .env.example .env
```

使用编辑器打开 `.env` 文件，填写以下关键配置：

```env
# LLM Provider (以 OpenAI 为例)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 可选：其他 Provider
# ANTHROPIC_API_KEY=sk-ant-your-key
# GROQ_API_KEY=gsk-your-key

# better-auth 配置
AUTH_SECRET=your-random-secret-key-min-32-chars
AUTH_URL=http://localhost:3000

# MCP Server 端口
MCP_SERVER_PORT=3001
```

### 验证

```bash
# 检查 .env 文件是否存在且不为空
cat .env | grep OPENAI_API_KEY
```

确认 `OPENAI_API_KEY` 已正确设置（不要提交到 Git！已包含在 `.gitignore` 中）。

## Step 3: 启动 MCP Server

MCP (Model Context Protocol) Server 为 Agent 提供外部工具能力（如文件系统操作、数据库查询、Web 搜索等）。

```bash
# 启动 MCP Server (开发模式，带热重载)
pnpm mcp:dev

# 或使用 npm
npm run mcp:dev
```

你应该看到类似输出：

```
[MCP Server] 启动中...
[MCP Server] 已注册工具: filesystem, webSearch, databaseQuery
[MCP Server] 运行在 http://localhost:3001/sse
```

**保持此终端运行**，新开一个终端继续后续步骤。

### 验证

```bash
# 在另一个终端中测试 MCP Server 健康状态
curl http://localhost:3001/health
```

应返回 `{"status":"ok"}`。

## Step 4: 配置 Mastra Agent

项目已包含预设的 Agent 配置，位于 `src/mastra/agents/` 目录。你需要确认 Agent 已正确关联 MCP 工具。

```bash
# 检查 Agent 配置文件结构
tree src/mastra/agents/
```

预期结构：

```
src/mastra/agents/
├── coordinator.ts    # 协调 Agent：负责任务分配
├── researcher.ts     # 研究 Agent：负责信息收集
├── writer.ts         # 写作 Agent：负责内容生成
└── index.ts          # Agent 统一导出
```

打开 `src/mastra/agents/coordinator.ts`，确认 MCP 工具已注入：

```typescript
import { Agent } from "@mastra/core";

export const coordinatorAgent = new Agent({
  name: "coordinator",
  instructions: `你是任务协调 Agent。分析用户请求，将其分解为子任务，
    并调用其他 Agent 完成。`,
  model: {
    provider: "openai",
    name: "gpt-4o",
    toolChoice: "required",
  },
  tools: {
    // MCP 工具会自动从 Server 加载
    webSearch: true,
    filesystem: true,
  },
});
```

### 验证

```bash
# 运行类型检查，确认 Agent 配置无 TS 错误
pnpm typecheck
```

无报错即通过。

## Step 5: 运行多 Agent 工作流

Mastra 工作流定义了 Agent 之间的协作顺序。

```bash
# 启动 Mastra 应用 (会同时启动 API Server)
pnpm dev

# 或
npm run dev
```

应用启动后，你会看到：

```
[Mastra] API 服务启动: http://localhost:3000/api
[Mastra] Agent 已加载: coordinator, researcher, writer
[Workflow] 多 Agent 工作流已注册: contentCreationWorkflow
```

### 测试多 Agent 协作

使用 cURL 或 Postman 发送测试请求：

```bash
curl -X POST http://localhost:3000/api/agents/coordinator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "帮我写一篇关于 React 19 新特性的技术博客，需要搜索最新资料" }
    ]
  }'
```

预期行为：

1. `coordinator` Agent 分析请求，决定调用 `researcher` 搜索资料
2. `researcher` Agent 使用 `webSearch` MCP 工具获取信息
3. `coordinator` 将研究结果传递给 `writer` Agent
4. `writer` Agent 生成最终博客内容
5. 返回完整结果

### 验证

- API 返回 HTTP 200
- 响应中包含最终生成的内容
- 终端日志中可以看到各 Agent 的执行顺序和工具调用记录

## Step 6: 配置 better-auth 认证

为生产环境添加用户认证，确保只有授权用户能触发 Agent 工作流。

```bash
# 初始化 better-auth 数据库 schema
pnpm db:push

# 或根据项目配置使用 drizzle-kit
npx drizzle-kit push
```

在 `src/auth.ts` 中确认 better-auth 已集成：

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "sqlite", // 或 PostgreSQL/MySQL
    url: "./auth.db",
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 验证

```bash
# 启动应用后测试认证端点
curl http://localhost:3000/api/auth/session
```

应返回当前会话信息（未登录状态为空对象）。

## Step 7: 测试与验证

运行项目的完整测试套件：

```bash
# 运行单元测试
pnpm test

# 运行 Agent 集成测试 (会调用真实 LLM，消耗 API 额度)
pnpm test:integration
```

### 手动端到端验证

1. 打开浏览器访问 `http://localhost:3000`
2. 使用 GitHub 登录 (如配置了 OAuth)
3. 在 playground 中输入任务，观察多 Agent 协作输出
4. 检查 MCP Server 终端中的工具调用日志

### 验证清单

- [ ] 所有 Agent 正常加载，无报错
- [ ] MCP Server 响应正常
- [ ] 工作流能完成端到端执行
- [ ] 认证流程工作正常
- [ ] 测试用例全部通过

## 常见错误排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `MCP Server connection refused` | MCP Server 未启动或端口冲突 | 确认 Step 3 的 MCP Server 仍在运行，检查 `.env` 中的 `MCP_SERVER_PORT` |
| `OPENAI_API_KEY is not set` | 环境变量未加载 | 确认 `.env` 文件存在且格式正确，重启 dev server |
| `Model not found: gpt-4o` | API Key 无效或模型名称错误 | 检查 API Key 是否有效，或更换为可用的模型名称如 `gpt-3.5-turbo` |
| `TypeError: Cannot read properties of undefined (reading 'tools')` | Mastra 版本不兼容 | 运行 `pnpm update mastra @mastra/core` 到最新版 |
| `drizzle-kit: command not found` | 数据库工具未安装 | 运行 `pnpm add -D drizzle-kit` |
| `better-auth: database connection failed` | 数据库文件缺失 | 运行 `pnpm db:push` 初始化 schema |
| `Agent 循环调用，无限递归` | 协调 Agent 的指令不明确 | 修改 `coordinator.ts` 中的 instructions，增加终止条件说明 |

## 扩展挑战

1. **添加自定义 MCP 工具**: 在 `src/mcp/tools/` 下创建一个新的工具（如发送邮件、查询天气），并注册到 MCP Server 中
2. **实现人机协作节点**: 修改工作流，在关键步骤暂停并等待人工确认后再继续
3. **添加记忆功能**: 使用 Mastra 的 Memory 模块让 Agent 能记住历史对话上下文
4. **接入不同 LLM Provider**: 将 OpenAI 替换为 Claude 或本地 Ollama 模型，比较效果差异
5. **部署到生产环境**: 使用 Docker 容器化应用，配置环境变量和持久化存储

## 相关学习资源

- **code-lab**: `jsts-code-lab/94-ai-agent-lab` — 动手实验 Mastra Agent 开发、MCP 协议实现、工作流编排
- **理论文档**: `JSTS全景综述/06_workflow_patterns.md` — 工作流模式与设计原则
- **理论文档**: `JSTS全景综述/07_architecture.md` — 系统架构设计参考
- **外部参考**: [Mastra 官方文档](https://mastra.ai/docs)
- **外部参考**: [MCP 协议规范](https://modelcontextprotocol.io/)
- **外部参考**: [better-auth 文档](https://www.better-auth.com/)

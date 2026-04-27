# 应用领域选型指南

> 根据业务场景快速定位正确的应用领域技术栈。

---

## 选型流程

```
1. 识别业务场景类型
        ↓
2. 匹配应用领域维度
        ↓
3. 选择核心框架/工具
        ↓
4. 搭配基础设施
        ↓
5. 验证学习路径
```

---

## 场景匹配表

| 业务场景 | 应用领域 | 核心框架/工具 | 基础设施重点 | 学习路径入口 |
|---------|---------|-------------|------------|------------|
| **AI Chat 应用** | AI/ML | Vercel AI SDK + React 19 | OpenAI API / 边缘部署 / AI 可观测性 | [AI Agent 基础设施](../categories/28-ai-agent-infrastructure.md) |
| **AI 工作流自动化** | AI/ML | Mastra + LangGraph | MCP / A2A / 多 Agent 编排 | [94-ai-agent-lab](../../jsts-code-lab/94-ai-agent-lab/) |
| **跨平台移动 App** | 移动端 | React Native + Expo | Metro / EAS Build / 推送服务 | [16-mobile-development](../categories/16-mobile-development.md) |
| **桌面应用** | 桌面端 | Tauri v2 + React | Rust 后端 / 自动更新 / 原生 API | [desktop-tauri-react](../../examples/desktop-tauri-react/) |
| **实时协作工具** | 实时通信 | Socket.io / PartyKit | WebSocket / CRDT / Presence | [30-real-time-communication](../../jsts-code-lab/30-real-time-communication/) |
| **Web3 DApp** | Web3 | wagmi + Viem + RainbowKit | 钱包连接 / 合约交互 / IPFS | [34-blockchain-web3](../../jsts-code-lab/34-blockchain-web3/) |
| **边缘 API 服务** | 边缘计算 | Hono + Cloudflare Workers | D1 / KV / Durable Objects | [32-edge-computing](../../jsts-code-lab/32-edge-computing/) |
| **IoT 数据面板** | 物联网 | React + WebSocket + Canvas | 时序数据库 / MQTT / 低延迟渲染 | [52-web-rendering](../../jsts-code-lab/52-web-rendering/) |
| **WebXR 体验** | 游戏/图形 | Three.js / Babylon.js | WebGL / WebGPU / 空间计算 | [84-webxr](../../jsts-code-lab/84-webxr/) |
| **低代码平台** | 低代码 | React DnD + JSON Schema | 表单引擎 / 流程引擎 / 权限系统 | [97-lowcode-platform](../../jsts-code-lab/97-lowcode-platform/) |

---

## 维度交叉检查

选择应用领域后，还需确认关联的其他维度：

### AI 应用交叉检查

```
应用领域: AI Chat
    ├── 框架生态: React 19 (Streaming UI) + AI SDK
    ├── 技术基础设施: OpenAI API Key / 边缘部署 / Langfuse 监控
    └── 语言核心: 生成器/迭代器 (流式输出) / TypeScript 类型安全
```

### 移动端应用交叉检查

```
应用领域: 跨平台移动 App
    ├── 框架生态: React Native / Expo Router
    ├── 技术基础设施: EAS Build / 推送服务 / 应用商店发布
    └── 语言核心: 平台桥接 / 原生模块通信
```

### 边缘计算应用交叉检查

```
应用领域: 边缘 API
    ├── 框架生态: Hono (轻量路由)
    ├── 技术基础设施: Workers / D1 / KV / 边缘缓存
    └── 语言核心: ESM 模块 / 顶层 await / 权限模型
```

---

## 决策树：我应该选哪个应用领域？

```
1. 是否需要 AI/LLM 能力？
   ├── 是 → 需要多 Agent 协作？
   │         ├── 是 → [AI Agent 基础设施](../categories/28-ai-agent-infrastructure.md)
   │         └── 否 → [AI 集成](../../jsts-code-lab/33-ai-integration/)
   └── 否 → 2. 目标平台是什么？
            ├── 移动端 → [移动端开发](../categories/16-mobile-development.md)
            ├── 桌面端 → [桌面端开发](../categories/17-desktop-development.md)
            ├── Web 浏览器 → 3. 需要实时交互？
            │                 ├── 是 → [实时通信](../../jsts-code-lab/30-real-time-communication/)
            │                 └── 否 → [前端框架](../categories/01-frontend-frameworks.md)
            └── 边缘/Serverless → [边缘计算](../../jsts-code-lab/32-edge-computing/)
```

---

## 快速启动模板

| 应用领域 | 推荐 starter | 一键部署 |
|---------|------------|---------|
| AI Chat | `npx create-ai-chat` | Vercel |
| 移动 App | `npx create-expo-app` | EAS |
| 桌面应用 | `npm create tauri-app@latest` | GitHub Releases |
| 边缘 API | `npm create hono@latest` | Cloudflare |
| Web3 DApp | `npx create-wagmi` | Vercel |

---

> 💡 **提示**：应用领域技术变化极快，建议每季度回顾一次 [Tech Radar](../research/tech-radar-2026-Q1.md) 确认所选技术的状态。

*最后更新: 2026-04-27*
*review-cycle: 3 months*
*next-review: 2026-07-27*
*status: current*

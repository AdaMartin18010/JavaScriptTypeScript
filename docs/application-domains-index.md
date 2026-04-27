---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 应用领域总索引（Application Domains Index）

> 本文档是 JavaScript/TypeScript 全景知识库中**所有应用领域**的单一入口。应用领域指 JavaScript/TypeScript 被用于解决特定行业或场景问题的技术方向，区别于语言核心、框架生态和基础设施维度。

---

## 📋 索引目录

| 领域 | 关键词 | 核心模块 | 成熟度 |
|------|--------|----------|--------|
| [AI 与 Agent 应用](#ai-与-agent-应用) | LLM、RAG、MCP、Agent、A2A | 33/55/56/82/85/89/94 | 高速增长 |
| [移动端与桌面端](#移动端与桌面端) | React Native、Expo、Tauri、Electron | mobile-*、desktop-* | 成熟 |
| [Web3 与区块链](#web3-与区块链) | 智能合约、DApp、NFT、DeFi | 34/83 | 稳定 |
| [实时通信](#实时通信) | WebSocket、WebRTC、SSE | 30 | 成熟 |
| [游戏与沉浸式图形](#游戏与沉浸式图形) | WebXR、WebGL、Canvas、3D | 84/58 | 演进中 |
| [边缘与 Serverless](#边缘与-serverless) | FaaS、Edge Runtime、Durable Objects | 31/32/93 | 成熟 |
| [低代码与可视化](#低代码与可视化) | PWA、低代码平台、数据可视化 | 37/58/97 | 成熟 |
| [ML 工程与科学计算](#ml-工程与科学计算) | Tensor、模型推理、量子计算 | 76/77 | 新兴 |

---

## 🧠 AI 与 Agent 应用

> **维度定位**: 应用领域 | **边界说明**: 本领域关注 AI 技术在 JS/TS 应用中的落地实现，底层基础设施（模型训练、GPU 集群）不在此列，请参见 `docs/categories/28-ai-agent-infrastructure.md`。

### 覆盖范围

- **AI SDK 集成**: Vercel AI SDK、OpenAI SDK、多模型路由
- **RAG 与 Embedding**: 向量检索、知识库构建、语义搜索
- **Agent 编排**: 多 Agent 协作、MCP 协议、工具调用、A2A 协议
- **AI 辅助开发**: 代码生成、测试生成、AI 驱动的 DevOps
- **Edge AI**: 浏览器端推理、模型量化、WebNN/WebGPU 加速
- **NLP 工程**: 分词、情感分析、命名实体识别、文本分类
- **自主系统**: BDI Agent、行为树、规则引擎、任务调度

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/33-ai-integration/` | LLM API、Prompt 工程、Streaming、Embedding |
| 代码实验室 | `jsts-code-lab/55-ai-testing/` | AI 测试生成、突变测试、LLM-as-Judge |
| 代码实验室 | `jsts-code-lab/56-code-generation/` | AST 转换、AI 辅助工作流、OpenAPI 生成 |
| 代码实验室 | `jsts-code-lab/76-ml-engineering/` | 线性回归、神经网络、Tensor 运算、模型服务 |
| 代码实验室 | `jsts-code-lab/82-edge-ai/` | 边缘推理、模型量化、ONNX Runtime、TinyML |
| 代码实验室 | `jsts-code-lab/85-nlp-engineering/` | BPE 分词、语义搜索、情感分析、文本分类 |
| 代码实验室 | `jsts-code-lab/89-autonomous-systems/` | 自主 Agent、行为树、反馈控制器 |
| 代码实验室 | `jsts-code-lab/94-ai-agent-lab/` | MCP Server、多 Agent 工作流、Agent 记忆 |
| 示例项目 | `examples/ai-agent-production/` | 生产级 AI Agent 系统（Mastra + MCP） |
| 分类索引 | `docs/categories/28-ai-agent-infrastructure.md` | 基础设施与框架对比（**非应用层**） |
| 指南 | `docs/guides/ai-sdk-guide.md` | AI SDK 使用指南 |
| 指南 | `docs/guides/ai-observability-guide.md` | AI 可观测性 |
| 指南 | `docs/guides/mcp-guide.md` | MCP 协议指南 |
| 指南 | `docs/guides/a2a-protocol-guide.md` | A2A 协议指南 |
| 指南 | `docs/guides/ai-coding-workflow.md` | AI 编码工作流 |
| 研究 | `docs/research/ai-agent-architecture-patterns.md` | Agent 架构模式 |

---

## 📱 移动端与桌面端

> **维度定位**: 应用领域 | **边界说明**: 本领域关注跨平台应用开发的技术选型与工程实践，UI 组件库和构建工具等基础设施请参见对应分类文件。

### 覆盖范围

- **移动端**: React Native、Expo、跨平台原生应用
- **桌面端**: Tauri（Rust + WebView）、Electron（Chromium + Node.js）
- **混合方案**: PWA、Capacitor、Ionic
- **性能优化**: 启动速度、包体积、原生桥接

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 示例项目 | `examples/mobile-react-native-expo/` | React Native + Expo 完整示例 |
| 示例项目 | `examples/desktop-tauri-react/` | Tauri + React 桌面应用 |
| 平台指南 | `docs/platforms/MOBILE_DEVELOPMENT.md` | 移动端开发完全指南（3,500+ 行） |
| 平台指南 | `docs/platforms/DESKTOP_DEVELOPMENT.md` | 桌面端开发指南（Electron + Tauri） |
| 分类索引 | `docs/categories/16-mobile-development.md` | 移动端开发库分类索引 |

---

## ⛓️ Web3 与区块链

> **维度定位**: 应用领域 | **边界说明**: 本领域关注 DApp 开发与区块链交互，底层共识算法、密码学原语请参见 `jsts-code-lab/71-consensus-algorithms` 和 `81-cybersecurity`。

### 覆盖范围

- **智能合约交互**: Ethers.js、Web3.js、合约 ABI 调用
- **DApp 开发**: 钱包集成、交易签名、事件监听
- **高级主题**: Layer 2、Rollup、跨链桥、零知识证明
- **DeFi / NFT**: 去中心化金融协议、非同质化代币

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/34-blockchain-web3/` | Web3 模式、智能合约交互 |
| 代码实验室 | `jsts-code-lab/83-blockchain-advanced/` | Layer 2、Rollup、跨链桥 |
| 分类索引 | `docs/categories/32-blockchain-web3.md` | Web3 生态分类索引 |

---

## 📡 实时通信

> **维度定位**: 应用领域 | **边界说明**: 本领域关注实时数据推送与 P2P 通信，底层网络编程请参见 `docs/guides/NETWORK_PROGRAMMING.md`。

### 覆盖范围

- **WebSocket**: 双向实时通信、房间管理、心跳机制
- **SSE (Server-Sent Events)**: 服务器单向推送、自动重连
- **WebRTC**: P2P 音视频、数据通道、NAT 穿透
- **实时架构**: 消息顺序保证、状态同步、在线 presence

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/30-real-time-communication/` | SSE、WebRTC、实时模式 |
| 代码实验室 | `jsts-code-lab/19-backend-development/websocket-patterns.ts` | WebSocket 后端模式 |
| 分类索引 | `docs/categories/33-real-time-communication.md` | 实时通信技术分类 |

---

## 🎮 游戏与沉浸式图形

> **维度定位**: 应用领域 | **边界说明**: 本领域关注沉浸式体验与图形渲染应用，底层渲染引擎（Three.js、Babylon.js）的分类请参见 `docs/categories/04-data-visualization.md`。

### 覆盖范围

- **WebXR**: VR/AR 沉浸式体验、空间追踪、手势识别
- **WebGL / Canvas**: 2D/3D 图形渲染、游戏画面
- **数据可视化**: 图表、地图、3D 数据展示
- **游戏开发**: 浏览器游戏、休闲游戏、交互式叙事

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/84-webxr/` | XR 引擎、3D 数学、空间锚点 |
| 代码实验室 | `jsts-code-lab/58-data-visualization/` | SVG/Canvas 渲染、图表架构、动画 |
| 分类索引 | `docs/categories/34-webxr-ar-vr.md` | WebXR/AR/VR 技术分类 |
| 分类索引 | `docs/categories/04-data-visualization.md` | 数据可视化库分类 |
| 平台指南 | `docs/platforms/DATA_VISUALIZATION.md` | 数据可视化完整指南 |

---

## ⚡ 边缘与 Serverless

> **维度定位**: 应用领域 | **边界说明**: 本领域关注无服务器应用架构与边缘部署模式，通用 CI/CD 和容器编排请参见 `docs/categories/24-ci-cd-devops.md` 和 `jsts-code-lab/72-container-orchestration`。

### 覆盖范围

- **Serverless / FaaS**: 函数计算、事件驱动、冷启动优化
- **边缘计算**: Edge Runtime、V8 Isolate、Durable Objects
- **边缘部署**: Cloudflare Workers、Vercel Edge、Deno Deploy
- **边缘 AI**: 边缘推理、模型量化、实时预测
- **可观测性**: 边缘日志、性能监控、分布式追踪

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/31-serverless/` | Serverless 模式、FaaS |
| 代码实验室 | `jsts-code-lab/32-edge-computing/` | Edge Runtime、边缘缓存、V8 Isolate |
| 代码实验室 | `jsts-code-lab/93-deployment-edge-lab/` | Cloudflare Workers、Vercel Edge、Docker 优化 |
| 代码实验室 | `jsts-code-lab/82-edge-ai/` | 边缘 AI 推理、WebNN、WebGPU |
| 示例项目 | `examples/edge-ai-inference/` | 边缘 AI 推理示例 |
| 示例项目 | `examples/edge-observability-starter/` | 边缘可观测性 Starter |
| 分类索引 | `docs/categories/31-serverless-edge-computing.md` | Serverless 与边缘计算分类 |
| 指南 | `docs/guides/TANSTACK_START_CLOUDFLARE_DEPLOYMENT.md` | Cloudflare 部署指南 |

---

## 🧩 低代码与可视化

> **维度定位**: 应用领域 | **边界说明**: 本领域关注通过配置化和可视化方式构建应用，通用前端组件库请参见 `docs/categories/02-ui-component-libraries.md`。

### 覆盖范围

- **低代码平台**: 可视化设计器、Schema 驱动、代码生成、工作流引擎
- **PWA**: Service Worker、离线存储、Web App Manifest、后台同步
- **数据可视化**: 图表库集成、Canvas/SVG 渲染、交互式仪表盘
- **报表与 BI**: 数据大屏、实时指标、拖拽式报表

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/97-lowcode-platform/` | 低代码引擎、Schema 定义、代码生成 |
| 代码实验室 | `jsts-code-lab/37-pwa/` | Service Worker、缓存策略、Manifest |
| 代码实验室 | `jsts-code-lab/58-data-visualization/` | 图表渲染、数据分箱、动画 |
| 分类索引 | `docs/categories/35-pwa-lowcode.md` | PWA 与低代码平台分类 |
| 分类索引 | `docs/categories/04-data-visualization.md` | 数据可视化库分类 |
| 平台指南 | `docs/platforms/DATA_VISUALIZATION.md` | 数据可视化完整指南 |

---

## 🔬 ML 工程与科学计算

> **维度定位**: 应用领域 | **边界说明**: 本领域关注在 JS/TS 环境中进行机器学习与科学计算，底层数学库和 Python 绑定不在此列。

### 覆盖范围

- **传统 ML**: 线性回归、特征工程、模型序列化、模型服务
- **神经网络**: 简单神经网络、反向传播、Tensor 运算
- **量子计算**: 量子模拟、量子门、量子算法（Grover、Shor）
- **数值计算**: 科学计算、统计推断、优化算法

### 关联资源

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码实验室 | `jsts-code-lab/76-ml-engineering/` | ML Pipeline、特征工程、模型服务 |
| 代码实验室 | `jsts-code-lab/77-quantum-computing/` | 量子模拟器、量子门、量子算法 |

---

## 🗺️ 跨领域导航

### 按场景快速定位

| 业务场景 | 推荐入口 |
|----------|----------|
| 我要做一个 AI 聊天应用 | `jsts-code-lab/33-ai-integration/` → `examples/ai-agent-production/` |
| 我要做一个移动端 App | `examples/mobile-react-native-expo/` → `docs/platforms/MOBILE_DEVELOPMENT.md` |
| 我要做一个桌面应用 | `examples/desktop-tauri-react/` → `docs/platforms/DESKTOP_DEVELOPMENT.md` |
| 我要接入区块链 | `jsts-code-lab/34-blockchain-web3/` → `jsts-code-lab/83-blockchain-advanced/` |
| 我要做实时协作功能 | `jsts-code-lab/30-real-time-communication/` |
| 我要做 VR/AR 体验 | `jsts-code-lab/84-webxr/` |
| 我要部署到边缘 | `jsts-code-lab/93-deployment-edge-lab/` → `jsts-code-lab/32-edge-computing/` |
| 我要做数据可视化大屏 | `jsts-code-lab/58-data-visualization/` → `docs/platforms/DATA_VISUALIZATION.md` |
| 我要构建低代码平台 | `jsts-code-lab/97-lowcode-platform/` |
| 我要做 PWA | `jsts-code-lab/37-pwa/` |

### 与基础设施的边界

```
应用层 (Application Domains)          基础设施层 (Infrastructure)
├─ AI 应用 (聊天、Agent)               ├─ AI SDK / 模型 API
├─ 移动端 App                          ├─ React Native / Expo CLI
├─ 桌面端应用                          ├─ Tauri / Electron 框架
├─ DApp / Web3 应用                    ├─ Ethers.js / 节点服务
├─ 实时协作应用                        ├─ WebSocket 库 / 信令服务
├─ VR/AR 应用                          ├─ Three.js / WebXR API
├─ 边缘函数应用                        ├─ Cloudflare Workers Runtime
├─ 低代码平台产品                      ├─ 组件库 / 构建工具
└─ 可视化仪表盘                        └─ D3.js / ECharts 库
```

**区分原则**: 应用领域关注"用这些技术构建什么产品"；基础设施关注"这些技术本身如何工作、如何选型"。

---

> 📅 最后更新: 2026-04-27
> 📝 维护说明: 本索引每 6 个月 review 一次，新应用领域模块加入时需同步更新此文件

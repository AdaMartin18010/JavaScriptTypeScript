# jsts-code-lab 应用领域模块总览

> 本文件汇总 `jsts-code-lab/` 中所有属于**应用领域（Application Domains）**维度的模块。应用领域指 JavaScript/TypeScript 被用于解决特定行业或场景问题的技术方向。

---

## 应用领域模块清单

### 🤖 AI 与 Agent 应用

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `33-ai-integration` | AI 集成 | LLM API、Prompt 工程、Embedding、RAG、Streaming | ⭐⭐⭐⭐ |
| `55-ai-testing` | AI 辅助测试 | 测试生成、突变测试、LLM-as-Judge、视觉回归 | ⭐⭐⭐⭐ |
| `56-code-generation` | 代码生成 | AST 转换、AI 工作流、OpenAPI 生成、模板引擎 | ⭐⭐⭐⭐ |
| `76-ml-engineering` | ML 工程 | 线性回归、神经网络、Tensor 运算、模型服务 | ⭐⭐⭐⭐⭐ |
| `82-edge-ai` | 边缘 AI | 边缘推理、模型量化、ONNX Runtime、WebNN/WebGPU | ⭐⭐⭐⭐⭐ |
| `85-nlp-engineering` | NLP 工程 | BPE 分词、情感分析、NER、语义搜索、文本分类 | ⭐⭐⭐⭐ |
| `89-autonomous-systems` | 自主系统 | BDI Agent、行为树、规则引擎、任务调度 | ⭐⭐⭐⭐⭐ |
| `94-ai-agent-lab` | AI Agent 实战 | MCP Server、多 Agent 工作流、Agent 记忆、工具调用 | ⭐⭐⭐⭐⭐ |

**示例项目**: `examples/ai-agent-production/` — 生产级 AI Agent 系统（Mastra + MCP）

---

### 📱 移动端与桌面端

> 注：jsts-code-lab 中无独立的移动端/桌面端模块，相关代码示例位于 `examples/` 目录。

| 路径 | 技术栈 | 说明 |
|------|--------|------|
| `examples/mobile-react-native-expo/` | React Native + Expo | 跨平台移动应用完整示例 |
| `examples/desktop-tauri-react/` | Tauri + React | 轻量级桌面应用 |

**文档**: `docs/platforms/MOBILE_DEVELOPMENT.md` | `docs/platforms/DESKTOP_DEVELOPMENT.md`

---

### ⛓️ Web3 与区块链

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `34-blockchain-web3` | 区块链与 Web3 | 智能合约交互、Web3.js/Ethers.js、钱包集成 | ⭐⭐⭐⭐ |
| `83-blockchain-advanced` | 高级区块链 | Layer 2、Rollup、跨链桥、零知识证明 | ⭐⭐⭐⭐⭐ |

---

### 📡 实时通信

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `30-real-time-communication` | 实时通信 | WebSocket、SSE、WebRTC、实时架构 | ⭐⭐⭐⭐ |

---

### 🎮 游戏与沉浸式图形

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `84-webxr` | WebXR | XR 引擎、空间追踪、手势识别、场景图 | ⭐⭐⭐⭐⭐ |
| `58-data-visualization` | 数据可视化 | SVG/Canvas 渲染、图表架构、动画、交互 | ⭐⭐⭐⭐ |

---

### ⚡ 边缘与 Serverless

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `31-serverless` | Serverless | FaaS、冷启动优化、事件驱动、状态管理 | ⭐⭐⭐⭐ |
| `32-edge-computing` | 边缘计算 | Edge Runtime、V8 Isolate、Durable Objects | ⭐⭐⭐⭐⭐ |
| `93-deployment-edge-lab` | 部署与边缘实战 | Cloudflare Workers、Vercel Edge、Docker 优化 | ⭐⭐⭐⭐ |

**示例项目**:
- `examples/edge-ai-inference/` — 边缘 AI 推理
- `examples/edge-observability-starter/` — 边缘可观测性

---

### 🧩 低代码与可视化

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `37-pwa` | PWA | Service Worker、缓存策略、Manifest、后台同步 | ⭐⭐⭐ |
| `97-lowcode-platform` | 低代码平台 | 可视化设计器、Schema 驱动、代码生成、工作流 | ⭐⭐⭐⭐⭐ |
| `58-data-visualization` | 数据可视化 | 图表渲染、数据分箱、动画、可交互仪表盘 | ⭐⭐⭐⭐ |

---

### 🔬 ML 工程与科学计算

| 模块编号 | 模块名称 | 核心内容 | 复杂度 |
|----------|----------|----------|--------|
| `76-ml-engineering` | ML 工程 | 特征工程、神经网络、模型序列化、Tensor 运算 | ⭐⭐⭐⭐⭐ |
| `77-quantum-computing` | 量子计算 | 量子模拟、量子门、量子算法（Grover/Shor） | ⭐⭐⭐⭐⭐ |

---

## 快速导航

```
按业务场景选择模块：
├─ AI 聊天/Agent → 33-ai-integration → 94-ai-agent-lab
├─ 移动端 App → examples/mobile-react-native-expo/
├─ 桌面应用 → examples/desktop-tauri-react/
├─ 区块链 DApp → 34-blockchain-web3 → 83-blockchain-advanced
├─ 实时协作 → 30-real-time-communication
├─ VR/AR 体验 → 84-webxr
├─ 数据大屏 → 58-data-visualization
├─ 边缘部署 → 93-deployment-edge-lab → 32-edge-computing
├─ 低代码平台 → 97-lowcode-platform
├─ PWA → 37-pwa
└─ AI 测试 → 55-ai-testing
```

---

## 与基础设施模块的区分

以下模块**不属于**应用领域，请勿在此总览中查找：

| 维度 | 示例模块 |
|------|----------|
| 语言核心 | `00-language-core`, `01-ecmascript-evolution` |
| 设计模式 | `02-design-patterns` |
| 基础设施 | `22-deployment-devops`, `23-toolchain-configuration` |
| 安全基础 | `21-api-security`, `38-web-security` |
| 数据库 | `20-database-orm`, `96-orm-modern-lab` |
| 前端框架 | `18-frontend-frameworks`, `51-ui-components` |
| 分布式系统 | `70-distributed-systems`, `71-consensus-algorithms` |
| 编译器 | `79-compiler-design` |
| 形式化方法 | `40-type-theory-formal`, `80-formal-verification` |

完整索引请参见: `docs/application-domains-index.md`

---

> 📅 最后更新: 2026-04-27
> 📝 维护说明: 新应用领域模块加入时，需同步更新本文件和 `docs/application-domains-index.md`

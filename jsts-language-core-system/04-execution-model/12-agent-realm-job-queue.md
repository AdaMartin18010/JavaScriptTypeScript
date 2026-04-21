# Agent / Realm / Job Queue

> ECMAScript 规范层面的执行抽象模型

---

## 内容大纲（TODO）

### 1. Agent（执行代理）

- 定义：具有独立事件循环的执行线程
- Agent Cluster 与 SharedArrayBuffer
- 同步阻塞能力

### 2. Realm（领域）

- 定义：具有独立全局环境的作用域
- Realm 记录（Realm Record）
- iframe / Worker 中的 Realm

### 3. Job Queue（任务队列）

- ScriptJobs / PromiseJobs 的规范定义
- 与 HTML Event Loop 的映射

### 4. 执行上下文栈（Execution Context Stack）

- 规范中的执行栈管理
- Suspend / Resume 语义

### 5. 规范算法步骤

- 抽象操作的执行模型
- Completion Record 的传播

### 6. 与宿主环境的关系

- 浏览器：Window / WorkerGlobalScope
- Node.js：vm.Module / vm.Script

# Svelte 专题 Mermaid 图表增强计划

## 目标文件与图表清单

### 12-svelte-language-complete.md（语法大全）

1. **Runes 依赖关系图** — `graph LR` 展示 $state/$derived/$effect/$props 关系
2. **指令编译流程图** — `flowchart TD` 展示 bind:/on:/use: 的编译转换流程
3. **Store 生命周期状态图** — `stateDiagram-v2` 展示 writable store 的生命周期

### 13-component-patterns.md（组件模式）

1. **组件组合模式图** — `flowchart TD` 展示 Snippet 组合层次
2. **Action 生命周期时序图** — `sequenceDiagram` 展示 mount/update/destroy
3. **组件库架构层次图** — `graph TD` 展示 Design Tokens → 主题 → 组件 → 页面

### 14-reactivity-deep-dive.md（响应式原理）

1. **依赖追踪算法流程图** — `flowchart TD` 展示 track → 建立依赖 → 通知 → 执行
2. **Signal-Effect-Derived 关系图** — `graph TD` 展示运行时数据结构关系
3. **更新调度时序图** — `sequenceDiagram` 展示 $state.set → 批处理 → 拓扑排序 → 执行
4. **编译转换对比图** — `flowchart LR` 展示源码 → AST → 编译输出

### 15-application-scenarios.md（应用场景）

1. **选型决策树** — `flowchart TD` 替换现有 ASCII 决策树
2. **项目规模适配图** — `flowchart TD` 展示 原型→小型→中型→大型 演进

### 18-ssr-hydration-internals.md（SSR原理）

1. **SSR 渲染流水线** — `flowchart TD` 展示 8 阶段完整流程
2. **Hydration 状态转换图** — `stateDiagram-v2` 展示 HTML → Hydrating → Interactive
3. **Streaming SSR 时序图** — `sequenceDiagram` 展示 服务端流 → 占位符 → 内容替换

### index.md（专题首页）

1. **技术栈架构图** — `flowchart TD` 替换现有 ASCII 架构图

## 实施规则

- 图表必须包裹在 ```mermaid 代码块中
- 节点使用中文标签
- 避免在 Mermaid 中使用 `<` 或 `>` 特殊字符（Vue 会解析）
- 每个图表前添加简短说明文字
- 图表后添加解读文字

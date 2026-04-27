# 工作流引擎基础

> 文件: `04-workflow-engine.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 工作流引擎架构

```
定义层 (Definition)
├── 流程模型 (BPMN-like DAG)
├── 节点类型 (Task / Approval / Condition / Parallel)
├── 边与条件表达式
└── 变量声明

执行层 (Runtime)
├── 流程实例 (Instance)
├── 状态机 (State Machine)
├── 任务调度器
└── 事件总线

扩展层 (Extension)
├── 任务处理器注册
├── 审批动作 API
├── 定时器 / 延时节点
└── 子流程调用
```

---

## 节点类型

| 类型 | 功能 | 典型用途 |
|------|------|----------|
| `start` | 流程起点 | 初始化变量 |
| `end` | 流程终点 | 清理资源 |
| `task` | 自动任务 | 发送邮件、调用 API、数据处理 |
| `approval` | 人工审批 | 需要用户确认的节点 |
| `condition` | 条件分支 | if/else 路由 |
| `parallel` | 并行分支 | 同时执行多个任务 |
| `delay` | 延时节点 | 定时触发 |
| `subprocess` | 子流程 | 复用已有流程 |

---

## 条件表达式

工作流使用 JavaScript 表达式进行条件判断：

```typescript
// 条件边配置
{
  from: 'check',
  to: 'hr',
  condition: 'vars.amount > 10000 && vars.department === "sales"',
  priority: 1
}
```

### 安全沙箱（生产环境必需）

```typescript
// ❌ 危险：直接使用 new Function
const result = new Function('vars', `return ${expression}`)(variables);

// ✅ 安全：使用受限表达式解析器
import { createExpressionEvaluator } from 'safe-evaluator';
const evaluator = createExpressionEvaluator({
  allowedOperators: ['+', '-', '*', '/', '>', '<', '===', '&&', '||'],
  allowedFunctions: ['Math.max', 'Math.min'],
});
const result = evaluator.evaluate(expression, variables);
```

---

## 审批节点状态流转

```
active → pending ──(approve)──> completed
            │
            └──(reject)──> failed
```

---

## 参考资源

- [BPMN 2.0 规范](https://www.omg.org/spec/BPMN/)
- [Temporal.io](https://temporal.io/) — 可靠的工作流编排平台
- [Camunda BPM](https://camunda.com/)
- [Airflow / Dagster](https://dagster.io/) — 数据管道工作流

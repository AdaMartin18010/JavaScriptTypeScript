# 学习路径里程碑验证机制

> **定位**：`30-knowledge-base/30.9-learning-paths/`
> **新增**：2026-04

---

## 一、验证机制设计

传统的「推荐阅读列表」式学习路径缺乏**掌握程度验证**。本机制为每条路径设置 Checkpoint 项目 + 自测题，形成「能力成长地图」。

---

## 二、初学者路径（4-6 周）

### Week 1-2：语言核心

**Checkpoint 1：类型系统挑战**

```typescript
// 自测题：修复以下类型错误
function processData(data: any) {
  return data.map(x => x.toUpperCase());
}
// 要求：
// 1. 将 data 类型从 any 改为安全的泛型约束
// 2. 处理可能的 null/undefined
// 3. 返回类型自动推导
```

**验证标准**：

- [ ] 代码通过 `tsc --strict` 无错误
- [ ] 理解 `unknown` vs `any` 的差异
- [ ] 能解释类型守卫（type guard）的工作原理

### Week 3-4：异步与框架

**Checkpoint 2：异步控制流**

```typescript
// 自测题：实现并发限制器
async function fetchWithLimit(urls: string[], limit: number): Promise<Response[]> {
  // 要求：同时最多进行 limit 个请求
}
```

**验证标准**：

- [ ] 实现正确，无竞态条件
- [ ] 能解释宏任务与微任务的执行顺序
- [ ] 能使用 AbortController 实现请求取消

### Week 5-6：全栈项目

**Checkpoint 3：Todo 全栈应用**

**项目要求**：

- 前端：React + TypeScript
- 后端：Node.js/Bun + REST API
- 数据库：SQLite/Turso
- 部署：边缘函数

**验证标准**：

- [ ] 端到端类型安全
- [ ] 通过所有单元测试
- [ ] Lighthouse 性能评分 > 90

---

## 三、进阶工程师路径（6-8 周）

### Milestone 1：性能优化

**Checkpoint：React 性能审计**

- 使用 React DevTools Profiler 识别重渲染组件
- 实现虚拟列表（10,000+ 项）
- INP 优化至 < 200ms

### Milestone 2：架构设计

**Checkpoint：Monorepo 类型架构**

- 设计 3+ 包的 Monorepo
- 使用 TypeScript Project References
- 禁止循环依赖（通过 CI 检查）

### Milestone 3：AI 集成

**Checkpoint：AI Agent 原型**

- 集成 MCP 协议
- 实现工具调用（Function Calling）
- 流式响应 + 类型安全

---

## 四、架构师路径（8-12 周）

### Milestone 1：形式化基础

**Checkpoint：阅读 ECMA-262 规范**

- 能追踪 `Promise.then` 的规范算法步骤
- 理解 Completion Record 的传播机制
- 能解释 V8 的 Hidden Class 优化原理

### Milestone 2：运行时选型

**Checkpoint：运行时对比报告**

- 为给定业务场景选择最优运行时（Node/Bun/Deno）
- 编写基准测试验证假设
- 设计混合运行时架构

### Milestone 3：安全审计

**Checkpoint：供应链安全分析**

- 生成项目的 SBOM
- 识别间接依赖中的已知漏洞
- 设计权限最小化的运行时部署

---

## 五、自测题库（示例）

### 类型系统

**Q1**：以下代码的输出是什么？为什么？

```javascript
console.log([] + {});
console.log({} + []);
```

**答案**：`"[object Object]"` 和 `"[object Object]"`。`+` 运算符触发 ToPrimitive，对象转为字符串 `"[object Object]"`，数组转为空字符串 `""`。

### 异步

**Q2**：以下代码的输出顺序是什么？

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

**答案**：`1, 4, 3, 2`。同步代码先执行，然后是微任务（Promise），最后是宏任务（setTimeout）。

### 性能

**Q3**：为什么 `transform: translate()` 动画比 `top` 动画流畅？

**答案**：`transform` 触发仅合成路径（Composite），由 GPU 处理；`top` 触发完整渲染管道（Layout + Paint + Composite），计算量更大。

---

*本机制为学习路径提供可验证的掌握标准，确保知识转化为能力。*

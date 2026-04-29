---
last-updated: 2026-04-29
status: archived
redirect: ./beginners-path.md
---

> **四维分类说明**：本路径以「语言核心」和「框架生态」两个维度为主，适合零基础到能独立构建简单 Web 应用的开发者。

# 初学者学习路径（已迁移）

> 本文档内容已整合至 [`beginners-path.md`](./beginners-path.md)，作为单一事实来源维护。
> 原 157 行内容已合并到 443 行的完整版本中。

---

## 学习阶段演进表

| 阶段 | 周期 | 核心目标 | 关键技术栈 | 里程碑验证 |
|------|------|----------|------------|------------|
| **HTML / CSS 基础** | 1–2 周 | 理解语义化标记与盒模型 | HTML5, CSS3, Flexbox, Grid | 独立还原一个静态 landing page |
| **JavaScript 核心** | 2–3 周 | 掌握 ECMAScript 基础与异步编程 | ES2024, DOM API, Fetch, async/await | 实现一个带数据交互的 Todo 应用 |
| **TypeScript 入门** | 1–2 周 | 静态类型思维与接口设计 | TS 5.x, 类型推断, 泛型基础 | 将 JS Todo 应用迁移至 TS |
| **前端框架** | 2–3 周 | 组件化思维与状态管理 | React 19 / Vue 3, Hooks/Composition API | 构建一个多路由、有状态管理的 SPA |
| **全栈基础** | 2–3 周 | 端到端数据流与部署 | Node.js, Express/Nest, DB (SQLite/PostgreSQL), Vercel/Render | 部署一个 CRUD 全栈应用到生产环境 |

---

## 各阶段核心知识点

| 阶段 | 必会概念 | 必会工具 |
|------|----------|----------|
| HTML/CSS | 语义化标签、可访问性 (a11y)、响应式设计、CSS 变量 | VS Code, DevTools, Figma (基础) |
| JavaScript | 闭包、原型链、事件循环、Promise、ES Modules | Node.js, Chrome DevTools, npm |
| TypeScript | 接口 vs 类型别名、泛型约束、类型收窄、配置 `tsconfig.json` | tsc, ts-node, @total-typescript/exercise-cli |
| 前端框架 | 虚拟 DOM、单向数据流、副作用管理、路由守卫 | Vite, pnpm, React DevTools / Vue DevTools |
| 全栈 | REST/GraphQL、JWT 认证、数据库建模、CI/CD 基础 | Git, GitHub Actions, Docker (基础), Prisma/Drizzle |

---

## 代码示例

### 阶段 2：JavaScript 核心 — 事件循环可视化

```javascript
console.log('1. sync');
setTimeout(() => console.log('2. macrotask'), 0);
Promise.resolve().then(() => console.log('3. microtask'));
console.log('4. sync end');
// 输出顺序：1 → 4 → 3 → 2
```

### 阶段 3：TypeScript 入门 — 类型守卫实践

```typescript
interface Cat {
  kind: 'cat';
  meow(): void;
}
interface Dog {
  kind: 'dog';
  bark(): void;
}
type Animal = Cat | Dog;

function makeSound(animal: Animal) {
  switch (animal.kind) {
    case 'cat':
      animal.meow();
      break;
    case 'dog':
      animal.bark();
      break;
    default:
      const _exhaustive: never = animal; // 穷尽检查
  }
}
```

### 阶段 4：前端框架 — React Hook 组合

```typescript
import { useState, useCallback } from 'react';

function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  return { count, increment, decrement };
}

export default function Counter() {
  const { count, increment, decrement } = useCounter(0);
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### 阶段 5：全栈基础 — Express + TypeScript 最小 API

```typescript
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

app.get('/api/todos', (_req: Request, res: Response) => {
  res.json(todos);
});

app.post('/api/todos', (req: Request<{}, {}, Omit<Todo, 'id'>>, res: Response) => {
  const todo: Todo = { id: Date.now(), ...req.body };
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));
```

---

## 推荐资源链接

| 阶段 | 类型 | 资源名称 | 链接 | 说明 |
|------|------|----------|------|------|
| HTML/CSS | 免费教程 | MDN Web Docs — HTML & CSS | [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Learn) | Mozilla 官方，最权威参考 |
| HTML/CSS | 互动练习 | freeCodeCamp — Responsive Web Design | [freecodecamp.org](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | 项目驱动，认证免费 |
| HTML/CSS | 指南 | web.dev — Learn CSS | [web.dev/learn/css](https://web.dev/learn/css/) | Google 出品，现代 CSS 最佳实践 |
| JavaScript | 免费教程 | JavaScript.info | [javascript.info](https://javascript.info/) | 现代 JS 深度教程，覆盖 ES2024 |
| JavaScript | 书籍 | *Eloquent JavaScript* (Marijn Haverbeke) | [eloquentjavascript.net](https://eloquentjavascript.net/) | 开源书籍，从基础到 Node.js |
| JavaScript | 视频 | JavaScript: The Hard Parts (Frontend Masters) | [frontendmasters.com](https://frontendmasters.com/courses/javascript-hard-parts/) | 异步与闭包深度讲解 |
| JavaScript | 官方规范 | ECMA-262 | [tc39.es/ecma262](https://tc39.es/ecma262/) | 语言规范原文 |
| TypeScript | 官方教程 | TypeScript Handbook | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/handbook/intro.html) | 微软官方，持续更新 |
| TypeScript | 互动练习 | Total TypeScript (Matt Pocock) | [totaltypescript.com](https://www.totaltypescript.com/) | 从初学者到专家的类型体操 |
| TypeScript | 书籍 | *Effective TypeScript* (Dan Vanderkam) | [effectivetypescript.com](https://effectivetypescript.com/) | 50 条具体建议 |
| TypeScript | 配置参考 | TSConfig Cheat Sheet | [tsconfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet) | 推荐配置速查 |
| 前端框架 | 官方文档 | React Docs (new) | [react.dev](https://react.dev/) | React 团队重写，Hooks 优先 |
| 前端框架 | 官方文档 | Vue.js Guide | [vuejs.org](https://vuejs.org/guide/introduction.html) | 渐进式框架最佳入门 |
| 前端框架 | 工具 | Vite 官方文档 | [vitejs.dev](https://vitejs.dev/) | 下一代前端构建工具 |
| 全栈 | 教程 | Next.js Learn | [nextjs.org/learn](https://nextjs.org/learn) | 基于 App Router 的全栈教程 |
| 全栈 | 教程 | The Odin Project — Full Stack JavaScript | [theodinproject.com](https://www.theodinproject.com/paths/full-stack-javascript) | 开源免费，项目驱动 |
| 全栈 | 工具 | Prisma ORM 入门 | [prisma.io/docs](https://www.prisma.io/docs/getting-started) | 类型安全的数据库访问 |
| 全栈 | 工具 | Drizzle ORM | [orm.drizzle.team](https://orm.drizzle.team/) | 轻量类型安全 ORM |
| 工程化 | 工具 | Git 官方文档 | [git-scm.com/doc](https://git-scm.com/doc) | 版本控制基础 |
| 工程化 | 指南 | Conventional Commits | [conventionalcommits.org](https://www.conventionalcommits.org/) | 规范化提交信息 |
| 工程化 | 工具 | Node.js 官方文档 | [nodejs.org/docs](https://nodejs.org/docs/latest/api/) | 服务端 JS 权威参考 |

---

## 里程碑验证机制

| 里程碑 | 要求 | 参考实现 |
|--------|------|----------|
| **静态页面** | 语义化 HTML、响应式布局、 Lighthouse 评分 >90 | [MDN Assessments](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Structuring_a_page_of_content) |
| **JS Todo** | CRUD、本地存储/JSON Server、事件委托 | [TodoMVC](https://todomvc.com/) |
| **TS 迁移** | 零 `any`、严格模式 `strict: true`、接口定义完整 | [Total TypeScript Tutorials](https://www.totaltypescript.com/tutorials) |
| **SPA 应用** | 路由、全局状态、表单验证、错误边界 | [RealWorld Example Apps](https://codebase.show/projects/realworld) |
| **全栈部署** | 认证、数据库、API、自动化部署、HTTPS | [Next.js Commerce](https://github.com/vercel/commerce) |

---

## 学习路线图 (Mermaid)

```text
HTML/CSS ──► JavaScript Core ──► TypeScript ──► Frontend Framework ──► Fullstack Basics
   │               │                │                  │                      │
   ▼               ▼                ▼                  ▼                      ▼
Landing      Todo App (JS)    Migrate to TS      Multi-route SPA       Deployed CRUD
  Page         + Fetch          + Strict Mode        + State Mgmt           App
```

---

## 快速导航

- [TypeScript 基础](./beginners-path.md#第一阶段typescript-基础-1-2-周)
- [设计模式入门](./beginners-path.md#第二阶段设计模式入门-1-2-周)
- [测试驱动开发](./beginners-path.md#第三阶段测试驱动开发-1-周)
- [前端框架入门](./beginners-path.md#第四阶段前端框架入门-1-2-周)
- [里程碑验证机制](./beginners-path.md#里程碑验证机制)

---

> 📦 归档说明：本文档作为兼容性入口保留，不再独立更新。所有初学者路径内容请访问上述链接。

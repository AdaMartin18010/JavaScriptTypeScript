# 🎯 Todo Master — 零基础到部署的渐进式实战教程

> **JavaScript / TypeScript 全景知识库** 官方配套教程
> 通过 6 个渐进式里程碑，从零构建一个功能完整的 Todo 应用，掌握现代前端开发核心技能。

---

## 📖 第一章：项目概述与学习目标

### 1.1 项目介绍

本项目专为**零基础或初级开发者**设计，采用「渐进式增强」的教学理念：

- **不跳步**：每一里程碑都基于上一里程碑演化，代码可追踪
- **可运行**：每个里程碑都是独立可运行的完整项目
- **重基础**：强调语言核心（JS/TS）与工程思维，而非框架 API 背诵
- **真实战**：最终产物可直接部署到生产环境（Vercel）

### 1.2 你将学会什么

| 阶段 | 技能 | 工程思维 |
|------|------|----------|
| Milestone 1 | 原生 JS、DOM API、ES6+ 语法 | 事件委托、模块化拆分 |
| Milestone 2 | TypeScript 类型系统 | 类型安全、接口设计 |
| Milestone 3 | React 18、JSX、Hooks | 组件化思维、单向数据流 |
| Milestone 4 | useReducer、Context API | 状态设计模式、中间件思想 |
| Milestone 5 | Vitest、Testing Library | TDD、测试用例设计 |
| Milestone 6 | Vite、Vercel、GitHub Actions | CI/CD、现代部署流程 |

### 1.3 学习路线图速览

| 里程碑 | 主题 | 预计用时 | 核心产出 |
|--------|------|----------|----------|
| 01 | Vanilla JS + DOM | 2-3 小时 | 可交互的 Todo 页面 |
| 02 | TypeScript 迁移 | 1-2 小时 | 类型安全的代码 |
| 03 | React 组件化 | 2-3 小时 | 组件化 Todo 应用 |
| 04 | 状态管理 | 2-3 小时 | 带筛选的全局状态应用 |
| 05 | 测试驱动 | 2-3 小时 | 高测试覆盖率的代码 |
| 06 | 构建与部署 | 1-2 小时 | 线上可访问的应用 |

> 总预计用时：**10-16 小时**，建议分 2-3 天完成。

---

## 🚀 第二章：环境准备

### 2.1 Node.js 安装与版本管理

本项目要求 **Node.js >= 18.0.0**。推荐使用 [nvm](https://github.com/nvm-sh/nvm)（Windows 用户可使用 [nvm-windows](https://github.com/coreybutler/nvm-windows)）管理 Node.js 版本：

```bash
# 安装 Node.js 18
nvm install 18
nvm use 18

# 验证版本
node -v    # v18.x.x 或更高
npm -v     # 9.x.x 或更高
```

### 2.2 包管理器选择

本项目支持 `npm`、`pnpm` 和 `yarn`。推荐使用 `npm`（v9+）：

```bash
# 设置国内镜像（可选，加速下载）
npm config set registry https://registry.npmmirror.com

# 或使用 corepack 启用 pnpm
corepack enable pnpm
```

### 2.3 编辑器与插件

推荐使用 [VS Code](https://code.visualstudio.com/)，安装以下插件：

- **ESLint** — 代码规范检查
- **Prettier** — 代码格式化
- **TypeScript Importer** — 自动导入类型

### 2.4 Git 基础

确保已安装 Git，了解基本的 `clone`、`commit`、`push` 操作：

```bash
git --version
git clone <repository-url>
```

---

## 🛠️ 第三章：分步实现指南

### 3.1 里程碑 1：原生 JavaScript + DOM

#### 3.1.1 创建项目骨架

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo Master - Milestone 1</title>
  <link rel="stylesheet" href="src/style.css">
</head>
<body>
  <div class="container">
    <h1>📝 Todo Master</h1>
    <p class="subtitle">里程碑 1：原生 JavaScript</p>

    <form id="todo-form">
      <input type="text" id="todo-input" placeholder="输入待办事项，按回车添加..." autocomplete="off">
      <button type="submit">添加</button>
    </form>

    <ul id="todo-list"></ul>

    <footer class="stats">
      <span id="todo-count">0 个待办 / 共 0 项</span>
      <button id="clear-completed" hidden>清除已完成</button>
    </footer>
  </div>

  <script type="module" src="src/app.js"></script>
</body>
</html>
```

#### 3.1.2 模块化拆分

将功能拆分为三个模块：`app.js`（业务逻辑）、`dom-utils.js`（DOM 操作）、`storage.js`（本地存储）。

```javascript
// src/app.js — 应用入口模块
import { loadTodos, saveTodos } from './storage.js';
import { renderTodoList, updateStats } from './dom-utils.js';

// ===== DOM 元素引用 =====
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('todo-count');
const clearBtn = document.getElementById('clear-completed');

// ===== 状态 =====
// 应用运行时的内存状态，所有修改先改这里，再同步到 localStorage
let todos = loadTodos();

// ===== 初始化渲染 =====
renderTodoList(todos, list);
updateStats(todos, countEl, clearBtn);

// ===== 事件处理 =====

/**
 * 添加新 Todo
 */
form.addEventListener('submit', (event) => {
  // 阻止表单默认刷新行为
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now(), // 用时间戳生成唯一 ID（简单场景足够）
    text,
    completed: false,
  };

  // 不可变更新：创建新数组，而非 push 到原数组
  todos = [...todos, newTodo];

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);

  // 重置输入框
  input.value = '';
  input.focus();
});

/**
 * 列表点击事件委托
 * 一个监听器处理：标记完成、删除
 */
list.addEventListener('click', (event) => {
  const target = event.target;

  // 点击删除按钮
  if (target.matches('.delete-btn')) {
    const li = target.closest('.todo-item');
    const id = Number(li.dataset.id);

    todos = todos.filter(todo => todo.id !== id);

    saveTodos(todos);
    renderTodoList(todos, list);
    updateStats(todos, countEl, clearBtn);
    return;
  }

  // 点击复选框（标记完成/未完成）
  if (target.matches('.toggle')) {
    const li = target.closest('.todo-item');
    const id = Number(li.dataset.id);

    // 不可变更新：map 返回新数组
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: target.checked } : todo
    );

    saveTodos(todos);
    // 仅更新对应项的样式，而非全量重渲染（性能优化示例）
    li.classList.toggle('completed', target.checked);
    updateStats(todos, countEl, clearBtn);
    return;
  }
});

/**
 * 清除所有已完成 Todo
 */
clearBtn.addEventListener('click', () => {
  todos = todos.filter(todo => !todo.completed);

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);
});
```

```javascript
// src/dom-utils.js — DOM 操作工具模块
/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 创建单个 Todo 元素的 DOM 节点
 */
export function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = String(todo.id);

  li.innerHTML = `
    <input type="checkbox" class="toggle" ${todo.completed ? 'checked' : ''} aria-label="标记完成">
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn" aria-label="删除">删除</button>
  `;

  return li;
}

/**
 * 渲染整个 Todo 列表
 */
export function renderTodoList(todos, listEl) {
  listEl.innerHTML = '';

  if (todos.length === 0) {
    listEl.innerHTML = '<li class="empty-state">暂无待办事项，添加一个吧！✨</li>';
    return;
  }

  // 使用 DocumentFragment 批量插入，减少重排（Reflow）
  const fragment = document.createDocumentFragment();
  for (const todo of todos) {
    fragment.appendChild(createTodoElement(todo));
  }
  listEl.appendChild(fragment);
}
```

#### 3.1.3 运行方式

```bash
cd milestone-01-vanilla-js
npx serve src
# 访问 http://localhost:3000
```

---

### 3.2 里程碑 2：迁移到 TypeScript

#### 3.2.1 类型定义

```typescript
// src/types.ts
/** 单个 Todo 项的数据结构 */
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/** 筛选条件 */
export type FilterType = 'all' | 'active' | 'completed';
```

#### 3.2.2 类型注解与编译配置

```typescript
// src/app.ts
import { Todo } from './types';

function addTodo(todos: Todo[], text: string): Todo[] {
  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
  };
  return [...todos, newTodo];
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

#### 3.2.3 运行方式

```bash
cd milestone-02-typescript
npm install
npm run dev
# 访问 http://localhost:5173
```

---

### 3.3 里程碑 3：React 组件化重构

#### 3.3.1 组件拆分策略

将应用拆分为三个组件：
- `TodoForm` — 输入表单
- `TodoList` — 列表容器
- `TodoItem` — 单个项

#### 3.3.2 根组件与状态管理

```tsx
// src/App.tsx
import { useState, useEffect } from 'react';
import { Todo } from './types';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

const STORAGE_KEY = 'todo-master:m3';

/** 从 localStorage 加载 */
function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

/** 保存到 localStorage */
function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function App() {
  // useState 初始化时只执行一次，用函数形式避免每次渲染都读取 localStorage
  const [todos, setTodos] = useState<Todo[]>(loadTodos);

  // 副作用：todos 变化时自动持久化
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="container">
      <h1>📝 Todo Master</h1>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}
```

#### 3.3.3 受控组件示例

```tsx
// src/components/TodoForm.tsx
import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="输入待办事项，按回车添加..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">添加</button>
    </form>
  );
}
```

#### 3.3.4 性能优化：React.memo

```tsx
// src/components/TodoItem.tsx
import { memo } from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
      />
      <span>{todo.text}</span>
      <button onClick={onDelete}>删除</button>
    </li>
  );
}

export default memo(TodoItem);
```

---

### 3.4 里程碑 4：useReducer + Context 状态管理

#### 3.4.1 Reducer 纯函数设计

```tsx
// src/reducer.ts
import { Todo, FilterType } from './types';

export interface State {
  todos: Todo[];
  filter: FilterType;
}

export type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; payload: FilterType };

export const initialState: State = {
  todos: [],
  filter: 'all',
};

export function todoReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodo: Todo = {
        id: Date.now(),
        text: action.payload,
        completed: false,
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
      };
    }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    }

    case 'CLEAR_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload,
      };
    }

    default:
      return state;
  }
}
```

#### 3.4.2 Context Provider

```tsx
// src/context.tsx
import { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { State, Action, todoReducer, initialState } from './reducer';

const STORAGE_KEY = 'todo-master:m4';

interface TodoContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      return { ...initialState, ...parsed };
    }
  } catch {
    // 忽略解析错误
  }
  return initialState;
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadState);

  // 中间件：状态变化时自动持久化到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo 必须在 TodoProvider 内部使用');
  }
  return context;
}
```

#### 3.4.3 筛选功能实现

```tsx
// src/components/FilterBar.tsx
import { useTodo } from '../context';

export default function FilterBar() {
  const { state, dispatch } = useTodo();

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ] as const;

  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          key={f.key}
          className={state.filter === f.key ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: f.key })}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

---

### 3.5 里程碑 5：测试驱动开发（TDD）

#### 3.5.1 Reducer 单元测试

```tsx
// src/__tests__/todoReducer.test.ts
import { describe, it, expect } from 'vitest';
import { todoReducer, initialState, selectFilteredTodos, State } from '../reducer';

describe('todoReducer', () => {
  describe('ADD_TODO', () => {
    it('应该添加新的 Todo 到列表末尾', () => {
      const state = todoReducer(initialState, {
        type: 'ADD_TODO',
        payload: '学习 TypeScript',
      });

      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].text).toBe('学习 TypeScript');
      expect(state.todos[0].completed).toBe(false);
    });

    it('不应该修改原始状态（不可变更新）', () => {
      const original = initialState.todos;
      const state = todoReducer(initialState, {
        type: 'ADD_TODO',
        payload: '测试不可变性',
      });

      expect(state.todos).not.toBe(original);
      expect(initialState.todos).toHaveLength(0);
    });
  });

  describe('TOGGLE_TODO', () => {
    it('应该切换指定 Todo 的完成状态', () => {
      const startState: State = {
        todos: [{ id: 1, text: '已有事项', completed: false }],
        filter: 'all',
      };

      const state = todoReducer(startState, {
        type: 'TOGGLE_TODO',
        payload: 1,
      });

      expect(state.todos[0].completed).toBe(true);
    });
  });
});
```

#### 3.5.2 运行测试

```bash
npm test              # 运行全部测试
npm run test:watch    # 监视模式
npm run coverage      # 生成覆盖率报告
```

---

### 3.6 里程碑 6：构建与部署

#### 3.6.1 Vite 构建配置

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### 3.6.2 Vercel 部署

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

```bash
# 全局安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

#### 3.6.3 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🧠 第四章：核心概念讲解

### 4.1 组件（Component）

组件是 React 应用的基本单元，它将 UI 拆分为独立、可复用的片段。在 Todo Master 中：

- **函数组件**：本质上是一个接收 `props`、返回 JSX 的函数
- **Props 单向数据流**：数据从父组件流向子组件，子组件通过回调函数通知父组件
- **组件拆分原则**：单一职责、高内聚低耦合

```tsx
// 父组件传递回调
<TodoForm onAdd={addTodo} />

// 子组件调用回调
function TodoForm({ onAdd }: TodoFormProps) {
  const handleSubmit = () => {
    onAdd(text); // 通知父组件
  };
}
```

### 4.2 状态（State）

状态是驱动 UI 变化的数据。React 提供了多种状态管理方案：

| 方案 | 适用场景 | 示例 |
|------|----------|------|
| `useState` | 简单局部状态 | 输入框的值 |
| `useReducer` | 复杂状态逻辑 | Todo 的增删改查 + 筛选 |
| Context API | 跨组件共享 | 全局主题、用户信息 |
| 外部库 | 超大规模应用 | Redux、Zustand |

**不可变更新**是 React 状态管理的核心原则：

```typescript
// ❌ 错误：直接修改原数组
todos.push(newTodo);

// ✅ 正确：创建新数组
setTodos((prev) => [...prev, newTodo]);
```

### 4.3 事件处理

React 使用合成事件系统，事件处理器以驼峰命名：

```tsx
// 原生 JS
button.addEventListener('click', handleClick);

// React
<button onClick={handleClick}>点击</button>
```

**事件委托**在原生 JS 中非常高效：

```javascript
// 一个监听器处理所有子元素的点击
list.addEventListener('click', (event) => {
  if (event.target.matches('.delete-btn')) {
    // 处理删除
  }
  if (event.target.matches('.toggle')) {
    // 处理切换
  }
});
```

---

## 🐛 第五章：常见错误与调试技巧

### 5.1 常见错误

#### 错误 1：直接修改状态

```tsx
// ❌ 错误
const toggleTodo = (id: number) => {
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed; // 直接修改！
  setTodos(todos); // React 检测不到变化
};

// ✅ 正确
const toggleTodo = (id: number) => {
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  ));
};
```

#### 错误 2：useState 初始化函数遗漏

```tsx
// ❌ 错误：每次渲染都读取 localStorage
const [todos, setTodos] = useState<Todo[]>(loadTodos());

// ✅ 正确：只在初始化时执行
const [todos, setTodos] = useState<Todo[]>(loadTodos);
```

#### 错误 3：Context 循环渲染

```tsx
// ❌ 错误：每次渲染都创建新对象
return <TodoContext.Provider value={{ state, dispatch }}>{children}</TodoContext.Provider>;

// ✅ 正确：使用 useMemo 缓存
const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
```

### 5.2 调试技巧

1. **React DevTools**：安装浏览器扩展，查看组件树、Props 和 State
2. **console.log 策略**：在关键位置打印状态变化
3. **断点调试**：在 Chrome DevTools Sources 面板设置断点
4. **类型检查**：运行 `tsc --noEmit` 提前发现类型错误

---

## 🎓 第六章：扩展挑战

### 6.1 挑战 1：添加编辑功能

需求：双击 Todo 文本时进入编辑模式，按回车保存，按 Esc 取消。

思路：
1. 在 `TodoItem` 组件中增加 `isEditing` 本地状态
2. 双击时切换到输入框，blur 或回车时提交
3. 新增 `EDIT_TODO` Action 类型

```tsx
// 新增 Action 类型
| { type: 'EDIT_TODO'; payload: { id: number; text: string } }

// Reducer 中处理
 case 'EDIT_TODO': {
   return {
     ...state,
     todos: state.todos.map((todo) =>
       todo.id === action.payload.id ? { ...todo, text: action.payload.text } : todo
     ),
   };
 }
```

### 6.2 挑战 2：本地存储持久化

> 注：里程碑 3-6 已实现基础版本，此挑战要求你**手动实现自定义 Hook**。

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### 6.3 挑战 3：拖拽排序

使用 `@dnd-kit/core` 和 `@dnd-kit/sortable` 实现 Todo 项的拖拽排序：

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### 6.4 挑战 4：暗黑模式

参考 `desktop-tauri-react` 项目的实现，使用 CSS 变量 + Tailwind `dark` 变体：

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
}

.dark {
  --bg: #0a0a0a;
  --text: #e5e5e5;
}
```

---

## 📚 相关资源

完成本项目后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本项目的关联 |
|------|------|---------------|
| 语言核心 | `jsts-code-lab/00-language-core/` | ES2025+ 语法、闭包、原型链、事件循环 |
| 设计模式 | `jsts-code-lab/02-design-patterns/` | 观察者模式、策略模式、工厂模式在 UI 中的应用 |
| 前端框架 | `jsts-code-lab/18-frontend-frameworks/` | React/Vue 组件化、Hooks 原理、状态管理 |
| 测试基础 | `jsts-code-lab/07-testing/` | 单元测试、TDD、Testing Library 最佳实践 |
| 类型系统 | `jsts-code-lab/10-js-ts-comparison/` | TypeScript 类型推断、泛型、类型体操 |

> 📚 [返回知识库首页](../README.md)

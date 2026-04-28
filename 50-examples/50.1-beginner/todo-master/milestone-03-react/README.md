# 里程碑 3：React 组件化

> 🎯 **学习目标**：用 React 18 重构 Todo 应用，体验声明式 UI 与组件化思维。

---

## 学习目标

完成本里程碑后，你将能够：

1. 使用 Vite 创建 React + TypeScript 项目
2. 编写函数组件，通过 Props 传递数据
3. 使用 `useState` Hook 管理组件本地状态
4. 理解 JSX 语法及其编译原理
5. 将 UI 拆分为独立、可复用的组件

---

## 前置知识

- 里程碑 2 的全部内容（TypeScript 基础、DOM 类型）
- 了解「组件」的基本概念（乐高积木式拼装）

---

## 关键概念解释

### 1. 声明式 UI（Declarative UI）

原生 JS 是「命令式」的：你一步步告诉浏览器怎么做。

```js
// 命令式：手动操作 DOM
const li = document.createElement('li');
li.textContent = todo.text;
list.appendChild(li);
```

React 是「声明式」的：你描述 UI 应该长什么样，React 负责更新 DOM。

```tsx
// 声明式：描述 UI
<TodoItem text={todo.text} completed={todo.completed} />
```

### 2. Props（属性）

组件的输入，类似函数的参数。Props 是只读的，不能修改：

```tsx
interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle: () => void;
}

function TodoItem({ text, completed, onToggle }: TodoItemProps) {
  return (
    <li className={completed ? 'completed' : ''}>
      <input type="checkbox" checked={completed} onChange={onToggle} />
      <span>{text}</span>
    </li>
  );
}
```

### 3. useState Hook

React 16.8 引入的「钩子」，让函数组件拥有状态：

```tsx
const [todos, setTodos] = useState<Todo[]>(loadTodos());
```

- `todos`：当前状态值
- `setTodos`：更新状态的函数（调用后 React 自动重新渲染）
- **重要**：不要直接修改 `todos`，始终使用 `setTodos` 传入新值

---

## 文件结构

```
milestone-03-react/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts         # Vite 配置
├── index.html
└── src/
    ├── main.tsx           # React 应用入口
    ├── App.tsx            # 根组件：状态管理 + 整体布局
    ├── types.ts           # 共享类型定义
    ├── components/
    │   ├── TodoForm.tsx   # 输入表单组件
    │   ├── TodoList.tsx   # 列表容器组件
    │   └── TodoItem.tsx   # 单个 Todo 项组件
    └── style.css
```

---

## 运行方式

```bash
cd milestone-03-react
npm install
npm run dev        # 启动 Vite 开发服务器
npm run build      # 生产构建
```

---

## 关键代码讲解

### `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// React 18 的 createRoot API
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `src/App.tsx`

这是「容器组件」，负责管理状态和协调子组件：

```tsx
function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos());

  const addTodo = (text: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  };

  return (
    <div className="container">
      <h1>📝 Todo Master</h1>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} />
    </div>
  );
}
```

**注意**：`setTodos(prev => [...])` 使用函数式更新，避免闭包陷阱。

---

## 常见错误排查

### ❌ 错误：修改 state 后 UI 不更新

**原因**：直接修改了 state 对象，React 检测不到变化。

```tsx
// ❌ 错误：直接 push
todos.push(newTodo);
setTodos(todos); // React 认为引用没变，不重新渲染

// ✅ 正确：创建新数组
setTodos([...todos, newTodo]);
```

### ❌ 错误：`Cannot read properties of undefined (reading 'map')`

**原因**：初始状态可能是 `undefined`。

**解决**：给 `useState` 提供正确的初始值：

```tsx
const [todos, setTodos] = useState<Todo[]>([]); // 默认空数组
```

### ❌ 错误：Hook 调用顺序变化

**原因**：在条件语句中使用了 Hook。

```tsx
// ❌ 错误
if (condition) {
  const [state, setState] = useState(0);
}

// ✅ 正确：Hook 必须在组件顶层调用
const [state, setState] = useState(0);
if (condition) { ... }
```

### ❌ 错误：`React is not defined`

**原因**：Vite + React 17+ 使用新的 JSX 转换，不需要在每个文件顶部 `import React`。

**解决**：确保 `tsconfig.json` 中 `"jsx": "react-jsx"`，然后直接写 JSX：

```tsx
// 不需要 import React
export default function App() { ... }
```

---

## 下一步

组件化后，状态被提升到了 `App` 组件。如果应用继续扩展，会出现「Prop Drilling」问题：

```tsx
// 层层传递 props，中间组件其实不需要这些数据
<App>
  <Layout>
    <Sidebar>
      <TodoList todos={todos} ... />
    </Sidebar>
  </Layout>
</App>
```

如何优雅地在任意组件间共享状态？→ [进入里程碑 4](../milestone-04-state-mgmt/)

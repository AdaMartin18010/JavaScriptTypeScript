# 里程碑 4：状态管理（useReducer + Context）

> 🎯 **学习目标**：使用 `useReducer` + `Context API` 实现全局状态管理，解决 Prop Drilling 问题。

---

## 学习目标

完成本里程碑后，你将能够：

1. 使用 `useReducer` 管理复杂状态逻辑
2. 使用 `createContext` + `useContext` 跨组件传递状态
3. 设计合理的状态结构（单一数据源、不可变更新）
4. 实现中间件思想（localStorage 持久化层）
5. 添加筛选功能（全部 / 进行中 / 已完成）

---

## 前置知识

- 里程碑 3 的全部内容（React 组件、useState、Props）
- 了解 Redux 的基本概念（Action、Reducer、Store）

---

## 关键概念解释

### 1. useReducer vs useState

`useState` 适合简单状态，`useReducer` 适合复杂状态逻辑：

```tsx
// useState：简单计数
const [count, setCount] = useState(0);

// useReducer：复杂 Todo 状态
const [state, dispatch] = useReducer(todoReducer, initialState);
dispatch({ type: 'ADD_TODO', payload: { text: '学习 TS' } });
```

**什么时候用 useReducer？**
- 状态逻辑复杂，涉及多个子字段
- 下一个状态依赖于前一个状态
- 需要集中管理所有状态变更

### 2. Context API

React 内置的「依赖注入」机制，避免层层传递 Props：

```tsx
// 1. 创建 Context
const TodoContext = createContext(null);

// 2. 在顶层提供数据
<TodoContext.Provider value={{ state, dispatch }}>
  <App />
</TodoContext.Provider>

// 3. 在任意子组件消费数据
const { state, dispatch } = useContext(TodoContext);
```

### 3. 中间件思想

在 dispatch 前后插入额外逻辑（如日志、持久化）：

```tsx
function usePersistentReducer(reducer, initialState) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
  }, [state.todos]);
  
  return [state, dispatch];
}
```

---

## 文件结构

```
milestone-04-state-mgmt/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── reducer.ts           # 新增：Reducer 纯函数
    ├── context.tsx          # 新增：Context + Provider
    ├── components/
    │   ├── TodoForm.tsx
    │   ├── TodoList.tsx
    │   ├── TodoItem.tsx
    │   └── FilterBar.tsx    # 新增：筛选栏组件
    └── style.css
```

---

## 运行方式

```bash
cd milestone-04-state-mgmt
npm install
npm run dev
npm run build
```

---

## 关键代码讲解

### `src/reducer.ts`

Reducer 是纯函数：`(state, action) => newState`

```ts
export interface State {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

export type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; payload: State['filter'] };

export function todoReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.payload, completed: false }],
      };
    // ...
  }
}
```

**为什么用联合类型（Union Type）？**
- 精确描述每种 Action 的结构
- TypeScript 会自动收窄类型，访问 `action.payload` 时知道具体类型

### `src/context.tsx`

自定义 Hook 封装 Context 消费，提供友好的错误提示：

```tsx
export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo 必须在 TodoProvider 内部使用');
  }
  return context;
}
```

---

## 常见错误排查

### ❌ 错误：`useTodo must be used within TodoProvider`

**原因**：在 Provider 外部调用了自定义 Hook。

**解决**：确保组件被包裹在 `<TodoProvider>` 内。

### ❌ 错误：修改 state 后筛选结果不对

**原因**：在 Reducer 外直接修改了 `state.todos`。

**解决**：始终返回新对象，不要 mutate：

```ts
// ❌ 错误
state.todos.push(newTodo);
return state;

// ✅ 正确
return { ...state, todos: [...state.todos, newTodo] };
```

### ❌ 错误：Context 导致不必要的重渲染

**原因**：Provider 的 value 对象每次渲染都是新引用。

**解决**：使用 `useMemo` 缓存 value：

```tsx
const value = useMemo(() => ({ state, dispatch }), [state]);
return <Context.Provider value={value}>{children}</Context.Provider>;
```

---

## 下一步

现在应用有了全局状态管理和筛选功能，但如何保证代码质量？如何防止回归错误？

→ [进入里程碑 5：测试驱动](../milestone-05-testing/)

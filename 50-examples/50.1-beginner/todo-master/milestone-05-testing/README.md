# 里程碑 5：测试驱动（Vitest + Testing Library）

> 🎯 **学习目标**：为 Todo 应用编写单元测试和组件测试，建立质量信心。

---

## 学习目标

完成本里程碑后，你将能够：

1. 配置 Vitest 测试框架
2. 使用 React Testing Library 测试组件渲染和交互
3. 设计测试用例（AAA 模式：Arrange-Act-Assert）
4. Mock 外部依赖（localStorage）
5. 运行测试覆盖率报告

---

## 前置知识

- 里程碑 4 的全部内容（useReducer、Context API）
- 了解「单元测试」的基本概念（输入 → 处理 → 验证）

---

## 关键概念解释

### 1. AAA 模式

测试用例的标准结构：

```ts
// Arrange（准备）
const initialState = { todos: [], filter: 'all' as const };

// Act（执行）
const newState = todoReducer(initialState, { type: 'ADD_TODO', payload: '学习测试' });

// Assert（断言）
expect(newState.todos).toHaveLength(1);
expect(newState.todos[0].text).toBe('学习测试');
```

### 2. Mock localStorage

Node.js 环境没有 `localStorage`，需要手动模拟：

```ts
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### 3. Testing Library 哲学

- **查询优先**：像用户一样查找元素（按角色、文本、标签）
- **避免测试实现细节**：不测内部 state，只测用户看到的行为
- `userEvent` 比 `fireEvent` 更接近真实用户操作

---

## 文件结构

```
milestone-05-testing/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── reducer.ts
    ├── context.tsx
    ├── components/
    │   ├── TodoForm.tsx
    │   ├── TodoList.tsx
    │   ├── TodoItem.tsx
    │   └── FilterBar.tsx
    ├── __tests__/
    │   ├── todoReducer.test.ts      # Reducer 单元测试
    │   ├── TodoList.test.tsx        # 组件渲染测试
    │   └── TodoItem.test.tsx        # 交互测试
    └── style.css
```

---

## 运行方式

```bash
cd milestone-05-testing
npm install
npm run dev        # 启动开发服务器
npm test           # 运行测试（watch 模式）
npm test -- --run  # 运行一次（CI 场景）
npm run coverage   # 生成覆盖率报告
```

---

## 关键代码讲解

### `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
```

- `globals: true`：允许直接使用 `describe`、`it`、`expect`
- `environment: 'jsdom'`：模拟浏览器 DOM 环境

### `src/__tests__/setup.ts`

```ts
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个测试后清理 DOM
afterEach(() => {
  cleanup();
});
```

### `src/__tests__/todoReducer.test.ts`

```ts
describe('todoReducer', () => {
  it('应该添加新的 Todo', () => {
    const state = todoReducer(initialState, addTodo('学习测试'));
    expect(state.todos).toHaveLength(1);
    expect(state.todos[0].text).toBe('学习测试');
  });
});
```

---

## 常见错误排查

### ❌ 错误：`document is not defined`

**原因**：测试环境不是 jsdom。

**解决**：在 `vite.config.ts` 中设置 `environment: 'jsdom'`。

### ❌ 错误：`Unable to find role="checkbox"`

**原因**：元素还没渲染完就查询。

**解决**：使用 `findByRole`（异步）或 `waitFor`：

```ts
const checkbox = await screen.findByRole('checkbox');
```

### ❌ 错误：`act()` warnings

**原因**：状态更新后没有包裹在 `act` 中。

**解决**：`userEvent` 和 `fireEvent` 已经自动包裹 `act`，确保使用 `@testing-library/user-event`。

---

## 下一步

测试保障了代码质量，现在需要让应用上线！→ [进入里程碑 6](../milestone-06-deploy/)

# 里程碑 2：TypeScript 迁移

> 🎯 **学习目标**：在里程碑 1 的基础上，全面引入 TypeScript 类型系统，体验「类型即文档」的开发方式。

---

## 学习目标

完成本里程碑后，你将能够：

1. 定义接口（`interface`）描述数据结构
2. 为函数添加参数类型和返回值类型
3. 理解类型推断与类型断言的使用场景
4. 配置 `tsconfig.json` 开启严格模式
5. 使用 TypeScript 编译器（`tsc`）检查代码中的类型错误

---

## 前置知识

- 里程碑 1 的全部内容（ES6+ 语法、DOM API、localStorage）
- 了解「类型」的基本概念（字符串、数字、布尔值等）

---

## 关键概念解释

### 1. 接口（Interface）

接口是 TypeScript 的核心特性，用于描述对象的「形状」：

```ts
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
```

一旦定义，TypeScript 会在编译时检查所有 `Todo` 对象是否包含这三个字段，且类型正确。

### 2. 类型推断（Type Inference）

TypeScript 能自动推断许多类型，不需要处处写注解：

```ts
// ❌ 多余：TS 知道 numbers 是 number[]
const numbers: number[] = [1, 2, 3];

// ✅ 简洁：让 TS 自己推断
const numbers = [1, 2, 3];

// ✅ 必要：函数参数必须写类型
function addTodo(text: string): Todo { ... }
```

### 3. strict: true

`tsconfig.json` 中开启 `strict: true` 会同时启用：

- `noImplicitAny`：禁止隐式 `any`
- `strictNullChecks`：严格检查 `null` / `undefined`
- `strictFunctionTypes`：函数参数严格逆变检查

> 初学者可能觉得 `strict` 很烦，但它是避免运行时错误的最佳投资。

---

## 文件结构

```
milestone-02-typescript/
├── README.md
├── package.json
├── tsconfig.json          # 新增：TypeScript 严格配置
├── index.html
└── src/
    ├── app.ts             # 从 app.js 迁移
    ├── storage.ts         # 从 storage.js 迁移，添加 Todo 接口
    ├── dom-utils.ts       # 从 dom-utils.js 迁移，添加 DOM 类型
    └── style.css          # 与里程碑 1 相同
```

---

## 运行方式

```bash
cd milestone-02-typescript
npm install
npm run dev        # Vite 开发服务器，支持热更新
npm run build      # TypeScript 编译 + 打包
npm run typecheck  # 仅运行类型检查（不打包）
```

---

## 关键代码讲解

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

- `"target": "ES2020"`：编译为现代 JS，支持可选链等语法
- `"strict": true`：开启所有严格类型检查
- `"moduleResolution": "bundler"`：配合 Vite 等现代打包工具

### `src/storage.ts`

```ts
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function loadTodos(): Todo[] { ... }
export function saveTodos(todos: Todo[]): void { ... }
```

**变化点**：
- 新增 `Todo` 接口，描述数据结构
- 函数添加返回类型 `Todo[]` 和 `void`
- 参数添加类型 `todos: Todo[]`

### `src/dom-utils.ts`

```ts
export function createTodoElement(todo: Todo): HTMLLIElement { ... }
export function renderTodoList(todos: Todo[], listEl: HTMLUListElement): void { ... }
```

**变化点**：
- DOM 元素使用精确类型：`HTMLLIElement`、`HTMLUListElement`
- 无需手动查文档，IDE 会自动提示可用的属性和方法

---

## 常见错误排查

### ❌ 错误：`Parameter 'todos' implicitly has an 'any' type`

**原因**：没有开启 `strict` 或忘记给参数写类型。

**解决**：函数参数必须显式声明类型：

```ts
// ❌ 错误
function saveTodos(todos) { ... }

// ✅ 正确
function saveTodos(todos: Todo[]) { ... }
```

### ❌ 错误：`Object is possibly 'null'`

**原因**：`strictNullChecks` 开启后，DOM 查询可能返回 `null`。

**解决**：使用非空断言（确定存在时）或做空值检查：

```ts
// 方式 1：非空断言（确定元素一定存在）
const input = document.getElementById('todo-input') as HTMLInputElement;

// 方式 2：空值检查（更安全的做法）
const input = document.getElementById('todo-input');
if (!input) throw new Error('找不到输入框');
```

### ❌ 错误：`Property 'value' does not exist on type 'HTMLElement'`

**原因**：`getElementById` 返回通用 `HTMLElement`，而 `value` 是 `HTMLInputElement` 特有的。

**解决**：使用类型断言：

```ts
const input = document.getElementById('todo-input') as HTMLInputElement;
console.log(input.value); // 现在不报错
```

### ❌ 错误：`Cannot find module './storage.js'`

**原因**：TypeScript 项目中导入时用了 `.js` 扩展名。

**解决**：TS 文件导入时写 `.ts` 或省略扩展名（Vite 支持）：

```ts
// ✅ 正确
import { loadTodos } from './storage';
import { loadTodos } from './storage.ts';
```

---

## 下一步

类型安全后，代码更可靠了，但 DOM 操作仍然繁琐。每当状态变化，都需要手动操作 DOM：

```js
// 每次都要手动更新 DOM
todos = [...todos, newTodo];
renderTodoList(todos, list);
updateStats(todos, countEl, clearBtn);
```

有没有一种方式，**状态变了，UI 自动更新**？这就是 React 的声明式 UI 理念 → [进入里程碑 3](../milestone-03-react/)

# Zustand 状态管理示例

一个完整的 Zustand 状态管理示例，展示 TypeScript 类型安全、Middleware、切片模式和异步操作。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check
```

## 📁 项目结构

```
src/
├── store/
│   ├── counterStore.ts    # 计数器状态 + DevTools
│   ├── todoStore.ts       # Todo列表 + Persist Middleware
│   ├── userStore.ts       # 用户认证 + 异步操作
│   ├── boundStore.ts      # 切片模式 (Slices Pattern)
│   └── index.ts           # 统一导出
├── components/
│   ├── Counter.tsx        # 计数器组件
│   ├── TodoList.tsx       # Todo列表组件
│   ├── UserProfile.tsx    # 用户认证组件
│   └── SlicesDemo.tsx     # 切片模式演示
├── App.tsx                # 应用入口
└── main.tsx               # 渲染入口
```

## 📚 示例内容

### 1. Counter Store - 计数器示例

展示基础状态管理和 DevTools 集成：

```typescript
import { useCounterStore } from './store'

// 使用选择器优化重渲染
const count = useCounterStore(state => state.count)

// 获取计算属性
const doubleCount = useCounterStore(state => state.doubleCount())
```

**特性：**
- ✅ TypeScript 类型安全
- ✅ Redux DevTools 集成 (`devtools` middleware)
- ✅ 计算属性 (getter 函数)
- ✅ 选择器优化重渲染

### 2. Todo Store - 待办列表示例

展示 Persist Middleware 和复杂状态管理：

```typescript
import { useTodoStore } from './store'

const { todos, addTodo, toggleTodoStatus } = useTodoStore()
```

**特性：**
- ✅ Persist Middleware - 自动持久化到 localStorage
- ✅ 过滤和搜索功能
- ✅ 异步操作 - 模拟 API 数据获取
- ✅ 状态计算 - 实时统计信息

### 3. User Store - 用户认证示例

展示异步操作和状态机模式：

```typescript
import { useUserStore } from './store'

const { login, logout, user, status } = useUserStore()

// 登录
await login('admin@example.com', 'admin123')
```

**特性：**
- ✅ 异步操作 - 登录/注册模拟 API
- ✅ 状态机模式 - `idle | loading | authenticated | error`
- ✅ 派生状态 - `isAdmin()`, `hasPermission()`
- ✅ 会话持久化

**测试账号：**
- 管理员: `admin@example.com` / `admin123`
- 普通用户: `user@example.com` / `user123`

### 4. Bound Store - 切片模式示例

展示如何将大型状态拆分为可复用的切片：

```typescript
import { useCounter, useUser, useTheme, useLogs } from './store'

// 使用便捷的切片 hooks
const { count, increment } = useCounter()
const { theme, toggleTheme } = useTheme()
```

**特性：**
- ✅ 模块化状态管理
- ✅ 切片间通信
- ✅ 统一持久化配置

## 🔧 Middleware 使用

### DevTools Middleware

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create(devtools((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}), { name: 'MyStore' }))
```

### Persist Middleware

```typescript
import { persist } from 'zustand/middleware'

const useStore = create(persist(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
  }),
  { name: 'user-storage' }
))
```

## 📝 TypeScript 最佳实践

### 1. 完整的类型定义

```typescript
interface MyState {
  // 状态
  value: number
  
  // 派生状态
  doubleValue: () => number
  
  // 同步操作
  increment: () => void
  
  // 异步操作
  fetchData: () => Promise<void>
}
```

### 2. 选择器优化

```typescript
// ✅ 好的做法 - 使用选择器
const count = useStore(state => state.count)

// ✅ 更好的做法 - 提取选择器函数
const selectCount = (state: MyState) => state.count
const count = useStore(selectCount)

// ✅ 获取多个状态时使用 useShallow
const { increment, decrement } = useStore(
  useShallow(state => ({
    increment: state.increment,
    decrement: state.decrement,
  }))
)
```

### 3. 切片模式

```typescript
// counterSlice.ts
const createCounterSlice = (set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
})

// 组合切片
const useBoundStore = create((...args) => ({
  ...createCounterSlice(...args),
  ...createUserSlice(...args),
}))
```

## 🐛 调试

本项目集成了 Redux DevTools，你可以：

1. 安装 [Redux DevTools](https://github.com/reduxjs/redux-devtools) 浏览器扩展
2. 打开 DevTools -> Redux 标签
3. 查看状态变化、时间旅行调试、导出/导入状态

## 📖 学习资源

- [Zustand 官方文档](https://docs.pmnd.rs/zustand)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand TypeScript 指南](https://docs.pmnd.rs/zustand/guides/typescript)

## 🎯 关键概念总结

| 概念 | 说明 | 示例位置 |
|------|------|----------|
| 基础状态 | create() 创建 store | counterStore.ts |
| Middleware | devtools, persist | todoStore.ts, userStore.ts |
| 异步操作 | async/await | userStore.ts |
| 切片模式 | 模块化状态管理 | boundStore.ts |
| 类型安全 | TypeScript 完整类型 | 所有 store 文件 |
| 计算属性 | getter 函数 | counterStore.ts |
| 选择器 | 优化重渲染 | 所有组件文件 |

## 📄 License

MIT

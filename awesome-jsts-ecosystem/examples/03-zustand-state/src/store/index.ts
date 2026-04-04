/**
 * Store 统一导出
 * 
 * 使用方式:
 * ```tsx
 * import { useCounterStore, useTodoStore, useUserStore } from '@/store'
 * ```
 */

// Counter Store
export { useCounterStore, selectCount, selectStep, selectHistory } from './counterStore'

// Todo Store
export { 
  useTodoStore, 
  selectTodos, 
  selectFilter, 
  selectIsLoading, 
  selectAllTags,
  type Todo, 
  type TodoStatus, 
  type TodoFilter 
} from './todoStore'

// User Store
export { 
  useUserStore, 
  selectUser, 
  selectUserStatus, 
  selectUserError,
  type User 
} from './userStore'

// Bound Store (切片模式)
export { 
  useBoundStore, 
  useCounter, 
  useUser, 
  useTheme, 
  useLogs 
} from './boundStore'

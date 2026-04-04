/**
 * Todo Store - Todo 列表状态
 * 
 * 演示内容:
 * - TypeScript 严格类型
 * - Persist Middleware（本地存储持久化）
 * - 数组状态管理
 * - 过滤和搜索
 */
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ==================== 类型定义 ====================

export type TodoStatus = 'pending' | 'in-progress' | 'completed'
export type TodoFilter = 'all' | TodoStatus

export interface Todo {
  id: string
  title: string
  description: string
  status: TodoStatus
  priority: 1 | 2 | 3 | 4 | 5  // 1-5 优先级
  createdAt: number
  completedAt: number | null
  tags: string[]
}

interface TodoState {
  // 状态
  todos: Todo[]
  filter: TodoFilter
  searchQuery: string
  selectedTag: string | null
  isLoading: boolean
  error: string | null
  
  // 计算属性
  filteredTodos: () => Todo[]
  stats: () => {
    total: number
    pending: number
    inProgress: number
    completed: number
    completionRate: number
  }
  
  // CRUD 操作
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodoStatus: (id: string) => void
  
  // 过滤和搜索
  setFilter: (filter: TodoFilter) => void
  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  
  // 批量操作
  completeAll: () => void
  clearCompleted: () => void
  
  // 异步模拟
  fetchTodos: () => Promise<void>
  
  // 工具
  reorderTodos: (startIndex: number, endIndex: number) => void
}

// ==================== 工具函数 ====================

const generateId = () => Math.random().toString(36).substring(2, 9)

// ==================== Store 创建 ====================

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        todos: [],
        filter: 'all',
        searchQuery: '',
        selectedTag: null,
        isLoading: false,
        error: null,
        
        // 计算属性 - 过滤后的待办
        filteredTodos: () => {
          const { todos, filter, searchQuery, selectedTag } = get()
          
          return todos.filter((todo) => {
            // 状态过滤
            if (filter !== 'all' && todo.status !== filter) return false
            
            // 标签过滤
            if (selectedTag && !todo.tags.includes(selectedTag)) return false
            
            // 搜索过滤
            if (searchQuery) {
              const query = searchQuery.toLowerCase()
              const matchesTitle = todo.title.toLowerCase().includes(query)
              const matchesDesc = todo.description.toLowerCase().includes(query)
              if (!matchesTitle && !matchesDesc) return false
            }
            
            return true
          })
        },
        
        // 计算属性 - 统计信息
        stats: () => {
          const { todos } = get()
          const total = todos.length
          const pending = todos.filter(t => t.status === 'pending').length
          const inProgress = todos.filter(t => t.status === 'in-progress').length
          const completed = todos.filter(t => t.status === 'completed').length
          
          return {
            total,
            pending,
            inProgress,
            completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          }
        },
        
        // CRUD 操作
        addTodo: (todoData) => {
          const newTodo: Todo = {
            ...todoData,
            id: generateId(),
            createdAt: Date.now(),
            completedAt: null,
          }
          
          set(
            (state) => ({ todos: [newTodo, ...state.todos] }),
            false,
            'todo/addTodo'
          )
        },
        
        updateTodo: (id, updates) => {
          set(
            (state) => ({
              todos: state.todos.map((todo) =>
                todo.id === id
                  ? {
                      ...todo,
                      ...updates,
                      completedAt: updates.status === 'completed' && todo.status !== 'completed'
                        ? Date.now()
                        : updates.status === 'pending'
                        ? null
                        : todo.completedAt,
                    }
                  : todo
              ),
            }),
            false,
            'todo/updateTodo'
          )
        },
        
        deleteTodo: (id) => {
          set(
            (state) => ({
              todos: state.todos.filter((todo) => todo.id !== id),
            }),
            false,
            'todo/deleteTodo'
          )
        },
        
        toggleTodoStatus: (id) => {
          const { todos } = get()
          const todo = todos.find((t) => t.id === id)
          if (!todo) return
          
          const newStatus: TodoStatus =
            todo.status === 'completed' ? 'pending' : 'completed'
          
          get().updateTodo(id, { status: newStatus })
        },
        
        // 过滤和搜索
        setFilter: (filter) => {
          set({ filter }, false, 'todo/setFilter')
        },
        
        setSearchQuery: (searchQuery) => {
          set({ searchQuery }, false, 'todo/setSearchQuery')
        },
        
        setSelectedTag: (selectedTag) => {
          set({ selectedTag }, false, 'todo/setSelectedTag')
        },
        
        // 批量操作
        completeAll: () => {
          set(
            (state) => ({
              todos: state.todos.map((todo) =>
                todo.status !== 'completed'
                  ? { ...todo, status: 'completed' as TodoStatus, completedAt: Date.now() }
                  : todo
              ),
            }),
            false,
            'todo/completeAll'
          )
        },
        
        clearCompleted: () => {
          set(
            (state) => ({
              todos: state.todos.filter((todo) => todo.status !== 'completed'),
            }),
            false,
            'todo/clearCompleted'
          )
        },
        
        // 异步操作 - 模拟从 API 获取数据
        fetchTodos: async () => {
          set({ isLoading: true, error: null }, false, 'todo/fetchTodos/start')
          
          try {
            // 模拟 API 延迟
            await new Promise((resolve) => setTimeout(resolve, 1000))
            
            // 模拟数据
            const mockTodos: Todo[] = [
              {
                id: generateId(),
                title: '学习 Zustand',
                description: '阅读文档并完成示例项目',
                status: 'in-progress',
                priority: 5,
                createdAt: Date.now() - 86400000,
                completedAt: null,
                tags: ['学习', 'React'],
              },
              {
                id: generateId(),
                title: '重构项目代码',
                description: '将 Redux 迁移到 Zustand',
                status: 'pending',
                priority: 4,
                createdAt: Date.now() - 172800000,
                completedAt: null,
                tags: ['重构', '工作'],
              },
              {
                id: generateId(),
                title: '写技术博客',
                description: '分享 Zustand 使用心得',
                status: 'completed',
                priority: 3,
                createdAt: Date.now() - 259200000,
                completedAt: Date.now() - 100000,
                tags: ['写作', '分享'],
              },
            ]
            
            set(
              { todos: mockTodos, isLoading: false },
              false,
              'todo/fetchTodos/success'
            )
          } catch (error) {
            set(
              { error: '获取待办事项失败', isLoading: false },
              false,
              'todo/fetchTodos/error'
            )
          }
        },
        
        // 工具 - 重新排序
        reorderTodos: (startIndex, endIndex) => {
          set(
            (state) => {
              const result = [...state.todos]
              const [removed] = result.splice(startIndex, 1)
              result.splice(endIndex, 0, removed)
              return { todos: result }
            },
            false,
            'todo/reorderTodos'
          )
        },
      }),
      {
        name: 'todo-storage',
        partialize: (state) => ({ 
          todos: state.todos,
          // 不持久化 UI 状态
        }),
      }
    ),
    {
      name: 'TodoStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// ==================== 选择器 ====================

export const selectTodos = (state: TodoState) => state.todos
export const selectFilter = (state: TodoState) => state.filter
export const selectIsLoading = (state: TodoState) => state.isLoading
export const selectAllTags = (state: TodoState) => {
  const tags = new Set<string>()
  state.todos.forEach((todo) => todo.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags)
}
